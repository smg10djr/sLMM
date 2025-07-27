<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// 드롭다운 상태 관리
const isOpen = ref(false);
const dropdownRef = ref(null);

// 사용자 정보 (실제로는 스토어나 props에서 받아올 예정)
const user = ref({
    name: '김물류',
    email: 'kim.logistics@company.com',
    role: '시스템 관리자',
    department: '물류관리팀',
    avatar: '👤', // 임시 아바타
    initials: '김물',
    permissions: ['read', 'write', 'admin'], // 권한 정보
    lastLogin: '2025-01-27 14:30'
});

// 드롭다운 토글
const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
};

// 외부 클릭 시 드롭다운 닫기
const handleClickOutside = (event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isOpen.value = false;
    }
};

// 메뉴 아이템 클릭 핸들러
const handleMenuClick = (action) => {
    console.log(`Menu action: ${action}`);
    isOpen.value = false;
    
    switch (action) {
        case 'profile':
            // 프로필 페이지로 이동 (향후 구현)
            console.log('프로필 페이지로 이동');
            break;
        case 'preferences':
            // 환경설정 페이지로 이동
            console.log('환경설정 페이지로 이동');
            break;
        case 'admin':
            // 시스템 관리 페이지로 이동 (관리자 전용)
            console.log('시스템 관리 페이지로 이동');
            break;
        case 'notifications':
            // 알림 설정 페이지로 이동
            console.log('알림 설정 페이지로 이동');
            break;
        case 'help':
            // 도움말 페이지로 이동
            console.log('도움말 페이지로 이동');
            break;
        case 'logout':
            // 로그아웃 확인 및 처리
            if (confirm('정말 로그아웃 하시겠습니까?')) {
                console.log('로그아웃 처리 중...');
                // 실제 로그아웃 로직 (JWT 토큰 제거, 리다이렉트 등)
            }
            break;
        default:
            console.log(`알 수 없는 액션: ${action}`);
    }
};

// 라이프사이클 훅
onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
    <div class="user-dropdown" ref="dropdownRef">
        <!-- 아바타 버튼 -->
        <button 
            @click="toggleDropdown"
            class="avatar-button"
            :class="{ 'active': isOpen }"
            aria-label="사용자 메뉴"
        >
            <div class="avatar-container">
                <div class="avatar">
                    {{ user.initials }}
                </div>
                <div class="user-info">
                    <span class="user-name">{{ user.name }}</span>
                    <span class="user-role">{{ user.role }}</span>
                </div>
                <div class="dropdown-arrow" :class="{ 'rotated': isOpen }">
                    ▼
                </div>
            </div>
        </button>

        <!-- 드롭다운 메뉴 -->
        <div 
            v-if="isOpen" 
            class="dropdown-menu"
            role="menu"
        >
            <!-- 사용자 정보 헤더 -->
            <div class="user-header">
                <div class="avatar large">
                    {{ user.initials }}
                </div>
                <div class="user-details">
                    <div class="name">{{ user.name }}</div>
                    <div class="email">{{ user.email }}</div>
                    <div class="role-info">
                        <span class="role">{{ user.role }}</span>
                        <span class="department">{{ user.department }}</span>
                    </div>
                    <div class="last-login">최근 로그인: {{ user.lastLogin }}</div>
                </div>
            </div>

            <hr class="divider">

            <!-- 메뉴 아이템들 -->
            <div class="menu-items">
                <button 
                    @click="handleMenuClick('profile')"
                    class="menu-item"
                    role="menuitem"
                >
                    <span class="icon">👤</span>
                    <span class="label">내 프로필</span>
                    <span class="shortcut">Ctrl+P</span>
                </button>

                <button 
                    @click="handleMenuClick('preferences')"
                    class="menu-item"
                    role="menuitem"
                >
                    <span class="icon">🎛️</span>
                    <span class="label">환경설정</span>
                </button>

                <!-- 관리자 전용 메뉴 -->
                <button 
                    v-if="user.permissions.includes('admin')"
                    @click="handleMenuClick('admin')"
                    class="menu-item"
                    role="menuitem"
                >
                    <span class="icon">🔧</span>
                    <span class="label">시스템 관리</span>
                    <span class="badge admin">관리자</span>
                </button>

                <button 
                    @click="handleMenuClick('notifications')"
                    class="menu-item"
                    role="menuitem"
                >
                    <span class="icon">🔔</span>
                    <span class="label">알림 설정</span>
                    <span class="notification-count">3</span>
                </button>

                <button 
                    @click="handleMenuClick('help')"
                    class="menu-item"
                    role="menuitem"
                >
                    <span class="icon">❓</span>
                    <span class="label">도움말</span>
                    <span class="shortcut">F1</span>
                </button>

                <hr class="divider">

                <button 
                    @click="handleMenuClick('logout')"
                    class="menu-item logout"
                    role="menuitem"
                >
                    <span class="icon">🚪</span>
                    <span class="label">로그아웃</span>
                    <span class="shortcut">Ctrl+Q</span>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.user-dropdown {
    position: relative;
    display: inline-block;
}

