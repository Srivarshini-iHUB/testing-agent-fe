import jsPDF from "jspdf";

export class SmokePdfGenerator {
  static generatePdf(smokeData, projectName = "Project", filename = null) {
    if (!smokeData || !Array.isArray(smokeData) || smokeData.length === 0) {
      alert("No smoke test data available to generate PDF report");
      return;
    }

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      const accentColor = { r: 249, g: 115, b: 22 }; // Orange
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
      doc.text("Smoke Test Report", margin, 17);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Project: ${projectName}`, pageWidth - margin - 60, 10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 60, 17);

      // === SUMMARY ===
      y = 40;
      sectionTitle("Summary");

      const totalRuns = smokeData.length;
      const totalTests = smokeData.reduce((sum, test) => sum + (test.total_tests || 0), 0);
      const totalPassed = smokeData.reduce((sum, test) => sum + (test.passed || 0), 0);
      const totalFailed = smokeData.reduce((sum, test) => sum + (test.failed || 0), 0);
      const totalSkipped = smokeData.reduce((sum, test) => sum + (test.skipped || 0), 0);

      doc.setFillColor(245, 247, 250);
      doc.rect(margin, y - 3, contentWidth, 30, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Runs: ${totalRuns}`, margin + 5, y + 5);
      doc.text(`Total Tests: ${totalTests}`, margin + 60, y + 5);
      doc.text(`Passed: ${totalPassed}`, margin + 5, y + 12);
      doc.text(`Failed: ${totalFailed}`, margin + 60, y + 12);
      if (totalSkipped > 0) {
        doc.text(`Skipped: ${totalSkipped}`, margin + 5, y + 19);
      }
      y += 35;

      // === DETAILED RESULTS ===
      sectionTitle("Test Runs");

