import jsPDF from "jspdf";

export class RegressionPdfGenerator {
  static generatePdf(regressionData, projectName = "Project", filename = null) {
    if (!regressionData || !regressionData.regression_test) {
      alert("No regression test data available to generate PDF report");
      return;
    }

    const testData = regressionData.regression_test;
    const runs = testData.regression_runs || [];

    if (runs.length === 0) {
      alert("No regression test runs available to generate PDF report");
      return;
    }

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      const accentColor = { r: 6, g: 182, b: 212 }; // Cyan
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
      doc.text("Regression Test Report", margin, 17);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Project: ${projectName}`, pageWidth - margin - 60, 10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 60, 17);

      // === SUMMARY ===
      y = 40;
      sectionTitle("Summary");

      const totalRuns = runs.length;
      const totalBugsTested = runs.reduce((sum, run) => sum + (run.total_bugs_tested || 0), 0);
      const totalBugsVerified = runs.reduce((sum, run) => sum + (run.bugs_verified || 0), 0);
      const totalBugsReopened = runs.reduce((sum, run) => sum + (run.bugs_reopened || 0), 0);

      doc.setFillColor(245, 247, 250);
      doc.rect(margin, y - 3, contentWidth, 30, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Runs: ${totalRuns}`, margin + 5, y + 5);
      doc.text(`Total Bugs Tested: ${totalBugsTested}`, margin + 60, y + 5);
      doc.text(`Bugs Verified: ${totalBugsVerified}`, margin + 5, y + 12);
      doc.text(`Bugs Reopened: ${totalBugsReopened}`, margin + 60, y + 12);
      y += 35;

      // === PROJECT INFORMATION ===
      sectionTitle("Project Information");

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Project Name: ${testData.project_name || '-'}`, margin, y);
      y += 5;
      doc.text(`Latest Run Index: ${testData.latest_run_index || 0}`, margin, y);
      y += 5;

      const created = testData.created_at ? new Date(testData.created_at).toLocaleString() : "N/A";
      const updated = testData.updated_at ? new Date(testData.updated_at).toLocaleString() : "N/A";
      doc.text(`Created: ${created}`, margin, y);
      y += 5;
      doc.text(`Updated: ${updated}`, margin, y);
      y += 5;

      if (testData.bug_sheet_url) {
        doc.text(`Bug Sheet URL: ${testData.bug_sheet_url}`, margin, y);
        y += 5;
      }

      y += 5;

      // === REGRESSION RUNS ===
      sectionTitle("Regression Runs");

      runs.forEach((run, idx) => {
        checkPage(60);
        const runKey = run.run_index || idx;
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(`Run #${runKey}`, margin, y);
        y += 6;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const runCreated = run.created_at ? new Date(run.created_at).toLocaleString() : "N/A";
        doc.text(`Created: ${runCreated}`, margin, y);
        y += 5;

        if (run.duration) {
          doc.text(`Duration: ${run.duration}`, margin, y);
          y += 5;
        }

        // Status Badge
        const statusColor = run.status === 'passed' 
          ? [40, 167, 69] 
          : run.status === 'failed' 
          ? [220, 53, 69] 
          : run.status === 'partial'
          ? [255, 193, 7]
          : [108, 117, 125];
        doc.setFillColor(...statusColor);
        doc.rect(margin, y - 3, 30, 6, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text((run.status || 'unknown').toUpperCase(), margin + 2, y + 2);
        y += 8;

        // Statistics
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("Statistics:", margin + 5, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.text(`Bugs Verified: ${run.bugs_verified || 0}`, margin + 10, y);
        y += 5;
        doc.text(`Bugs Reopened: ${run.bugs_reopened || 0}`, margin + 10, y);
        y += 5;
        doc.text(`Total Bugs Tested: ${run.total_bugs_tested || 0}`, margin + 10, y);
        y += 5;
        doc.text(`Run Index: ${run.run_index || runKey}`, margin + 10, y);
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
          "Generated by Regression Test Suite",
          margin,
          pageHeight - 10
        );
      }

      // Save PDF
      if (!filename) {
        const ts = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
        filename = `regression_report_${ts}.pdf`;
      }

      doc.save(filename);
      console.log("✅ Regression PDF report generated successfully");
    } catch (err) {
      console.error("❌ Regression PDF generation failed:", err);
      alert("Failed to generate Regression PDF report. Please try again.");
    }
  }
}

export default RegressionPdfGenerator;

