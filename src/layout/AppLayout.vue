<script setup>
import { onMounted, onUnmounted } from 'vue';
import UserDropdown from '@/components/common/UserDropdown.vue';
import DarkModeToggle from '@/components/common/DarkModeToggle.vue';
import TabBar from '@/components/common/TabBar.vue';
import { useMenu } from '@/composables/useMenu';
import { useGlobalTabs } from '@/composables/useTabs';
import { useLayoutStore } from '@/stores/useLayoutStore';

// 레이아웃 스토어 사용
const layoutStore = useLayoutStore();

// 메뉴 관리
const { 
    menuItems, 
    isMenuActive, 
    handleMenuClick, 
    toggleMenuExpanded, 
    isMenuExpanded,
    autoExpandActiveMenu 
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

// 메뉴 클릭 핸들러 (탭 생성 포함)
const handleMenuClickWithTab = (menuItem, parentMenuItem = null) => {
    // 대시보드나 기본 메뉴 아이템은 탭 생성
    if (!menuItem.children) {
        createTab(menuItem, parentMenuItem);
    }
    // 기존 메뉴 클릭 핸들러 호출
    handleMenuClick(menuItem);
};

// 컴포넌트 라이프사이클
onMounted(() => {
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
    <div style="min-height: 100vh; display: flex;">
        <!-- 간단한 사이드바 -->
        <div :style="{ 
            width: layoutStore.actualSidebarWidth, 
            backgroundColor: layoutStore.isDarkMode ? '#111827' : '#1f2937', 
            color: 'white',
            transition: 'width 0.3s ease, background-color 0.3s ease',
            position: 'relative'
        }">
            <div style="padding: 1rem; display: flex; flex-direction: column; height: 100%;">
                <button @click="toggleSidebar" :style="{
                    background: layoutStore.isDarkMode ? '#4b5563' : '#374151',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background-color 0.3s ease'
                }" :title="`사이드바 ${layoutStore.sidebarCollapsed ? '펼치기' : '접기'} (Ctrl+B)`">
                    {{ layoutStore.sidebarCollapsed ? '▶' : '◀' }}
                </button>
                
                <!-- 물류시스템 메뉴 -->
                <nav style="
                    margin-top: 1rem; 
                    padding-right: 0.5rem; 
                    flex: 1; 
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: #4b5563 transparent;
                ">
                    <template v-for="menuItem in menuItems" :key="menuItem.id">
                        <!-- 메인 메뉴 아이템 -->
                        <div style="margin-bottom: 0.25rem; position: relative;">
                            <div 
                                @click="menuItem.children ? toggleMenuExpanded(menuItem.id) : handleMenuClickWithTab(menuItem)"
                                @mouseover="$event.target.style.background = isMenuActive(menuItem) ? '#3b82f6' : '#4b5563'"
                                @mouseleave="$event.target.style.background = isMenuActive(menuItem) ? '#3b82f6' : '#374151'"
                                :style="{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    color: 'white',
                                    padding: '0.75rem 0.5rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    background: isMenuActive(menuItem) ? '#3b82f6' : '#374151',
                                    transition: 'all 0.2s ease',
                                    border: 'none',
                                    width: '100%',
                                    boxShadow: isMenuActive(menuItem) ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                                    position: 'relative'
                                }"
                                :title="layoutStore.sidebarCollapsed ? `${menuItem.label}${menuItem.badgeCount ? ` (${menuItem.badgeCount})` : ''}` : ''"
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
                                        v-if="!layoutStore.sidebarCollapsed" 
                                        style="font-size: 0.875rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                                    >
                                        {{ menuItem.label }}
                                    </span>
                                    <!-- 배지 카운트 표시 (확장 상태) -->
                                    <span 
                                        v-if="menuItem.badgeCount && !layoutStore.sidebarCollapsed"
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
                                        v-if="menuItem.isNew && !layoutStore.sidebarCollapsed"
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
                                    
                                    <!-- 배지 카운트 표시 (축소 상태) -->
                                    <span 
                                        v-if="menuItem.badgeCount && layoutStore.sidebarCollapsed"
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
                                            border: `2px solid ${layoutStore.isDarkMode ? '#111827' : '#1f2937'}`,
                                            zIndex: '10'
                                        }"
                                    >
                                        {{ menuItem.badgeCount }}
                                    </span>
                                    
                                    <!-- NEW 표시 (축소 상태) -->
                                    <span 
                                        v-if="menuItem.isNew && layoutStore.sidebarCollapsed"
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
                                            border: `2px solid ${layoutStore.isDarkMode ? '#111827' : '#1f2937'}`,
                                            zIndex: '10'
                                        }"
                                    >
                                        !
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
                            
                            <!-- 자식 메뉴 (서브메뉴) -->
                            <div 
                                v-if="menuItem.children && isMenuExpanded(menuItem.id) && !layoutStore.sidebarCollapsed"
                                :style="{
                                    marginTop: '0.25rem',
                                    marginLeft: '0.5rem',
                                    borderLeft: `2px solid ${layoutStore.isDarkMode ? '#6b7280' : '#4b5563'}`,
                                    paddingLeft: '0.5rem',
                                    transition: 'border-color 0.3s ease'
                                }"
                            >
                                <template v-for="childItem in menuItem.children" :key="childItem.id">
                                    <div
                                        @click="handleMenuClickWithTab(childItem, menuItem)"
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
                        </div>
                    </template>
                </nav>
                
                <!-- 사이드바 하단 정보 -->
                <div v-if="!layoutStore.sidebarCollapsed" :style="{
                    marginTop: 'auto',
                    paddingTop: '1rem',
                    borderTop: `1px solid ${layoutStore.isDarkMode ? '#6b7280' : '#4b5563'}`,
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
                borderBottom: `1px solid ${layoutStore.isDarkMode ? '#374151' : '#e5e7eb'}`,
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
            
            <!-- 라우터 뷰 -->
            <div :style="{
                flex: '1',
                padding: '1rem',
                background: layoutStore.isDarkMode ? '#111827' : '#f9fafb',
                transition: 'background-color 0.3s ease',
                color: layoutStore.isDarkMode ? '#f9fafb' : '#1f2937'
            }">
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>
