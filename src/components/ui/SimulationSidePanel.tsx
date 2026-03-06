import { useSimulationStore } from '../../store/useSimulationStore';
import { formatCurrencyLabel, cn } from '../../utils/utils';
import { X, TrendingUp, AlertCircle, ArrowRightLeft, Plus, Minus } from 'lucide-react';

export default function SimulationSidePanel() {
    const {
        showResults,
        setShowResults,
        simulationLogs,
        simulationResultNodes,
        totalMonths,
        totalPrincipal,
        totalInterest,
        nodes,
        resetSimulation
    } = useSimulationStore();

    if (!showResults) return null;

    // 예측 종료 날짜 계산
    const today = new Date();
    const futureDate = new Date(today.getFullYear(), today.getMonth() + totalMonths, today.getDate());
    const formattedDate = new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(futureDate);

    const totalBalance = (simulationResultNodes || []).reduce((sum, n) => sum + n.data.initialBalance, 0);

    return (
        <aside className="fixed inset-y-0 right-0 w-full md:w-80 h-full bg-white border-l border-gray-100 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 z-50">
            <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-50 shrink-0">
                <div>
                    <h2 className="text-base md:text-lg font-bold text-gray-900 tracking-tight">시뮬레이션 결과</h2>
                    <p className="text-[10px] md:text-[11px] text-toss-blue font-bold mt-0.5">{totalMonths}개월 후 예측 ({formattedDate})</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowResults(false)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6 md:space-y-8 custom-scrollbar">
                {/* Overall Summary Card */}
                <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">최종 자산 현황</h3>
                    <div className="bg-toss-blue/5 rounded-2xl p-5 border border-toss-blue/10">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[12px] text-gray-500">
                                <span>총 원금</span>
                                <span className="font-medium text-gray-700">{formatCurrencyLabel(Math.floor(totalPrincipal))}</span>
                            </div>
                            <div className="flex justify-between items-center text-[12px] text-gray-500">
                                <span>총 이자수익</span>
                                <span className="font-bold text-toss-blue">+{formatCurrencyLabel(Math.floor(totalInterest))}</span>
                            </div>
                            <div className="pt-3 border-t border-toss-blue/10 flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-900">최종 합계 잔액</span>
                                <span className="text-lg font-black text-toss-blue">{formatCurrencyLabel(Math.floor(totalBalance))}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Per Account Summary */}
                <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">통장별 최종 잔액</h3>
                    <div className="space-y-3">
                        {simulationResultNodes?.map((node) => {
                            const originalNode = nodes.find(n => n.id === node.id);
                            const diff = node.data.initialBalance - (originalNode?.data.initialBalance || 0);

                            return (
                                <div key={node.id} className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 transition-all hover:border-gray-200">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[11px] font-medium text-gray-500 truncate max-w-[120px]">
                                            {node.data.accountName}
                                        </span>
                                        <div className={cn(
                                            "px-1.5 py-0.5 rounded text-[10px] font-bold",
                                            diff > 0 ? "bg-blue-50 text-blue-500" : diff < 0 ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-400"
                                        )}>
                                            {diff > 0 ? '+' : ''}{formatCurrencyLabel(Math.floor(diff))}
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-gray-900">
                                        {formatCurrencyLabel(Math.floor(node.data.initialBalance))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Timeline Logs Section */}
                <section>
                    <h3 className="text-xs font-bold text-toss-blue uppercase tracking-widest mb-4">전체 이체 및 지출 내역</h3>
                    <div className="space-y-4">
                        {simulationLogs.slice(-100).reverse().map((log, idx) => (
                            <div key={idx} className="relative pl-4 border-l-2 border-gray-100 py-0.5">
                                <div className="absolute top-2 -left-[5px] w-2 h-2 rounded-full bg-gray-200" />
                                <div className="text-[10px] font-bold text-gray-300 mb-1">
                                    {Math.floor((log.monthStep - 1) / 12) + 1}년 {(log.monthStep - 1) % 12 + 1}월
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5">
                                        {log.type === 'INCOME' && <Plus size={12} className="text-blue-500" />}
                                        {log.type === 'INTEREST' && <TrendingUp size={12} className="text-blue-500" />}
                                        {log.type === 'ERROR' && <AlertCircle size={12} className="text-toss-red" />}
                                        {log.type.startsWith('TRANSFER') && <ArrowRightLeft size={12} className="text-gray-400" />}
                                        {log.type === 'OUTGOING' && <Minus size={12} className="text-toss-red" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[12px] font-bold text-gray-800 leading-tight">
                                            {log.accountName}
                                        </div>
                                        <div className="text-[11px] text-gray-500 leading-normal mt-0.5">
                                            {log.description}
                                            {log.amount > 0 && <span className="ml-1 font-semibold text-gray-700">: {formatCurrencyLabel(Math.floor(log.amount))}</span>}
                                        </div>
                                        <div className="mt-1 text-[10px] text-toss-blue/60 font-medium">
                                            잔액: {formatCurrencyLabel(Math.floor(log.balanceAfter))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="p-4 border-t border-gray-50 flex gap-2 bg-gray-50/30 shrink-0">
                <button
                    onClick={resetSimulation}
                    className="flex-1 h-14 rounded-2xl font-bold bg-toss-blue text-white hover:bg-toss-blue-hover shadow-md transition-all active:scale-95"
                >
                    다시 해보기
                </button>
            </div>
        </aside>
    );
}
