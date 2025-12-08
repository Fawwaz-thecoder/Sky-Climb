
import React, { useState } from 'react';
import { Heart, X, Send } from 'lucide-react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Simulate sending
    setSubmitted(true);
    
    // Reset and close after delay
    setTimeout(() => {
        setSubmitted(false);
        setMessage('');
        onClose();
    }, 2500);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-pink-500/30 rounded-2xl w-full max-w-sm p-6 shadow-[0_0_30px_rgba(236,72,153,0.2)] relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        {!submitted ? (
            <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-14 h-14 bg-pink-500/20 rounded-full flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                        <Heart className="text-pink-500 fill-pink-500" size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-white font-pixel">DONATE</h2>
                    <p className="text-slate-400 text-sm text-center mt-2 px-4 leading-relaxed">
                        Enjoying the climb? Send a message to the developer!
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 resize-none h-28 text-sm transition-all"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={!message.trim()}
                        className="w-full group bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        <span>Send Message</span>
                        <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
            </div>
        ) : (
            <div className="py-10 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                <div className="text-6xl mb-6 animate-bounce">💖</div>
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-white mb-3 font-pixel">
                    THANK YOU!
                </h3>
                <p className="text-slate-300 text-sm px-6">
                    Your message has been received. <br/>Keep climbing!
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default DonateModal;
