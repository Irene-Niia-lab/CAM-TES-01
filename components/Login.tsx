
import React, { useState } from 'react';
import { UserRole, Judge } from '../types';
import { Lock, User, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, role: UserRole, name: string) => void;
  judges: Judge[];
}

const Login: React.FC<LoginProps> = ({ onLogin, judges }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Admin Check
    if (username === 'Irene' && password === 'CAM004') {
      onLogin('Irene', UserRole.ADMIN, '管理员 Irene');
      return;
    }

    // Built-in Judges Check
    if (username === 'Ciel' && password === '1223') {
      onLogin('Ciel', UserRole.JUDGE, 'Ciel 老师');
      return;
    }
    if (username === 'Lily' && password === '1223') {
      onLogin('Lily', UserRole.JUDGE, 'Lily 老师');
      return;
    }

    // Dynamic Judge Check (from local storage / sync)
    const judge = judges.find(j => j.username === username && j.password === password);
    if (judge) {
      onLogin(judge.username, UserRole.JUDGE, judge.name);
      return;
    }

    setError('账号或密码错误，请重新输入');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/20 mb-6 transform hover:rotate-12 transition-transform">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Teacher Evaluation System</h1>
          <p className="text-slate-400 font-medium">教师考核评分系统 · 评委登录</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">账号 Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="输入管理员或评委账号"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">密码 Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 transition-all transform active:scale-[0.98]"
            >
              立即登录 Login
            </button>
          </form>
        </div>
        
        <div className="text-center mt-8 space-y-1">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            CAMPUPRO ENGLISH
          </p>
          <p className="text-slate-600 text-[9px] font-medium uppercase tracking-[0.1em]">
            Developed by IRENE | v2.5
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
