import React, { useState } from 'react';
import { MonthlyData, AssetLiabilityItem, Transaction, Goal, Budget, EXPENSE_CATEGORIES, CurrencyCode, CURRENCIES } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { getFinancialAdvice } from '../services/geminiService';
import { Sparkles, Brain, Loader2, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface MonthlyAnalysisProps {
  data: MonthlyData;
  setData: React.Dispatch<React.SetStateAction<MonthlyData>>;
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  currency: CurrencyCode;
}

const MonthlyAnalysis: React.FC<MonthlyAnalysisProps> = ({ data, setData, transactions, goals, budgets, setBudgets, currency }) => {
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'income' | 'assets' | 'budgets'>('income');

  const curr = CURRENCIES[currency];

  // Input Handlers
  const handleInputChange = (field: keyof MonthlyData, value: number) => {
    setData({ ...data, [field]: value });
  };

  const addItem = (type: 'assets' | 'liabilities') => {
    const newItem: AssetLiabilityItem = { id: Date.now().toString(), name: 'New Item', amount: 0 };
    setData({ ...data, [type]: [...data[type], newItem] });
  };

  const updateItem = (type: 'assets' | 'liabilities', id: string, field: keyof AssetLiabilityItem, value: string | number) => {
    const updated = data[type].map(item => item.id === id ? { ...item, [field]: value } : item);
    setData({ ...data, [type]: updated });
  };

  const deleteItem = (type: 'assets' | 'liabilities', id: string) => {
    setData({ ...data, [type]: data[type].filter(item => item.id !== id) });
  };

  const handleBudgetChange = (category: string, limit: number) => {
    const existing = budgets.find(b => b.category === category);
    if (existing) {
      setBudgets(budgets.map(b => b.category === category ? { ...b, limit } : b));
    } else {
      setBudgets([...budgets, { category, limit }]);
    }
  };

  // Derived Data for Charts
  const totalAssets = data.assets.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = data.liabilities.reduce((sum, item) => sum + item.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  const currentMonthExpenses = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const projectedSavings = (data.salary + data.sideIncome) - data.fixedExpenses - currentMonthExpenses;

  const chartData = [
    { name: 'Income', value: data.salary + data.sideIncome },
    { name: 'Fixed Exp', value: data.fixedExpenses },
    { name: 'Var Exp', value: currentMonthExpenses },
    { name: 'Projected Save', value: Math.max(0, projectedSavings) },
  ];

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

  const assetLiabilityData = [
    { name: 'Assets', amount: totalAssets },
    { name: 'Liabilities', amount: totalLiabilities }
  ];

  // Budget Calculations
  const getCategorySpent = (category: string) => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    return transactions
      .filter(t => t.category === category && t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleGetAdvice = async () => {
    setLoadingAdvice(true);
    setAdvice("");
    const result = await getFinancialAdvice(transactions, data, goals);
    setAdvice(result);
    setLoadingAdvice(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-center space-x-2 md:space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 rounded-full font-medium text-sm md:text-base transition-colors ${activeTab === 'income' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('budgets')}
          className={`px-4 py-2 rounded-full font-medium text-sm md:text-base transition-colors ${activeTab === 'budgets' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
        >
          Budgets
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2 rounded-full font-medium text-sm md:text-base transition-colors ${activeTab === 'assets' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
        >
          Net Worth
        </button>
      </div>

      {activeTab === 'income' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4">Monthly Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly Salary</label>
                <div className="flex items-center mt-1 relative">
                  <span className="absolute left-3 text-gray-500">{curr.symbol}</span>
                  <input type="number" value={data.salary} onChange={(e) => handleInputChange('salary', Number(e.target.value))} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 pl-7" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expected Side Income</label>
                <div className="flex items-center mt-1 relative">
                  <span className="absolute left-3 text-gray-500">{curr.symbol}</span>
                  <input type="number" value={data.sideIncome} onChange={(e) => handleInputChange('sideIncome', Number(e.target.value))} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 pl-7" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fixed Expenses (Rent, Bills)</label>
                <div className="flex items-center mt-1 relative">
                  <span className="absolute left-3 text-gray-500">{curr.symbol}</span>
                  <input type="number" value={data.fixedExpenses} onChange={(e) => handleInputChange('fixedExpenses', Number(e.target.value))} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 pl-7" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fixed Investment</label>
                <div className="flex items-center mt-1 relative">
                  <span className="absolute left-3 text-gray-500">{curr.symbol}</span>
                  <input type="number" value={data.investments} onChange={(e) => handleInputChange('investments', Number(e.target.value))} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 pl-7" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
             <h3 className="text-lg font-bold mb-2">Projected Savings</h3>
             <div className="text-4xl font-bold text-emerald-600 mb-2">
               {curr.symbol}{projectedSavings.toLocaleString(curr.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </div>
             <p className="text-sm text-gray-500 text-center">Based on income minus fixed & variable expenses</p>
             <div className="h-48 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${curr.symbol}${value.toLocaleString(curr.locale)}`} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'budgets' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Budget Tracking */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:order-2">
            <h3 className="text-lg font-bold mb-6 text-gray-800">Budget Tracker (This Month)</h3>
            <div className="space-y-6">
              {EXPENSE_CATEGORIES.map(category => {
                const limit = budgets.find(b => b.category === category)?.limit || 0;
                if (limit === 0) return null; // Only show active budgets

                const spent = getCategorySpent(category);
                const percent = Math.min(100, (spent / limit) * 100);
                const isExceeded = spent > limit;
                const isApproaching = !isExceeded && percent >= 80;

                return (
                  <div key={category}>
                    <div className="flex justify-between items-end mb-1">
                      <span className="font-medium text-gray-700">{category}</span>
                      <div className="flex items-center space-x-2">
                        {isExceeded && <span className="text-xs font-bold text-red-600 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> Exceeded</span>}
                        {isApproaching && <span className="text-xs font-bold text-amber-600 flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> Near Limit</span>}
                        <span className={`text-sm ${isExceeded ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                          {curr.symbol}{spent.toLocaleString(curr.locale, { maximumFractionDigits: 0 })} / {curr.symbol}{limit.toLocaleString(curr.locale)}
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isExceeded ? 'bg-red-500' : isApproaching ? 'bg-amber-400' : 'bg-emerald-500'}`} 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {budgets.every(b => b.limit === 0) && (
                <div className="text-center py-10 text-gray-400">
                  <p>No budgets set.</p>
                  <p className="text-sm">Set limits in the Settings panel to start tracking.</p>
                </div>
              )}
            </div>
          </div>

          {/* Budget Settings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:order-1">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Set Monthly Limits</h3>
            <p className="text-sm text-gray-500 mb-6">Define your spending cap for each category.</p>
            <div className="space-y-3">
              {EXPENSE_CATEGORIES.map(category => {
                 const currentLimit = budgets.find(b => b.category === category)?.limit || 0;
                 return (
                   <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">{category}</span>
                      <div className="flex items-center relative">
                         <span className="absolute left-3 text-gray-400 text-sm">{curr.symbol}</span>
                         <input 
                           type="number" 
                           placeholder="0"
                           value={currentLimit || ''}
                           onChange={(e) => handleBudgetChange(category, Number(e.target.value))}
                           className="w-28 pl-6 pr-3 py-1.5 rounded border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm font-semibold text-gray-700"
                         />
                      </div>
                   </div>
                 );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-emerald-700">Assets</h3>
              <button onClick={() => addItem('assets')} className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded hover:bg-emerald-200">+ Add</button>
            </div>
            <div className="space-y-2">
              {data.assets.map(item => (
                <div key={item.id} className="flex space-x-2">
                  <input type="text" value={item.name} onChange={(e) => updateItem('assets', item.id, 'name', e.target.value)} className="flex-1 border p-1 rounded text-sm" />
                  <input type="number" value={item.amount} onChange={(e) => updateItem('assets', item.id, 'amount', Number(e.target.value))} className="w-24 border p-1 rounded text-sm" />
                  <button onClick={() => deleteItem('assets', item.id)} className="text-red-500">×</button>
                </div>
              ))}
              <div className="pt-2 border-t font-bold flex justify-between">
                <span>Total Assets</span>
                <span>{curr.symbol}{totalAssets.toLocaleString(curr.locale)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-rose-700">Liabilities</h3>
              <button onClick={() => addItem('liabilities')} className="text-sm bg-rose-100 text-rose-700 px-3 py-1 rounded hover:bg-rose-200">+ Add</button>
            </div>
            <div className="space-y-2">
              {data.liabilities.map(item => (
                <div key={item.id} className="flex space-x-2">
                  <input type="text" value={item.name} onChange={(e) => updateItem('liabilities', item.id, 'name', e.target.value)} className="flex-1 border p-1 rounded text-sm" />
                  <input type="number" value={item.amount} onChange={(e) => updateItem('liabilities', item.id, 'amount', Number(e.target.value))} className="w-24 border p-1 rounded text-sm" />
                  <button onClick={() => deleteItem('liabilities', item.id)} className="text-red-500">×</button>
                </div>
              ))}
               <div className="pt-2 border-t font-bold flex justify-between">
                <span>Total Liabilities</span>
                <span>{curr.symbol}{totalLiabilities.toLocaleString(curr.locale)}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 text-center">Net Worth Analysis</h3>
            <div className="flex justify-center items-center mb-6">
               <div className={`text-3xl font-bold ${netWorth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                 {curr.symbol}{netWorth.toLocaleString(curr.locale)}
               </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assetLiabilityData} layout="vertical">
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" width={100} />
                   <Tooltip formatter={(val: number) => `${curr.symbol}${val.toLocaleString(curr.locale)}`} />
                   <Bar dataKey="amount" fill="#8884d8">
                      {assetLiabilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Assets' ? '#10B981' : '#EF4444'} />
                      ))}
                   </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* AI Advice Section */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center">
            <Sparkles className="mr-2" /> AI Financial Advisor
          </h3>
          <button
            onClick={handleGetAdvice}
            disabled={loadingAdvice}
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors disabled:opacity-70 flex items-center"
          >
            {loadingAdvice ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Brain className="mr-2 w-4 h-4" />}
            {loadingAdvice ? 'Analyzing...' : 'Analyze My Finances'}
          </button>
        </div>
        
        {advice && (
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20 animate-fade-in">
             <div className="prose prose-invert max-w-none text-sm whitespace-pre-wrap">
               {advice}
             </div>
          </div>
        )}
        {!advice && !loadingAdvice && (
          <p className="text-indigo-100 italic opacity-80">Click Analyze to get personalized tips based on your income, assets, and spending habits.</p>
        )}
      </div>
    </div>
  );
};

export default MonthlyAnalysis;
