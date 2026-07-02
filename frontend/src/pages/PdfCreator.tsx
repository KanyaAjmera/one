import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileDown, Loader2, UploadCloud, X, Sparkles, Image as ImageIcon } from 'lucide-react';
import AnoAI from '@/components/ui/animated-shader-background';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { PYTHON_API_URL } from '@/config';

export default function PdfCreator() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'ai' | 'images'>('ai');
  const [topic, setTopic] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            setImages(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const getImageDimensions = (src: string): Promise<{ width: number, height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = src;
    });
  };

  const handleGeneratePdfAI = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setMessage("Generating content (this may take a moment)...");
    try {
      const res = await fetch(`${PYTHON_API_URL}/api/generate_pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend server is unreachable. Please ensure your Python backend is running!");
      }

      const data = await res.json();
      
      if (res.ok && data.documentTitle) {
        setMessage("Creating PDF...");
        const doc = new jsPDF();

        interface ThemeColors {
          primary: string;
          secondary: string;
          background: string;
          text: string;
          accent: string;
        }

        const themeMap: Record<string, ThemeColors> = {
          "Modern Blue": {
            primary: "#0B3C5D",
            secondary: "#328CC1",
            background: "#F9F9F9",
            text: "#1D2731",
            accent: "#D9B310"
          },
          "Forest Green": {
            primary: "#1E4620",
            secondary: "#4E704F",
            background: "#F4F6F4",
            text: "#2C3531",
            accent: "#D1A153"
          },
          "Dark Mode Minimalist": {
            primary: "#111111",
            secondary: "#444444",
            background: "#FAFAFA",
            text: "#222222",
            accent: "#E28413"
          },
          "Warm Terracotta": {
            primary: "#8D3B1B",
            secondary: "#D07A5E",
            background: "#FAF6F2",
            text: "#2C1A11",
            accent: "#CBB0A3"
          },
          "Vibrant Sunset": {
            primary: "#D32E5E",
            secondary: "#F36D4B",
            background: "#FCF5F3",
            text: "#2C1118",
            accent: "#F9C03D"
          }
        };

        const getThemeColors = (themeName: string): ThemeColors => {
          const norm = (themeName || "").toLowerCase();
          if (norm.includes("forest") || norm.includes("green")) return themeMap["Forest Green"];
          if (norm.includes("dark") || norm.includes("minimal")) return themeMap["Dark Mode Minimalist"];
          if (norm.includes("warm") || norm.includes("terracotta")) return themeMap["Warm Terracotta"];
          if (norm.includes("vibrant") || norm.includes("sunset")) return themeMap["Vibrant Sunset"];
          return themeMap["Modern Blue"];
        };

        const colors = getThemeColors(data.theme);
        let pageNum = 1;

        const addPageDecoration = (doc: jsPDF, title: string, colors: ThemeColors, page: number) => {
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor("#888888");
          doc.text(`Infinity AI Document Suite  |  ${title}`, 20, 12);
          doc.setDrawColor(colors.secondary);
          doc.setLineWidth(0.5);
          doc.line(20, 14, 190, 14);
          doc.text(`Page ${page}`, 95, 287, { align: "center" });
        };

        const writeTextWrapped = (text: string, x: number, y: number, width: number, lineHeight: number): number => {
          const lines = doc.splitTextToSize(text, width);
          lines.forEach((line: string) => {
            doc.text(line, x, y);
            y += lineHeight;
          });
          return y;
        };

        const writeParagraph = (text: string, x: number, y: number, width: number, lineHeight: number): number => {
          const lines = doc.splitTextToSize(text, width);
          lines.forEach((line: string) => {
            if (y > 265) {
              doc.addPage();
              pageNum++;
              y = 30;
              addPageDecoration(doc, data.documentTitle, colors, pageNum);
              doc.setFont("Helvetica", "normal");
              doc.setFontSize(10);
              doc.setTextColor("#333333");
            }
            doc.text(line, x, y);
            y += lineHeight;
          });
          return y;
        };

        // 1. Cover Page
        doc.setFillColor(colors.primary);
        doc.rect(0, 0, 210, 80, "F");
        
        doc.setFillColor(colors.accent);
        doc.rect(0, 80, 210, 5, "F");
        
        doc.setTextColor("#FFFFFF");
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(26);
        doc.text(data.documentTitle.toUpperCase(), 105, 45, { align: "center" });
        
        doc.setTextColor(colors.primary);
        doc.setFontSize(16);
        doc.setFont("Helvetica", "bold");
        doc.text(data.documentType || "Research Document", 105, 120, { align: "center" });
        
        doc.setTextColor("#666666");
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Generated Automatically by Project Infinity", 105, 135, { align: "center" });
        
        doc.setDrawColor(colors.secondary);
        doc.setLineWidth(0.5);
        doc.line(40, 150, 170, 150);

        // 2. TOC & Executive Summary
        doc.addPage();
        pageNum++;
        addPageDecoration(doc, data.documentTitle, colors, pageNum);
        
        let cursorY = 30;
        doc.setTextColor(colors.primary);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(14);
        doc.text("EXECUTIVE SUMMARY", 20, cursorY);
        cursorY += 10;
        
        doc.setTextColor("#333333");
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        cursorY = writeTextWrapped(data.executiveSummary || "", 20, cursorY, 170, 6) + 12;
        
        doc.setTextColor(colors.primary);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(14);
        doc.text("TABLE OF CONTENTS", 20, cursorY);
        cursorY += 10;
        
        doc.setTextColor("#444444");
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        
        let sectionStartPage = 3;
        (data.tableOfContents || []).forEach((item: string) => {
          doc.text(item, 20, cursorY);
          doc.text(" . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .", 80, cursorY);
          doc.text(`Page ${sectionStartPage}`, 180, cursorY);
          cursorY += 8;
          sectionStartPage++;
        });

        // 3. Sections
        data.sections.forEach((section: any) => {
          doc.addPage();
          pageNum++;
          cursorY = 30;
          addPageDecoration(doc, data.documentTitle, colors, pageNum);
          
          doc.setTextColor(colors.primary);
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(16);
          doc.text(section.sectionTitle, 20, cursorY);
          cursorY += 5;
          doc.setDrawColor(colors.primary);
          doc.setLineWidth(1);
          doc.line(20, cursorY, 190, cursorY);
          cursorY += 12;
          
          if (section.subsections && Array.isArray(section.subsections)) {
            section.subsections.forEach((sub: any) => {
              if (cursorY > 240) {
                doc.addPage();
                pageNum++;
                cursorY = 30;
                addPageDecoration(doc, data.documentTitle, colors, pageNum);
              }
              
              doc.setTextColor(colors.secondary);
              doc.setFont("Helvetica", "bold");
              doc.setFontSize(12);
              doc.text(sub.subsectionTitle, 20, cursorY);
              cursorY += 8;
              
              doc.setTextColor("#333333");
              doc.setFont("Helvetica", "normal");
              doc.setFontSize(10);
              
              if (sub.paragraphs && Array.isArray(sub.paragraphs)) {
                sub.paragraphs.forEach((pText: string) => {
                  cursorY = writeParagraph(pText, 20, cursorY, 170, 5) + 6;
                });
              }
              
              if (sub.table && sub.table.headers && sub.table.rows) {
                const tableHeightEstimate = 10 + (sub.table.rows.length * 8);
                if (cursorY + tableHeightEstimate > 260) {
                  doc.addPage();
                  pageNum++;
                  cursorY = 30;
                  addPageDecoration(doc, data.documentTitle, colors, pageNum);
                }
                
                doc.setFillColor(colors.primary);
                doc.rect(20, cursorY, 170, 8, "F");
                doc.setTextColor("#FFFFFF");
                doc.setFont("Helvetica", "bold");
                doc.setFontSize(9);
                
                const colWidth = 170 / sub.table.headers.length;
                sub.table.headers.forEach((h: string, i: number) => {
                  doc.text(h, 22 + (i * colWidth), cursorY + 5.5);
                });
                
                cursorY += 8;
                
                doc.setTextColor("#333333");
                doc.setFont("Helvetica", "normal");
                
                sub.table.rows.forEach((row: string[], rIdx: number) => {
                  if (rIdx % 2 === 1) {
                    doc.setFillColor("#F2F4F7");
                    doc.rect(20, cursorY, 170, 7, "F");
                  }
                  row.forEach((cellVal: string, cIdx: number) => {
                    doc.text(cellVal || "", 22 + (cIdx * colWidth), cursorY + 5);
                  });
                  
                  doc.setDrawColor("#E2E8F0");
                  doc.setLineWidth(0.3);
                  doc.line(20, cursorY + 7, 190, cursorY + 7);
                  
                  cursorY += 7;
                });
                cursorY += 8;
              }
              
              if (sub.chart && sub.chart.data && sub.chart.type) {
                const chartHeightEstimate = 55;
                if (cursorY + chartHeightEstimate > 260) {
                  doc.addPage();
                  pageNum++;
                  cursorY = 30;
                  addPageDecoration(doc, data.documentTitle, colors, pageNum);
                }
                
                doc.setFillColor("#FAFAFA");
                doc.rect(20, cursorY, 170, 45, "F");
                doc.setDrawColor("#E2E8F0");
                doc.setLineWidth(0.5);
                doc.rect(20, cursorY, 170, 45, "D");
                
                doc.setDrawColor("#888888");
                doc.line(35, cursorY + 38, 175, cursorY + 38);
                doc.line(35, cursorY + 8, 35, cursorY + 38);
                
                const chartData = sub.chart.data;
                const barSpacing = 130 / (chartData.length || 1);
                
                doc.setFillColor(colors.secondary);
                doc.setFontSize(8);
                
                chartData.forEach((item: any, i: number) => {
                  const label = item.label || "";
                  const val = Number(item.value) || 0;
                  const barH = (val / 100) * 28;
                  
                  const barX = 42 + (i * barSpacing);
                  const barY = cursorY + 38 - barH;
                  const barW = Math.min(barSpacing - 10, 15);
                  
                  doc.rect(barX, barY, barW, barH, "F");
                  
                  doc.setTextColor("#555555");
                  doc.text(label.slice(0, 10), barX + (barW/2), cursorY + 41.5, { align: "center" });
                  doc.text(String(val), barX + (barW/2), barY - 1.5, { align: "center" });
                });
                
                cursorY += 50;
              }
            });
          }
        });

        // 4. References Page
        if (data.references && data.references.length > 0) {
          doc.addPage();
          pageNum++;
          cursorY = 30;
          addPageDecoration(doc, data.documentTitle, colors, pageNum);
          
          doc.setTextColor(colors.primary);
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(16);
          doc.text("REFERENCES", 20, cursorY);
          cursorY += 5;
          doc.setDrawColor(colors.primary);
          doc.setLineWidth(1);
          doc.line(20, cursorY, 190, cursorY);
          cursorY += 12;
          
          doc.setTextColor("#444444");
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(10);
          
          data.references.forEach((ref: string, rIdx: number) => {
            cursorY = writeParagraph(`[${rIdx + 1}]  ${ref}`, 20, cursorY, 170, 5) + 6;
          });
        }
        
        doc.save(`${(data.documentTitle || topic).replace(/\s+/g, '_')}.pdf`);
        setMessage("PDF Downloaded successfully!");
      } else {
        setMessage("Error: " + (data.detail || "Failed to generate"));
      }
    } catch (err: any) {
      setMessage("Error Connecting: " + err.message);
    }
    setLoading(false);
  };

  const handleGeneratePdfImages = async () => {
    if (images.length === 0) return;
    setLoading(true);
    setMessage("Creating PDF...");
    
    try {
      const doc = new jsPDF();
      
      for (let i = 0; i < images.length; i++) {
        if (i > 0) {
          doc.addPage();
        }
        
        const { width, height } = await getImageDimensions(images[i]);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        
        const imgRatio = width / height;
        
        let targetWidth = pdfWidth - 20; // 10 margin
        let targetHeight = targetWidth / imgRatio;
        
        if (targetHeight > pdfHeight - 20) {
            targetHeight = pdfHeight - 20;
            targetWidth = targetHeight * imgRatio;
        }

        const xPos = (pdfWidth - targetWidth) / 2;
        const yPos = (pdfHeight - targetHeight) / 2;
        
        let format = "JPEG";
        const match = images[i].match(/^data:image\/(png|jpeg|webp|jpg);base64,/);
        if (match && match[1]) {
            format = match[1].toUpperCase();
            if (format === 'JPG') format = 'JPEG';
        }
        
        doc.addImage(images[i], format, xPos, yPos, targetWidth, targetHeight);
      }
      
      doc.save(`Created_Images.pdf`);
      setMessage("PDF Downloaded successfully!");
    } catch (err: any) {
      setMessage("Error generating PDF: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen text-foreground font-sans overflow-x-hidden relative flex flex-col">
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
                PDF Creator
            </h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <AnimatePresence mode="wait">
                 <motion.div
                    key="content"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-3xl bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md text-center shadow-2xl"
                >
                    <div className="flex bg-black/40 p-1 rounded-2xl mb-8">
                      <button 
                        onClick={() => { setMode('ai'); setMessage(''); }}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${mode === 'ai' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
                      >
                        <Sparkles className="w-4 h-4" /> AI Generate
                      </button>
                      <button 
                        onClick={() => { setMode('images'); setMessage(''); }}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${mode === 'images' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
                      >
                        <ImageIcon className="w-4 h-4" /> From Images
                      </button>
                    </div>

                    {mode === 'ai' ? (
                      <>
                        <h2 className="text-3xl font-bold mb-4">AI PDF Creator</h2>
                        <p className="text-white/60 mb-8">
                            Provide a topic and let AI generate a detailed document!
                        </p>
                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Enter a topic (e.g. History of Space Exploration)"
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            
                            <button
                                onClick={handleGeneratePdfAI}
                                disabled={loading || !topic.trim()}
                                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5"/>}
                                {loading ? "Processing..." : "Generate & Download PDF"}
                            </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="text-3xl font-bold mb-4">Image to PDF Converter</h2>
                        <p className="text-white/60 mb-8">
                            Upload your images and convert them into a single PDF document locally.
                        </p>

                        <div className="flex flex-col gap-6">
                            
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-white/20 hover:border-blue-500/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all bg-white/5 hover:bg-white/10"
                            >
                                <UploadCloud className="w-12 h-12 text-white/60" />
                                <div>
                                    <p className="text-lg font-medium">Click to upload images</p>
                                    <p className="text-sm text-white/40">JPG, PNG supported</p>
                                </div>
                            </div>
                            
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {images.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4 bg-black/20 p-4 rounded-xl max-h-60 overflow-y-auto">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                                            <img src={img} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                                className="absolute top-1 right-1 bg-black/60 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 flex items-center justify-center"
                                            >
                                                <X className="w-4 h-4 text-white" />
                                            </button>
                                            <div className="absolute bottom-1 left-1 bg-black/60 px-2 py-0.5 rounded text-xs text-white">
                                                {idx + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <button
                                onClick={handleGeneratePdfImages}
                                disabled={loading || images.length === 0}
                                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <FileDown className="w-5 h-5"/>}
                                {loading ? "Processing..." : `Generate PDF from ${images.length} Image${images.length !== 1 ? 's' : ''}`}
                            </button>
                        </div>
                      </>
                    )}
                    
                    {message && (
                        <p className="text-sm mt-4 text-white/80">{message}</p>
                    )}
                 </motion.div>
            </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
