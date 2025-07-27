# Orders Components

주문관리 모듈 컴포넌트 디렉토리

## 컴포넌트 구조

### Dashboard Components
- `OrdersDashboard.vue` - 주문 현황 대시보드
- `OrderKPICards.vue` - 주문 KPI (금일주문, 처리대기, 완료률)
- `OrderStatusChart.vue` - 주문 상태별 차트
- `RecentOrders.vue` - 최근 주문 목록

### Order Management
- `OrderList.vue` - 주문 목록 DataTable
- `OrderForm.vue` - 주문 등록/수정 폼
- `OrderDetail.vue` - 주문 상세 정보
- `OrderStatusBadge.vue` - 주문 상태 표시 Badge

### Order Processing
- `OrderAllocation.vue` - 재고 할당 관리
- `PickingList.vue` - 피킹 리스트
- `PackingSlip.vue` - 포장 전표
- `OrderTracking.vue` - 주문 추적

### Customer Management
- `CustomerSelect.vue` - 고객 선택 컴포넌트
- `CustomerInfo.vue` - 고객 정보 표시
- `DeliveryAddress.vue` - 배송지 정보

## 주문 상태 흐름

```
접수 → 확인 → 재고할당 → 피킹 → 포장 → 배송 → 완료
```

## 사용 예시

```vue
<template>
  <div class="orders-dashboard">
    <OrderKPICards />
    <OrderStatusChart />
    <RecentOrders />
  </div>
</template>

<script setup>
import OrderKPICards from '@/components/orders/OrderKPICards.vue'
import OrderStatusChart from '@/components/orders/OrderStatusChart.vue'
import RecentOrders from '@/components/orders/RecentOrders.vue'
</script>
```

## PrimeVue 컴포넌트 활용

- **Timeline** - 주문 처리 과정 표시
- **Tag** - 주문 상태 표시
- **Calendar** - 배송 예정일 선택
- **AutoComplete** - 고객/상품 검색
- **Panel** - 주문 정보 그룹화
- **Steps** - 주문 진행 단계
- **ConfirmDialog** - 주문 취소/변경 확인