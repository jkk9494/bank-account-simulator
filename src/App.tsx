import {
  ReactFlow,
  Background,
  Controls,
  type NodeTypes,
  type EdgeTypes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useSimulationStore } from './store/useSimulationStore';
import BankAccountNode from './components/nodes/BankAccountNode';
import TransferEdge from './components/edges/TransferEdge';

// UI Components
import EditNodeModal from './components/ui/EditNodeModal';
import EditEdgeModal from './components/ui/EditEdgeModal';
import SimulationSidePanel from './components/ui/SimulationSidePanel';
import AddTransferModal from './components/ui/AddTransferModal';
import DataManagementModal from './components/ui/DataManagementModal';
import TipPanel from './components/ui/TipPanel';
import ConfirmModal from './components/ui/ConfirmModal';

import { Plus, Play, Calendar, ArrowRightLeft, Trash2, Database, RotateCcw } from 'lucide-react';
import { cn } from './utils/utils';
import { useState } from 'react';

const nodeTypes: NodeTypes = {
  bankAccount: BankAccountNode,
};

const edgeTypes: EdgeTypes = {
  transfer: TransferEdge,
};

function App() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    totalMonths,
    setTotalMonths,
    runSimulation,
    setIsAddTransferModalOpen,
    clearAllData,
    setIsDataModalOpen,
    openConfirmModal,
    isSimulationRunning,
    resetSimulation
  } = useSimulationStore();

  const [years, setYears] = useState(Math.floor(totalMonths / 12));
  const [months, setMonths] = useState(totalMonths % 12);
  const [periodError, setPeriodError] = useState(false);

  const handleAddAccount = () => {
    const id = `account-${Date.now()}`;
    addNode({
      id,
      type: 'bankAccount',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        accountName: '새 통장',
        initialBalance: 0,
        monthlyIncome: 0,
        monthlyFixedOutgoings: [],
        interestTiers: [{ id: '1', maxAmount: null, rate: 2.0 }]
      }
    });
  };

  const handleRunSimulation = () => {
    const total = (years * 12) + months;
    if (total <= 0) {
      setPeriodError(true);
      return;
    }
    setPeriodError(false);
    setTotalMonths(total);
    runSimulation();
  };

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="md:min-h-16 bg-white border-b border-gray-100 flex flex-row items-center justify-between px-4 md:px-8 shrink-0 z-10 py-2 md:py-0 gap-0">
        <div className="flex items-center w-auto gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-toss-blue rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg">₩</span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight whitespace-nowrap hidden sm:inline">
              <span className="">통장 쪼개기 </span>시뮬레이터
            </h1>
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-2 md:gap-3">
          {/* Period Selector - Moved next to simulation button */}
          <div className="flex items-center gap-3 md:gap-2 border-l border-gray-100 pl-5 md:pl-3">
            <button
              onClick={() => {
                openConfirmModal({
                  title: '모두 지우기',
                  message: '모든 통장과 자동이체 내역이 지워집니다. 정말 지우시겠습니까?',
                  onConfirm: clearAllData
                });
              }}
              className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-[10px] md:text-[11px] font-bold text-gray-400 hover:text-toss-red hover:bg-red-50 transition-all active:scale-95"
              title="모두 지우기"
            >
              <Trash2 size={14} />
              <span className="hidden md:inline">모두 지우기</span>
            </button>
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-[10px] md:text-[11px] font-bold text-gray-400 hover:text-toss-blue hover:bg-blue-50 transition-all active:scale-95"
              title="데이터 관리"
            >
              <Database size={14} />
              <span className="hidden md:inline">데이터 관리</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3 border-l border-gray-100 pl-2 md:pl-4">
            <button
              onClick={() => setIsAddTransferModalOpen(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all",
                "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 active:scale-95"
              )}
              title="자동이체 등록"
            >
              <ArrowRightLeft size={16} className="text-toss-blue md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">자동이체</span>
            </button>

            <button
              onClick={handleAddAccount}
              className={cn(
                "flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all",
                "bg-toss-light-blue text-toss-blue hover:bg-blue-100 active:scale-95"
              )}
              title="통장 추가"
            >
              <Plus size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">통장 추가</span>
            </button>
            <div className="hidden md:flex relative group">
              <div className={cn(
                "flex items-center gap-1.5 md:gap-2 bg-gray-50 p-1 rounded-xl border transition-all",
                periodError ? "border-toss-red bg-red-50/50 shadow-[0_0_0_2px_rgba(240,68,82,0.1)]" : "border-gray-100"
              )}>
                <div className="flex items-center px-1.5 md:px-2 py-1 gap-1">
                  <Calendar size={14} className={cn(periodError ? "text-toss-red" : "text-gray-400")} />
                  <span className={cn(
                    "text-[10px] md:text-xs font-bold uppercase hidden md:inline",
                    periodError ? "text-toss-red" : "text-gray-500"
                  )}>기간</span>
                </div>
                <div className="flex items-center gap-1 bg-white rounded-lg px-1.5 md:px-2 py-1 shadow-sm border border-gray-100">
                  <input
                    type="number"
                    min="0"
                    value={years}
                    onChange={(e) => {
                      setYears(Math.max(0, Number(e.target.value)));
                      setPeriodError(false);
                    }}
                    className={cn(
                      "w-6 md:w-8 text-center text-xs md:text-sm font-bold outline-none",
                      periodError ? "text-toss-red" : "text-toss-blue"
                    )}
                  />
                  <span className="text-[10px] md:text-xs text-gray-400">년</span>
                  <input
                    type="number"
                    min="0"
                    value={months}
                    onChange={(e) => {
                      setMonths(Math.max(0, Number(e.target.value)));
                      setPeriodError(false);
                    }}
                    className={cn(
                      "w-6 md:w-8 text-center text-xs md:text-sm font-bold outline-none",
                      periodError ? "text-toss-red" : "text-toss-blue"
                    )}
                  />
                  <span className="text-[10px] md:text-xs text-gray-400">개월</span>
                </div>
              </div>
              {periodError && (
                <div className="absolute left-1/2 -bottom-10 -translate-x-1/2 bg-toss-red text-white text-[10px] px-2 py-1 rounded-md shadow-lg animate-in fade-in zoom-in slide-in-from-top-1 duration-200 z-[100] whitespace-nowrap">
                  기간을 설정해주세요! (0보다 커야 합니다)
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-toss-red rotate-45"></div>
                </div>
              )}
            </div>
            <div className="hidden md:block">
              {isSimulationRunning ? (
                <button
                  onClick={resetSimulation}
                  className={cn(
                    "flex items-center gap-1.5 px-4 md:px-5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all",
                    "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 active:scale-95 shadow-sm"
                  )}
                  title="시뮬레이션 초기화"
                >
                  <RotateCcw size={16} className="md:w-[18px] md:h-[18px] text-toss-blue" />
                  <span className="whitespace-nowrap">초기화</span>
                </button>
              ) : (
                <button
                  onClick={handleRunSimulation}
                  className={cn(
                    "flex items-center gap-1.5 px-4 md:px-5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all",
                    "bg-toss-blue text-white hover:bg-toss-blue-hover shadow-md active:scale-95"
                  )}
                  title="시뮬레이션 시작"
                >
                  <Play size={16} fill="currentColor" className="md:w-[18px] md:h-[18px]" />
                  <span className="whitespace-nowrap">시작</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <main className="flex-1 relative" id="simulation-canvas-area">
          <ReactFlow
            nodes={nodes}
            edges={edges.map(e => ({ ...e, type: 'transfer' as const }))}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="bg-gray-50"
          >
            <Background color="#e5e8eb" gap={24} size={1} />
            <Controls className="!bg-white !shadow-toss !border-none !rounded-2xl overflow-hidden !m-4" />

            <TipPanel />
          </ReactFlow>
        </main>

        {/* Side Panel */}
        <SimulationSidePanel />
      </div>

      {/* Mobile Floating Action Bar */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm">
        <div className={cn(
          "bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50 flex items-center gap-3 transition-all",
          periodError && "border-toss-red ring-2 ring-toss-red/10"
        )}>
          <div className="flex-1 flex items-center justify-center gap-1 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
            <span className="text-[10px] font-bold text-gray-500 mr-1">기간</span>
            <input
              type="number"
              min="0"
              value={years}
              onChange={(e) => {
                setYears(Math.max(0, Number(e.target.value)));
                setPeriodError(false);
              }}
              className={cn(
                "w-7 text-center text-sm font-bold outline-none bg-transparent",
                periodError ? "text-toss-red" : "text-toss-blue"
              )}
            />
            <span className="text-[10px] text-gray-400 font-bold">년</span>
            <input
              type="number"
              min="0"
              value={months}
              onChange={(e) => {
                setMonths(Math.max(0, Number(e.target.value)));
                setPeriodError(false);
              }}
              className={cn(
                "w-7 text-center text-sm font-bold outline-none bg-transparent",
                periodError ? "text-toss-red" : "text-toss-blue"
              )}
            />
            <span className="text-[10px] text-gray-400 font-bold">월</span>
          </div>

          {isSimulationRunning ? (
            <button
              onClick={resetSimulation}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm active:scale-95 transition-all"
            >
              <RotateCcw size={16} className="text-toss-blue" />
              <span>초기화</span>
            </button>
          ) : (
            <button
              onClick={handleRunSimulation}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-toss-blue text-white font-bold text-sm shadow-md active:scale-95 transition-all"
            >
              <Play size={16} fill="currentColor" />
              <span>시작</span>
            </button>
          )}

          {periodError && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-toss-red text-white text-[10px] px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
              기간을 설정해주세요!
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-toss-red rotate-45"></div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditNodeModal />
      <EditEdgeModal />
      <AddTransferModal />
      <DataManagementModal />
      <ConfirmModal />
    </div>
  );
}

export default App;
