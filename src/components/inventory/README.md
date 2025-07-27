# Inventory Components

재고관리 모듈 컴포넌트 디렉토리

## 컴포넌트 구조

### Dashboard Components
- `InventoryDashboard.vue` - 재고 현황 대시보드
- `KPICards.vue` - KPI 카드 위젯 (총 상품수, 재고가치, 부족재고)
- `InventoryChart.vue` - 재고 현황 차트 (Chart.js)
- `RecentTransactions.vue` - 최근 입출고 이력 테이블
- `AlertsList.vue` - 재고 알림 및 경고 목록

### Product Management
- `ProductList.vue` - 상품 목록 DataTable
- `ProductForm.vue` - 상품 등록/수정 Dialog 폼
- `ProductCard.vue` - 상품 카드 컴포넌트
- `CategorySelect.vue` - 카테고리 선택 Dropdown

### Inventory Operations
- `InventoryStatus.vue` - 재고 현황 테이블
- `StockAdjustment.vue` - 재고 조정 컴포넌트
- `TransactionHistory.vue` - 입출고 이력 조회
- `StockAlert.vue` - 재고 알림 설정

## 사용 예시

```vue
<template>
  <div class="inventory-dashboard">
    <KPICards />
    <InventoryChart />
    <RecentTransactions />
  </div>
</template>

<script setup>
import KPICards from '@/components/inventory/KPICards.vue'
import InventoryChart from '@/components/inventory/InventoryChart.vue'
import RecentTransactions from '@/components/inventory/RecentTransactions.vue'
</script>
```

## PrimeVue 컴포넌트 활용

- **Card** - KPI 위젯
- **Chart** - 재고 현황 차트
- **DataTable** - 상품 목록, 입출고 이력
- **Dialog** - 상품 등록/수정 폼
- **InputText, InputNumber** - 입력 필드
- **Dropdown** - 카테고리 선택
- **FileUpload** - 상품 이미지 업로드
- **Message** - 알림 표시