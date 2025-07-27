<script setup>
import { ref, computed, onMounted } from 'vue';

// 반응형 데이터
const loading = ref(false);
const searchQuery = ref('');
const selectedCategory = ref(null);
const selectedStatus = ref(null);
const selectedProducts = ref([]);
const showAddDialog = ref(false);
const pageSize = ref(25);

// 필터 옵션
const categories = ref([
    { name: '스마트폰', value: '스마트폰' },
    { name: '노트북', value: '노트북' },
    { name: '태블릿', value: '태블릿' },
    { name: '액세서리', value: '액세서리' }
]);

const statusOptions = ref([
    { name: '활성', value: 'active' },
    { name: '비활성', value: 'inactive' }
]);

// Mock 상품 데이터
const mockProducts = ref([
    {
        id: 1,
        code: 'PRD-001',
        name: '삼성 Galaxy S24',
        category: '스마트폰',
        price: 1200000,
        stock: 150,
        minStock: 20,
        status: 'active',
        image: null
    },
    {
        id: 2,
        code: 'PRD-002',
        name: 'iPhone 15 Pro',
        category: '스마트폰',
        price: 1500000,
        stock: 5,
        minStock: 20,
        status: 'active',
        image: null
    },
    {
        id: 3,
        code: 'PRD-003',
        name: 'LG 그램 노트북',
        category: '노트북',
        price: 1800000,
        stock: 75,
        minStock: 10,
        status: 'active',
        image: null
    },
    {
        id: 4,
        code: 'PRD-004',
        name: '에어팟 Pro',
        category: '액세서리',
        price: 300000,
        stock: 0,
        minStock: 50,
        status: 'inactive',
        image: null
    }
]);

// 필터된 상품 목록
const filteredProducts = computed(() => {
    let filtered = mockProducts.value;

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter((product) => product.name.toLowerCase().includes(query) || product.code.toLowerCase().includes(query));
    }

    if (selectedCategory.value) {
        filtered = filtered.filter((product) => product.category === selectedCategory.value);
    }

    if (selectedStatus.value) {
        filtered = filtered.filter((product) => product.status === selectedStatus.value);
    }

    return filtered;
});

// 총 레코드 수 (computed로 분리)
const totalRecords = computed(() => filteredProducts.value.length);

// 유틸리티 함수
const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num);
};

const getStockSeverity = (stock, minStock) => {
    if (stock === 0) return 'danger';
    if (stock <= minStock) return 'warn';
    return 'success';
};

// 이벤트 핸들러
const onSearch = () => {
    // 검색 로직 (이미 computed에서 처리됨)
};

const onFilter = () => {
    // 필터 로직 (이미 computed에서 처리됨)
};

const resetFilters = () => {
    searchQuery.value = '';
    selectedCategory.value = null;
    selectedStatus.value = null;
};

const onPage = (event) => {
    console.log('페이지 변경:', event);
};

const onSort = (event) => {
    console.log('정렬 변경:', event);
};

// 액션 함수
const viewProduct = (product) => {
    console.log('상품 상세보기:', product);
};

const editProduct = (product) => {
    console.log('상품 수정:', product);
};

const copyProduct = (product) => {
    console.log('상품 복사:', product);
};

const deleteProduct = (product) => {
    console.log('상품 삭제:', product);
};

const confirmDelete = () => {
    console.log('선택된 상품 삭제:', selectedProducts.value);
};

const exportExcel = () => {
    console.log('엑셀 다운로드');
};

const saveProduct = () => {
    console.log('상품 저장');
    showAddDialog.value = false;
};

onMounted(() => {
    console.log('상품 목록 페이지 마운트됨');
});
</script>

