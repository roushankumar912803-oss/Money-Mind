import React, { useState, useEffect } from 'react';
import DailyEntry from './components/DailyEntry';
import MonthlyAnalysis from './components/MonthlyAnalysis';
import AIBudgetPlan from './components/AIBudgetPlan';
import EducationSection from './components/EducationSection';
import ProfileGoals from './components/ProfileGoals';
import { AppView, Transaction, MonthlyData, Goal, Budget, EXPENSE_CATEGORIES, CurrencyCode, CURRENCIES } from './types';
import { LayoutDashboard, PieChart, Calculator, GraduationCap, UserCircle } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('daily');
  
  // -- State Initialization with LocalStorage persistence --
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('wm_currency');
    return (saved as CurrencyCode) || 'USD';
  });

  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(() => {
    return localStorage.getItem('wm_notification') === 'true';
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('wm_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [monthlyData, setMonthlyData] = useState<MonthlyData>(() => {
    const saved = localStorage.getItem('wm_monthly');
    return saved ? JSON.parse(saved) : {
      salary: 0,
      sideIncome: 0,
      investments: 0,
      fixedExpenses: 0,
      assets: [],
      liabilities: []
    };
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('wm_goals');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 2000, term: 'short', color: '#10B981' }
    ];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('wm_budgets');
    return saved ? JSON.parse(saved) : EXPENSE_CATEGORIES.map(cat => ({ category: cat, limit: 0 }));
  });

  const [userPhoto, setUserPhoto] = useState<string | null>(() => {
    return localStorage.getItem('wm_user_photo');
  });

  // -- Persistence Effects --
  useEffect(() => localStorage.setItem('wm_currency', currency), [currency]);
  useEffect(() => localStorage.setItem('wm_notification', String(notificationEnabled)), [notificationEnabled]);
  useEffect(() => localStorage.setItem('wm_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('wm_monthly', JSON.stringify(monthlyData)), [monthlyData]);
  useEffect(() => localStorage.setItem('wm_goals', JSON.stringify(goals)), [goals]);
  useEffect(() => localStorage.setItem('wm_budgets', JSON.stringify(budgets)), [budgets]);
  useEffect(() => {
    if (userPhoto) {
      try {
        localStorage.setItem('wm_user_photo', userPhoto);
      } catch (e) {
        console.error("Image too large for local storage");
      }
    } else {
      localStorage.removeItem('wm_user_photo');
    }
  }, [userPhoto]);

  // -- Notification Logic --
  useEffect(() => {
    if (!notificationEnabled) return;

    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    const scheduleNotification = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(22, 0, 0, 0); // 10:00 PM

      if (now > target) {
        target.setDate(target.getDate() + 1); // Schedule for tomorrow if passed
      }

      const delay = target.getTime() - now.getTime();

      const timer = setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification("WealthMind AI Reminder", {
            body: "🕗 It's 10 PM! Time to update your daily expenses and keep your books balanced.",
            icon: "/favicon.ico"
          });
        }
        scheduleNotification(); // Schedule next day
      }, delay);

      return timer;
    };

    const timerId = scheduleNotification();
    return () => clearTimeout(timerId);
  }, [notificationEnabled]);

  // -- Helper for Sidebar --
  const totalBalance = monthlyData.assets.reduce((a,b)=>a+b.amount,0) - monthlyData.liabilities.reduce((a,b)=>a+b.amount,0);
  const currencyInfo = CURRENCIES[currency];

  // -- Navigation Config --
  const navItems = [
    { id: 'daily', label: 'Daily', icon: LayoutDashboard },
    { id: 'monthly', label: 'Analysis', icon: PieChart },
    { id: 'ai-plan', label: 'AI Plan', icon: Calculator },
    { id: 'lessons', label: 'Learn', icon: GraduationCap },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-indigo-700">WealthMind</h1>
        <div className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">AI Powered</div>
      </div>

      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
            WealthMind <span className="text-xs bg-indigo-100 px-2 py-0.5 rounded-full text-indigo-600 font-normal">AI</span>
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as AppView)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                view === item.id 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-gray-100">
           <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
             <p className="text-xs opacity-80 mb-1">Total Balance</p>
             <p className="text-xl font-bold">
               {currencyInfo.symbol}{totalBalance.toLocaleString(currencyInfo.locale)}
             </p>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full pb-24 md:pb-8">
        
        <header className="mb-8 hidden md:block">
           <h2 className="text-2xl font-bold text-gray-800">
             {navItems.find(i => i.id === view)?.label}
           </h2>
           <p className="text-gray-500 text-sm">Manage your financial future with AI insights.</p>
        </header>

        <div className="animate-fade-in-up">
          {view === 'daily' && <DailyEntry transactions={transactions} setTransactions={setTransactions} currency={currency} />}
          {view === 'monthly' && <MonthlyAnalysis data={monthlyData} setData={setMonthlyData} transactions={transactions} goals={goals} budgets={budgets} setBudgets={setBudgets} currency={currency} />}
          {view === 'ai-plan' && <AIBudgetPlan initialSalary={monthlyData.salary} currency={currency} />}
          {view === 'lessons' && <EducationSection />}
          {view === 'profile' && (
            <ProfileGoals 
              goals={goals} 
              setGoals={setGoals} 
              monthlyData={monthlyData} 
              transactions={transactions} 
              currency={currency} 
              setCurrency={setCurrency}
              userPhoto={userPhoto}
              setUserPhoto={setUserPhoto}
              notificationEnabled={notificationEnabled}
              setNotificationEnabled={setNotificationEnabled}
            />
          )}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center z-50 safe-area-bottom">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as AppView)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              view === item.id ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <item.icon className={`w-6 h-6 ${view === item.id ? 'fill-current opacity-20' : ''}`} strokeWidth={view === item.id ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
};

export default App;