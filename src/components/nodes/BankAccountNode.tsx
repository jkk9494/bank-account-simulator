import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { BankAccountNode } from '../../types';
import { formatCurrencyLabel, cn } from '../../utils/utils';
import { Settings, Plus, Minus, TrendingUp } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import NumberTicker from '../ui/NumberTicker';

export default function BankAccountNode({ id, data }: NodeProps<BankAccountNode>) {
    const { accountName, initialBalance, monthlyIncome, monthlyFixedOutgoings, interestTiers } = data;
    const setEditingNodeId = useSimulationStore((state) => state.setEditingNodeId);
    const simulationResultNodes = useSimulationStore((state) => state.simulationResultNodes);
    const isSimulationRunning = useSimulationStore((state) => state.isSimulationRunning);

    // 시뮬레이션 결과가 있다면 해당 노드(의 정보가 담긴 노드)의 잔액을 가져옴
    const resultNode = simulationResultNodes?.find(n => n.id === id);
    const displayedBalance = resultNode ? resultNode.data.initialBalance : initialBalance;

    // 총 지출 계산
    const totalOutgoings = monthlyFixedOutgoings?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

    return (
        <div className="group relative">
            <Handle
                type="target"
                position={Position.Left}
                className="w-5 h-5 bg-white border-2 border-gray-300 shadow-sm !left-[-10px] hover:border-toss-blue hover:bg-blue-50 transition-all z-10"
            />

            <div className={cn(
                "min-w-[240px] bg-white rounded-2xl p-5 shadow-toss border border-transparent transition-all",
                "hover:shadow-md hover:border-gray-100",
                isSimulationRunning && "ring-2 ring-toss-blue/30"
            )}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-gray-500 text-xs font-medium mb-1">{accountName}</h3>
                        <div className="text-xl font-bold text-gray-900 flex items-baseline gap-1">
                            <NumberTicker
                                value={displayedBalance}
                                formatter={(v) => formatCurrencyLabel(v)}
                                duration={800}
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => setEditingNodeId(id)}
                        className="p-1.5 bg-gray-50 text-gray-400 hover:text-toss-blue hover:bg-toss-light-blue rounded-lg transition-all"
                    >
                        <Settings size={18} />
                    </button>
                </div>

                <div className="space-y-2">
                    {monthlyIncome > 0 && (
                        <div className="flex items-center text-[13px] text-gray-600">
                            <Plus size={14} className="text-blue-500 mr-1.5" />
                            <span className="flex-1">월 수입</span>
                            <span className="font-semibold text-blue-600">+{formatCurrencyLabel(monthlyIncome)}</span>
                        </div>
                    )}

                    {totalOutgoings > 0 && (
                        <div className="flex items-center text-[13px] text-gray-600">
                            <Minus size={14} className="text-toss-red mr-1.5" />
                            <span className="flex-1">월 지출</span>
                            <span className="font-semibold text-toss-red">-{formatCurrencyLabel(totalOutgoings)}</span>
                        </div>
                    )}

                    <div className="flex items-center text-[13px] text-gray-600">
                        <TrendingUp size={14} className="text-gray-400 mr-1.5" />
                        <span className="flex-1">이자율</span>
                        <span className="font-semibold">
                            최대 연 {interestTiers?.length > 0 ? Math.max(...interestTiers.map(t => t.rate)) : 0}%
                        </span>
                    </div>
                </div>

                {monthlyFixedOutgoings?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-50">
                        {monthlyFixedOutgoings.slice(0, 2).map((og) => (
                            <div key={og.id} className="text-[11px] text-gray-400 flex justify-between">
                                <span>• {og.description}</span>
                                <span>{formatCurrencyLabel(og.amount)}</span>
                            </div>
                        ))}
                        {monthlyFixedOutgoings.length > 2 && (
                            <div className="text-[10px] text-gray-300 text-right mt-1">외 {monthlyFixedOutgoings.length - 2}건</div>
                        )}
                    </div>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Right}
                className="w-5 h-5 bg-toss-blue border-2 border-white shadow-md !right-[-10px] hover:scale-110 transition-transform z-10"
            />
        </div>
    );
}
