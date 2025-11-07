import jsPDF from "jspdf";
import { dialog } from "../dialogService";

export class TestCasePdfGenerator {
  static generatePdf(testCaseData, projectName = "Project", filename = null) {
    if (!testCaseData || !Array.isArray(testCaseData) || testCaseData.length === 0) {
      dialog.alert({
        title: "No data available",
        message: "No test case data available to generate PDF report.",
        variant: "warning",
      });
      return;
    }

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      const accentColor = { r: 67, g: 56, b: 202 }; // Brighter Indigo/Violet
      const accentLight = { r: 147, g: 51, b: 234 }; // Lighter violet accent for highlights
      const lightAccent = { r: 238, g: 242, b: 255 }; // Light background for contrast
      const lightShadow = { r: 220, g: 220, b: 220 }; // Very light grey for card shadow
      const greyColor = { r: 100, g: 116, b: 139 }; // Slate grey for secondary text
      const successColor = { r: 34, g: 197, b: 94 }; // Green for positive metrics
      const warningColor = { r: 245, g: 158, b: 11 }; // Amber for durations/medians
      let y = 25;
      const lineHeight = 5; // Standard line spacing

      // Helper: Section title (Enhanced: Added subtle underline with accent color)
      const sectionTitle = (title) => {
        y += 5;
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
        doc.text(title, margin, y);
        y += 4;
        // Subtle underline
        doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
      };

      // Helper: Key-Value line (Enhanced: Optional color for values based on type)
      const drawKeyValue = (key, value, xOffset = 0, boldKey = true, valueColor = { r: 0, g: 0, b: 0 }) => {
        doc.setFontSize(10);
        
        // Key (Style based on boldKey)
        doc.setFont("helvetica", boldKey ? "bold" : "normal");
        doc.setTextColor(boldKey ? greyColor.r : 0, boldKey ? greyColor.g : 0, boldKey ? greyColor.b : 0);
        doc.text(key, margin + xOffset, y);
        
        // Calculate the exact width of the KEY text to position the VALUE accurately
        const keyWidth = doc.getStringUnitWidth(key) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        
        // Value (Custom color, Normal, positioned after key)
        doc.setFont("helvetica", "normal");
        doc.setTextColor(valueColor.r, valueColor.g, valueColor.b);
        doc.text(value, margin + xOffset + keyWidth + 2, y);
      };
      
      // Helper: Simple bar chart for priority distribution (New: Visual enhancement)
      const drawPriorityBar = (dist, startX, startY, barWidth = 40, barHeight = 4) => {
        const total = (dist.high || 0) + (dist.medium || 0) + (dist.low || 0);
        if (total === 0) return startY + 10;

        let barY = startY;
        const labels = ['High', 'Medium', 'Low'];
        const colors = [successColor, warningColor, greyColor];
        const values = [dist.high || 0, dist.medium || 0, dist.low || 0];

        labels.forEach((label, i) => {
          const val = values[i];
          const barLength = total > 0 ? (val / total) * barWidth : 0;
          if (barLength > 0) {
            // Draw bar
            doc.setFillColor(colors[i].r, colors[i].g, colors[i].b);
            doc.rect(startX, barY, barLength, barHeight, "F");
            // Label
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(255, 255, 255);
            doc.text(`${label}: ${val}`, startX + 2, barY + 3);
          }
          barY += barHeight + 1;
        });
        return barY + 5;
      };
      
      // Helper: New page check (Unchanged)
      const checkPage = (extra = 30) => {
        if (y + extra > pageHeight - 20) {
          doc.addPage();
          y = 25;
          doc.setFontSize(16);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
          doc.text("Test Case Generations (Continued)", margin, y);
          y += 10;
        }
      };

      // === COVER PAGE (New: Added a simple cover page for better professionalism) ===
      // Cover page content
      doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Test Case", pageWidth / 2, pageHeight / 2 - 10, { align: "center" });
      doc.setFontSize(28);
      doc.text("Generation Report", pageWidth / 2, pageHeight / 2 + 5, { align: "center" });
      doc.setFontSize(12);
      doc.text(`${projectName}`, pageWidth / 2, pageHeight / 2 + 20, { align: "center" });
      doc.addPage(); // Move to content page

      // === HEADER (Enhanced: Added subtle gradient-like effect with two rects) ===
      const headerHeight = 30;
      doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
      doc.rect(0, 0, pageWidth, headerHeight, "F");
      // Overlay lighter accent for depth
      doc.setFillColor(accentLight.r, accentLight.g, accentLight.b);
      doc.rect(0, headerHeight - 5, pageWidth, 5, "F");
      
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Test Case Generation Report", margin, 18);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(255, 255, 255);
      doc.text(`Project: ${projectName}`, pageWidth - margin, 10, { align: "right" });
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, 18, { align: "right" });

      // === SUMMARY (Enhanced: Added icons as simple shapes and colored values) ===
      y = 45;
      sectionTitle("Report Summary");

      const totalGenerations = testCaseData.length;
      const totalTestCases = testCaseData.reduce(
        (sum, gen) => sum + (gen.test_cases?.length || 0),
        0
      );

      // Summary Card Effect (Enhanced: Deeper shadow and icons)
      const summaryBoxHeight = 25;
      const summaryBoxY = y - 3;
      const statY = y + 8;
      const statPadding = contentWidth / 2;
      const iconSize = 4;

      // Deeper shadow
      doc.setFillColor(lightShadow.r, lightShadow.g, lightShadow.b);
      doc.rect(margin + 2, summaryBoxY + 2, contentWidth, summaryBoxHeight, "F");
      