<template>
    <div class="product-list">
        <!-- 페이지 헤더 -->
        <div class="page-header">
            <h1>상품 관리</h1>
            <div class="header-actions">
                <Button icon="pi pi-plus" label="상품 등록" @click="showAddDialog = true" />
            </div>
        </div>

        <!-- 검색 및 필터 섹션 -->
        <Card class="search-section">
            <template #content>
                <div class="grid">
                    <div class="col-12 md:col-4">
                        <div class="p-inputgroup">
                            <InputText v-model="searchQuery" placeholder="상품명 또는 상품코드 검색" @input="onSearch" />
                            <Button icon="pi pi-search" />
                        </div>
                    </div>
                    <div class="col-12 md:col-3">
                        <Dropdown v-model="selectedCategory" :options="categories" optionLabel="name" optionValue="value" placeholder="카테고리 선택" showClear @change="onFilter" />
                    </div>
                    <div class="col-12 md:col-3">
                        <Dropdown v-model="selectedStatus" :options="statusOptions" optionLabel="name" optionValue="value" placeholder="상태 선택" showClear @change="onFilter" />
                    </div>
                    <div class="col-12 md:col-2">
                        <Button label="초기화" icon="pi pi-refresh" severity="secondary" @click="resetFilters" />
                    </div>
                </div>
            </template>
        </Card>

        <!-- 상품 목록 테이블 -->
        <Card class="table-section">
            <template #content>
                <DataTable
                    v-model:selection="selectedProducts"
                    :value="filteredProducts"
                    :paginator="true"
                    :rows="pageSize"
                    :rowsPerPageOptions="[25, 50, 100]"
                    :totalRecords="totalRecords"
                    :loading="loading"
                    dataKey="id"
                    responsiveLayout="scroll"
                    selectionMode="multiple"
                    @page="onPage"
                    @sort="onSort"
                >
                    <template #header>
                        <div class="table-header">
                            <div class="table-header-left">
                                <span>총 {{ totalRecords }}개 상품</span>
                                <Button v-if="selectedProducts.length > 0" :label="`선택된 ${selectedProducts.length}개 삭제`" icon="pi pi-trash" severity="danger" size="small" @click="confirmDelete" />
                            </div>
                            <div class="table-header-right">
                                <Button icon="pi pi-download" label="엑셀 다운로드" severity="secondary" @click="exportExcel" />
                            </div>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    <Column field="code" header="상품코드" sortable>
                        <template #body="slotProps">
                            <span class="font-bold">{{ slotProps.data.code }}</span>
                        </template>
                    </Column>
                    <Column field="name" header="상품명" sortable>
                        <template #body="slotProps">
                            <div class="product-name">
                                <img v-if="slotProps.data.image" :src="slotProps.data.image" :alt="slotProps.data.name" class="product-image" />
                                <span>{{ slotProps.data.name }}</span>
                            </div>
                        </template>
                    </Column>
                    <Column field="category" header="카테고리" sortable></Column>
                    <Column field="price" header="판매가" sortable>
                        <template #body="slotProps">
                            <span class="font-semibold">₩{{ formatNumber(slotProps.data.price) }}</span>
                        </template>
                    </Column>
                    <Column field="stock" header="재고수량" sortable>
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.stock" :severity="getStockSeverity(slotProps.data.stock, slotProps.data.minStock)" />
                        </template>
                    </Column>
                    <Column field="status" header="상태" sortable>
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.status === 'active' ? '활성' : '비활성'" :severity="slotProps.data.status === 'active' ? 'success' : 'danger'" />
                        </template>
                    </Column>
                    <Column header="액션" bodyStyle="text-align: center">
                        <template #body="slotProps">
                            <div class="action-buttons">
                                <Button icon="pi pi-eye" size="small" severity="info" @click="viewProduct(slotProps.data)" v-tooltip="'상세보기'" />
                                <Button icon="pi pi-pencil" size="small" severity="secondary" @click="editProduct(slotProps.data)" v-tooltip="'수정'" />
                                <Button icon="pi pi-copy" size="small" severity="help" @click="copyProduct(slotProps.data)" v-tooltip="'복사'" />
                                <Button icon="pi pi-trash" size="small" severity="danger" @click="deleteProduct(slotProps.data)" v-tooltip="'삭제'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>

        <!-- 상품 등록/수정 다이얼로그 -->
        <Dialog v-model:visible="showAddDialog" :style="{ width: '600px' }" header="상품 등록" :modal="true">
            <div class="product-form">
                <p class="text-gray-600 mb-4">새로운 상품 정보를 입력해주세요.</p>
                <div class="form-placeholder">
                    <p>상품 등록 폼이 여기에 표시됩니다.</p>
                    <p class="text-sm text-gray-500">Phase 5.3에서 구현 예정</p>
                </div>
            </div>
            <template #footer>
                <Button label="취소" icon="pi pi-times" @click="showAddDialog = false" />
                <Button label="저장" icon="pi pi-check" @click="saveProduct" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.product-list {
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

.search-section,
.table-section {
    margin-bottom: 2rem;
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.table-header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.product-name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.product-image {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    object-fit: cover;
}

.action-buttons {
    display: flex;
    gap: 0.25rem;
}

.form-placeholder {
    padding: 2rem;
    text-align: center;
    background: var(--surface-100);
    border-radius: 6px;
    border: 2px dashed var(--surface-300);
}
</style>
