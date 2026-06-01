import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileDown,
  Loader2,
  Sparkles,
  LayoutTemplate,
} from "lucide-react";
import AnoAI from "@/components/ui/animated-shader-background";
import { motion, AnimatePresence } from "framer-motion";
import pptxgen from "pptxgenjs";

export default function PptCreator() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"ai" | "template">("ai");

  const handleGeneratePptAI = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setMessage("Generating content (this may take a moment)...");
    try {
      const baseUrl = import.meta.env.VITE_PYTHON_API_URL || "";
      const res = await fetch(`${baseUrl}/api/generate_ppt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Backend server is unreachable. Please ensure your Python backend is running!",
        );
      }

      const data = await res.json();

      if (res.ok && data.slides) {
        setMessage("Building Presentation...");
        const pres = new pptxgen();
        pres.layout = "LAYOUT_16x9";

        interface ThemeColors {
          primary: string;
          secondary: string;
          background: string;
          text: string;
          accent: string;
        }

        const themeMap: Record<string, ThemeColors> = {
          "Modern Blue": {
            primary: "0B3C5D",
            secondary: "328CC1",
            background: "F9F9F9",
            text: "1D2731",
            accent: "D9B310",
          },
          "Forest Green": {
            primary: "1E4620",
            secondary: "4E704F",
            background: "F4F6F4",
            text: "2C3531",
            accent: "D1A153",
          },
          "Dark Mode Minimalist": {
            primary: "111111",
            secondary: "333333",
            background: "1A1A1A",
            text: "EEEEEE",
            accent: "E28413",
          },
          "Warm Terracotta": {
            primary: "8D3B1B",
            secondary: "D07A5E",
            background: "FAF6F2",
            text: "2C1A11",
            accent: "CBB0A3",
          },
          "Vibrant Sunset": {
            primary: "D32E5E",
            secondary: "F36D4B",
            background: "FCF5F3",
            text: "2C1118",
            accent: "F9C03D",
          },
        };

        const getThemeColors = (themeName: string): ThemeColors => {
          const norm = (themeName || "").toLowerCase();
          if (norm.includes("forest") || norm.includes("green"))
            return themeMap["Forest Green"];
          if (norm.includes("dark") || norm.includes("minimal"))
            return themeMap["Dark Mode Minimalist"];
          if (norm.includes("warm") || norm.includes("terracotta"))
            return themeMap["Warm Terracotta"];
          if (norm.includes("vibrant") || norm.includes("sunset"))
            return themeMap["Vibrant Sunset"];
          return themeMap["Modern Blue"];
        };

        const colors = getThemeColors(data.theme);
        const fileName = (data.presentationTitle || topic).trim()
          ? `${(data.presentationTitle || topic).replace(/\s+/g, "_")}.pptx`
          : "Presentation.pptx";

        data.slides.forEach((slideData: any) => {
          const slide = pres.addSlide();
          const isDarkBackground =
            slideData.type === "Title Slide" ||
            slideData.type === "Conclusion Slide";
          slide.background = {
            fill: isDarkBackground ? colors.primary : colors.background,
          };

          if (slideData.speakerNotes) {
            slide.addNotes(slideData.speakerNotes);
          }

          if (slideData.type === "Title Slide") {
            slide.addShape(pres.ShapeType.rect, {
              x: 0.5,
              y: 3.5,
              w: 12.33,
              h: 0.05,
              fill: { color: colors.accent },
            });

            slide.addText(slideData.title, {
              x: 1.0,
              y: 1.8,
              w: 11.33,
              h: 1.5,
              fontSize: 44,
              bold: true,
              align: "center",
              color: "FFFFFF",
              fontFace: "Trebuchet MS",
            });
            if (slideData.subtitle) {
              slide.addText(slideData.subtitle, {
                x: 1.0,
                y: 3.8,
                w: 11.33,
                h: 0.8,
                fontSize: 22,
                align: "center",
                color: colors.accent,
                fontFace: "Calibri",
              });
            }
          } else if (slideData.type === "Conclusion Slide") {
            slide.addShape(pres.ShapeType.rect, {
              x: 0.5,
              y: 3.5,
              w: 12.33,
              h: 0.05,
              fill: { color: colors.accent },
            });

            slide.addText(slideData.title, {
              x: 1.0,
              y: 2.0,
              w: 11.33,
              h: 1.2,
              fontSize: 40,
              bold: true,
              align: "center",
              color: "FFFFFF",
              fontFace: "Trebuchet MS",
            });
            if (slideData.content && slideData.content.length > 0) {
              const bullets = slideData.content.map((b: string) => ({
                text: b,
                options: { bullet: true, breakLine: true },
              }));
              slide.addText(bullets, {
                x: 2.0,
                y: 3.8,
                w: 9.33,
                h: 2.5,
                fontSize: 18,
                align: "center",
                color: "FFFFFF",
                fontFace: "Calibri",
              });
            }
          } else {
            slide.addText(slideData.title, {
              x: 0.8,
              y: 0.5,
              w: 11.73,
              h: 0.8,
              fontSize: 28,
              bold: true,
              color: colors.primary,
              fontFace: "Trebuchet MS",
            });

            if (slideData.subtitle) {
              slide.addText(slideData.subtitle.toUpperCase(), {
                x: 0.8,
                y: 0.25,
                w: 11.73,
                h: 0.3,
                fontSize: 11,
                bold: true,
                color: colors.accent,
                fontFace: "Calibri",
              });
            }

            slide.addShape(pres.ShapeType.line, {
              x: 0.8,
              y: 1.3,
              w: 11.73,
              h: 0.01,
              line: { color: colors.secondary, width: 1 },
            });

            const layoutType = slideData.type;

            if (layoutType === "Two Column") {
              const halfIndex = Math.ceil(slideData.content.length / 2);
              const leftBullets = slideData.content
                .slice(0, halfIndex)
                .map((b: string) => ({
                  text: b,
                  options: { bullet: true, breakLine: true },
                }));
              const rightBullets = slideData.content
                .slice(halfIndex)
                .map((b: string) => ({
                  text: b,
                  options: { bullet: true, breakLine: true },
                }));

              slide.addText(leftBullets, {
                x: 0.8,
                y: 1.8,
                w: 5.5,
                h: 4.8,
                fontSize: 15,
                color: colors.text,
                fontFace: "Calibri",
                valign: "top",
                lineSpacing: 24,
              });
              slide.addText(rightBullets, {
                x: 7.0,
                y: 1.8,
                w: 5.5,
                h: 4.8,
                fontSize: 15,
                color: colors.text,
                fontFace: "Calibri",
                valign: "top",
                lineSpacing: 24,
              });
            } else if (layoutType === "Image Left") {
              slide.addShape(pres.ShapeType.rect, {
                x: 0.8,
                y: 1.8,
                w: 5.2,
                h: 4.8,
                fill: {
                  color: colors.background === "F9F9F9" ? "EDEDED" : "EAEAEA",
                },
                line: { color: colors.secondary, width: 1.5 },
              });
              slide.addText(
                `Visual Concept:\n\n"${slideData.imagePrompt || "Recommended visual representing " + slideData.title}"`,
                {
                  x: 1.0,
                  y: 2.2,
                  w: 4.8,
                  h: 4.0,
                  fontSize: 13,
                  color: colors.text,
                  fontFace: "Calibri",
                  italic: true,
                  align: "center",
                  valign: "middle",
                },
              );

              if (slideData.content && slideData.content.length > 0) {
                const bullets = slideData.content.map((b: string) => ({
                  text: b,
                  options: { bullet: true, breakLine: true },
                }));
                slide.addText(bullets, {
                  x: 6.6,
                  y: 1.8,
                  w: 5.9,
                  h: 4.8,
                  fontSize: 15,
                  color: colors.text,
                  fontFace: "Calibri",
                  valign: "top",
                  lineSpacing: 24,
                });
              }
            } else if (layoutType === "Image Right") {
              if (slideData.content && slideData.content.length > 0) {
                const bullets = slideData.content.map((b: string) => ({
                  text: b,
                  options: { bullet: true, breakLine: true },
                }));
                slide.addText(bullets, {
                  x: 0.8,
                  y: 1.8,
                  w: 5.9,
                  h: 4.8,
                  fontSize: 15,
                  color: colors.text,
                  fontFace: "Calibri",
                  valign: "top",
                  lineSpacing: 24,
                });
              }

              slide.addShape(pres.ShapeType.rect, {
                x: 7.3,
                y: 1.8,
                w: 5.2,
                h: 4.8,
                fill: {
                  color: colors.background === "F9F9F9" ? "EDEDED" : "EAEAEA",
                },
                line: { color: colors.secondary, width: 1.5 },
              });
              slide.addText(
                `Visual Concept:\n\n"${slideData.imagePrompt || "Recommended visual representing " + slideData.title}"`,
                {
                  x: 7.5,
                  y: 2.2,
                  w: 4.8,
                  h: 4.0,
                  fontSize: 13,
                  color: colors.text,
                  fontFace: "Calibri",
                  italic: true,
                  align: "center",
                  valign: "middle",
                },
              );
            } else if (layoutType === "Comparison") {
              const halfIndex = Math.ceil(slideData.content.length / 2);
              const leftBullets = slideData.content
                .slice(0, halfIndex)
                .map((b: string) => ({
                  text: b,
                  options: { bullet: true, breakLine: true },
                }));
              const rightBullets = slideData.content
                .slice(halfIndex)
                .map((b: string) => ({
                  text: b,
                  options: { bullet: true, breakLine: true },
                }));

              slide.addShape(pres.ShapeType.rect, {
                x: 0.8,
                y: 1.8,
                w: 5.5,
                h: 4.8,
                fill: { color: "FFFFFF" },
                line: { color: colors.secondary, width: 1 },
              });
              slide.addText(leftBullets, {
                x: 1.0,
                y: 2.0,
                w: 5.1,
                h: 4.4,
                fontSize: 15,
                color: colors.text,
                fontFace: "Calibri",
                valign: "top",
                lineSpacing: 24,
              });

              slide.addShape(pres.ShapeType.rect, {
                x: 7.0,
                y: 1.8,
                w: 5.5,
                h: 4.8,
                fill: { color: "FFFFFF" },
                line: { color: colors.accent, width: 1 },
              });
              slide.addText(rightBullets, {
                x: 7.2,
                y: 2.0,
                w: 5.1,
                h: 4.4,
                fontSize: 15,
                color: colors.text,
                fontFace: "Calibri",
                valign: "top",
                lineSpacing: 24,
              });
            } else if (layoutType === "Timeline") {
              slide.addShape(pres.ShapeType.line, {
                x: 0.8,
                y: 4.0,
                w: 11.73,
                h: 0,
                line: { color: colors.secondary, width: 3 },
              });

              const stepCount = slideData.content.length;
              const stepW = 11.73 / (stepCount || 1);

              slideData.content.forEach((stepText: string, idx: number) => {
                const stepX = 0.8 + idx * stepW + 0.15;
                const stepBoxW = stepW - 0.3;
                const isOdd = idx % 2 === 0;
                const stepY = isOdd ? 2.0 : 4.4;
                const stepH = 1.8;

                slide.addShape(pres.ShapeType.ellipse, {
                  x: 0.8 + idx * stepW + stepW / 2 - 0.125,
                  y: 3.875,
                  w: 0.25,
                  h: 0.25,
                  fill: { color: colors.accent },
                });

                slide.addShape(pres.ShapeType.line, {
                  x: 0.8 + idx * stepW + stepW / 2,
                  y: isOdd ? 3.5 : 4.0,
                  w: 0,
                  h: 0.5,
                  line: { color: colors.accent, width: 1, dashType: "dash" },
                });

                slide.addShape(pres.ShapeType.rect, {
                  x: stepX,
                  y: stepY,
                  w: stepBoxW,
                  h: stepH,
                  fill: { color: "FFFFFF" },
                  line: { color: colors.secondary, width: 1 },
                });

                slide.addText(`Step ${idx + 1}`, {
                  x: stepX + 0.05,
                  y: stepY + 0.1,
                  w: stepBoxW - 0.1,
                  h: 0.3,
                  fontSize: 12,
                  bold: true,
                  color: colors.primary,
                  fontFace: "Trebuchet MS",
                  align: "center",
                });

                slide.addText(stepText, {
                  x: stepX + 0.05,
                  y: stepY + 0.45,
                  w: stepBoxW - 0.1,
                  h: stepH - 0.55,
                  fontSize: 10,
                  color: colors.text,
                  fontFace: "Calibri",
                  align: "center",
                  valign: "top",
                });
              });
            } else if (layoutType === "Chart Slide") {
              if (slideData.content && slideData.content.length > 0) {
                const bullets = slideData.content.map((b: string) => ({
                  text: b,
                  options: { bullet: true, breakLine: true },
                }));
                slide.addText(bullets, {
                  x: 0.8,
                  y: 1.8,
                  w: 5.5,
                  h: 4.8,
                  fontSize: 15,
                  color: colors.text,
                  fontFace: "Calibri",
                  valign: "top",
                  lineSpacing: 24,
                });
              }

              const chartX = 7.0;
              const chartY = 1.8;
              const chartW = 5.5;
              const chartH = 4.8;
              const chartType = (slideData.chartType || "bar").toLowerCase();

              const labels = [
                "Category A",
                "Category B",
                "Category C",
                "Category D",
              ];
              const values = [30, 50, 20, 70];

              const chartData = [
                {
                  name: slideData.title,
                  labels: labels,
                  values: values,
                },
              ];

              try {
                let pptxChartType = pres.ChartType.bar;
                if (chartType === "line") pptxChartType = pres.ChartType.line;
                else if (chartType === "pie") pptxChartType = pres.ChartType.pie;
                else if (chartType === "doughnut")
                  pptxChartType = pres.ChartType.doughnut;

                slide.addChart(pptxChartType, chartData, {
                  x: chartX,
                  y: chartY,
                  w: chartW,
                  h: chartH,
                  showLegend: true,
                  legendPos: "b",
                });
              } catch (chartErr) {
                console.error("Error drawing native chart:", chartErr);
                slide.addShape(pres.ShapeType.rect, {
                  x: chartX,
                  y: chartY,
                  w: chartW,
                  h: chartH,
                  fill: { color: "FFFFFF" },
                  line: { color: colors.secondary, width: 1.5 },
                });
                slide.addText(
                  `[Interactive ${chartType.toUpperCase()} Chart]\n\nVisual representation of data.`,
                  {
                    x: chartX + 0.2,
                    y: chartY + 2.0,
                    w: chartW - 0.4,
                    h: 1.0,
                    fontSize: 14,
                    color: colors.text,
                    fontFace: "Calibri",
                    align: "center",
                    valign: "middle",
                  },
                );
              }
            } else {
              if (slideData.content && slideData.content.length > 0) {
                const bullets = slideData.content.map((b: string) => ({
                  text: b,
                  options: { bullet: true, breakLine: true },
                }));
                slide.addText(bullets, {
                  x: 0.8,
                  y: 1.8,
                  w: 11.73,
                  h: 4.8,
                  fontSize: 16,
                  color: colors.text,
                  fontFace: "Calibri",
                  valign: "top",
                  lineSpacing: 28,
                });
              }
            }
          }
        });

        await pres.writeFile({ fileName });
        setMessage("Presentation Downloaded successfully!");
      } else {
        setMessage("Error: " + (data.detail || "Failed to generate"));
      }
    } catch (err: any) {
      setMessage("Error Connecting: " + err.message);
    }
    setLoading(false);
  };

  const handleGenerateTemplate = async () => {
    setLoading(true);
    setMessage("Building Template...");
    try {
      const pres = new pptxgen();

      // Title Slide
      const titleSlide = pres.addSlide();
      const presentationTitle = topic.trim()
        ? topic.toUpperCase()
        : "My Presentation";
      titleSlide.addText(presentationTitle, {
        x: 1,
        y: 2,
        w: 8,
        h: 1,
        fontSize: 36,
        bold: true,
        align: "center",
      });
      titleSlide.addText("Starter Template", {
        x: 1,
        y: 3,
        w: 8,
        h: 1,
        fontSize: 18,
        align: "center",
        color: "888888",
      });

      // Content Slide 1
      const slide1 = pres.addSlide();
      slide1.addText("Introduction", {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: 28,
        bold: true,
      });
      slide1.addText(
        [
          { text: "Point 1", options: { bullet: true, breakLine: true } },
          { text: "Point 2", options: { bullet: true, breakLine: true } },
        ],
        { x: 0.5, y: 1.8, w: 9, h: 3.5, fontSize: 18, valign: "top" },
      );

      // Content Slide 2
      const slide2 = pres.addSlide();
      slide2.addText("Details", {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: 28,
        bold: true,
      });
      slide2.addText(
        [
          {
            text: "Add your details here...",
            options: { bullet: true, breakLine: true },
          },
        ],
        { x: 0.5, y: 1.8, w: 9, h: 3.5, fontSize: 18, valign: "top" },
      );

      const fileName = topic.trim()
        ? `${topic.replace(/\s+/g, "_")}.pptx`
        : "Presentation.pptx";
      await pres.writeFile({ fileName });
      setMessage("Template Downloaded successfully!");
    } catch (err: any) {
      setMessage("Error Generating PPT: " + err.message);
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
              onClick={() => navigate("/create")}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              PPT Creator
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
              className="w-full max-w-2xl bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md text-center shadow-2xl"
            >
              <div className="flex bg-black/40 p-1 rounded-2xl mb-8">
                <button
                  onClick={() => {
                    setMode("ai");
                    setMessage("");
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${mode === "ai" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white/80 hover:bg-white/5"}`}
                >
                  <Sparkles className="w-4 h-4" /> AI Generate
                </button>
                <button
                  onClick={() => {
                    setMode("template");
                    setMessage("");
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${mode === "template" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white/80 hover:bg-white/5"}`}
                >
                  <LayoutTemplate className="w-4 h-4" /> Starter Template
                </button>
              </div>

              {mode === "ai" ? (
                <>
                  <h2 className="text-3xl font-bold mb-4">AI PPT Creator</h2>
                  <p className="text-white/60 mb-8">
                    Provide a topic and let AI structure the slides for you!
                  </p>
                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter a topic (e.g. The Future of AI)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />

                    <button
                      onClick={handleGeneratePptAI}
                      disabled={loading || !topic.trim()}
                      className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                      {loading ? "Processing..." : "Generate & Download PPT"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-4">Starter Template</h2>
                  <p className="text-white/60 mb-8">
                    Generate a starter presentation locally. Provide an optional
                    topic to customize the title!
                  </p>
                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter a topic (Optional, e.g. Quarterly Review)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />

                    <button
                      onClick={handleGenerateTemplate}
                      disabled={loading}
                      className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <FileDown className="w-5 h-5" />
                      )}
                      {loading ? "Building..." : "Download Starter Template"}
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
