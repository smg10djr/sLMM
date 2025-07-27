<script setup>
import { computed } from 'vue';
import { useLayoutStore } from '@/stores/useLayoutStore';

// 레이아웃 스토어 사용
const layoutStore = useLayoutStore();

// 다크모드 상태
const isDarkMode = computed(() => layoutStore.isDarkMode);

// 아이콘 선택
const icon = computed(() => isDarkMode.value ? '🌙' : '☀️');
const label = computed(() => isDarkMode.value ? '다크모드' : '라이트모드');

// 토글 핸들러
const handleToggle = () => {
    layoutStore.toggleDarkMode();
};

// 키보드 핸들러
const handleKeydown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleToggle();
    }
};
</script>

<template>
    <div class="dark-mode-toggle">
        <button 
            @click="handleToggle"
            @keydown="handleKeydown"
            :class="['toggle-button', { 'dark': isDarkMode }]"
            :aria-label="`${label}로 전환`"
            :title="`${label}로 전환 (Ctrl+D)`"
            type="button"
        >
            <!-- 아이콘 컨테이너 -->
            <div class="icon-container">
                <span class="icon" :class="{ 'dark': isDarkMode }">
                    {{ icon }}
                </span>
            </div>
            
            <!-- 라벨 (데스크톱에서만 표시) -->
            <span class="label">
                {{ label }}
            </span>
            
            <!-- 상태 표시기 -->
            <div class="status-indicator" :class="{ 'active': isDarkMode }">
                <div class="dot"></div>
            </div>
        </button>
        
        <!-- 단축키 힌트 -->
        <span class="shortcut-hint">Ctrl+D</span>
    </div>
</template>

<style scoped>
.dark-mode-toggle {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* 토글 버튼 */
.toggle-button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: transparent;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.875rem;
    color: #374151;
    min-width: 100px;
    justify-content: flex-start;
}

.toggle-button:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-button:focus {
    outline: none;
    ring: 2px solid #3b82f6;
    ring-offset: 2px;
}

.toggle-button:active {
    transform: translateY(0);
}

/* 다크모드 버튼 스타일 */
.toggle-button.dark {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
}

.toggle-button.dark:hover {
    background: #4b5563;
    border-color: #6b7280;
}

/* 아이콘 컨테이너 */
.icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.icon-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #1e3a8a, #3730a3);
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 50%;
}

.toggle-button.dark .icon-container::before {
    opacity: 1;
}

.icon {
    font-size: 1rem;
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
    transform-origin: center;
}

.icon.dark {
    transform: rotate(360deg);
}

/* 라벨 */
.label {
    font-weight: 500;
    white-space: nowrap;
    flex: 1;
}

/* 상태 표시기 */
.status-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 0.5rem;
    background: #e5e7eb;
    border-radius: 0.75rem;
    transition: all 0.3s ease;
    position: relative;
}

.status-indicator.active {
    background: #10b981;
}

.dot {
    width: 0.375rem;
    height: 0.375rem;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
    transform: translateX(-0.125rem);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.status-indicator.active .dot {
    transform: translateX(0.125rem);
}

/* 단축키 힌트 */
.shortcut-hint {
    font-size: 0.75rem;
    color: #9ca3af;
    background: #f3f4f6;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-family: monospace;
    display: none;
}

/* 반응형 디자인 */
@media (min-width: 1024px) {
    .shortcut-hint {
        display: block;
    }
}

@media (max-width: 768px) {
    .toggle-button {
        min-width: auto;
        padding: 0.5rem;
    }
    
    .label {
        display: none;
    }
    
    .status-indicator {
        display: none;
    }
}

/* 다크모드 전역 스타일 */
:global(.app-dark) .toggle-button:not(.dark) {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;
}

:global(.app-dark) .toggle-button:not(.dark):hover {
    background: #374151;
    border-color: #4b5563;
}

:global(.app-dark) .shortcut-hint {
    background: #374151;
    color: #d1d5db;
}

:global(.app-dark) .status-indicator {
    background: #4b5563;
}

/* 애니메이션 효과 */
@keyframes modeSwitch {
    0% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.1) rotate(180deg); }
    100% { transform: scale(1) rotate(360deg); }
}

.toggle-button:active .icon {
    animation: modeSwitch 0.6s ease-in-out;
}

/* 접근성 개선 */
.toggle-button:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
}

/* 고대비 모드 지원 */
@media (prefers-contrast: high) {
    .toggle-button {
        border-width: 2px;
    }
    
    .icon-container {
        border: 1px solid currentColor;
    }
}

/* 모션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
    .toggle-button,
    .icon-container,
    .icon,
    .status-indicator,
    .dot {
        transition: none;
    }
    
    .toggle-button:active .icon {
        animation: none;
    }
}
</style>