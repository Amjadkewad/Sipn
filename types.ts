export enum UserRole {
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

export enum WithdrawStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  password?: string;
  role: UserRole;
  coins: number;
  spins: number; // Available spins
  totalSpins: number; // Total spins performed (Lifetime)
  totalAdsWatched: number; // Total ads watched (Lifetime)
  deviceId: string;
  signupDate: string;
  lastLogin: string;
  isBlocked: boolean;
  referralCode: string;
  lastDailyBonus?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
}

export interface WithdrawRequest {
  id: string;
  userId: string;
  userName: string;
  method: 'Easypaisa' | 'JazzCash' | 'GiftCard';
  amount: number;
  accountDetails: string;
  status: WithdrawStatus;
  date: string;
}

export interface ThemeDef {
  id: string;
  name: string;
  colors: {
    primary: string;      // Main Brand Color
    primaryLight: string; // Lighter shade (50/100)
    primaryDark: string;  // Darker shade (800)
    secondary: string;    // Accent
    bg: string;           // Background
  }
}

export interface AppSettings {
  dailyFreeSpins: number;
  coinsPerSpinMin: number;
  coinsPerSpinMax: number;
  coinsPerAd: number;
  minWithdraw: number;
  referBonus: number;
  bannerAdsEnabled: boolean;
  interstitialAdsEnabled: boolean;
  rewardedAdsEnabled: boolean;
  navigationAdsEnabled: boolean; // Controls ads on clicks/back
  navigationAdReward: number; // New: Coins given for watching a navigation ad
  bannerAdCode: string;
  interstitialAdCode: string;
  rewardedAdCode: string;
  activeThemeId: string; // For Theme Selection
  firebaseConfigCode: string; // For Backend Code
  withdrawalsEnabled: boolean; // Control if users can withdraw
  withdrawalInfoMessage: string; // Message to show users
}