import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import UserPanel from './components/UserPanel';
import AdminPanel from './components/AdminPanel';
import { getCurrentUser, getSettings, AVAILABLE_THEMES } from './services/mockService';
import { UserRole } from './types';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Apply Theme
  useEffect(() => {
    const applyTheme = () => {
      const settings = getSettings();
      const theme = AVAILABLE_THEMES.find(t => t.id === settings.activeThemeId) || AVAILABLE_THEMES[0];
      
      const root = document.documentElement;
      root.style.setProperty('--color-primary', theme.colors.primary);
      root.style.setProperty('--color-primary-50', theme.colors.primaryLight);
      root.style.setProperty('--color-primary-100', theme.colors.primaryLight); // Fallback mapping
      root.style.setProperty('--color-primary-600', theme.colors.primary); // Fallback mapping
      root.style.setProperty('--color-primary-700', theme.colors.primaryDark);
      root.style.setProperty('--color-primary-800', theme.colors.primaryDark); // Fallback mapping
      
      root.style.setProperty('--color-secondary', theme.colors.secondary);
      root.style.setProperty('--color-secondary-100', '#f3f4f6');
      root.style.setProperty('--color-secondary-600', theme.colors.secondary);
      
      root.style.setProperty('--color-bg', theme.colors.bg);
    };

    // Apply on mount and every few seconds in case settings change (simpler than context for this mock)
    applyTheme();
    const interval = setInterval(applyTheme, 2000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check for existing session
    const user = getCurrentUser();
    if (user) {
      setCurrentRole(user.role);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (role: UserRole) => {
    setCurrentRole(role);
  };

  const handleLogout = () => {
    setCurrentRole(null);
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!currentRole) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentRole === UserRole.ADMIN) {
    return <AdminPanel onLogout={handleLogout} />;
  }

  return <UserPanel onLogout={handleLogout} />;
};

export default App;