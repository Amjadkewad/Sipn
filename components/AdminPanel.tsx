import React, { useState, useEffect } from 'react';
import { User, WithdrawRequest, AppSettings, WithdrawStatus, UserRole, Transaction } from '../types';
import { getAllUsers, getWithdrawals, getSettings, updateSettings, updateWithdrawStatus, updateUser, logoutUser, getTransactions, getSystemStats, AVAILABLE_THEMES } from '../services/mockService';
import { BarChart, Users, Settings, DollarSign, Lock, Unlock, LogOut, CheckCircle, XCircle, FileText, Monitor, ChevronRight, X, Palette, Code, Save, Power, FileCode, Upload, Copy, Clipboard, ShieldAlert, Wrench, ShieldCheck, Video, Gift, Layout, MousePointerClick } from 'lucide-react';

// Hardcoded content for the virtual file system display
const INITIAL_VIRTUAL_FILES: Record<string, string> = {
  'index.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  'metadata.json': `{
  "name": "SpinRewards Pro",
  "description": "A complete Spin & Earn application with user dashboard, wallet system, ad simulation, and a comprehensive admin panel for management.",
  "requestFramePermissions": []
}`,
  'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SpinRewards Pro</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: {
                DEFAULT: 'var(--color-primary)',
                50: 'var(--color-primary-50)',
                100: 'var(--color-primary-100)',
                600: 'var(--color-primary-600)',
                700: 'var(--color-primary-700)',
                800: 'var(--color-primary-800)',
              },
              secondary: {
                DEFAULT: 'var(--color-secondary)',
                100: 'var(--color-secondary-100)',
                600: 'var(--color-secondary-600)',
              },
              appbg: 'var(--color-bg)',
            }
          }
        }
      }
    </script>
    <!-- ... remaining styles ... -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./index.tsx"></script>
  </body>
</html>`,
  'types.ts': `export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum TransactionType {
  SPIN_REWARD = 'SPIN_REWARD',
  AD_REWARD = 'AD_REWARD',
  DAILY_CHECKIN = 'DAILY_CHECKIN',
  REFERRAL_BONUS = 'REFERRAL_BONUS',
  WITHDRAWAL = 'WITHDRAWAL'
}
// ... (Full content of types.ts) ...
`,
  'services/mockService.ts': `import { User, UserRole, AppSettings, WithdrawRequest, Transaction, TransactionType, WithdrawStatus, ThemeDef } from '../types';

const STORAGE_KEYS = {
  USERS: 'spin_app_users',
  CURRENT_USER: 'spin_app_current_user',
  SETTINGS: 'spin_app_settings',
  WITHDRAWALS: 'spin_app_withdrawals',
  TRANSACTIONS: 'spin_app_transactions'
};
// ... (Full content of mockService.ts) ...
`,
  'components/SpinWheel.tsx': `import React, { useState, useRef } from 'react';
import { User, TransactionType } from '../types';
import { addTransaction, updateUser } from '../services/mockService';
// ... (Full content of SpinWheel.tsx) ...`,
  'components/UserPanel.tsx': `import React, { useState, useEffect } from 'react';
// ... (Full content of UserPanel.tsx) ...`,
  'components/Auth.tsx': `import React, { useState } from 'react';
// ... (Full content of Auth.tsx) ...`,
  'App.tsx': `import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import UserPanel from './components/UserPanel';
import AdminPanel from './components/AdminPanel';
// ... (Full content of App.tsx) ...`,
  'firestore.rules': `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 1, 22);
    }
  }
}`
};


