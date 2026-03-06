import type { Node, Edge } from '@xyflow/react';

// ==========================================
// 1. 통장 노드 (Bank Account Node) 정의
// ==========================================

export type InterestRateTier = {
    id: string;
    maxAmount: number | null; // null이면 '그 외' 무제한 구간을 의미
    rate: number; // 연 이자율 (%)
};

export type BankAccountData = {
    accountName: string;
    initialBalance: number; // 초기 잔액 (만 원 단위)
    monthlyIncome: number; // 매월 고정 수입 (만 원 단위)
    monthlyFixedOutgoings: {
        id: string;
        description: string;
        amount: number; // 지출액 (만 원 단위)
    }[];
    interestTiers: InterestRateTier[]; // 구간별 연이자 정렬
    [key: string]: unknown;
};

export type BankAccountNode = Node<BankAccountData, 'bankAccount'>;

// ==========================================
// 2. 이체 연결선 (Transfer Edge) 정의
// ==========================================

export type TransferItem = {
    id: string;
    amount: number; // 이체 금액 (만 원 단위)
    description: string; // 이체 항목/이유
};

export type TransferEdgeData = {
    items: TransferItem[];
    [key: string]: unknown;
};

export type TransferEdge = Edge<TransferEdgeData, 'transfer'>;
