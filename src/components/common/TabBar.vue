<template>
    <div 
        v-if="openTabs.length > 0" 
        class="tab-bar"
        :class="{ 'tab-bar--dark': isDarkMode }"
    >
        <!-- 탭 컨테이너 -->
        <div class="tab-container" ref="tabContainer">
            <!-- 스크롤 버튼 (왼쪽) -->
            <button 
                v-if="showScrollButtons && canScrollLeft"
                class="tab-scroll-btn tab-scroll-btn--left"
                @click="scrollTabs(-200)"
                :aria-label="t('tabs.scrollLeft')"
            >
                <i class="pi pi-chevron-left"></i>
            </button>
            
            <!-- 탭 스크롤 영역 -->
            <div 
                class="tab-scroll-area" 
                ref="tabScrollArea"
                @wheel.prevent="handleWheel"
            >
                <div class="tab-list" ref="tabList">
                    <!-- 개별 탭 -->
                    <div
                        v-for="tab in sortedTabs"
                        :key="tab.id"
                        class="tab"
                        :class="{
                            'tab--active': tab.id === activeTabId,
                            'tab--dirty': tab.isDirty,
                            'tab--loading': tab.isLoading,
                            'tab--can-close': tab.canClose
                        }"
                        @click="handleTabClick(tab)"
                        @contextmenu.prevent="showTabContextMenu(tab, $event)"
                        :draggable="true"
                        @dragstart="handleDragStart(tab, $event)"
                        @dragover.prevent
                        @drop="handleDrop(tab, $event)"
                        :title="getTabTooltip(tab)"
                    >
                        <!-- 탭 아이콘 -->
                        <span 
                            class="tab__icon"
                            :style="{ color: tab.iconColor }"
                        >
                            {{ tab.id === activeTabId && tab.iconActive ? tab.iconActive : tab.icon }}
                        </span>
                        
                        <!-- 탭 제목 -->
                        <span class="tab__title">{{ tab.title }}</span>
                        
                        <!-- 더티 인디케이터 -->
                        <span 
                            v-if="tab.isDirty" 
                            class="tab__dirty-indicator"
                            :title="t('tabs.unsavedChanges')"
                        >
                            •
                        </span>
                        
                        <!-- 로딩 인디케이터 -->
                        <span 
                            v-if="tab.isLoading" 
                            class="tab__loading"
                        >
                            <i class="pi pi-spin pi-spinner"></i>
                        </span>
                        
                        <!-- 배지 -->
                        <span 
                            v-if="tab.badgeCount" 
                            class="tab__badge"
                        >
                            {{ tab.badgeCount > 99 ? '99+' : tab.badgeCount }}
                        </span>
                        
                        <!-- NEW 배지 -->
                        <span 
                            v-if="tab.isNew" 
                            class="tab__new-badge"
                        >
                            NEW
                        </span>
                        
                        <!-- 닫기 버튼 -->
                        <button
                            v-if="tab.canClose"
                            class="tab__close"
                            @click.stop="handleTabClose(tab)"
                            :aria-label="t('tabs.closeTab', { title: tab.title })"
                        >
                            <i class="pi pi-times"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- 스크롤 버튼 (오른쪽) -->
            <button 
                v-if="showScrollButtons && canScrollRight"
                class="tab-scroll-btn tab-scroll-btn--right"
                @click="scrollTabs(200)"
                :aria-label="t('tabs.scrollRight')"
            >
                <i class="pi pi-chevron-right"></i>
            </button>
            
            <!-- 탭 메뉴 버튼 -->
            <div class="tab-actions">
                <!-- 모든 탭 목록 -->
                <button
                    class="tab-action-btn"
                    @click="toggleTabList"
                    :aria-label="t('tabs.showAllTabs')"
                >
                    <i class="pi pi-list"></i>
                </button>
                
                <!-- 탭 옵션 메뉴 -->
                <button
                    class="tab-action-btn"
                    @click="toggleTabOptions"
                    :aria-label="t('tabs.options')"
                >
                    <i class="pi pi-ellipsis-v"></i>
                </button>
            </div>
        </div>
        
        <!-- 탭 목록 드롭다운 -->
        <div 
            v-if="showTabListMenu"
            class="tab-list-menu"
            v-click-outside="hideTabListMenu"
        >
            <div class="tab-list-menu__header">
                <h3>{{ t('tabs.openTabs') }}</h3>
                <button @click="hideTabListMenu">
                    <i class="pi pi-times"></i>
                </button>
            </div>
            <div class="tab-list-menu__content">
                <div
                    v-for="tab in sortedTabs"
                    :key="tab.id"
                    class="tab-list-item"
                    :class="{ 'tab-list-item--active': tab.id === activeTabId }"
                    @click="handleTabClick(tab); hideTabListMenu()"
                >
                    <span class="tab-list-item__icon" :style="{ color: tab.iconColor }">
                        {{ tab.icon }}
                    </span>
                    <span class="tab-list-item__title">{{ tab.title }}</span>
                    <span v-if="tab.isDirty" class="tab-list-item__dirty">•</span>
                    <button
                        v-if="tab.canClose"
                        class="tab-list-item__close"
                        @click.stop="handleTabClose(tab)"
                    >
                        <i class="pi pi-times"></i>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- 탭 옵션 메뉴 -->
        <div 
            v-if="showTabOptionsMenu"
            class="tab-options-menu"
            v-click-outside="hideTabOptionsMenu"
        >
            <button @click="closeOtherTabs(activeTabId); hideTabOptionsMenu()">
                <i class="pi pi-times"></i>
                {{ t('tabs.closeOthers') }}
            </button>
            <button @click="closeAllTabs(); hideTabOptionsMenu()">
                <i class="pi pi-times-circle"></i>
                {{ t('tabs.closeAll') }}
            </button>
            <hr>
            <button @click="openTabSettings(); hideTabOptionsMenu()">
                <i class="pi pi-cog"></i>
                {{ t('tabs.settings') }}
            </button>
        </div>
        
        <!-- 컨텍스트 메뉴 -->
        <div 
            v-if="contextMenu.show"
            class="tab-context-menu"
            :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
            v-click-outside="hideContextMenu"
        >
            <button 
                v-if="contextMenu.tab?.canClose"
                @click="handleTabClose(contextMenu.tab); hideContextMenu()"
            >
                <i class="pi pi-times"></i>
                {{ t('tabs.close') }}
            </button>
            <button 
                @click="closeOtherTabs(contextMenu.tab?.id); hideContextMenu()"
            >
                <i class="pi pi-times"></i>
                {{ t('tabs.closeOthers') }}
            </button>
            <button @click="closeAllTabs(); hideContextMenu()">
                <i class="pi pi-times-circle"></i>
                {{ t('tabs.closeAll') }}
            </button>
            <hr v-if="contextMenu.tab?.canClose">
            <button 
                v-if="contextMenu.tab?.isDirty"
                @click="saveTab(contextMenu.tab); hideContextMenu()"
            >
                <i class="pi pi-save"></i>
                {{ t('tabs.save') }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useGlobalTabs } from '@/composables/useTabs';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { useI18n } from '@/composables/useI18n';