/* 아바타 버튼 */
.avatar-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: background-color 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
}

.avatar-button:hover {
    background-color: #f3f4f6;
}

.avatar-button.active {
    background-color: #e5e7eb;
}

.avatar-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

/* 아바타 스타일 */
.avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    flex-shrink: 0;
}

.avatar.large {
    width: 48px;
    height: 48px;
    font-size: 1rem;
}

/* 사용자 정보 */
.user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    flex: 1;
}

.user-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1f2937;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
}

.user-role {
    font-size: 0.75rem;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
}

/* 드롭다운 화살표 */
.dropdown-arrow {
    font-size: 0.75rem;
    color: #6b7280;
    transition: transform 0.2s ease;
    flex-shrink: 0;
}

.dropdown-arrow.rotated {
    transform: rotate(180deg);
}

/* 드롭다운 메뉴 */
.dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    min-width: 280px;
    z-index: 1000;
    animation: dropdownFadeIn 0.2s ease-out;
}

@keyframes dropdownFadeIn {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 사용자 정보 헤더 */
.user-header {
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.user-details {
    flex: 1;
    min-width: 0;
}

.user-details .name {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.25rem;
}

.user-details .email {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
}

.role-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
}

.user-details .role {
    font-size: 0.75rem;
    color: #1f2937;
    background: #dbeafe;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    display: inline-block;
    font-weight: 600;
}

.user-details .department {
    font-size: 0.75rem;
    color: #6b7280;
    background: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    display: inline-block;
}

.last-login {
    font-size: 0.625rem;
    color: #9ca3af;
    margin-top: 0.25rem;
}

/* 구분선 */
.divider {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 0;
}

/* 메뉴 아이템들 */
.menu-items {
    padding: 0.5rem;
}

.menu-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    color: #374151;
    transition: background-color 0.2s ease;
    text-align: left;
}

.menu-item:hover {
    background-color: #f3f4f6;
}

.menu-item.logout {
    color: #dc2626;
}

.menu-item.logout:hover {
    background-color: #fef2f2;
}

.menu-item .icon {
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.menu-item .label {
    flex: 1;
    font-weight: 500;
}

/* 키보드 단축키 표시 */
.menu-item .shortcut {
    font-size: 0.75rem;
    color: #9ca3af;
    background: #f3f4f6;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-family: monospace;
}

/* 배지 스타일 */
.menu-item .badge {
    font-size: 0.625rem;
    padding: 0.125rem 0.375rem;
    border-radius: 0.75rem;
    font-weight: 600;
}

.menu-item .badge.admin {
    background: #fef3c7;
    color: #d97706;
}

/* 알림 카운트 */
.menu-item .notification-count {
    background: #ef4444;
    color: white;
    font-size: 0.625rem;
    padding: 0.125rem 0.375rem;
    border-radius: 0.75rem;
    font-weight: 600;
    min-width: 1.25rem;
    text-align: center;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
    .user-info {
        display: none;
    }
    
    .dropdown-menu {
        min-width: 240px;
        right: -1rem;
    }
    
    .avatar-button {
        padding: 0.25rem;
    }
}

/* 다크모드 지원 (향후 구현) */
.dark .avatar-button:hover {
    background-color: #374151;
}

.dark .dropdown-menu {
    background: #1f2937;
    border-color: #374151;
}

.dark .user-details .name {
    color: #f9fafb;
}

.dark .user-details .email {
    color: #d1d5db;
}

.dark .menu-item {
    color: #d1d5db;
}

.dark .menu-item:hover {
    background-color: #374151;
}
</style>