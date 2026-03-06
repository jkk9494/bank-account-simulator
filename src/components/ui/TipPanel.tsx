import { useState, useEffect } from 'react';
import { Panel } from '@xyflow/react';
import { X, Lightbulb, Info } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { cn } from '../../utils/utils';

const TipPanel = () => {
    const { nodes, edges, showResults } = useSimulationStore();
    const [isVisible, setIsVisible] = useState(true);
    const [tip, setTip] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    // 세션 동안 팁을 껐는지 확인
    useEffect(() => {
        const isHidden = sessionStorage.getItem('hide-tips') === 'true';
        if (isHidden) {
            setIsVisible(false);
        }

        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (nodes.length === 0) {
            setTip("통장 추가 버튼을 눌러 첫 번째 통장을 만들어보세요!");
        } else if (edges.length === 0) {
            setTip("통장의 파란색 핸들을 드래그하여 다른 통장과 연결해보세요.");
        } else if (!showResults) {
            setTip("기간을 설정하고 '시작' 버튼을 눌러 시뮬레이션을 돌려보세요!");
        } else {
            setTip("우측 패널에서 각 통장의 잔액 변화를 확인해보세요.");
        }
    }, [nodes.length, edges.length, showResults]);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('hide-tips', 'true');
    };

    if (!isVisible) {
        return (
            <Panel position={isMobile ? "top-right" : "bottom-right"} className={cn("mr-4 z-[110]", isMobile ? "mt-4" : "mb-4")}>
                <button
                    onClick={() => {
                        setIsVisible(true);
                        sessionStorage.removeItem('hide-tips');
                    }}
                    className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-toss border border-white/50 text-gray-400 hover:text-toss-blue transition-colors"
                    title="팁 보기"
                >
                    <Lightbulb size={18} />
                </button>
            </Panel>
        );
    }

    return (
        <Panel
            position={isMobile ? 'top-right' : 'bottom-right'}
            className={cn(
                "bg-white/80 backdrop-blur-md p-3.5 pl-4 pr-10 rounded-2xl shadow-toss mr-4 border border-white/50 animate-in fade-in slide-in-from-right duration-500 max-w-[280px] md:max-w-md relative group z-[110]",
                isMobile ? "mt-4" : "mb-4"
            )}
        >
            <div className="flex items-start gap-2.5">
                <div className="mt-0.5 bg-toss-blue/10 p-1.5 rounded-lg shrink-0">
                    <Info size={14} className="text-toss-blue" />
                </div>
                <div className="text-[11px] md:text-[13px] text-gray-700 font-medium leading-relaxed">
                    <span className="font-bold text-toss-blue mr-1">팁:</span>
                    {tip}
                </div>
            </div>

            <button
                onClick={handleClose}
                className="absolute top-2 right-2 p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100/50 transition-all opacity-0 group-hover:opacity-100 md:opacity-0"
                title="팁 끄기"
            >
                <X size={14} />
            </button>
        </Panel>
    );
};

export default TipPanel;
