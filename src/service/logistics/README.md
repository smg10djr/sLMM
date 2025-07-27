# Logistics Services

물류시스템 API 서비스 레이어 디렉토리

## 서비스 구조

### Core Services
- `inventoryService.js` - 재고관리 API
- `ordersService.js` - 주문관리 API  
- `shippingService.js` - 배송관리 API
- `warehouseService.js` - 창고관리 API

### Common Services
- `apiClient.js` - API 클라이언트 설정
- `mockData.js` - Mock 데이터 관리
- `errorHandler.js` - 에러 처리 공통 로직

## API 서비스 패턴

```javascript
// service/logistics/inventoryService.js
import { apiClient } from './apiClient'

export const inventoryService = {
  // 상품 관리
  async getProducts(params = {}) {
    const response = await apiClient.get('/api/v1/products', { params })
    return response.data
  },

  async getProduct(id) {
    const response = await apiClient.get(`/api/v1/products/${id}`)
    return response.data
  },

  async createProduct(product) {
    const response = await apiClient.post('/api/v1/products', product)
    return response.data
  },

  async updateProduct(id, product) {
    const response = await apiClient.put(`/api/v1/products/${id}`, product)
    return response.data
  },

  async deleteProduct(id) {
    const response = await apiClient.delete(`/api/v1/products/${id}`)
    return response.data
  },

  // 재고 관리
  async getInventory(params = {}) {
    const response = await apiClient.get('/api/v1/inventory', { params })
    return response.data
  },

  async adjustStock(productId, adjustment) {
    const response = await apiClient.post(`/api/v1/inventory/${productId}/adjust`, adjustment)
    return response.data
  },

  async getStockHistory(productId, params = {}) {
    const response = await apiClient.get(`/api/v1/inventory/${productId}/history`, { params })
    return response.data
  },

  // 대시보드 KPI
  async getKPIData() {
    const response = await apiClient.get('/api/v1/inventory/kpi')
    return response.data
  },

  async getInventoryChart(period = '7d') {
    const response = await apiClient.get(`/api/v1/inventory/chart?period=${period}`)
    return response.data
  }
}
```

## Mock 데이터 서비스

```javascript
// service/logistics/mockData.js
import { delay } from '@/utils/delay'

export const mockInventoryService = {
  async getProducts(params = {}) {
    await delay(300) // 네트워크 지연 시뮬레이션
    
    return {
      success: true,
      data: {
        items: [
          {
            id: 1,
            code: 'PRD-001',
            name: '삼성 Galaxy S24',
            category: '스마트폰',
            price: 1200000,
            stock: 150,
            status: 'active',
            minStock: 20,
            maxStock: 500
          },
          // ... 더 많은 Mock 데이터
        ],
        total: 1250,
        page: params.page || 1,
        pageSize: params.pageSize || 25
      },
      message: 'Success'
    }
  },

  async getKPIData() {
    await delay(200)
    
    return {
      success: true,
      data: {
        totalProducts: 1250,
        totalValue: 125000000,
        lowStockItems: 23,
        outOfStockItems: 5,
        turnoverRate: 85.5
      }
    }
  }
}
```

## API 클라이언트 설정

```javascript
// service/logistics/apiClient.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// 환경별 API URL
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 요청 인터셉터 - JWT 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const authStore = useAuthStore()
    
    if (error.response?.status === 401) {
      authStore.logout()
      window.location.href = '/auth/login'
    }
    
    return Promise.reject(error)
  }
)
```

## 환경별 서비스 선택

```javascript
// service/logistics/index.js
import { inventoryService } from './inventoryService'
import { mockInventoryService } from './mockData'

// 개발 환경에서는 Mock 서비스 사용
const isDevelopment = import.meta.env.VITE_USE_MOCK_API === 'true'

export const services = {
  inventory: isDevelopment ? mockInventoryService : inventoryService,
  // orders: isDevelopment ? mockOrdersService : ordersService,
  // shipping: isDevelopment ? mockShippingService : shippingService,
  // warehouse: isDevelopment ? mockWarehouseService : warehouseService
}

// 컴포넌트에서 사용
// import { services } from '@/service/logistics'
// const products = await services.inventory.getProducts()
```

## 에러 처리

```javascript
// service/logistics/errorHandler.js
export const handleApiError = (error) => {
  if (error.response) {
    // 서버에서 응답한 에러
    const { status, data } = error.response
    
    switch (status) {
      case 400:
        return '잘못된 요청입니다.'
      case 401:
        return '인증이 필요합니다.'
      case 403:
        return '권한이 없습니다.'
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.'
      case 500:
        return '서버 내부 오류가 발생했습니다.'
      default:
        return data?.message || '알 수 없는 오류가 발생했습니다.'
    }
  } else if (error.request) {
    // 네트워크 오류
    return '네트워크 연결을 확인해주세요.'
  } else {
    // 기타 오류
    return error.message || '오류가 발생했습니다.'
  }
}
```