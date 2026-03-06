import { useSimulationStore } from '../../store/useSimulationStore';
import { X, Copy, Download, Upload, Check } from 'lucide-react';
import { useState } from 'react';

export default function DataManagementModal() {
    const {
        isDataModalOpen,
        setIsDataModalOpen,
        nodes,
        edges,
        importData
    } = useSimulationStore();

    const [importText, setImportText] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isDataModalOpen) return null;

    // 현재 데이터를 JSON으로 변환
    const exportData = JSON.stringify({ nodes, edges }, null, 2);

    const handleCopy = () => {
        navigator.clipboard.writeText(exportData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleImport = () => {
        try {
            const data = JSON.parse(importText);
            if (!data.nodes || !data.edges) {
                throw new Error('올바른 데이터 형식이 아닙니다. (nodes, edges 필드 필요)');
            }
            if (window.confirm('기존 데이터가 모두 사라지고 새로운 데이터로 대체됩니다. 계속하시겠습니까?')) {
                importData(data);
                setIsDataModalOpen(false);
                setImportText('');
                setError(null);
            }
        } catch (e: any) {
            setError(e.message || 'JSON 형식이 올바르지 않습니다.');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">데이터 내보내기 및 가져오기</h2>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium uppercase tracking-wider">작성한 시뮬레이션 설정을 백업하고 복구하세요</p>
                    </div>
                    <button
                        onClick={() => setIsDataModalOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[70vh]">
                    {/* Export Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-toss-blue">
                            <Download size={18} />
                            <h3 className="font-bold text-sm">현재 설정 내보내기</h3>
                        </div>
                        <div className="relative group">
                            <pre className="w-full h-64 bg-gray-50 rounded-2xl p-4 text-[10px] text-gray-500 overflow-auto border border-gray-100 font-mono">
                                {exportData}
                            </pre>
                            <button
                                onClick={handleCopy}
                                className="absolute top-3 right-3 p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:bg-gray-50 transition-all text-gray-500 flex items-center gap-2 text-xs font-bold"
                            >
                                {copied ? (
                                    <>
                                        <Check size={14} className="text-green-500" />
                                        복사됨
                                    </>
                                ) : (
                                    <>
                                        <Copy size={14} />
                                        복사하기
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                            위의 텍스트를 복사하여 메모장에 저장해 두면 나중에 그대로 다시 불러올 수 있습니다.
                        </p>
                    </div>

                    {/* Import Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-toss-blue">
                            <Upload size={18} />
                            <h3 className="font-bold text-sm">저장된 데이터 불러오기</h3>
                        </div>
                        <div className="space-y-2">
                            <textarea
                                value={importText}
                                onChange={(e) => setImportText(e.target.value)}
                                placeholder="저장했던 JSON 텍스트를 여기에 붙여넣어 주세요..."
                                className="w-full h-64 bg-white border border-gray-200 rounded-2xl p-4 text-[10px] font-mono outline-none focus:ring-2 focus:ring-toss-blue/10 focus:border-toss-blue transition-all resize-none"
                            />
                            {error && (
                                <p className="text-[11px] text-toss-red font-medium pl-1 italic">
                                    ⚠️ {error}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={handleImport}
                            disabled={!importText.trim()}
                            className="w-full h-12 rounded-xl bg-toss-blue text-white font-bold text-sm shadow-md hover:bg-toss-blue-hover transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            데이터 불러오기
                        </button>
                    </div>
                </div>

                <div className="p-6 pt-0 flex justify-end">
                    <button
                        onClick={() => setIsDataModalOpen(false)}
                        className="px-6 h-12 rounded-xl font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all active:scale-95 text-sm"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