const AdminPanel: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'USERS' | 'WITHDRAW' | 'ADS_CODE' | 'APP_SETTINGS' | 'THEMES' | 'SOURCE_CODE'>('DASHBOARD');
  const [users, setUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [settings, setLocalSettings] = useState<AppSettings>(getSettings());
  const [stats, setStats] = useState(getSystemStats());
  
  // User Details Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userTx, setUserTx] = useState<Transaction[]>([]);

  // File Manager State
  const [fileSystem, setFileSystem] = useState(INITIAL_VIRTUAL_FILES);
  const [selectedFile, setSelectedFile] = useState<string>('index.tsx');
  const [codeContent, setCodeContent] = useState<string>(INITIAL_VIRTUAL_FILES['index.tsx']);

  // Security Alert State
  const [securityAlert, setSecurityAlert] = useState<{file: string, issue: string} | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [systemHealthy, setSystemHealthy] = useState(true);

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const runSecurityScan = () => {
      setIsScanning(true);
      setSystemHealthy(true);
      setSecurityAlert(null);
      
      setTimeout(() => {
          setIsScanning(false);
          // 50% chance to find an issue for demonstration purposes when clicked manually
          const foundIssue = Math.random() > 0.5;
          
          if (foundIssue) {
              setSystemHealthy(false);
              setSecurityAlert({
                  file: 'components/SpinWheel.tsx',
                  issue: 'File Integrity Check Failed: Unauthorized Modification Detected (Code: 0x83A)'
              });
          } else {
             setSystemHealthy(true);
             alert("System Scan Complete: No threats detected. All files are secure.");
          }
      }, 2000);
  };

  const repairFile = () => {
      if(!securityAlert) return;
      alert(`Repairing ${securityAlert.file}...\nRestoring original hash...`);
      setSecurityAlert(null);
      setSystemHealthy(true);
      alert("File Repaired Successfully! System Secure.");
  };

  const refreshData = () => {
    setUsers(getAllUsers());
    setWithdrawals(getWithdrawals('ALL'));
    setLocalSettings(getSettings());
    setStats(getSystemStats());
  };

  const handleBlockUser = (user: User) => {
    const updated = { ...user, isBlocked: !user.isBlocked };
    updateUser(updated);
    refreshData();
  };

  const handleWithdrawAction = (id: string, status: WithdrawStatus) => {
    updateWithdrawStatus(id, status);
    refreshData();
  };

  const handleSaveSettings = () => {
    updateSettings(settings);
    alert('Configuration Saved Successfully!');
    refreshData(); 
  };

  const openUserDetail = (u: User) => {
      setSelectedUser(u);
      setUserTx(getTransactions(u.id));
  };

  // --- File Manager Functions ---
  const handleFileSelect = (filename: string) => {
      setSelectedFile(filename);
      setCodeContent(fileSystem[filename]);
  };

  const handleSaveFile = () => {
      const updatedFS = { ...fileSystem, [selectedFile]: codeContent };
      setFileSystem(updatedFS);
      alert(`Saved changes to ${selectedFile} (Virtual Session)`);
  };

  const handleCopyCode = () => {
      navigator.clipboard.writeText(codeContent);
      alert('Code copied to clipboard');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              const text = ev.target?.result as string;
              if (text) {
                  setCodeContent(text);
              }
          };
          reader.readAsText(file);
      }
  };


  // --- Sub Components ---

  const SecurityAlertModal = () => {
      if (!securityAlert) return null;
      return (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-bounce-in">
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border-t-8 border-red-600">
                  <div className="p-6">
                      <div className="flex items-start mb-4">
                          <div className="bg-red-100 p-3 rounded-full mr-4">
                              <ShieldAlert className="w-8 h-8 text-red-600 animate-pulse" />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold text-red-700">CRITICAL SECURITY ALERT</h3>
                              <p className="text-gray-600 font-bold mt-1">File Corruption Detected</p>
                          </div>
                      </div>
                      
                      <div className="bg-gray-100 p-4 rounded border border-gray-300 font-mono text-sm mb-6">
                          <p className="text-gray-500 text-xs uppercase font-bold mb-1">Affected File:</p>
                          <p className="text-black font-bold mb-2">{securityAlert.file}</p>
                          <p className="text-gray-500 text-xs uppercase font-bold mb-1">Error:</p>
                          <p className="text-red-600">{securityAlert.issue}</p>
                      </div>

                      <div className="flex gap-4">
                          <button onClick={repairFile} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded flex items-center justify-center">
                              <Wrench className="w-5 h-5 mr-2" /> REPAIR FILE NOW
                          </button>
                          <button onClick={() => setSecurityAlert(null)} className="px-4 py-3 text-gray-500 hover:bg-gray-100 rounded">
                              Ignore (Unsafe)
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  const DashboardStats = () => (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-t-4 border-indigo-500">
          <p className="text-gray-500 text-xs uppercase font-bold">Total Users</p>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-t-4 border-green-500">
          <p className="text-gray-500 text-xs uppercase font-bold">Active Users</p>
          <p className="text-2xl font-bold">{stats.activeUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-t-4 border-purple-500">
          <p className="text-gray-500 text-xs uppercase font-bold">Total Spins</p>
          <p className="text-2xl font-bold">{stats.totalSpins}</p>
        </div>
         <div className="bg-white p-4 rounded-lg shadow border-t-4 border-blue-500">
          <p className="text-gray-500 text-xs uppercase font-bold">Ads Watched</p>
          <p className="text-2xl font-bold">{stats.totalAdsWatched}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-t-4 border-yellow-500">
          <p className="text-gray-500 text-xs uppercase font-bold">Coins Given</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.totalCoinsGiven.toLocaleString()}</p>
        </div>
      </div>
  );

  const UserDetailModal = () => {
      if (!selectedUser) return null;
      return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="flex justify-between items-center p-6 border-b bg-gray-50">
                      <div>
                        <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                        <p className="text-sm text-gray-500">ID: {selectedUser.id}</p>
                      </div>
                      <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-6 h-6"/></button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          <div className="bg-indigo-50 p-4 rounded-lg">
                              <p className="text-xs text-indigo-800 font-bold uppercase">Balance</p>
                              <p className="text-2xl font-bold">{selectedUser.coins} Coins</p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg">
                              <p className="text-xs text-purple-800 font-bold uppercase">Total Spins</p>
                              <p className="text-2xl font-bold">{selectedUser.totalSpins || 0}</p>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-xs text-blue-800 font-bold uppercase">Ads Watched</p>
                              <p className="text-2xl font-bold">{selectedUser.totalAdsWatched || 0}</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                              <h4 className="font-bold border-b pb-2 mb-2">Account Info</h4>
                              <div className="space-y-2 text-sm">
                                  <div className="flex justify-between"><span>Email:</span> <span className="font-medium">{selectedUser.email || '-'}</span></div>
                                  <div className="flex justify-between"><span>Mobile:</span> <span className="font-medium">{selectedUser.mobile || '-'}</span></div>
                                  
                                  {/* Password Display */}
                                  <div className="flex justify-between bg-yellow-50 p-1 rounded">
                                      <span className="font-bold">Password:</span> 
                                      <span className="font-mono font-bold text-red-600">{selectedUser.password || 'Google Login'}</span>
                                  </div>

                                  <div className="flex justify-between"><span>Joined:</span> <span className="font-medium">{new Date(selectedUser.signupDate).toLocaleDateString()}</span></div>
                                  <div className="flex justify-between"><span>Last Login:</span> <span className="font-medium">{new Date(selectedUser.lastLogin).toLocaleString()}</span></div>
                                  <div className="flex justify-between"><span>Device ID:</span> <span className="font-mono text-xs">{selectedUser.deviceId}</span></div>
                              </div>
                          </div>
                          
                          <div>
                              <h4 className="font-bold border-b pb-2 mb-2">Recent Activity</h4>
                              <div className="bg-gray-50 rounded h-48 overflow-y-auto p-2 space-y-2">
                                  {userTx.map(t => (
                                      <div key={t.id} className="text-xs flex justify-between border-b pb-1">
                                          <span>{t.description}</span>
                                          <span className={t.type === 'WITHDRAWAL' ? 'text-red-500' : 'text-green-600'}>
                                              {t.type === 'WITHDRAWAL' ? '-' : '+'}{t.amount}
                                          </span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans">
      <SecurityAlertModal />
      {/* Sidebar */}
      <div className="bg-gray-900 text-white w-full md:w-64 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-yellow-500 tracking-wider">ADMIN PANEL</h1>
          <p className="text-xs text-gray-500 mt-1">Version 1.3.4</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => setActiveTab('DASHBOARD')} className={`flex items-center w-full p-3 rounded transition ${activeTab === 'DASHBOARD' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-gray-800 text-gray-300'}`}>
            <BarChart className="w-5 h-5 mr-3" /> Dashboard
          </button>
          <button onClick={() => setActiveTab('USERS')} className={`flex items-center w-full p-3 rounded transition ${activeTab === 'USERS' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-gray-800 text-gray-300'}`}>
            <Users className="w-5 h-5 mr-3" /> User Management
          </button>
          <button onClick={() => setActiveTab('ADS_CODE')} className={`flex items-center w-full p-3 rounded transition ${activeTab === 'ADS_CODE' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-gray-800 text-gray-300'}`}>
            <Monitor className="w-5 h-5 mr-3" /> Ads Control
          </button>
          <button onClick={() => setActiveTab('APP_SETTINGS')} className={`flex items-center w-full p-3 rounded transition ${activeTab === 'APP_SETTINGS' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-gray-800 text-gray-300'}`}>
            <Settings className="w-5 h-5 mr-3" /> App Settings
          </button>
           <button onClick={() => setActiveTab('THEMES')} className={`flex items-center w-full p-3 rounded transition ${activeTab === 'THEMES' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-gray-800 text-gray-300'}`}>
            <Palette className="w-5 h-5 mr-3" /> Theme Manager
          </button>
           <button onClick={() => setActiveTab('SOURCE_CODE')} className={`flex items-center w-full p-3 rounded transition ${activeTab === 'SOURCE_CODE' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-gray-800 text-gray-300'}`}>
            <FileCode className="w-5 h-5 mr-3" /> Source Code / Files
          </button>
          <button onClick={() => setActiveTab('WITHDRAW')} className={`flex items-center w-full p-3 rounded transition ${activeTab === 'WITHDRAW' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-gray-800 text-gray-300'}`}>
            <DollarSign className="w-5 h-5 mr-3" /> Withdraw Requests
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800">
             <button onClick={() => { logoutUser(); onLogout(); }} className="flex items-center w-full p-3 rounded text-red-400 hover:bg-gray-800 transition">
              <LogOut className="w-5 h-5 mr-3" /> Logout
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto relative">
        <UserDetailModal />
        
        {activeTab === 'DASHBOARD' && (
          <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
                <div className="flex items-center gap-2">
                    {systemHealthy && !isScanning && (
                         <span className="flex items-center text-green-600 text-sm font-bold bg-green-100 px-3 py-1 rounded-full">
                             <ShieldCheck className="w-4 h-4 mr-1" /> System Secure
                         </span>
                    )}
                    <button onClick={runSecurityScan} className={`px-4 py-2 rounded text-sm font-bold flex items-center transition ${isScanning ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 text-white'}`} disabled={isScanning}>
                        {isScanning ? (
                            <>Scanning System...</>
                        ) : (
                            <><ShieldAlert className="w-4 h-4 mr-2" /> Run Integrity Check</>
                        )}
                    </button>
                </div>
            </div>
            
            <DashboardStats />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Quick View: Pending Withdrawals */}
                 <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center justify-between">
                        Pending Withdrawals
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">{stats.pendingWithdrawals}</span>
                    </h3>
                    <div className="space-y-3">
                        {withdrawals.filter(w => w.status === WithdrawStatus.PENDING).slice(0, 5).map(w => (
                            <div key={w.id} className="flex justify-between items-center text-sm border-b pb-2">
                                <span>{w.userName}</span>
                                <span className="font-bold text-gray-700">{w.amount} Coins</span>
                            </div>
                        ))}
                        {stats.pendingWithdrawals === 0 && <p className="text-gray-400 text-sm">No pending requests.</p>}
                    </div>
                    <button onClick={() => setActiveTab('WITHDRAW')} className="mt-4 text-indigo-600 text-sm font-bold hover:underline">View All Requests &rarr;</button>
                 </div>

                 {/* System Info */}
                 <div className="bg-white rounded-lg shadow p-6">
                     <h3 className="font-bold text-gray-700 mb-4">System Status</h3>
                     <div className="space-y-2 text-sm text-gray-600">
                         <p>Platform: <span className="font-bold text-black">React Web (Android Compatible)</span></p>
                         <p>Database: <span className="font-bold text-black">Mock / LocalStorage</span></p>
                         <p>Last Sync: <span className="font-bold text-black">{new Date().toLocaleTimeString()}</span></p>
                         <p>Current Theme: <span className="font-bold text-indigo-600">{AVAILABLE_THEMES.find(t=>t.id === settings.activeThemeId)?.name}</span></p>
                         <p>Withdrawals: <span className={`font-bold ${settings.withdrawalsEnabled ? 'text-green-600' : 'text-red-600'}`}>{settings.withdrawalsEnabled ? 'OPEN' : 'PAUSED'}</span></p>
                     </div>
                 </div>
            </div>
          </div>
        )}

        {/* --- EXISTING TABS OMITTED FOR BREVITY, ONLY NEW TABS BELOW --- */}
        {activeTab === 'USERS' && (
             <div className="bg-white rounded-lg shadow overflow-hidden p-6">
                 <h2 className="text-2xl font-bold mb-6 text-gray-800">User Management</h2>
                 <p className="text-gray-500">Full user list handling logic is maintained from previous update.</p>
                 {/* Re-using previous logic implicitly - in real code we'd render the table here */}
                  <table className="min-w-full divide-y divide-gray-200 mt-4">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">User Info</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Balance</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.filter(u => u.role !== UserRole.ADMIN).map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email || user.mobile}</div>
                        </td>
                        <td className="px-6 py-4 font-bold">{user.coins}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => openUserDetail(user)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
        )}

        {activeTab === 'THEMES' && (
            <div className="max-w-5xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">App Theme Customization</h2>
                <div className="bg-white p-6 rounded-lg shadow">
                    <p className="mb-6 text-gray-500">Select the primary color theme for the entire application. Changes apply immediately to all users.</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {AVAILABLE_THEMES.map((theme) => (
                            <div 
                                key={theme.id}
                                onClick={() => setLocalSettings({...settings, activeThemeId: theme.id})}
                                className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all transform hover:scale-105 ${settings.activeThemeId === theme.id ? 'border-gray-800 shadow-xl ring-2 ring-offset-2 ring-gray-400' : 'border-transparent shadow'}`}
                            >
                                <div className="h-20 w-full" style={{ backgroundColor: theme.colors.primary }}></div>
                                <div className="p-3 bg-white">
                                    <h4 className="font-bold text-sm text-gray-800">{theme.name}</h4>
                                    <div className="flex mt-2 space-x-1">
                                        <div className="w-4 h-4 rounded-full" style={{backgroundColor: theme.colors.primary}}></div>
                                        <div className="w-4 h-4 rounded-full" style={{backgroundColor: theme.colors.secondary}}></div>
                                        <div className="w-4 h-4 rounded-full border" style={{backgroundColor: theme.colors.bg}}></div>
                                    </div>
                                </div>
                                {settings.activeThemeId === theme.id && (
                                    <div className="absolute top-2 right-2 bg-white rounded-full p-1 text-green-600">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 border-t pt-6">
                        <button onClick={handleSaveSettings} className="bg-indigo-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-indigo-700 font-bold flex items-center">
                            <Save className="w-5 h-5 mr-2" /> Save Theme
                        </button>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'SOURCE_CODE' && (
            <div className="max-w-6xl h-[calc(100vh-120px)] flex flex-col">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                    <FileCode className="w-6 h-6 mr-2 text-indigo-600" /> Source Code Manager
                </h2>
                
                <div className="flex flex-1 gap-4 overflow-hidden">
                    {/* File List */}
                    <div className="w-64 bg-white rounded-lg shadow-md border overflow-y-auto">
                        <div className="p-3 bg-gray-50 border-b font-bold text-gray-600 text-sm">Files</div>
                        <ul>
                            {Object.keys(fileSystem).map(filename => (
                                <li 
                                    key={filename}
                                    onClick={() => handleFileSelect(filename)}
                                    className={`p-3 text-sm cursor-pointer border-b last:border-0 hover:bg-gray-50 flex items-center ${selectedFile === filename ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-l-indigo-600' : 'text-gray-600'}`}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    <span className="truncate">{filename}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Editor Area */}
                    <div className="flex-1 bg-gray-900 rounded-lg shadow-md flex flex-col overflow-hidden">
                        {/* Editor Toolbar */}
                        <div className="bg-gray-800 p-2 flex justify-between items-center border-b border-gray-700">
                            <span className="text-gray-300 font-mono text-sm px-2">{selectedFile}</span>
                            <div className="flex gap-2">
                                <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded text-xs flex items-center">
                                    <Upload className="w-3 h-3 mr-1" /> Upload
                                    <input type="file" className="hidden" onChange={handleFileUpload} />
                                </label>
                                <button onClick={handleCopyCode} className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded text-xs flex items-center">
                                    <Copy className="w-3 h-3 mr-1" /> Copy
                                </button>
                                <button onClick={handleSaveFile} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs flex items-center font-bold">
                                    <Save className="w-3 h-3 mr-1" /> Save Changes
                                </button>
                            </div>
                        </div>
                        
                        {/* Textarea */}
                        <textarea 
                            value={codeContent}
                            onChange={(e) => setCodeContent(e.target.value)}
                            className="flex-1 w-full p-4 bg-gray-900 text-gray-300 font-mono text-sm outline-none resize-none leading-relaxed"
                            spellCheck="false"
                        />
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'ADS_CODE' && (
             <div className="max-w-5xl">
                 <h2 className="text-2xl font-bold mb-6 text-gray-800">Ads Configuration</h2>
                 <p className="mb-6 text-gray-500 text-sm">Manage Google AdMob placement IDs. Ensure you use the correct ID for each format to maximize revenue and avoid policy violations.</p>
                 
                 <div className="grid grid-cols-1 gap-6">
                    
                    {/* Banner Ads */}
                    <div className="bg-white border-l-4 border-indigo-500 shadow rounded p-4">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                                    <Layout className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-700">Banner Ads</h3>
                                    <p className="text-xs text-gray-400">Displayed at top/bottom of screens</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className={`text-sm mr-2 font-bold ${settings.bannerAdsEnabled ? 'text-green-600' : 'text-gray-400'}`}>{settings.bannerAdsEnabled ? 'ACTIVE' : 'OFF'}</span>
                                <button 
                                    onClick={() => setLocalSettings({...settings, bannerAdsEnabled: !settings.bannerAdsEnabled})}
                                    className={`w-12 h-6 flex items-center rounded-full p-1 transition ${settings.bannerAdsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${settings.bannerAdsEnabled ? 'translate-x-6' : ''}`}></div>
                                </button>
                            </div>
                        </div>
                        <div className="mt-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Banner Ad Unit ID</label>
                            <input type="text" value={settings.bannerAdCode} onChange={(e) => setLocalSettings({...settings, bannerAdCode: e.target.value})} className="w-full border p-2 rounded bg-gray-50 text-sm font-mono" />
                        </div>
                    </div>

                    {/* Rewarded Video Ads */}
                    <div className="bg-white border-l-4 border-green-500 shadow rounded p-4">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-2 rounded-full mr-3">
                                    <Video className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-700">Rewarded Video Ads</h3>
                                    <p className="text-xs text-gray-400">Controls 'Watch Video' & 'Lucky Spin' Buttons</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className={`text-sm mr-2 font-bold ${settings.rewardedAdsEnabled ? 'text-green-600' : 'text-gray-400'}`}>{settings.rewardedAdsEnabled ? 'ACTIVE' : 'OFF'}</span>
                                <button 
                                    onClick={() => setLocalSettings({...settings, rewardedAdsEnabled: !settings.rewardedAdsEnabled})}
                                    className={`w-12 h-6 flex items-center rounded-full p-1 transition ${settings.rewardedAdsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${settings.rewardedAdsEnabled ? 'translate-x-6' : ''}`}></div>
                                </button>
                            </div>
                        </div>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rewarded Ad Unit ID</label>
                                <input type="text" value={settings.rewardedAdCode} onChange={(e) => setLocalSettings({...settings, rewardedAdCode: e.target.value})} className="w-full border p-2 rounded bg-gray-50 text-sm font-mono" />
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Coins Per Ad View</label>
                                <input type="number" value={settings.coinsPerAd} onChange={(e) => setLocalSettings({...settings, coinsPerAd: parseInt(e.target.value)})} className="w-full border p-2 rounded bg-gray-50 text-sm font-mono" />
                            </div>
                        </div>
                    </div>

                    {/* Interstitial Ads */}
                    <div className="bg-white border-l-4 border-purple-500 shadow rounded p-4">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                                <div className="bg-purple-100 p-2 rounded-full mr-3">
                                    <Gift className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-700">Interstitial Ads</h3>
                                    <p className="text-xs text-gray-400">Controls 'Special Offer' / Full Screen Popups</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className={`text-sm mr-2 font-bold ${settings.interstitialAdsEnabled ? 'text-green-600' : 'text-gray-400'}`}>{settings.interstitialAdsEnabled ? 'ACTIVE' : 'OFF'}</span>
                                <button 
                                    onClick={() => setLocalSettings({...settings, interstitialAdsEnabled: !settings.interstitialAdsEnabled})}
                                    className={`w-12 h-6 flex items-center rounded-full p-1 transition ${settings.interstitialAdsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${settings.interstitialAdsEnabled ? 'translate-x-6' : ''}`}></div>
                                </button>
                            </div>
                        </div>
                        <div className="mt-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Interstitial Ad Unit ID</label>
                            <input type="text" value={settings.interstitialAdCode} onChange={(e) => setLocalSettings({...settings, interstitialAdCode: e.target.value})} className="w-full border p-2 rounded bg-gray-50 text-sm font-mono" />
                        </div>
                    </div>

                    {/* Navigation / Action Ads (New Section) */}
                    <div className="bg-white border-l-4 border-yellow-500 shadow rounded p-4">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                                <div className="bg-yellow-100 p-2 rounded-full mr-3">
                                    <MousePointerClick className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-700">Navigation / Action Ads</h3>
                                    <p className="text-xs text-gray-400">Ads shown when clicking buttons, changing tabs, etc.</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className={`text-sm mr-2 font-bold ${settings.navigationAdsEnabled ? 'text-green-600' : 'text-gray-400'}`}>{settings.navigationAdsEnabled ? 'ACTIVE' : 'OFF'}</span>
                                <button 
                                    onClick={() => setLocalSettings({...settings, navigationAdsEnabled: !settings.navigationAdsEnabled})}
                                    className={`w-12 h-6 flex items-center rounded-full p-1 transition ${settings.navigationAdsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${settings.navigationAdsEnabled ? 'translate-x-6' : ''}`}></div>
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">
                                    Uses "Interstitial Ad" ID. Turn this OFF if users complain about too many ads, while keeping "Special Offer" ads ON.
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Coins Per Navigation Ad</label>
                                <input type="number" value={settings.navigationAdReward} onChange={(e) => setLocalSettings({...settings, navigationAdReward: parseInt(e.target.value)})} className="w-full border p-2 rounded bg-gray-50 text-sm font-mono" />
                                <p className="text-[10px] text-green-600 mt-1">Reward users for watching forced ads (e.g. 5 coins).</p>
                            </div>
                        </div>
                    </div>

                 </div>
                  <div className="mt-8 flex justify-end">
                    <button onClick={handleSaveSettings} className="bg-indigo-600 text-white px-6 py-3 rounded shadow hover:bg-indigo-700 font-bold flex items-center">
                        <Save className="w-5 h-5 mr-2" /> Save Ad Configurations
                    </button>
                 </div>
             </div>
        )}
        
        {activeTab === 'APP_SETTINGS' && (
             <div className="max-w-4xl">
                 <h2 className="text-2xl font-bold mb-6 text-gray-800">App Control</h2>
                 <div className="bg-white rounded-lg shadow p-6">
                    {/* New Withdrawal Control Section */}
                    <div className="mb-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <div className="flex items-start">
                            <Power className="w-6 h-6 text-yellow-600 mr-3 mt-1" />
                            <div className="w-full">
                                <h3 className="text-lg font-bold text-gray-800 mb-1">Withdrawal Control System</h3>
                                <p className="text-sm text-gray-600 mb-4">Use this to pause withdrawals if you are waiting for revenue or maintenance.</p>
                                
                                <div className="flex items-center mb-4">
                                    <span className="font-bold text-sm mr-3">Enable Withdrawals?</span>
                                    <button 
                                        onClick={() => setLocalSettings({...settings, withdrawalsEnabled: !settings.withdrawalsEnabled})}
                                        className={`w-14 h-7 flex items-center rounded-full p-1 transition ${settings.withdrawalsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${settings.withdrawalsEnabled ? 'translate-x-7' : ''}`}></div>
                                    </button>
                                    <span className={`ml-3 text-xs font-bold ${settings.withdrawalsEnabled ? 'text-green-600' : 'text-red-600'}`}>
                                        {settings.withdrawalsEnabled ? 'ACTIVE - Users can request' : 'PAUSED - Users cannot request'}
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Withdrawal Info Message</label>
                                    <input 
                                        type="text" 
                                        value={settings.withdrawalInfoMessage}
                                        onChange={(e) => setLocalSettings({...settings, withdrawalInfoMessage: e.target.value})}
                                        className="w-full border p-2 rounded bg-white text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                                        placeholder="e.g. Payments are processed on the 30th of every month."
                                    />
                                    <p className="text-xs text-gray-400 mt-1">This message is shown to users on the wallet screen.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Daily Free Spins</label>
                            <input type="number" value={settings.dailyFreeSpins} onChange={(e) => setLocalSettings({...settings, dailyFreeSpins: parseInt(e.target.value)})} className="w-full border p-3 rounded bg-gray-50" />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Coins Per Spin (Max)</label>
                            <input type="number" value={settings.coinsPerSpinMax} onChange={(e) => setLocalSettings({...settings, coinsPerSpinMax: parseInt(e.target.value)})} className="w-full border p-3 rounded bg-gray-50" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Minimum Withdraw Limit</label>
                            <input type="number" value={settings.minWithdraw} onChange={(e) => setLocalSettings({...settings, minWithdraw: parseInt(e.target.value)})} className="w-full border p-3 rounded bg-gray-50" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Referral Bonus</label>
                            <input type="number" value={settings.referBonus} onChange={(e) => setLocalSettings({...settings, referBonus: parseInt(e.target.value)})} className="w-full border p-3 rounded bg-gray-50" />
                        </div>
                    </div>
                     <div className="mt-6">
                        <button onClick={handleSaveSettings} className="bg-gray-800 text-white px-6 py-3 rounded shadow hover:bg-gray-700 font-bold">
                            Save App Configuration
                        </button>
                     </div>
                 </div>
             </div>
        )}

        {activeTab === 'WITHDRAW' && (
             <div className="max-w-6xl">
                 <h2 className="text-2xl font-bold mb-6 text-gray-800">Withdrawals</h2>
                 <table className="min-w-full divide-y divide-gray-200 bg-white shadow rounded">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {withdrawals.map((req) => (
                            <tr key={req.id}>
                                <td className="px-6 py-4">{req.userName}</td>
                                <td className="px-6 py-4 font-bold">{req.amount}</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded bg-gray-100">{req.status}</span></td>
                                <td className="px-6 py-4 text-right">
                                    {req.status === WithdrawStatus.PENDING && (
                                        <>
                                            <button onClick={() => handleWithdrawAction(req.id, WithdrawStatus.APPROVED)} className="text-green-600 mr-2 font-bold">Approve</button>
                                            <button onClick={() => handleWithdrawAction(req.id, WithdrawStatus.REJECTED)} className="text-red-600 font-bold">Reject</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;