import { vClickOutside } from '@/directives/clickOutside';

// Props
const props = defineProps({
    maxVisibleTabs: {
        type: Number,
        default: 8
    },
    enableDragDrop: {
        type: Boolean,
        default: true
    }
});

// Emits
const emit = defineEmits(['tab-change', 'tab-close', 'tab-save']);

// Composables
const {
    openTabs,
    activeTabId,
    sortedTabs,
    setActiveTab,
    closeTab,
    closeAllTabs,
    closeOtherTabs,
    reorderTabs
} = useGlobalTabs();

const layoutStore = useLayoutStore();
const { t } = useI18n();

// 반응형 상태
const tabContainer = ref(null);
const tabScrollArea = ref(null);
const tabList = ref(null);
const showScrollButtons = ref(false);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const showTabListMenu = ref(false);
const showTabOptionsMenu = ref(false);

// 컨텍스트 메뉴
const contextMenu = ref({
    show: false,
    x: 0,
    y: 0,
    tab: null
});

// 드래그 앤 드롭
const dragState = ref({
    dragging: false,
    dragTab: null,
    dragIndex: -1
});

// Computed
const isDarkMode = computed(() => layoutStore.isDarkMode);

// 탭 클릭 핸들러
const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    emit('tab-change', tab);
    scrollToActiveTab();
};

// 탭 닫기 핸들러
const handleTabClose = (tab) => {
    const closed = closeTab(tab.id);
    if (closed) {
        emit('tab-close', tab);
        nextTick(() => {
            updateScrollState();
        });
    }
};

// 탭 저장
const saveTab = (tab) => {
    emit('tab-save', tab);
};

// 스크롤 관련
const scrollTabs = (delta) => {
    if (tabScrollArea.value) {
        tabScrollArea.value.scrollLeft += delta;
        nextTick(() => updateScrollState());
    }
};

const handleWheel = (event) => {
    if (tabScrollArea.value) {
        event.preventDefault();
        tabScrollArea.value.scrollLeft += event.deltaY;
        nextTick(() => updateScrollState());
    }
};

const updateScrollState = () => {
    if (!tabScrollArea.value) return;
    
    const container = tabScrollArea.value;
    const list = tabList.value;
    
    if (!list) return;
    
    const containerWidth = container.clientWidth;
    const listWidth = list.scrollWidth;
    
    showScrollButtons.value = listWidth > containerWidth;
    canScrollLeft.value = container.scrollLeft > 0;
    canScrollRight.value = container.scrollLeft < listWidth - containerWidth;
};

const scrollToActiveTab = () => {
    nextTick(() => {
        const activeTabElement = tabList.value?.querySelector('.tab--active');
        if (activeTabElement && tabScrollArea.value) {
            const container = tabScrollArea.value;
            const tabRect = activeTabElement.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            const tabLeft = activeTabElement.offsetLeft;
            const tabWidth = activeTabElement.offsetWidth;
            const scrollLeft = container.scrollLeft;
            const containerWidth = container.clientWidth;
            
            if (tabLeft < scrollLeft) {
                container.scrollLeft = tabLeft - 20;
            } else if (tabLeft + tabWidth > scrollLeft + containerWidth) {
                container.scrollLeft = tabLeft + tabWidth - containerWidth + 20;
            }
            
            nextTick(() => updateScrollState());
        }
    });
};

// 메뉴 관리
const toggleTabList = () => {
    showTabListMenu.value = !showTabListMenu.value;
    showTabOptionsMenu.value = false;
};

const hideTabListMenu = () => {
    showTabListMenu.value = false;
};

const toggleTabOptions = () => {
    showTabOptionsMenu.value = !showTabOptionsMenu.value;
    showTabListMenu.value = false;
};

const hideTabOptionsMenu = () => {
    showTabOptionsMenu.value = false;
};

const openTabSettings = () => {
    // 탭 설정 다이얼로그 열기
    console.log('Open tab settings');
};

// 컨텍스트 메뉴
const showTabContextMenu = (tab, event) => {
    contextMenu.value = {
        show: true,
        x: event.clientX,
        y: event.clientY,
        tab
    };
};

const hideContextMenu = () => {
    contextMenu.value.show = false;
};

// 드래그 앤 드롭
const handleDragStart = (tab, event) => {
    if (!props.enableDragDrop) return;
    
    dragState.value.dragging = true;
    dragState.value.dragTab = tab;
    dragState.value.dragIndex = sortedTabs.value.findIndex(t => t.id === tab.id);
    
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', tab.id);
};

const handleDrop = (targetTab, event) => {
    if (!props.enableDragDrop || !dragState.value.dragging) return;
    
    event.preventDefault();
    
    const dragIndex = dragState.value.dragIndex;
    const dropIndex = sortedTabs.value.findIndex(t => t.id === targetTab.id);
    
    if (dragIndex !== dropIndex && dragIndex >= 0 && dropIndex >= 0) {
        reorderTabs(dragIndex, dropIndex);
        nextTick(() => {
            updateScrollState();
            scrollToActiveTab();
        });
    }
    
    dragState.value.dragging = false;
    dragState.value.dragTab = null;
    dragState.value.dragIndex = -1;
};

// 탭 툴팁
const getTabTooltip = (tab) => {
    let tooltip = tab.title;
    if (tab.description) {
        tooltip += `\n${tab.description}`;
    }
    if (tab.isDirty) {
        tooltip += '\n• 저장되지 않은 변경사항';
    }
    return tooltip;
};

// 리사이즈 감지
const handleResize = () => {
    nextTick(() => {
        updateScrollState();
        scrollToActiveTab();
    });
};

// 감시자
watch(() => sortedTabs.value.length, () => {
    nextTick(() => {
        updateScrollState();
        scrollToActiveTab();
    });
});

watch(() => activeTabId.value, () => {
    scrollToActiveTab();
});

// 라이프사이클
onMounted(() => {
    window.addEventListener('resize', handleResize);
    nextTick(() => {
        updateScrollState();
        scrollToActiveTab();
    });
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.tab-bar {
    @apply bg-white border-b border-gray-200 relative z-10;
    height: 48px;
    min-height: 48px;
}

.tab-bar--dark {
    @apply bg-gray-800 border-gray-700;
}

.tab-container {
    @apply flex items-center h-full;
}

.tab-scroll-btn {
    @apply flex items-center justify-center w-8 h-full bg-transparent border-none text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors;
    min-width: 32px;
}

.tab-bar--dark .tab-scroll-btn {
    @apply text-gray-400 hover:text-gray-200 hover:bg-gray-700;
}

.tab-scroll-area {
    @apply flex-1 overflow-hidden relative;
    height: 100%;
}

.tab-list {
    @apply flex h-full;
    min-width: max-content;
}

.tab {
    @apply flex items-center px-3 py-2 border-r border-gray-200 cursor-pointer select-none relative min-w-0 max-w-xs;
    height: 100%;
    transition: all 0.2s ease;
}

.tab-bar--dark .tab {
    @apply border-gray-700;
}

.tab:hover {
    @apply bg-gray-50;
}

.tab-bar--dark .tab:hover {
    @apply bg-gray-700;
}

.tab--active {
    @apply bg-blue-50 border-blue-200;
}

.tab-bar--dark .tab--active {
    @apply bg-blue-900/20 border-blue-700;
}

.tab--dirty {
    @apply bg-orange-50;
}

.tab-bar--dark .tab--dirty {
    @apply bg-orange-900/20;
}

.tab--loading {
    @apply opacity-70;
}

.tab__icon {
    @apply mr-2 text-sm flex-shrink-0;
}

.tab__title {
    @apply truncate text-sm font-medium;
    max-width: 150px;
}

.tab__dirty-indicator {
    @apply text-orange-500 font-bold ml-1;
}

.tab__loading {
    @apply ml-2 text-blue-500;
}

.tab__badge {
    @apply ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full min-w-[18px] text-center;
    font-size: 10px;
    line-height: 1;
}

.tab__new-badge {
    @apply ml-2 px-1.5 py-0.5 bg-green-500 text-white text-xs rounded-full;
    font-size: 9px;
    line-height: 1;
    font-weight: 600;
}

.tab__close {
    @apply ml-2 w-4 h-4 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0;
}

.tab-bar--dark .tab__close {
    @apply hover:bg-gray-600 text-gray-500 hover:text-gray-300;
}

.tab__close:hover {
    @apply bg-red-100 text-red-600;
}

.tab-bar--dark .tab__close:hover {
    @apply bg-red-900/30 text-red-400;
}

.tab-actions {
    @apply flex items-center border-l border-gray-200 ml-auto;
}

.tab-bar--dark .tab-actions {
    @apply border-gray-700;
}

.tab-action-btn {
    @apply w-8 h-full flex items-center justify-center bg-transparent border-none text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors;
}

.tab-bar--dark .tab-action-btn {
    @apply text-gray-400 hover:text-gray-200 hover:bg-gray-700;
}

/* 드롭다운 메뉴 */
.tab-list-menu,
.tab-options-menu,
.tab-context-menu {
    @apply absolute bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 min-w-[200px];
}

.tab-bar--dark .tab-list-menu,
.tab-bar--dark .tab-options-menu,
.tab-bar--dark .tab-context-menu {
    @apply bg-gray-800 border-gray-700;
}

.tab-list-menu {
    @apply right-12 top-full mt-1;
}

.tab-options-menu {
    @apply right-0 top-full mt-1;
}

.tab-list-menu__header {
    @apply flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50;
}

.tab-bar--dark .tab-list-menu__header {
    @apply border-gray-700 bg-gray-700;
}

.tab-list-menu__header h3 {
    @apply text-sm font-medium text-gray-700;
}

.tab-bar--dark .tab-list-menu__header h3 {
    @apply text-gray-300;
}

.tab-list-menu__content {
    @apply max-h-80 overflow-y-auto;
}

.tab-list-item {
    @apply flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer;
}

.tab-bar--dark .tab-list-item {
    @apply hover:bg-gray-700;
}

.tab-list-item--active {
    @apply bg-blue-50 text-blue-700;
}

.tab-bar--dark .tab-list-item--active {
    @apply bg-blue-900/20 text-blue-300;
}

.tab-list-item__icon {
    @apply mr-2 text-sm;
}

.tab-list-item__title {
    @apply flex-1 truncate text-sm;
}

.tab-list-item__dirty {
    @apply text-orange-500 font-bold ml-1;
}

.tab-list-item__close {
    @apply ml-2 w-4 h-4 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors;
}

.tab-bar--dark .tab-list-item__close {
    @apply hover:bg-gray-600 text-gray-500 hover:text-gray-300;
}

.tab-options-menu button,
.tab-context-menu button {
    @apply flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors;
}

.tab-bar--dark .tab-options-menu button,
.tab-bar--dark .tab-context-menu button {
    @apply text-gray-300 hover:bg-gray-700;
}

.tab-options-menu button i,
.tab-context-menu button i {
    @apply mr-2;
}

.tab-options-menu hr,
.tab-context-menu hr {
    @apply border-gray-200 my-1;
}

.tab-bar--dark .tab-options-menu hr,
.tab-bar--dark .tab-context-menu hr {
    @apply border-gray-700;
}

/* 드래그 상태 */
.tab--dragging {
    @apply opacity-50;
}

/* 애니메이션 */
.tab-enter-active,
.tab-leave-active {
    transition: all 0.3s ease;
}

.tab-enter-from {
    opacity: 0;
    transform: translateY(-10px);
}

.tab-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

/* 반응형 */
@media (max-width: 768px) {
    .tab__title {
        max-width: 100px;
    }
    
    .tab {
        @apply px-2;
        min-width: 120px;
    }
}
</style>