import React, { useState } from 'react';
import { generateBudgetPlan } from '../services/geminiService';
import { CurrencyCode, CURRENCIES } from '../types';
import { Calculator, Send, Phone, MessageCircle, Sparkles, Loader2, Wallet, User } from 'lucide-react';

interface AIBudgetPlanProps {
  initialSalary: number;
  currency: CurrencyCode;
}

const AIBudgetPlan: React.FC<AIBudgetPlanProps> = ({ initialSalary, currency }) => {
  const [salary, setSalary] = useState<string>(initialSalary > 0 ? initialSalary.toString() : '');
  const [name, setName] = useState<string>('');
  const [plan, setPlan] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const curr = CURRENCIES[currency];

  const handleGeneratePlan = async () => {
    if (!salary || !name) return;
    setLoading(true);
    const result = await generateBudgetPlan(name, parseFloat(salary), curr.label);
    setPlan(result);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main AI Instructor Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
            <Sparkles className="w-6 h-6 text-indigo-600 mr-2" />
            AI Finance Instructor
          </h2>
          <p className="text-gray-500 mb-6">
            Enter your details below, and I will generate a personalized financial blueprint tailored just for you.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul"
                  className="pl-10 block w-full rounded-lg border-gray-200 bg-gray-50 border p-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-bold">{curr.symbol}</span>
                </div>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. 50000"
                  className="pl-10 block w-full rounded-lg border-gray-200 bg-gray-50 border p-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
          
          <button
            onClick={handleGeneratePlan}
            disabled={loading || !salary || !name}
            className="w-full mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Calculator className="mr-2 w-5 h-5" />}
            Generate Personalized Plan
          </button>
        </div>

        {plan && (
          <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden animate-fade-in-up">
            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
              <h3 className="font-bold text-indigo-900">Your Personalized Strategy</h3>
              <Wallet className="text-indigo-400 w-5 h-5" />
            </div>
            <div className="p-6 prose prose-indigo max-w-none prose-headings:font-bold prose-a:text-indigo-600">
               {/* Rendering simple markdown-like text with whitespace preservation */}
               <div className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                 {plan}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Premium Guidance Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-8 space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
            
            <h3 className="text-xl font-bold mb-4 flex items-center text-yellow-400">
               Premium Guidance <span className="ml-2 text-xs bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full">PRO</span>
            </h3>
            <p className="text-gray-300 text-sm mb-6">
              Need detailed help? Get 1-on-1 expert consultation to sort your financial mess.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs text-gray-400 mb-1">WhatsApp Number</label>
                <input 
                  type="text" 
                  value="+91 73200 34524" 
                  disabled 
                  className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white text-sm font-medium focus:outline-none cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Chat Support</label>
                    <input 
                      type="text" 
                      value="₹50 / session" 
                      disabled 
                      className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-emerald-400 text-sm font-bold focus:outline-none cursor-not-allowed"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Call Support</label>
                    <input 
                      type="text" 
                      value="₹100 / hour" 
                      disabled 
                      className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-blue-400 text-sm font-bold focus:outline-none cursor-not-allowed"
                    />
                </div>
              </div>
            </div>

            <a 
              href="https://wa.me/917320034524" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-emerald-500/20"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat on WhatsApp
            </a>
          </div>

          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
            <h4 className="font-bold text-indigo-900 mb-2">Why Go Premium?</h4>
            <ul className="space-y-2 text-sm text-indigo-800">
              <li className="flex items-start"><span className="mr-2">•</span> Custom Investment Portfolios</li>
              <li className="flex items-start"><span className="mr-2">•</span> Tax Saving Strategy Review</li>
              <li className="flex items-start"><span className="mr-2">•</span> Debt Reduction Planning</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBudgetPlan;