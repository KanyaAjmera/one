import PptxGenJS from 'pptxgenjs';
import path from 'path';
import fs from 'fs';

const themeMap = {
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

const getThemeColors = (themeName) => {
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

// Safely extract string content from any data returned by the AI model
const ensureString = (val) => {
  if (val === null || val === undefined) return "";
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    if (val.text) return String(val.text);
    if (val.point) return String(val.point);
    if (val.content) return String(val.content);
    return JSON.stringify(val);
  }
  return String(val);
};

export const generatePPTFile = async (data, uploadDir, filename) => {
  try {
    const pres = new PptxGenJS();
    pres.layout = "LAYOUT_16x9";

    const colors = getThemeColors(data.theme);
    const slidesData = data.slides || [];

    slidesData.forEach((slideData) => {
      const slide = pres.addSlide();
      const isDarkBackground =
        slideData.type === "Title Slide" ||
        slideData.type === "Conclusion Slide";

      slide.background = {
        fill: isDarkBackground ? colors.primary : colors.background,
      };

      if (slideData.speakerNotes) {
        slide.addNotes(ensureString(slideData.speakerNotes));
      }

      if (slideData.type === "Title Slide") {
        // Draw Accent Line
        slide.addShape(pres.ShapeType.rect, {
          x: 0.5,
          y: 3.5,
          w: 12.33,
          h: 0.05,
          fill: { color: colors.accent },
        });

        // Add Title
        slide.addText(ensureString(slideData.title || "Untitled Presentation"), {
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

        // Add Subtitle
        if (slideData.subtitle) {
          slide.addText(ensureString(slideData.subtitle), {
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

        slide.addText(ensureString(slideData.title || "Conclusion"), {
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
          const bullets = slideData.content.map((b) => ({
            text: ensureString(b),
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
        // Content Slides
        // Title
        slide.addText(ensureString(slideData.title || "Content Slide"), {
          x: 0.8,
          y: 0.5,
          w: 11.73,
          h: 0.8,
          fontSize: 28,
          bold: true,
          color: colors.primary,
          fontFace: "Trebuchet MS",
        });

        // Subtitle (if present)
        if (slideData.subtitle) {
          slide.addText(ensureString(slideData.subtitle).toUpperCase(), {
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

        // Horizontal Line divider
        slide.addShape(pres.ShapeType.line, {
          x: 0.8,
          y: 1.3,
          w: 11.73,
          h: 0.01,
          line: { color: colors.secondary, width: 1 },
        });

        const layoutType = slideData.type;

        if (layoutType === "Two Column") {
          const halfIndex = Math.ceil((slideData.content || []).length / 2);
          const leftBullets = (slideData.content || [])
            .slice(0, halfIndex)
            .map((b) => ({
              text: ensureString(b),
              options: { bullet: true, breakLine: true },
            }));
          const rightBullets = (slideData.content || [])
            .slice(halfIndex)
            .map((b) => ({
              text: ensureString(b),
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
          // Concept Image Box
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
            `Visual Concept:\n\n"${ensureString(slideData.imagePrompt || "Recommended visual representing " + slideData.title)}"`,
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
            }
          );

          if (slideData.content && slideData.content.length > 0) {
            const bullets = slideData.content.map((b) => ({
              text: ensureString(b),
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
            const bullets = slideData.content.map((b) => ({
              text: ensureString(b),
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
            `Visual Concept:\n\n"${ensureString(slideData.imagePrompt || "Recommended visual representing " + slideData.title)}"`,
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
            }
          );
        } else if (layoutType === "Comparison") {
          const halfIndex = Math.ceil((slideData.content || []).length / 2);
          const leftBullets = (slideData.content || [])
            .slice(0, halfIndex)
            .map((b) => ({
              text: ensureString(b),
              options: { bullet: true, breakLine: true },
            }));
          const rightBullets = (slideData.content || [])
            .slice(halfIndex)
            .map((b) => ({
              text: ensureString(b),
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

          const stepCount = (slideData.content || []).length;
          const stepW = 11.73 / (stepCount || 1);

          (slideData.content || []).forEach((stepText, idx) => {
            const stepX = 0.8 + idx * stepW + 0.15;
            const stepBoxW = stepW - 0.3;
            const isOdd = idx % 2 === 0;
            const stepY = isOdd ? 2.0 : 4.4;
            const stepH = 1.8;

            // Dot on line
            slide.addShape(pres.ShapeType.ellipse, {
              x: 0.8 + idx * stepW + stepW / 2 - 0.125,
              y: 3.875,
              w: 0.25,
              h: 0.25,
              fill: { color: colors.accent },
            });

            // Connector line
            slide.addShape(pres.ShapeType.line, {
              x: 0.8 + idx * stepW + stepW / 2,
              y: isOdd ? 3.5 : 4.0,
              w: 0,
              h: 0.5,
              line: { color: colors.accent, width: 1, dashType: "dash" },
            });

            // Text box card
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

            slide.addText(ensureString(stepText), {
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
            const bullets = slideData.content.map((b) => ({
              text: ensureString(b),
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

          const labels = ["Category A", "Category B", "Category C", "Category D"];
          const values = [30, 50, 20, 70];

          const chartData = [
            {
              name: ensureString(slideData.title),
              labels: labels,
              values: values,
            },
          ];

          try {
            let pptxChartType = pres.ChartType.bar;
            if (chartType === "line") pptxChartType = pres.ChartType.line;
            else if (chartType === "pie") pptxChartType = pres.ChartType.pie;
            else if (chartType === "doughnut") pptxChartType = pres.ChartType.doughnut;

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
            // Draw Fallback Box
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
              }
            );
          }
        } else {
          // Default Content Layout
          if (slideData.content && slideData.content.length > 0) {
            const bullets = slideData.content.map((b) => ({
              text: ensureString(b),
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

    const filePath = path.join(uploadDir, filename);
    await pres.writeFile({ fileName: filePath });
    return filePath;
  } catch (error) {
    console.error("PPT Generation Service error:", error);
    throw error;
  }
};
