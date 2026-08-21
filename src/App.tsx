import React, { useState, useEffect } from 'react';
import { api } from './lib/api';
import { User } from './types';
import { AuthScreen } from './components/AuthScreen';
import { TrackerTab } from './components/TrackerTab';
import { RoutineTab } from './components/RoutineTab';
import { RecapTab } from './components/RecapTab';
import { ProfileTab } from './components/ProfileTab';
import { BottomNav, TabType } from './components/BottomNav';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(!!token && !user);
  const [activeTab, setActiveTab] = useState<TabType>('tracker');

  useEffect(() => {
    const handleLogoutEvent = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    };

    window.addEventListener('auth_logout', handleLogoutEvent);
    return () => window.removeEventListener('auth_logout', handleLogoutEvent);
  }, []);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  const handleLoginSuccess = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!token || !user) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-900 selection:bg-slate-200">
      {/* Mobile / Widget Frame Container */}
      <div className="w-full max-w-sm flex flex-col relative py-4">
        
        {/* Dynamic Tab Content */}
        <main className="flex-1 pb-20">
          {activeTab === 'tracker' && (
            <TrackerTab user={user} onUserUpdate={handleUserUpdate} />
          )}
          {activeTab === 'routine' && (
            <RoutineTab />
          )}
          {activeTab === 'recap' && (
            <RecapTab />
          )}
          {activeTab === 'profile' && (
            <ProfileTab user={user} onLogout={handleLogout} />
          )}
        </main>

        {/* 4-Tab Light Floating Pill Navigation Bar */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
};
