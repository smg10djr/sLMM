# 데이터베이스 ERD 설계 (Database Entity-Relationship Diagram)

## 📊 개요

### 설계 원칙
- **정규화**: 3NF까지 정규화하여 데이터 중복 최소화
- **성능**: 조회 성능을 위한 적절한 비정규화 고려
- **확장성**: 향후 기능 추가를 고려한 유연한 구조
- **무결성**: 참조 무결성 및 데이터 일관성 보장

### 데이터베이스 정보
- **DBMS**: PostgreSQL 15
- **Character Set**: UTF-8
- **Collation**: ko_KR.UTF-8 (한국어 정렬 지원)
- **Time Zone**: Asia/Seoul

---

## 🏗️ 전체 ERD 구조

### 모듈별 엔티티 그룹
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   사용자 관리    │  │   상품 관리      │  │   재고 관리      │
│                │  │                │  │                │
│ • users         │  │ • products      │  │ • inventory     │
│ • roles         │  │ • categories    │  │ • inventory_    │
│ • user_roles    │  │ • suppliers     │  │   transactions  │
│ • permissions   │  │ • product_      │  │ • stock_        │
│                │  │   suppliers     │  │   adjustments   │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   주문 관리      │  │   배송 관리      │  │   창고 관리      │
│                │  │                │  │                │
│ • orders        │  │ • shipments     │  │ • warehouses    │
│ • order_items   │  │ • carriers      │  │ • locations     │
│ • customers     │  │ • tracking_     │  │ • warehouse_    │
│ • order_status_ │  │   events        │  │   equipment     │
│   history       │  │ • delivery_     │  │ • work_orders   │
│                │  │   routes        │  │                │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 🗃️ 상세 엔티티 설계

### 1. 사용자 관리 (User Management)

#### 1.1 users (사용자)
```sql
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_username_check CHECK (LENGTH(username) >= 3)
);

-- 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
```

#### 1.2 roles (역할)
```sql
CREATE TABLE roles (
    role_id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT roles_name_check CHECK (LENGTH(role_name) >= 2)
);

-- 기본 데이터
INSERT INTO roles (role_name, description) VALUES
('SYSTEM_ADMIN', '시스템 관리자 - 전체 시스템 관리 권한'),
('WAREHOUSE_MANAGER', '창고 관리자 - 창고 및 재고 관리 권한'),
('ORDER_MANAGER', '주문 담당자 - 주문 처리 및 배송 관리 권한'),
('GENERAL_USER', '일반 사용자 - 제한적 조회 및 입력 권한'),
('REPORT_VIEWER', '리포트 조회자 - 리포트 및 분석 조회 권한');
```

#### 1.3 user_roles (사용자-역할 매핑)
```sql
CREATE TABLE user_roles (
    user_role_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id),
    
    UNIQUE(user_id, role_id)
);

-- 인덱스
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
```

#### 1.4 permissions (권한)
```sql
CREATE TABLE permissions (
    permission_id BIGSERIAL PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT permissions_action_check CHECK (action IN ('CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE'))
);

-- 기본 권한 데이터
INSERT INTO permissions (permission_name, resource, action, description) VALUES
('USER_CREATE', 'USER', 'CREATE', '사용자 생성 권한'),
('USER_READ', 'USER', 'READ', '사용자 조회 권한'),
('USER_UPDATE', 'USER', 'UPDATE', '사용자 수정 권한'),
('USER_DELETE', 'USER', 'DELETE', '사용자 삭제 권한'),
('INVENTORY_CREATE', 'INVENTORY', 'CREATE', '재고 생성 권한'),
('INVENTORY_READ', 'INVENTORY', 'READ', '재고 조회 권한'),
('INVENTORY_UPDATE', 'INVENTORY', 'UPDATE', '재고 수정 권한'),
('INVENTORY_DELETE', 'INVENTORY', 'DELETE', '재고 삭제 권한'),
('ORDER_CREATE', 'ORDER', 'CREATE', '주문 생성 권한'),
('ORDER_READ', 'ORDER', 'READ', '주문 조회 권한'),
('ORDER_UPDATE', 'ORDER', 'UPDATE', '주문 수정 권한'),
('ORDER_DELETE', 'ORDER', 'DELETE', '주문 삭제 권한'),
('REPORT_READ', 'REPORT', 'READ', '리포트 조회 권한');
```

