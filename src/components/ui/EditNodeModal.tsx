import { useSimulationStore } from '../../store/useSimulationStore';
import { X, Plus, Trash2, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { sanitizeNumberInput } from '../../utils/utils';

export default function EditNodeModal() {
    const { editingNodeId, setEditingNodeId, nodes, updateNodeData, removeNode } = useSimulationStore();
    const node = nodes.find(n => n.id === editingNodeId);

    // 내부 상태에서는 입력의 편의성을 위해 숫자 필드도 string으로 관리할 수 있도록 함
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        if (node) {
            setFormData({
                ...node.data,
                // 초기 로드 시 숫자를 문자열로 변환 (빈 문자열이나 . 입력을 허용하기 위함)
                initialBalance: node.data.initialBalance.toString(),
                monthlyIncome: node.data.monthlyIncome.toString(),
                monthlyFixedOutgoings: node.data.monthlyFixedOutgoings.map(og => ({
                    ...og,
                    amount: og.amount.toString()
                })),
                interestTiers: node.data.interestTiers.map(tier => ({
                    ...tier,
                    maxAmount: tier.maxAmount === null ? '' : tier.maxAmount.toString(),
                    rate: tier.rate.toString()
                }))
            });
        }
    }, [node]);

    if (!editingNodeId || !node || !formData) return null;

    const handleSave = () => {
        // 저장 시 다시 숫자로 변환
        const updatedData = {
            ...formData,
            initialBalance: Number(formData.initialBalance || 0),
            monthlyIncome: Number(formData.monthlyIncome || 0),
            monthlyFixedOutgoings: formData.monthlyFixedOutgoings.map((og: any) => ({
                ...og,
                amount: Number(og.amount || 0)
            })),
            interestTiers: formData.interestTiers.map((tier: any) => ({
                ...tier,
                maxAmount: tier.maxAmount === '' ? null : Number(tier.maxAmount),
                rate: Number(tier.rate || 0)
            }))
        };

        updateNodeData(editingNodeId, updatedData);
        setEditingNodeId(null);
    };

    const addStaticOutgoing = () => {
        setFormData({
            ...formData,
            monthlyFixedOutgoings: [
                ...formData.monthlyFixedOutgoings,
                { id: Date.now().toString(), description: '지출 항목', amount: '0' }
            ]
        });
    };

    const addInterestTier = () => {
        setFormData({
            ...formData,
            interestTiers: [
                ...formData.interestTiers,
                { id: Date.now().toString(), maxAmount: '', rate: '1.0' }
            ]
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full md:max-w-lg h-full md:h-auto md:max-h-[85vh] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                <div className="p-5 md:p-6 border-b border-gray-50 flex items-center justify-between shrink-0">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">통장 상세 설정</h2>
                    <button onClick={() => setEditingNodeId(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">통장 이름</label>
                            <input
                                type="text"
                                value={formData.accountName}
                                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                className="w-full h-12 bg-gray-50 rounded-xl px-4 outline-none focus:ring-2 focus:ring-toss-blue/20 border border-transparent focus:border-toss-blue transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">초기 잔액 (만 원)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={formData.initialBalance}
                                    onChange={(e) => setFormData({ ...formData, initialBalance: sanitizeNumberInput(e.target.value) })}
                                    className="w-full h-12 bg-gray-50 rounded-xl px-4 outline-none focus:ring-2 focus:ring-toss-blue/20 transition-all border border-transparent focus:border-toss-blue"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">월 수입 (만 원)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={formData.monthlyIncome}
                                    onChange={(e) => setFormData({ ...formData, monthlyIncome: sanitizeNumberInput(e.target.value) })}
                                    className="w-full h-12 bg-gray-50 rounded-xl px-4 outline-none focus:ring-2 focus:ring-toss-blue/20 transition-all border border-transparent focus:border-toss-blue"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Fixed Outgoings */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-xs font-bold text-gray-400 uppercase">고정 지출</label>
                        </div>
                        <div className="space-y-2">
                            {formData.monthlyFixedOutgoings.length > 0 ? (
                                formData.monthlyFixedOutgoings.map((og: any, idx: number) => (
                                    <div key={og.id} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder="항목"
                                            value={og.description}
                                            onChange={(e) => {
                                                const newOutgoings = [...formData.monthlyFixedOutgoings];
                                                newOutgoings[idx].description = e.target.value;
                                                setFormData({ ...formData, monthlyFixedOutgoings: newOutgoings });
                                            }}
                                            className="flex-1 h-10 bg-gray-50 rounded-lg px-3 text-sm"
                                        />
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="금액"
                                            value={og.amount}
                                            onChange={(e) => {
                                                const newOutgoings = [...formData.monthlyFixedOutgoings];
                                                newOutgoings[idx].amount = sanitizeNumberInput(e.target.value);
                                                setFormData({ ...formData, monthlyFixedOutgoings: newOutgoings });
                                            }}
                                            className="w-24 h-10 bg-gray-50 rounded-lg px-3 text-sm border border-transparent focus:border-toss-blue outline-none transition-all"
                                        />
                                        <button
                                            onClick={() => {
                                                setFormData({
                                                    ...formData,
                                                    monthlyFixedOutgoings: formData.monthlyFixedOutgoings.filter((_: any, i: number) => i !== idx)
                                                });
                                            }}
                                            className="p-2 text-gray-300 hover:text-toss-red"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-xs text-gray-400 font-medium">등록된 고정 지출 항목이 없습니다.</p>
                                </div>
                            )}

                            <button
                                onClick={addStaticOutgoing}
                                className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm font-bold hover:border-toss-blue/30 hover:text-toss-blue hover:bg-blue-50/30 transition-all flex items-center justify-center gap-1.5 mb-6"
                            >
                                <Plus size={16} />
                                지출 항목 추가
                            </button>
                        </div>
                    </div>

                    {/* Interest Rate Tiers */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                                이자율 설정 (연, %)
                                <div className="group relative">
                                    <Info size={12} className="text-gray-300 cursor-help" />
                                    <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-800 text-white text-[10px] rounded-lg hidden group-hover:block z-10">
                                        금액 구간별 이율을 설정하세요. 구간 끝에 값이 없으면 해당 금액 이상 전액에 적용됩니다.
                                    </div>
                                </div>
                            </label>
                            <button onClick={addInterestTier} className="text-toss-blue font-bold text-xs flex items-center gap-1">
                                <Plus size={14} /> 구간 추가
                            </button>
                        </div>
                        <div className="space-y-2">
                            {formData.interestTiers.map((tier: any, idx: number) => (
                                <div key={tier.id} className="flex gap-2 items-center bg-gray-50/50 p-2 rounded-xl">
                                    <div className="space-y-1 flex-1">
                                        <span className="text-[10px] text-gray-400 ml-1">~까지 적용 (만 원)</span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="무제한은 공백"
                                            value={tier.maxAmount}
                                            onChange={(e) => {
                                                const newTiers = [...formData.interestTiers];
                                                newTiers[idx].maxAmount = sanitizeNumberInput(e.target.value);
                                                setFormData({ ...formData, interestTiers: newTiers });
                                            }}
                                            className="w-full h-9 bg-white rounded-lg px-3 text-sm border border-gray-100 outline-none focus:border-toss-blue transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1 w-24">
                                        <span className="text-[10px] text-gray-400 ml-1">연 이자율 (%)</span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={tier.rate}
                                            onChange={(e) => {
                                                const newTiers = [...formData.interestTiers];
                                                newTiers[idx].rate = sanitizeNumberInput(e.target.value);
                                                setFormData({ ...formData, interestTiers: newTiers });
                                            }}
                                            className="w-full h-9 bg-white rounded-lg px-3 text-sm border border-gray-100 font-bold text-blue-600 outline-none focus:border-toss-blue transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                interestTiers: formData.interestTiers.filter((_: any, i: number) => i !== idx)
                                            });
                                        }}
                                        className="p-2 text-gray-300 hover:text-toss-red self-end mb-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-6 pt-0 flex gap-2 md:gap-3 shrink-0">
                    <button
                        onClick={() => {
                            if (window.confirm('정말 이 통장을 삭제하시겠습니까? 연결된 모든 자동이체도 함께 삭제됩니다.')) {
                                removeNode(editingNodeId);
                                setEditingNodeId(null);
                            }
                        }}
                        className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-red-50 text-toss-red hover:bg-red-100 transition-all active:scale-95"
                        title="통장 삭제"
                    >
                        <Trash2 size={24} />
                    </button>
                    <button
                        onClick={() => setEditingNodeId(null)}
                        className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all active:scale-95 text-sm md:text-base"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-[2] h-12 md:h-14 rounded-xl md:rounded-2xl font-bold bg-toss-blue text-white hover:bg-toss-blue-hover shadow-md transition-all active:scale-95 text-sm md:text-base"
                    >
                        저장 완료
                    </button>
                </div>
            </div>
        </div>
    );
}
