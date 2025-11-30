import React, { useState } from 'react';
import { getEducationContent } from '../services/geminiService';
import { EducationResource } from '../types';
import { GraduationCap, Search, Video, ExternalLink, ArrowRight, PlayCircle } from 'lucide-react';

const EducationSection: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [resources, setResources] = useState<EducationResource[]>([]);
  const [loading, setLoading] = useState(false);

  const topics = [
    "Stock Market Basics",
    "Cryptocurrency for Beginners",
    "How to Budget effectively",
    "Real Estate Investing",
    "Retirement Planning",
    "Understanding Taxes"
  ];

  const handleSearch = async (query: string) => {
    if (!query) return;
    setLoading(true);
    setTopic(query);
    const data = await getEducationContent(query);
    setResources(data);
    setLoading(false);
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="space-y-8">
      <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4 flex items-center">
            <GraduationCap className="mr-3 w-8 h-8 text-yellow-400" /> Finance Academy
          </h2>
          <p className="text-indigo-200 mb-6 max-w-lg">
            Master your money. Search for any financial topic to watch curated YouTube videos from top financial educators.
          </p>
          
          <div className="flex max-w-md bg-white/10 backdrop-blur-md rounded-lg p-1 border border-white/20">
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What do you want to learn?"
              className="flex-1 bg-transparent border-none text-white placeholder-indigo-300 px-4 focus:ring-0 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(topic)}
            />
            <button 
              onClick={() => handleSearch(topic)}
              className="bg-yellow-500 hover:bg-yellow-400 text-indigo-900 font-bold py-2 px-6 rounded-md transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
         {topics.map(t => (
           <button 
            key={t}
            onClick={() => handleSearch(t)}
            className="text-sm bg-white border border-gray-200 hover:border-indigo-500 hover:text-indigo-600 text-gray-600 py-2 px-4 rounded-full transition-all"
           >
             {t}
           </button>
         ))}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
           <Search className="w-10 h-10 text-indigo-500 animate-bounce mb-4" />
           <p className="text-gray-500">Searching for the best videos...</p>
        </div>
      )}

      {!loading && resources.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res, idx) => {
            const videoId = getYouTubeId(res.url);
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="relative w-full aspect-video bg-gray-100">
                  {videoId ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={res.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="border-0"
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Video className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 leading-tight">
                    {res.title}
                  </h3>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                     <span className="text-xs font-semibold text-red-600 flex items-center bg-red-50 px-2 py-1 rounded-md">
                       <PlayCircle className="w-3 h-3 mr-1" /> YouTube
                     </span>
                     <a 
                       href={res.url} 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="text-gray-400 hover:text-indigo-600 transition-colors"
                       title="Open in new tab"
                     >
                       <ExternalLink className="w-4 h-4" />
                     </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {!loading && resources.length === 0 && topic && (
        <div className="text-center py-12 text-gray-400">
           No videos found. Try a different topic.
        </div>
      )}
    </div>
  );
};

export default EducationSection;