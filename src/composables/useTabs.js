import { ref, computed, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useLocalStorage } from '@vueuse/core';

// 탭 상태 관리를 위한 반응형 데이터
const openTabs = ref([]);
const activeTabId = ref(null);
const tabCounter = ref(0);

// 탭 히스토리 (최근 방문한 탭 순서)
const tabHistory = ref([]);

// 로컬스토리지에 탭 상태 저장
const savedTabs = useLocalStorage('logistics-tabs', []);
const savedActiveTab = useLocalStorage('logistics-active-tab', null);

export function useTabs() {
    const router = useRouter();
    const route = useRoute();
    
    // 탭 생성
    const createTab = (menuItem, parentMenuItem = null) => {
        const existingTab = openTabs.value.find(tab => tab.route === menuItem.route);
        
        if (existingTab) {
            // 이미 존재하는 탭이면 활성화
            setActiveTab(existingTab.id);
            return existingTab;
        }
        
        // 새 탭 생성
        const newTab = {
            id: `tab-${++tabCounter.value}`,
            menuId: menuItem.id,
            parentMenuId: parentMenuItem?.id || null,
            title: menuItem.label,
            route: menuItem.route,
            icon: menuItem.icon,
            iconActive: menuItem.iconActive,
            iconColor: menuItem.iconColor,
            description: menuItem.description,
            permissions: menuItem.permissions,
            badgeCount: menuItem.badgeCount,
            isNew: menuItem.isNew,
            isDirty: false, // 변경사항 있는지 여부
            canClose: true, // 닫을 수 있는지 여부 (대시보드는 false)
            isLoading: false,
            createdAt: new Date(),
            lastAccessed: new Date()
        };
        
        // 대시보드 탭은 닫을 수 없음
        if (menuItem.id === 'dashboard') {
            newTab.canClose = false;
        }
        
        openTabs.value.push(newTab);
        setActiveTab(newTab.id);
        
        // 탭 히스토리에 추가
        addToHistory(newTab.id);
        
        // 로컬스토리지에 저장
        saveTabs();
        
        return newTab;
    };
    
    // 탭 닫기
    const closeTab = (tabId, force = false) => {
        const tabIndex = openTabs.value.findIndex(tab => tab.id === tabId);
        if (tabIndex === -1) return false;
        
        const tab = openTabs.value[tabIndex];
        
        // 닫을 수 없는 탭인지 확인
        if (!tab.canClose && !force) {
            return false;
        }
        
        // 변경사항이 있는 경우 확인
        if (tab.isDirty && !force) {
            // 실제 구현에서는 확인 다이얼로그 표시
            console.warn(`Tab ${tab.title} has unsaved changes`);
            return false;
        }
        
        // 현재 활성 탭이 닫히는 경우 다른 탭으로 전환
        if (activeTabId.value === tabId) {
            const nextActiveTab = findNextActiveTab(tabId);
            if (nextActiveTab) {
                setActiveTab(nextActiveTab.id);
                router.push(nextActiveTab.route);
            }
        }
        
        // 탭 제거
        openTabs.value.splice(tabIndex, 1);
        
        // 히스토리에서 제거
        removeFromHistory(tabId);
        
        // 로컬스토리지 업데이트
        saveTabs();
        
        return true;
    };
    
    // 모든 탭 닫기 (대시보드 제외)
    const closeAllTabs = (except = []) => {
        const tabsToClose = openTabs.value.filter(tab => 
            tab.canClose && !except.includes(tab.id)
        );
        
        tabsToClose.forEach(tab => closeTab(tab.id, true));
        
        // 대시보드 탭으로 이동
        const dashboardTab = openTabs.value.find(tab => !tab.canClose);
        if (dashboardTab) {
            setActiveTab(dashboardTab.id);
            router.push(dashboardTab.route);
        }
    };
    
    // 다른 탭 모두 닫기
    const closeOtherTabs = (keepTabId) => {
        const except = [keepTabId];
        // 닫을 수 없는 탭들도 제외
        const protectedTabs = openTabs.value
            .filter(tab => !tab.canClose)
            .map(tab => tab.id);
        
        closeAllTabs([...except, ...protectedTabs]);
    };
    
    // 활성 탭 설정
    const setActiveTab = (tabId) => {
        const tab = openTabs.value.find(t => t.id === tabId);
        if (!tab) return false;
        
        activeTabId.value = tabId;
        tab.lastAccessed = new Date();
        
        // 히스토리 업데이트
        addToHistory(tabId);
        
        // 로컬스토리지 저장
        savedActiveTab.value = tabId;
        
        return true;
    };
    
    // 다음 활성 탭 찾기
    const findNextActiveTab = (closingTabId) => {
        // 1. 히스토리에서 가장 최근 탭
        for (const historyTabId of tabHistory.value.slice().reverse()) {
            if (historyTabId !== closingTabId) {
                const tab = openTabs.value.find(t => t.id === historyTabId);
                if (tab) return tab;
            }
        }
        
        // 2. 오른쪽 탭
        const currentIndex = openTabs.value.findIndex(t => t.id === closingTabId);
        if (currentIndex < openTabs.value.length - 1) {
            return openTabs.value[currentIndex + 1];
        }
        
        // 3. 왼쪽 탭
        if (currentIndex > 0) {
            return openTabs.value[currentIndex - 1];
        }
        
        return null;
    };
    
    // 탭 히스토리 관리
    const addToHistory = (tabId) => {
        const index = tabHistory.value.indexOf(tabId);
        if (index > -1) {
            tabHistory.value.splice(index, 1);
        }
        tabHistory.value.push(tabId);
        
        // 히스토리 최대 10개로 제한
        if (tabHistory.value.length > 10) {
            tabHistory.value.shift();
        }
    };
    
    const removeFromHistory = (tabId) => {
        const index = tabHistory.value.indexOf(tabId);
        if (index > -1) {
            tabHistory.value.splice(index, 1);
        }
    };
    
    // 탭 순서 변경 (드래그 앤 드롭)
    const reorderTabs = (fromIndex, toIndex) => {
        const tab = openTabs.value.splice(fromIndex, 1)[0];
        openTabs.value.splice(toIndex, 0, tab);
        saveTabs();
    };
    
    // 탭 상태 업데이트
    const updateTabState = (tabId, updates) => {
        const tab = openTabs.value.find(t => t.id === tabId);
        if (tab) {
            Object.assign(tab, updates);
            saveTabs();
        }
    };
    
    // 탭 더티 상태 설정
    const setTabDirty = (tabId, isDirty = true) => {
        updateTabState(tabId, { isDirty });
    };
    
    // 탭 로딩 상태 설정
    const setTabLoading = (tabId, isLoading = true) => {
        updateTabState(tabId, { isLoading });
    };
    
    // 현재 라우트에 해당하는 탭 찾기
    const findTabByRoute = (routePath) => {
        return openTabs.value.find(tab => tab.route === routePath);
    };
    
    // 현재 활성 탭 정보
    const activeTab = computed(() => {
        return openTabs.value.find(tab => tab.id === activeTabId.value) || null;
    });
    
    // 탭 목록 (정렬된)
    const sortedTabs = computed(() => {
        return [...openTabs.value].sort((a, b) => {
            // 대시보드는 항상 첫 번째
            if (!a.canClose) return -1;
            if (!b.canClose) return 1;
            return 0;
        });
    });
    
    // 최근 탭 목록
    const recentTabs = computed(() => {
        const recent = tabHistory.value
            .slice(-5) // 최근 5개
            .reverse()
            .map(tabId => openTabs.value.find(tab => tab.id === tabId))
            .filter(Boolean);
        
        return recent;
    });
    
    // 로컬스토리지 저장
    const saveTabs = () => {
        const tabData = openTabs.value.map(tab => ({
            ...tab,
            // 함수나 복잡한 객체는 제외하고 직렬화
            createdAt: tab.createdAt?.toISOString(),
            lastAccessed: tab.lastAccessed?.toISOString()
        }));
        
        savedTabs.value = tabData;
    };
    
    // 로컬스토리지에서 복원
    const restoreTabs = () => {
        try {
            if (savedTabs.value && savedTabs.value.length > 0) {
                openTabs.value = savedTabs.value.map(tab => ({
                    ...tab,
                    createdAt: tab.createdAt ? new Date(tab.createdAt) : new Date(),
                    lastAccessed: tab.lastAccessed ? new Date(tab.lastAccessed) : new Date()
                }));
                
                // 탭 카운터 복원
                const maxId = Math.max(...openTabs.value.map(tab => 
                    parseInt(tab.id.replace('tab-', '')) || 0
                ));
                tabCounter.value = maxId;
            }
            
            if (savedActiveTab.value) {
                activeTabId.value = savedActiveTab.value;
            }
        } catch (error) {
            console.warn('Failed to restore tabs from localStorage:', error);
            // 복원 실패 시 초기화
            openTabs.value = [];
            activeTabId.value = null;
        }
    };
    
    // 탭 검색
    const searchTabs = (query) => {
        const lowerQuery = query.toLowerCase();
        return openTabs.value.filter(tab => 
            tab.title.toLowerCase().includes(lowerQuery) ||
            tab.description?.toLowerCase().includes(lowerQuery) ||
            tab.route.toLowerCase().includes(lowerQuery)
        );
    };
    
    // 키보드 단축키 처리
    const handleKeyboardShortcut = (event) => {
        // Ctrl/Cmd + W: 현재 탭 닫기
        if ((event.ctrlKey || event.metaKey) && event.key === 'w') {
            event.preventDefault();
            if (activeTabId.value) {
                closeTab(activeTabId.value);
            }
        }
        
        // Ctrl/Cmd + T: 새 탭 (대시보드)
        if ((event.ctrlKey || event.metaKey) && event.key === 't') {
            event.preventDefault();
            router.push('/');
        }
        
        // Ctrl/Cmd + 1-9: 탭 번호로 이동
        if ((event.ctrlKey || event.metaKey) && event.key >= '1' && event.key <= '9') {
            event.preventDefault();
            const index = parseInt(event.key) - 1;
            const tab = sortedTabs.value[index];
            if (tab) {
                setActiveTab(tab.id);
                router.push(tab.route);
            }
        }
    };
    
    // 라우터 변경 감지하여 탭 동기화
    watch(() => route.path, (newPath) => {
        const tab = findTabByRoute(newPath);
        if (tab && tab.id !== activeTabId.value) {
            setActiveTab(tab.id);
        }
    });
    
    // 컴포넌트 마운트 시 복원
    const initializeTabs = () => {
        restoreTabs();
        
        // 키보드 이벤트 리스너 등록
        if (typeof window !== 'undefined') {
            document.addEventListener('keydown', handleKeyboardShortcut);
        }
    };
    
    // 컴포넌트 언마운트 시 정리
    const cleanupTabs = () => {
        if (typeof window !== 'undefined') {
            document.removeEventListener('keydown', handleKeyboardShortcut);
        }
    };
    
    return {
        // 상태
        openTabs: computed(() => openTabs.value),
        activeTabId: computed(() => activeTabId.value),
        activeTab,
        sortedTabs,
        recentTabs,
        
        // 탭 관리
        createTab,
        closeTab,
        closeAllTabs,
        closeOtherTabs,
        setActiveTab,
        reorderTabs,
        
        // 탭 상태 업데이트
        updateTabState,
        setTabDirty,
        setTabLoading,
        
        // 유틸리티
        findTabByRoute,
        searchTabs,
        
        // 초기화/정리
        initializeTabs,
        cleanupTabs,
        
        // 수동 저장
        saveTabs,
        restoreTabs
    };
}

// 전역 탭 관리 인스턴스 (싱글톤 패턴)
let globalTabsInstance = null;

export function useGlobalTabs() {
    if (!globalTabsInstance) {
        globalTabsInstance = useTabs();
    }
    return globalTabsInstance;
}