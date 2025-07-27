# Warehouse Components

창고관리 모듈 컴포넌트 디렉토리

## 컴포넌트 구조

### Dashboard Components
- `WarehouseDashboard.vue` - 창고 운영 대시보드
- `WarehouseKPICards.vue` - 창고 KPI (가동률, 정확도, 효율성)
- `CapacityChart.vue` - 창고 용량 차트
- `WorkloadChart.vue` - 작업량 분석

### Warehouse Management
- `WarehouseList.vue` - 창고 목록 관리
- `WarehouseForm.vue` - 창고 등록/수정 폼
- `WarehouseLayout.vue` - 창고 레이아웃 관리
- `ZoneManagement.vue` - 구역 관리

### Location Management
- `LocationList.vue` - 위치 목록 DataTable
- `LocationForm.vue` - 위치 등록/수정 폼
- `LocationMap.vue` - 창고 내 위치 맵
- `BarcodeScanner.vue` - 바코드 스캐너 (향후 확장)

### Operations
- `ReceivingOperations.vue` - 입고 작업 관리
- `PutawayOperations.vue` - 보관 작업 관리
- `PickingOperations.vue` - 피킹 작업 관리
- `CycleCount.vue` - 순환 재고조사

### Equipment & Staff
- `EquipmentManagement.vue` - 장비 관리
- `StaffAssignment.vue` - 직원 배정
- `WorkQueue.vue` - 작업 대기열
- `PerformanceMetrics.vue` - 작업 성과 지표

## 위치 코드 체계

```
창고코드-구역-통로-선반-위치
예: WH01-A-01-03-05
```

## 사용 예시

```vue
<template>
  <div class="warehouse-dashboard">
    <WarehouseKPICards />
    <CapacityChart />
    <LocationMap />
  </div>
</template>

<script setup>
import WarehouseKPICards from '@/components/warehouse/WarehouseKPICards.vue'
import CapacityChart from '@/components/warehouse/CapacityChart.vue'
import LocationMap from '@/components/warehouse/LocationMap.vue'
</script>
```

## 고도화 계획

### 3D 창고 맵 (향후)
- **Three.js** 활용한 3D 시각화
- 실시간 재고 위치 표시
- 경로 최적화 시각화

### IoT 센서 연동 (선택사항)
- 온습도 센서 데이터
- 중량 센서 연동
- RFID 태그 추적

## PrimeVue 컴포넌트 활용

- **TreeTable** - 계층적 위치 구조
- **OrganizationChart** - 창고 조직도
- **Galleria** - 창고 사진 갤러리
- **Carousel** - 장비 이미지 슬라이드
- **Fieldset** - 구역별 정보 그룹화
- **Divider** - 섹션 구분
- **ScrollPanel** - 긴 목록 스크롤