// Click Outside 디렉티브
// 요소 외부 클릭을 감지하여 콜백 함수를 실행

export const vClickOutside = {
    beforeMount(el, binding) {
        el.clickOutsideEvent = (event) => {
            // 클릭된 요소가 현재 요소 내부에 있는지 확인
            if (!(el === event.target || el.contains(event.target))) {
                // 외부 클릭 시 바인딩된 함수 실행
                if (typeof binding.value === 'function') {
                    binding.value(event);
                }
            }
        };
        
        // 문서에 클릭 이벤트 리스너 추가
        document.addEventListener('click', el.clickOutsideEvent);
        document.addEventListener('touchstart', el.clickOutsideEvent);
    },
    
    unmounted(el) {
        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        document.removeEventListener('click', el.clickOutsideEvent);
        document.removeEventListener('touchstart', el.clickOutsideEvent);
        delete el.clickOutsideEvent;
    }
};

// 기본 export로도 사용 가능
export default vClickOutside;