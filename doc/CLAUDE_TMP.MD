# CLAUDE.md - 물류관리 시스템 개발 가이드

이 문서는 Claude Code를 사용하여 물류관리 시스템을 개발할 때의 가이드라인과 컨텍스트를 제공합니다.

## Claude Code 워크플로우 규칙

**매 세션마다 반드시 준수해야 할 규칙:**

- `always read PLANNING.md at the start of every new conversation`
- `check TASKS.md before starting your work`
- `mark completed tasks immediately`
- `add newly discovered tasks`

### 워크플로우 설명
1. **세션 시작**: 새로운 대화를 시작할 때마다 PLANNING.md를 먼저 읽어 프로젝트 전체 계획과 현재 상황을 파악
2. **작업 전 확인**: 실제 개발 작업을 시작하기 전에 TASKS.md를 확인하여 우선순위와 할 일 목록 점검
3. **즉시 업데이트**: 작업을 완료하는 즉시 TASKS.md에서 해당 항목을 완료 처리
4. **동적 관리**: 개발 과정에서 새롭게 발견되는 작업들을 TASKS.md에 즉시 추가

이를 통해 일관되고 체계적인 프로젝트 진행이 가능합니다.

## 프로젝트 개요

**프로젝트명**: 통합 물류관리 시스템 (Integrated Logistics Management System)  
**기술 스택**: Vue 3 + PrimeVue + Spring Boot + PostgreSQL  
**개발 기간**: 19주 (약 4.5개월)

## 아키텍처 구조

```
Frontend (Vue 3 + PrimeVue)
    ↓ HTTP/REST API
Backend (Spring Boot + JPA)
    ↓ JDBC
Database (PostgreSQL)
```

## 핵심 도메인 모델

### 1. 주요 엔티티
- **User**: 사용자 (시스템관리자, 창고관리자, 주문담당자, 일반사용자)
- **Product**: 상품 (코드, 이름, 카테고리, 가격, 규격)
- **Inventory**: 재고 (수량, 예약수량, 안전재고, 위치)
- **Order**: 주문 (고객, 주문일, 상태, 배송지)
- **Warehouse**: 창고 (이름, 주소, 용량, 관리자)
- **Shipment**: 배송 (운송업체, 추적번호, 상태)

### 2. 핵심 비즈니스 프로세스
1. **재고 관리 플로우**: 입고 → 보관 → 출고 → 조정
2. **주문 처리 플로우**: 접수 → 재고할당 → 피킹 → 포장 → 배송
3. **배송 관리 플로우**: 계획 → 배차 → 추적 → 완료

## 기능 모듈 구조

### Frontend (Vue 3 + PrimeVue)
```
src/
├── components/
│   ├── common/          # 공통 컴포넌트
│   ├── inventory/       # 재고관리 컴포넌트
│   ├── orders/          # 주문관리 컴포넌트
│   ├── shipping/        # 배송관리 컴포넌트
│   ├── warehouse/       # 창고관리 컴포넌트
│   └── reports/         # 리포트 컴포넌트
├── views/
│   ├── dashboard/       # 대시보드 페이지
│   ├── inventory/       # 재고관리 페이지
│   ├── orders/          # 주문관리 페이지
│   ├── shipping/        # 배송관리 페이지
│   ├── warehouse/       # 창고관리 페이지
│   └── reports/         # 리포트 페이지
├── stores/              # Pinia 스토어
├── services/            # API 서비스
├── utils/               # 유틸리티
└── router/              # 라우터 설정
```

### Backend (Spring Boot)
```
src/main/java/com/logistics/
├── config/              # 설정 클래스
├── controller/          # REST 컨트롤러
│   ├── InventoryController
│   ├── OrderController
│   ├── ShippingController
│   ├── WarehouseController
│   └── ReportController
├── service/             # 비즈니스 로직
├── repository/          # 데이터 접근
├── entity/              # JPA 엔티티
├── dto/                 # 데이터 전송 객체
├── security/            # 보안 설정
└── exception/           # 예외 처리
```

## API 설계 규칙

### REST API 명명 규칙
```
GET    /api/v1/{resource}           # 목록 조회
GET    /api/v1/{resource}/{id}      # 단건 조회
POST   /api/v1/{resource}           # 생성
PUT    /api/v1/{resource}/{id}      # 전체 수정
PATCH  /api/v1/{resource}/{id}      # 부분 수정
DELETE /api/v1/{resource}/{id}      # 삭제
```

### 응답 형식
```json
{
  "success": true,
  "message": "Success",
  "data": {
    // 응답 데이터
  },
  "timestamp": "2025-07-26T10:30:00Z"
}
```

## 데이터베이스 설계

### 핵심 테이블
1. **users** - 사용자 정보
2. **products** - 상품 정보
3. **categories** - 상품 카테고리
4. **inventory** - 재고 현황
5. **inventory_transactions** - 재고 거래 이력
6. **orders** - 주문 정보
7. **order_details** - 주문 상세
8. **warehouses** - 창고 정보
9. **locations** - 창고 내 위치
10. **shipments** - 배송 정보

