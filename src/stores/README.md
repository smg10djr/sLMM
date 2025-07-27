# Pinia Stores

Pinia 상태 관리 스토어 디렉토리

## 스토어 구조

### Layout & UI Stores
- `layout.js` - 레이아웃 상태 관리 (사이드바, 테마)
- `tabs.js` - 동적 탭 시스템 관리
- `notifications.js` - 전역 알림 관리

### Authentication & User
- `auth.js` - 인증 상태 관리 (JWT, 로그인)
- `user.js` - 사용자 정보 및 권한 관리

### Business Logic Stores
- `inventory.js` - 재고 데이터 상태 관리
- `orders.js` - 주문 데이터 상태 관리
- `shipping.js` - 배송 데이터 상태 관리
- `warehouse.js` - 창고 데이터 상태 관리

### Common Stores
- `common.js` - 공통 설정 (카테고리, 코드값)
- `loading.js` - 전역 로딩 상태 관리

## 스토어 사용 예시

```javascript
// stores/layout.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
  // State
  const sidebarCollapsed = ref(false)
  const darkMode = ref(false)
  const primaryColor = ref('emerald')

  // Getters
  const sidebarWidth = computed(() => 
    sidebarCollapsed.value ? '60px' : '240px'
  )

  // Actions
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value)
  }

  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value
    document.documentElement.classList.toggle('app-dark')
  }

  return {
    sidebarCollapsed,
    darkMode,
    primaryColor,
    sidebarWidth,
    toggleSidebar,
    toggleDarkMode
  }
})
```

## 컴포넌트에서 사용

```vue
<script setup>
import { useLayoutStore } from '@/stores/layout'

const layoutStore = useLayoutStore()

const handleToggle = () => {
  layoutStore.toggleSidebar()
}
</script>

<template>
  <button @click="handleToggle">
    사이드바 토글 ({{ layoutStore.sidebarWidth }})
  </button>
</template>
```

## 스토어 간 상호작용

```javascript
// stores/tabs.js
import { useLayoutStore } from './layout'

export const useTabsStore = defineStore('tabs', () => {
  const layoutStore = useLayoutStore()
  
  // layoutStore 상태에 따른 탭 동작 조정
  const getTabWidth = computed(() => {
    return layoutStore.sidebarCollapsed ? 'calc(100% - 60px)' : 'calc(100% - 240px)'
  })
  
  return { getTabWidth }
})
```