### 2. 상품 관리 (Product Management)

#### 2.1 categories (카테고리)
```sql
CREATE TABLE categories (
    category_id BIGSERIAL PRIMARY KEY,
    category_code VARCHAR(20) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    parent_category_id BIGINT,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_category_id) REFERENCES categories(category_id),
    
    CONSTRAINT categories_code_check CHECK (LENGTH(category_code) >= 2),
    CONSTRAINT categories_no_self_parent CHECK (category_id != parent_category_id)
);

-- 인덱스
CREATE INDEX idx_categories_parent ON categories(parent_category_id);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = true;
CREATE INDEX idx_categories_code ON categories(category_code);
```

#### 2.2 suppliers (공급업체)
```sql
CREATE TABLE suppliers (
    supplier_id BIGSERIAL PRIMARY KEY,
    supplier_code VARCHAR(20) UNIQUE NOT NULL,
    supplier_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    business_number VARCHAR(12),
    rating DECIMAL(2,1) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT suppliers_rating_check CHECK (rating >= 0.0 AND rating <= 5.0),
    CONSTRAINT suppliers_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 인덱스
CREATE INDEX idx_suppliers_code ON suppliers(supplier_code);
CREATE INDEX idx_suppliers_active ON suppliers(is_active) WHERE is_active = true;
CREATE INDEX idx_suppliers_rating ON suppliers(rating DESC);
```

#### 2.3 products (상품)
```sql
CREATE TABLE products (
    product_id BIGSERIAL PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    category_id BIGINT NOT NULL,
    description TEXT,
    unit_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    cost_price DECIMAL(15,2) DEFAULT 0.00,
    weight DECIMAL(10,3),
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    unit_of_measure VARCHAR(10) DEFAULT 'EA',
    barcode VARCHAR(50),
    qr_code VARCHAR(200),
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 0,
    shelf_life_days INTEGER,
    storage_temperature_min DECIMAL(5,2),
    storage_temperature_max DECIMAL(5,2),
    is_serialized BOOLEAN DEFAULT false,
    is_batch_tracked BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    
    CONSTRAINT products_price_check CHECK (unit_price >= 0),
    CONSTRAINT products_cost_check CHECK (cost_price >= 0),
    CONSTRAINT products_dimensions_check CHECK (
        (weight IS NULL OR weight > 0) AND
        (length IS NULL OR length > 0) AND
        (width IS NULL OR width > 0) AND
        (height IS NULL OR height > 0)
    ),
    CONSTRAINT products_stock_levels_check CHECK (
        min_stock_level >= 0 AND
        max_stock_level >= min_stock_level AND
        reorder_point >= 0
    )
);

-- 인덱스
CREATE INDEX idx_products_code ON products(product_code);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_products_price ON products(unit_price);
CREATE INDEX idx_products_name_gin ON products USING gin(to_tsvector('korean', product_name));
```

#### 2.4 product_suppliers (상품-공급업체 매핑)
```sql
CREATE TABLE product_suppliers (
    product_supplier_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,
    supplier_product_code VARCHAR(50),
    lead_time_days INTEGER DEFAULT 7,
    min_order_quantity INTEGER DEFAULT 1,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    
    CONSTRAINT product_suppliers_lead_time_check CHECK (lead_time_days > 0),
    CONSTRAINT product_suppliers_min_order_check CHECK (min_order_quantity > 0)
);

-- 인덱스
CREATE INDEX idx_product_suppliers_product ON product_suppliers(product_id);
CREATE INDEX idx_product_suppliers_supplier ON product_suppliers(supplier_id);
CREATE INDEX idx_product_suppliers_primary ON product_suppliers(is_primary) WHERE is_primary = true;
```

### 3. 창고 관리 (Warehouse Management)

