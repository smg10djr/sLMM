import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// 물류시스템 메뉴 구조 정의
const menuItems = ref([
    {
        id: 'dashboard',
        label: '대시보드',
        icon: '🏠',
        iconActive: '🏡',
        iconColor: '#3b82f6',
        route: '/',
        description: '전체 현황 및 KPI 확인',
        order: 1,
        permissions: ['read'],
        badgeCount: null,
        isNew: false
    },
    {
        id: 'inventory',
        label: '재고관리',
        icon: '📦',
        iconActive: '📋',
        iconColor: '#10b981',
        route: '/inventory',
        description: '재고 현황 및 입출고 관리',
        order: 2,
        permissions: ['read'],
        badgeCount: 3,
        isNew: false,
        children: [
            {
                id: 'inventory-overview',
                label: '재고 현황',
                icon: '📊',
                iconActive: '📈',
                iconColor: '#10b981',
                route: '/inventory/overview',
                description: '전체 재고 현황 대시보드',
                permissions: ['read'],
                badgeCount: null,
                isNew: false
            },
            {
                id: 'inventory-products',
                label: '상품 관리',
                icon: '🏷️',
                iconActive: '📦',
                iconColor: '#10b981',
                route: '/inventory/products',
                description: '상품 정보 및 카테고리 관리',
                permissions: ['read', 'write'],
                badgeCount: null,
                isNew: false
            },
            {
                id: 'inventory-transactions',
                label: '입출고 관리',
                icon: '📋',
                iconActive: '📝',
                iconColor: '#10b981',
                route: '/inventory/transactions',
                description: '입고, 출고, 이동 처리',
                permissions: ['read', 'write'],
                badgeCount: 5,
                isNew: false
            },
            {
                id: 'inventory-adjustments',
                label: '재고 조정',
                icon: '⚖️',
                iconActive: '🔧',
                iconColor: '#f59e0b',
                route: '/inventory/adjustments',
                description: '재고 수량 조정 및 이력',
                permissions: ['write', 'admin'],
                badgeCount: 2,
                isNew: false
            },
            {
                id: 'inventory-reports',
                label: '재고 리포트',
                icon: '📈',
                iconActive: '📊',
                iconColor: '#10b981',
                route: '/inventory/reports',
                description: '재고 분석 및 보고서',
                permissions: ['read'],
                badgeCount: null,
                isNew: false
            }
        ]
    },
    {
        id: 'orders',
        label: '주문관리',
        icon: '🛒',
        iconActive: '🛍️',
        iconColor: '#8b5cf6',
        route: '/orders',
        description: '주문 접수 및 처리 관리',
        order: 3,
        permissions: ['read'],
        badgeCount: 12,
        isNew: false,
        children: [
            {
                id: 'orders-overview',
                label: '주문 현황',
                icon: '📊',
                iconActive: '📈',
                iconColor: '#8b5cf6',
                route: '/orders/overview',
                description: '주문 처리 현황 대시보드',
                permissions: ['read'],
                badgeCount: null,
                isNew: false
            },
            {
                id: 'orders-list',
                label: '주문 목록',
                icon: '📋',
                iconActive: '📝',
                iconColor: '#8b5cf6',
                route: '/orders/list',
                description: '전체 주문 목록 및 검색',
                permissions: ['read'],
                badgeCount: null,
                isNew: false
            },
            {
                id: 'orders-processing',
                label: '주문 처리',
                icon: '⚡',
                iconActive: '🔥',
                iconColor: '#f59e0b',
                route: '/orders/processing',
                description: '주문 확인 및 처리',
                permissions: ['read', 'write'],
                badgeCount: 8,
                isNew: false
            },
            {
                id: 'orders-returns',
                label: '반품 관리',
                icon: '↩️',
                iconActive: '🔄',
                iconColor: '#ef4444',
                route: '/orders/returns',
                description: '반품 접수 및 처리',
                permissions: ['read', 'write'],
                badgeCount: 3,
                isNew: false
            },
            {
                id: 'orders-analytics',
                label: '주문 분석',
                icon: '📈',
                iconActive: '📊',
                iconColor: '#8b5cf6',
                route: '/orders/analytics',
                description: '주문 패턴 및 통계 분석',
                permissions: ['read'],
                badgeCount: null,
                isNew: false
            }
        ]
    },
    {
        id: 'shipping',
        label: '배송관리',
        icon: '🚚',
        iconActive: '🚛',
        iconColor: '#06b6d4',
        route: '/shipping',
        description: '배송 계획 및 추적 관리',
        order: 4,
        permissions: ['read'],
        badgeCount: 7,
        isNew: false,
        children: [
            {
                id: 'shipping-overview',
                label: '배송 현황',
                icon: '📊',
                iconActive: '📈',
                iconColor: '#06b6d4',
                route: '/shipping/overview',
                description: '배송 진행 현황 대시보드',
                permissions: ['read'],
                badgeCount: null,
                isNew: false
            },
            {
                id: 'shipping-planning',
                label: '배송 계획',
                icon: '🗓️',
                iconActive: '📅',
                iconColor: '#06b6d4',
                route: '/shipping/planning',
                description: '배송 일정 및 루트 계획',
                permissions: ['read', 'write'],
                badgeCount: null,
                isNew: false
            },
            {
                id: 'shipping-tracking',
                label: '배송 추적',
                icon: '🔍',
                iconActive: '📍',
                iconColor: '#06b6d4',
                route: '/shipping/tracking',
                description: '실시간 배송 상태 추적',
                permissions: ['read'],
                badgeCount: 15,
                isNew: false
            },
            {
                id: 'shipping-carriers',
                label: '운송업체 관리',
                icon: '🏢',
                iconActive: '🏭',
                iconColor: '#06b6d4',
                route: '/shipping/carriers',
                description: '운송업체 정보 및 요율 관리',
                permissions: ['read', 'write'],
                badgeCount: null,
                isNew: false
            },
            {
                id: 'shipping-reports',
                label: '배송 리포트',
                icon: '📈',
                iconActive: '📊',
                iconColor: '#06b6d4',
                route: '/shipping/reports',
                description: '배송 성과 및 분석 리포트',
                permissions: ['read'],
                badgeCount: null,
                isNew: false
            }
        ]
    },
    {
        id: 'warehouse',
        label: '창고관리',
        icon: '🏪',
        iconActive: '🏬',
        iconColor: '#84cc16',
        route: '/warehouse',
        description: '창고 운영 및 관리',
        order: 5,
        permissions: ['read'],
        badgeCount: 4,
        isNew: false,
        children: [
            {
                id: 'warehouse-overview',
                label: '창고 현황',
                icon: '📊',
                iconActive: '📈',
                iconColor: '#84cc16',
                route: '/warehouse/overview',
                description: '창고별 현황 및 가동률',
                permissions: ['read'],
                badgeCount: null,
                isNew: false
            },
            {
                id: 'warehouse-locations',
                label: '위치 관리',
                icon: '📍',
                iconActive: '🗺️',
                iconColor: '#84cc16',
                route: '/warehouse/locations',
                description: '창고 내 위치 및 구역 관리',
                permissions: ['read', 'write'],
                badgeCount: null,
                isNew: false
            },
            {
                id: 'warehouse-operations',
                label: '작업 관리',
                icon: '⚙️',
                iconActive: '🔧',
                iconColor: '#84cc16',
                route: '/warehouse/operations',
                description: '피킹, 패킹 작업 관리',
                permissions: ['read', 'write'],
                badgeCount: 6,
                isNew: false
            },
            {
                id: 'warehouse-equipment',
                label: '장비 관리',
                icon: '🏗️',
                iconActive: '🚜',
                iconColor: '#84cc16',
                route: '/warehouse/equipment',
                description: '창고 장비 및 설비 관리',
                permissions: ['read', 'write'],
                badgeCount: 1,
                isNew: true
            },
            {
                id: 'warehouse-staff',
                label: '인력 관리',
                icon: '👥',
                iconActive: '👷',
                iconColor: '#84cc16',
                route: '/warehouse/staff',
                description: '창고 작업자 및 시프트 관리',
                permissions: ['read', 'admin'],
                badgeCount: null,
                isNew: false
            }
        ]
    },
    {
        id: 'reports',
        label: '리포트',
        icon: '📊',
        iconActive: '📈',
        iconColor: '#f97316',
        route: '/reports',
        description: '통합 분석 및 보고서',
        order: 6,
        permissions: ['read'],
        badgeCount: null,
        isNew: false,
        children: [
            {
                id: 'reports-dashboard',
                label: '통합 대시보드',
                icon: '📋',
                iconActive: '📊',
                iconColor: '#f97316',
                route: '/reports/dashboard',
                description: '전체 시스템 통합 대시보드',
                permissions: ['read'],
                badgeCount: null,
                isNew: false
            },
            {
                id: 'reports-kpi',
                label: 'KPI 분석',
                icon: '🎯',
                iconActive: '📈',
                iconColor: '#f97316',
                route: '/reports/kpi',
                description: '핵심 성과 지표 분석',
                permissions: ['read'],
                badgeCount: null,
                isNew: false
            },
            {
                id: 'reports-custom',
                label: '사용자 정의',
                icon: '🔧',
                iconActive: '⚙️',
                iconColor: '#f97316',
                route: '/reports/custom',
                description: '사용자 정의 리포트 생성',
                permissions: ['read', 'write'],
                badgeCount: null,
                isNew: true
            },
            {
                id: 'reports-exports',
                label: '데이터 내보내기',
                icon: '📤',
                iconActive: '💾',
                iconColor: '#f97316',
                route: '/reports/exports',
                description: 'Excel, PDF 데이터 내보내기',
                permissions: ['read'],
                badgeCount: null,
                isNew: false
            }
        ]
    },
    {
        id: 'settings',
        label: '시스템 설정',
        icon: '⚙️',
        iconActive: '🔧',
        iconColor: '#6b7280',
        route: '/settings',
        description: '시스템 설정 및 관리',
        order: 7,
        permissions: ['admin'],
        badgeCount: null,
        isNew: false,
        children: [
            {
                id: 'settings-users',
                label: '사용자 관리',
                icon: '👤',
                iconActive: '👥',
                iconColor: '#6b7280',
                route: '/settings/users',
                description: '사용자 계정 및 권한 관리',
                permissions: ['admin'],
                badgeCount: null,
                isNew: false
            },
            {
                id: 'settings-system',
                label: '시스템 설정',
                icon: '🖥️',
                iconActive: '💻',
                iconColor: '#6b7280',
                route: '/settings/system',
                description: '시스템 전반 설정',
                permissions: ['admin'],
                badgeCount: null,
                isNew: false
            },
            {
                id: 'settings-integrations',
                label: '연동 설정',
                icon: '🔗',
                iconActive: '🔌',
                iconColor: '#6b7280',
                route: '/settings/integrations',
                description: '외부 시스템 연동 설정',
                permissions: ['admin'],
                badgeCount: null,
                isNew: false
            },
            {
                id: 'settings-backup',
                label: '백업 관리',
                icon: '💾',
                iconActive: '🗄️',
                iconColor: '#6b7280',
                route: '/settings/backup',
                description: '데이터 백업 및 복원',
                permissions: ['admin'],
                badgeCount: null,
                isNew: false
            }
        ]
    }
]);