      smokeData.forEach((test, idx) => {
        checkPage(80);
        const testId = test.id || `test_${idx}`;
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(`Run #${idx + 1}`, margin, y);
        y += 6;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`ID: ${testId}`, margin, y);
        y += 5;

        const created = test.created_at ? new Date(test.created_at).toLocaleString() : "N/A";
        const updated = test.updated_at ? new Date(test.updated_at).toLocaleString() : "N/A";
        doc.text(`Created: ${created}`, margin, y);
        y += 5;
        doc.text(`Updated: ${updated}`, margin, y);
        y += 5;

        if (test.test_suite_name) {
          doc.text(`Test Suite: ${test.test_suite_name}`, margin, y);
          y += 5;
        }

        if (test.test_environment) {
          doc.text(`Environment: ${test.test_environment}`, margin, y);
          y += 5;
        }

        // Test Statistics
        doc.setFont("helvetica", "bold");
        doc.text("Test Statistics:", margin, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.text(`Passed: ${test.passed || 0}`, margin + 5, y);
        doc.text(`Failed: ${test.failed || 0}`, margin + 50, y);
        doc.text(`Total: ${test.total_tests || 0}`, margin + 95, y);
        y += 5;
        if (test.skipped > 0) {
          doc.text(`Skipped: ${test.skipped || 0}`, margin + 5, y);
          y += 5;
        }

        // Test Execution Summary
        if (test.duration || test.exit_code || test.test_executed_by || test.build_number) {
          checkPage(25);
          doc.setFont("helvetica", "bold");
          doc.text("Execution Summary:", margin, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          if (test.duration) {
            doc.text(`Duration: ${test.duration}`, margin + 5, y);
            y += 5;
          }
          if (test.exit_code !== undefined) {
            doc.text(`Exit Code: ${test.exit_code}`, margin + 5, y);
            y += 5;
          }
          if (test.test_executed_by) {
            doc.text(`Executed By: ${test.test_executed_by}`, margin + 5, y);
            y += 5;
          }
          if (test.build_number) {
            doc.text(`Build Number: ${test.build_number}`, margin + 5, y);
            y += 5;
          }
          if (test.report_url) {
            doc.text(`Report URL: ${test.report_url}`, margin + 5, y);
            y += 5;
          }
          if (test.comments) {
            const commentLines = doc.splitTextToSize(test.comments, contentWidth - 10);
            doc.text(`Comments: ${commentLines[0]}`, margin + 5, y);
            y += commentLines.length * 5 + 2;
          }
        }

        // Test Script
        if (test.test_results?.script) {
          checkPage(30);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
          doc.text("Test Script:", margin + 5, y);
          y += 6;
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
          const scriptPreview = test.test_results.script.length > 300 
            ? test.test_results.script.substring(0, 300) + "..."
            : test.test_results.script;
          const scriptLines = doc.splitTextToSize(scriptPreview, contentWidth - 30);
          doc.text(scriptLines, margin + 10, y);
          y += scriptLines.length * 4 + 3;
        }

        // Test Summary
        if (test.test_results?.summary) {
          checkPage(20);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
          doc.text("Test Summary:", margin + 5, y);
          y += 6;
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
          const summary = test.test_results.summary;
          doc.text(`Total: ${summary.total || test.total_tests || 0}`, margin + 10, y);
          y += 5;
          doc.text(`Passed: ${summary.passed || test.passed || 0}`, margin + 10, y);
          y += 5;
          doc.text(`Failed: ${summary.failed || test.failed || 0}`, margin + 10, y);
          y += 5;
          if (summary.skipped !== undefined || test.skipped) {
            doc.text(`Skipped: ${summary.skipped || test.skipped || 0}`, margin + 10, y);
            y += 5;
          }
        }

        // Input Test Cases
        if (test.test_results?.input_test_cases && test.test_results.input_test_cases.length > 0) {
          checkPage(30);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
          doc.text(`Input Test Cases (${test.test_results.input_test_cases.length}):`, margin + 5, y);
          y += 6;

          test.test_results.input_test_cases.forEach((tc, tcIdx) => {
            checkPage(25);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            const tcName = tc['Scenario'] || tc['Test Type'] || `Test Case ${tcIdx + 1}`;
            doc.text(`${tcIdx + 1}. ${tcName}`, margin + 10, y);
            y += 5;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            if (tc['Scenario Description']) {
              const descLines = doc.splitTextToSize(tc['Scenario Description'], contentWidth - 30);
              doc.text(`Description: ${descLines[0]}`, margin + 15, y);
              y += descLines.length * 4 + 2;
            }
            if (tc['Steps to Execute']) {
              const stepsPreview = tc['Steps to Execute'].length > 150 
                ? tc['Steps to Execute'].substring(0, 150) + "..."
                : tc['Steps to Execute'];
              const stepsLines = doc.splitTextToSize(stepsPreview, contentWidth - 30);
              doc.text(`Steps: ${stepsLines[0]}`, margin + 15, y);
              y += stepsLines.length * 4 + 2;
            }
            if (tc['Test Data']) {
              doc.text(`Test Data: ${tc['Test Data']}`, margin + 15, y);
              y += 5;
            }
            if (tc['Expected Result']) {
              const resultLines = doc.splitTextToSize(tc['Expected Result'], contentWidth - 30);
              doc.text(`Expected: ${resultLines[0]}`, margin + 15, y);
              y += resultLines.length * 4 + 2;
            }
          });
        }

        // Execution Logs
        if (test.test_results?.execution_logs) {
          checkPage(25);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
          doc.text("Execution Logs:", margin + 5, y);
          y += 6;
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
          const logsPreview = test.test_results.execution_logs.length > 400 
            ? test.test_results.execution_logs.substring(0, 400) + "..."
            : test.test_results.execution_logs;
          const logsLines = doc.splitTextToSize(logsPreview, contentWidth - 30);
          doc.text(logsLines, margin + 10, y);
          y += logsLines.length * 3 + 3;
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
          "Generated by Smoke Test Suite",
          margin,
          pageHeight - 10
        );
      }

      // Save PDF
      if (!filename) {
        const ts = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
        filename = `smoke_report_${ts}.pdf`;
      }

      doc.save(filename);
      console.log("✅ Smoke PDF report generated successfully");
    } catch (err) {
      console.error("❌ Smoke PDF generation failed:", err);
      alert("Failed to generate Smoke PDF report. Please try again.");
    }
  }
}

export default SmokePdfGenerator;

