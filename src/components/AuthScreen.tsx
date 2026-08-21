import React, { useState } from 'react';
import { api } from '../lib/api';
import { User } from '../types';
import { Loader2 } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (token: string, user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { username, password });
        onLoginSuccess(res.data.token, res.data.user);
      } else {
        const res = await api.post('/auth/register', {
          username,
          password,
          display_name: displayName || username,
        });
        onLoginSuccess(res.data.token, res.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-slate-200 text-slate-900">
      <div className="w-full max-w-xs bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 space-y-5">
        {/* Header */}
        <div className="text-center space-y-0.5">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Forma</h1>
          <p className="text-xs text-slate-400">Discipline in its purest form.</p>
        </div>

        {/* Segmented Mode Switcher (Login / Register) */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              isLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              !isLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-700 text-center font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Display Name</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Username</label>
            <input
              type="text"
              required
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isLogin ? 'Log In' : 'Create Account'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
