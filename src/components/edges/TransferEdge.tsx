import {
    BaseEdge,
    EdgeLabelRenderer,
    type EdgeProps,
    getBezierPath,
} from '@xyflow/react';
import type { TransferEdge as TransferEdgeType } from '../../types';
import { formatCurrencyLabel, cn } from '../../utils/utils';
import { useSimulationStore } from '../../store/useSimulationStore';

export default function TransferEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}: EdgeProps<TransferEdgeType>) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const setEditingEdgeId = useSimulationStore((state) => state.setEditingEdgeId);

    const items = data?.items || [];
    const totalAmount = items.reduce((acc, item) => acc + item.amount, 0);

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    strokeWidth: 2,
                    stroke: '#D1D6DB',
                }}
            />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <button
                        className={cn(
                            "bg-white border border-gray-100 rounded-2xl shadow-sm text-[11px] transition-all active:scale-95 hover:border-gray-300 hover:shadow-md overflow-hidden min-w-[80px]",
                        )}
                        onClick={() => setEditingEdgeId(id)}
                    >
                        <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100 font-bold text-gray-700">
                            {formatCurrencyLabel(totalAmount)}
                        </div>
                        <div className="px-3 py-2 space-y-1">
                            {items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center gap-2 whitespace-nowrap">
                                    <span className="text-[10px] text-gray-400 font-medium truncate max-w-[60px]">{item.description}</span>
                                    <span className="text-[10px] text-toss-blue font-bold">{formatCurrencyLabel(item.amount)}</span>
                                </div>
                            ))}
                        </div>
                    </button>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
