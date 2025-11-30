import React, { useRef } from 'react';
import { Goal, MonthlyData, Transaction, CurrencyCode, CURRENCIES } from '../types';
import { Target, TrendingUp, Shield, Clock, Settings, Globe, Trash2, Camera, User, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ProfileGoalsProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  monthlyData: MonthlyData;
  transactions: Transaction[];
  currency: CurrencyCode;
  setCurrency: React.Dispatch<React.SetStateAction<CurrencyCode>>;
  userPhoto: string | null;
  setUserPhoto: React.Dispatch<React.SetStateAction<string | null>>;
  notificationEnabled: boolean;
  setNotificationEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const GOAL_COLORS = ['#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444'];

const ProfileGoals: React.FC<ProfileGoalsProps> = ({ 
  goals, setGoals, monthlyData, transactions, currency, setCurrency, userPhoto, setUserPhoto, notificationEnabled, setNotificationEnabled
}) => {
  
  const curr = CURRENCIES[currency];
  const totalAssets = monthlyData.assets.reduce((a, b) => a + b.amount, 0);
  const totalLiabilities = monthlyData.liabilities.reduce((a, b) => a + b.amount, 0);
  const netWorth = totalAssets - totalLiabilities;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      name: 'New Goal',
      targetAmount: 1000,
      currentAmount: 0,
      term: 'mid',
      color: GOAL_COLORS[goals.length % GOAL_COLORS.length]
    };
    setGoals([...goals, newGoal]);
  };

  const updateGoal = (id: string, field: keyof Goal, value: any) => {
    setGoals(goals.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const deleteGoal = (id: string) => setGoals(goals.filter(g => g.id !== id));

  const getPercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(100, Math.max(0, (current / target) * 100));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8">
      {/* Identity & Net Worth Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* User Identity Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center md:col-span-1">
          <div className="relative mb-4 group">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center">
              {userPhoto ? (
                <img src={userPhoto} alt="User Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-300" />
              )}
            </div>
            
            <button 
              onClick={triggerFileInput}
              className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-md hover:bg-indigo-700 transition-colors"
              title="Upload Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </div>
          <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
          {userPhoto && (
            <button 
              onClick={() => setUserPhoto(null)}
              className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center"
            >
              <Trash2 className="w-3 h-3 mr-1" /> Remove Photo
            </button>
          )}
        </div>

        {/* Portfolio Header */}
        <div className="bg-gray-900 text-white rounded-3xl p-8 shadow-xl md:col-span-2">
           <div className="flex flex-col sm:flex-row justify-between items-center h-full">
              <div className="mb-6 sm:mb-0">
                 <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Net Worth</h2>
                 <div className="text-4xl lg:text-5xl font-bold tracking-tight">
                   {curr.symbol}{netWorth.toLocaleString(curr.locale)}
                 </div>
                 <div className="flex mt-4 space-x-6 text-sm">
                    <div className="flex items-center">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                       Assets: {curr.symbol}{totalAssets.toLocaleString(curr.locale)}
                    </div>
                    <div className="flex items-center">
                       <span className="w-2 h-2 rounded-full bg-rose-500 mr-2"></span>
                       Liabilities: {curr.symbol}{totalLiabilities.toLocaleString(curr.locale)}
                    </div>
                 </div>
              </div>
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={[
                          { name: 'Assets', value: totalAssets }, 
                          { name: 'Liabilities', value: totalLiabilities }
                      ]} 
                      innerRadius={40} 
                      outerRadius={55} 
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#10B981" />
                      <Cell fill="#EF4444" />
                    </Pie>
                    <Tooltip formatter={(value: number) => `${curr.symbol}${value.toLocaleString(curr.locale)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4">
          <Settings className="mr-2 text-gray-500" /> App Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full mr-4">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Currency Preference</h4>
                  <p className="text-sm text-gray-500">Select your local currency.</p>
                </div>
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="block w-full md:w-32 pl-3 pr-8 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {Object.entries(CURRENCIES).map(([code, { label, symbol }]) => (
                  <option key={code} value={code}>
                    {symbol} {code}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full mr-4">
                        <Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800">Daily Reminder</h4>
                        <p className="text-sm text-gray-500">Get notified at 10:00 PM.</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={notificationEnabled}
                        onChange={(e) => {
                            setNotificationEnabled(e.target.checked);
                            if (e.target.checked && Notification.permission !== "granted") {
                                Notification.requestPermission();
                            }
                        }}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>
        </div>
      </div>

      {/* Goals Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <Target className="mr-2 text-indigo-600" /> Financial Goals
           </h3>
           <button 
             onClick={addGoal}
             className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
           >
             + New Goal
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const percentage = getPercentage(goal.currentAmount, goal.targetAmount);
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const chartData = [
              { name: 'Saved', value: goal.currentAmount },
              { name: 'Remaining', value: remaining }
            ];

            return (
            <div key={goal.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
               {/* Decorative top border */}
               <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: goal.color }}></div>

               <div className="flex justify-between items-start mb-4 pt-2">
                  <input 
                    className="font-bold text-lg text-gray-800 border-none focus:ring-0 p-0 w-2/3 bg-transparent truncate" 
                    value={goal.name} 
                    onChange={(e) => updateGoal(goal.id, 'name', e.target.value)}
                    placeholder="Goal Name"
                  />
                  <div className="flex items-center space-x-1">
                     <select 
                       value={goal.term}
                       onChange={(e) => updateGoal(goal.id, 'term', e.target.value)}
                       className="text-[10px] bg-gray-100 rounded px-1.5 py-1 border-none cursor-pointer hover:bg-gray-200"
                     >
                       <option value="short">Short</option>
                       <option value="mid">Mid</option>
                       <option value="long">Long</option>
                     </select>
                     <button onClick={() => deleteGoal(goal.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>

               <div className="flex items-end justify-between">
                 <div className="space-y-4 flex-1 mr-2">
                    <div>
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1 uppercase font-bold tracking-wider">
                           <span>Saved</span>
                           <span>Target</span>
                        </div>
                        <div className="flex items-baseline space-x-1">
                           <span className="text-gray-400 text-sm font-medium">{curr.symbol}</span>
                           <input 
                             type="number" 
                             value={goal.currentAmount} 
                             onChange={(e) => updateGoal(goal.id, 'currentAmount', Number(e.target.value))}
                             className="w-20 border-b border-gray-200 focus:border-indigo-500 focus:outline-none text-xl font-bold text-gray-800 bg-transparent p-0" 
                           />
                           <span className="text-gray-300 text-sm">/</span>
                           <input 
                             type="number" 
                             value={goal.targetAmount} 
                             onChange={(e) => updateGoal(goal.id, 'targetAmount', Number(e.target.value))}
                             className="w-16 border-b border-gray-200 focus:border-indigo-500 focus:outline-none text-sm font-medium text-gray-500 bg-transparent" 
                           />
                        </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                      {goal.term === 'short' && <Clock className="w-3.5 h-3.5" />}
                      {goal.term === 'mid' && <TrendingUp className="w-3.5 h-3.5" />}
                      {goal.term === 'long' && <Shield className="w-3.5 h-3.5" />}
                      <span>{goal.term === 'short' ? '< 1 Yr' : goal.term === 'mid' ? '1-5 Yrs' : '5+ Yrs'}</span>
                    </div>
                 </div>

                 {/* Donut Chart */}
                 <div className="relative w-20 h-20 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={38}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell fill={goal.color} />
                          <Cell fill="#F3F4F6" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <span className="text-[10px] font-bold text-gray-600">
                         {percentage.toFixed(0)}%
                       </span>
                    </div>
                 </div>
               </div>
            </div>
          )})}
          
          {/* Add New Goal Card (Empty State) */}
          <button 
             onClick={addGoal}
             className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-600 transition-all min-h-[200px]"
          >
             <div className="bg-gray-50 p-3 rounded-full mb-3 group-hover:bg-indigo-50 transition-colors">
                <Target className="w-6 h-6" />
             </div>
             <span className="font-medium">Add Another Goal</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileGoals;