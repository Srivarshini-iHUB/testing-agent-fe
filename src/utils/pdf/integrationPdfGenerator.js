import jsPDF from "jspdf";

export class IntegrationPdfGenerator {
  static generatePdf(integrationData, projectName = "Project", filename = null) {
    if (!integrationData || !integrationData.test_runs?.length) {
      alert("No integration test data available to generate PDF report");
      return;
    }

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      const accentColor = { r: 20, g: 184, b: 166 }; // Teal
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
      doc.text("Integration Test Report", margin, 17);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Project: ${projectName}`, pageWidth - margin - 60, 10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 60, 17);

      // === SUMMARY ===
      y = 40;
      sectionTitle("Summary");

      const totalRuns = integrationData.total_test_runs || integrationData.test_runs.length;
      const totalScenarios = integrationData.total_scenarios || 
        integrationData.test_runs.reduce((sum, run) => sum + (run.scenarios?.length || 0), 0);

      doc.setFillColor(245, 247, 250);
      doc.rect(margin, y - 3, contentWidth, 20, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Test Runs: ${totalRuns}`, margin + 5, y + 5);
      doc.text(`Total Scenarios: ${totalScenarios}`, margin + 80, y + 5);
      y += 25;

      // === DETAILED RESULTS ===
      sectionTitle("Test Runs");

      integrationData.test_runs.forEach((run, idx) => {
        checkPage(50);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(`Test Run ${idx + 1}: ${run.doc_id}`, margin, y);
        y += 6;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const created = run.created_at ? new Date(run.created_at).toLocaleString() : "N/A";
        const updated = run.updated_at ? new Date(run.updated_at).toLocaleString() : "N/A";
        doc.text(`Created: ${created}`, margin, y);
        y += 5;
        doc.text(`Updated: ${updated}`, margin, y);
        y += 5;
        doc.text(`Test Run Count: ${run.testrun_count || 0}`, margin, y);
        y += 8;

        // Scenarios
        if (run.scenarios && run.scenarios.length > 0) {
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
          doc.text("Scenarios:", margin + 5, y);
          y += 6;

          run.scenarios.forEach((scenario, sIdx) => {
            checkPage(40);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text(`${sIdx + 1}. ${scenario.scenario_name}`, margin + 10, y);
            y += 5;

            doc.setFont("helvetica", "normal");
            const scUpdated = scenario.updated_at || run.updated_at;
            if (scUpdated) {
              doc.text(`Updated: ${new Date(scUpdated).toLocaleString()}`, margin + 15, y);
              y += 5;
            }

            // Flow Names
            if (scenario.flow_names && scenario.flow_names.length > 0) {
              doc.setFont("helvetica", "bold");
              doc.text("Flow Names:", margin + 15, y);
              y += 5;
              doc.setFont("helvetica", "normal");
              scenario.flow_names.forEach((flow, fIdx) => {
                doc.text(`  • ${flow}`, margin + 20, y);
                y += 4;
              });
            }

            // Test Script Preview (truncated if too long)
            if (scenario.test_script) {
              checkPage(20);
              doc.setFont("helvetica", "bold");
              doc.text("Test Script:", margin + 15, y);
              y += 5;
              doc.setFont("helvetica", "normal");
              const scriptPreview = scenario.test_script.length > 200 
                ? scenario.test_script.substring(0, 200) + "..."
                : scenario.test_script;
              const scriptLines = doc.splitTextToSize(scriptPreview, contentWidth - 30);
              doc.text(scriptLines, margin + 20, y);
              y += scriptLines.length * 4 + 3;
            }

            // Report Summary
            if (scenario.report) {
              checkPage(15);
              doc.setFont("helvetica", "bold");
              doc.text("Report Summary:", margin + 15, y);
              y += 5;
              doc.setFont("helvetica", "normal");
              const reportStr = JSON.stringify(scenario.report, null, 2);
              const reportPreview = reportStr.length > 300 
                ? reportStr.substring(0, 300) + "..."
                : reportStr;
              const reportLines = doc.splitTextToSize(reportPreview, contentWidth - 30);
              doc.text(reportLines, margin + 20, y);
              y += reportLines.length * 4 + 3;
            }

            y += 5;
          });
        } else {
          doc.setFontSize(10);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(120, 120, 120);
          doc.text("No scenarios available", margin + 10, y);
          y += 5;
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
          "Generated by Integration Test Suite",
          margin,
          pageHeight - 10
        );
      }

      // Save PDF
      if (!filename) {
        const ts = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
        filename = `integration_report_${ts}.pdf`;
      }

      doc.save(filename);
      console.log("✅ Integration PDF report generated successfully");
    } catch (err) {
      console.error("❌ Integration PDF generation failed:", err);
      alert("Failed to generate Integration PDF report. Please try again.");
    }
  }
}

export default IntegrationPdfGenerator;

