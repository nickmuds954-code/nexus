
export type AccountType = 'DEMO' | 'REAL';
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'PROCESSING';

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL' | 'MINE' | 'WITHDRAW' | 'SUBSCRIPTION' | 'P2P_BUY' | 'P2P_SELL' | 'TRADING_LOSS' | 'TRADING_WIN' | 'DEPOSIT' | 'WITHDRAWAL_FEE';
  amount: number;
  currency: 'GCN' | 'USD';
  timestamp: number;
  status: TransactionStatus;
  account: AccountType;
  provider?: string;
  fee?: number;
}

export interface UserProfile {
  fullName: string;
  email: string;
  idVerified: boolean;
  documentNumber?: string;
  country: string;
  verificationStatus: 'NONE' | 'PENDING' | 'VERIFIED';
}

export interface UserState {
  realUsdBalance: number;
  demoUsdBalance: number;
  gcoinBalance: number;
  isSubscribed: boolean;
  miningActive: boolean;
  totalMined: number;
  transactions: Transaction[];
  accountType: AccountType;
  profile: UserProfile;
  tradeCount: number;
  dailyLossCount: number;
  lastLossDate: string;
}

export interface DevVault {
  totalRevenue: number;
  subscriptionRevenue: number;
  tradingLossRevenue: number;
  withdrawalFeeRevenue: number;
  adRevenue: number;
  lastWithdrawal?: number;
}

export interface PricePoint {
  time: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
}
