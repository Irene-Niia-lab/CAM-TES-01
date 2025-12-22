
import React, { useState } from 'react';
import { Judge, SyncConfig, Candidate } from '../types';
import { SyncService } from '../services/syncService';
import { UserPlus, Trash2, Users, ShieldCheck, Calendar, X, Cloud, Key, Globe, CheckCircle } from 'lucide-react';

interface AdminPanelProps {
  judges: Judge[];
  onAddJudge: (judge: Omit<Judge, 'id' | 'createdAt'>) => void;
  onDeleteJudge: (id: string) => void;
  onClose: () => void;
  syncConfig: SyncConfig;
  setSyncConfig: (cfg: SyncConfig) => void;
  candidates: Candidate[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  judges, onAddJudge, onDeleteJudge, onClose, syncConfig, setSyncConfig, candidates 
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [inputToken, setInputToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateSync = async () => {
    setLoading(true);
    const token = await SyncService.createSyncSession({
      candidates,
      judges,
      version: Date.now()
    });
    setSyncConfig({ ...syncConfig, enabled: true, token });
    setLoading(false);
  };

  const handleJoinSync = () => {
    if (inputToken.length < 5) return alert("请输入有效的同步 Token");
    setSyncConfig({ ...syncConfig, enabled: true, token: inputToken });
    alert("已成功加入同步组，请点击侧边栏刷新按钮同步数据");
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pr-2 custom-scrollbar">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">系统管理与同步设置</h2>
            <p className="text-slate-400 font-medium text-sm">管理员权限：账户维护与多端同步配置</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 数据云同步配置 */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              数据多端同步中心
            </h3>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${syncConfig.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {syncConfig.enabled ? '已开启 Cloud Enabled' : '本地模式 Local Only'}
            </div>
          </div>

          {!syncConfig.enabled ? (
            <div className="space-y-6">
              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                <p className="text-sm font-bold text-blue-700 leading-relaxed mb-4">
                  您可以将本设备作为“主设备”开启同步，或者输入其他设备的 Token 加入已有的评分组。
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleCreateSync}
                    disabled={loading}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Cloud className="w-5 h-5" />}
                    创建并开启云同步
                  </button>
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-blue-200"></div>
                    <span className="flex-shrink mx-4 text-blue-300 font-black text-[10px]">或者 OR</span>
                    <div className="flex-grow border-t border-blue-200"></div>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="输入他人提供的 Token"
                      value={inputToken}
                      onChange={(e) => setInputToken(e.target.value)}
                      className="flex-1 px-5 py-3 bg-white border border-blue-200 rounded-2xl outline-none font-bold text-blue-800 focus:ring-4 focus:ring-blue-100"
                    />
                    <button onClick={handleJoinSync} className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-2xl font-black hover:bg-blue-50 transition-all">加入</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-8 bg-emerald-50 rounded-3xl border border-emerald-100 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h4 className="text-xl font-black text-emerald-900 mb-2">云端连接已激活</h4>
                <p className="text-sm font-bold text-emerald-700 mb-6">分享下方同步码，其他设备即可查看并同步您的评分数据。</p>
                
                <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-emerald-200 flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">您的同步码 Sync Token</span>
                  <span className="text-3xl font-black text-slate-800 tracking-wider font-mono select-all cursor-pointer" title="点击全选复刻">
                    {syncConfig.token}
                  </span>
                </div>

                <button 
                  onClick={() => { if(confirm("禁用同步将停止云端交互，本地数据将保留。")) setSyncConfig({...syncConfig, enabled: false}); }}
                  className="mt-8 text-xs font-bold text-red-500 hover:text-red-700"
                >
                  停用云同步功能
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 评委账号管理 */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-[500px]">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            评委账号维护
          </h3>
          <div className="flex gap-4 mb-6">
             <input type="text" placeholder="姓名" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold" />
             <input type="text" placeholder="账号" value={username} onChange={(e) => setUsername(e.target.value)} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold" />
             <input type="text" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold" />
             <button onClick={() => { if(name&&username&&password) { onAddJudge({name,username,password}); setName(''); setUsername(''); setPassword(''); } }} className="px-6 bg-slate-900 text-white rounded-xl font-black hover:bg-blue-600 transition-all">+</button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-50 rounded-2xl">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-slate-50">
                <tr><th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">评委</th><th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase text-right">操作</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {judges.map(j => (
                  <tr key={j.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4"><span className="font-black text-slate-700">{j.name}</span><br/><span className="text-[10px] font-mono text-slate-400">{j.username}</span></td>
                    <td className="px-6 py-4 text-right"><button onClick={() => onDeleteJudge(j.id)} className="p-2 text-slate-200 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
