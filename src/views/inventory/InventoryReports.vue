<template>
    <div class="inventory-reports">
        <div class="page-header">
            <h1>📈 재고 리포트</h1>
            <p>재고 분석 및 보고서를 확인하세요</p>
        </div>
        
        <div class="report-cards">
            <div class="report-card">
                <div class="card-header">
                    <h3>📊 재고 회전율</h3>
                    <span class="period">이번 달</span>
                </div>
                <div class="card-value">2.3회</div>
                <div class="card-description">평균보다 +0.5회 높음</div>
            </div>
            
            <div class="report-card">
                <div class="card-header">
                    <h3>💰 재고 가치</h3>
                    <span class="period">현재</span>
                </div>
                <div class="card-value">₩23억</div>
                <div class="card-description">전월 대비 +12.5% 증가</div>
            </div>
            
            <div class="report-card">
                <div class="card-header">
                    <h3>⚠️ 리스크 재고</h3>
                    <span class="period">현재</span>
                </div>
                <div class="card-value">15개 상품</div>
                <div class="card-description">장기 체류 재고 관리 필요</div>
            </div>
        </div>
        
        <div class="content-section">
            <h2>📈 상위 10개 상품 분석</h2>
            <div class="product-analysis">
                <div class="analysis-header">
                    <span>순위</span>
                    <span>상품명</span>
                    <span>재고 수량</span>
                    <span>재고 가치</span>
                    <span>회전율</span>
                    <span>상태</span>
                </div>
                <div class="analysis-row">
                    <span class="rank">1</span>
                    <span>아이폰 15 Pro</span>
                    <span>98개</span>
                    <span>₩147,000,000</span>
                    <span>3.2회</span>
                    <span class="status good">양호</span>
                </div>
                <div class="analysis-row">
                    <span class="rank">2</span>
                    <span>삼성 갤럭시 S24</span>
                    <span>150개</span>
                    <span>₩135,000,000</span>
                    <span>2.8회</span>
                    <span class="status good">양호</span>
                </div>
                <div class="analysis-row">
                    <span class="rank">3</span>
                    <span>맥북 프로 14인치</span>
                    <span>25개</span>
                    <span>₩87,500,000</span>
                    <span>1.5회</span>
                    <span class="status warning">주의</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
    console.log('재고 리포트 페이지 로드됨');
});
</script>

<style scoped>
.inventory-reports {
    padding: 1rem;
}

.page-header {
    margin-bottom: 2rem;
}

.page-header h1 {
    margin: 0 0 0.5rem 0;
    color: #1f2937;
    font-size: 2rem;
}

.page-header p {
    margin: 0;
    color: #6b7280;
}

.report-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.report-card {
    background: white;
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.card-header h3 {
    margin: 0;
    font-size: 1rem;
    color: #1f2937;
}

.period {
    background: #e5e7eb;
    color: #374151;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
}

.card-value {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.5rem;
}

.card-description {
    color: #6b7280;
    font-size: 0.875rem;
}

.content-section {
    background: white;
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.content-section h2 {
    margin: 0 0 1.5rem 0;
    color: #1f2937;
    font-size: 1.25rem;
}

.product-analysis {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.analysis-header {
    display: grid;
    grid-template-columns: 60px 1fr 100px 140px 80px 80px;
    gap: 1rem;
    padding: 0.75rem;
    background: #f3f4f6;
    border-radius: 0.5rem;
    font-weight: 600;
    color: #374151;
}

.analysis-row {
    display: grid;
    grid-template-columns: 60px 1fr 100px 140px 80px 80px;
    gap: 1rem;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 0.5rem;
    align-items: center;
}

.rank {
    background: #3b82f6;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
}

.status {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-align: center;
}

.status.good {
    background: #dcfce7;
    color: #166534;
}

.status.warning {
    background: #fef3c7;
    color: #92400e;
}
</style>