#### 3.1 warehouses (창고)
```sql
CREATE TABLE warehouses (
    warehouse_id BIGSERIAL PRIMARY KEY,
    warehouse_code VARCHAR(20) UNIQUE NOT NULL,
    warehouse_name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(10),
    country VARCHAR(50) DEFAULT 'KR',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    total_capacity DECIMAL(15,2),
    used_capacity DECIMAL(15,2) DEFAULT 0.00,
    capacity_unit VARCHAR(10) DEFAULT 'M3',
    manager_id BIGINT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (manager_id) REFERENCES users(user_id),
    
    CONSTRAINT warehouses_capacity_check CHECK (
        total_capacity > 0 AND
        used_capacity >= 0 AND
        used_capacity <= total_capacity
    ),
    CONSTRAINT warehouses_coordinates_check CHECK (
        (latitude IS NULL AND longitude IS NULL) OR
        (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
    )
);

-- 인덱스
CREATE INDEX idx_warehouses_code ON warehouses(warehouse_code);
CREATE INDEX idx_warehouses_manager ON warehouses(manager_id);
CREATE INDEX idx_warehouses_active ON warehouses(is_active) WHERE is_active = true;
CREATE INDEX idx_warehouses_location ON warehouses(latitude, longitude) WHERE latitude IS NOT NULL;
```

#### 3.2 locations (위치)
```sql
CREATE TABLE locations (
    location_id BIGSERIAL PRIMARY KEY,
    warehouse_id BIGINT NOT NULL,
    location_code VARCHAR(50) NOT NULL,
    zone VARCHAR(20),
    aisle VARCHAR(10),
    shelf VARCHAR(10),
    level INTEGER,
    position VARCHAR(10),
    location_type VARCHAR(20) DEFAULT 'STORAGE',
    capacity DECIMAL(10,2),
    is_pickable BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
    
    UNIQUE(warehouse_id, location_code),
    
    CONSTRAINT locations_type_check CHECK (location_type IN ('STORAGE', 'RECEIVING', 'SHIPPING', 'STAGING', 'DAMAGED')),
    CONSTRAINT locations_capacity_check CHECK (capacity IS NULL OR capacity > 0),
    CONSTRAINT locations_level_check CHECK (level IS NULL OR level > 0)
);

-- 인덱스
CREATE INDEX idx_locations_warehouse ON locations(warehouse_id);
CREATE INDEX idx_locations_code ON locations(warehouse_id, location_code);
CREATE INDEX idx_locations_type ON locations(location_type);
CREATE INDEX idx_locations_pickable ON locations(is_pickable) WHERE is_pickable = true;
CREATE INDEX idx_locations_zone_aisle ON locations(zone, aisle);
```

#### 3.3 warehouse_equipment (창고 장비)
```sql
CREATE TABLE warehouse_equipment (
    equipment_id BIGSERIAL PRIMARY KEY,
    warehouse_id BIGINT NOT NULL,
    equipment_code VARCHAR(30) UNIQUE NOT NULL,
    equipment_name VARCHAR(200) NOT NULL,
    equipment_type VARCHAR(50) NOT NULL,
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    purchase_date DATE,
    warranty_end_date DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    status VARCHAR(20) DEFAULT 'OPERATIONAL',
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
    
    CONSTRAINT equipment_status_check CHECK (status IN ('OPERATIONAL', 'MAINTENANCE', 'OUT_OF_ORDER', 'RETIRED')),
    CONSTRAINT equipment_dates_check CHECK (
        warranty_end_date IS NULL OR purchase_date IS NULL OR warranty_end_date >= purchase_date
    )
);

-- 인덱스
CREATE INDEX idx_equipment_warehouse ON warehouse_equipment(warehouse_id);
CREATE INDEX idx_equipment_code ON warehouse_equipment(equipment_code);
CREATE INDEX idx_equipment_type ON warehouse_equipment(equipment_type);
CREATE INDEX idx_equipment_status ON warehouse_equipment(status);
CREATE INDEX idx_equipment_maintenance ON warehouse_equipment(next_maintenance_date) WHERE status = 'OPERATIONAL';
```

### 4. 재고 관리 (Inventory Management)

