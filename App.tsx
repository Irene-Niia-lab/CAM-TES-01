
import React, { useState, useEffect, useCallback } from 'react';
import { Candidate, TeachingCategory, UserRole, AuthSession, Judge, SyncConfig } from './types';
import Sidebar from './components/Sidebar';
import AssessmentForm from './components/AssessmentForm';
import AdminPanel from './components/AdminPanel';
import StatisticsView from './components/StatisticsView';
import Login from './components/Login';
import { exportToExcel } from './utils/exportUtils';
import { SyncService } from './services/syncService';
import { LayoutDashboard, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

const CANDIDATES_KEY = 'teacher_assessment_data_v2';
const JUDGES_KEY = 'teacher_assessment_judges_v2';
const SESSION_KEY = 'teacher_assessment_session_v2';
const SYNC_CONFIG_KEY = 'teacher_assessment_sync_v2';

const createNewCandidate = (judgeUsername: string): Candidate => ({
  id: Date.now().toString(),
  name: '',
  enName: '',
  group: '',
  groupIndex: '',
  organization: '',
  category: TeachingCategory.PU0,
  selectedStages: [],
  scores: {},
  feedback: '',
  totalScore: 0,
  lastUpdated: new Date().toLocaleString(),
  judgeUsername
});

const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession>({ user: null });
  const [judges, setJudges] = useState<Judge[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isAdminViewOpen, setIsAdminViewOpen] = useState(false);
  const [isStatsViewOpen, setIsStatsViewOpen] = useState(false);
  
  // 同步状态
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({ 
    enabled: false, 
    token: null, 
    lastSynced: null 
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Load Initial Data
  useEffect(() => {
    const savedCandidates = localStorage.getItem(CANDIDATES_KEY);
    const savedJudges = localStorage.getItem(JUDGES_KEY);
    const savedSession = localStorage.getItem(SESSION_KEY);
    const savedSync = localStorage.getItem(SYNC_CONFIG_KEY);

    if (savedCandidates) setCandidates(JSON.parse(savedCandidates));
    if (savedJudges) setJudges(JSON.parse(savedJudges));
    if (savedSession) setSession(JSON.parse(savedSession));
    if (savedSync) setSyncConfig(JSON.parse(savedSync));
  }, []);

  // Persistence
  useEffect(() => { localStorage.setItem(CANDIDATES_KEY, JSON.stringify(candidates)); }, [candidates]);
  useEffect(() => { localStorage.setItem(JUDGES_KEY, JSON.stringify(judges)); }, [judges]);
  useEffect(() => { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); }, [session]);
  useEffect(() => { localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(syncConfig)); }, [syncConfig]);

  // 云同步逻辑
  const performSync = useCallback(async (isManual = false) => {
    if (!syncConfig.enabled || !syncConfig.token || isSyncing) return;
    
    setIsSyncing(true);
    const remoteData = await SyncService.pullData(syncConfig.token);
    
    if (remoteData) {
      // 合并考生数据
      const mergedCandidates = SyncService.mergeData(candidates, remoteData.candidates);
      setCandidates(mergedCandidates);
      
      // 合并评委数据 (Admin 视角)
      const mergedJudges = [...judges];
      remoteData.judges.forEach(rj => {
        if (!mergedJudges.find(lj => lj.id === rj.id)) mergedJudges.push(rj);
      });
      setJudges(mergedJudges);

      // 推回最新状态
      await SyncService.pushData(syncConfig.token, {
        candidates: mergedCandidates,
        judges: mergedJudges,
        version: Date.now()
      });

      setSyncConfig(prev => ({ ...prev, lastSynced: new Date().toLocaleTimeString() }));
    }
    
    setIsSyncing(false);
  }, [syncConfig, candidates, judges, isSyncing]);

  // 定时自动同步 (每 60 秒)
  useEffect(() => {
    const timer = setInterval(() => {
      if (syncConfig.enabled) performSync();
    }, 60000);
    return () => clearInterval(timer);
  }, [syncConfig.enabled, performSync]);

  const handleUpdate = (updated: Candidate) => {
    setCandidates(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleAdd = () => {
    if (!session.user) return;
    setIsAdminViewOpen(false);
    setIsStatsViewOpen(false);
    const fresh = createNewCandidate(session.user.username);
    setCandidates(prev => [fresh, ...prev]);
    setActiveId(fresh.id);
  };

  const handleSaveAndNew = async () => {
    setShowToast(true);
    if (syncConfig.enabled) await performSync(); // 保存时立即触发一次同步
    setTimeout(() => {
      setShowToast(false);
      handleAdd();
    }, 1500);
  };

  const handleLogin = (username: string, role: UserRole, name: string) => {
    setSession({ user: { username, role, name } });
  };

  const handleLogout = () => {
    setSession({ user: null });
    setActiveId(null);
    setIsAdminViewOpen(false);
    setIsStatsViewOpen(false);
  };

  // 如果未登录，展示登录页面
  if (!session.user) {
    return <Login onLogin={handleLogin} judges={judges} />;
  }

  const activeCandidate = candidates.find(c => c.id === activeId);

  return (
    <div className="flex h-screen bg-slate-50 relative">
      <Sidebar 
        candidates={candidates} 
        activeId={activeId} 
        session={session}
        syncConfig={syncConfig}
        isSyncing={isSyncing}
        onManualSync={() => performSync(true)}
        onSelect={(id) => { 
          setActiveId(id); 
          setIsAdminViewOpen(false); 
          setIsStatsViewOpen(false); 
        }} 
        onAdd={handleAdd}
        onDelete={(id) => {
          if (window.confirm("确定要删除该考生成绩吗？此操作不可撤销。")) {
            setCandidates(prev => prev.filter(c => c.id !== id));
            if (activeId === id) setActiveId(null);
          }
        }}
        onLogout={handleLogout}
        onOpenAdmin={() => { 
          setIsAdminViewOpen(true); 
          setIsStatsViewOpen(false); 
        }}
        onOpenStats={() => {
          setIsStatsViewOpen(true);
          setIsAdminViewOpen(false);
        }}
        isAdminViewOpen={isAdminViewOpen}
        isStatsViewOpen={isStatsViewOpen}
      />

      <main className="flex-1 overflow-hidden p-6">
        {isStatsViewOpen ? (
          <StatisticsView candidates={candidates} />
        ) : isAdminViewOpen ? (
          <AdminPanel 
            judges={judges} 
            onAddJudge={(nj) => {
              const judge = { ...nj, id: Date.now().toString(), createdAt: new Date().toLocaleDateString() };
              setJudges(prev => [...prev, judge]);
            }} 
            onDeleteJudge={(id) => setJudges(prev => prev.filter(j => j.id !== id))}
            onClose={() => setIsAdminViewOpen(false)}
            syncConfig={syncConfig}
            setSyncConfig={setSyncConfig}
            candidates={candidates}
          />
        ) : activeCandidate ? (
          <AssessmentForm 
            candidate={activeCandidate} 
            onChange={handleUpdate} 
            onSaveAndNew={handleSaveAndNew}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
            <div className="w-40 h-40 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-slate-100 transform hover:scale-105 transition-transform duration-300">
              <LayoutDashboard className="w-20 h-20 text-blue-100" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Teacher Evaluation System</h2>
              <p className="text-slate-500 mt-3 max-w-sm text-lg leading-relaxed">
                你好，{session.user.name}。欢迎进入 CAMPUPRO ENGLISH 教师评估系统。
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={handleAdd} className="px-8 py-4 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 transition-all font-bold">新建评估表</button>
              <button onClick={() => exportToExcel(candidates)} className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold">导出汇总表</button>
            </div>
          </div>
        )}
      </main>

      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-bold text-lg">评分已保存，同步中...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
