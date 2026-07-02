import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const themeMap = {
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

const getThemeColors = (themeName) => {
  const norm = (themeName || "").toLowerCase();
  if (norm.includes("forest") || norm.includes("green")) return themeMap["Forest Green"];
  if (norm.includes("dark") || norm.includes("minimal")) return themeMap["Dark Mode Minimalist"];
  if (norm.includes("warm") || norm.includes("terracotta")) return themeMap["Warm Terracotta"];
  if (norm.includes("vibrant") || norm.includes("sunset")) return themeMap["Vibrant Sunset"];
  return themeMap["Modern Blue"];
};

export const generatePDFFile = (data, uploadDir, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const colors = getThemeColors(data.theme);
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'LETTER',
        bufferPages: true // Essential to do footer page numbers at the end
      });

      const filePath = path.join(uploadDir, filename);
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // --- 1. COVER PAGE ---
      // Draw top primary color block
      doc.rect(0, 0, 612, 250).fill(colors.primary);
      // Draw accent bar below
      doc.rect(0, 250, 612, 12).fill(colors.accent);

      // Cover Page Title
      doc.fillColor('#FFFFFF')
         .font('Helvetica-Bold')
         .fontSize(28)
         .text((data.documentTitle || "UNTITLED DOCUMENT").toUpperCase(), 50, 100, {
           width: 512,
           align: 'center',
           lineGap: 4
         });

      // Cover Page Document Type
      doc.fillColor(colors.primary)
         .font('Helvetica-Bold')
         .fontSize(16)
         .text(data.documentType || "RESEARCH PAPER", 50, 320, {
           width: 512,
           align: 'center'
         });

      // Cover Page Subtitle
      doc.fillColor('#666666')
         .font('Helvetica')
         .fontSize(10)
         .text("Generated Automatically by Project Infinity", 50, 360, {
           width: 512,
           align: 'center'
         });

      // Subtle separator line
      doc.strokeColor(colors.secondary)
         .lineWidth(0.5)
         .moveTo(150, 420)
         .lineTo(462, 420)
         .stroke();

      // Setup page added event listener for page headers
      let pageNum = 1;
      doc.on('pageAdded', () => {
        pageNum++;
        // Draw Header
        doc.fontSize(9).fillColor('#888888').font('Helvetica').text(`Infinity AI Document Suite  |  ${data.documentTitle}`, 50, 30);
        doc.moveTo(50, 42).lineTo(562, 42).strokeColor(colors.secondary).lineWidth(0.5).stroke();
        
        // Reset cursor to top content area
        doc.y = 60;
      });

      // --- 2. EXECUTIVE SUMMARY & TOC ---
      doc.addPage(); // Triggers pageAdded, doc.y is set to 60
      
      doc.fillColor(colors.primary)
         .font('Helvetica-Bold')
         .fontSize(14)
         .text("EXECUTIVE SUMMARY", 50, doc.y);
      doc.moveDown(0.5);

      doc.fillColor(colors.text)
         .font('Helvetica')
         .fontSize(10)
         .text(data.executiveSummary || "", { align: 'justify', lineGap: 2 });
      doc.moveDown(2);

      const summaryY = doc.y;

      doc.fillColor(colors.primary)
         .font('Helvetica-Bold')
         .fontSize(14)
         .text("TABLE OF CONTENTS", 50, summaryY);
      doc.moveDown(0.8);

      let tocPageNum = 3;
      (data.tableOfContents || []).forEach((item) => {
         const currentY = doc.y;
         doc.fillColor(colors.text)
            .font('Helvetica')
            .fontSize(10)
            .text(item, 50, currentY);
         
         // Draw dot leaders
         doc.fillColor('#888888')
            .text(". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .", 220, currentY, { width: 300 });

         doc.fillColor(colors.text)
            .text(`Page ${tocPageNum}`, 520, currentY);
         doc.moveDown(0.5);
         tocPageNum++;
      });

      // --- 3. SECTIONS ---
      if (data.sections && Array.isArray(data.sections)) {
        data.sections.forEach((section) => {
          doc.addPage();
          
          doc.fillColor(colors.primary)
             .font('Helvetica-Bold')
             .fontSize(16)
             .text(section.sectionTitle, 50, doc.y);
          doc.moveDown(0.2);

          // Divider bar under Section Title
          doc.moveTo(50, doc.y)
             .lineTo(562, doc.y)
             .strokeColor(colors.primary)
             .lineWidth(1.5)
             .stroke();
          doc.moveDown(0.8);

          if (section.subsections && Array.isArray(section.subsections)) {
            section.subsections.forEach((sub) => {
              // Check page bounds before writing subsection title
              if (doc.y > 680) doc.addPage();

              doc.fillColor(colors.secondary)
                 .font('Helvetica-Bold')
                 .fontSize(12)
                 .text(sub.subsectionTitle);
              doc.moveDown(0.5);

              // Sub-paragraphs
              if (sub.paragraphs && Array.isArray(sub.paragraphs)) {
                sub.paragraphs.forEach((pText) => {
                  if (doc.y > 700) doc.addPage();
                  doc.fillColor(colors.text)
                     .font('Helvetica')
                     .fontSize(10)
                     .text(pText, { align: 'justify', lineGap: 2 });
                  doc.moveDown(0.8);
                });
              }

              // Sub-tables
              if (sub.table && sub.table.headers && sub.table.rows) {
                const rowCount = sub.table.rows.length;
                const estimatedTableHeight = 25 + (rowCount * 20) + 10;
                
                if (doc.y + estimatedTableHeight > 700) {
                  doc.addPage();
                }

                const startY = doc.y;
                const colWidth = 512 / sub.table.headers.length;

                // Draw Table Header
                doc.rect(50, startY, 512, 22).fill(colors.primary);
                doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
                sub.table.headers.forEach((h, i) => {
                  doc.text(h, 55 + (i * colWidth), startY + 6, { width: colWidth - 10, truncate: true });
                });

                let rowY = startY + 22;
                doc.font('Helvetica').fontSize(9);

                sub.table.rows.forEach((row, rowIndex) => {
                  // Alternating row colors
                  if (rowIndex % 2 === 1) {
                    doc.rect(50, rowY, 512, 20).fill('#F2F4F7');
                  } else {
                    doc.rect(50, rowY, 512, 20).fill('#FFFFFF');
                  }

                  doc.fillColor(colors.text);
                  row.forEach((cellVal, colIndex) => {
                    doc.text(String(cellVal || ""), 55 + (colIndex * colWidth), rowY + 5, { width: colWidth - 10, truncate: true });
                  });

                  // Row bottom border
                  doc.moveTo(50, rowY + 20)
                     .lineTo(562, rowY + 20)
                     .strokeColor('#E2E8F0')
                     .lineWidth(0.5)
                     .stroke();

                  rowY += 20;
                });

                doc.y = rowY + 10;
                doc.moveDown();
              }

              // Sub-charts (Drawn using PDFKit vector graphics!)
              if (sub.chart && sub.chart.data && Array.isArray(sub.chart.data)) {
                const estimatedChartHeight = 135;
                if (doc.y + estimatedChartHeight > 700) {
                  doc.addPage();
                }

                const chartY = doc.y;
                const chartH = 110;

                // Card Background
                doc.rect(50, chartY, 512, chartH).fill('#FAFAFA');
                doc.rect(50, chartY, 512, chartH).strokeColor('#E2E8F0').lineWidth(0.8).stroke();

                // Draw Axes
                doc.strokeColor('#888888').lineWidth(1);
                doc.moveTo(85, chartY + 15).lineTo(85, chartY + 90).stroke(); // Y Axis
                doc.moveTo(85, chartY + 90).lineTo(530, chartY + 90).stroke(); // X Axis

                const chartData = sub.chart.data;
                const barSpacing = 420 / (chartData.length || 1);

                doc.fontSize(8);
                chartData.forEach((item, idx) => {
                  const label = String(item.label || "");
                  const val = Number(item.value) || 0;
                  const barHeight = (val / 100) * 65; // Max height is 65 points

                  const barX = 100 + (idx * barSpacing);
                  const barY = chartY + 90 - barHeight;
                  const barWidth = Math.min(barSpacing - 15, 30);

                  // Draw Bar
                  doc.rect(barX, barY, barWidth, barHeight).fill(colors.secondary);

                  // Label and Value texts
                  doc.fillColor(colors.text)
                     .text(label.substring(0, 12), barX + (barWidth / 2) - 30, chartY + 94, { width: 60, align: 'center' });

                  doc.fillColor(colors.primary)
                     .text(String(val), barX + (barWidth / 2) - 15, barY - 10, { width: 30, align: 'center' });
                });

                doc.y = chartY + chartH + 10;
                doc.moveDown();
              }
            });
          }
        });
      }

      // --- 4. REFERENCES ---
      if (data.references && data.references.length > 0) {
        doc.addPage();
        
        doc.fillColor(colors.primary)
           .font('Helvetica-Bold')
           .fontSize(16)
           .text("REFERENCES", 50, doc.y);
        doc.moveDown(0.2);

        doc.moveTo(50, doc.y)
           .lineTo(562, doc.y)
           .strokeColor(colors.primary)
           .lineWidth(1.5)
           .stroke();
        doc.moveDown(0.8);

        doc.fillColor(colors.text)
           .font('Helvetica')
           .fontSize(10);
        
        data.references.forEach((ref, idx) => {
          if (doc.y > 700) doc.addPage();
          doc.text(`[${idx + 1}]  ${ref}`, { align: 'left', lineGap: 2 });
          doc.moveDown(0.6);
        });
      }

      // --- 5. PAGE NUMBER FOOTERS ---
      // Iterate over buffered pages to write footer page numbers
      const range = doc.bufferedPageRange();
      for (let i = 1; i < range.count; i++) { // Skip cover page (index 0)
        doc.switchToPage(i);
        doc.fontSize(8)
           .fillColor('#888888')
           .font('Helvetica')
           .text(`Page ${i + 1}`, 0, 755, { align: 'center', width: 612 });
      }

      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};
