<template>
    <div class="adjustment-list">
        <div class="page-header">
            <h1>⚖️ 재고 조정</h1>
            <p>재고 수량 조정 및 이력을 관리하세요</p>
        </div>
        
        <div class="action-buttons">
            <button class="btn-primary">➕ 재고 조정</button>
            <button class="btn-secondary">📊 조정 이력</button>
        </div>
        
        <div class="content-section">
            <h2>최근 재고 조정</h2>
            <p class="warning">⚠️ 재고 조정은 신중하게 진행해주세요. 모든 조정 내역은 로그로 기록됩니다.</p>
            
            <div class="adjustment-table">
                <div class="table-header">
                    <span>상품명</span>
                    <span>조정 전</span>
                    <span>조정 후</span>
                    <span>차이</span>
                    <span>사유</span>
                    <span>일시</span>
                </div>
                <div class="table-row">
                    <span>아이폰 15 Pro</span>
                    <span>100개</span>
                    <span>98개</span>
                    <span class="negative">-2개</span>
                    <span>실사 조정</span>
                    <span>2024-07-28 14:00</span>
                </div>
                <div class="table-row">
                    <span>갤럭시 버즈</span>
                    <span>45개</span>
                    <span>50개</span>
                    <span class="positive">+5개</span>
                    <span>누락 발견</span>
                    <span>2024-07-28 13:30</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
    console.log('재고 조정 페이지 로드됨');
});
</script>

<style scoped>
.adjustment-list {
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

.action-buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
}

.btn-primary {
    background: #f59e0b;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 500;
}

.btn-secondary {
    background: #6b7280;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 500;
}

.content-section {
    background: white;
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.content-section h2 {
    margin: 0 0 1rem 0;
    color: #1f2937;
    font-size: 1.25rem;
}

.warning {
    background: #fef3c7;
    color: #92400e;
    padding: 0.75rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid #f59e0b;
}

.adjustment-table {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.table-header {
    display: grid;
    grid-template-columns: 1fr 100px 100px 80px 120px 150px;
    gap: 1rem;
    padding: 0.75rem;
    background: #f3f4f6;
    border-radius: 0.5rem;
    font-weight: 600;
    color: #374151;
}

.table-row {
    display: grid;
    grid-template-columns: 1fr 100px 100px 80px 120px 150px;
    gap: 1rem;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 0.5rem;
    align-items: center;
}

.positive {
    color: #10b981;
    font-weight: 600;
}

.negative {
    color: #ef4444;
    font-weight: 600;
}
</style>