// 사용자 권한 (실제로는 인증 스토어에서 가져와야 함)
const userPermissions = ref(['read', 'write', 'admin']);

export function useMenu() {
    const router = useRouter();
    const route = useRoute();
    
    // 권한에 따른 메뉴 필터링
    const filteredMenuItems = computed(() => {
        return menuItems.value.filter(item => {
            // 메뉴 권한 체크
            const hasPermission = item.permissions.some(permission => 
                userPermissions.value.includes(permission)
            );
            
            if (!hasPermission) return false;
            
            // 자식 메뉴 필터링
            if (item.children) {
                item.children = item.children.filter(child => 
                    child.permissions.some(permission => 
                        userPermissions.value.includes(permission)
                    )
                );
            }
            
            return true;
        });
    });
    
    // 현재 활성 메뉴 확인
    const isMenuActive = (menuItem) => {
        if (menuItem.route === route.path) return true;
        
        // 자식 메뉴 체크
        if (menuItem.children) {
            return menuItem.children.some(child => child.route === route.path);
        }
        
        return false;
    };
    
    // 메뉴 클릭 핸들러
    const handleMenuClick = (menuItem) => {
        if (menuItem.route) {
            router.push(menuItem.route);
        }
    };
    
    // 메뉴 상태 관리
    const expandedMenus = ref(new Set());
    
    const toggleMenuExpanded = (menuId) => {
        if (expandedMenus.value.has(menuId)) {
            expandedMenus.value.delete(menuId);
        } else {
            expandedMenus.value.add(menuId);
        }
    };
    
    const isMenuExpanded = (menuId) => {
        return expandedMenus.value.has(menuId);
    };
    
    // 현재 활성 메뉴의 부모 메뉴 자동 확장
    const autoExpandActiveMenu = () => {
        filteredMenuItems.value.forEach(item => {
            if (item.children) {
                const hasActiveChild = item.children.some(child => 
                    child.route === route.path
                );
                if (hasActiveChild) {
                    expandedMenus.value.add(item.id);
                }
            }
        });
    };
    
    // 브레드크럼 생성
    const breadcrumbs = computed(() => {
        const crumbs = [];
        
        for (const item of filteredMenuItems.value) {
            if (item.route === route.path) {
                crumbs.push(item);
                break;
            }
            
            if (item.children) {
                for (const child of item.children) {
                    if (child.route === route.path) {
                        crumbs.push(item);
                        crumbs.push(child);
                        break;
                    }
                }
            }
        }
        
        return crumbs;
    });
    
    return {
        menuItems: filteredMenuItems,
        isMenuActive,
        handleMenuClick,
        expandedMenus,
        toggleMenuExpanded,
        isMenuExpanded,
        autoExpandActiveMenu,
        breadcrumbs,
        userPermissions
    };
}