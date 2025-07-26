# API 명세서 (API Specification)

## 📋 문서 정보
- **프로젝트**: 통합 물류관리 시스템 (Integrated Logistics Management System)
- **문서 버전**: v1.0
- **작성일**: 2025년 7월 26일
- **작성자**: 물류IT팀
- **검토자**: 시스템 아키텍트

---

## 📚 목차
1. [API 개요](#1-api-개요)
2. [인증 및 권한](#2-인증-및-권한)
3. [공통 응답 형식](#3-공통-응답-형식)
4. [재고관리 API](#4-재고관리-api)
5. [사용자 관리 API](#5-사용자-관리-api)
6. [주문관리 API](#6-주문관리-api)
7. [배송관리 API](#7-배송관리-api)
8. [창고관리 API](#8-창고관리-api)
9. [리포트 API](#9-리포트-api)
10. [에러 코드](#10-에러-코드)

---

## 1. API 개요

### 1.1 기본 정보
- **Base URL**: `https://api.logistics.company.com/v1`
- **Protocol**: HTTPS
- **Content-Type**: `application/json`
- **Character Encoding**: UTF-8
- **API Version**: v1

### 1.2 API 설계 원칙
- **RESTful Architecture**: HTTP 메서드를 활용한 리소스 기반 설계
- **Stateless**: 상태 비저장 방식으로 확장성 보장
- **Resource-Oriented**: 명사 기반 URI 설계
- **HTTP Status Codes**: 표준 HTTP 상태 코드 활용
- **Pagination**: 대용량 데이터 조회 시 페이징 적용
- **Filtering & Sorting**: 쿼리 파라미터를 통한 필터링 및 정렬

### 1.3 API 네이밍 규칙
```
GET    /api/v1/{resource}              # 목록 조회
GET    /api/v1/{resource}/{id}         # 단건 조회
POST   /api/v1/{resource}              # 생성
PUT    /api/v1/{resource}/{id}         # 전체 수정
PATCH  /api/v1/{resource}/{id}         # 부분 수정
DELETE /api/v1/{resource}/{id}         # 삭제

# 하위 리소스
GET    /api/v1/{resource}/{id}/{sub-resource}

# 액션 기반 API (예외적 경우)
POST   /api/v1/{resource}/{id}/actions/{action-name}
```

### 1.4 HTTP 메서드 사용 규칙
| 메서드 | 용도 | 멱등성 | 안전성 |
|--------|------|--------|--------|
| GET | 조회 | O | O |
| POST | 생성, 액션 | X | X |
| PUT | 전체 수정 | O | X |
| PATCH | 부분 수정 | X | X |
| DELETE | 삭제 | O | X |

---

## 2. 인증 및 권한

### 2.1 JWT 토큰 기반 인증
```http
Authorization: Bearer {JWT_TOKEN}
```

### 2.2 인증 플로우
```
1. POST /api/v1/auth/login     → JWT Token 발급
2. 이후 모든 API 호출 시 헤더에 토큰 포함
3. 토큰 만료 시 → POST /api/v1/auth/refresh
4. 로그아웃 → POST /api/v1/auth/logout
```

### 2.3 권한 체계 (RBAC)
| 역할 | 권한 범위 | 설명 |
|------|-----------|------|
| **SYSTEM_ADMIN** | 전체 시스템 | 시스템 관리자 |
| **WAREHOUSE_MANAGER** | 창고/재고 관리 | 창고 관리자 |
| **ORDER_MANAGER** | 주문/배송 관리 | 주문 담당자 |
| **GENERAL_USER** | 제한적 조회/입력 | 일반 사용자 |
| **REPORT_VIEWER** | 리포트 조회 | 리포트 조회자 |

---

## 3. 공통 응답 형식

### 3.1 성공 응답
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    // 실제 응답 데이터
  },
  "timestamp": "2025-07-26T10:30:00Z"
}
```

### 3.2 에러 응답
```json
{
  "success": false,
  "message": "에러 메시지",
  "error": {
    "code": "ERROR_CODE",
    "details": "상세 에러 정보",
    "field": "에러 발생 필드 (유효성 검증 에러 시)"
  },
  "timestamp": "2025-07-26T10:30:00Z"
}
```

### 3.3 페이징 응답
```json
{
  "success": true,
  "message": "조회 성공",
  "data": {
    "content": [
      // 실제 데이터 배열
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "totalElements": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrevious": false
    }
  },
  "timestamp": "2025-07-26T10:30:00Z"
}
```

### 3.4 공통 쿼리 파라미터
| 파라미터 | 타입 | 설명 | 기본값 |
|----------|------|------|--------|
| `page` | integer | 페이지 번호 (1부터 시작) | 1 |
| `size` | integer | 페이지 크기 (1-100) | 20 |
| `sort` | string | 정렬 기준 (예: name,asc) | - |
| `search` | string | 검색 키워드 | - |

---

## 4. 재고관리 API

### 4.1 상품 관리 API

#### 4.1.1 상품 목록 조회
```http
GET /api/v1/products
```

**Request Parameters:**
| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|----------|------|------|------|--------|
| page | integer | N | 페이지 번호 | 1 |
| size | integer | N | 페이지 크기 | 20 |
| search | string | N | 상품명/코드 검색 | - |
| categoryId | integer | N | 카테고리 필터 | - |
| isActive | boolean | N | 활성 상태 필터 | true |
| sort | string | N | 정렬 (name,asc/desc) | name,asc |

**Response:**
```json
{
  "success": true,
  "message": "상품 목록 조회 성공",
  "data": {
    "content": [
      {
        "productId": 1,
        "productCode": "PRD001",
        "productName": "스마트폰 갤럭시 S24",
        "categoryId": 1,
        "categoryName": "전자제품",
        "unitPrice": 1200000.00,
        "costPrice": 900000.00,
        "weight": 0.168,
        "dimensions": {
          "length": 14.7,
          "width": 7.1,
          "height": 0.79
        },
        "unitOfMeasure": "EA",
        "barcode": "8801234567890",
        "minStockLevel": 10,
        "maxStockLevel": 100,
        "reorderPoint": 20,
        "isActive": true,
        "createdAt": "2025-07-26T10:00:00Z",
        "updatedAt": "2025-07-26T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "totalElements": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrevious": false
    }
  },
  "timestamp": "2025-07-26T10:30:00Z"
}
```

#### 4.1.2 상품 상세 조회
```http
GET /api/v1/products/{productId}
```

**Path Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| productId | integer | Y | 상품 ID |

**Response:**
```json
{
  "success": true,
  "message": "상품 상세 조회 성공",
  "data": {
    "productId": 1,
    "productCode": "PRD001",
    "productName": "스마트폰 갤럭시 S24",
    "category": {
      "categoryId": 1,
      "categoryCode": "ELEC",
      "categoryName": "전자제품"
    },
    "description": "삼성 갤럭시 S24 스마트폰 256GB",
    "unitPrice": 1200000.00,
    "costPrice": 900000.00,
    "weight": 0.168,
    "dimensions": {
      "length": 14.7,
      "width": 7.1,
      "height": 0.79
    },
    "unitOfMeasure": "EA",
    "barcode": "8801234567890",
    "qrCode": "QR_PRD001_2025",
    "stockLevels": {
      "minStockLevel": 10,
      "maxStockLevel": 100,
      "reorderPoint": 20
    },
    "shelfLifeDays": null,
    "storageTemperature": {
      "min": null,
      "max": null
    },
    "isSerialized": true,
    "isBatchTracked": false,
    "suppliers": [
      {
        "supplierId": 1,
        "supplierName": "삼성전자",
        "supplierProductCode": "SM-S926N",
        "isPrimary": true,
        "leadTimeDays": 7,
        "minOrderQuantity": 1
      }
    ],
    "isActive": true,
    "createdAt": "2025-07-26T10:00:00Z",
    "updatedAt": "2025-07-26T10:00:00Z"
  },
  "timestamp": "2025-07-26T10:30:00Z"
}
```

#### 4.1.3 상품 등록
```http
POST /api/v1/products
```

**Required Permission:** `INVENTORY_CREATE`

**Request Body:**
```json
{
  "productCode": "PRD002",
  "productName": "아이폰 15 Pro",
  "categoryId": 1,
  "description": "애플 아이폰 15 Pro 256GB",
  "unitPrice": 1500000.00,
  "costPrice": 1200000.00,
  "weight": 0.187,
  "dimensions": {
    "length": 14.67,
    "width": 7.09,
    "height": 0.82
  },
  "unitOfMeasure": "EA",
  "barcode": "0194253404118",
  "stockLevels": {
    "minStockLevel": 5,
    "maxStockLevel": 50,
    "reorderPoint": 10
  },
  "isSerialized": true,
  "isBatchTracked": false,
  "suppliers": [
    {
      "supplierId": 2,
      "supplierProductCode": "APPLE-IP15P-256",
      "isPrimary": true,
      "leadTimeDays": 14,
      "minOrderQuantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "상품이 성공적으로 등록되었습니다.",
  "data": {
    "productId": 2,
    "productCode": "PRD002",
    "message": "상품 등록 완료"
  },
  "timestamp": "2025-07-26T10:30:00Z"
}
```

#### 4.1.4 상품 수정
```http
PUT /api/v1/products/{productId}
```

**Required Permission:** `INVENTORY_UPDATE`

**Request Body:** (상품 등록과 동일, 모든 필드 포함)

#### 4.1.5 상품 부분 수정
```http
PATCH /api/v1/products/{productId}
```

**Required Permission:** `INVENTORY_UPDATE`

**Request Body:**
```json
{
  "unitPrice": 1400000.00,
  "stockLevels": {
    "minStockLevel": 8,
    "reorderPoint": 15
  }
}
```

#### 4.1.6 상품 삭제 (비활성화)
```http
DELETE /api/v1/products/{productId}
```

**Required Permission:** `INVENTORY_DELETE`

**Response:**
```json
{
  "success": true,
  "message": "상품이 성공적으로 삭제되었습니다.",
  "data": {
    "productId": 2,
    "isActive": false
  },
  "timestamp": "2025-07-26T10:30:00Z"
}
```

### 4.2 카테고리 관리 API

#### 4.2.1 카테고리 목록 조회
```http
GET /api/v1/categories
```

**Request Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| parentId | integer | N | 상위 카테고리 ID (루트는 null) |
| isActive | boolean | N | 활성 상태 필터 |

**Response:**
```json
{
  "success": true,
  "message": "카테고리 목록 조회 성공",
  "data": [
    {
      "categoryId": 1,
      "categoryCode": "ELEC",
      "categoryName": "전자제품",
      "parentCategoryId": null,
      "description": "스마트폰, 태블릿, 노트북 등",
      "sortOrder": 1,
      "isActive": true,
      "children": [
        {
          "categoryId": 11,
          "categoryCode": "SMARTPHONE",
          "categoryName": "스마트폰",
          "parentCategoryId": 1,
          "sortOrder": 1,
          "isActive": true
        }
      ]
    }
  ],
  "timestamp": "2025-07-26T10:30:00Z"
}
```

#### 4.2.2 카테고리 등록
```http
POST /api/v1/categories
```

**Request Body:**
```json
{
  "categoryCode": "LAPTOP",
  "categoryName": "노트북",
  "parentCategoryId": 1,
  "description": "노트북 컴퓨터",
  "sortOrder": 3
}
```

### 4.3 재고 현황 API

#### 4.3.1 재고 현황 조회
```http
GET /api/v1/inventory
```

**Request Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| warehouseId | integer | N | 창고 필터 |
| productId | integer | N | 상품 필터 |
| categoryId | integer | N | 카테고리 필터 |
| status | string | N | 재고 상태 (AVAILABLE, RESERVED, etc.) |
| lowStock | boolean | N | 부족 재고만 조회 |
| search | string | N | 상품명/코드 검색 |

**Response:**
```json
{
  "success": true,
  "message": "재고 현황 조회 성공",
  "data": {
    "content": [
      {
        "inventoryId": 1,
        "product": {
          "productId": 1,
          "productCode": "PRD001",
          "productName": "스마트폰 갤럭시 S24",
          "unitOfMeasure": "EA"
        },
        "warehouse": {
          "warehouseId": 1,
          "warehouseCode": "WH001",
          "warehouseName": "서울 메인창고"
        },
        "location": {
          "locationId": 101,
          "locationCode": "A-01-01",
          "zone": "A",
          "aisle": "01",
          "shelf": "01"
        },
        "quantities": {
          "onHand": 45.000,
          "reserved": 5.000,
          "available": 40.000
        },
        "batchNumber": "BATCH20250726001",
        "serialNumber": null,
        "unitCost": 900000.00,
        "dates": {
          "manufacturingDate": "2025-07-01",
          "expirationDate": null,
          "lastCountDate": "2025-07-25",
          "lastMovementDate": "2025-07-26T09:15:00Z"
        },
        "status": "AVAILABLE",
        "qualityStatus": "GOOD",
        "stockAlert": {
          "isLowStock": false,
          "reorderPoint": 20,
          "daysToStockOut": 15
        }
      }
    ],
    "summary": {
      "totalProducts": 150,
      "totalLocations": 45,
      "lowStockItems": 12,
      "outOfStockItems": 3
    },
    "pagination": {
      "page": 1,
      "size": 20,
      "totalElements": 1250,
      "totalPages": 63,
      "hasNext": true,
      "hasPrevious": false
    }
  },
  "timestamp": "2025-07-26T10:30:00Z"
}
```

#### 4.3.2 재고 상세 조회
```http
GET /api/v1/inventory/{inventoryId}
```

#### 4.3.3 재고 요약 조회
```http
GET /api/v1/inventory/summary
```

**Request Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| warehouseId | integer | N | 창고 필터 |
| categoryId | integer | N | 카테고리 필터 |

**Response:**
```json
{
  "success": true,
  "message": "재고 요약 조회 성공",
  "data": {
    "totalValue": 150000000.00,
    "totalItems": 1250,
    "alerts": {
      "lowStock": 12,
      "outOfStock": 3,
      "nearExpiry": 5
    },
    "warehouseSummary": [
      {
        "warehouseId": 1,
        "warehouseName": "서울 메인창고",
        "totalValue": 120000000.00,
        "totalItems": 1000,
        "capacityUtilization": 75.5
      }
    ],
    "categorySummary": [
      {
        "categoryId": 1,
        "categoryName": "전자제품",
        "totalValue": 80000000.00,
        "totalItems": 450
      }
    ]
  },
  "timestamp": "2025-07-26T10:30:00Z"
}
```

### 4.4 입고 관리 API

#### 4.4.1 입고 목록 조회
```http
GET /api/v1/inventory/receipts
```

**Request Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| warehouseId | integer | N | 창고 필터 |
| supplierId | integer | N | 공급업체 필터 |
| status | string | N | 입고 상태 |
| dateFrom | date | N | 시작일 (YYYY-MM-DD) |
| dateTo | date | N | 종료일 (YYYY-MM-DD) |

**Response:**
```json
{
  "success": true,
  "message": "입고 목록 조회 성공",
  "data": {
    "content": [
      {
        "receiptId": 1,
        "receiptNumber": "REC20250726001",
        "warehouse": {
          "warehouseId": 1,
          "warehouseName": "서울 메인창고"
        },
        "supplier": {
          "supplierId": 1,
          "supplierName": "삼성전자"
        },
        "receiptDate": "2025-07-26",
        "expectedDate": "2025-07-26",
        "status": "RECEIVED",
        "totalItems": 50,
        "totalValue": 45000000.00,
        "createdBy": {
          "userId": 1,
          "username": "warehouse_manager"
        },
        "createdAt": "2025-07-26T08:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "totalElements": 45,
      "totalPages": 3,
      "hasNext": true,
      "hasPrevious": false
    }
  },
  "timestamp": "2025-07-26T10:30:00Z"
}
```

#### 4.4.2 입고 등록
```http
POST /api/v1/inventory/receipts
```

**Required Permission:** `INVENTORY_CREATE`

**Request Body:**
```json
{
  "warehouseId": 1,
  "supplierId": 1,
  "expectedDate": "2025-07-27",
  "purchaseOrderNumber": "PO20250726001",
  "notes": "정기 발주 입고",
  "items": [
    {
      "productId": 1,
      "quantity": 20.000,
      "unitCost": 900000.00,
      "batchNumber": "BATCH20250727001",
      "manufacturingDate": "2025-07-20",
      "expirationDate": null,
      "locationId": 101
    }
  ]
}
```

#### 4.4.3 입고 처리 (상태 변경)
```http
POST /api/v1/inventory/receipts/{receiptId}/process
```

**Required Permission:** `INVENTORY_UPDATE`

**Request Body:**
```json
{
  "status": "RECEIVED",
  "actualDate": "2025-07-26",
  "notes": "입고 완료",
  "items": [
    {
      "receiptItemId": 1,
      "actualQuantity": 20.000,
      "actualUnitCost": 900000.00,
      "damageQuantity": 0.000,
      "damageReason": null
    }
  ]
}
```

### 4.5 출고 관리 API

#### 4.5.1 출고 목록 조회
```http
GET /api/v1/inventory/shipments
```

#### 4.5.2 출고 등록
```http
POST /api/v1/inventory/shipments
```

**Request Body:**
```json
{
  "warehouseId": 1,
  "orderId": 1,
  "shipmentType": "SALES_ORDER",
  "expectedDate": "2025-07-27",
  "priority": "NORMAL",
  "notes": "일반 출고",
  "items": [
    {
      "inventoryId": 1,
      "quantity": 5.000,
      "reservationId": 123
    }
  ]
}
```

### 4.6 재고 조정 API

#### 4.6.1 재고 조정 목록 조회
```http
GET /api/v1/inventory/adjustments
```

#### 4.6.2 재고 조정 등록
```http
POST /api/v1/inventory/adjustments
```

**Required Permission:** `INVENTORY_UPDATE`

**Request Body:**
```json
{
  "warehouseId": 1,
  "adjustmentType": "CYCLE_COUNT",
  "reason": "정기 재고 실사",
  "items": [
    {
      "inventoryId": 1,
      "physicalQuantity": 43.000,
      "systemQuantity": 45.000,
      "adjustmentQuantity": -2.000,
      "reason": "파손 제품 발견"
    }
  ]
}
```

#### 4.6.3 재고 조정 승인
```http
POST /api/v1/inventory/adjustments/{adjustmentId}/approve
```

**Required Permission:** `INVENTORY_UPDATE` (Manager 권한)

---

## 5. 사용자 관리 API

### 5.1 인증 API

#### 5.1.1 로그인
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "username": "warehouse_manager",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "로그인 성공",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "userId": 1,
      "username": "warehouse_manager",
      "email": "manager@company.com",
      "firstName": "김",
      "lastName": "관리자",
      "department": "물류팀",
      "position": "창고관리자",
      "roles": [
        {
          "roleId": 2,
          "roleName": "WAREHOUSE_MANAGER",
          "description": "창고 관리자"
        }
      ],
      "permissions": [
        "INVENTORY_CREATE",
        "INVENTORY_READ",
        "INVENTORY_UPDATE",
        "INVENTORY_DELETE"
      ]
    }
  },
  "timestamp": "2025-07-26T10:30:00Z"
}
```

#### 5.1.2 토큰 갱신
```http
POST /api/v1/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 5.1.3 로그아웃
```http
POST /api/v1/auth/logout
```

### 5.2 사용자 관리 API

#### 5.2.1 사용자 목록 조회
```http
GET /api/v1/users
```

#### 5.2.2 사용자 등록
```http
POST /api/v1/users
```

#### 5.2.3 사용자 수정
```http
PUT /api/v1/users/{userId}
```

---

## 6. 주문관리 API

### 6.1 주문 API

#### 6.1.1 주문 목록 조회
```http
GET /api/v1/orders
```

**Request Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| customerId | integer | N | 고객 필터 |
| status | string | N | 주문 상태 |
| priority | string | N | 우선순위 |
| dateFrom | date | N | 시작일 |
| dateTo | date | N | 종료일 |

#### 6.1.2 주문 등록
```http
POST /api/v1/orders
```

**Request Body:**
```json
{
  "customerId": 1,
  "warehouseId": 1,
  "orderDate": "2025-07-26",
  "requiredDate": "2025-07-28",
  "priority": "NORMAL",
  "shippingAddress": {
    "address": "서울시 강남구 테헤란로 123",
    "city": "서울시",
    "postalCode": "06142"
  },
  "items": [
    {
      "productId": 1,
      "quantity": 2.000,
      "unitPrice": 1200000.00,
      "discountAmount": 0.00
    }
  ],
  "notes": "빠른 배송 요청"
}
```

#### 6.1.3 주문 상태 변경
```http
PATCH /api/v1/orders/{orderId}/status
```

**Request Body:**
```json
{
  "status": "CONFIRMED",
  "notes": "재고 확인 완료"
}
```

---

## 7. 배송관리 API

### 7.1 배송 API

#### 7.1.1 배송 목록 조회
```http
GET /api/v1/shipments
```

#### 7.1.2 배송 등록
```http
POST /api/v1/shipments
```

#### 7.1.3 배송 추적
```http
GET /api/v1/shipments/{shipmentId}/tracking
```

---

## 8. 창고관리 API

### 8.1 창고 API

#### 8.1.1 창고 목록 조회
```http
GET /api/v1/warehouses
```

#### 8.1.2 창고 위치 조회
```http
GET /api/v1/warehouses/{warehouseId}/locations
```

---

## 9. 리포트 API

### 9.1 대시보드 API

#### 9.1.1 메인 대시보드 데이터
```http
GET /api/v1/dashboard
```

**Response:**
```json
{
  "success": true,
  "message": "대시보드 데이터 조회 성공",
  "data": {
    "summary": {
      "totalProducts": 1250,
      "totalOrders": 145,
      "totalShipments": 98,
      "totalValue": 150000000.00
    },
    "alerts": {
      "lowStock": 12,
      "pendingOrders": 25,
      "delayedShipments": 3
    },
    "charts": {
      "salesTrend": [
        {
          "date": "2025-07-26",
          "sales": 5000000.00,
          "orders": 15
        }
      ],
      "inventoryStatus": [
        {
          "category": "전자제품",
          "value": 80000000.00,
          "percentage": 53.3
        }
      ]
    }
  },
  "timestamp": "2025-07-26T10:30:00Z"
}
```

### 9.2 재고 리포트 API

#### 9.2.1 재고 분석 리포트
```http
GET /api/v1/reports/inventory-analysis
```

---

## 10. 에러 코드

### 10.1 HTTP 상태 코드
| 코드 | 의미 | 설명 |
|------|------|------|
| 200 | OK | 요청 성공 |
| 201 | Created | 리소스 생성 성공 |
| 400 | Bad Request | 잘못된 요청 |
| 401 | Unauthorized | 인증 실패 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 리소스 충돌 |
| 422 | Unprocessable Entity | 유효성 검증 실패 |
| 500 | Internal Server Error | 서버 내부 오류 |

### 10.2 비즈니스 에러 코드
| 코드 | 메시지 | 설명 |
|------|--------|------|
| PRODUCT_NOT_FOUND | 상품을 찾을 수 없습니다 | 존재하지 않는 상품 ID |
| INSUFFICIENT_INVENTORY | 재고가 부족합니다 | 요청 수량보다 재고 부족 |
| INVALID_WAREHOUSE | 유효하지 않은 창고입니다 | 존재하지 않는 창고 |
| DUPLICATE_PRODUCT_CODE | 중복된 상품 코드입니다 | 상품 코드 중복 |
| INVALID_STOCK_ADJUSTMENT | 잘못된 재고 조정입니다 | 재고 조정 유효성 오류 |

---

**📅 문서 최종 수정**: 2025년 7월 26일  
**👨‍💻 작성자**: 물류IT팀  
**🎯 다음 단계**: 화면 설계서(와이어프레임) 작성 및 프로토타입 개발