import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind CSS 클래스 병합용 유틸리티 함수 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** 
 * '만 원' 단위 숫자를 한국어 포맷의 문자열로 변환합니다. 
 * 예: 100 -> "100", 1234 -> "1,234"
 */
export function formatCurrencyUnit(amount: number): string {
    if (isNaN(amount)) return "0";
    return new Intl.NumberFormat('ko-KR', {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0
    }).format(amount);
}

/** 
 * '만 원' 단위 숫자를 입력받아 "O억 O만 원" 포맷으로 변환합니다. 
 */
export function formatCurrencyLabel(amount: number): string {
    if (isNaN(amount) || amount === 0) return "0원";

    const eok = Math.floor(amount / 10000);
    const man = Math.floor(amount % 10000);

    if (eok > 0) {
        if (man > 0) {
            return `${formatCurrencyUnit(eok)}억 ${formatCurrencyUnit(man)}만 원`;
        }
        return `${formatCurrencyUnit(eok)}억 원`;
    }

    return `${formatCurrencyUnit(man)}만 원`;
}

/**
 * 금액 입력 필드(텍스트)에서 들어오는 입력을 정제합니다.
 * - 숫자와 소수점(.) 하나만 허용합니다.
 * - 앞자리의 불필요한 0을 제거합니다 (단, "0." 형태는 허용).
 */
export function sanitizeNumberInput(value: string): string {
    // 1. 숫자와 소수점이 아닌 문자 제거
    let sanitized = value.replace(/[^0-9.]/g, '');

    // 2. 소수점이 여러 개 있는 경우 첫 번째만 남김
    const parts = sanitized.split('.');
    if (parts.length > 2) {
        sanitized = parts[0] + '.' + parts.slice(1).join('');
    }

    // 3. 앞자리의 불필요한 0 제거 (단, "0" 그 자체나 "0."은 허용)
    if (sanitized.length > 1 && sanitized.startsWith('0') && sanitized[1] !== '.') {
        sanitized = sanitized.replace(/^0+/, '');
        if (sanitized === '') sanitized = '0';
    }

    // 빈 문자열인 경우 '0'으로 두지 않고 빈 상태 유지 (사용자 입력 편의를 위해)
    return sanitized;
}
