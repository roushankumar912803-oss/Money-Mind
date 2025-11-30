import React, { useState, useEffect } from 'react';
import { getFinanceNews } from '../services/geminiService';
import { NewsArticle } from '../types';
import { Newspaper, ExternalLink, RefreshCw, TrendingUp } from 'lucide-react';

const NewsSection: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNews = async () => {
    setLoading(true);
    setError('');
    const fetched = await getFinanceNews();
    if (fetched.length > 0) {
      setArticles(fetched);
    } else {
      setError('Could not fetch news at this time.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <TrendingUp className="mr-2 text-indigo-600" /> Indian Finance & Tax Updates
        </h2>
        <button 
          onClick={fetchNews} 
          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && articles.length === 0 && (
        <div className="text-center py-20 text-gray-400">
           <p>Curating latest Indian finance & tax news...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((article, idx) => (
          <a 
            key={idx} 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block group bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-indigo-200"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 line-clamp-2">
                {article.title}
              </h3>
              <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2 group-hover:text-indigo-500" />
            </div>
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded-md">{article.source || 'Finance Web'}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsSection;