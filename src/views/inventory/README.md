# Inventory Views

재고관리 페이지 컴포넌트 디렉토리

## 페이지 구조

### Dashboard
- `InventoryDashboard.vue` - 재고 현황 메인 대시보드

### Product Management
- `ProductList.vue` - 상품 목록 관리 페이지
- `ProductDetail.vue` - 상품 상세 정보 페이지

### Inventory Operations
- `InventoryStatus.vue` - 재고 현황 조회 페이지
- `StockAdjustment.vue` - 재고 조정 페이지
- `TransactionHistory.vue` - 입출고 이력 페이지

### Reports
- `InventoryReport.vue` - 재고 분석 리포트 페이지

## 라우트 매핑

```javascript
// router/inventory.js
export const inventoryRoutes = [
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
  {
    path: '/inventory/products/:id',
    name: 'inventory-product-detail',
    component: () => import('@/views/inventory/ProductDetail.vue'),
    meta: { 
      title: '상품 상세',
      requiresAuth: true 
    }
  },
  {
    path: '/inventory/status',
    name: 'inventory-status',
    component: () => import('@/views/inventory/InventoryStatus.vue'),
    meta: { 
      title: '재고 현황',
      icon: 'pi pi-list',
      requiresAuth: true 
    }
  },
  {
    path: '/inventory/adjustment',
    name: 'inventory-adjustment',
    component: () => import('@/views/inventory/StockAdjustment.vue'),
    meta: { 
      title: '재고 조정',
      icon: 'pi pi-pencil',
      requiresAuth: true 
    }
  },
  {
    path: '/inventory/transactions',
    name: 'inventory-transactions',
    component: () => import('@/views/inventory/TransactionHistory.vue'),
    meta: { 
      title: '입출고 이력',
      icon: 'pi pi-history',
      requiresAuth: true 
    }
  }
]
```

## 페이지 템플릿 예시

```vue
<!-- views/inventory/InventoryDashboard.vue -->
<template>
  <div class="inventory-dashboard">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <h1>재고 현황 대시보드</h1>
      <div class="header-actions">
        <Button 
          icon="pi pi-refresh" 
          label="새로고침"
          @click="refreshData"
        />
      </div>
    </div>

    <!-- KPI 카드 섹션 -->
    <div class="kpi-section">
      <KPICards :data="kpiData" />
    </div>

    <!-- 차트 섹션 -->
    <div class="chart-section">
      <div class="grid">
        <div class="col-12 lg:col-8">
          <InventoryChart :data="chartData" />
        </div>
        <div class="col-12 lg:col-4">
          <AlertsList :alerts="alerts" />
        </div>
      </div>
    </div>

    <!-- 최근 거래 섹션 -->
    <div class="transactions-section">
      <RecentTransactions :transactions="recentTransactions" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { services } from '@/service/logistics'
import KPICards from '@/components/inventory/KPICards.vue'
import InventoryChart from '@/components/inventory/InventoryChart.vue'
import AlertsList from '@/components/inventory/AlertsList.vue'
import RecentTransactions from '@/components/inventory/RecentTransactions.vue'

const kpiData = ref({})
const chartData = ref({})
const alerts = ref([])
const recentTransactions = ref([])

const loadDashboardData = async () => {
  try {
    const [kpi, chart, alertsData, transactions] = await Promise.all([
      services.inventory.getKPIData(),
      services.inventory.getInventoryChart(),
      services.inventory.getAlerts(),
      services.inventory.getRecentTransactions()
    ])

    kpiData.value = kpi.data
    chartData.value = chart.data
    alerts.value = alertsData.data
    recentTransactions.value = transactions.data
  } catch (error) {
    console.error('대시보드 데이터 로드 실패:', error)
  }
}

const refreshData = () => {
  loadDashboardData()
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.inventory-dashboard {
  padding: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.kpi-section,
.chart-section,
.transactions-section {
  margin-bottom: 2rem;
}
</style>
```