#### 4.1 inventory (재고)
```sql
CREATE TABLE inventory (
    inventory_id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    location_id BIGINT,
    batch_number VARCHAR(50),
    serial_number VARCHAR(100),
    quantity_on_hand DECIMAL(15,3) NOT NULL DEFAULT 0.000,
    quantity_reserved DECIMAL(15,3) NOT NULL DEFAULT 0.000,
    quantity_available DECIMAL(15,3) GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    unit_cost DECIMAL(15,2),
    manufacturing_date DATE,
    expiration_date DATE,
    last_count_date DATE,
    last_movement_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    quality_status VARCHAR(20) DEFAULT 'GOOD',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(location_id),
    
    UNIQUE(product_id, warehouse_id, location_id, batch_number, serial_number),
    
    CONSTRAINT inventory_quantities_check CHECK (
        quantity_on_hand >= 0 AND
        quantity_reserved >= 0 AND
        quantity_reserved <= quantity_on_hand
    ),
    CONSTRAINT inventory_status_check CHECK (status IN ('AVAILABLE', 'RESERVED', 'QUARANTINE', 'DAMAGED', 'EXPIRED')),
    CONSTRAINT inventory_quality_check CHECK (quality_status IN ('GOOD', 'DAMAGED', 'EXPIRED', 'RECALL')),
    CONSTRAINT inventory_dates_check CHECK (
        expiration_date IS NULL OR manufacturing_date IS NULL OR expiration_date > manufacturing_date
    )
);

-- 인덱스
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX idx_inventory_location ON inventory(location_id);
CREATE INDEX idx_inventory_batch ON inventory(batch_number) WHERE batch_number IS NOT NULL;
CREATE INDEX idx_inventory_serial ON inventory(serial_number) WHERE serial_number IS NOT NULL;
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_available ON inventory(quantity_available) WHERE quantity_available > 0;
CREATE INDEX idx_inventory_expiration ON inventory(expiration_date) WHERE expiration_date IS NOT NULL;
CREATE INDEX idx_inventory_movement ON inventory(last_movement_date DESC);
```

#### 4.2 inventory_transactions (재고 거래)
```sql
CREATE TABLE inventory_transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    inventory_id BIGINT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    quantity DECIMAL(15,3) NOT NULL,
    unit_cost DECIMAL(15,2),
    reference_type VARCHAR(30),
    reference_id BIGINT,
    reason_code VARCHAR(50),
    notes TEXT,
    performed_by BIGINT NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(user_id),
    
    CONSTRAINT transaction_type_check CHECK (transaction_type IN (
        'RECEIPT', 'SHIPMENT', 'ADJUSTMENT', 'TRANSFER', 'RETURN', 'DAMAGE', 'EXPIRY'
    )),
    CONSTRAINT transaction_quantity_check CHECK (quantity != 0),
    CONSTRAINT transaction_reference_check CHECK (
        (reference_type IS NULL AND reference_id IS NULL) OR
        (reference_type IS NOT NULL AND reference_id IS NOT NULL)
    )
);

-- 인덱스
CREATE INDEX idx_transactions_inventory ON inventory_transactions(inventory_id);
CREATE INDEX idx_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_transactions_date ON inventory_transactions(transaction_date DESC);
CREATE INDEX idx_transactions_reference ON inventory_transactions(reference_type, reference_id);
CREATE INDEX idx_transactions_user ON inventory_transactions(performed_by);
```

#### 4.3 stock_adjustments (재고 조정)
```sql
CREATE TABLE stock_adjustments (
    adjustment_id BIGSERIAL PRIMARY KEY,
    adjustment_number VARCHAR(30) UNIQUE NOT NULL,
    warehouse_id BIGINT NOT NULL,
    adjustment_type VARCHAR(20) NOT NULL,
    reason VARCHAR(200),
    status VARCHAR(20) DEFAULT 'DRAFT',
    total_items INTEGER DEFAULT 0,
    created_by BIGINT NOT NULL,
    approved_by BIGINT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id),
    
    CONSTRAINT adjustment_type_check CHECK (adjustment_type IN ('CYCLE_COUNT', 'PHYSICAL_COUNT', 'DAMAGE', 'LOSS', 'CORRECTION')),
    CONSTRAINT adjustment_status_check CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'CANCELLED'))
);

-- 인덱스
CREATE INDEX idx_adjustments_number ON stock_adjustments(adjustment_number);
CREATE INDEX idx_adjustments_warehouse ON stock_adjustments(warehouse_id);
CREATE INDEX idx_adjustments_status ON stock_adjustments(status);
CREATE INDEX idx_adjustments_created_by ON stock_adjustments(created_by);
CREATE INDEX idx_adjustments_date ON stock_adjustments(created_at DESC);
```

