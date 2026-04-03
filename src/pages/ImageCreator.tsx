import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Sparkles, Download } from 'lucide-react';
import AnoAI from '@/components/ui/animated-shader-background';
import { motion } from 'framer-motion';

const UNSPLASH_ACCESS_KEY = "Ph6HHiyDL30z6jBmbI_e3-ML76Axr9e57xTGEm8ldws";

export default function ImageCreator() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateImages = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setImages([]);
    
    try {
      const response = await fetch(`https://api.unsplash.com/search/photos?page=1&per_page=30&query=${encodeURIComponent(prompt)}&client_id=${UNSPLASH_ACCESS_KEY}`);
      const data = await response.json();
      
      if (response.ok) {
        if (data.results && data.results.length > 0) {
            setImages(data.results);
        } else {
            setError("No images found for this prompt.");
        }
      } else {
        setError("Error fetching from Unsplash: " + (data.errors ? data.errors[0] : "Failed to fetch"));
      }
    } catch (err: any) {
      setError("Error Connecting: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen bg-black text-white font-sans overflow-x-hidden relative flex flex-col">
      <div className="fixed inset-0 z-0">
        <AnoAI />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col flex-1">
        
        <header className="relative z-50 flex flex-col gap-6 mb-8 backdrop-blur-md bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/create')}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Image Generator
            </h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-start min-h-[400px]">
             <motion.div
                key="content"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="w-full bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md text-center shadow-2xl mb-8"
            >
                <h2 className="text-3xl font-bold mb-4">Generate High-Quality Pictures</h2>
                <p className="text-white/60 mb-8">
                    Describe what you want to see, and find beautiful imagery using Unsplash.
                </p>

                <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateImages()}
                        placeholder="e.g. 'Cyberpunk city at night', 'A cute golden retriever'"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    
                    <button
                        onClick={handleGenerateImages}
                        disabled={loading || !prompt.trim()}
                        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold whitespace-nowrap"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5"/>}
                        {loading ? "Searching..." : "Generate Images"}
                    </button>
                </div>
                
                {error && (
                    <p className="text-sm mt-4 text-red-400 bg-red-400/10 p-3 rounded-lg max-w-md mx-auto">{error}</p>
                )}
            </motion.div>

            {images.length > 0 && (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                    {images.map((img) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={img.id}
                            className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 aspect-[4/3] shadow-lg"
                        >
                            <img 
                                src={img.urls.regular} 
                                alt={img.alt_description || prompt} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-left max-w-[70%]">
                                        <p className="text-white font-medium truncate">{img.user.name}</p>
                                        <p className="text-white/60 text-xs truncate">on Unsplash</p>
                                    </div>
                                    <button 
                                        onClick={() => window.open(img.links.html, '_blank')}
                                        className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full transition-all"
                                        title="View on Unsplash"
                                    >
                                        <Download className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
