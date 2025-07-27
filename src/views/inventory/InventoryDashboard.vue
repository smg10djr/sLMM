<script setup>
import { ref, onMounted } from 'vue';

// KPI 데이터
const kpiData = ref({
    totalProducts: 1250,
    totalValue: 125000000,
    lowStockItems: 23,
    outOfStockItems: 5
});

// Mock 알림 데이터
const mockAlerts = ref([
    { id: 1, severity: 'warn', message: '삼성 Galaxy S24 재고 부족 (10개 남음)' },
    { id: 2, severity: 'error', message: 'iPhone 15 Pro 품절' },
    { id: 3, severity: 'info', message: '신규 상품 50개 입고 완료' }
]);

// Mock 거래 데이터
const mockTransactions = ref([
    { id: 1, date: '2025-01-26 14:30', type: '입고', productName: '삼성 Galaxy S24', quantity: 50, warehouse: '서울창고' },
    { id: 2, date: '2025-01-26 13:15', type: '출고', productName: 'iPhone 15 Pro', quantity: 25, warehouse: '서울창고' },
    { id: 3, date: '2025-01-26 11:45', type: '입고', productName: 'LG 그램 노트북', quantity: 30, warehouse: '부산창고' },
    { id: 4, date: '2025-01-26 10:20', type: '출고', productName: '에어팟 Pro', quantity: 100, warehouse: '서울창고' },
    { id: 5, date: '2025-01-26 09:30', type: '입고', productName: '갤럭시 워치', quantity: 75, warehouse: '대구창고' }
]);

// 숫자 포맷팅 함수
const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num);
};

// 데이터 새로고침
const refreshData = () => {
    console.log('데이터 새로고침');
    // 실제 구현 시 API 호출
};

onMounted(() => {
    console.log('재고 대시보드 마운트됨');
});
</script>

<template>
    <div class="inventory-dashboard">
        <!-- 페이지 헤더 -->
        <div class="page-header">
            <h1>재고 현황 대시보드</h1>
            <div class="header-actions">
                <Button icon="pi pi-refresh" label="새로고침" @click="refreshData" />
            </div>
        </div>

        <!-- KPI 카드 섹션 -->
        <div class="kpi-section">
            <div class="grid">
                <div class="col-12 md:col-6 lg:col-3">
                    <Card>
                        <template #content>
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="pi pi-box text-3xl text-blue-500"></i>
                                </div>
                                <div class="stat-content">
                                    <h3>총 상품수</h3>
                                    <p class="stat-value">{{ kpiData.totalProducts || 1250 }}</p>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>

                <div class="col-12 md:col-6 lg:col-3">
                    <Card>
                        <template #content>
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="pi pi-chart-line text-3xl text-green-500"></i>
                                </div>
                                <div class="stat-content">
                                    <h3>재고 가치</h3>
                                    <p class="stat-value">₩{{ formatNumber(kpiData.totalValue || 125000000) }}</p>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>

                <div class="col-12 md:col-6 lg:col-3">
                    <Card>
                        <template #content>
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="pi pi-exclamation-triangle text-3xl text-orange-500"></i>
                                </div>
                                <div class="stat-content">
                                    <h3>부족 재고</h3>
                                    <p class="stat-value">{{ kpiData.lowStockItems || 23 }}</p>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>

                <div class="col-12 md:col-6 lg:col-3">
                    <Card>
                        <template #content>
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="pi pi-times-circle text-3xl text-red-500"></i>
                                </div>
                                <div class="stat-content">
                                    <h3>품절 상품</h3>
                                    <p class="stat-value">{{ kpiData.outOfStockItems || 5 }}</p>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </div>

        <!-- 차트 섹션 -->
        <div class="chart-section">
            <div class="grid">
                <div class="col-12 lg:col-8">
                    <Card>
                        <template #title>재고 현황 차트</template>
                        <template #content>
                            <div class="chart-placeholder">
                                <p>Chart.js 재고 현황 차트가 여기에 표시됩니다.</p>
                                <p class="text-sm text-gray-500">Phase 5.1b에서 구현 예정</p>
                            </div>
                        </template>
                    </Card>
                </div>

                <div class="col-12 lg:col-4">
                    <Card>
                        <template #title>재고 알림</template>
                        <template #content>
                            <div class="alerts-list">
                                <Message v-for="alert in mockAlerts" :key="alert.id" :severity="alert.severity" :closable="false" class="mb-2">
                                    {{ alert.message }}
                                </Message>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </div>

        <!-- 최근 거래 섹션 -->
        <div class="transactions-section">
            <Card>
                <template #title>최근 입출고 이력</template>
                <template #content>
                    <DataTable :value="mockTransactions" :paginator="true" :rows="5" responsiveLayout="scroll">
                        <Column field="date" header="일시" sortable></Column>
                        <Column field="type" header="구분">
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.type" :severity="slotProps.data.type === '입고' ? 'success' : 'info'" />
                            </template>
                        </Column>
                        <Column field="productName" header="상품명" sortable></Column>
                        <Column field="quantity" header="수량" sortable></Column>
                        <Column field="warehouse" header="창고" sortable></Column>
                    </DataTable>
                </template>
            </Card>
        </div>
    </div>
</template>

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

.page-header h1 {
    margin: 0;
    color: var(--text-color);
}

.kpi-section,
.chart-section,
.transactions-section {
    margin-bottom: 2rem;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.stat-content h3 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: var(--text-color-secondary);
}

.stat-value {
    margin: 0;
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--text-color);
}

.chart-placeholder {
    padding: 2rem;
    text-align: center;
    background: var(--surface-100);
    border-radius: 6px;
    border: 2px dashed var(--surface-300);
}

.alerts-list {
    max-height: 300px;
    overflow-y: auto;
}
</style>
