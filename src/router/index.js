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
                    component: () => import('@/views/Dashboard.vue')
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
                    component: () => import('@/views/pages/Empty.vue')
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
                    redirect: '/inventory/dashboard'
                },
                {
                    path: '/inventory/dashboard',
                    name: 'inventory-dashboard',
                    component: () => import('@/views/inventory/InventoryDashboard.vue'),
                    meta: {
                        title: '재고 현황',
                        icon: 'pi pi-chart-bar',
                        requiresAuth: true
                    }
                },
                {
                    path: '/inventory/products',
                    name: 'inventory-products',
                    component: () => import('@/views/inventory/ProductList.vue'),
                    meta: {
                        title: '상품 관리',
                        icon: 'pi pi-box',
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
