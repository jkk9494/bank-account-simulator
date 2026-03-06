import type { BankAccountNode, TransferEdge } from '../types';

export type LogType = 'INCOME' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'OUTGOING' | 'INTEREST' | 'ERROR';

export type SimulationLog = {
    monthStep: number; // 시뮬레이션 시작 후 경과 월 (1개월, 2개월 등)
    accountId: string;
    accountName: string;
    type: LogType;
    amount: number;
    description: string;
    balanceAfter: number; // 해당 이벤트 직후 잔액
};

export type SimulationResult = {
    finalNodes: BankAccountNode[];
    logs: SimulationLog[];
    totalMonths: number;
};

/**
 * 1개월 기간 동안의 시뮬레이션을 수행하고 변화된 노드 상태와 로그를 반환합니다.
 */
function simulateOneMonth(
    currentNodes: BankAccountNode[],
    edges: TransferEdge[],
    monthStep: number
): { nextNodes: BankAccountNode[]; monthLogs: SimulationLog[] } {
    const monthLogs: SimulationLog[] = [];

    // 깊은 복사를 통해 불변성 유지 (원시값 배열 형태 수준에서 깊은 복사)
    let nextNodes = currentNodes.map((n) => ({
        ...n,
        data: { ...n.data }
    }));

    const pushLog = (accountId: string, type: LogType, amount: number, description: string) => {
        const node = nextNodes.find((n) => n.id === accountId);
        if (!node) return;
        monthLogs.push({
            monthStep,
            accountId,
            accountName: node.data.accountName,
            type,
            amount,
            description,
            balanceAfter: node.data.initialBalance
        });
    };

    // 1. 수입 발생 단계 처리
    nextNodes.forEach((node) => {
        if (node.data.monthlyIncome > 0) {
            node.data.initialBalance += node.data.monthlyIncome;
            pushLog(node.id, 'INCOME', node.data.monthlyIncome, '수입 발생');
        }
    });

    // 2. 자동 이체(Transfer) 처리 (Edge 순회)
    edges.forEach((edge) => {
        const sourceNode = nextNodes.find((n) => n.id === edge.source);
        const targetNode = nextNodes.find((n) => n.id === edge.target);

        if (sourceNode && targetNode && edge.data?.items) {
            edge.data.items.forEach(item => {
                const amount = item.amount;
                if (amount <= 0) return;

                if (sourceNode.data.initialBalance >= amount) {
                    // 잔액이 충분할 때
                    sourceNode.data.initialBalance -= amount;
                    pushLog(sourceNode.id, 'TRANSFER_OUT', amount, `'${targetNode.data.accountName}'(으)로 이체 (${item.description})`);

                    targetNode.data.initialBalance += amount;
                    pushLog(targetNode.id, 'TRANSFER_IN', amount, `'${sourceNode.data.accountName}'(으로부터 입금 (${item.description})`);
                } else {
                    // 잔액 부족 에러 로깅
                    pushLog(sourceNode.id, 'ERROR', 0, `'${targetNode.data.accountName}' 이체 실패: ${item.description} (잔액 부족)`);
                }
            });
        }
    });

    // 3. 고정 지출 처리
    nextNodes.forEach((node) => {
        node.data.monthlyFixedOutgoings.forEach((outgoing) => {
            if (node.data.initialBalance >= outgoing.amount) {
                node.data.initialBalance -= outgoing.amount;
                pushLog(node.id, 'OUTGOING', outgoing.amount, `지출: ${outgoing.description}`);
            } else {
                pushLog(node.id, 'ERROR', 0, `지출 실패 '${outgoing.description}' (잔액 부족)`);
            }
        });
    });

    // 4. 이자 계산 처리 (월복리)
    nextNodes.forEach((node) => {
        if (node.data.interestTiers.length === 0 || node.data.initialBalance <= 0) return;

        // 이율은 잔액 구간에 따라 차등 적용 (가장 작은 maxAmount부터 오름차순 정렬)
        const sortedTiers = [...node.data.interestTiers].sort((a, b) => {
            if (a.maxAmount === null) return 1;
            if (b.maxAmount === null) return -1;
            return a.maxAmount - b.maxAmount;
        });

        let remainingBalance = node.data.initialBalance;
        let totalInterest = 0;
        let prevMax = 0;

        for (const tier of sortedTiers) {
            if (remainingBalance <= 0) break;

            let applyAmount = 0;
            if (tier.maxAmount === null) {
                applyAmount = remainingBalance;
            } else {
                const tierLimit = tier.maxAmount - prevMax;
                applyAmount = Math.min(remainingBalance, tierLimit);
            }

            if (applyAmount > 0) {
                // 연이자 / 12 = 월이자 계산
                const monthlyInterest = (applyAmount * (tier.rate / 100)) / 12;
                totalInterest += monthlyInterest;
            }

            remainingBalance -= applyAmount;
            if (tier.maxAmount !== null) {
                prevMax = tier.maxAmount;
            }
        }

        if (totalInterest > 0) {
            // 이자를 계산하여 잔액에 편입. (반올림은 뷰에서 처리하거나 엔진에서 처리, 엔진(만 원 단위 소수점)에서 유지하는 편이 정확함)
            node.data.initialBalance += totalInterest;
            pushLog(node.id, 'INTEREST', totalInterest, `이자 발생`);
        }
    });

    return { nextNodes, monthLogs };
}

/**
 * 주어진 개월 수 만큼 전체 시뮬레이션 동작을 실행하고 최종 결과물을 산출합니다.
 */
export function runSimulation(
    nodes: BankAccountNode[],
    edges: TransferEdge[],
    months: number
): SimulationResult {
    let currentNodes = nodes.map(n => ({ ...n, data: { ...n.data } })); // 초기 깊은 복사
    let allLogs: SimulationLog[] = [];

    for (let month = 1; month <= months; month++) {
        const { nextNodes, monthLogs } = simulateOneMonth(currentNodes, edges, month);
        currentNodes = nextNodes;
        allLogs = [...allLogs, ...monthLogs];
    }

    return {
        finalNodes: currentNodes, // 월 변동분이 적용된 노드들을 담음
        logs: allLogs,
        totalMonths: months
    };
}
