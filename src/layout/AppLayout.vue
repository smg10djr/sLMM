<script setup>
import { onMounted, onUnmounted, ref, computed, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import UserDropdown from '@/components/common/UserDropdown.vue';
import DarkModeToggle from '@/components/common/DarkModeToggle.vue';
import TabBar from '@/components/common/TabBar.vue';
import Tooltip from '@/components/common/Tooltip.vue';
import { useMenu } from '@/composables/useMenu';
import { useGlobalTabs } from '@/composables/useTabs';
import { useLayoutStore } from '@/stores/useLayoutStore';

// 라우터 사용
const router = useRouter();
const route = useRoute();

// 레이아웃 스토어 사용
const layoutStore = useLayoutStore();

// 로딩 상태 관리
const isRouteLoading = ref(false);
const pageLoadingTimeout = ref(null);

// 메뉴 관리
const { 
    menuItems, 
    isMenuActive, 
    handleMenuClick,
    handleChildMenuClick,
    toggleMenuExpanded, 
    isMenuExpanded,
    autoExpandActiveMenu,
    breadcrumbs
} = useMenu();

// 탭 관리
const { 
    createTab, 
    initializeTabs, 
    cleanupTabs 
} = useGlobalTabs();

const toggleSidebar = () => {
    layoutStore.toggleSidebar();
};

// 페이지 액션 핸들러
const handlePageAction = (action) => {
    console.log('페이지 액션 실행:', action);
    
    // 액션 타입에 따른 처리
    switch (action.type) {
        case 'navigation':
            if (action.route) {
                router.push(action.route);
            }
            break;
        case 'function':
            if (action.handler && typeof action.handler === 'function') {
                action.handler();
            }
            break;
        case 'emit':
            // 이벤트 발생 (향후 이벤트 버스 또는 Pinia로 처리)
            console.log('이벤트 발생:', action.event, action.payload);
            break;
        default:
            console.warn('알 수 없는 액션 타입:', action.type);
    }
};

// 라우트 로딩 상태 관리
const startRouteLoading = () => {
    // 빠른 네비게이션에서는 로딩 표시하지 않음
    pageLoadingTimeout.value = setTimeout(() => {
        isRouteLoading.value = true;
    }, 100);
};

const stopRouteLoading = () => {
    if (pageLoadingTimeout.value) {
        clearTimeout(pageLoadingTimeout.value);
        pageLoadingTimeout.value = null;
    }
    isRouteLoading.value = false;
};

// 메뉴 클릭 핸들러 (탭 생성 포함) - 로딩 상태 관리 추가
const handleMenuClickWithLoading = (menuItem, parentMenuItem = null) => {
    // 로딩 시작
    startRouteLoading();
    
    // 자식 메뉴가 있는 경우 토글만 수행
    if (menuItem.children) {
        toggleMenuExpanded(menuItem.id);
        return;
    }
    
    // 탭 생성과 네비게이션을 useMenu에서 처리
    if (parentMenuItem) {
        handleChildMenuClick(menuItem, parentMenuItem);
    } else {
        handleMenuClick(menuItem);
    }
};

// 페이지 전환 상태 관리
const isTransitioning = ref(false);
const transitionDirection = ref('forward');
const lastRoute = ref(null);

// 전환 애니메이션 이름 결정
const getTransitionName = (currentRoute) => {
    // 로딩 중이거나 전환 중일 때는 기본 애니메이션
    if (isRouteLoading.value || isTransitioning.value) {
        return 'page-fade';
    }
    
    // 라우트 깊이에 따른 전환 방향 결정
    const currentDepth = currentRoute.path.split('/').length;
    const lastDepth = lastRoute.value ? lastRoute.value.split('/').length : 0;
    
    // 대시보드에서 다른 페이지로 갈 때
    if (lastRoute.value === '/' && currentRoute.path !== '/') {
        transitionDirection.value = 'forward';
        return 'page-slide-left';
    }
    
    // 다른 페이지에서 대시보드로 갈 때
    if (currentRoute.path === '/' && lastRoute.value !== '/') {
        transitionDirection.value = 'backward';
        return 'page-slide-right';
    }
    
    // 같은 모듈 내 전환 (예: /inventory/overview → /inventory/products)
    const currentModule = currentRoute.path.split('/')[1];
    const lastModule = lastRoute.value ? lastRoute.value.split('/')[1] : '';
    
    if (currentModule === lastModule) {
        // 같은 모듈 내에서는 부드러운 페이드 전환
        return 'page-fade-slide';
    }
    
    // 다른 모듈 간 전환
    if (currentDepth > lastDepth) {
        transitionDirection.value = 'forward';
        return 'page-slide-left';
    } else if (currentDepth < lastDepth) {
        transitionDirection.value = 'backward';
        return 'page-slide-right';
    }
    
    // 기본 전환
    return 'page-fade';
};

// 전환 이벤트 핸들러들
const onBeforeEnter = (el) => {
    isTransitioning.value = true;
    startRouteLoading();
};

const onEnter = (el, done) => {
    // 애니메이션 완료 후 콜백
    el.addEventListener('transitionend', () => {
        done();
    }, { once: true });
    
    // 폴백: 1초 후 강제 완료
    setTimeout(done, 1000);
};

const onAfterEnter = (el) => {
    isTransitioning.value = false;
    stopRouteLoading();
    
    // 접근성: 새 페이지 포커스 관리
    const firstFocusable = el.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
        firstFocusable.focus();
    }
};