### 관계
- User 1:N Order (한 사용자가 여러 주문)
- Order 1:N OrderDetail (한 주문에 여러 상품)
- Product 1:N Inventory (한 상품이 여러 창고에 보관)
- Warehouse 1:N Location (한 창고에 여러 위치)

## 개발 가이드라인

### 1. 코딩 컨벤션
- **Java**: Google Java Style Guide 준수
- **Vue**: Vue 3 Composition API 사용
- **DB**: snake_case 네이밍 (예: user_id, created_at)
- **API**: camelCase 네이밍 (예: userId, createdAt)

### 2. 보안 요구사항
- JWT 토큰 기반 인증
- RBAC (Role-Based Access Control) 구현
- 민감 데이터 AES-256 암호화
- API Rate Limiting 적용

### 3. 성능 요구사항
- 일반 조회: 3초 이내 응답
- 복잡한 리포트: 10초 이내 응답
- 동시 사용자: 100명 지원
- 일일 거래량: 10만건 처리

### 4. 테스트 전략
- 단위 테스트: JUnit 5 + Mockito
- 통합 테스트: TestContainers 사용
- E2E 테스트: Cypress 또는 Playwright
- API 테스트: REST Assured

## 주요 기능별 구현 포인트

### 재고 관리
- **실시간 재고 업데이트**: 트랜잭션 처리로 데이터 일관성 보장
- **재고 이력 추적**: 모든 재고 변동 사항을 inventory_transactions에 기록
- **안전재고 알림**: 배치 작업으로 주기적 체크
- **재고 분석**: 집계 쿼리 최적화 필요

### 주문 관리
- **주문 상태 관리**: 상태 기계 패턴 적용 (접수→확인→처리→완료)
- **재고 할당**: 동시성 제어를 위한 비관적 락 사용
- **주문 추적**: WebSocket 또는 Server-Sent Events로 실시간 업데이트
- **배송 연계**: 외부 배송업체 API 연동

### 배송 관리
- **루트 최적화**: 외부 지도 API (Google Maps, Naver Maps) 활용
- **실시간 추적**: GPS 데이터 수집 및 WebSocket 통신
- **배송 상태 관리**: 이벤트 기반 상태 업데이트
- **비용 계산**: 거리, 중량, 지역별 요금 매트릭스

### 창고 관리
- **위치 코드 체계**: 계층적 구조 (창고-구역-통로-선반-위치)
- **작업 효율성**: 피킹 순서 최적화 알고리즘
- **장비 관리**: IoT 센서 데이터 수집 (선택사항)
- **3D 창고 맵**: Three.js를 활용한 시각화 (고도화 단계)

### 리포트 및 분석
- **대시보드**: Chart.js 또는 PrimeVue Chart 컴포넌트 활용
- **실시간 KPI**: Redis 캐싱으로 성능 최적화
- **데이터 내보내기**: Excel, PDF 형식 지원
- **예측 분석**: 머신러닝 모델 연동 (향후 계획)

## 배포 및 운영

### 환경 구성
```yaml
# docker-compose.yml 예시
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
  
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=postgres
      - DB_NAME=logistics
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=logistics
      - POSTGRES_USER=logistics_user
      - POSTGRES_PASSWORD=secure_password
```

### 모니터링
- 애플리케이션: Spring Actuator + Micrometer
- 데이터베이스: PostgreSQL 통계 및 슬로우 쿼리 로그
- 인프라: Docker 컨테이너 모니터링

## 개발 단계별 우선순위

### Phase 1: 핵심 기능 (6주)
1. 사용자 인증/권한 관리
2. 기본 재고 관리 (조회, 입출고)
3. 기본 주문 관리 (접수, 처리)
4. 기본 창고 관리

### Phase 2: 고도화 기능 (6주)
1. 배송 관리 및 추적
2. 리포트 및 대시보드
3. 재고 분석 및 예측
4. 모바일 반응형 지원

### Phase 3: 최적화 및 확장 (4주)
1. 성능 최적화
2. 고급 분석 기능
3. 외부 시스템 연동
4. 사용자 피드백 반영

## 문제 해결 가이드

### 자주 발생하는 이슈
1. **동시성 문제**: 재고 수량 업데이트 시 데이터 불일치
   - 해결: 데이터베이스 락 또는 낙관적 락 사용

2. **성능 이슈**: 대용량 데이터 조회 시 응답 지연
   - 해결: 인덱스 최적화, 페이지네이션, 캐싱

3. **UI 복잡성**: PrimeVue 컴포넌트 커스터마이징
   - 해결: CSS 오버라이드, 커스텀 테마 적용

### 트러블슈팅 체크리스트
- [ ] 데이터베이스 연결 상태 확인
- [ ] API 응답 로그 확인
- [ ] 브라우저 콘솔 에러 확인
- [ ] 네트워크 통신 상태 확인
- [ ] 메모리 사용량 모니터링

## 참고 문서
- [Vue 3 공식 문서](https://vuejs.org/)
- [PrimeVue 문서](https://primevue.org/)
- [Spring Boot 문서](https://spring.io/projects/spring-boot)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)

---

**이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.**
