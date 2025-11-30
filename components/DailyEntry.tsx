import React, { useState, useMemo } from 'react';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES, CurrencyCode, CURRENCIES } from '../types';
import { PlusCircle, MinusCircle, Tag, Trash2, Sparkles, X, Check, Search, Filter, ArrowUpDown, Smartphone, ClipboardCheck, Calendar, Edit2 } from 'lucide-react';
import { parseTransactionsFromText } from '../services/geminiService';

interface DailyEntryProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  currency: CurrencyCode;
}

const DailyEntry: React.FC<DailyEntryProps> = ({ transactions, setTransactions, currency }) => {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Food');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  
  // Import Modal State
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<Partial<Transaction>[]>([]);

  // Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortOption, setSortOption] = useState('newest');

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const curr = CURRENCIES[currency];

  const handleAdd = () => {
    if (!amount || !description) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      amount: parseFloat(amount),
      type,
      category,
      description
    };

    setTransactions([newTransaction, ...transactions]);
    setAmount('');
    setDescription('');
    if (!categories.includes(category)) {
      setCategory(categories[0]);
    }
  };

  const handleDelete = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleParse = async () => {
    if (!importText) return;
    setIsParsing(true);
    const results = await parseTransactionsFromText(importText);
    setParsedData(results);
    setIsParsing(false);
  };

  const handleClipboardImport = async () => {
    try {
      // This requests permission from the browser to read the clipboard
      const text = await navigator.clipboard.readText();
      if (!text) {
        alert("Clipboard is empty! Please copy your SMS first.");
        return;
      }
      setImportText(text);
      setIsParsing(true);
      const results = await parseTransactionsFromText(text);
      setParsedData(results);
      setIsParsing(false);
    } catch (error) {
      console.error("Clipboard access denied:", error);
      alert("Please allow clipboard access when prompted to automatically read copied SMS.");
    }
  };

  // Update a specific field in the parsed data before import
  const updateParsedTransaction = (index: number, field: keyof Transaction, value: any) => {
    const newData = [...parsedData];
    newData[index] = { ...newData[index], [field]: value };
    
    // If type changes, ensure category is valid for that type
    if (field === 'type') {
      const validCategories = value === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      if (!validCategories.includes(newData[index].category || '')) {
         newData[index] = { ...newData[index], category: validCategories[0] };
      }
    }
    setParsedData(newData);
  };

  const removeParsedTransaction = (index: number) => {
    const newData = parsedData.filter((_, i) => i !== index);
    setParsedData(newData);
  };

  const confirmImport = () => {
    const newTransactions = parsedData.map(t => ({
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      date: t.date || new Date().toISOString().split('T')[0],
      amount: t.amount || 0,
      type: t.type || 'expense',
      category: t.category || 'Other',
      description: t.description || 'Imported Transaction'
    } as Transaction));

    setTransactions([...newTransactions, ...transactions]);
    setShowImport(false);
    setImportText('');
    setParsedData([]);
  };

  const todaysTotal = transactions
    .filter(t => t.date === new Date().toISOString().split('T')[0])
    .reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0);

  // Derived filtered & sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        // Search Filter (Description or Category)
        const matchesSearch = 
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
          t.category.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Category Filter
        const matchesCategory = 
          filterCategory === 'All' ? true :
          filterCategory === 'Income' ? t.type === 'income' :
          filterCategory === 'Expense' ? t.type === 'expense' :
          t.category === filterCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'oldest': return new Date(a.date).getTime() - new Date(b.date).getTime();
          case 'highest': return b.amount - a.amount;
          case 'lowest': return a.amount - b.amount;
          case 'newest': 
          default: return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
      });
  }, [transactions, searchTerm, filterCategory, sortOption]);

  const suggestedAmounts = [10, 50, 100, 500, 1000];

  return (
    <div className="space-y-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Entry Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <PlusCircle className="w-5 h-5 mr-2 text-emerald-600" />
              New Entry
            </h2>
            <button 
              onClick={() => setShowImport(true)}
              className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors flex items-center shadow-sm"
            >
              <Smartphone className="w-3 h-3 mr-1" /> Import SMS
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
              <button 
                onClick={() => { setType('expense'); setCategory(EXPENSE_CATEGORIES[0]); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Expense
              </button>
              <button 
                onClick={() => { setType('income'); setCategory(INCOME_CATEGORIES[0]); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Income
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 font-bold">{curr.symbol}</span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-10 block w-full rounded-lg border-gray-200 bg-gray-50 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            {/* Quick Amount Suggestions */}
            <div className="flex flex-wrap gap-2">
              {suggestedAmounts.map(val => (
                <button
                  key={val}
                  onClick={() => setAmount(val.toString())}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors"
                >
                  +{val}
                </button>
              ))}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="pl-10 block w-full rounded-lg border-gray-200 bg-gray-50 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (e.g., Lunch)"
              className="block w-full rounded-lg border-gray-200 bg-gray-50 border p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
            />

            <button
              onClick={handleAdd}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-emerald-200"
            >
              Add Transaction
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between">
          <div>
            <h3 className="text-indigo-100 font-medium mb-1">Today's Net Flow</h3>
            <div className="text-4xl font-bold">
              {todaysTotal >= 0 ? '+' : '-'}{curr.symbol}{Math.abs(todaysTotal).toLocaleString(curr.locale, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="space-y-2 mt-4">
             <div className="flex justify-between items-center bg-white/10 p-2 rounded">
                <span className="text-sm">Income Today</span>
                <span className="font-semibold text-emerald-300">
                  +{curr.symbol}{transactions.filter(t => t.date === new Date().toISOString().split('T')[0] && t.type === 'income').reduce((a,c) => a+c.amount, 0).toLocaleString(curr.locale, { minimumFractionDigits: 2 })}
                </span>
             </div>
             <div className="flex justify-between items-center bg-white/10 p-2 rounded">
                <span className="text-sm">Expense Today</span>
                <span className="font-semibold text-rose-300">
                  -{curr.symbol}{transactions.filter(t => t.date === new Date().toISOString().split('T')[0] && t.type === 'expense').reduce((a,c) => a+c.amount, 0).toLocaleString(curr.locale, { minimumFractionDigits: 2 })}
                </span>
             </div>
          </div>
        </div>
      </div>

      {/* Transactions List with Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="font-bold text-gray-800 whitespace-nowrap">Transactions</h3>
            
            {/* Filter & Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="pl-9 block w-full rounded-lg border-gray-200 bg-gray-50 border p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Category Filter */}
              <div className="relative sm:w-36">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Filter className="h-3 w-3 text-gray-400" />
                </div>
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-8 block w-full rounded-lg border-gray-200 bg-gray-50 border p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
                >
                  <option value="All">All Types</option>
                  <option value="Income">Income Only</option>
                  <option value="Expense">Expense Only</option>
                  <optgroup label="Expense Categories">
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="Income Categories">
                     {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                </select>
              </div>

              {/* Sort Order */}
              <div className="relative sm:w-36">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <ArrowUpDown className="h-3 w-3 text-gray-400" />
                </div>
                <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="pl-8 block w-full rounded-lg border-gray-200 bg-gray-50 border p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Amount</option>
                  <option value="lowest">Lowest Amount</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {transactions.length === 0 ? "No transactions yet. Start adding!" : "No matches found."}
            </div>
          ) : (
            filteredTransactions.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {t.type === 'income' ? <PlusCircle size={20} /> : <MinusCircle size={20} />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 line-clamp-1">{t.description}</p>
                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                      <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-700 whitespace-nowrap">{t.category}</span>
                      <span className="whitespace-nowrap">{t.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`font-bold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {t.type === 'income' ? '+' : '-'}{curr.symbol}{t.amount.toLocaleString(curr.locale, { minimumFractionDigits: 2 })}
                  </span>
                  <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-rose-500 transition-colors p-1">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white flex-shrink-0">
              <h3 className="font-bold flex items-center">
                <Smartphone className="w-5 h-5 mr-2" /> Import Transactions
              </h3>
              <button onClick={() => { setShowImport(false); setParsedData([]); }} className="hover:bg-indigo-700 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {parsedData.length === 0 ? (
                <>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-2">
                    <p className="text-xs text-blue-800 font-medium mb-2">
                      🔒 Browser Security Notice:
                    </p>
                    <p className="text-xs text-blue-600">
                      Web apps cannot directly read your SMS Inbox. To auto-import:
                      <br/>
                      1. Copy SMS/Transaction text from your phone.
                      <br/>
                      2. Click <strong>"Grant SMS Read Access"</strong> below.
                    </p>
                  </div>

                  <button
                    onClick={handleClipboardImport}
                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-3 px-4 rounded-xl border border-emerald-200 flex items-center justify-center transition-all mb-4 group"
                  >
                    <ClipboardCheck className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Grant SMS Read Access & Import
                  </button>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Or paste manually</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Paste transaction SMS here..."
                    className="w-full h-24 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm bg-gray-50"
                  ></textarea>
                  
                  <button
                    onClick={handleParse}
                    disabled={isParsing || !importText}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center disabled:opacity-50"
                  >
                    {isParsing ? 'Processing...' : 'Analyze Text'}
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700 flex items-center">
                        <Check className="w-4 h-4 mr-1 text-emerald-500" />
                        Found {parsedData.length} transactions:
                    </p>
                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        Review & Edit before Import
                    </span>
                  </div>
                  
                  {/* Editable List */}
                  <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                    {parsedData.map((t, i) => (
                      <div key={i} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm space-y-3 group hover:border-indigo-300 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 space-y-2 mr-2">
                                {/* Description & Date Row */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input 
                                        type="text" 
                                        value={t.description || ''} 
                                        onChange={(e) => updateParsedTransaction(i, 'description', e.target.value)}
                                        className="flex-1 border border-gray-200 rounded text-sm px-2 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        placeholder="Description"
                                    />
                                    <div className="relative">
                                      <input 
                                          type="date" 
                                          value={t.date || ''} 
                                          onChange={(e) => updateParsedTransaction(i, 'date', e.target.value)}
                                          className="w-full sm:w-32 border border-gray-200 rounded text-sm px-2 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                      />
                                    </div>
                                </div>
                                
                                {/* Amount, Type, Category Row */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="relative sm:w-28">
                                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                            <span className="text-gray-400 text-xs font-bold">{curr.symbol}</span>
                                        </div>
                                        <input 
                                            type="number" 
                                            value={t.amount || ''} 
                                            onChange={(e) => updateParsedTransaction(i, 'amount', Number(e.target.value))}
                                            className="w-full border border-gray-200 rounded text-sm pl-6 pr-2 py-1.5 font-bold focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <select
                                        value={t.type || 'expense'}
                                        onChange={(e) => updateParsedTransaction(i, 'type', e.target.value)}
                                        className={`border border-gray-200 rounded text-sm px-2 py-1.5 outline-none font-medium ${t.type === 'income' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>
                                    <select
                                        value={t.category || 'Other'}
                                        onChange={(e) => updateParsedTransaction(i, 'category', e.target.value)}
                                        className="flex-1 border border-gray-200 rounded text-sm px-2 py-1.5 bg-gray-50 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    >
                                        {(t.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button 
                                onClick={() => removeParsedTransaction(i)} 
                                className="text-gray-300 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                                title="Remove item"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-3 pt-2">
                     <button onClick={() => setParsedData([])} className="flex-1 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors">
                       Cancel
                     </button>
                     <button onClick={confirmImport} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold flex justify-center items-center shadow-lg shadow-emerald-200 transition-colors">
                       <Check className="w-5 h-5 mr-2" /> Confirm & Import
                     </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyEntry;