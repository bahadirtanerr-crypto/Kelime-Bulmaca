/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RefreshCw, 
  Lightbulb, 
  Trophy, 
  Brain, 
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Gamepad2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generatePuzzle, PuzzleData } from './services/gemini';

// Helper to shuffle letters
const shuffle = (word: string) => {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const shuffled = arr.join('');
  // Ensure it's actually different if word length > 1
  if (shuffled === word && word.length > 1) return shuffle(word);
  return shuffled;
};

export default function App() {
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [scrambled, setScrambled] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const loadNewPuzzle = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    setUserInput('');
    setShowHint(false);
    try {
      const data = await generatePuzzle(difficulty);
      setPuzzle(data);
      setScrambled(shuffle(data.word));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [difficulty]);

  useEffect(() => {
    loadNewPuzzle();
  }, [loadNewPuzzle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!puzzle) return;

    if (userInput.toUpperCase().trim() === puzzle.word) {
      setFeedback('success');
      setScore(prev => prev + (difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30));
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
      setTimeout(() => {
        loadNewPuzzle();
      }, 2000);
    } else {
      setFeedback('error');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="max-w-4xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <Brain className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Kelime Bulmacası</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-black/5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-semibold">{score}</span>
          </div>
          <button 
            onClick={loadNewPuzzle}
            disabled={loading}
            className="p-2 hover:bg-white rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <div className="inline-block w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-500 font-medium italic">Yeni bulmaca hazırlanıyor...</p>
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Category Tag */}
              <div className="flex justify-center">
                <span className="px-4 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-100">
                  {puzzle?.category || 'Genel'}
                </span>
              </div>

              {/* Scrambled Word Display */}
              <div className="bg-white p-12 rounded-[2.5rem] shadow-xl shadow-black/5 border border-black/5 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/10"></div>
                
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {scrambled.split('').map((char, idx) => (
                    <motion.div
                      key={`${char}-${idx}`}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="w-14 h-14 md:w-16 md:h-16 bg-[#f8f9fa] rounded-2xl flex items-center justify-center text-3xl font-bold border-b-4 border-zinc-200 text-zinc-800"
                    >
                      {char}
                    </motion.div>
                  ))}
                </div>

                <p className="text-zinc-400 text-sm font-medium">Harfleri doğru sıraya dizin</p>
              </div>

              {/* Input Section */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Cevabınızı buraya yazın..."
                    autoFocus
                    className={`w-full bg-white px-8 py-6 rounded-3xl text-xl font-semibold text-center outline-none transition-all border-2 ${
                      feedback === 'success' ? 'border-emerald-500 bg-emerald-50' : 
                      feedback === 'error' ? 'border-red-500 bg-red-50 animate-shake' : 
                      'border-transparent focus:border-emerald-500 shadow-lg shadow-black/5'
                    }`}
                  />
                  {feedback === 'success' && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                  )}
                  {feedback === 'error' && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-red-500">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[#1a1a1a] text-white py-5 rounded-3xl font-bold text-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                  >
                    Kontrol Et <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className={`p-5 rounded-3xl transition-all border-2 ${
                      showHint ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-transparent text-zinc-400 hover:text-zinc-600 shadow-lg shadow-black/5'
                    }`}
                  >
                    <Lightbulb className="w-6 h-6" />
                  </button>
                </div>
              </form>

              {/* Hint Box */}
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-200 rounded-lg shrink-0">
                          <Lightbulb className="w-4 h-4 text-amber-700" />
                        </div>
                        <div>
                          <h4 className="text-amber-800 font-bold text-sm uppercase tracking-wider mb-1">İpucu</h4>
                          <p className="text-amber-900/80 leading-relaxed font-medium">
                            {puzzle?.hint}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Difficulty Selector */}
              <div className="flex justify-center gap-2 pt-8">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                      difficulty === level 
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' 
                        : 'bg-white text-zinc-400 hover:bg-zinc-50'
                    }`}
                  >
                    {level === 'easy' ? 'Kolay' : level === 'medium' ? 'Orta' : 'Zor'}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm font-medium">
          <Gamepad2 className="w-4 h-4" />
          <span>Gemini AI tarafından güçlendirildi</span>
        </div>
      </footer>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
}
