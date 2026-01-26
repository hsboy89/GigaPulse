import { useEffect } from 'react';

/**
 * 개발자 도구 및 우클릭을 방지하는 훅
 * 완벽한 보안은 아니지만 일반 사용자의 접근을 어렵게 만듭니다.
 */
export function usePreventDevTools() {
    useEffect(() => {
        // 우클릭 방지
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // 개발자 도구 단축키 방지
        const handleKeyDown = (e: KeyboardEvent) => {
            // F12
            if (e.key === 'F12') {
                e.preventDefault();
                return;
            }

            // Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspector)
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
                e.preventDefault();
                return;
            }

            // Ctrl+U (View Source)
            if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
                e.preventDefault();
                return;
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
}
