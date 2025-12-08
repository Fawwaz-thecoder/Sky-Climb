import React, { useEffect, useState } from 'react';
import { getDailyParkourFact } from '../services/geminiService';
import { Sparkles, ExternalLink } from 'lucide-react';

const DailyFact: React.FC = () => {
  const [fact, setFact] = useState<{text: string, sources: any[]} | null>(null);

  useEffect(() => {
    getDailyParkourFact().then(setFact);
  }, []);

  if (!fact) return null;

  return (
    <div className="absolute top-20 left-4 z-20 max-w-xs animate-fade-in-down">
      <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-lg text-xs text-slate-200 shadow-lg">
        <div className="flex items-center gap-2 mb-1 text-neon-blue font-bold">
          <Sparkles size={12} />
          <span>DAILY PARKOUR INTEL</span>
        </div>
        <p className="leading-relaxed">{fact.text}</p>
        {fact.sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1">
             <span className="text-[10px] text-slate-400 uppercase tracking-wider">Sources</span>
             {fact.sources.slice(0, 2).map((s, i) => (
               <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-neon-blue hover:underline truncate">
                 <ExternalLink size={8} /> {s.title}
               </a>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyFact;