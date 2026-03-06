import { useSimulationStore } from '../../store/useSimulationStore';
import { X, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn, sanitizeNumberInput } from '../../utils/utils';

export default function EditEdgeModal() {
    const {
        editingEdgeId,
        setEditingEdgeId,
        edges,
        updateEdgeData,
        removeEdge
    } = useSimulationStore();

    const edge = edges.find(e => e.id === editingEdgeId);
    // 내부 상태에서는 문자열로 관리하여 입력 편의성 제공
    const [items, setItems] = useState<any[]>([]);
    const [errors, setErrors] = useState<Record<string, { description?: string; amount?: string }>>({});

    useEffect(() => {
        if (edge?.data?.items) {
            setItems(edge.data.items.map(item => ({
                ...item,
                amount: item.amount.toString()
            })));
        }
    }, [edge]);

    if (!editingEdgeId || !edge) return null;

    const handleSave = () => {
        if (items.length === 0) {
            removeEdge(editingEdgeId);
            setEditingEdgeId(null);
            return;
        }

        const newErrors: Record<string, { description?: string; amount?: string }> = {};
        let hasError = false;

        items.forEach(item => {
            const itemErrors: { description?: string; amount?: string } = {};
            if (!item.description.trim()) {
                itemErrors.description = '항목 명을 적어주세요.';
                hasError = true;
            }
            if (Number(item.amount) <= 0) {
                itemErrors.amount = '0보다 커야 합니다.';
                hasError = true;
            }
            if (Object.keys(itemErrors).length > 0) {
                newErrors[item.id] = itemErrors;
            }
        });

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        // 저장 시 숫자로 변환
        const updatedItems = items.map(item => ({
            ...item,
            amount: Number(item.amount || 0)
        }));
        updateEdgeData(editingEdgeId, { items: updatedItems });
        setEditingEdgeId(null);
        setErrors({});
    };

    const handleUpdateItem = (id: string, field: string, value: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
        if (errors[id]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                if (newErrors[id]) {
                    delete (newErrors[id] as any)[field];
                    if (Object.keys(newErrors[id]).length === 0) {
                        delete newErrors[id];
                    }
                }
                return newErrors;
            });
        }
    };

    const handleRemoveItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
        if (errors[id]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[id];
                return newErrors;
            });
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">이체 내역 관리</h2>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium uppercase tracking-wider">총 {items.length}개의 항목</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingEdgeId(null);
                            setErrors({});
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 custom-scrollbar">
                    {items.length > 0 ? (
                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={item.id} className={cn(
                                    "p-4 rounded-2xl border transition-all space-y-3 relative group",
                                    errors[item.id] ? "bg-red-50/20 border-red-100" : "bg-gray-50/50 border-gray-100"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-md",
                                            errors[item.id] ? "text-toss-red bg-red-100" : "text-toss-blue bg-toss-light-blue"
                                        )}>항목 {index + 1}</span>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="p-1.5 text-gray-300 hover:text-toss-red hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">항목 명</label>
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                                className={cn(
                                                    "w-full h-10 bg-white rounded-xl px-3 text-xs outline-none transition-all border",
                                                    errors[item.id]?.description
                                                        ? "border-toss-red focus:ring-2 focus:ring-toss-red/10"
                                                        : "border-gray-200 focus:border-toss-blue focus:ring-2 focus:ring-toss-blue/10"
                                                )}
                                            />
                                            {errors[item.id]?.description && (
                                                <div className="absolute left-0 -top-7 bg-toss-red text-white text-[9px] px-1.5 py-0.5 rounded shadow-lg animate-in fade-in zoom-in slide-in-from-bottom-1 duration-200 z-10 whitespace-nowrap">
                                                    {errors[item.id]?.description}
                                                    <div className="absolute -bottom-1 left-3 w-1.5 h-1.5 bg-toss-red rotate-45"></div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">금액 (만 원)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={item.amount}
                                                onChange={(e) => handleUpdateItem(item.id, 'amount', sanitizeNumberInput(e.target.value))}
                                                className={cn(
                                                    "w-full h-10 bg-white rounded-xl px-3 text-xs font-bold transition-all border",
                                                    errors[item.id]?.amount
                                                        ? "border-toss-red text-toss-red focus:ring-2 focus:ring-toss-red/10"
                                                        : "border-gray-200 text-toss-blue focus:border-toss-blue focus:ring-2 focus:ring-toss-blue/10"
                                                )}
                                            />
                                            {errors[item.id]?.amount && (
                                                <div className="absolute left-0 -top-7 bg-toss-red text-white text-[9px] px-1.5 py-0.5 rounded shadow-lg animate-in fade-in zoom-in slide-in-from-bottom-1 duration-200 z-10 whitespace-nowrap">
                                                    {errors[item.id]?.amount}
                                                    <div className="absolute -bottom-1 left-3 w-1.5 h-1.5 bg-toss-red rotate-45"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                <Trash2 size={20} className="text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-400 font-medium">모든 항목이 삭제되었습니다.<br />저장 시 연결선이 사라집니다.</p>
                        </div>
                    )}
                </div>

                <div className="p-6 pt-0 flex gap-3">
                    <button
                        onClick={() => {
                            setEditingEdgeId(null);
                            setErrors({});
                        }}
                        className="flex-1 h-14 rounded-2xl font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all active:scale-95"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 h-14 rounded-2xl font-bold bg-toss-blue text-white hover:bg-toss-blue-hover shadow-md transition-all active:scale-95"
                    >
                        저장 완료
                    </button>
                </div>
            </div>
        </div>
    );
}
