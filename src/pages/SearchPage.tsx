import { useState, useRef } from "react";
import { Search, Mic, MicOff, ImageIcon, X, ExternalLink, Play, MapPin, Newspaper, Upload } from "lucide-react";
import AnoAI from "@/components/ui/animated-shader-background";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import React from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface WebResult  { title: string; url: string; displayUrl: string; description: string; favicon?: string; }
interface ImageResult { id: string; thumb: string; full: string; alt: string; author: string; authorUrl: string; }
interface VideoResult { id: string; title: string; channel: string; views: string; thumb: string; duration: string; }
interface NewsResult  { title: string; source: string; time: string; snippet: string; url: string; }

// ── Static web results ────────────────────────────────────────────────────────
const WEB_DB: Record<string, WebResult[]> = {
  "node.js": [
    { title: "Node.js — Run JavaScript Everywhere", url: "https://nodejs.org", displayUrl: "nodejs.org", description: "Node.js® is a free, open-source, cross-platform JavaScript runtime. Build fast scalable network applications.", favicon: "🟢" },
    { title: "Node.js Documentation", url: "https://nodejs.org/docs/latest/api/", displayUrl: "nodejs.org › docs › api", description: "Official API docs for Node.js. Covers built-in modules, HTTP, file system, streams, and more.", favicon: "📄" },
    { title: "Node.js Best Practices", url: "https://github.com/goldbergyoni/nodebestpractices", displayUrl: "github.com › nodebestpractices", description: "100+ Node.js best practices, style guides, and architectural tips.", favicon: "⭐" },
  ],
  "python": [
    { title: "Python.org — Official Website", url: "https://www.python.org", displayUrl: "python.org", description: "The official home of Python. Download Python, access docs, join the community.", favicon: "🐍" },
    { title: "Python 3 Documentation", url: "https://docs.python.org/3/", displayUrl: "docs.python.org › 3", description: "Full reference for Python 3 built-ins, standard library and language specification.", favicon: "📚" },
    { title: "Real Python Tutorials", url: "https://realpython.com", displayUrl: "realpython.com", description: "Learn Python with detailed tutorials for all skill levels — beginner to advanced.", favicon: "🎓" },
  ],
  "react": [
    { title: "React — The library for web and native UIs", url: "https://react.dev", displayUrl: "react.dev", description: "Build user interfaces out of individual pieces called components. Fast, declarative UI.", favicon: "⚛️" },
    { title: "React Docs — Quick Start", url: "https://react.dev/learn", displayUrl: "react.dev › learn", description: "Introduction to the 80% of React concepts used daily.", favicon: "📖" },
    { title: "Awesome React", url: "https://github.com/enaqx/awesome-react", displayUrl: "github.com › awesome-react", description: "A curated list of awesome things in the React ecosystem.", favicon: "⭐" },
  ],
};

function buildWebResults(q: string): WebResult[] {
  const key = Object.keys(WEB_DB).find(k => q.toLowerCase().includes(k) || k.includes(q.toLowerCase()));
  if (key) return WEB_DB[key];
  const enc = encodeURIComponent(q);
  return [
    { title: `${q} — Wikipedia`, url: `https://en.wikipedia.org/wiki/${enc}`, displayUrl: `en.wikipedia.org › wiki › ${q}`, description: `Comprehensive Wikipedia article about ${q} — history, concepts, and applications.`, favicon: "📖" },
    { title: `${q} — Official Docs`, url: `https://www.google.com/search?q=${enc}+documentation`, displayUrl: `${q.toLowerCase().replace(/\s+/g, "")}docs.io`, description: `Official documentation and getting started guides for ${q}.`, favicon: "📄" },
    { title: `${q} Tutorial — W3Schools`, url: `https://www.w3schools.com/search/searchResult.asp?q=${enc}`, displayUrl: `w3schools.com › search`, description: `Step-by-step tutorials and interactive examples for ${q}.`, favicon: "🏫" },
    { title: `${q} — Stack Overflow`, url: `https://stackoverflow.com/search?q=${enc}`, displayUrl: `stackoverflow.com › search?q=${q}`, description: `Community Q&A, solutions and best practices for ${q}.`, favicon: "🔶" },
    { title: `${q} on GitHub`, url: `https://github.com/search?q=${enc}`, displayUrl: `github.com › search?q=${q}`, description: `Open-source repositories, code examples, and projects related to ${q}.`, favicon: "⭐" },
    { title: `Learn ${q} — freeCodeCamp`, url: `https://www.freecodecamp.org/news/search/?query=${enc}`, displayUrl: `freecodecamp.org › news › search`, description: `Free tutorials, articles and courses about ${q} from freeCodeCamp.`, favicon: "🔥" },
  ];
}

