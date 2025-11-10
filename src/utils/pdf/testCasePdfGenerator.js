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
      const margin = 18;
      const contentWidth = pageWidth - 2 * margin;
      const accentColor = { r: 79, g: 70, b: 229 }; // Indigo
      const accentSoft = { r: 99, g: 102, b: 241 };
      const neutralText = [55, 65, 81];
      let y = 28;

      const formatDate = (value) => {
        if (!value) return "Not provided";
        try {
          const parsed = new Date(value);
          if (Number.isNaN(parsed.getTime())) {
            return String(value);
          }
          return parsed.toLocaleString();
        } catch (error) {
          return String(value);
        }
      };

      const capitalize = (value) =>
        typeof value === "string" && value.length
          ? value.charAt(0).toUpperCase() + value.slice(1)
          : value;

      const checkPage = (extra = 40) => {
        if (y + extra > pageHeight - 18) {
          doc.addPage();
          drawPageDecorations();
          y = 32;
        }
      };

      const drawPageDecorations = () => {
        doc.setDrawColor(236, 239, 244);
        doc.setLineWidth(0.2);
        doc.line(margin, 20, pageWidth - margin, 20);
      };

      const sectionTitle = (title, subtitle = null) => {
        checkPage(subtitle ? 36 : 28);
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
        doc.text(title.toUpperCase(), margin, y);
        y += 7;

        if (subtitle) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 116, 139);
          const lines = doc.splitTextToSize(subtitle, contentWidth);
          doc.text(lines, margin, y);
          y += lines.length * 4.5 + 2;
        }

        doc.setDrawColor(accentSoft.r, accentSoft.g, accentSoft.b);
        doc.setLineWidth(0.6);
        doc.line(margin, y, margin + 35, y);
        doc.setDrawColor(228, 233, 243);
        doc.setLineWidth(0.2);
        doc.line(margin + 35, y, pageWidth - margin, y);
        y += 8;
      };

      const drawIntroParagraph = () => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...neutralText);
        const intro =
          "This report captures the automated testing intelligence produced by the Testing Agent. Explore high-level metrics, generation details, and priority breakdowns to understand coverage and trends.";
        const lines = doc.splitTextToSize(intro, contentWidth);
        checkPage(lines.length * 5 + 12);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 6;
      };

      const renderSummaryCards = (cards) => {
        const cardsPerRow = 2;
        const gap = 8;
        const cardWidth = (contentWidth - gap) / cardsPerRow;
        const cardHeight = 44;
        let columnIndex = 0;
        let rowTop = y;

        cards.forEach((card, index) => {
          if (columnIndex === 0) {
            checkPage(cardHeight + 14);
            rowTop = y;
          }

          const x = margin + columnIndex * (cardWidth + gap);
          doc.setFillColor(248, 250, 255);
          doc.roundedRect(x, rowTop, cardWidth, cardHeight, 4, 4, "F");
          doc.setDrawColor(229, 231, 235);
          doc.roundedRect(x, rowTop, cardWidth, cardHeight, 4, 4, "S");

          doc.setFillColor(accentSoft.r, accentSoft.g, accentSoft.b);
          doc.circle(x + 6, rowTop + 10, 2, "F");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(accentSoft.r, accentSoft.g, accentSoft.b);
          doc.text(card.label.toUpperCase(), x + 12, rowTop + 11);

          doc.setFontSize(13);
          doc.setTextColor(17, 24, 39);
          doc.text(String(card.value), x + 12, rowTop + 21);

          if (card.helper) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(107, 114, 128);
            const helperLines = doc.splitTextToSize(card.helper, cardWidth - 24);
            doc.text(helperLines, x + 12, rowTop + 30);
          }

          columnIndex += 1;

          if (columnIndex === cardsPerRow || index === cards.length - 1) {
            y = rowTop + cardHeight + 8;
            columnIndex = 0;
          }
        });
      };

      const renderGenerationBlock = (generation, idx) => {
        const generationId = generation.id || generation.testcase_id || "—";
        const generationIndex =
          generation.generation_index !== undefined
            ? generation.generation_index + 1
            : idx + 1;
        const paddingX = 12;
        const paddingY = 10;
        const innerWidth = contentWidth - paddingX * 2;
        const meta = generation.generation_metadata || {};
        const blockEntries = [];
        const resolveLineHeight = (size) => Math.max(4.2, size * 0.45);

        const createGroup = (text, options = {}) => {
          const {
            size = 9,
            bold = false,
            color = neutralText,
            indent = 0,
            spacing = 2,
          } = options;

          doc.setFont("helvetica", bold ? "bold" : "normal");
          doc.setFontSize(size);
          const availableWidth = innerWidth - indent;
          const lines = doc.splitTextToSize(String(text), availableWidth);
          const lineHeight = resolveLineHeight(size);
          const height = lines.length * lineHeight;
          return {
            lines,
            size,
            bold,
            color,
            indent,
            lineHeight,
            height,
            spacing,
          };
        };

        blockEntries.push(
          createGroup(`Generation #${generationIndex}`, {
            size: 12,
            bold: true,
            color: [17, 24, 39],
            spacing: 3.5,
          })
        );
        blockEntries.push(
          createGroup(`Identifier: ${generationId}`, {
            size: 9,
            color: [100, 116, 139],
            spacing: 1.5,
          })
        );

        const timestamps = [];
        timestamps.push(`Created • ${formatDate(generation.created_at)}`);
        timestamps.push(`Updated • ${formatDate(generation.updated_at)}`);
        blockEntries.push(
          createGroup(timestamps.join("    |    "), {
            size: 9,
            color: [71, 85, 105],
            spacing: 1.5,
          })
        );

        const metrics = [];
        if (meta.generation_duration_seconds !== undefined) {
          metrics.push(`Duration ${meta.generation_duration_seconds}s`);
        }
        if (meta.total_features !== undefined) {
          metrics.push(`Features ${meta.total_features}`);
        }
        const totalCases =
          meta.total_test_cases !== undefined
            ? meta.total_test_cases
            : generation.test_cases?.length;
        if (totalCases !== undefined) {
          metrics.push(`Test Cases ${totalCases}`);
        }
        if (metrics.length) {
          blockEntries.push(
            createGroup(metrics.join("    •    "), {
              size: 9,
              color: [79, 70, 229],
              spacing: 1.5,
            })
          );
        }

        if (meta.priority_distribution) {
          const dist = meta.priority_distribution;
          blockEntries.push(
            createGroup(
              `Priority Mix: High ${dist.high || 0} · Medium ${dist.medium || 0} · Low ${dist.low || 0}`,
              {
                size: 8.5,
                color: [91, 97, 110],
                spacing: 1.5,
              }
            )
          );
        }

        const testCases = Array.isArray(generation.test_cases)
          ? generation.test_cases
          : [];

        if (testCases.length) {
          blockEntries.push(
            createGroup("Highlighted Test Cases", {
              size: 9,
              bold: true,
              color: [30, 41, 59],
              spacing: 3,
            })
          );

          testCases.slice(0, 6).forEach((testCase, index) => {
            const label =
              testCase?.title ||
              testCase?.name ||
              testCase?.test_case_title ||
              `Test Case ${index + 1}`;
            const metaBits = [];
            if (testCase?.priority) {
              metaBits.push(`Priority: ${capitalize(testCase.priority)}`);
            }
            if (testCase?.feature) {
              metaBits.push(`Feature: ${testCase.feature}`);
            }
            const headerLine = metaBits.length
              ? `${index + 1}. ${label} (${metaBits.join(" · ")})`
              : `${index + 1}. ${label}`;
            blockEntries.push(
              createGroup(headerLine, {
                size: 9,
                color: [45, 55, 72],
                indent: 4,
                spacing: 1.5,
              })
            );

            if (testCase?.description) {
              blockEntries.push(
                createGroup(testCase.description, {
                  size: 8,
                  color: [120, 133, 154],
                  indent: 8,
                  spacing: 1.5,
                })
              );
            }
          });

          if (testCases.length > 6) {
            blockEntries.push(
              createGroup(
                `…plus ${testCases.length - 6} more case${
                  testCases.length - 6 === 1 ? "" : "s"
                } recorded`,
                {
                  size: 8,
                  color: [148, 163, 184],
                  indent: 4,
                  spacing: 1.5,
                }
              )
            );
          }
        } else {
          blockEntries.push(
            createGroup("No test cases were captured for this generation.", {
              size: 8.5,
              color: [148, 163, 184],
              spacing: 1.5,
            })
          );
        }

        const totalContentHeight = blockEntries.reduce(
          (sum, entry) => sum + entry.height + entry.spacing,
          0
        ) - (blockEntries.length ? blockEntries[blockEntries.length - 1].spacing : 0);
        const blockHeight = paddingY * 2 + totalContentHeight;

        checkPage(blockHeight + 10);

        const blockTop = y;
        doc.setFillColor(252, 253, 255);
        doc.roundedRect(margin, blockTop, contentWidth, blockHeight, 6, 6, "F");
        doc.setDrawColor(229, 231, 235);
        doc.roundedRect(margin, blockTop, contentWidth, blockHeight, 6, 6, "S");
        doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
        doc.roundedRect(margin, blockTop, 4, blockHeight, 6, 0, "F");

        let cursorY = blockTop + paddingY + 4;
        blockEntries.forEach((entry, entryIndex) => {
          doc.setFont("helvetica", entry.bold ? "bold" : "normal");
          doc.setFontSize(entry.size);
          doc.setTextColor(...entry.color);
          const baseX = margin + paddingX + entry.indent;
          entry.lines.forEach((line) => {
            doc.text(line, baseX, cursorY);
            cursorY += entry.lineHeight;
          });
          if (entryIndex !== blockEntries.length - 1) {
            cursorY += entry.spacing;
          }
        });

        y = blockTop + blockHeight + 10;
      };

      const drawHeader = () => {
        doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
        doc.rect(0, 0, pageWidth, 46, "F");
        doc.setFillColor(67, 56, 202);
        doc.circle(pageWidth - 30, -8, 50, "F");
        doc.setFillColor(129, 140, 248);
        doc.circle(pageWidth - 65, 10, 32, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text("Testing Agent", margin, 22);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text("Automated Test Case Intelligence Report", margin, 32);

        doc.setFontSize(9);
        doc.text(`Project: ${projectName}`, pageWidth - margin - 60, 18);
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 60, 26);

        drawPageDecorations();
        y = 56;
      };

      drawHeader();
      sectionTitle("Executive Summary", "A concise view of automated generations and their resulting coverage.");
      drawIntroParagraph();

      const totalGenerations = testCaseData.length;
      const totalTestCases = testCaseData.reduce(
        (sum, gen) => sum + (gen.test_cases?.length || 0),
        0
      );
      const avgPerGeneration = totalGenerations
        ? (totalTestCases / totalGenerations).toFixed(1)
        : "0";
      const lastRun = testCaseData
        .map((record) => record.updated_at || record.created_at)
        .filter(Boolean)
        .map((value) => new Date(value))
        .filter((date) => !Number.isNaN(date.getTime()))
        .sort((a, b) => b.getTime() - a.getTime())[0];

      renderSummaryCards([
        {
          label: "Total Generations",
          value: totalGenerations,
          helper: "Completed runs executed by the testing agent.",
        },
        {
          label: "Total Test Cases",
          value: totalTestCases,
          helper: "Aggregated across all captured generations.",
        },
        {
          label: "Avg Cases per Run",
          value: avgPerGeneration,
          helper: "Indicates coverage depth for each generation.",
        },
        {
          label: "Most Recent Run",
          value: lastRun ? lastRun.toLocaleString() : "No date available",
          helper: "Timestamp from the most recent generation event.",
        },
      ]);

      sectionTitle(
        "Test Case Generations",
        "Detailed breakdown of each automated generation with priority mix, runtime and highlighted cases."
      );

      testCaseData.forEach((generation, idx) => {
        renderGenerationBlock(generation, idx);
      });

      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        // Subtle line
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
          align: "center",
        });
        doc.text("Generated by Testing Agent", margin, pageHeight - 10);
      }

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