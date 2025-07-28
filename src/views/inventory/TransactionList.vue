<template>
    <div class="transaction-list">
        <div class="page-header">
            <h1>📋 입출고 관리</h1>
            <p>재고 입출고 내역을 관리하세요</p>
        </div>
        
        <div class="action-buttons">
            <button class="btn-primary">📥 입고 등록</button>
            <button class="btn-secondary">📤 출고 등록</button>
        </div>
        
        <div class="content-section">
            <h2>최근 입출고 내역</h2>
            <div class="transaction-table">
                <div class="table-header">
                    <span>구분</span>
                    <span>상품명</span>
                    <span>수량</span>
                    <span>일시</span>
                    <span>담당자</span>
                </div>
                <div class="table-row">
                    <span class="type in">입고</span>
                    <span>삼성 갤럭시 S24</span>
                    <span>+50개</span>
                    <span>2024-07-28 15:30</span>
                    <span>김재고</span>
                </div>
                <div class="table-row">
                    <span class="type out">출고</span>
                    <span>아이폰 15 Pro</span>
                    <span>-25개</span>
                    <span>2024-07-28 14:15</span>
                    <span>이창고</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
    console.log('입출고 관리 페이지 로드됨');
});
</script>

<style scoped>
.transaction-list {
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
    background: #3b82f6;
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
    margin: 0 0 1.5rem 0;
    color: #1f2937;
    font-size: 1.25rem;
}

.transaction-table {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.table-header {
    display: grid;
    grid-template-columns: 80px 1fr 100px 150px 100px;
    gap: 1rem;
    padding: 0.75rem;
    background: #f3f4f6;
    border-radius: 0.5rem;
    font-weight: 600;
    color: #374151;
}

.table-row {
    display: grid;
    grid-template-columns: 80px 1fr 100px 150px 100px;
    gap: 1rem;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 0.5rem;
    align-items: center;
}

.type {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-align: center;
}

.type.in {
    background: #dcfce7;
    color: #166534;
}

.type.out {
    background: #fee2e2;
    color: #991b1b;
}
</style>