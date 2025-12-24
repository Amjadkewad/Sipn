import { User, UserRole, AppSettings, WithdrawRequest, Transaction, TransactionType, WithdrawStatus, ThemeDef } from '../types';

const STORAGE_KEYS = {
  USERS: 'spin_app_users',
  CURRENT_USER: 'spin_app_current_user',
  SETTINGS: 'spin_app_settings',
  WITHDRAWALS: 'spin_app_withdrawals',
  TRANSACTIONS: 'spin_app_transactions'
};

const DEFAULT_FIREBASE_RULES = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 1, 22);
    }
  }
}`;

const DEFAULT_SETTINGS: AppSettings = {
  dailyFreeSpins: 5,
  coinsPerSpinMin: 10,
  coinsPerSpinMax: 100,
  coinsPerAd: 50,
  minWithdraw: 5000,
  referBonus: 200,
  bannerAdsEnabled: true,
  interstitialAdsEnabled: true,
  rewardedAdsEnabled: true,
  navigationAdsEnabled: true,
  navigationAdReward: 5, 
  bannerAdCode: 'CA-APP-PUB-BANNER-DEMO',
  interstitialAdCode: 'CA-APP-PUB-INTER-DEMO',
  rewardedAdCode: 'CA-APP-PUB-REWARD-DEMO',
  activeThemeId: 'theme-indigo',
  firebaseConfigCode: DEFAULT_FIREBASE_RULES,
  withdrawalsEnabled: true,
  withdrawalInfoMessage: "Payments are processed within 24-48 hours."
};

export const AVAILABLE_THEMES: ThemeDef[] = [
  { id: 'theme-indigo', name: 'Classic Indigo', colors: { primary: '#4f46e5', primaryLight: '#eef2ff', primaryDark: '#3730a3', secondary: '#f59e0b', bg: '#f3f4f6' } },
  { id: 'theme-purple', name: 'Royal Purple', colors: { primary: '#9333ea', primaryLight: '#f3e8ff', primaryDark: '#6b21a8', secondary: '#ec4899', bg: '#faf5ff' } },
  { id: 'theme-blue', name: 'Ocean Blue', colors: { primary: '#2563eb', primaryLight: '#eff6ff', primaryDark: '#1e40af', secondary: '#06b6d4', bg: '#eff6ff' } },
  { id: 'theme-green', name: 'Emerald Forest', colors: { primary: '#059669', primaryLight: '#ecfdf5', primaryDark: '#065f46', secondary: '#84cc16', bg: '#f0fdf4' } },
  { id: 'theme-red', name: 'Crimson Power', colors: { primary: '#dc2626', primaryLight: '#fef2f2', primaryDark: '#991b1b', secondary: '#f97316', bg: '#fef2f2' } },
  { id: 'theme-orange', name: 'Sunset Orange', colors: { primary: '#ea580c', primaryLight: '#fff7ed', primaryDark: '#9a3412', secondary: '#facc15', bg: '#fff7ed' } },
  { id: 'theme-pink', name: 'Hot Pink', colors: { primary: '#db2777', primaryLight: '#fdf2f8', primaryDark: '#9d174d', secondary: '#6366f1', bg: '#fdf2f8' } },
  { id: 'theme-teal', name: 'Cyber Teal', colors: { primary: '#0d9488', primaryLight: '#f0fdfa', primaryDark: '#115e59', secondary: '#14b8a6', bg: '#f0fdfa' } },
  { id: 'theme-slate', name: 'Midnight Slate', colors: { primary: '#475569', primaryLight: '#f8fafc', primaryDark: '#1e293b', secondary: '#94a3b8', bg: '#f1f5f9' } },
  { id: 'theme-gold', name: 'Luxury Gold', colors: { primary: '#d97706', primaryLight: '#fffbeb', primaryDark: '#b45309', secondary: '#78350f', bg: '#fffbeb' } },
];

// --- Helper Functions (Safeguarded) ---

const getStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.warn('Storage Access Error:', e);
    return defaultValue;
  }
};

const setStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage Write Error:', e);
  }
};

// --- Settings Service ---

export const getSettings = (): AppSettings => {
  return getStorage<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
};

export const updateSettings = (settings: AppSettings): void => {
  setStorage(STORAGE_KEYS.SETTINGS, settings);
};

// --- User Service ---

export const getAllUsers = (): User[] => {
  return getStorage<User[]>(STORAGE_KEYS.USERS, []);
};

export const loginUser = (identifier: string, passwordOrMobile: string, isMobileLogin: boolean): User | null => {
  // Admin Check
  if (identifier === 'Amjad kewad' && passwordOrMobile === 'Amjad3139') {
    const adminUser: User = {
      id: 'admin_001',
      name: 'Amjad Admin',
      email: 'admin@spinapp.com',
      mobile: '0000000000',
      role: UserRole.ADMIN,
      coins: 0,
      spins: 0,
      totalSpins: 0,
      totalAdsWatched: 0,
      deviceId: 'ADMIN_DEVICE',
      signupDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isBlocked: false,
      referralCode: 'ADMIN'
    };
    setStorage(STORAGE_KEYS.CURRENT_USER, adminUser);
    return adminUser;
  }

  const users = getAllUsers();
  
  const user = users.find(u => 
    (isMobileLogin ? u.mobile === identifier : u.email === identifier) || 
    u.name === identifier // Fallback for name login
  );

  if (user) {
    // Password Check
    if (user.password && user.password !== passwordOrMobile && !isMobileLogin) {
        throw new Error("Invalid password");
    }

    if (user.isBlocked) throw new Error("Account Blocked by Admin");
    
    // Check device lock (Security Feature)
    try {
        const currentDeviceId = localStorage.getItem('device_id') || 'unknown';
        // Logic for device ID check can go here
    } catch(e) {}

    user.lastLogin = new Date().toISOString();
    updateUser(user);
    setStorage(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  }
  return null;
};

export const registerUser = (name: string, email: string, mobile: string, password?: string): User => {
  const users = getAllUsers();
  
  if (users.some(u => u.email === email || u.mobile === mobile)) {
    throw new Error("User already exists with this email or mobile.");
  }

  let deviceId = 'unknown';
  try {
    deviceId = localStorage.getItem('device_id') || '';
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(7);
      localStorage.setItem('device_id', deviceId);
    }
  } catch(e) {}

  const settings = getSettings();

  const newUser: User = {
    id: `USER_${Date.now()}`,
    name,
    email,
    mobile,
    password, 
    role: UserRole.USER,
    coins: 0,
    spins: settings.dailyFreeSpins,
    totalSpins: 0,
    totalAdsWatched: 0,
    deviceId,
    signupDate: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isBlocked: false,
    referralCode: `REF${Math.floor(Math.random() * 10000)}`
  };

  users.push(newUser);
  setStorage(STORAGE_KEYS.USERS, users);
  setStorage(STORAGE_KEYS.CURRENT_USER, newUser);
  return newUser;
};

export const updateUser = (updatedUser: User): void => {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    setStorage(STORAGE_KEYS.USERS, users);
    
    // Update session if it's the current user
    const currentUser = getStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (currentUser && currentUser.id === updatedUser.id) {
        setStorage(STORAGE_KEYS.CURRENT_USER, updatedUser);
    }
  }
};

export const getCurrentUser = (): User | null => {
  return getStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
};

export const logoutUser = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } catch(e) {}
};

// --- Transaction Service ---

export const getTransactions = (userId: string): Transaction[] => {
  const allTx = getStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  if (userId === 'ALL') return allTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return allTx.filter(t => t.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addTransaction = (userId: string, type: TransactionType, amount: number, description: string): void => {
  const allTx = getStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  const newTx: Transaction = {
    id: `TX_${Date.now()}_${Math.random()}`,
    userId,
    type,
    amount,
    description,
    date: new Date().toISOString()
  };
  allTx.push(newTx);
  setStorage(STORAGE_KEYS.TRANSACTIONS, allTx);

  // Update User Balance
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    if (type === TransactionType.WITHDRAWAL) {
        user.coins -= amount;
    } else {
        user.coins += amount;
    }
    updateUser(user);
  }
};

// --- Withdrawal Service ---

export const getWithdrawals = (userId: string = 'ALL'): WithdrawRequest[] => {
  const allReqs = getStorage<WithdrawRequest[]>(STORAGE_KEYS.WITHDRAWALS, []);
  if (userId === 'ALL') return allReqs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return allReqs.filter(r => r.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const requestWithdrawal = (userId: string, userName: string, method: 'Easypaisa' | 'JazzCash' | 'GiftCard', amount: number, accountDetails: string): void => {
    const settings = getSettings();
    
    if (!settings.withdrawalsEnabled) {
        throw new Error("Withdrawals are currently disabled by the administrator.");
    }

    if (amount < settings.minWithdraw) {
        throw new Error(`Minimum withdrawal is ${settings.minWithdraw}`);
    }
    
    const user = getAllUsers().find(u => u.id === userId);
    if (!user || user.coins < amount) {
        throw new Error("Insufficient coins.");
    }

    const requests = getWithdrawals('ALL');
    const newReq: WithdrawRequest = {
        id: `REQ_${Date.now()}`,
        userId,
        userName,
        method,
        amount,
        accountDetails,
        status: WithdrawStatus.PENDING,
        date: new Date().toISOString()
    };
    requests.push(newReq);
    setStorage(STORAGE_KEYS.WITHDRAWALS, requests);

    // Deduct coins immediately
    addTransaction(userId, TransactionType.WITHDRAWAL, amount, `Withdrawal Request via ${method}`);
};

export const updateWithdrawStatus = (requestId: string, status: WithdrawStatus): void => {
    const requests = getWithdrawals('ALL');
    const req = requests.find(r => r.id === requestId);
    if (req) {
        // If rejected, refund coins
        if (status === WithdrawStatus.REJECTED && req.status === WithdrawStatus.PENDING) {
             addTransaction(req.userId, TransactionType.SPIN_REWARD, req.amount, `Refund: Withdrawal Rejected`);
        }
        req.status = status;
        setStorage(STORAGE_KEYS.WITHDRAWALS, requests);
    }
};

// --- Admin Stats Aggregation ---
export const getSystemStats = () => {
    const users = getAllUsers().filter(u => u.role !== UserRole.ADMIN);
    const withdrawals = getWithdrawals('ALL');
    
    return {
        totalUsers: users.length,
        activeUsers: users.filter(u => !u.isBlocked).length,
        totalCoinsGiven: users.reduce((acc, u) => acc + u.coins, 0),
        totalSpins: users.reduce((acc, u) => acc + (u.totalSpins || 0), 0),
        totalAdsWatched: users.reduce((acc, u) => acc + (u.totalAdsWatched || 0), 0),
        pendingWithdrawals: withdrawals.filter(w => w.status === WithdrawStatus.PENDING).length
    };
};