const onBeforeLeave = (el) => {
    // 스크롤 위치 저장 (향후 구현 시 활용)
    el.setAttribute('data-scroll-top', el.scrollTop);
};

const onLeave = (el, done) => {
    // 애니메이션 완료 후 콜백
    el.addEventListener('transitionend', () => {
        done();
    }, { once: true });
    
    // 폴백: 500ms 후 강제 완료
    setTimeout(done, 500);
};

const onAfterLeave = (el) => {
    // 정리 작업 (필요시)
};

// 서브메뉴 애니메이션 이벤트 핸들러
const onSubmenuEnter = (el) => {
    el.style.maxHeight = '0';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-10px)';
    
    // 다음 프레임에서 애니메이션 시작
    requestAnimationFrame(() => {
        el.style.maxHeight = '500px';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });
};

const onSubmenuLeave = (el) => {
    el.style.maxHeight = el.offsetHeight + 'px';
    
    requestAnimationFrame(() => {
        el.style.maxHeight = '0';
        el.style.opacity = '0';
        el.style.transform = 'translateY(-10px)';
    });
};

// 라우터 변경 감지
watch(() => route.path, (newPath, oldPath) => {
    if (newPath !== oldPath) {
        lastRoute.value = oldPath;
        
        // 페이지 전환 애니메이션과 함께 로딩 관리
        nextTick(() => {
            setTimeout(() => {
                if (!isTransitioning.value) {
                    stopRouteLoading();
                }
            }, 150); // 전환 애니메이션과 조화
        });
    }
}, { immediate: false });

// 컴포넌트 라이프사이클
onMounted(async () => {
    autoExpandActiveMenu();
    layoutStore.initialize();
    initializeTabs();
    
    // 대시보드 탭을 기본으로 생성
    const dashboardMenuItem = menuItems.value.find(item => item.id === 'dashboard');
    if (dashboardMenuItem) {
        createTab(dashboardMenuItem);
    }
    
    // 키보드 단축키 이벤트 리스너
    const handleKeydown = (event) => {
        // Ctrl+D: 다크모드 토글
        if (event.ctrlKey && event.key === 'd') {
            event.preventDefault();
            layoutStore.toggleDarkMode();
        }
        // Ctrl+B: 사이드바 토글
        if (event.ctrlKey && event.key === 'b') {
            event.preventDefault();
            layoutStore.toggleSidebar();
        }
    };
    
    document.addEventListener('keydown', handleKeydown);
    
    // 정리 함수를 위한 참조 저장
    window.__keydownHandler = handleKeydown;
    
    // 초기 로딩 완료
    await nextTick();
    stopRouteLoading();
});

onUnmounted(() => {
    layoutStore.cleanup();
    cleanupTabs();
    
    // 키보드 이벤트 리스너 정리
    if (window.__keydownHandler) {
        document.removeEventListener('keydown', window.__keydownHandler);
        delete window.__keydownHandler;
    }
});
</script>