### 5. 주문 관리 (Order Management)

#### 5.1 customers (고객)
```sql
CREATE TABLE customers (
    customer_id BIGSERIAL PRIMARY KEY,
    customer_code VARCHAR(30) UNIQUE NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_type VARCHAR(20) DEFAULT 'INDIVIDUAL',
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    billing_address TEXT,
    shipping_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(10),
    country VARCHAR(50) DEFAULT 'KR',
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    payment_terms VARCHAR(50),
    tax_id VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT customer_type_check CHECK (customer_type IN ('INDIVIDUAL', 'BUSINESS', 'GOVERNMENT')),
    CONSTRAINT customer_credit_check CHECK (credit_limit >= 0),
    CONSTRAINT customer_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 인덱스
CREATE INDEX idx_customers_code ON customers(customer_code);
CREATE INDEX idx_customers_type ON customers(customer_type);
CREATE INDEX idx_customers_active ON customers(is_active) WHERE is_active = true;
CREATE INDEX idx_customers_name_gin ON customers USING gin(to_tsvector('korean', customer_name));
```

#### 5.2 orders (주문)
```sql
CREATE TABLE orders (
    order_id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    required_date DATE,
    promised_date DATE,
    order_status VARCHAR(20) DEFAULT 'PENDING',
    priority VARCHAR(10) DEFAULT 'NORMAL',
    warehouse_id BIGINT,
    shipping_address TEXT,
    billing_address TEXT,
    subtotal DECIMAL(15,2) DEFAULT 0.00,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    shipping_cost DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'KRW',
    payment_method VARCHAR(30),
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    notes TEXT,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    
    CONSTRAINT order_status_check CHECK (order_status IN (
        'PENDING', 'CONFIRMED', 'PROCESSING', 'PICKING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'
    )),
    CONSTRAINT order_priority_check CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    CONSTRAINT order_payment_status_check CHECK (payment_status IN ('PENDING', 'PAID', 'PARTIAL', 'REFUNDED', 'CANCELLED')),
    CONSTRAINT order_amounts_check CHECK (
        subtotal >= 0 AND tax_amount >= 0 AND shipping_cost >= 0 AND total_amount >= 0
    ),
    CONSTRAINT order_dates_check CHECK (
        required_date IS NULL OR required_date >= order_date
    )
);

-- 인덱스
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_date ON orders(order_date DESC);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_warehouse ON orders(warehouse_id);
CREATE INDEX idx_orders_created_by ON orders(created_by);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
```