      // Main card body
      doc.setFillColor(lightAccent.r, lightAccent.g, lightAccent.b);
      doc.rect(margin, summaryBoxY, contentWidth, summaryBoxHeight, "F");

      // Simple icons (rectangles/circles)
      // Generations icon (stack)
      doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
      doc.rect(margin + 10, summaryBoxY + 5, iconSize, iconSize * 2, "F");

      // Test cases icon (list)
      doc.rect(margin + statPadding + 10, summaryBoxY + 5, iconSize * 0.5, iconSize * 3, "F");

      // Draw stats with colors
      drawKeyValue("Generations:", `${totalGenerations}`, 20, true, accentColor); 
      drawKeyValue("Total Test Cases:", `${totalTestCases}`, statPadding + 20, true, successColor);
      
      y = summaryBoxY + summaryBoxHeight + 7;

      // === DETAILED RESULTS (Enhanced: Integrated priority bar chart, colored durations) ===
      sectionTitle("Detailed Generation Results");

      const halfContentWidth = contentWidth / 2;

      testCaseData.forEach((generation, idx) => {
        checkPage(80); // Increased for bar chart space
        const generationId = generation.id || generation.testcase_id;
        const generationIndex = generation.generation_index !== undefined
          ? generation.generation_index + 1
          : idx + 1;
        
        const cardStarty = y - 1;
        const infoBlockHeight = 10 * lineHeight + 15; // Extra for bar chart
        
        // --- Enhanced Card Effect ---
        // Deeper Shadow
        doc.setFillColor(lightShadow.r, lightShadow.g, lightShadow.b);
        doc.rect(margin + 2, cardStarty + 2, contentWidth, infoBlockHeight, "F"); 
        // Main Card Body (Subtle gradient-like with light accent)
        doc.setFillColor(lightAccent.r, lightAccent.g, lightAccent.b);
        doc.rect(margin, cardStarty, contentWidth, infoBlockHeight, "F"); 
        
        // --- Header Section (Enhanced: Added index badge) ---
        const headerRectHeight = 8;
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, cardStarty, contentWidth, headerRectHeight, "F"); 

        // Badge for generation number
        doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
        doc.circle(margin + 15, cardStarty + 4, 3, "F"); // Simple circle badge
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text(`${generationIndex}`, margin + 14, cardStarty + 5, { align: "center" });
        
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
        doc.text(`Generation #${generationIndex}`, margin + 25, cardStarty + 5);
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(greyColor.r, greyColor.g, greyColor.b);
        doc.text(`ID: ${generationId}`, pageWidth - margin - 2, cardStarty + 5, { align: "right" });

        y += 12;
        
        // --- Detail Rows (with increased vertical padding) ---
        y += 3;

        // Row 1: Created & Updated
        const created = generation.created_at ? new Date(generation.created_at).toLocaleString() : "N/A";
        const updated = generation.updated_at ? new Date(generation.updated_at).toLocaleString() : "N/A";
        
        drawKeyValue("Created:", created, 5);
        drawKeyValue("Updated:", updated, halfContentWidth + 5);
        y += lineHeight;

        // Row 2: Total Features & Duration (Color duration)
        const totalFeatures = generation.generation_metadata?.total_features;
        const duration = generation.generation_metadata?.generation_duration_seconds;

        if (totalFeatures !== undefined) {
             drawKeyValue("Total Features:", `${totalFeatures}`, 5);
        }
        if (duration !== undefined) {
            drawKeyValue("Duration:", `${duration}s`, halfContentWidth + 5, true, warningColor);
        }
        y += lineHeight;

        // Row 3: Test Cases Generated & Metadata Total (Color test cases green)
        const casesGenerated = generation.test_cases?.length || 0;
        const metaTotal = generation.generation_metadata?.total_test_cases;

        drawKeyValue("Test Cases Generated:", `${casesGenerated}`, 5, true, successColor);
        if (metaTotal !== undefined) {
            drawKeyValue("Metadata Total:", `${metaTotal}`, halfContentWidth + 5);
        }
        y += lineHeight;

        // Row 4: Priority Distribution with Bar Chart (New visual)
        if (generation.generation_metadata?.priority_distribution) {
            const dist = generation.generation_metadata.priority_distribution;
            const barStartX = margin + 5;
            const barStartY = y + 2;
            y = drawPriorityBar(dist, barStartX, barStartY, 60);
        } else {
          y += lineHeight;
        }

        y = cardStarty + infoBlockHeight + 7;

      });

      // === FOOTER (Enhanced: Added subtle line above footer) ===
      const totalPages = doc.internal.pages.length;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        // Subtle line
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);

        // Left-aligned Text
        doc.text(
          "Generated by Test Case Generator",
          margin,
          pageHeight - 10
        );

        // Page Number (Right-Aligned)
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 10,
          { align: "right" }
        );
      }

      // Save PDF
      if (!filename) {
        const ts = new Date().toISOString().slice(0, 19).replace(/:/g, "-").replace("T", "_");
        filename = `${projectName.replace(/\s/g, '_')}_report_${ts}.pdf`;
      }

      doc.save(filename);
      console.log("✅ Enhanced Test Case PDF report generated successfully");
    } catch (err) {
      console.error("❌ Test Case PDF generation failed:", err);
      dialog.alert({
        title: "Export failed",
        message: "Failed to generate Test Case PDF report. Please try again.",
        variant: "danger",
      });
    }
  }
}

export default TestCasePdfGenerator;