import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

// 로컬스토리지 키 상수
const STORAGE_KEYS = {
    SIDEBAR_COLLAPSED: 'logistics_sidebar_collapsed',
    DARK_MODE: 'logistics_dark_mode',
    THEME_COLOR: 'logistics_theme_color',
    LANGUAGE: 'logistics_language'
};

// 로컬스토리지 유틸리티 함수
const storage = {
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.warn(`로컬스토리지에서 ${key} 읽기 실패:`, error);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn(`로컬스토리지에 ${key} 저장 실패:`, error);
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn(`로컬스토리지에서 ${key} 삭제 실패:`, error);
        }
    }
};

export const useLayoutStore = defineStore('layout', () => {
    // === 사이드바 상태 ===
    const sidebarCollapsed = ref(storage.get(STORAGE_KEYS.SIDEBAR_COLLAPSED, false));
    const sidebarWidth = computed(() => sidebarCollapsed.value ? '60px' : '240px');
    
    // === 다크모드 상태 ===
    const isDarkMode = ref(storage.get(STORAGE_KEYS.DARK_MODE, false));
    
    // === 테마 색상 ===
    const themeColor = ref(storage.get(STORAGE_KEYS.THEME_COLOR, 'blue'));
    
    // === 언어 설정 ===
    const language = ref(storage.get(STORAGE_KEYS.LANGUAGE, 'ko'));
    
    // === 브레이크포인트 반응형 상태 ===
    const windowWidth = ref(window.innerWidth);
    const isMobile = computed(() => windowWidth.value < 768);
    const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024);
    const isDesktop = computed(() => windowWidth.value >= 1024);
    
    // === 자동 접기 상태 (모바일에서) ===
    const autoCollapsed = computed(() => {
        return isMobile.value ? true : sidebarCollapsed.value;
    });
    
    // === 실제 사이드바 너비 (반응형 고려) ===
    const actualSidebarWidth = computed(() => {
        if (isMobile.value) return '0px'; // 모바일에서는 오버레이
        return autoCollapsed.value ? '60px' : '240px';
    });
    
    // === CSS 클래스 계산 ===
    const cssClasses = computed(() => ({
        'app-dark': isDarkMode.value,
        'app-light': !isDarkMode.value,
        'sidebar-collapsed': autoCollapsed.value,
        'sidebar-expanded': !autoCollapsed.value,
        'mobile': isMobile.value,
        'tablet': isTablet.value,
        'desktop': isDesktop.value,
        [`theme-${themeColor.value}`]: true
    }));
    
    // === CSS 변수 ===
    const cssVariables = computed(() => ({
        '--sidebar-width': actualSidebarWidth.value,
        '--sidebar-collapsed-width': '60px',
        '--sidebar-expanded-width': '240px',
        '--header-height': '60px',
        '--transition-duration': '0.3s',
        '--border-radius': '6px',
        '--box-shadow': isDarkMode.value 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }));
    
    // === 액션: 사이드바 토글 ===
    const toggleSidebar = () => {
        if (!isMobile.value) {
            sidebarCollapsed.value = !sidebarCollapsed.value;
        }
    };
    
    // === 액션: 사이드바 설정 ===
    const setSidebarCollapsed = (collapsed) => {
        if (!isMobile.value) {
            sidebarCollapsed.value = collapsed;
        }
    };
    
    // === 액션: 다크모드 토글 ===
    const toggleDarkMode = () => {
        isDarkMode.value = !isDarkMode.value;
        applyThemeToDocument();
    };
    
    // === 액션: 다크모드 설정 ===
    const setDarkMode = (dark) => {
        isDarkMode.value = dark;
        applyThemeToDocument();
    };
    
    // === 액션: 테마 색상 변경 ===
    const setThemeColor = (color) => {
        themeColor.value = color;
        applyThemeToDocument();
    };
    
    // === 액션: 언어 변경 ===
    const setLanguage = (lang) => {
        language.value = lang;
    };
    
    // === 액션: 윈도우 크기 업데이트 ===
    const updateWindowWidth = () => {
        windowWidth.value = window.innerWidth;
    };
    
    // === 테마를 문서에 적용 ===
    const applyThemeToDocument = () => {
        const html = document.documentElement;
        
        // CSS 클래스 적용
        Object.entries(cssClasses.value).forEach(([className, shouldAdd]) => {
            if (shouldAdd) {
                html.classList.add(className);
            } else {
                html.classList.remove(className);
            }
        });
        
        // CSS 변수 적용
        Object.entries(cssVariables.value).forEach(([property, value]) => {
            html.style.setProperty(property, value);
        });
    };
    
    // === 설정 초기화 ===
    const resetSettings = () => {
        sidebarCollapsed.value = false;
        isDarkMode.value = false;
        themeColor.value = 'blue';
        language.value = 'ko';
        
        // 로컬스토리지 클리어
        Object.values(STORAGE_KEYS).forEach(key => {
            storage.remove(key);
        });
        
        applyThemeToDocument();
    };
    
    // === 설정 내보내기 ===
    const exportSettings = () => {
        return {
            sidebarCollapsed: sidebarCollapsed.value,
            isDarkMode: isDarkMode.value,
            themeColor: themeColor.value,
            language: language.value,
            timestamp: new Date().toISOString()
        };
    };
    
    // === 설정 가져오기 ===
    const importSettings = (settings) => {
        if (settings.hasOwnProperty('sidebarCollapsed')) {
            sidebarCollapsed.value = settings.sidebarCollapsed;
        }
        if (settings.hasOwnProperty('isDarkMode')) {
            isDarkMode.value = settings.isDarkMode;
        }
        if (settings.hasOwnProperty('themeColor')) {
            themeColor.value = settings.themeColor;
        }
        if (settings.hasOwnProperty('language')) {
            language.value = settings.language;
        }
        
        applyThemeToDocument();
    };
    
    // === 로컬스토리지 감시자 설정 ===
    watch(sidebarCollapsed, (newValue) => {
        storage.set(STORAGE_KEYS.SIDEBAR_COLLAPSED, newValue);
    });
    
    watch(isDarkMode, (newValue) => {
        storage.set(STORAGE_KEYS.DARK_MODE, newValue);
    });
    
    watch(themeColor, (newValue) => {
        storage.set(STORAGE_KEYS.THEME_COLOR, newValue);
    });
    
    watch(language, (newValue) => {
        storage.set(STORAGE_KEYS.LANGUAGE, newValue);
    });
    
    // === 윈도우 리사이즈 이벤트 리스너 ===
    let resizeHandler;
    
    const initializeResizeListener = () => {
        resizeHandler = () => updateWindowWidth();
        window.addEventListener('resize', resizeHandler);
        updateWindowWidth(); // 초기 크기 설정
    };
    
    const destroyResizeListener = () => {
        if (resizeHandler) {
            window.removeEventListener('resize', resizeHandler);
        }
    };
    
    // === 스토어 초기화 ===
    const initialize = () => {
        initializeResizeListener();
        applyThemeToDocument();
        
        // 시스템 다크모드 감지 (첫 방문시에만)
        if (!storage.get(STORAGE_KEYS.DARK_MODE)) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                setDarkMode(true);
            }
        }
    };
    
    // === 스토어 정리 ===
    const cleanup = () => {
        destroyResizeListener();
    };
    
    return {
        // 상태
        sidebarCollapsed,
        sidebarWidth,
        isDarkMode,
        themeColor,
        language,
        windowWidth,
        isMobile,
        isTablet,
        isDesktop,
        autoCollapsed,
        actualSidebarWidth,
        cssClasses,
        cssVariables,
        
        // 액션
        toggleSidebar,
        setSidebarCollapsed,
        toggleDarkMode,
        setDarkMode,
        setThemeColor,
        setLanguage,
        updateWindowWidth,
        applyThemeToDocument,
        resetSettings,
        exportSettings,
        importSettings,
        initialize,
        cleanup
    };
});