<template>
    <div style="min-height: 100vh; display: flex; position: relative;">
        <!-- 모바일 오버레이 배경 -->
        <div 
            v-if="layoutStore.isMobile"
            class="sidebar-mobile-overlay"
            :class="{ 'active': !layoutStore.autoCollapsed }"
            @click="layoutStore.setSidebarCollapsed(true)"
            :style="{
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: '999',
                opacity: layoutStore.autoCollapsed ? '0' : '1',
                visibility: layoutStore.autoCollapsed ? 'hidden' : 'visible',
                transition: 'all 0.3s ease'
            }"
        ></div>
        <!-- 사이드바 (향상된 애니메이션) -->
        <div 
            class="sidebar-container"
            :class="{ 
                'sidebar-expanded': !layoutStore.autoCollapsed, 
                'sidebar-collapsed': layoutStore.autoCollapsed,
                'sidebar-mobile': layoutStore.isMobile 
            }"
            :style="{ 
                width: layoutStore.actualSidebarWidth, 
                backgroundColor: layoutStore.isDarkMode ? '#111827' : '#1f2937', 
                color: 'white',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                transform: layoutStore.isMobile && layoutStore.autoCollapsed ? 'translateX(-100%)' : 'translateX(0)',
                zIndex: layoutStore.isMobile ? '1000' : 'auto',
                boxShadow: layoutStore.isMobile && !layoutStore.autoCollapsed ? '4px 0 8px rgba(0,0,0,0.3)' : 'none'
            }"
        >
            <div style="padding: 1rem; display: flex; flex-direction: column; height: 100%;">
                <!-- 향상된 사이드바 토글 버튼 -->
                <button 
                    @click="toggleSidebar" 
                    class="sidebar-toggle-btn"
                    :class="{ 'collapsed': layoutStore.autoCollapsed }"
                    :style="{
                        background: layoutStore.isDarkMode ? '#4b5563' : '#374151',
                        border: 'none',
                        color: 'white',
                        padding: layoutStore.autoCollapsed ? '0.75rem' : '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        position: 'relative',
                        overflow: 'hidden'
                    }" 
                    :title="'사이드바 ' + (layoutStore.autoCollapsed ? '펼치기' : '접기') + ' (Ctrl+B)'"
                    @mouseover="$event.target.style.background = layoutStore.isDarkMode ? '#6b7280' : '#4b5563'"
                    @mouseleave="$event.target.style.background = layoutStore.isDarkMode ? '#4b5563' : '#374151'"
                >
                    <!-- 아이콘 애니메이션 -->
                    <span :style="{
                        fontSize: '1rem',
                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: layoutStore.autoCollapsed ? 'rotate(0deg)' : 'rotate(180deg)'
                    }">
                        ▶
                    </span>
                    <!-- 라벨 (펼쳐진 상태에서만 표시) -->
                    <span 
                        v-if="!layoutStore.autoCollapsed" 
                        :style="{
                            opacity: layoutStore.autoCollapsed ? '0' : '1',
                            transition: 'opacity 0.2s ease',
                            whiteSpace: 'nowrap'
                        }"
                    >
                        사이드바 접기
                    </span>
                </button>
                
                <!-- 물류시스템 메뉴 (향상된 애니메이션) -->
                <nav 
                    class="sidebar-nav"
                    :class="{ 'nav-collapsed': layoutStore.autoCollapsed }"
                    :style="{
                        marginTop: '1rem',
                        paddingRight: '0.5rem',
                        flex: '1',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#4b5563 transparent',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }"
                >
                    <template v-for="menuItem in menuItems" :key="menuItem.id">
                        <!-- 메인 메뉴 아이템 (향상된 애니메이션) -->
                        <div 
                            class="menu-item-wrapper"
                            :class="{ 'menu-item-collapsed': layoutStore.autoCollapsed }"
                            :style="{ 
                                marginBottom: '0.25rem', 
                                position: 'relative',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }"
                        >
                            <!-- 툴팁 래퍼 (접힌 상태에서만 활성화) -->
                            <Tooltip
                                v-if="layoutStore.autoCollapsed"
                                :text="menuItem.label + (menuItem.badgeCount ? ' (' + menuItem.badgeCount + ')' : '') + (menuItem.description ? ' - ' + menuItem.description : '')"
                                position="right"
                                :delay="500"
                                :is-dark="layoutStore.isDarkMode"
                                :disabled="!layoutStore.autoCollapsed"
                            >
                                <div 
                                    class="menu-item"
                                    :class="{ 
                                        'menu-active': isMenuActive(menuItem),
                                        'menu-collapsed': layoutStore.autoCollapsed,
                                        'has-children': menuItem.children
                                    }"
                                    @click="handleMenuClickWithLoading(menuItem)"
                                    @mouseover="$event.target.style.background = isMenuActive(menuItem) ? '#3b82f6' : '#4b5563'"
                                    @mouseleave="$event.target.style.background = isMenuActive(menuItem) ? '#3b82f6' : '#374151'"
                                    :style="{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        background: isMenuActive(menuItem) ? '#3b82f6' : '#374151',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: 'none',
                                        width: '100%',
                                        boxShadow: isMenuActive(menuItem) ? '0 4px 12px -2px rgba(59, 130, 246, 0.3)' : '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transform: 'translateZ(0)' // GPU 가속
                                    }"
                                >
                                    <!-- 아이콘만 (접힌 상태) -->
                                    <span 
                                        :style="{
                                            fontSize: '1.125rem',
                                            transition: 'all 0.2s ease',
                                            color: isMenuActive(menuItem) && menuItem.iconColor ? menuItem.iconColor : 'inherit',
                                            transform: isMenuActive(menuItem) ? 'scale(1.1)' : 'scale(1)'
                                        }"
                                    >
                                        {{ isMenuActive(menuItem) && menuItem.iconActive ? menuItem.iconActive : menuItem.icon }}
                                    </span>
                                    
                                    <!-- 배지 카운트 표시 (축소 상태) -->
                                    <span 
                                        v-if="menuItem.badgeCount"
                                        :style="{
                                            position: 'absolute',
                                            top: '-2px',
                                            right: '-2px',
                                            background: '#ef4444',
                                            color: 'white',
                                            fontSize: '0.5rem',
                                            padding: '0.0625rem 0.25rem',
                                            borderRadius: '0.5rem',
                                            fontWeight: '600',
                                            minWidth: '0.875rem',
                                            textAlign: 'center',
                                            border: '2px solid ' + (layoutStore.isDarkMode ? '#111827' : '#1f2937'),
                                            zIndex: '10'
                                        }"
                                    >
                                        {{ menuItem.badgeCount }}
                                    </span>
                                    
                                    <!-- NEW 표시 (축소 상태) -->
                                    <span 
                                        v-if="menuItem.isNew"
                                        :style="{
                                            position: 'absolute',
                                            top: '-4px',
                                            right: '-4px',
                                            background: '#10b981',
                                            color: 'white',
                                            fontSize: '0.375rem',
                                            padding: '0.0625rem',
                                            borderRadius: '50%',
                                            fontWeight: '600',
                                            width: '0.75rem',
                                            height: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid ' + (layoutStore.isDarkMode ? '#111827' : '#1f2937'),
                                            zIndex: '10'
                                        }"
                                    >
                                        !
                                    </span>
                                    
                                    <!-- 축소 상태 서브메뉴 표시기 -->
                                    <span 
                                        v-if="menuItem.children"
                                        style="
                                            position: absolute;
                                            bottom: 2px;
                                            right: 2px;
                                            font-size: 0.5rem;
                                            color: #9ca3af;
                                            z-index: 5;
                                        "
                                    >
                                        ⋯
                                    </span>
                                </div>
                            </Tooltip>
                            
                            <!-- 일반 메뉴 아이템 (펼쳐진 상태) -->
                            <div 
                                v-else
                                class="menu-item"
                                :class="{ 
                                    'menu-active': isMenuActive(menuItem),
                                    'menu-collapsed': layoutStore.autoCollapsed,
                                    'has-children': menuItem.children
                                }"
                                @click="menuItem.children ? toggleMenuExpanded(menuItem.id) : handleMenuClickWithTab(menuItem)"
                                @mouseover="$event.target.style.background = isMenuActive(menuItem) ? '#3b82f6' : '#4b5563'"
                                @mouseleave="$event.target.style.background = isMenuActive(menuItem) ? '#3b82f6' : '#374151'"
                                :style="{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    color: 'white',
                                    padding: '0.75rem 0.5rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: isMenuActive(menuItem) ? '#3b82f6' : '#374151',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: 'none',
                                    width: '100%',
                                    boxShadow: isMenuActive(menuItem) ? '0 4px 12px -2px rgba(59, 130, 246, 0.3)' : '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transform: 'translateZ(0)' // GPU 가속
                                }"
                            >
                                <!-- 아이콘과 라벨 -->
                                <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0; flex: 1;">
                                    <span 
                                        style="font-size: 1.125rem; flex-shrink: 0; transition: all 0.2s ease;"
                                        :style="{
                                            color: isMenuActive(menuItem) && menuItem.iconColor ? menuItem.iconColor : 'inherit',
                                            transform: isMenuActive(menuItem) ? 'scale(1.1)' : 'scale(1)'
                                        }"
                                    >
                                        {{ isMenuActive(menuItem) && menuItem.iconActive ? menuItem.iconActive : menuItem.icon }}
                                    </span>
                                    <span 
                                        style="font-size: 0.875rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                                    >
                                        {{ menuItem.label }}
                                    </span>
                                    <!-- 배지 카운트 표시 (확장 상태) -->
                                    <span 
                                        v-if="menuItem.badgeCount"
                                        style="
                                            background: #ef4444;
                                            color: white;
                                            font-size: 0.625rem;
                                            padding: 0.125rem 0.375rem;
                                            border-radius: 0.75rem;
                                            font-weight: 600;
                                            min-width: 1.25rem;
                                            text-align: center;
                                            margin-left: auto;
                                        "
                                    >
                                        {{ menuItem.badgeCount }}
                                    </span>
                                    <!-- NEW 배지 표시 (확장 상태) -->
                                    <span 
                                        v-if="menuItem.isNew"
                                        style="
                                            background: #10b981;
                                            color: white;
                                            font-size: 0.5rem;
                                            padding: 0.125rem 0.25rem;
                                            border-radius: 0.25rem;
                                            font-weight: 600;
                                            text-transform: uppercase;
                                            margin-left: auto;
                                        "
                                    >
                                        NEW
                                    </span>
                                </div>
                                
                                                <!-- 확장/축소 화살표 (자식 메뉴가 있는 경우) -->
                                <span 
                                    v-if="menuItem.children && !layoutStore.sidebarCollapsed" 
                                    :style="{
                                        fontSize: '0.75rem',
                                        transition: 'transform 0.2s ease',
                                        transform: isMenuExpanded(menuItem.id) ? 'rotate(90deg)' : 'rotate(0deg)',
                                        color: '#9ca3af'
                                    }"
                                >
                                    ▶
                                </span>
                                
                                <!-- 축소 상태 서브메뉴 표시기 -->
                                <span 
                                    v-if="menuItem.children && layoutStore.sidebarCollapsed"
                                    style="
                                        position: absolute;
                                        bottom: 2px;
                                        right: 2px;
                                        font-size: 0.5rem;
                                        color: #9ca3af;
                                        z-index: 5;
                                    "
                                >
                                    ⋯
                                </span>
                            </div>
                            
                            <!-- 자식 메뉴 (서브메뉴) - 향상된 슬라이드 애니메이션 -->
                            <Transition 
                                name="submenu"
                                @enter="onSubmenuEnter"
                                @leave="onSubmenuLeave"
                            >
                                <div 
                                    v-if="menuItem.children && isMenuExpanded(menuItem.id) && !layoutStore.autoCollapsed"
                                    class="submenu-container"
                                    :style="{
                                        marginTop: '0.25rem',
                                        marginLeft: '0.5rem',
                                        borderLeft: '2px solid ' + (layoutStore.isDarkMode ? '#6b7280' : '#4b5563'),
                                        paddingLeft: '0.5rem',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        overflow: 'hidden'
                                    }"
                                >
                                <template v-for="childItem in menuItem.children" :key="childItem.id">
                                    <div
                                        @click="handleMenuClickWithLoading(childItem, menuItem)"
                                        @mouseover="$event.target.style.background = isMenuActive(childItem) ? '#1e3a8a' : '#4b5563'"
                                        @mouseleave="$event.target.style.background = isMenuActive(childItem) ? '#1e3a8a' : 'transparent'"
                                        :style="{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: isMenuActive(childItem) ? '#60a5fa' : '#d1d5db',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.8125rem',
                                            marginBottom: '0.125rem',
                                            background: isMenuActive(childItem) ? '#1e3a8a' : 'transparent',
                                            transition: 'all 0.2s ease',
                                            justifyContent: 'space-between'
                                        }"
                                        :title="childItem.description"
                                    >
                                        <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1;">
                                            <span 
                                                style="font-size: 0.875rem; transition: all 0.2s ease;"
                                                :style="{
                                                    color: isMenuActive(childItem) && childItem.iconColor ? childItem.iconColor : 'inherit',
                                                    transform: isMenuActive(childItem) ? 'scale(1.05)' : 'scale(1)'
                                                }"
                                            >
                                                {{ isMenuActive(childItem) && childItem.iconActive ? childItem.iconActive : childItem.icon }}
                                            </span>
                                            <span style="font-weight: 400;">{{ childItem.label }}</span>
                                        </div>
                                        
                                        <!-- 서브메뉴 배지 카운트 -->
                                        <span 
                                            v-if="childItem.badgeCount"
                                            style="
                                                background: #ef4444;
                                                color: white;
                                                font-size: 0.5rem;
                                                padding: 0.125rem 0.25rem;
                                                border-radius: 0.625rem;
                                                font-weight: 600;
                                                min-width: 1rem;
                                                text-align: center;
                                            "
                                        >
                                            {{ childItem.badgeCount }}
                                        </span>
                                        
                                        <!-- 서브메뉴 NEW 배지 -->
                                        <span 
                                            v-if="childItem.isNew"
                                            style="
                                                background: #10b981;
                                                color: white;
                                                font-size: 0.4375rem;
                                                padding: 0.0625rem 0.1875rem;
                                                border-radius: 0.1875rem;
                                                font-weight: 600;
                                                text-transform: uppercase;
                                            "
                                        >
                                            NEW
                                        </span>
                                    </div>
                                </template>
                                </div>
                            </Transition>
                        </div>
                    </template>
                </nav>
                
                <!-- 사이드바 하단 정보 -->
                <div v-if="!layoutStore.sidebarCollapsed" :style="{
                    marginTop: 'auto',
                    paddingTop: '1rem',
                    borderTop: '1px solid ' + (layoutStore.isDarkMode ? '#6b7280' : '#4b5563'),
                    textAlign: 'center',
                    transition: 'border-color 0.3s ease'
                }">
                    <div style="color: #9ca3af; font-size: 0.75rem; margin-bottom: 0.5rem;">
                        통합 물류관리 시스템
                    </div>
                    <div style="color: #6b7280; font-size: 0.625rem;">
                        v1.0.0 Beta
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 메인 콘텐츠 영역 -->
        <div style="flex: 1; display: flex; flex-direction: column;">
            <!-- 헤더 -->
            <div :style="{
                height: '60px',
                background: layoutStore.isDarkMode ? '#1f2937' : 'white',
                borderBottom: '1px solid ' + (layoutStore.isDarkMode ? '#374151' : '#e5e7eb'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1rem',
                boxShadow: layoutStore.isDarkMode ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
            }">
                <!-- 좌측: 시스템 제목 -->
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <h1 :style="{
                        margin: '0',
                        color: layoutStore.isDarkMode ? '#f9fafb' : '#1f2937',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        transition: 'color 0.3s ease'
                    }">
                        통합 물류관리 시스템
                    </h1>
                </div>

                <!-- 우측: 다크모드 토글 및 사용자 드롭다운 -->
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <!-- 알림 아이콘 (향후 구현) -->
                    <button :style="{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        color: layoutStore.isDarkMode ? '#d1d5db' : '#6b7280',
                        fontSize: '1.25rem',
                        transition: 'all 0.2s ease'
                    }" title="알림">
                        🔔
                    </button>

                    <!-- 다크모드 토글 -->
                    <DarkModeToggle />

                    <!-- 사용자 드롭다운 -->
                    <UserDropdown />
                </div>
            </div>
            
            <!-- 탭 바 -->
            <TabBar 
                @tab-change="(tab) => console.log('Tab changed:', tab)"
                @tab-close="(tab) => console.log('Tab closed:', tab)"
                @tab-save="(tab) => console.log('Tab saved:', tab)"
            />
            
            <!-- 라우터 뷰 컨테이너 (최적화된) -->
            <div 
                class="router-view-container"
                :style="{
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1rem',
                    background: layoutStore.isDarkMode ? '#111827' : '#f9fafb',
                    transition: 'background-color 0.3s ease',
                    color: layoutStore.isDarkMode ? '#f9fafb' : '#1f2937',
                    overflow: 'hidden',
                    position: 'relative'
                }"
            >
                <!-- 로딩 오버레이 -->
                <div 
                    v-if="isRouteLoading"
                    class="loading-overlay"
                    :style="{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        background: layoutStore.isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(249, 250, 251, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: '1000',
                        backdropFilter: 'blur(2px)',
                        transition: 'all 0.3s ease'
                    }"
                >
                    <div :style="{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem'
                    }">
                        <!-- 로딩 스피너 -->
                        <div 
                            class="loading-spinner"
                            :style="{
                                width: '32px',
                                height: '32px',
                                border: '3px solid ' + (layoutStore.isDarkMode ? '#374151' : '#e5e7eb'),
                                borderTop: '3px solid #3b82f6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }"
                        ></div>
                        <span :style="{
                            color: layoutStore.isDarkMode ? '#d1d5db' : '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                        }">
                            페이지 로딩 중...
                        </span>
                    </div>
                </div>
                
                <!-- 실제 라우터 뷰 (페이지 전환 애니메이션 포함) -->
                <router-view 
                    v-slot="{ Component, route }"
                    :style="{
                        flex: '1',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }"
                >
                    <!-- 페이지 전환 애니메이션 래퍼 -->
                    <Transition 
                        :name="getTransitionName(route)"
                        mode="out-in"
                        appear
                        @before-enter="onBeforeEnter"
                        @enter="onEnter"
                        @after-enter="onAfterEnter"
                        @before-leave="onBeforeLeave"
                        @leave="onLeave"
                        @after-leave="onAfterLeave"
                    >
                        <div 
                            :key="route.path"
                            class="page-transition-wrapper"
                            :style="{
                                flex: '1',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'auto',
                                position: 'relative'
                            }"
                        >
                    <!-- 페이지 헤더 (메타데이터 기반) -->
                    <div 
                        v-if="route.meta.showPageHeader !== false"
                        class="page-header"
                        :style="{
                            marginBottom: '1.5rem',
                            paddingBottom: '1rem',
                            borderBottom: '1px solid ' + (layoutStore.isDarkMode ? '#374151' : '#e5e7eb'),
                            transition: 'border-color 0.3s ease'
                        }"
                    >
                        <div :style="{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }">
                            <!-- 페이지 제목 및 설명 -->
                            <div>
                                <h1 :style="{
                                    margin: '0 0 0.25rem 0',
                                    fontSize: '1.875rem',
                                    fontWeight: '700',
                                    color: layoutStore.isDarkMode ? '#f9fafb' : '#1f2937',
                                    transition: 'color 0.3s ease'
                                }">
                                    {{ route.meta.title || route.name || '페이지' }}
                                </h1>
                                <p 
                                    v-if="route.meta.description"
                                    :style="{
                                        margin: '0',
                                        color: layoutStore.isDarkMode ? '#d1d5db' : '#6b7280',
                                        fontSize: '0.875rem',
                                        transition: 'color 0.3s ease'
                                    }"
                                >
                                    {{ route.meta.description }}
                                </p>
                            </div>
                            
                            <!-- 페이지 액션 버튼들 (메타데이터에서 정의) -->
                            <div 
                                v-if="route.meta.actions && route.meta.actions.length > 0"
                                :style="{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    flexWrap: 'wrap'
                                }"
                            >
                                <button
                                    v-for="action in route.meta.actions"
                                    :key="action.id"
                                    @click="handlePageAction(action)"
                                    :style="{
                                        padding: '0.5rem 1rem',
                                        border: action.variant === 'primary' ? 'none' : '1px solid ' + (layoutStore.isDarkMode ? '#4b5563' : '#d1d5db'),
                                        borderRadius: '0.375rem',
                                        background: action.variant === 'primary' 
                                            ? '#3b82f6' 
                                            : layoutStore.isDarkMode ? '#374151' : 'white',
                                        color: action.variant === 'primary' 
                                            ? 'white' 
                                            : layoutStore.isDarkMode ? '#f9fafb' : '#374151',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }"
                                    :title="action.tooltip"
                                >
                                    <span v-if="action.icon">{{ action.icon }}</span>
                                    {{ action.label }}
                                </button>
                            </div>
                        </div>
                        
                        <!-- 브레드크럼 네비게이션 -->
                        <nav 
                            v-if="breadcrumbs.length > 1"
                            class="breadcrumb-nav"
                            :style="{
                                marginTop: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem'
                            }"
                            aria-label="브레드크럼"
                        >
                            <template v-for="(crumb, index) in breadcrumbs" :key="crumb.id">
                                <span v-if="index > 0" :style="{
                                    color: layoutStore.isDarkMode ? '#6b7280' : '#9ca3af'
                                }">
                                    →
                                </span>
                                <button
                                    v-if="index < breadcrumbs.length - 1"
                                    @click="handleMenuClick(crumb)"
                                    :style="{
                                        background: 'none',
                                        border: 'none',
                                        color: '#3b82f6',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        fontSize: 'inherit'
                                    }"
                                >
                                    {{ crumb.label }}
                                </button>
                                <span
                                    v-else
                                    :style="{
                                        color: layoutStore.isDarkMode ? '#d1d5db' : '#6b7280',
                                        fontWeight: '500'
                                    }"
                                >
                                    {{ crumb.label }}
                                </span>
                            </template>
                        </nav>
                    </div>
                    
                    <!-- 페이지 컴포넌트 래퍼 -->
                    <div 
                        class="page-content"
                        :style="{
                            flex: '1',
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: '0'
                        }"
                    >
                        <!-- 에러 바운더리 -->
                        <Suspense>
                            <template #default>
                                <component 
                                    :is="Component" 
                                    :key="route.path"
                                    class="page-component"
                                />
                            </template>
                            <template #fallback>
                                <div class="page-loading" style="display: flex; align-items: center; justify-content: center; padding: 3rem; color: #6b7280;">
                                    <div style="text-align: center;">
                                        <div class="loading-spinner"></div>
                                        <p style="margin: 0; font-size: 0.875rem;">
                                            컴포넌트 로딩 중...
                                        </p>
                                    </div>
                                </div>
                            </template>
                        </Suspense>
                    </div>
                        </div>
                    </Transition>
                </router-view>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 로딩 스피너 애니메이션 */
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* 라우터 뷰 컨테이너 스타일 */
.router-view-container {
    position: relative;
    overflow: hidden;
}