// ── Unsplash images (free, no key needed via source.unsplash.com) ──────────────
function buildImageResults(q: string): ImageResult[] {
  const seeds = [q, `${q} 1`, `${q} 2`, `${q} 3`, `${q} 4`, `${q} 5`, `${q} 6`, `${q} 7`, `${q} 8`, `${q} landscape`, `${q} background`, `${q} concept`];
  return seeds.map((seed, i) => ({
    id: `img_${i}`,
    thumb: `https://source.unsplash.com/400x300/?${encodeURIComponent(seed)}`,
    full:  `https://source.unsplash.com/1200x800/?${encodeURIComponent(seed)}`,
    alt: `${q} image ${i + 1}`,
    author: "Unsplash",
    authorUrl: "https://unsplash.com",
  }));
}

// ── YouTube video search results (deep-linked) ────────────────────────────────
function buildVideoResults(q: string): VideoResult[] {
  const searches = [q, `${q} tutorial`, `${q} explained`, `${q} full course`, `${q} tips`, `${q} 2024`];
  const channels = ["TechWithTim", "Fireship", "Traversy Media", "The Coding Train", "freeCodeCamp", "CS Dojo"];
  const views = ["1.2M", "890K", "2.4M", "567K", "3.1M", "445K"];
  const durations = ["12:34", "8:22", "45:10", "15:07", "2:03:44", "20:15"];
  return searches.map((s, i) => ({
    id: `vid_${i}`,
    title: `${s.charAt(0).toUpperCase() + s.slice(1)} — Complete Guide ${2024 - i}`,
    channel: channels[i % channels.length],
    views: views[i % views.length] + " views",
    thumb: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
    duration: durations[i % durations.length],
    // Real YouTube search link — clicking opens YouTube search for that query
  }));
}

// ── News results ──────────────────────────────────────────────────────────────
function buildNewsResults(q: string): NewsResult[] {
  const sources = ["TechCrunch", "The Verge", "Wired", "Ars Technica", "Reuters", "BBC News"];
  const times = ["2 hours ago", "5 hours ago", "1 day ago", "2 days ago", "3 days ago", "1 week ago"];
  return sources.map((src, i) => ({
    title: `${q}: Latest Updates and Developments in ${new Date().getFullYear()}`,
    source: src,
    time: times[i],
    snippet: `Latest news and analysis about ${q}. Industry experts weigh in on recent developments, trends, and future outlook for ${q}.`,
    url: `https://www.google.com/search?q=${encodeURIComponent(q)}&tbm=nws`,
  }));
}

const TABS = ["ALL", "SEARCH", "IMAGES", "VIDEOS", "MAPS", "NEWS", "COPILOT", "MORE"];
const SUGGESTIONS = ["node.js", "python", "react"];
const UNSPLASH_KEY = "Ph6HHiyDL30z6jBmbI_e3-ML76Axr9e57xTGEm8ldws";

