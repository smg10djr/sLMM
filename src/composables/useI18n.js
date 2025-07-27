// 임시 다국어 지원 함수
// 추후 Vue I18n으로 교체 예정

const messages = {
    ko: {
        tabs: {
            scrollLeft: '왼쪽으로 스크롤',
            scrollRight: '오른쪽으로 스크롤',
            showAllTabs: '모든 탭 보기',
            options: '탭 옵션',
            openTabs: '열린 탭',
            closeTab: '{title} 탭 닫기',
            close: '닫기',
            closeOthers: '다른 탭 닫기',
            closeAll: '모든 탭 닫기',
            settings: '설정',
            save: '저장',
            unsavedChanges: '저장되지 않은 변경사항'
        }
    },
    en: {
        tabs: {
            scrollLeft: 'Scroll left',
            scrollRight: 'Scroll right',
            showAllTabs: 'Show all tabs',
            options: 'Tab options',
            openTabs: 'Open tabs',
            closeTab: 'Close {title} tab',
            close: 'Close',
            closeOthers: 'Close others',
            closeAll: 'Close all',
            settings: 'Settings',
            save: 'Save',
            unsavedChanges: 'Unsaved changes'
        }
    }
};

const currentLocale = 'ko'; // 기본 한국어

export function useI18n() {
    const t = (key, params = {}) => {
        const keys = key.split('.');
        let message = messages[currentLocale];
        
        for (const k of keys) {
            message = message?.[k];
        }
        
        if (!message) {
            return key; // 번역이 없으면 키 반환
        }
        
        // 파라미터 치환
        return message.replace(/\{(\w+)\}/g, (match, param) => {
            return params[param] || match;
        });
    };
    
    return {
        t,
        locale: currentLocale
    };
}

// 전역 사용을 위한 기본 export
export default useI18n;