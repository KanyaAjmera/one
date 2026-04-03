import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import AnoAI from '@/components/ui/animated-shader-background';

export default function GuessCaptcha() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [score, setScore] = useState(0);

  const generateCaptcha = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let text = '';
    for (let i = 0; i < 6; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    setUserInput('');
    setStatus('idle');
    drawCaptcha(text);
  }, []);

  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background noise
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // Draw text with random rotation and scaling
    ctx.font = 'bold 40px monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const x = 40 + (i * 35);
        const y = canvas.height / 2;
        
        ctx.save();
        ctx.translate(x, y);
        // Random rotation between -20 and 20 degrees
        const angle = (Math.random() - 0.5) * 0.4;
        ctx.rotate(angle);
        
        // Random color
        const hue = Math.floor(Math.random() * 360);
        ctx.fillStyle = `hsl(${hue}, 80%, 70%)`;
        
        // Add shadow for depth
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(char, 0, 0);
        ctx.restore();
    }

    // Add noise lines
    for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.strokeStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.3})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.stroke();
    }

    // Add noise dots
    for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() === captchaText) {
        setStatus('success');
        setScore(s => s + 1);
        setTimeout(() => generateCaptcha(), 1500);
    } else {
        setStatus('error');
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white p-4 md:p-8 relative flex flex-col">
      <div className="fixed inset-0 z-0"><AnoAI /></div>
      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col flex-1">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/games')} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Guess Captcha</h1>
          </div>
          <div className="text-xl font-bold bg-white/10 px-4 py-2 rounded-xl">Score: {score}</div>
        </header>

        <div className="flex-1 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-8 flex flex-col items-center justify-center shadow-2xl">
            
            <p className="text-white/70 mb-8 text-center max-w-sm">
                Type the characters you see in the image below. Case matters!
            </p>

            <div className="relative p-2 bg-white/5 rounded-2xl border border-white/10 shadow-inner mb-8 overflow-hidden group">
                <canvas 
                    ref={canvasRef} 
                    width={280} 
                    height={100}
                    className="rounded-xl"
                />
                
                {status === 'success' && (
                    <div className="absolute inset-0 bg-green-500/20 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in zoom-in duration-300">
                        <CheckCircle className="w-16 h-16 text-green-400 drop-shadow-lg" />
                    </div>
                )}
                {status === 'error' && (
                    <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in zoom-in duration-300">
                        <XCircle className="w-16 h-16 text-red-400 drop-shadow-lg" />
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => {
                        setUserInput(e.target.value);
                        if (status === 'error') setStatus('idle');
                    }}
                    placeholder="Enter captcha text..."
                    className={`
                        w-full bg-white/10 border-2 rounded-xl px-6 py-4 text-2xl font-mono text-center outline-none transition-all
                        ${status === 'error' ? 'border-red-500/50 focus:border-red-500 shake-animation' : 
                          status === 'success' ? 'border-green-500/50 text-green-400' : 
                          'border-white/10 focus:border-white/30'}
                    `}
                    disabled={status === 'success'}
                    autoFocus
                />
                
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={generateCaptcha}
                        className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-center gap-2"
                        disabled={status === 'success'}
                    >
                        <RefreshCw className="w-5 h-5" />
                        Refresh
                    </button>
                    <button
                        type="submit"
                        className={`
                            flex-[2] px-4 py-3 rounded-xl font-bold transition-all
                            ${userInput.length > 0 && status !== 'success'
                                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
                                : 'bg-white/10 text-white/50 cursor-not-allowed'}
                        `}
                        disabled={userInput.length === 0 || status === 'success'}
                    >
                        Submit
                    </button>
                </div>
            </form>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .shake-animation { animation: shake 0.2s ease-in-out 0s 2; }
            `}</style>
        </div>
      </div>
    </div>
  );
}
