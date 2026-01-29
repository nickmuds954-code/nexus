
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TrendingUp, 
  Pickaxe, 
  Wallet, 
  UserCog, 
  History, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldAlert,
  X,
  Lock,
  Zap,
  DollarSign,
  Briefcase,
  Users,
  Info,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Building2,
  Repeat,
  Filter,
  Calendar,
  RotateCcw,
  ArrowRightLeft,
  Activity,
  CloudOff,
  Newspaper,
  Shield,
  FileText,
  LockKeyhole,
  Mail,
  Fingerprint,
  User,
  BellRing,
  MessageSquare,
  ShieldQuestion,
  Target,
  ZapOff,
  ExternalLink,
  Gift,
  Cpu,
  ScanLine
} from 'lucide-react';
import PriceChart from './components/PriceChart';
import { Transaction, UserState, DevVault, PricePoint, AccountType } from './types';
import { getMarketAnalysis } from './services/geminiService';

const DEV_PASS = "2473651738";
const MIN_DEPOSIT = 10;
const MAX_DEPOSIT = 1000;

const SPONSOR_ADS = [
  { id: 1, title: "Vault-X Cold Storage", desc: "Military-grade protection for your digital assets.", link: "#", cta: "SECURE NOW" },
  { id: 2, title: "Titan Mining Rigs", desc: "Unlock 40% more hashrate with Titan v4.2 hardware.", link: "#", cta: "UPGRADE" },
  { id: 3, title: "Cyber-Trade VPN", desc: "Zero-latency trading relays. Anonymous node routing.", link: "#", cta: "GET PROTECTED" }
];

const PAYMENT_PROVIDERS = {
  mm: [
    { id: 'mtn', name: 'MTN Mobile Money', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/MTN_Logo.svg' },
    { id: 'airtel', name: 'Airtel Money', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Airtel_logo.svg' },
    { id: 'mpesa', name: 'M-Pesa', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/03/M-Pesa_Logo.svg' }
  ],
  bank: [
    { id: 'stanbic', name: 'Stanbic Bank' },
    { id: 'equity', name: 'Equity Bank' },
    { id: 'absba', name: 'Absa Bank' },
    { id: 'standard', name: 'Standard Chartered' }
  ]
};

// Fix: Completed the component implementation and added export default.
// This resolves the error where App was not returning JSX and had no default export.
const App: React.FC = () => {
  // --- State Initialization ---
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('nexus_user_v5');
    return saved ? JSON.parse(saved) : {
      realUsdBalance: 0,
      demoUsdBalance: 10000,
      gcoinBalance: 0,
      isSubscribed: false,
      miningActive: false,
      totalMined: 0,
      transactions: [],
      accountType: 'DEMO' as AccountType,
      profile: {
        fullName: 'Nexus User',
        email: 'node@nexus.terminal',
        idVerified: false,
        country: 'Uganda',
        verificationStatus: 'NONE'
      },
      tradeCount: 0,
      dailyLossCount: 0,
      lastLossDate: new Date().toDateString()
    };
  });

  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [vault, setVault] = useState<DevVault & { adRevenue: number }>(() => {
    const saved = localStorage.getItem('nexus_vault_v5');
    return saved ? JSON.parse(saved) : { 
      totalRevenue: 0,
      subscriptionRevenue: 0,
      tradingLossRevenue: 0,
      withdrawalFeeRevenue: 0,
      adRevenue: 0
    };
  });

  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(42.50);
  const [lastValidPrice, setLastValidPrice] = useState(42.50);
  const [isPriceFeedError, setIsPriceFeedError] = useState(false);
  const [priceTrend, setPriceTrend] = useState<'UP' | 'DOWN'>('UP');
  const [activeTab, setActiveTab] = useState<'market' | 'mining' | 'wallet' | 'profile'>('market');
  
  // High-Fidelity Flow States
  const [showPaymentModal, setShowPaymentModal] = useState<{type: 'DEPOSIT' | 'SUBSCRIPTION' | 'WITHDRAW' | 'SELL_GCN', amount: number} | null>(null);
  const [paymentStep, setPaymentStep] = useState<'AMOUNT' | 'TYPE' | 'PROVIDER' | 'FORM' | 'GATEWAY' | 'PROCESSING' | 'SUCCESS'>('AMOUNT');
  const [selectedGateway, setSelectedGateway] = useState<'mm' | 'card' | 'bank' | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [inputAmount, setInputAmount] = useState<string>("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [depositError, setDepositError] = useState<string | null>(null);
  
  const [showVirtualPhone, setShowVirtualPhone] = useState(false);
  const [phoneState, setPhoneState] = useState<'LOCK' | 'USSD' | 'SMS' | 'OTP'>('LOCK');
  const [ussdInput, setUssdInput] = useState("");
  const [isKycModal, setIsKycModal] = useState(false);
  const [isKycScanning, setIsKycScanning] = useState(false);

  const [marketAnalysis, setMarketAnalysis] = useState<string>('Analyzing deep data nodes...');
  const [isExecuting, setIsExecuting] = useState(false);
  const [pendingTrade, setPendingTrade] = useState<{direction: 'UP' | 'DOWN', amount: number} | null>(null);
  const [adIndex, setAdIndex] = useState(0);

  // Persistence
  useEffect(() => { localStorage.setItem('nexus_user_v5', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('nexus_vault_v5', JSON.stringify(vault)); }, [vault]);

  // Market Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const drift = (Math.random() - 0.48) * (user.accountType === 'REAL' ? 1.2 : 0.6);
        const next = Math.max(1, prev + drift);
        setPriceTrend(next >= prev ? 'UP' : 'DOWN');
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [user.accountType]);

  // Price History Tracking
  useEffect(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newPoint: PricePoint = {
      time: timeStr,
      price: currentPrice,
      open: currentPrice * 0.99,
      high: currentPrice * 1.01,
      low: currentPrice * 0.98,
      close: currentPrice
    };
    setPriceHistory(prev => [...prev.slice(-19), newPoint]);
  }, [currentPrice]);

  // Gemini Market Analysis Fetching
  useEffect(() => {
    const fetchAnalysis = async () => {
      const analysis = await getMarketAnalysis(currentPrice);
      setMarketAnalysis(analysis);
    };
    fetchAnalysis();
    const interval = setInterval(fetchAnalysis, 30000);
    return () => clearInterval(interval);
  }, [currentPrice]);

  // Mining Logic: Increment mined coins if active and subscribed
  // Fix: Completed the truncated useEffect from the original file content.
  useEffect(() => {
    let interval: any;
    if (user.isSubscribed && user.miningActive) {
      interval = setInterval(() => {
        setUser(prev => ({
          ...prev,
          totalMined: prev.totalMined + 0.000045,
          gcoinBalance: prev.gcoinBalance + 0.000045
        }));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [user.isSubscribed, user.miningActive]);

  const handleToggleMining = () => {
    if (!user.isSubscribed) {
      setShowPaymentModal({ type: 'SUBSCRIPTION', amount: 50 });
      setPaymentStep('AMOUNT');
      return;
    }
    setUser(prev => ({ ...prev, miningActive: !prev.miningActive }));
  };

  const currentBalance = user.accountType === 'REAL' ? user.realUsdBalance : user.demoUsdBalance;

  // Fix: Added return statement with JSX to satisfy FC type requirement and prevent the void return error.
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 p-1.5 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Zap className="w-5 h-5 text-black fill-black" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              NEXUS TERMINAL
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Global Index</span>
              <div className={`flex items-center gap-1 font-mono text-sm ${priceTrend === 'UP' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {priceTrend === 'UP' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                ${currentPrice.toFixed(2)}
              </div>
            </div>
            
            <div className="h-8 w-px bg-zinc-800" />
            
            <div className="flex bg-zinc-900 rounded-full p-1 border border-zinc-800">
              <button 
                onClick={() => setUser(p => ({ ...p, accountType: 'DEMO' }))}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${user.accountType === 'DEMO' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                DEMO
              </button>
              <button 
                onClick={() => setUser(p => ({ ...p, accountType: 'REAL' }))}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${user.accountType === 'REAL' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                REAL
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar - Stats */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6 text-zinc-400">
              <Wallet className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Asset Portfolio</span>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-zinc-500 text-xs mb-1">USD Balance</p>
                <h2 className="text-3xl font-mono font-bold tracking-tighter">
                  ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
              </div>
              
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-amber-500/80 text-xs">G Coin (GCN)</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-mono font-bold text-amber-500">
                  {user.gcoinBalance.toFixed(6)}
                </h3>
                <p className="text-[10px] text-zinc-500 mt-1">
                  ≈ ${(user.gcoinBalance * currentPrice).toFixed(2)} USD
                </p>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('wallet')}
              className="w-full mt-6 bg-white text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" />
              DEPOSIT FUNDS
            </button>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'market', icon: TrendingUp, label: 'Market Terminal' },
              { id: 'mining', icon: Pickaxe, label: 'Cloud Mining' },
              { id: 'wallet', icon: Wallet, label: 'Global Wallet' },
              { id: 'profile', icon: UserCog, label: 'Account Security' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-zinc-800 text-white shadow-lg' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
                }`}
              >
                <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-amber-500' : ''}`} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-6 space-y-6">
          {activeTab === 'market' && (
            <>
              <PriceChart data={priceHistory} />
              
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 overflow-hidden relative group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-500/10 p-2 rounded-lg">
                    <Cpu className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-300">Nexus AI Insight</h4>
                    <p className="text-[10px] text-zinc-500 font-mono">LLM-POWERED MARKET SENTIMENT</p>
                  </div>
                </div>
                <div className="relative z-10">
                  <p className="text-zinc-300 leading-relaxed text-sm italic font-medium">
                    "{marketAnalysis}"
                  </p>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Activity className="w-32 h-32 text-amber-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  disabled={isExecuting}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white p-6 rounded-2xl transition-all shadow-lg shadow-emerald-500/10 group"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-white/20 p-2 rounded-full group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <span className="font-bold">CALL UP</span>
                  </div>
                </button>
                <button 
                  disabled={isExecuting}
                  className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white p-6 rounded-2xl transition-all shadow-lg shadow-rose-500/10 group"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-white/20 p-2 rounded-full group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6 rotate-180" />
                    </div>
                    <span className="font-bold">PUT DOWN</span>
                  </div>
                </button>
              </div>
            </>
          )}

          {activeTab === 'mining' && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center space-y-6">
              <div className="inline-block p-4 bg-amber-500/10 rounded-full mb-2">
                <Pickaxe className={`w-12 h-12 text-amber-500 ${user.miningActive ? 'animate-bounce' : ''}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Cloud Mining Node</h2>
                <p className="text-zinc-400 text-sm mt-2 max-w-md mx-auto">
                  Utilize Nexus decentralized infrastructure to mine GCN tokens directly from your browser.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <p className="text-zinc-500 text-xs mb-1">Hashrate</p>
                  <p className="font-mono font-bold text-emerald-400">{user.miningActive ? '12.4 GH/s' : '0.0 GH/s'}</p>
                </div>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <p className="text-zinc-500 text-xs mb-1">Node Status</p>
                  <p className={`font-mono font-bold ${user.miningActive ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {user.miningActive ? 'ONLINE' : 'OFFLINE'}
                  </p>
                </div>
              </div>

              <button 
                onClick={handleToggleMining}
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                  user.miningActive 
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20' 
                    : 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 hover:bg-amber-400'
                }`}
              >
                {user.miningActive ? 'STOP MINING NODE' : 'START MINING NODE'}
              </button>
              
              {!user.isSubscribed && (
                <p className="text-[10px] text-zinc-500 flex items-center justify-center gap-1 uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3" /> Requires Nexus Pro Subscription
                </p>
              )}
            </div>
          )}

          {activeTab === 'wallet' && (
             <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
                <h2 className="text-xl font-bold">Transaction History</h2>
                {user.transactions.length === 0 ? (
                  <div className="text-center py-12 opacity-50">
                    <History className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                    <p className="text-sm">No recorded blockchain movements found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {user.transactions.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {tx.amount > 0 ? <ArrowDownRight className="w-4 h-4 rotate-45" /> : <ArrowUpRight className="w-4 h-4 rotate-45" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-300">{tx.type.replace('_', ' ')}</p>
                            <p className="text-[10px] text-zinc-500">{new Date(tx.timestamp).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-mono font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} {tx.currency}
                          </p>
                          <p className={`text-[10px] uppercase font-bold ${tx.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {tx.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          )}
        </div>

        {/* Right Sidebar - Ads & Info */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-black shadow-xl shadow-amber-500/10 relative overflow-hidden">
             <div className="relative z-10">
               <h4 className="font-black text-xl mb-1 italic">NEXUS PRO</h4>
               <p className="text-[10px] font-bold opacity-80 mb-4 tracking-widest uppercase">Elite Trading Node</p>
               <ul className="text-xs space-y-2 font-bold mb-6">
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Zero Trade Latency</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Cloud Mining Access</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> AI Market Predictions</li>
               </ul>
               <button className="w-full bg-black text-white py-2.5 rounded-lg text-xs font-black hover:bg-zinc-900 transition-colors uppercase tracking-widest">
                 {user.isSubscribed ? 'ACTIVE MEMBER' : 'UPGRADE - $50/MO'}
               </button>
             </div>
             <Zap className="absolute -bottom-6 -right-6 w-32 h-32 text-black/10 rotate-12" />
          </div>

          <div className="space-y-4">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] px-2">Sponsored Relays</p>
            {SPONSOR_ADS.map(ad => (
              <div key={ad.id} className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl group cursor-pointer hover:border-amber-500/50 transition-colors">
                <h5 className="text-sm font-bold text-zinc-300 group-hover:text-amber-500 transition-colors">{ad.title}</h5>
                <p className="text-[11px] text-zinc-500 mt-1 mb-3 leading-relaxed">{ad.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-zinc-400 group-hover:text-zinc-200">{ad.cta}</span>
                  <ExternalLink className="w-3 h-3 text-zinc-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

// Fix: Export default App to resolve the module import error in index.tsx.
export default App;
