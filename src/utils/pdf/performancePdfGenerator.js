import jsPDF from "jspdf";
import { dialog } from "../dialogService";


export class PerformancePdfGenerator {
  static generatePdf(performanceData, projectName = "Project", filename = null) {
    if (!performanceData || !performanceData.items?.length) {
      dialog.alert({
        title: "No data available",
        message: "No performance test data available to generate PDF report.",
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
      const accentColor = { r: 79, g: 70, b: 229 }; // Indigo
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
      doc.text("Performance Test Report", margin, 17);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Project: ${projectName}`, pageWidth - margin - 60, 10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 60, 17);

      // === SUMMARY ===
      y = 40;
      sectionTitle("Summary");

      const totalTargets = performanceData.items.length;
      const totalExecutions = performanceData.items.reduce(
        (sum, i) => sum + (i.runs?.length || 0),
        0
      );

      doc.setFillColor(245, 247, 250);
      doc.rect(margin, y - 3, contentWidth, 20, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Targets: ${totalTargets}`, margin + 5, y + 5);
      doc.text(`Total Executions: ${totalExecutions}`, margin + 80, y + 5);
      y += 25;

      // === DETAILED RESULTS ===
      sectionTitle("Detailed Results");

      performanceData.items.forEach((item, idx) => {
        checkPage(40);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(`Target ${idx + 1}: ${item.method || "N/A"} ${item.url}`, margin, y);
        y += 5;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Mode: ${item.testMode?.toUpperCase() || "N/A"}`, margin, y + 5);
        doc.text(`Executions: ${item.runs?.length || 0}`, margin + 80, y + 5);
        y += 12;

        (item.runs || []).forEach((run, rIndex) => {
          checkPage(50);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
          doc.text(`Execution ${rIndex + 1}`, margin + 5, y);
          y += 6;

          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          const ts = run.timestamp ? new Date(run.timestamp).toLocaleString() : "N/A";
          doc.text(`Timestamp: ${ts}`, margin + 10, y);
          y += 5;

          // Request config
          if (run.request) {
            const req = run.request;
            doc.setFont("helvetica", "bold");
            doc.text("Request Configuration", margin + 10, y);
            y += 5;
            doc.setFont("helvetica", "normal");
            if (req.duration) doc.text(`Duration: ${req.duration}s`, margin + 15, y);
            if (req.connections)
              doc.text(`Connections: ${req.connections}`, margin + 70, y);
            y += 6;
          }

          // Metrics
          if (run.response) {
            const resp = run.response;
            doc.setFont("helvetica", "bold");
            doc.text("Performance Metrics", margin + 10, y);
            y += 5;
            doc.setFont("helvetica", "normal");
            const metrics = [
              ["Avg Latency", `${resp.avgLatency || "-"} ms`],
              ["Req/s", `${resp.requestsPerSec || "-"}`],
              ["Success Rate", `${resp.successRate || "-"}%`],
              ["Total Requests", `${resp.totalRequests || "-"}`],
            ];
            metrics.forEach(([k, v]) => {
              doc.text(`${k}: ${v}`, margin + 15, y);
              y += 5;
            });

            // Latency Percentiles
            if (resp.latency) {
              doc.setFont("helvetica", "bold");
              doc.text("Latency Percentiles", margin + 10, y + 2);
              y += 7;
              doc.setFont("helvetica", "normal");
              Object.entries(resp.latency).forEach(([key, val]) => {
                doc.text(`${key.toUpperCase()}: ${val} ms`, margin + 15, y);
                y += 5;
              });
            }

            // Status codes
            const codes = ["2xx", "4xx", "5xx"];
            const availableCodes = codes.filter((c) => resp[c] !== undefined);
            if (availableCodes.length) {
              doc.setFont("helvetica", "bold");
              doc.text("Status Code Distribution", margin + 10, y + 2);
              y += 7;
              doc.setFont("helvetica", "normal");
              availableCodes.forEach((c) => {
                doc.text(`${c}: ${resp[c]}`, margin + 15, y);
                y += 5;
              });
            }
          }

          y += 10;
        });
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
          "Generated by Performance Test Suite",
          margin,
          pageHeight - 10
        );
      }

      // Save PDF
      if (!filename) {
        const ts = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
        filename = `performance_report_${ts}.pdf`;
      }

      doc.save(filename);
      console.log("✅ Enhanced PDF report generated successfully");
    } catch (err) {
      console.error("❌ PDF generation failed:", err);
      dialog.alert({
        title: "Export failed",
        message: "Failed to generate PDF report. Please try again.",
        variant: "danger",
      });
    }
  }
}

export default PerformancePdfGenerator;
