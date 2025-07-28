<template>
    <div 
        class="tooltip-wrapper"
        @mouseenter="showTooltip"
        @mouseleave="hideTooltip"
        @focus="showTooltip"
        @blur="hideTooltip"
    >
        <!-- 슬롯 콘텐츠 (툴팁을 표시할 대상 요소) -->
        <slot></slot>
        
        <!-- 툴팁 오버레이 -->
        <Teleport to="body">
            <div
                v-if="isVisible && tooltipText"
                ref="tooltipEl"
                class="custom-tooltip"
                :class="[
                    `tooltip-${position}`,
                    { 'tooltip-dark': isDark }
                ]"
                :style="tooltipStyle"
                role="tooltip"
                :aria-hidden="!isVisible"
            >
                <!-- 툴팁 화살표 -->
                <div class="tooltip-arrow" :class="`tooltip-arrow-${position}`"></div>
                
                <!-- 툴팁 내용 -->
                <div class="tooltip-content">
                    {{ tooltipText }}
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';

// Props
const props = defineProps({
    text: {
        type: String,
        required: true
    },
    position: {
        type: String,
        default: 'right',
        validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value)
    },
    delay: {
        type: Number,
        default: 300
    },
    offset: {
        type: Number,
        default: 8
    },
    isDark: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

// 반응형 상태
const isVisible = ref(false);
const tooltipEl = ref(null);
const targetEl = ref(null);
const showTimer = ref(null);
const hideTimer = ref(null);

// 툴팁 텍스트 계산
const tooltipText = computed(() => {
    return props.disabled ? '' : props.text;
});

// 툴팁 스타일 계산
const tooltipStyle = ref({
    position: 'fixed',
    zIndex: '9999',
    pointerEvents: 'none',
    opacity: '0',
    transform: 'scale(0.95)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
});

// 툴팁 위치 계산
const calculatePosition = async () => {
    if (!targetEl.value || !tooltipEl.value) return;
    
    await nextTick();
    
    const targetRect = targetEl.value.getBoundingClientRect();
    const tooltipRect = tooltipEl.value.getBoundingClientRect();
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    
    let top = 0;
    let left = 0;
    
    switch (props.position) {
        case 'right':
            top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
            left = targetRect.right + props.offset;
            break;
        case 'left':
            top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
            left = targetRect.left - tooltipRect.width - props.offset;
            break;
        case 'top':
            top = targetRect.top - tooltipRect.height - props.offset;
            left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
            break;
        case 'bottom':
            top = targetRect.bottom + props.offset;
            left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
            break;
    }
    
    // 뷰포트 경계 검사 및 조정
    if (left < 5) left = 5;
    if (left + tooltipRect.width > viewport.width - 5) {
        left = viewport.width - tooltipRect.width - 5;
    }
    if (top < 5) top = 5;
    if (top + tooltipRect.height > viewport.height - 5) {
        top = viewport.height - tooltipRect.height - 5;
    }
    
    tooltipStyle.value = {
        ...tooltipStyle.value,
        top: `${top}px`,
        left: `${left}px`,
        opacity: '1',
        transform: 'scale(1)'
    };
};

// 툴팁 표시
const showTooltip = async () => {
    if (props.disabled || !tooltipText.value) return;
    
    // 숨기기 타이머 취소
    if (hideTimer.value) {
        clearTimeout(hideTimer.value);
        hideTimer.value = null;
    }
    
    // 지연 후 표시
    showTimer.value = setTimeout(async () => {
        isVisible.value = true;
        await nextTick();
        await calculatePosition();
    }, props.delay);
};

// 툴팁 숨기기
const hideTooltip = () => {
    // 표시 타이머 취소
    if (showTimer.value) {
        clearTimeout(showTimer.value);
        showTimer.value = null;
    }
    
    // 즉시 숨기기
    hideTimer.value = setTimeout(() => {
        isVisible.value = false;
        tooltipStyle.value = {
            ...tooltipStyle.value,
            opacity: '0',
            transform: 'scale(0.95)'
        };
    }, 100);
};

// 윈도우 리사이즈 이벤트 핸들러
const handleResize = () => {
    if (isVisible.value) {
        calculatePosition();
    }
};

// 스크롤 이벤트 핸들러
const handleScroll = () => {
    if (isVisible.value) {
        hideTooltip();
    }
};

// 컴포넌트 마운트
onMounted(() => {
    // 타겟 요소 참조 설정
    targetEl.value = document.querySelector('.tooltip-wrapper') || null;
    
    // 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
});

// 컴포넌트 언마운트
onUnmounted(() => {
    // 타이머 정리
    if (showTimer.value) clearTimeout(showTimer.value);
    if (hideTimer.value) clearTimeout(hideTimer.value);
    
    // 이벤트 리스너 정리
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('scroll', handleScroll, true);
});
</script>

<style scoped>
.tooltip-wrapper {
    display: inline-block;
    width: 100%;
}

/* 툴팁 기본 스타일 */
.custom-tooltip {
    position: fixed;
    max-width: 250px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.4;
    word-wrap: break-word;
    z-index: 9999;
    pointer-events: none;
    opacity: 0;
    transform: scale(0.95);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 툴팁 내용 */
.tooltip-content {
    background: #1f2937;
    color: white;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3),
                0 4px 6px -2px rgba(0, 0, 0, 0.2);
    border: 1px solid #374151;
    position: relative;
    z-index: 1;
}

/* 다크모드 툴팁 */
.tooltip-dark .tooltip-content {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
}

/* 툴팁 화살표 */
.tooltip-arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #1f2937;
    border: 1px solid #374151;
    border-right: none;
    border-bottom: none;
    transform: rotate(45deg);
    z-index: 0;
}

/* 다크모드 화살표 */
.tooltip-dark .tooltip-arrow {
    background: #374151;
    border-color: #4b5563;
}

/* 위치별 화살표 스타일 */
.tooltip-arrow-right {
    top: 50%;
    left: -4px;
    margin-top: -4px;
}

.tooltip-arrow-left {
    top: 50%;
    right: -4px;
    margin-top: -4px;
    transform: rotate(225deg);
}

.tooltip-arrow-top {
    bottom: -4px;
    left: 50%;
    margin-left: -4px;
    transform: rotate(135deg);
}

.tooltip-arrow-bottom {
    top: -4px;
    left: 50%;
    margin-left: -4px;
    transform: rotate(315deg);
}

/* 애니메이션 */
.custom-tooltip.tooltip-visible {
    opacity: 1;
    transform: scale(1);
}

/* 반응형 최적화 */
@media (max-width: 768px) {
    .custom-tooltip {
        max-width: 200px;
        font-size: 0.8125rem;
    }
    
    .tooltip-content {
        padding: 0.375rem 0.625rem;
    }
}

/* 접근성 개선 */
@media (prefers-reduced-motion: reduce) {
    .custom-tooltip {
        transition: none !important;
    }
}

/* 고대비 모드 지원 */
@media (prefers-contrast: high) {
    .tooltip-content {
        border-width: 2px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    }
    
    .tooltip-arrow {
        border-width: 2px;
    }
}
</style>