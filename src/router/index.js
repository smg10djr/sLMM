import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: {
                        title: '대시보드',
                        description: '전체 시스템 현황과 주요 KPI를 확인하세요',
                        icon: '🏠',
                        requiresAuth: false,
                        showPageHeader: true,
                        actions: [
                            {
                                id: 'refresh',
                                label: '새로고침',
                                icon: '🔄',
                                variant: 'secondary',
                                type: 'function',
                                tooltip: '대시보드 데이터를 새로고침합니다',
                                handler: () => window.location.reload()
                            },
                            {
                                id: 'export',
                                label: '내보내기',
                                icon: '📥',
                                variant: 'primary',
                                type: 'function',
                                tooltip: '대시보드 데이터를 Excel로 내보냅니다',
                                handler: () => console.log('Dashboard export initiated')
                            }
                        ]
                    }
                },
                // UIKit 페이지들 임시 비활성화 (PrimeVue cx 오류 해결 후 재활성화)
                // {
                //     path: '/uikit/formlayout',
                //     name: 'formlayout',
                //     component: () => import('@/views/uikit/FormLayout.vue')
                // },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue'),
                    meta: {
                        title: '개발 예정',
                        description: '이 페이지는 현재 개발 중입니다',
                        icon: '🚧',
                        requiresAuth: false,
                        showPageHeader: true,
                        actions: [
                            {
                                id: 'back',
                                label: '뒤로 가기',
                                icon: '←',
                                variant: 'secondary',
                                type: 'function',
                                tooltip: '이전 페이지로 돌아갑니다',
                                handler: () => history.back()
                            },
                            {
                                id: 'home',
                                label: '홈으로',
                                icon: '🏠',
                                variant: 'primary',
                                type: 'navigation',
                                tooltip: '대시보드로 이동합니다',
                                route: '/'
                            }
                        ]
                    }
                },
                // 임시 비활성화
                // {
                //     path: '/pages/crud',
                //     name: 'crud',
                //     component: () => import('@/views/pages/Crud.vue')
                // },
                // {
                //     path: '/documentation',
                //     name: 'documentation',
                //     component: () => import('@/views/pages/Documentation.vue')
                // },
                // 물류시스템 라우트
                {
                    path: '/inventory',
                    name: 'inventory',
                    redirect: '/inventory/overview'
                },
                {
                    path: '/inventory/overview',
                    name: 'inventory-overview',
                    component: () => import('@/views/inventory/InventoryOverview.vue'),
                    meta: {
                        title: '재고 현황',
                        description: '전체 재고 현황과 통계를 한눈에 확인하세요',
                        icon: '📊',
                        requiresAuth: true,
                        showPageHeader: true,
                        actions: [
                            {
                                id: 'refresh',
                                label: '새로고침',
                                icon: '🔄',
                                variant: 'secondary',
                                type: 'function',
                                tooltip: '재고 데이터를 새로고침합니다',
                                handler: () => console.log('Inventory refresh')
                            },
                            {
                                id: 'report',
                                label: '리포트',
                                icon: '📋',
                                variant: 'primary',
                                type: 'navigation',
                                tooltip: '상세 재고 리포트를 확인합니다',
                                route: '/inventory/reports'
                            }
                        ]
                    }
                },
                {
                    path: '/inventory/products',
                    name: 'inventory-products',
                    component: () => import('@/views/inventory/ProductList.vue'),
                    meta: {
                        title: '상품 관리',
                        description: '상품 정보를 등록, 수정, 삭제하고 카테고리를 관리하세요',
                        icon: '🏷️',
                        requiresAuth: true,
                        showPageHeader: true,
                        actions: [
                            {
                                id: 'add-product',
                                label: '상품 추가',
                                icon: '➕',
                                variant: 'primary',
                                type: 'function',
                                tooltip: '새로운 상품을 등록합니다',
                                handler: () => console.log('Add product modal')
                            },
                            {
                                id: 'import',
                                label: '일괄 업로드',
                                icon: '📥',
                                variant: 'secondary',
                                type: 'function',
                                tooltip: 'Excel 파일로 상품을 일괄 등록합니다',
                                handler: () => console.log('Import products')
                            }
                        ]
                    }
                },
                {
                    path: '/inventory/transactions',
                    name: 'inventory-transactions',
                    component: () => import('@/views/inventory/TransactionList.vue'),
                    meta: {
                        title: '입출고 관리',
                        icon: '📋',
                        requiresAuth: true
                    }
                },
                {
                    path: '/inventory/adjustments',
                    name: 'inventory-adjustments',
                    component: () => import('@/views/inventory/AdjustmentList.vue'),
                    meta: {
                        title: '재고 조정',
                        icon: '⚖️',
                        requiresAuth: true
                    }
                },
                {
                    path: '/inventory/reports',
                    name: 'inventory-reports',
                    component: () => import('@/views/inventory/InventoryReports.vue'),
                    meta: {
                        title: '재고 리포트',
                        icon: '📈',
                        requiresAuth: true
                    }
                },
                // 향후 구현 예정 라우트 (placeholder)
                {
                    path: '/orders',
                    name: 'orders',
                    redirect: '/pages/empty',
                    meta: {
                        title: '주문 관리',
                        icon: 'pi pi-shopping-cart',
                        requiresAuth: true
                    }
                },
                {
                    path: '/shipping',
                    name: 'shipping',
                    redirect: '/pages/empty',
                    meta: {
                        title: '배송 관리',
                        icon: 'pi pi-truck',
                        requiresAuth: true
                    }
                },
                {
                    path: '/warehouse',
                    name: 'warehouse',
                    redirect: '/pages/empty',
                    meta: {
                        title: '창고 관리',
                        icon: 'pi pi-building',
                        requiresAuth: true
                    }
                }
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

export default router;
