import { X, AlertCircle } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

const ConfirmModal = () => {
    const { isConfirmModalOpen, setIsConfirmModalOpen, confirmModalConfig } = useSimulationStore();

    if (!isConfirmModalOpen || !confirmModalConfig) return null;

    const { title, message, onConfirm } = confirmModalConfig;

    const handleConfirm = () => {
        onConfirm();
        setIsConfirmModalOpen(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setIsConfirmModalOpen(false)}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-[360px] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 ease-out">
                <div className="p-6 md:p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="text-toss-red w-8 h-8" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8 break-keep">
                        {message}
                    </p>

                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={handleConfirm}
                            className="w-full py-4 bg-toss-red text-white font-bold rounded-2xl hover:bg-red-600 transition-colors active:scale-[0.98]"
                        >
                            초기화하기
                        </button>
                        <button
                            onClick={() => setIsConfirmModalOpen(false)}
                            className="w-full py-4 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-colors active:scale-[0.98]"
                        >
                            취소
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default ConfirmModal;