/* 로딩 오버레이 애니메이션 */
.loading-overlay {
    backdrop-filter: blur(2px);
    animation: fadeIn 0.2s ease-in-out;
}

/* 로딩 스피너 */
.loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* 페이지 헤더 스타일 */
.page-header {
    animation: slideInDown 0.3s ease-out;
}

@keyframes slideInDown {
    from {
        transform: translateY(-10px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* 페이지 컨텐츠 애니메이션 */
.page-content {
    animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* 브레드크럼 호버 효과 */
.breadcrumb-nav button:hover {
    color: #1d4ed8 !important;
    text-decoration: none !important;
}

/* 페이지 액션 버튼 호버 효과 */
.page-header button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
    .page-header > div:first-child {
        flex-direction: column;
        align-items: flex-start !important;
    }
    
    .page-header h1 {
        font-size: 1.5rem !important;
    }
    
    .page-header button {
        font-size: 0.75rem !important;
        padding: 0.375rem 0.75rem !important;
    }
}

/* 접근성 개선 */
@media (prefers-reduced-motion: reduce) {
    .loading-overlay,
    .page-header,
    .page-content,
    .page-header button {
        animation: none !important;
        transition: none !important;
    }
}

/* 페이지 전환 애니메이션 */

/* 1. 기본 페이드 전환 */
.page-fade-enter-active,
.page-fade-leave-active {
    transition: opacity 0.3s ease-in-out;
}

.page-fade-enter-from,
.page-fade-leave-to {
    opacity: 0;
}

/* 2. 페이드-슬라이드 전환 (같은 모듈 내) */
.page-fade-slide-enter-active,
.page-fade-slide-leave-active {
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.page-fade-slide-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.page-fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

/* 3. 좌측 슬라이드 전환 (앞으로) */
.page-slide-left-enter-active,
.page-slide-left-leave-active {
    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
}

.page-slide-left-enter-from {
    transform: translateX(100%);
    opacity: 0;
}

.page-slide-left-leave-to {
    transform: translateX(-100%);
    opacity: 0;
}

/* 4. 우측 슬라이드 전환 (뒤로) */
.page-slide-right-enter-active,
.page-slide-right-leave-active {
    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
}

.page-slide-right-enter-from {
    transform: translateX(-100%);
    opacity: 0;
}

.page-slide-right-leave-to {
    transform: translateX(100%);
    opacity: 0;
}

/* 5. 스케일 전환 (특별한 경우) */
.page-scale-enter-active,
.page-scale-leave-active {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.page-scale-enter-from {
    transform: scale(0.95);
    opacity: 0;
}

.page-scale-leave-to {
    transform: scale(1.05);
    opacity: 0;
}

/* 페이지 전환 래퍼 */
.page-transition-wrapper {
    backface-visibility: hidden;
    will-change: transform, opacity;
}

/* 전환 중 스크롤 방지 */
.page-transition-wrapper.transitioning {
    overflow: hidden;
}

/* 로딩 중 전환 효과 */
.router-view-container.loading .page-transition-wrapper {
    filter: blur(1px);
    transition: filter 0.2s ease;
}

/* 다크모드 전환 효과 개선 */
:global(.app-dark) .page-transition-wrapper {
    background: #111827;
}

/* 모바일 최적화 */
@media (max-width: 768px) {
    .page-slide-left-enter-active,
    .page-slide-left-leave-active,
    .page-slide-right-enter-active,
    .page-slide-right-leave-active {
        transition-duration: 0.3s;
    }
    
    .page-fade-slide-enter-active,
    .page-fade-slide-leave-active {
        transition-duration: 0.25s;
    }
}

/* 성능 최적화 */
.page-transition-wrapper {
    transform: translateZ(0);
    /* GPU 가속 활성화 */
}

/* 고해상도 디스플레이 최적화 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .page-transition-wrapper {
        transform: translate3d(0, 0, 0);
    }
}

/* 다크모드 전용 스타일 */
:global(.app-dark) .loading-overlay {
    backdrop-filter: blur(3px);
}

:global(.app-dark) .page-header button:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

/* 사이드바 애니메이션 스타일 */
.sidebar-container {
    position: relative;
    overflow: hidden;
    will-change: width, transform;
    transform: translateZ(0); /* GPU 가속 */
}

.sidebar-container.sidebar-mobile {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
}

/* 사이드바 토글 버튼 애니메이션 */
.sidebar-toggle-btn {
    position: relative;
    overflow: hidden;
}

.sidebar-toggle-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.5s;
}

.sidebar-toggle-btn:hover::before {
    left: 100%;
}

/* 메뉴 아이템 애니메이션 */
.menu-item {
    position: relative;
}

.menu-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 3px;
    background: #3b82f6;
    transform: scaleY(0);
    transition: transform 0.2s ease;
    border-radius: 0 2px 2px 0;
}

.menu-item.menu-active::before {
    transform: scaleY(1);
}

/* 메뉴 네비게이션 애니메이션 */
.sidebar-nav {
    scrollbar-width: thin;
    scrollbar-color: #4b5563 transparent;
}

.sidebar-nav::-webkit-scrollbar {
    width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
    background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
    background: #4b5563;
    border-radius: 3px;
    transition: background 0.2s ease;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
}

/* 접힌 상태 특별 효과 */
.menu-item-wrapper.menu-item-collapsed {
    margin-bottom: 0.5rem;
}

.menu-item.menu-collapsed {
    justify-content: center;
    position: relative;
}

/* 하위 메뉴 슬라이드 애니메이션 */
.submenu-container {
    overflow: hidden;
    transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                opacity 0.2s ease,
                padding 0.3s ease;
}

.submenu-enter-active,
.submenu-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.submenu-enter-from {
    max-height: 0;
    opacity: 0;
    transform: translateY(-10px);
}

.submenu-enter-to {
    max-height: 500px;
    opacity: 1;
    transform: translateY(0);
}

.submenu-leave-from {
    max-height: 500px;
    opacity: 1;
    transform: translateY(0);
}

.submenu-leave-to {
    max-height: 0;
    opacity: 0;
    transform: translateY(-10px);
}

/* 모바일 오버레이 배경 */
.sidebar-mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.sidebar-mobile-overlay.active {
    opacity: 1;
    visibility: visible;
}

/* 반응형 최적화 */
@media (max-width: 768px) {
    .sidebar-container {
        transition-duration: 0.25s;
    }
    
    .menu-item,
    .sidebar-toggle-btn {
        transition-duration: 0.2s;
    }
}

/* 접근성 개선 */
@media (prefers-reduced-motion: reduce) {
    .sidebar-container,
    .sidebar-toggle-btn,
    .menu-item,
    .sidebar-nav,
    .submenu-container {
        transition: none !important;
        animation: none !important;
    }
}
</style>
