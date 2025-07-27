import { computed, reactive, ref, onMounted, onUnmounted } from 'vue';

const layoutConfig = reactive({
    preset: 'Aura',
    primary: 'emerald',
    surface: null,
    darkTheme: false,
    menuMode: 'static'
});

const layoutState = reactive({
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
    activeMenuItem: null
});

// Responsive breakpoints
const BREAKPOINTS = {
    MOBILE: 768,
    TABLET: 1024
};

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);

export function useLayout() {
    const setActiveMenuItem = (item) => {
        layoutState.activeMenuItem = item.value || item;
    };

    const toggleDarkMode = () => {
        if (!document.startViewTransition) {
            executeDarkModeToggle();

            return;
        }

        document.startViewTransition(() => executeDarkModeToggle(event));
    };

    const executeDarkModeToggle = () => {
        layoutConfig.darkTheme = !layoutConfig.darkTheme;
        if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('app-dark');
        }
    };

    // Responsive helper functions
    const updateWindowWidth = () => {
        windowWidth.value = window.innerWidth;
    };

    // Responsive breakpoint computed properties
    const isMobile = computed(() => windowWidth.value < BREAKPOINTS.MOBILE);
    const isTablet = computed(() => windowWidth.value >= BREAKPOINTS.MOBILE && windowWidth.value < BREAKPOINTS.TABLET);
    const isDesktop = computed(() => windowWidth.value >= BREAKPOINTS.TABLET);
    
    // Device type computed
    const deviceType = computed(() => {
        if (isMobile.value) return 'mobile';
        if (isTablet.value) return 'tablet';
        return 'desktop';
    });

    const toggleMenu = () => {
        if (layoutConfig.menuMode === 'overlay') {
            layoutState.overlayMenuActive = !layoutState.overlayMenuActive;
        }

        if (isDesktop.value) {
            // Desktop: >= 1024px - Static sidebar with collapse functionality
            layoutState.staticMenuDesktopInactive = !layoutState.staticMenuDesktopInactive;
        } else {
            // Tablet & Mobile: < 1024px - Overlay mode
            layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive;
        }
    };

    const isSidebarActive = computed(() => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive);

    const isDarkTheme = computed(() => layoutConfig.darkTheme);

    const getPrimary = computed(() => layoutConfig.primary);

    const getSurface = computed(() => layoutConfig.surface);

    // Lifecycle hooks for window resize handling
    onMounted(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', updateWindowWidth);
        }
    });

    onUnmounted(() => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', updateWindowWidth);
        }
    });

    return {
        layoutConfig,
        layoutState,
        toggleMenu,
        isSidebarActive,
        isDarkTheme,
        getPrimary,
        getSurface,
        setActiveMenuItem,
        toggleDarkMode,
        // Responsive helpers
        isMobile,
        isTablet,
        isDesktop,
        deviceType,
        windowWidth
    };
}