#### 5.3 order_items (주문 상세)
```sql
CREATE TABLE order_items (
    order_item_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    line_total DECIMAL(15,2) GENERATED ALWAYS AS ((quantity * unit_price) - discount_amount) STORED,
    quantity_picked DECIMAL(15,3) DEFAULT 0.000,
    quantity_shipped DECIMAL(15,3) DEFAULT 0.000,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    
    CONSTRAINT order_items_quantity_check CHECK (quantity > 0),
    CONSTRAINT order_items_price_check CHECK (unit_price >= 0),
    CONSTRAINT order_items_discount_check CHECK (discount_amount >= 0),
    CONSTRAINT order_items_picked_check CHECK (quantity_picked >= 0 AND quantity_picked <= quantity),
    CONSTRAINT order_items_shipped_check CHECK (quantity_shipped >= 0 AND quantity_shipped <= quantity_picked)
);

-- 인덱스
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

### 6. 배송 관리 (Shipping Management)

#### 6.1 carriers (운송업체)
```sql
CREATE TABLE carriers (
    carrier_id BIGSERIAL PRIMARY KEY,
    carrier_code VARCHAR(20) UNIQUE NOT NULL,
    carrier_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    service_areas TEXT[],
    rating DECIMAL(2,1) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT carriers_rating_check CHECK (rating >= 0.0 AND rating <= 5.0),
    CONSTRAINT carriers_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 인덱스
CREATE INDEX idx_carriers_code ON carriers(carrier_code);
CREATE INDEX idx_carriers_active ON carriers(is_active) WHERE is_active = true;
CREATE INDEX idx_carriers_rating ON carriers(rating DESC);
```

#### 6.2 shipments (배송)
```sql
CREATE TABLE shipments (
    shipment_id BIGSERIAL PRIMARY KEY,
    shipment_number VARCHAR(30) UNIQUE NOT NULL,
    order_id BIGINT NOT NULL,
    carrier_id BIGINT,
    tracking_number VARCHAR(100),
    shipment_date DATE,
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    shipping_cost DECIMAL(15,2) DEFAULT 0.00,
    weight DECIMAL(10,3),
    dimensions VARCHAR(100),
    shipment_status VARCHAR(20) DEFAULT 'PENDING',
    delivery_instructions TEXT,
    signature_required BOOLEAN DEFAULT false,
    notes TEXT,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (carrier_id) REFERENCES carriers(carrier_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    
    CONSTRAINT shipment_status_check CHECK (shipment_status IN (
        'PENDING', 'CONFIRMED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED'
    )),
    CONSTRAINT shipment_cost_check CHECK (shipping_cost >= 0),
    CONSTRAINT shipment_weight_check CHECK (weight IS NULL OR weight > 0),
    CONSTRAINT shipment_dates_check CHECK (
        actual_delivery_date IS NULL OR shipment_date IS NULL OR actual_delivery_date >= shipment_date
    )
);

-- 인덱스
CREATE INDEX idx_shipments_number ON shipments(shipment_number);
CREATE INDEX idx_shipments_order ON shipments(order_id);
CREATE INDEX idx_shipments_carrier ON shipments(carrier_id);
CREATE INDEX idx_shipments_tracking ON shipments(tracking_number) WHERE tracking_number IS NOT NULL;
CREATE INDEX idx_shipments_status ON shipments(shipment_status);
CREATE INDEX idx_shipments_date ON shipments(shipment_date DESC);
```

#### 6.3 tracking_events (배송 추적 이벤트)
```sql
CREATE TABLE tracking_events (
    event_id BIGSERIAL PRIMARY KEY,
    shipment_id BIGINT NOT NULL,
    event_type VARCHAR(30) NOT NULL,
    event_description TEXT,
    event_location VARCHAR(200),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by VARCHAR(100),
    notes TEXT,
    
    FOREIGN KEY (shipment_id) REFERENCES shipments(shipment_id) ON DELETE CASCADE,
    
    CONSTRAINT tracking_event_type_check CHECK (event_type IN (
        'CREATED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_HUB', 'OUT_FOR_DELIVERY', 
        'DELIVERY_ATTEMPTED', 'DELIVERED', 'EXCEPTION', 'RETURNED'
    )),
    CONSTRAINT tracking_coordinates_check CHECK (
        (latitude IS NULL AND longitude IS NULL) OR
        (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
    )
);

-- 인덱스
CREATE INDEX idx_tracking_shipment ON tracking_events(shipment_id);
CREATE INDEX idx_tracking_timestamp ON tracking_events(event_timestamp DESC);
CREATE INDEX idx_tracking_type ON tracking_events(event_type);
```

---

## 🔗 테이블 관계도

### 핵심 관계 요약
```
users 1:N orders (created_by)
users 1:N warehouses (manager_id)
users 1:N user_roles N:1 roles

categories 1:N products
products 1:N inventory
products 1:N order_items
products N:N suppliers (product_suppliers)

warehouses 1:N locations
warehouses 1:N inventory
warehouses 1:N orders

customers 1:N orders
orders 1:N order_items
orders 1:1 shipments

carriers 1:N shipments
shipments 1:N tracking_events

inventory 1:N inventory_transactions
```

### 참조 무결성 규칙
- **CASCADE DELETE**: 주문 삭제 시 주문 상세 삭제, 배송 삭제 시 추적 이벤트 삭제
- **RESTRICT DELETE**: 사용자, 상품, 창고 등 기준 데이터는 참조되는 경우 삭제 방지
- **SET NULL**: 선택적 참조의 경우 NULL 설정

---

## 📊 인덱스 전략

### 1. 기본 인덱스
- **Primary Key**: 모든 테이블에 BIGSERIAL 기본 키
- **Unique Key**: 비즈니스 코드 (product_code, order_number 등)
- **Foreign Key**: 모든 외래 키에 인덱스 생성

### 2. 성능 최적화 인덱스
```sql
-- 복합 인덱스
CREATE INDEX idx_inventory_product_warehouse ON inventory(product_id, warehouse_id);
CREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date DESC);
CREATE INDEX idx_transactions_inventory_date ON inventory_transactions(inventory_id, transaction_date DESC);

-- 부분 인덱스
CREATE INDEX idx_active_products ON products(product_name) WHERE is_active = true;
CREATE INDEX idx_available_inventory ON inventory(product_id) WHERE quantity_available > 0;
CREATE INDEX idx_pending_orders ON orders(order_date) WHERE order_status = 'PENDING';

-- GIN 인덱스 (전문 검색)
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('korean', product_name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_customers_search ON customers USING gin(to_tsvector('korean', customer_name));
```

### 3. 성능 모니터링
```sql
-- 느린 쿼리 식별
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 인덱스 사용량 모니터링
SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;
```

---

## 🛡️ 데이터 보안 및 무결성

### 1. 데이터 타입 제약
- **CHECK 제약**: 비즈니스 규칙 적용 (가격 ≥ 0, 상태 값 검증)
- **NOT NULL**: 필수 필드 정의
- **UNIQUE**: 중복 방지 (코드, 이메일 등)

### 2. 트리거 활용
```sql
-- 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 모든 테이블에 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. 행 수준 보안 (RLS)
```sql
-- 창고별 데이터 접근 제어
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY inventory_warehouse_policy ON inventory
    FOR ALL TO warehouse_users
    USING (warehouse_id IN (
        SELECT warehouse_id FROM user_warehouse_access 
        WHERE user_id = current_setting('app.current_user_id')::bigint
    ));
```

---

## 📈 성능 최적화 전략

### 1. 파티셔닝
```sql
-- 날짜별 파티셔닝 (대용량 테이블)
CREATE TABLE inventory_transactions_2025 PARTITION OF inventory_transactions
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE inventory_transactions_2026 PARTITION OF inventory_transactions
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

### 2. 머티리얼라이즈드 뷰
```sql
-- 재고 현황 요약
CREATE MATERIALIZED VIEW inventory_summary AS
SELECT 
    w.warehouse_name,
    p.product_name,
    SUM(i.quantity_on_hand) as total_quantity,
    SUM(i.quantity_reserved) as total_reserved,
    SUM(i.quantity_available) as total_available
FROM inventory i
JOIN products p ON i.product_id = p.product_id
JOIN warehouses w ON i.warehouse_id = w.warehouse_id
WHERE p.is_active = true AND w.is_active = true
GROUP BY w.warehouse_id, w.warehouse_name, p.product_id, p.product_name;

-- 자동 새로고침
CREATE INDEX ON inventory_summary(warehouse_name, product_name);
REFRESH MATERIALIZED VIEW CONCURRENTLY inventory_summary;
```

### 3. 연결 풀링
```yaml
# HikariCP 설정
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

---

## 🔄 데이터 마이그레이션 계획

### 1. Flyway 마이그레이션 스크립트
```sql
-- V1__Create_initial_schema.sql
-- V2__Add_inventory_tables.sql
-- V3__Add_order_management.sql
-- V4__Add_shipping_tables.sql
-- V5__Add_indexes_and_constraints.sql
```

### 2. 초기 데이터 스크립트
```sql
-- 기본 역할 데이터
INSERT INTO roles (role_name, description) VALUES 
('SYSTEM_ADMIN', '시스템 관리자'),
('WAREHOUSE_MANAGER', '창고 관리자'),
('ORDER_MANAGER', '주문 담당자'),
('GENERAL_USER', '일반 사용자');

-- 기본 카테고리
INSERT INTO categories (category_code, category_name) VALUES
('ELEC', '전자제품'),
('CLOTH', '의류'),
('FOOD', '식품'),
('BOOK', '도서');
```

### 3. 백업 및 복구 전략
```bash
# 정기 백업 스크립트
pg_dump -h localhost -U logistics_user -d logistics -f backup_$(date +%Y%m%d_%H%M%S).sql

# 증분 백업 (WAL 아카이빙)
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/archive/%f'
```

---

**📅 문서 최종 수정**: 2025년 7월 26일  
**👨‍💻 작성자**: 물류IT팀  
**🎯 다음 단계**: API 명세서 작성 및 화면 설계서 작성