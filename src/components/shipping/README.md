# Shipping Components

배송관리 모듈 컴포넌트 디렉토리

## 컴포넌트 구조

### Dashboard Components
- `ShippingDashboard.vue` - 배송 현황 대시보드
- `ShippingKPICards.vue` - 배송 KPI (배송중, 완료, 지연)
- `DeliveryChart.vue` - 배송 현황 차트
- `RouteMap.vue` - 배송 경로 지도

### Shipment Management
- `ShipmentList.vue` - 배송 목록 DataTable
- `ShipmentForm.vue` - 배송 등록/수정 폼
- `ShipmentDetail.vue` - 배송 상세 정보
- `TrackingNumber.vue` - 송장번호 관리

### Route & Delivery
- `RouteOptimization.vue` - 배송 경로 최적화
- `DeliverySchedule.vue` - 배송 일정 관리
- `DriverAssignment.vue` - 배송기사 배정
- `VehicleManagement.vue` - 차량 관리

### Carrier Integration
- `CarrierSelect.vue` - 택배업체 선택
- `ShippingRates.vue` - 배송료 계산
- `TrackingStatus.vue` - 실시간 배송 추적
- `DeliveryConfirmation.vue` - 배송 완료 확인

## 배송 상태 흐름

```
배송준비 → 집하 → 간선수송 → 배송출발 → 배송중 → 배송완료
```

## 사용 예시

```vue
<template>
  <div class="shipping-dashboard">
    <ShippingKPICards />
    <DeliveryChart />
    <RouteMap />
  </div>
</template>

<script setup>
import ShippingKPICards from '@/components/shipping/ShippingKPICards.vue'
import DeliveryChart from '@/components/shipping/DeliveryChart.vue'
import RouteMap from '@/components/shipping/RouteMap.vue'
</script>
```

## 외부 API 연동

### 지도 서비스
- **Google Maps API** - 경로 최적화
- **Naver Maps API** - 한국 지역 배송

### 택배업체 API
- **우체국** - 등기소포 연동
- **CJ대한통운** - 택배 배송
- **한진택배** - 당일배송

## PrimeVue 컴포넌트 활용

- **GMap** - 배송 경로 지도 (확장)
- **Timeline** - 배송 진행 과정
- **ProgressBar** - 배송 진행률
- **Chip** - 배송 상태 표시
- **Rating** - 배송 만족도
- **Splitter** - 지도와 목록 분할
- **OverlayPanel** - 배송 상세 팝업