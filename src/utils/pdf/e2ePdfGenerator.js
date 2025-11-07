import jsPDF from "jspdf";
import { dialog } from "../dialogService";

export class E2EPdfGenerator {
  static generatePdf(e2eData, projectName = "Project", filename = null) {
    // Handle different response structures
    let reports = [];
    if (Array.isArray(e2eData.reports)) {
      reports = e2eData.reports;
    } else if (Array.isArray(e2eData)) {
      reports = e2eData;
    } else if (e2eData.data && Array.isArray(e2eData.data)) {
      reports = e2eData.data;
    } else if (e2eData.e2e_reports && Array.isArray(e2eData.e2e_reports)) {
      reports = e2eData.e2e_reports;
    } else if (e2eData.runs && Array.isArray(e2eData.runs)) {
      reports = e2eData.runs;
    }

    if (!reports || reports.length === 0) {
      dialog.alert({
        title: "No data available",
        message: "No E2E test data available to generate PDF report.",
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
      const accentColor = { r: 147, g: 51, b: 234 }; // Purple
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
      doc.text("E2E (Functional) Test Report", margin, 17);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Project: ${projectName}`, pageWidth - margin - 60, 10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 60, 17);

      // === SUMMARY ===
      y = 40;
      sectionTitle("Summary");

      const totalRuns = reports.length;
      const totalPassed = reports.reduce((sum, r) => sum + (r.passed || 0), 0);
      const totalFailed = reports.reduce((sum, r) => sum + (r.failed || 0), 0);
      const totalTests = reports.reduce((sum, r) => sum + (r.total_tests || 0), 0);

      doc.setFillColor(245, 247, 250);
      doc.rect(margin, y - 3, contentWidth, 25, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Runs: ${totalRuns}`, margin + 5, y + 5);
      doc.text(`Total Tests: ${totalTests}`, margin + 60, y + 5);
      doc.text(`Passed: ${totalPassed}`, margin + 5, y + 12);
      doc.text(`Failed: ${totalFailed}`, margin + 60, y + 12);
      y += 30;

      // === DETAILED RESULTS ===
      sectionTitle("Test Runs");

      reports.forEach((report, idx) => {
        checkPage(60);
        const reportId = report.id || report._id || `report_${idx}`;
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(`Test Run ${idx + 1}`, margin, y);
        y += 6;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`ID: ${reportId}`, margin, y);
        y += 5;

        const created = report.created_at ? new Date(report.created_at).toLocaleString() : "N/A";
        const updated = report.updated_at ? new Date(report.updated_at).toLocaleString() : "N/A";
        doc.text(`Created: ${created}`, margin, y);
        y += 5;
        doc.text(`Updated: ${updated}`, margin, y);
        y += 5;

        if (report.project_url) {
          doc.text(`Project URL: ${report.project_url}`, margin, y);
          y += 5;
        }

        if (report.duration) {
          doc.text(`Duration: ${report.duration}`, margin, y);
          y += 5;
        }

        // Test Summary
        doc.setFont("helvetica", "bold");
        doc.text("Test Summary:", margin, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.text(`Passed: ${report.passed || 0}`, margin + 5, y);
        doc.text(`Failed: ${report.failed || 0}`, margin + 50, y);
        if (report.total_tests) {
          doc.text(`Total: ${report.total_tests}`, margin + 95, y);
        }
        y += 8;

        // Test Cases
        if (report.test_cases && report.test_cases.length > 0) {
          checkPage(30);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
          doc.text(`Test Cases (${report.test_cases.length}):`, margin + 5, y);
          y += 6;

          report.test_cases.forEach((tc, tcIdx) => {
            checkPage(30);
            const tcId = tc.test_case_id || tc.test_case_number || `TC-${tcIdx + 1}`;
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text(`${tcIdx + 1}. ${tcId}: ${tc.test_scenario || tc.feature_name || "Test Case"}`, margin + 10, y);
            y += 5;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            if (tc.test_type) {
              doc.text(`Type: ${tc.test_type}`, margin + 15, y);
            }
            if (tc.priority) {
              doc.text(`Priority: ${tc.priority}`, margin + 50, y);
            }
            y += 5;
          });
        }

        // Test Results
        if (report.test_results && report.test_results.length > 0) {
          checkPage(30);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
          doc.text(`Test Results (${report.test_results.length}):`, margin + 5, y);
          y += 6;

          report.test_results.forEach((result, rIdx) => {
            checkPage(25);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text(`${rIdx + 1}. ${result.name || `Test ${rIdx + 1}`}`, margin + 10, y);
            y += 5;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            const statusColor = result.status === 'passed' || result.status === 'PASSED' 
              ? [40, 167, 69] 
              : [220, 53, 69];
            doc.setTextColor(...statusColor);
            doc.text(`Status: ${(result.status || 'UNKNOWN').toUpperCase()}`, margin + 15, y);
            doc.setTextColor(0, 0, 0);
            if (result.duration) {
              doc.text(`Duration: ${result.duration}`, margin + 60, y);
            }
            y += 5;

            if ((result.status === 'failed' || result.status === 'FAILED') && result.error_message) {
              const errorPreview = result.error_message.length > 200 
                ? result.error_message.substring(0, 200) + "..."
                : result.error_message;
              const errorLines = doc.splitTextToSize(errorPreview, contentWidth - 30);
              doc.setFontSize(8);
              doc.setTextColor(220, 53, 69);
              doc.text(errorLines, margin + 20, y);
              y += errorLines.length * 3 + 2;
              doc.setTextColor(0, 0, 0);
            }
          });
        }

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
          "Generated by E2E Test Suite",
          margin,
          pageHeight - 10
        );
      }

      // Save PDF
      if (!filename) {
        const ts = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
        filename = `e2e_report_${ts}.pdf`;
      }

      doc.save(filename);
      console.log("✅ E2E PDF report generated successfully");
    } catch (err) {
      console.error("❌ E2E PDF generation failed:", err);
      dialog.alert({
        title: "Export failed",
        message: "Failed to generate E2E PDF report. Please try again.",
        variant: "danger",
      });
    }
  }
}

export default E2EPdfGenerator;

