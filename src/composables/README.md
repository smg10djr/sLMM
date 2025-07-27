# Composables

Vue 3 Composition API 재사용 로직 디렉토리

## Composable 구조

### UI/Layout Composables
- `useTabs.js` - 동적 탭 시스템 로직
- `useSidebar.js` - 사이드바 상태 관리
- `useTheme.js` - 테마 및 다크모드 관리
- `useResponsive.js` - 반응형 브레이크포인트 관리

### Data Management
- `useApi.js` - API 호출 공통 로직
- `usePagination.js` - 페이지네이션 관리
- `useSearch.js` - 검색 및 필터링
- `useSort.js` - 정렬 기능

### Form & Validation
- `useForm.js` - 폼 상태 관리
- `useValidation.js` - 유효성 검증
- `useFileUpload.js` - 파일 업로드 관리

### Business Logic
- `useInventory.js` - 재고 관련 비즈니스 로직
- `useOrders.js` - 주문 처리 로직
- `useShipping.js` - 배송 관리 로직
- `useWarehouse.js` - 창고 운영 로직

### Utilities
- `useLocalStorage.js` - 로컬스토리지 관리
- `useDebounce.js` - 디바운스 처리
- `useEventListener.js` - 이벤트 리스너 관리
- `useClipboard.js` - 클립보드 복사/붙여넣기

## Composable 사용 예시

```javascript
// composables/useTabs.js
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export function useTabs() {
  const router = useRouter()
  const tabs = ref([])
  const activeTabId = ref(null)

  const openTab = (route, title, icon) => {
    const existingTab = tabs.value.find(tab => tab.route === route)
    
    if (existingTab) {
      activeTabId.value = existingTab.id
    } else {
      const newTab = {
        id: generateId(),
        route,
        title,
        icon,
        closable: route !== '/' // 홈 탭은 닫기 불가
      }
      tabs.value.push(newTab)
      activeTabId.value = newTab.id
    }
    
    router.push(route)
  }

  const closeTab = (tabId) => {
    const tabIndex = tabs.value.findIndex(tab => tab.id === tabId)
    if (tabIndex === -1) return

    tabs.value.splice(tabIndex, 1)

    // 활성 탭이 닫힌 경우 다른 탭으로 이동
    if (activeTabId.value === tabId && tabs.value.length > 0) {
      const nextTab = tabs.value[Math.max(0, tabIndex - 1)]
      activeTabId.value = nextTab.id
      router.push(nextTab.route)
    }
  }

  const activeTab = computed(() => 
    tabs.value.find(tab => tab.id === activeTabId.value)
  )

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

  return {
    tabs,
    activeTabId,
    activeTab,
    openTab,
    closeTab
  }
}
```

## 컴포넌트에서 사용

```vue
<script setup>
import { useTabs } from '@/composables/useTabs'

const { tabs, activeTab, openTab, closeTab } = useTabs()

const handleMenuClick = (menuItem) => {
  openTab(menuItem.route, menuItem.label, menuItem.icon)
}
</script>

<template>
  <div class="tab-container">
    <div 
      v-for="tab in tabs" 
      :key="tab.id"
      :class="{ active: tab.id === activeTab?.id }"
      class="tab"
    >
      <i :class="tab.icon"></i>
      {{ tab.title }}
      <button 
        v-if="tab.closable"
        @click="closeTab(tab.id)"
        class="close-btn"
      >×</button>
    </div>
  </div>
</template>
```

## API Composable 예시

```javascript
// composables/useApi.js
import { ref } from 'vue'

export function useApi() {
  const loading = ref(false)
  const error = ref(null)

  const apiCall = async (apiFunction, ...args) => {
    loading.value = true
    error.value = null

    try {
      const result = await apiFunction(...args)
      return result
    } catch (err) {
      error.value = err.message || 'API 호출 중 오류가 발생했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    apiCall
  }
}
```