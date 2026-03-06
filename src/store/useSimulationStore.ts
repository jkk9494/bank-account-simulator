import { create } from 'zustand';
import {
    type Connection,
    type EdgeChange,
    type NodeChange,
    applyNodeChanges,
    applyEdgeChanges
} from '@xyflow/react';
import type { BankAccountNode, TransferEdge, TransferEdgeData } from '../types';
import { runSimulation as executeSimulation } from '../engine/simulationEngine';
import type { SimulationLog } from '../engine/simulationEngine';

export type SimulationState = {
    nodes: BankAccountNode[];
    edges: TransferEdge[];

    // 시뮬레이션 관련 상태
    isSimulationRunning: boolean;
    simulationLogs: SimulationLog[];
    simulationResultNodes: BankAccountNode[] | null;
    totalMonths: number;
    totalPrincipal: number;
    totalInterest: number;

    // 모달 상태
    editingNodeId: string | null;
    editingEdgeId: string | null;

    // React Flow handlers
    onNodesChange: (changes: NodeChange<BankAccountNode>[]) => void;
    onEdgesChange: (changes: EdgeChange<TransferEdge>[]) => void;
    onConnect: (connection: Connection) => void;

    // Actions
    addNode: (node: BankAccountNode) => void;
    updateNodeData: (id: string, data: Partial<BankAccountNode['data']>) => void;
    removeNode: (id: string) => void;
    updateEdgeData: (id: string, data: Partial<TransferEdge['data']>) => void;

    setEditingNodeId: (id: string | null) => void;
    setEditingEdgeId: (id: string | null) => void;
    setTotalMonths: (months: number) => void;

    // 시뮬레이션 실행 액션
    runSimulation: () => void;
    resetSimulation: () => void;
    showResults: boolean;
    setShowResults: (show: boolean) => void;

    // 자동이체 등록 모달
    isAddTransferModalOpen: boolean;
    setIsAddTransferModalOpen: (open: boolean) => void;
    addTransfer: (source: string, target: string, amount: number, description: string) => void;
    removeEdge: (id: string) => void;

    // 데이터 관리 (Import/Export/Clear)
    isDataModalOpen: boolean;
    setIsDataModalOpen: (open: boolean) => void;
    clearAllData: () => void;
    importData: (data: { nodes: BankAccountNode[], edges: TransferEdge[] }) => void;

    // 공통 Confirm 모달
    isConfirmModalOpen: boolean;
    setIsConfirmModalOpen: (open: boolean) => void;
    confirmModalConfig: {
        title: string;
        message: string;
        onConfirm: () => void;
    } | null;
    openConfirmModal: (config: { title: string, message: string, onConfirm: () => void }) => void;
};

const initialNodes: BankAccountNode[] = [
    {
        id: '급여통장',
        type: 'bankAccount',
        position: { x: 100, y: 150 },
        data: {
            accountName: 'KB 급여통장',
            initialBalance: 300,
            monthlyIncome: 450,
            monthlyFixedOutgoings: [],
            interestTiers: [{ id: '1', maxAmount: null, rate: 1.5 }]
        }
    },
    {
        id: '생활비통장',
        type: 'bankAccount',
        position: { x: 500, y: 150 },
        data: {
            accountName: '토스 생활비',
            initialBalance: 150,
            monthlyIncome: 0,
            monthlyFixedOutgoings: [
                { id: '1', description: '넷플릭스', amount: 2 },
                { id: '2', description: '휴대폰요금', amount: 8 }
            ],
            interestTiers: [
                { id: '1', maxAmount: 200, rate: 2.0 },
                { id: '2', maxAmount: null, rate: 1.0 }
            ]
        }
    }
];

const initialEdges: TransferEdge[] = [
    {
        id: 'e-급여통장-생활비통장',
        source: '급여통장',
        target: '생활비통장',
        type: 'transfer',
        data: {
            items: [{ id: 'init-1', amount: 150, description: '생활비 이체' }]
        }
    }
];

