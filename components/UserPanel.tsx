import React, { useState, useEffect } from 'react';
import { User, Transaction, TransactionType, WithdrawRequest, AppSettings } from '../types';
import { getCurrentUser, updateUser, getTransactions, getSettings, addTransaction, requestWithdrawal, getWithdrawals, logoutUser } from '../services/mockService';
import SpinWheel from './SpinWheel';
import { Home, Wallet, User as UserIcon, LogOut, Gift, Video, History, Share2, Info, AlertTriangle, Copy, Check, PlayCircle, Key } from 'lucide-react';

const UserPanel: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'HOME' | 'WALLET' | 'PROFILE'>('HOME');
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  
  // Referral Copy State
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    refreshData();
  }, [activeTab]); 

  const refreshData = () => {
    const u = getCurrentUser();
    if(u) {
      setUser(u);
      setTransactions(getTransactions(u.id));
      setWithdrawals(getWithdrawals(u.id));
    }
    setSettings(getSettings());
  };

  // --- Ad Logic Removed (Instant Actions) ---
  const triggerInterstitial = (onComplete: () => void) => {
      // Overlay removed. Executing action immediately.
      onComplete();
  };

  const handleNavigation = (tab: 'HOME' | 'WALLET' | 'PROFILE') => {
      if (tab === activeTab) return;
      setActiveTab(tab);
  };

  const handleWatchAd = (type: 'REWARDED' | 'INTERSTITIAL' | 'SPIN_REWARD') => {
    if(!user) return;
    
    // Instant Rewards without Overlay
    if (type === 'REWARDED') {
        const reward = settings.coinsPerAd;
        const updatedUser = { ...user, totalAdsWatched: (user.totalAdsWatched || 0) + 1 };
        updateUser(updatedUser);
        addTransaction(user.id, TransactionType.AD_REWARD, reward, "Watched Rewarded Ad");
        alert(`You earned ${reward} coins!`);
        refreshData();

    } else if (type === 'SPIN_REWARD') {
        const updatedUser = { ...user, totalAdsWatched: (user.totalAdsWatched || 0) + 1, spins: (user.spins || 0) + 1 };
        updateUser(updatedUser);
        addTransaction(user.id, TransactionType.AD_REWARD, 0, "Ad Reward: +1 Free Spin");
        alert(`You earned 1 Free Spin!`);
        refreshData();

    } else if (type === 'INTERSTITIAL') {
        const updatedUser = { ...user, totalAdsWatched: (user.totalAdsWatched || 0) + 1 };
        updateUser(updatedUser);
        addTransaction(user.id, TransactionType.AD_REWARD, 10, "Interstitial Ad Bonus");
        alert("Ad Bonus: +10 Coins");
        refreshData();
    }
  };

  const handleDailyCheckIn = () => {
    if(!user) return;
    const today = new Date().toDateString();
    if(user.lastDailyBonus === today) {
        alert("You have already claimed your daily bonus!");
        return;
    }

    // Trigger Ad before giving bonus (Instant)
    triggerInterstitial(() => {
        const bonus = 50;
        addTransaction(user.id, TransactionType.DAILY_CHECKIN, bonus, "Daily Check-in Bonus");
        updateUser({...user, lastDailyBonus: today, coins: user.coins + bonus});
        refreshData();
        alert(`Daily bonus claimed! +${bonus} Coins`);
    });
  };

  const handleShareReferral = () => {
      if(!user) return;
      const link = `${window.location.origin}?ref=${user.referralCode}`;
      
      triggerInterstitial(() => {
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            
            if (navigator.share) {
                navigator.share({
                    title: 'Join SpinRewards Pro!',
                    text: `Use my code ${user.referralCode} to get a bonus!`,
                    url: link,
                }).catch(console.error);
            } else {
                alert("Link copied to clipboard!");
            }
        });
      });
  };

  const [withdrawForm, setWithdrawForm] = useState({ amount: '', method: 'Easypaisa', details: '' });
  
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!user) return;
    
    // Trigger Ad before submitting request (Instant)
    triggerInterstitial(() => {
        try {
            requestWithdrawal(
                user.id, 
                user.name, 
                withdrawForm.method as any, 
                Number(withdrawForm.amount), 
                withdrawForm.details
            );
            alert("Withdrawal requested successfully!");
            setWithdrawForm({ amount: '', method: 'Easypaisa', details: '' });
            refreshData();
        } catch (err: any) {
            alert(err.message);
        }
    });
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-appbg pb-20 md:pb-0 relative transition-colors duration-500">
      
      {/* Mobile-like Container Max Width */}
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative overflow-hidden">
        
        {/* Header - Uses Primary Theme Color */}
        <header className="bg-primary-600 text-white p-4 shadow-md sticky top-0 z-30 transition-colors duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-bold text-lg">SpinRewards</h1>
                    <p className="text-xs text-primary-100 opacity-80">ID: {user.id.substring(0, 8)}</p>
                </div>
                <div className="flex items-center bg-primary-800 px-3 py-1 rounded-full">
                    <span className="text-yellow-400 font-bold mr-1">🪙</span>
                    <span className="font-mono font-bold">{user.coins}</span>
                </div>
            </div>
        </header>

        {/* Content Area */}
        <main className="p-4 space-y-6">
            
            {/* Banner Ad Simulation */}
            {settings.bannerAdsEnabled && (
                <div className="bg-gray-200 h-16 w-full flex items-center justify-center text-gray-500 text-xs rounded border border-gray-300 border-dashed mb-2 animate-pulse relative overflow-hidden">
                    <span className="font-mono z-10 relative">BANNER AD AREA</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-[spin-slow_3s_linear_infinite]"></div>
                </div>
            )}

            {activeTab === 'HOME' && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <div onClick={handleDailyCheckIn} className="bg-gradient-to-br from-primary-600 to-primary-800 text-white p-3 rounded-xl shadow-lg cursor-pointer transform transition hover:scale-105">
                            <Gift className="w-6 h-6 mb-1" />
                            <p className="text-xs font-semibold opacity-90">Daily Bonus</p>
                            <p className="font-bold">Claim Now</p>
                        </div>
                        <div onClick={handleShareReferral} className="bg-gradient-to-br from-secondary-600 to-teal-500 text-white p-3 rounded-xl shadow-lg cursor-pointer transform transition hover:scale-105">
                            <Share2 className="w-6 h-6 mb-1" />
                            <p className="text-xs font-semibold opacity-90">Refer & Earn</p>
                            <p className="font-bold">+{settings.referBonus}</p>
                        </div>
                    </div>

                    {/* Spin Wheel */}
                    <SpinWheel user={user} onUpdate={refreshData} />

                    {/* Refer Link Section */}
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                             <h3 className="font-bold text-indigo-900 text-sm">Referral Link</h3>
                             <span className="text-[10px] bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full">Earn {settings.referBonus}</span>
                        </div>
                        <div className="flex items-center bg-white p-2 rounded border border-indigo-200">
                            <div className="flex-1 truncate text-xs text-gray-500 font-mono">
                                {window.location.origin}?ref={user.referralCode}
                            </div>
                            <button 
                                onClick={handleShareReferral} 
                                className={`ml-2 p-1.5 rounded transition ${copied ? 'bg-green-500 text-white' : 'bg-indigo-100 text-indigo-600'}`}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Tasks / Ads Section - NOW WITH 3 DISTINCT ADS */}
                    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                            <Video className="w-4 h-4 mr-2 text-primary-600"/> 
                            Task Wall
                        </h3>
                        <div className="space-y-3">
                            
                            {/* Ad 1: Coins */}
                            <button 
                                onClick={() => handleWatchAd('REWARDED')}
                                className="w-full flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-100 hover:bg-primary-100 transition-colors group"
                            >
                                <div className="flex items-center text-primary-700">
                                    <div className="p-2 bg-white rounded-full mr-3 shadow-sm group-hover:scale-110 transition">
                                        <Video className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm">Watch Video Ad</p>
                                        <p className="text-xs opacity-75">Get +{settings.coinsPerAd} Coins</p>
                                    </div>
                                </div>
                                <span className="bg-primary-600 text-white text-xs px-3 py-1.5 rounded-full font-bold">Start</span>
                            </button>
                            
                            {/* Ad 2: Spin (New) */}
                            <button 
                                onClick={() => handleWatchAd('SPIN_REWARD')}
                                className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors group"
                            >
                                <div className="flex items-center text-purple-700">
                                     <div className="p-2 bg-white rounded-full mr-3 shadow-sm group-hover:scale-110 transition">
                                        <PlayCircle className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm">Lucky Spin Ad</p>
                                        <p className="text-xs opacity-75">Get +1 Free Spin</p>
                                    </div>
                                </div>
                                <span className="bg-purple-600 text-white text-xs px-3 py-1.5 rounded-full font-bold">Watch</span>
                            </button>

                            {/* Ad 3: Interstitial */}
                             <button 
                                onClick={() => handleWatchAd('INTERSTITIAL')}
                                className="w-full flex items-center justify-between p-3 bg-secondary-100 rounded-lg border border-secondary-600 border-opacity-20 hover:bg-opacity-80 transition-colors group"
                            >
                                <div className="flex items-center text-secondary-600">
                                     <div className="p-2 bg-white rounded-full mr-3 shadow-sm group-hover:scale-110 transition">
                                        <Gift className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm">Special Offer Ad</p>
                                        <p className="text-xs opacity-75">Surprise Bonus</p>
                                    </div>
                                </div>
                                <span className="bg-secondary-600 text-white text-xs px-3 py-1.5 rounded-full font-bold">View</span>
                            </button>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'WALLET' && (
                <div className="space-y-6">
                    <div className="bg-primary-600 text-white rounded-xl p-6 shadow-lg text-center transition-colors duration-500">
                        <p className="text-primary-100 text-sm mb-1">Total Balance</p>
                        <h2 className="text-4xl font-bold">{user.coins} <span className="text-xl">Coins</span></h2>
                        <p className="text-xs mt-2 opacity-75">Min Withdraw: {settings.minWithdraw}</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center"><Wallet className="w-5 h-5 mr-2 text-primary-600"/> Withdraw Request</h3>
                        
                        {/* Status Message / Warning */}
                        {settings.withdrawalInfoMessage && (
                            <div className={`mb-4 p-3 rounded-lg text-sm flex items-start ${settings.withdrawalsEnabled ? 'bg-blue-50 text-blue-800' : 'bg-yellow-50 text-yellow-800'}`}>
                                <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                <span>{settings.withdrawalInfoMessage}</span>
                            </div>
                        )}

                        {!settings.withdrawalsEnabled ? (
                             <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                                <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                                <h4 className="font-bold text-gray-700">Withdrawals Paused</h4>
                                <p className="text-sm text-gray-500 px-4 mt-1">
                                    Admin has temporarily disabled new withdrawal requests. Please check back later.
                                </p>
                             </div>
                        ) : (
                            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Method</label>
                                    <select 
                                        className="w-full p-2 border rounded mt-1 bg-gray-50 focus:ring-2 focus:ring-primary-600 outline-none"
                                        value={withdrawForm.method}
                                        onChange={(e) => setWithdrawForm({...withdrawForm, method: e.target.value})}
                                    >
                                        <option value="Easypaisa">Easypaisa</option>
                                        <option value="JazzCash">JazzCash</option>
                                        <option value="GiftCard">Gift Card</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Amount (Coins)</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-2 border rounded mt-1 bg-gray-50 focus:ring-2 focus:ring-primary-600 outline-none" 
                                        placeholder={`Min ${settings.minWithdraw}`}
                                        value={withdrawForm.amount}
                                        onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Account Number / Email</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2 border rounded mt-1 bg-gray-50 focus:ring-2 focus:ring-primary-600 outline-none" 
                                        placeholder="0300..."
                                        value={withdrawForm.details}
                                        onChange={(e) => setWithdrawForm({...withdrawForm, details: e.target.value})}
                                    />
                                </div>
                                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition">
                                    Withdraw Now
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4">Recent Withdrawals</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {withdrawals.length === 0 && <p className="text-center text-gray-400 text-sm">No history yet.</p>}
                            {withdrawals.map(w => (
                                <div key={w.id} className="flex justify-between items-center p-2 border-b last:border-0">
                                    <div>
                                        <p className="font-bold text-sm">{w.method}</p>
                                        <p className="text-xs text-gray-500">{new Date(w.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm">-{w.amount}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                            w.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                                            w.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>{w.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'PROFILE' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-md text-center border border-gray-100">
                        <div className="w-20 h-20 bg-primary-100 rounded-full mx-auto flex items-center justify-center text-primary-600 text-3xl font-bold mb-3">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold">{user.name}</h2>
                        <p className="text-gray-500 text-sm">{user.email || user.mobile}</p>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                             <div className="bg-gray-50 p-2 rounded">
                                <p className="text-xs text-gray-500">Total Spins</p>
                                <p className="font-bold text-lg text-primary-600">{user.totalSpins || 0}</p>
                             </div>
                             <div className="bg-gray-50 p-2 rounded">
                                <p className="text-xs text-gray-500">Ads Watched</p>
                                <p className="font-bold text-lg text-secondary-600">{user.totalAdsWatched || 0}</p>
                             </div>
                        </div>

                        {/* Account Details Box - Including Password */}
                        <div className="mt-6 bg-gray-50 rounded border border-gray-200 divide-y divide-gray-200">
                             <div className="p-3 flex justify-between items-center text-sm">
                                <span className="text-gray-500 flex items-center"><Key className="w-3 h-3 mr-1" /> Password</span>
                                <span className="font-mono font-bold text-gray-800">
                                    {user.password ? user.password : <span className="text-xs text-gray-400 italic">Google Login</span>}
                                </span>
                             </div>
                             <div className="p-3 flex justify-between items-center text-sm">
                                <span className="text-gray-500">Referral Code</span>
                                <span className="font-mono font-bold select-all text-primary-700">{user.referralCode}</span>
                             </div>
                        </div>

                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center"><History className="w-4 h-4 mr-2"/> Activity History</h3>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                             {transactions.slice(0, 10).map(t => (
                                <div key={t.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded hover:bg-gray-100">
                                    <span className="truncate w-2/3">{t.description}</span>
                                    <span className={`font-bold ${t.type === TransactionType.WITHDRAWAL ? 'text-red-600' : 'text-green-600'}`}>
                                        {t.type === TransactionType.WITHDRAWAL ? '-' : '+'}{t.amount}
                                    </span>
                                </div>
                             ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => { logoutUser(); onLogout(); }} 
                        className="w-full bg-red-100 text-red-600 font-bold py-3 rounded-lg hover:bg-red-200 transition flex items-center justify-center"
                    >
                        <LogOut className="w-5 h-5 mr-2" /> Logout
                    </button>
                </div>
            )}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 max-w-md w-full bg-white border-t border-gray-200 flex justify-around p-3 z-30">
            <button 
                onClick={() => handleNavigation('HOME')} 
                className={`flex flex-col items-center text-xs transition-colors ${activeTab === 'HOME' ? 'text-primary-600 font-bold scale-105' : 'text-gray-400'}`}
            >
                <Home className="w-6 h-6 mb-1" />
                Home
            </button>
            <button 
                onClick={() => handleNavigation('WALLET')} 
                className={`flex flex-col items-center text-xs transition-colors ${activeTab === 'WALLET' ? 'text-primary-600 font-bold scale-105' : 'text-gray-400'}`}
            >
                <Wallet className="w-6 h-6 mb-1" />
                Wallet
            </button>
            <button 
                onClick={() => handleNavigation('PROFILE')} 
                className={`flex flex-col items-center text-xs transition-colors ${activeTab === 'PROFILE' ? 'text-primary-600 font-bold scale-105' : 'text-gray-400'}`}
            >
                <UserIcon className="w-6 h-6 mb-1" />
                Profile
            </button>
        </nav>
      </div>
    </div>
  );
};

export default UserPanel;