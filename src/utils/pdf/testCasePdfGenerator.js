import jsPDF from "jspdf";

export class TestCasePdfGenerator {
  static generatePdf(testCaseData, projectName = "Project", filename = null) {
    if (!testCaseData || !Array.isArray(testCaseData) || testCaseData.length === 0) {
      alert("No test case data available to generate PDF report");
      return;
    }

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      const accentColor = { r: 99, g: 102, b: 241 }; // Indigo
      let y = 25;

      // Helper: Section title
      const sectionTitle = (title) => {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
        doc.text(title, margin, y);
        y += 6;
        doc.setDrawColor(200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;
      };

      // Helper: Add wrapped text
      const addText = (text, size = 10, bold = false, color = [0, 0, 0]) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 2;
      };

      // Helper: New page check
      const checkPage = (extra = 30) => {
        if (y + extra > pageHeight - 20) {
          doc.addPage();
          y = 25;
        }
      };

      // === HEADER ===
      doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
      doc.rect(0, 0, pageWidth, 25, "F");
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Test Case Generation Report", margin, 17);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Project: ${projectName}`, pageWidth - margin - 60, 10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 60, 17);

      // === SUMMARY ===
      y = 40;
      sectionTitle("Summary");

      const totalGenerations = testCaseData.length;
      const totalTestCases = testCaseData.reduce(
        (sum, gen) => sum + (gen.test_cases?.length || 0),
        0
      );

      doc.setFillColor(245, 247, 250);
      doc.rect(margin, y - 3, contentWidth, 20, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Generations: ${totalGenerations}`, margin + 5, y + 5);
      doc.text(`Total Test Cases: ${totalTestCases}`, margin + 80, y + 5);
      y += 25;

      // === DETAILED RESULTS ===
      sectionTitle("Test Case Generations");

      testCaseData.forEach((generation, idx) => {
        checkPage(50);
        const generationId = generation.id || generation.testcase_id;
        const generationIndex = generation.generation_index !== undefined 
          ? generation.generation_index + 1 
          : idx + 1;

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(`Generation #${generationIndex}`, margin, y);
        y += 6;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`ID: ${generationId}`, margin, y);
        y += 5;

        const created = generation.created_at ? new Date(generation.created_at).toLocaleString() : "N/A";
        const updated = generation.updated_at ? new Date(generation.updated_at).toLocaleString() : "N/A";
        doc.text(`Created: ${created}`, margin, y);
        y += 5;
        doc.text(`Updated: ${updated}`, margin, y);
        y += 5;

        if (generation.generation_metadata) {
          const meta = generation.generation_metadata;
          doc.text(`Duration: ${meta.generation_duration_seconds || "-"}s`, margin, y);
          y += 5;
          if (meta.total_features) {
            doc.text(`Total Features: ${meta.total_features}`, margin, y);
            y += 5;
          }
          if (meta.total_test_cases) {
            doc.text(`Total Test Cases: ${meta.total_test_cases}`, margin, y);
            y += 5;
          }
          if (meta.priority_distribution) {
            const dist = meta.priority_distribution;
            doc.text(`Priority - High: ${dist.high || 0}, Medium: ${dist.medium || 0}, Low: ${dist.low || 0}`, margin, y);
            y += 5;
          }
        }

        doc.text(`Test Cases: ${generation.test_cases?.length || 0}`, margin, y);
        y += 8;
      });

      // === FOOTER ===
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
        doc.text(
          "Generated by Test Case Generator",
          margin,
          pageHeight - 10
        );
      }

      // Save PDF
      if (!filename) {
        const ts = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
        filename = `testcase_report_${ts}.pdf`;
      }

      doc.save(filename);
      console.log("✅ Test Case PDF report generated successfully");
    } catch (err) {
      console.error("❌ Test Case PDF generation failed:", err);
      alert("Failed to generate Test Case PDF report. Please try again.");
    }
  }
}

export default TestCasePdfGenerator;