export const useSimulationStore = create<SimulationState>((set, get) => ({
    nodes: initialNodes,
    edges: initialEdges,

    isSimulationRunning: false,
    simulationLogs: [],
    simulationResultNodes: null,
    totalMonths: 12,
    totalPrincipal: 0,
    totalInterest: 0,
    showResults: false,

    isAddTransferModalOpen: false,
    isDataModalOpen: false,
    isConfirmModalOpen: false,
    confirmModalConfig: null,

    editingNodeId: null,
    editingEdgeId: null,

    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes) as BankAccountNode[],
        });
    },

    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges) as TransferEdge[],
        });
    },

    onConnect: (connection) => {
        const { source, target } = connection;
        if (!source || !target || source === target) return;
        get().addTransfer(source, target, 10, '새 자동이체');
    },

    addNode: (node) => {
        set({ nodes: [...get().nodes, node] });
    },

    updateNodeData: (id, data) => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, ...data } };
                }
                return node;
            })
        });
    },

    removeNode: (id) => {
        set({
            nodes: get().nodes.filter((node) => node.id !== id),
            edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id)
        });
    },

    updateEdgeData: (id, data) => {
        set({
            edges: get().edges.map((edge) => {
                if (edge.id === id) {
                    return { ...edge, data: { ...edge.data, ...data } as TransferEdgeData };
                }
                return edge;
            }) as TransferEdge[]
        })
    },

    setEditingNodeId: (id) => set({ editingNodeId: id }),
    setEditingEdgeId: (id) => set({ editingEdgeId: id }),
    setTotalMonths: (months) => set({ totalMonths: months }),
    setShowResults: (show) => set({ showResults: show }),
    setIsAddTransferModalOpen: (open) => set({ isAddTransferModalOpen: open }),
    setIsDataModalOpen: (open) => set({ isDataModalOpen: open }),
    setIsConfirmModalOpen: (open) => set({ isConfirmModalOpen: open }),
    openConfirmModal: (config) => set({
        isConfirmModalOpen: true,
        confirmModalConfig: config
    }),

    clearAllData: () => {
        get().resetSimulation();
        set({
            nodes: [],
            edges: []
        });
    },

    importData: (data) => {
        get().resetSimulation();
        set({
            nodes: data.nodes,
            edges: data.edges
        });
    },

    addTransfer: (source, target, amount, description) => {
        const edges = get().edges;
        const existingEdge = edges.find(e => e.source === source && e.target === target);

        const newItem = {
            id: `item-${Date.now()}`,
            amount,
            description
        };

        if (existingEdge) {
            const updatedEdges = edges.map(e => {
                if (e.id === existingEdge.id) {
                    return {
                        ...e,
                        data: {
                            ...e.data,
                            items: [...(e.data?.items || []), newItem]
                        }
                    };
                }
                return e;
            });
            set({ edges: updatedEdges as TransferEdge[] });
        } else {
            const newEdge: TransferEdge = {
                id: `e-${source}-${target}-${Date.now()}`,
                source,
                target,
                type: 'transfer',
                data: {
                    items: [newItem]
                }
            };
            set({ edges: [...edges, newEdge] });
        }
    },

    removeEdge: (id) => {
        set({
            edges: get().edges.filter(e => e.id !== id)
        });
    },

    runSimulation: () => {
        const { nodes, edges, totalMonths, simulationResultNodes, simulationLogs } = get();

        const startingNodes = simulationResultNodes ? nodes.map(node => {
            const resultForThisNode = simulationResultNodes.find(rn => rn.id === node.id);
            if (resultForThisNode) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        initialBalance: resultForThisNode.data.initialBalance
                    }
                };
            }
            return node;
        }) : nodes;

        const result = executeSimulation(startingNodes, edges, totalMonths);

        // 총 원금 및 총 이자 계산
        const initialBalanceSum = nodes.reduce((sum, n) => sum + n.data.initialBalance, 0);
        const totalIncome = result.logs.filter(l => l.type === 'INCOME').reduce((sum, l) => sum + l.amount, 0);
        const totalInterest = result.logs.filter(l => l.type === 'INTEREST').reduce((sum, l) => sum + l.amount, 0);

        const lastMonthStep = simulationLogs.length > 0 ? simulationLogs[simulationLogs.length - 1].monthStep : 0;
        const adjustedNewLogs = result.logs.map(log => ({
            ...log,
            monthStep: log.monthStep + lastMonthStep
        }));

        set({
            isSimulationRunning: true,
            simulationLogs: [...simulationLogs, ...adjustedNewLogs],
            simulationResultNodes: result.finalNodes,
            totalPrincipal: initialBalanceSum + totalIncome,
            totalInterest: totalInterest,
            showResults: true,
        });
    },

    resetSimulation: () => {
        set({
            isSimulationRunning: false,
            simulationLogs: [],
            simulationResultNodes: null,
            totalPrincipal: 0,
            totalInterest: 0,
            showResults: false,
            isAddTransferModalOpen: false,
        });
    }
}));
