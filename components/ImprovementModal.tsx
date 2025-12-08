import React, { useEffect, useState } from 'react';
import { getGameImprovementTips } from '../services/geminiService';
import { Lightbulb, X, DollarSign } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const ImprovementModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [tips, setTips] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && tips.length === 0) {
            setLoading(true);
            getGameImprovementTips().then((data) => {
                setTips(data);
                setLoading(false);
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="bg-slate-900 border border-neon-pink/50 rounded-xl p-6 max-w-md w-full shadow-[0_0_30px_rgba(255,0,255,0.2)]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Lightbulb className="text-neon-pink" />
                        AI Dev Suggestions
                    </h2>
                    <button onClick={onClose}><X className="text-slate-400 hover:text-white" /></button>
                </div>
                
                {loading ? (
                    <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-700 rounded w-full"></div>
                        <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-400 mb-2">Here are 5 ways to monetize & improve this app:</p>
                        <ul className="space-y-3">
                            {tips.map((tip, idx) => (
                                <li key={idx} className="flex gap-3 text-sm text-slate-200 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                    <span className="text-neon-pink font-bold">{idx + 1}.</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6 pt-4 border-t border-slate-800">
                            <h3 className="text-neon-green text-sm font-bold flex items-center gap-2 mb-2">
                                <DollarSign size={14} /> Monetization Note
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                To gain money, integrate interstitial ads between levels (e.g., AdMob/AdSense) and offer a "Remove Ads" IAP. The shop system above is a foundation for selling premium skins.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImprovementModal;
