import { useState } from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { X, ArrowRightLeft, Check } from 'lucide-react';
import { cn, sanitizeNumberInput } from '../../utils/utils';

export default function AddTransferModal() {
    const {
        isAddTransferModalOpen,
        setIsAddTransferModalOpen,
        nodes,
        addTransfer
    } = useSimulationStore();

    const [sourceId, setSourceId] = useState('');
    const [targetId, setTargetId] = useState('');
    const [amount, setAmount] = useState('10');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    if (!isAddTransferModalOpen) return null;

    const handleSave = () => {
        const newErrors: Record<string, string> = {};

        if (!sourceId) newErrors.sourceId = '출금 통장을 선택해주세요.';
        if (!targetId) newErrors.targetId = '입금 통장을 선택해주세요.';
        if (sourceId && targetId && sourceId === targetId) {
            newErrors.targetId = '출금 통장과 같을 수 없습니다.';
        }
        if (Number(amount) <= 0) newErrors.amount = '금액은 0보다 커야 합니다.';
        if (!description.trim()) newErrors.description = '이유를 적어주세요.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        addTransfer(sourceId, targetId, Number(amount || 0), description);
        setIsAddTransferModalOpen(false);

        // Reset form
        setSourceId('');
        setTargetId('');
        setAmount('10');
        setDescription('');
        setErrors({});
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <ArrowRightLeft className="text-toss-blue" size={24} />
                        자동이체 등록
                    </h2>
                    <button
                        onClick={() => {
                            setIsAddTransferModalOpen(false);
                            setErrors({});
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Source Selection */}
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">어떤 통장에서 보낼까요?</label>
                                {errors.sourceId && (
                                    <span className="text-[10px] font-bold text-toss-red animate-bounce">
                                        {errors.sourceId}
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {nodes.map(node => (
                                    <button
                                        key={node.id}
                                        onClick={() => {
                                            setSourceId(node.id);
                                            setErrors(prev => ({ ...prev, sourceId: '' }));
                                        }}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                                            sourceId === node.id
                                                ? "border-toss-blue bg-toss-light-blue ring-1 ring-toss-blue/20"
                                                : errors.sourceId
                                                    ? "border-toss-red bg-red-50/30"
                                                    : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"
                                        )}
                                    >
                                        <span className={cn(
                                            "text-sm font-semibold",
                                            sourceId === node.id ? "text-toss-blue" : "text-gray-700"
                                        )}>
                                            {node.data.accountName}
                                        </span>
                                        {sourceId === node.id && <Check size={16} className="text-toss-blue" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Arrow Icon */}
                        <div className="flex justify-center -my-2 relative z-10">
                            <div className="bg-white p-2 rounded-full border border-gray-100 shadow-sm">
                                <ArrowRightLeft size={16} className="text-gray-300 rotate-90" />
                            </div>
                        </div>

                        {/* Target Selection */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">어느 통장으로 보낼까요?</label>
                                {errors.targetId && (
                                    <span className="text-[10px] font-bold text-toss-red animate-bounce">
                                        {errors.targetId}
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {nodes.map(node => (
                                    <button
                                        key={node.id}
                                        onClick={() => {
                                            setTargetId(node.id);
                                            setErrors(prev => ({ ...prev, targetId: '' }));
                                        }}
                                        disabled={node.id === sourceId}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                                            targetId === node.id
                                                ? "border-toss-blue bg-toss-light-blue ring-1 ring-toss-blue/20"
                                                : errors.targetId
                                                    ? "border-toss-red bg-red-50/30"
                                                    : "border-gray-100 bg-gray-50/50 hover:bg-gray-50",
                                            node.id === sourceId && "opacity-40 cursor-not-allowed"
                                        )}
                                    >
                                        <span className={cn(
                                            "text-sm font-semibold",
                                            targetId === node.id ? "text-toss-blue" : "text-gray-700"
                                        )}>
                                            {node.data.accountName}
                                        </span>
                                        {targetId === node.id && <Check size={16} className="text-toss-blue" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="relative group">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">이체 이유</label>
                            <input
                                type="text"
                                placeholder="예: 생활비, 적금, 보험료"
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                                }}
                                className={cn(
                                    "w-full h-12 bg-gray-50 rounded-2xl px-4 outline-none transition-all border",
                                    errors.description
                                        ? "border-toss-red focus:ring-2 focus:ring-toss-red/10"
                                        : "border-transparent focus:ring-2 focus:ring-toss-blue/10 focus:border-toss-blue"
                                )}
                            />
                            {errors.description && (
                                <div className="absolute left-0 -top-8 bg-toss-red text-white text-[10px] px-2 py-1 rounded-md shadow-lg animate-in fade-in zoom-in slide-in-from-bottom-1 duration-200">
                                    {errors.description}
                                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-toss-red rotate-45"></div>
                                </div>
                            )}
                        </div>
                        <div className="relative group">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">이체 금액 (만 원)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(sanitizeNumberInput(e.target.value));
                                        if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                                    }}
                                    className={cn(
                                        "w-full h-12 bg-gray-50 rounded-2xl px-4 pr-12 outline-none transition-all font-bold border",
                                        errors.amount
                                            ? "border-toss-red text-toss-red focus:ring-2 focus:ring-toss-red/10"
                                            : "border-transparent text-toss-blue focus:ring-2 focus:ring-toss-blue/10 focus:border-toss-blue"
                                    )}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">만 원</span>
                            </div>
                            {errors.amount && (
                                <div className="absolute left-0 -top-8 bg-toss-red text-white text-[10px] px-2 py-1 rounded-md shadow-lg animate-in fade-in zoom-in slide-in-from-bottom-1 duration-200">
                                    {errors.amount}
                                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-toss-red rotate-45"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-0 flex gap-3">
                    <button
                        onClick={() => {
                            setIsAddTransferModalOpen(false);
                            setErrors({});
                        }}
                        className="flex-1 h-14 rounded-2xl font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all active:scale-95"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 h-14 rounded-2xl font-bold bg-toss-blue text-white hover:bg-toss-blue-hover shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                        이체 등록하기
                    </button>
                </div>
            </div>
        </div>
    );
}
