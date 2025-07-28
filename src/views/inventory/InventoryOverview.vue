<template>
    <div class="inventory-overview">
        <div class="page-header">
            <h1>📊 재고 현황</h1>
            <p>전체 재고 현황을 한눈에 확인하세요</p>
        </div>
        
        <div class="overview-cards">
            <div class="overview-card">
                <div class="card-icon">📦</div>
                <div class="card-content">
                    <h3>총 상품수</h3>
                    <div class="card-value">1,234</div>
                    <div class="card-change positive">+5.2%</div>
                </div>
            </div>
            
            <div class="overview-card">
                <div class="card-icon">📈</div>
                <div class="card-content">
                    <h3>총 재고가치</h3>
                    <div class="card-value">₩2,345,678,900</div>
                    <div class="card-change positive">+12.8%</div>
                </div>
            </div>
            
            <div class="overview-card">
                <div class="card-icon">⚠️</div>
                <div class="card-content">
                    <h3>부족 재고</h3>
                    <div class="card-value">23</div>
                    <div class="card-change negative">+2개</div>
                </div>
            </div>
            
            <div class="overview-card">
                <div class="card-icon">🔄</div>
                <div class="card-content">
                    <h3>금일 입출고</h3>
                    <div class="card-value">156건</div>
                    <div class="card-change positive">+8.4%</div>
                </div>
            </div>
        </div>
        
        <div class="content-section">
            <h2>📋 최근 재고 변동</h2>
            <div class="recent-transactions">
                <div class="transaction-item">
                    <span class="transaction-type in">입고</span>
                    <span class="transaction-product">삼성 갤럭시 S24</span>
                    <span class="transaction-quantity">+50개</span>
                    <span class="transaction-time">2시간 전</span>
                </div>
                <div class="transaction-item">
                    <span class="transaction-type out">출고</span>
                    <span class="transaction-product">아이폰 15 Pro</span>
                    <span class="transaction-quantity">-25개</span>
                    <span class="transaction-time">3시간 전</span>
                </div>
                <div class="transaction-item">
                    <span class="transaction-type in">입고</span>
                    <span class="transaction-product">LG 그램 노트북</span>
                    <span class="transaction-quantity">+30개</span>
                    <span class="transaction-time">5시간 전</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
    console.log('재고 현황 페이지 로드됨');
});
</script>

<style scoped>
.inventory-overview {
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

.overview-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.overview-card {
    background: white;
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
}

.card-icon {
    font-size: 2.5rem;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    border-radius: 0.75rem;
}

.card-content {
    flex: 1;
}

.card-content h3 {
    margin: 0 0 0.5rem 0;
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
}

.card-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.25rem;
}

.card-change {
    font-size: 0.75rem;
    font-weight: 600;
}

.card-change.positive {
    color: #10b981;
}

.card-change.negative {
    color: #ef4444;
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

.recent-transactions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.transaction-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 0.5rem;
}

.transaction-type {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 60px;
    text-align: center;
}

.transaction-type.in {
    background: #dcfce7;
    color: #166534;
}

.transaction-type.out {
    background: #fee2e2;
    color: #991b1b;
}

.transaction-product {
    flex: 1;
    font-weight: 500;
    color: #1f2937;
}

.transaction-quantity {
    font-weight: 600;
    color: #4b5563;
}

.transaction-time {
    color: #6b7280;
    font-size: 0.875rem;
}

/* 다크모드 지원 */
@media (prefers-color-scheme: dark) {
    .inventory-overview {
        color: #f9fafb;
    }
    
    .page-header h1 {
        color: #f9fafb;
    }
    
    .overview-card,
    .content-section {
        background: #374151;
    }
    
    .card-value {
        color: #f9fafb;
    }
    
    .content-section h2 {
        color: #f9fafb;
    }
    
    .transaction-item {
        background: #4b5563;
    }
    
    .transaction-product {
        color: #f9fafb;
    }
}
</style>