// ── Component ─────────────────────────────────────────────────────────────────
export default function SearchPage({ onBack: _onBack }: { onBack?: () => void }) {
  const [query, setQuery]         = useState("");
  const [submitted, setSubmitted] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [showMore, setShowMore]   = useState(false);

  const [webResults,   setWebResults]   = useState<WebResult[]>([]);
  const [imageResults, setImageResults] = useState<ImageResult[]>([]);
  const [videoResults, setVideoResults] = useState<VideoResult[]>([]);
  const [newsResults,  setNewsResults]  = useState<NewsResult[]>([]);

  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading,  setAiLoading]  = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Voice
  const [isListening, setIsListening]   = useState(false);
  const [voiceError,  setVoiceError]    = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Image upload
  const [imgUploadLoading, setImgUploadLoading] = useState(false);
  const [imgUploadNote,    setImgUploadNote]    = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const inputRef      = useRef<HTMLInputElement>(null);

  // ── Voice Search ────────────────────────────────────────────────────────
  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setVoiceError("Voice search not supported. Use Chrome or Edge.");
      setTimeout(() => setVoiceError(null), 4000);
      return;
    }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }

    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;

    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => {
      const text = Array.from(e.results as any[]).map((r: any) => r[0].transcript).join("");
      setQuery(text);
      if (e.results[e.results.length - 1].isFinal) { rec.stop(); runSearch(text); }
    };
    rec.onerror = (e: any) => {
      setIsListening(false);
      setVoiceError(`Mic error: ${e.error}. Check browser permissions.`);
      setTimeout(() => setVoiceError(null), 4000);
    };
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  // ── Image Upload (OCR via Tesseract CDN, or filename fallback) ────────────
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploadLoading(true);
    setImgUploadNote(null);

    const fallbackQuery = file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[-_.\s]+/g, " ")
      .trim();

    // Helper: load Tesseract from CDN once
    const loadTesseract = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        if ((window as any).Tesseract) { resolve((window as any).Tesseract); return; }
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
        script.onload = () => resolve((window as any).Tesseract);
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      let searchQuery = fallbackQuery;

      try {
        const Tesseract = await loadTesseract();
        const worker = await Tesseract.createWorker("eng");
        const { data: { text } } = await worker.recognize(dataUrl);
        await worker.terminate();
        const cleaned = text.trim().replace(/\s+/g, " ").slice(0, 150);
        if (cleaned.length > 4) {
          searchQuery = cleaned;
          setImgUploadNote(`📝 Extracted: "${cleaned.slice(0, 60)}${cleaned.length > 60 ? "…" : ""}"`);
        } else {
          setImgUploadNote(`🔍 Searching by filename: "${fallbackQuery}"`);
        }
      } catch {
        // Tesseract unavailable — use filename
        setImgUploadNote(`🔍 Searching by filename: "${fallbackQuery}"`);
      }

      setQuery(searchQuery);
      setImgUploadLoading(false);
      if (searchQuery) runSearch(searchQuery);
    };

    reader.onerror = () => {
      setImgUploadLoading(false);
      setImgUploadNote(`🔍 Searching by filename: "${fallbackQuery}"`);
      if (fallbackQuery) runSearch(fallbackQuery);
    };

    reader.readAsDataURL(file);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // Fetch real images from Unsplash API
  const fetchImages = async (q: string) => {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=12&client_id=${UNSPLASH_KEY}`
      );
      const data = await res.json();
      if (data.results?.length) {
        setImageResults(data.results.map((p: any) => ({
          id: p.id,
          thumb: p.urls.small,
          full:  p.urls.regular,
          alt:   p.alt_description || q,
          author: p.user.name,
          authorUrl: p.user.links.html,
        })));
        return;
      }
    } catch { /* fall through to placeholder */ }
    setImageResults(buildImageResults(q));
  };

  const runSearch = async (q: string) => {
    if (!q.trim()) return;
    const t = q.trim();
    setQuery(t);
    setSubmitted(t);
    setActiveTab("ALL");
    setShowMore(false);
    setAiResponse(null);
    setWebResults(buildWebResults(t));
    setVideoResults(buildVideoResults(t));
    setNewsResults(buildNewsResults(t));
    fetchImages(t);

    setAiLoading(true);
    try {
      const { NODE_API_URL } = await import("../config");
      const res = await axios.post(`${NODE_API_URL}/api/chat/ask`, { message: t, mode: "general" });
      setAiResponse(res.data.response);
    } catch { setAiResponse(null); }
    finally { setAiLoading(false); }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") runSearch(query);
  };

  const hasResults = submitted.length > 0;

  return (
    <div className="min-h-screen text-white font-sans relative flex flex-col">
      <div className="fixed inset-0 z-0"><AnoAI /></div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxSrc(null)}>
          <img src={lightboxSrc} alt="preview" className="max-w-full max-h-full rounded-xl shadow-2xl" />
          <button className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20" onClick={() => setLightboxSrc(null)}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="relative z-10 flex flex-col flex-1">
        {/* ── STICKY TOP ── */}
        <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-5xl mx-auto px-4 pt-4 pb-0">
            {/* Search bar */}
            <div className="flex items-center gap-2 bg-white/8 border border-white/20 hover:border-white/35 focus-within:border-white/50 rounded-full px-5 py-2.5 max-w-2xl mx-auto transition-all">
              <Search className="w-4 h-4 text-white/50 flex-shrink-0" />
              <input ref={inputRef} type="text" value={query}
                onChange={e => setQuery(e.target.value)} onKeyDown={handleKey}
                placeholder="Search" autoComplete="off"
                className="flex-1 bg-transparent outline-none text-white placeholder-white/35 text-[15px]" />
              {query && <button onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="p-1 hover:bg-white/10 rounded-full"><X className="w-3.5 h-3.5 text-white/40" /></button>}
              <div className="w-px h-4 bg-white/20" />
              <button onClick={startVoice} title={isListening ? "Stop listening" : "Voice search"}
                className={`p-1 rounded-full transition-colors ${isListening ? "bg-red-500/30 text-red-400 animate-pulse" : "hover:bg-white/10 text-white/50"}`}>
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button onClick={() => imageInputRef.current?.click()} title="Search by image"
                className={`p-1 hover:bg-white/10 rounded-full transition-colors ${imgUploadLoading ? "opacity-50 cursor-wait" : "text-white/50"}`}>
                {imgUploadLoading ? <Upload className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              </button>
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
            </div>

            {/* Tabs */}
            <div className="flex items-center mt-3 overflow-x-auto scrollbar-hide">
              {TABS.map(tab => tab === "MORE" ? (
                <div key="MORE" className="relative">
                  <button onClick={() => setShowMore(!showMore)}
                    className={`px-4 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-all ${showMore ? "border-blue-400 text-blue-400" : "border-transparent text-white/50 hover:text-white"}`}>
                    MORE ▾
                  </button>
                  {showMore && (
                    <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-white/15 rounded-xl shadow-2xl py-1 min-w-[130px] z-50">
                      {["SHOPPING","FLIGHTS","TRAVEL","TOOLS"].map(o => (
                        <button key={o} onMouseDown={() => { setActiveTab(o); setShowMore(false); }}
                          className="w-full text-left px-4 py-2.5 text-white/65 hover:text-white hover:bg-white/8 text-sm">{o}</button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button key={tab} onClick={() => { setActiveTab(tab); setShowMore(false); }}
                  className={`px-4 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-all ${activeTab === tab ? "border-blue-400 text-blue-400" : "border-transparent text-white/50 hover:text-white"}`}>
                  {tab === "SEARCH" ? "🔍 SEARCH" : tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 py-8">

            {/* Voice / image status banners */}
            {(voiceError || imgUploadNote || isListening) && (
              <div className="max-w-2xl mb-4">
                {isListening && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm animate-pulse">
                    <MicOff className="w-4 h-4 flex-shrink-0" />
                    Listening… speak now. Click mic again to stop.
                  </div>
                )}
                {voiceError && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm">
                    ⚠️ {voiceError}
                  </div>
                )}
                {imgUploadNote && !imgUploadLoading && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
                    🖼️ {imgUploadNote}
                  </div>
                )}
              </div>
            )}

            {/* Empty state */}
            {!hasResults && (
              <div className="flex flex-col items-center justify-center mt-20 select-none">
                <h2 className="text-2xl text-white/50 mb-2 font-medium">Start searching</h2>
                <p className="text-white/35 text-sm mb-6">Try: node.js, python, or react</p>
                <div className="flex gap-3 flex-wrap justify-center">
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => runSearch(s)}
                      className="px-4 py-1.5 rounded border border-white/20 bg-white/8 hover:bg-white/15 text-white/75 text-sm transition-colors">{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* ══ ALL tab ══ */}
            {hasResults && activeTab === "ALL" && (
              <div className="max-w-2xl">
                <p className="text-white/35 text-sm mb-5">About {(webResults.length * 274_000_000).toLocaleString()} results</p>

                {/* AI Overview */}
                {(aiLoading || aiResponse) && (
                  <div className="mb-7 rounded-2xl border border-blue-500/20 bg-blue-950/15 backdrop-blur-sm overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-blue-500/15">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">✨</span>
                      </div>
                      <span className="text-blue-300 font-semibold text-[15px]">AI Overview</span>
                      <span className="text-[10px] text-blue-400/60 border border-blue-500/20 rounded-full px-2 py-0.5">Infinity AI</span>
                    </div>
                    <div className="px-5 py-4">
                      {aiLoading ? (
                        <div className="space-y-2.5 animate-pulse">
                          {[100, 83, 67, 75].map((w, i) => (
                            <div key={i} className={`h-3 bg-blue-400/15 rounded-full`} style={{ width: `${w}%` }} />
                          ))}
                        </div>
                      ) : aiResponse ? (
                        <div className="prose prose-invert prose-sm max-w-none text-white/85 leading-relaxed prose-headings:text-blue-300 prose-strong:text-white prose-code:text-blue-300 prose-code:bg-blue-950/60 prose-code:px-1 prose-code:rounded prose-a:text-blue-400">
                          <ReactMarkdown>{aiResponse}</ReactMarkdown>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Web results */}
                <div className="space-y-7">
                  {webResults.map((r, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm">{r.favicon}</span>
                        <span className="text-white/40 text-xs truncate">{r.displayUrl}</span>
                      </div>
                      <a href={r.url} target="_blank" rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 hover:underline text-[18px] font-medium leading-snug block">
                        {r.title}
                      </a>
                      <p className="text-white/55 text-sm mt-1 leading-relaxed">{r.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ IMAGES tab ══ */}
            {hasResults && activeTab === "IMAGES" && (
              <div>
                <p className="text-white/35 text-sm mb-5">Images for "<span className="text-white/60">{submitted}</span>"</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {imageResults.map((img, i) => (
                    <div key={img.id} className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-white/5 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                      onClick={() => setLightboxSrc(img.full)}>
                      <img src={img.thumb} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${submitted}${i}/400/300`; }} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity px-2 pb-1.5 w-full">
                          <p className="text-white text-[10px] truncate">{img.alt}</p>
                          <a href={img.authorUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                            className="text-white/60 text-[9px] hover:text-white/90 flex items-center gap-0.5">
                            <ExternalLink className="w-2.5 h-2.5" /> {img.author}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-white/25 text-xs mt-6 text-center">Images from Unsplash · Click to enlarge</p>
              </div>
            )}

            {/* ══ VIDEOS tab ══ */}
            {hasResults && activeTab === "VIDEOS" && (
              <div>
                <p className="text-white/35 text-sm mb-5">Videos for "<span className="text-white/60">{submitted}</span>"</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {videoResults.map((v, i) => (
                    <a key={v.id} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(submitted)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="group rounded-2xl bg-white/5 border border-white/10 hover:border-white/25 overflow-hidden transition-all hover:scale-[1.02]">
                      <div className="relative aspect-video bg-zinc-900">
                        <img src={`https://picsum.photos/seed/${submitted}${i}/480/270`} alt={v.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center group-hover:bg-red-600 transition-colors">
                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                          {v.duration}
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-white text-sm font-medium leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors">{v.title}</p>
                        <p className="text-white/45 text-xs mt-1.5">{v.channel}</p>
                        <p className="text-white/30 text-xs">{v.views}</p>
                      </div>
                    </a>
                  ))}
                </div>
                <p className="text-white/25 text-xs mt-6 text-center">Click any video to search on YouTube</p>
              </div>
            )}

            {/* ══ MAPS tab ══ */}
            {hasResults && activeTab === "MAPS" && (
              <div>
                <p className="text-white/35 text-sm mb-5">Map for "<span className="text-white/60">{submitted}</span>"</p>
                <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
                  <iframe
                    title={`Map of ${submitted}`}
                    width="100%"
                    height="520"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=-180,-90,180,90&layer=mapnik&marker=0,0`}
                    onLoad={(e) => {
                      const src = `https://www.openstreetmap.org/export/embed.html?query=${encodeURIComponent(submitted)}`;
                      (e.target as HTMLIFrameElement).src = src;
                    }}
                    style={{ border: "none" }}
                    loading="lazy"
                  />
                </div>
                <div className="mt-4 flex gap-3">
                  <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(submitted)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/8 border border-white/15 rounded-xl text-sm hover:bg-white/15 transition-colors">
                    <MapPin className="w-4 h-4 text-blue-400" /> Open in OpenStreetMap
                  </a>
                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(submitted)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/8 border border-white/15 rounded-xl text-sm hover:bg-white/15 transition-colors">
                    <ExternalLink className="w-4 h-4 text-red-400" /> Open in Google Maps
                  </a>
                </div>
              </div>
            )}

            {/* ══ NEWS tab ══ */}
            {hasResults && activeTab === "NEWS" && (
              <div>
                <p className="text-white/35 text-sm mb-5">News for "<span className="text-white/60">{submitted}</span>"</p>
                <div className="space-y-4">
                  {newsResults.map((n, i) => (
                    <a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
                      className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/8 transition-all group">
                      <div className="w-24 h-16 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <img src={`https://picsum.photos/seed/${submitted}news${i}/200/120`} alt="" className="w-full h-full object-cover rounded-xl opacity-70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm leading-snug group-hover:text-blue-300 transition-colors line-clamp-2">{n.title}</p>
                        <p className="text-white/50 text-xs mt-1.5 line-clamp-2">{n.snippet}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Newspaper className="w-3 h-3 text-white/30" />
                          <span className="text-white/40 text-xs font-medium">{n.source}</span>
                          <span className="text-white/25 text-xs">·</span>
                          <span className="text-white/30 text-xs">{n.time}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ══ COPILOT tab ══ */}
            {hasResults && activeTab === "COPILOT" && (
              <div className="max-w-2xl">
                <div className="rounded-2xl border border-purple-500/20 bg-purple-950/15 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <span className="text-lg">✨</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Infinity Copilot</p>
                      <p className="text-white/40 text-xs">AI-powered answer about "{submitted}"</p>
                    </div>
                  </div>
                  {aiLoading ? (
                    <div className="space-y-3 animate-pulse">
                      {[100,88,75,90,60].map((w,i) => <div key={i} className="h-3 bg-purple-400/15 rounded-full" style={{width:`${w}%`}} />)}
                    </div>
                  ) : aiResponse ? (
                    <div className="prose prose-invert prose-sm max-w-none text-white/85 prose-headings:text-purple-300 prose-strong:text-white prose-a:text-blue-400">
                      <ReactMarkdown>{aiResponse}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-white/40">Ask me anything about "{submitted}"</p>
                  )}
                </div>
              </div>
            )}

            {/* ══ Other tabs ══ */}
            {hasResults && !["ALL","IMAGES","VIDEOS","MAPS","NEWS","COPILOT","SEARCH"].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-white/30 text-base">{activeTab} results are not available in this mode.</p>
                <button onClick={() => setActiveTab("ALL")} className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-full text-sm font-medium transition-colors">
                  Back to All results
                </button>
              </div>
            )}

            {/* SEARCH tab = same as ALL */}
            {hasResults && activeTab === "SEARCH" && (
              <div className="max-w-2xl space-y-7">
                {webResults.map((r, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm">{r.favicon}</span>
                      <span className="text-white/40 text-xs truncate">{r.displayUrl}</span>
                    </div>
                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 hover:underline text-[18px] font-medium block">
                      {r.title}
                    </a>
                    <p className="text-white/55 text-sm mt-1 leading-relaxed">{r.description}</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
