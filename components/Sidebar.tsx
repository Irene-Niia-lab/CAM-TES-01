
import React from 'react';
import { Candidate, UserRole, AuthSession, SyncConfig } from '../types';
import { UserPlus, Users, Trash2, Search, Settings, LogOut, ShieldAlert, BarChart2, Cloud, RefreshCw } from 'lucide-react';

interface SidebarProps {
  candidates: Candidate[];
  activeId: string | null;
  session: AuthSession;
  syncConfig: SyncConfig;
  isSyncing: boolean;
  onManualSync: () => void;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
  onOpenStats: () => void;
  isAdminViewOpen: boolean;
  isStatsViewOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  candidates, 
  activeId, 
  session, 
  syncConfig,
  isSyncing,
  onManualSync,
  onSelect, 
  onAdd, 
  onDelete, 
  onLogout, 
  onOpenAdmin,
  onOpenStats,
  isAdminViewOpen,
  isStatsViewOpen
}) => {
  return (
    <div className="w-80 bg-white border-r border-slate-200 h-screen flex flex-col no-print shadow-xl z-10">
      <div className="p-8 border-b border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            评委端
          </h1>
          <button 
            onClick={onAdd}
            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all shadow-sm"
            title="添加考生"
          >
            <UserPlus className="w-6 h-6" />
          </button>
        </div>
        
        {/* 云同步中心 */}
        <div className={`p-4 rounded-2xl border mb-6 transition-all ${syncConfig.enabled ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              < Cloud className={`w-4 h-4 ${syncConfig.enabled ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">云同步状态</span>
            </div>
            {syncConfig.enabled && (
               <button 
                onClick={onManualSync} 
                disabled={isSyncing}
                className="p-1 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-3 h-3 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-700">
              {syncConfig.enabled ? (syncConfig.token ? '已联机' : '待配置') : '离线模式'}
            </p>
            <p className="text-[10px] font-medium text-slate-400">
              {syncConfig.lastSynced ? `同步于 ${syncConfig.lastSynced}` : '尚未同步'}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索考生..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {candidates.map(c => (
          <div 
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`group relative p-5 rounded-2xl cursor-pointer border-2 transition-all duration-200 ${
              activeId === c.id && !isAdminViewOpen && !isStatsViewOpen
                ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-100 text-white' 
                : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100 shadow-sm'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col">
                <span className={`text-xs font-black uppercase tracking-widest mb-1 ${activeId === c.id ? 'text-blue-200' : 'text-slate-400'}`}>
                  ID: {c.group}-{c.groupIndex}
                </span>
                <span className="text-lg font-black truncate max-w-[160px]">
                  {c.name || '未命名'}
                </span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${activeId === c.id ? 'bg-blue-500' : 'bg-slate-100 text-slate-500'}`}>{c.category}</div>
              <div className="text-lg font-black">{c.totalScore} <span className="text-[10px] opacity-60">/ 100</span></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="flex flex-col gap-2">
          {/* 成绩汇总统计向所有用户开放 */}
          <button onClick={onOpenStats} className={`flex items-center gap-3 w-full p-3 rounded-2xl font-black text-sm transition-all ${isStatsViewOpen ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
            <BarChart2 className="w-5 h-5" /> 成绩汇总统计
          </button>
          
          {session.user?.role === UserRole.ADMIN && (
            <button onClick={onOpenAdmin} className={`flex items-center gap-3 w-full p-3 rounded-2xl font-black text-sm transition-all ${isAdminViewOpen ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
              <Settings className="w-5 h-5" /> 系统与同步设置
            </button>
          )}
          
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mt-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${session.user?.role === UserRole.ADMIN ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                {session.user?.role === UserRole.ADMIN ? <ShieldAlert className="w-5 h-5" /> : <Users className="w-5 h-5" />}
              </div>
              <div className="truncate"><p className="text-[10px] font-black text-slate-400 uppercase">User</p><p className="text-sm font-black text-slate-800">{session.user?.name}</p></div>
            </div>
            <button onClick={onLogout} className="p-2 text-slate-300 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
