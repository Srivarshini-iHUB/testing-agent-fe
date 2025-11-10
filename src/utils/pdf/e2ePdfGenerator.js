import jsPDF from "jspdf";
import { dialog } from "../dialogService";

export class E2EPdfGenerator {
  static generatePdf(e2eData, projectName = "Project", filename = null) {
    let reports = [];
    if (Array.isArray(e2eData?.reports)) {
      reports = e2eData.reports;
    } else if (Array.isArray(e2eData)) {
      reports = e2eData;
    } else if (Array.isArray(e2eData?.data)) {
      reports = e2eData.data;
    } else if (Array.isArray(e2eData?.e2e_reports)) {
      reports = e2eData.e2e_reports;
    } else if (Array.isArray(e2eData?.runs)) {
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
      const margin = 18;
      const contentWidth = pageWidth - 2 * margin;
      const accentColor = { r: 147, g: 51, b: 234 };
      const accentSoft = { r: 168, g: 85, b: 247 };
      const neutralText = [55, 65, 81];
      const successColor = [34, 197, 94];
      const warningColor = [234, 179, 8];
      const failureColor = [239, 68, 68];
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

      const truncate = (value, length = 220) => {
        if (typeof value !== "string") return value;
        if (value.length <= length) return value;
        return `${value.slice(0, length)}…`;
      };

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
          "This end-to-end report summarizes functional journeys executed by the Testing Agent—review consolidated metrics, execution history, and highlighted outcomes.";
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

      const renderRunBlock = (report, idx) => {
        const runId = report?.id || report?._id || report?.run_id || `run_${idx + 1}`;
        const runLabel =
          report?.name || report?.title || report?.summary || `Run ${idx + 1}`;
        const paddingX = 12;
        const paddingY = 12;
        const innerWidth = contentWidth - paddingX * 2;
        const blockEntries = [];
        const resolveLineHeight = (size) => Math.max(4.2, size * 0.46);

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

        const pushIfContent = (text, options) => {
          if (!text) return;
          blockEntries.push(createGroup(text, options));
        };

        blockEntries.push(
          createGroup(`E2E Run #${idx + 1}`, {
            size: 12,
            bold: true,
            color: [17, 24, 39],
            spacing: 3.5,
          })
        );
        blockEntries.push(
          createGroup(runLabel, {
            size: 9,
            color: [79, 70, 229],
            spacing: 2.5,
          })
        );
        blockEntries.push(
          createGroup(`Identifier: ${runId}`, {
            size: 9,
            color: [100, 116, 139],
            spacing: 1.5,
          })
        );

        const timelineBits = [];
        timelineBits.push(`Created • ${formatDate(report?.created_at)}`);
        timelineBits.push(`Updated • ${formatDate(report?.updated_at)}`);
        if (report?.triggered_by) {
          timelineBits.push(`Triggered by ${report.triggered_by}`);
        }
        blockEntries.push(
          createGroup(timelineBits.join("    |    "), {
            size: 9,
            color: [71, 85, 105],
            spacing: 1.5,
          })
        );

        if (report?.environment) {
          pushIfContent(`Environment: ${report.environment}`, {
            size: 8.5,
            color: [71, 85, 105],
            spacing: 1.5,
          });
        }
        if (report?.project_url) {
          pushIfContent(`Project URL: ${report.project_url}`, {
            size: 8.5,
            color: [79, 70, 229],
            spacing: 1.5,
          });
        }

        const totalPassed = report?.passed ?? report?.summary?.passed ?? 0;
        const totalFailed = report?.failed ?? report?.summary?.failed ?? 0;
        const totalSkipped = report?.skipped ?? report?.summary?.skipped ?? 0;
        const totalTests =
          report?.total_tests ??
          report?.summary?.total ??
          report?.summary?.executed ??
          totalPassed + totalFailed + (totalSkipped || 0);
        const passRate = totalTests
          ? `${Math.round((totalPassed / totalTests) * 100)}%`
          : "—";
        const metricLine = [
          `Passed ${totalPassed}`,
          `Failed ${totalFailed}`,
          totalSkipped ? `Skipped ${totalSkipped}` : null,
          `Total ${totalTests}`,
          `Pass Rate ${passRate}`,
        ]
          .filter(Boolean)
          .join("    •    ");
        blockEntries.push(
          createGroup(metricLine, {
            size: 9,
            color: [129, 140, 248],
            spacing: 2,
          })
        );

        pushIfContent(`Duration: ${report?.duration || report?.execution_time || "Not captured"}`, {
          size: 8.5,
          color: [91, 97, 110],
          spacing: 1.5,
        });

        if (report?.notes || report?.description) {
          pushIfContent(truncate(report.notes || report.description, 260), {
            size: 8,
            color: [107, 114, 128],
            spacing: 2.5,
          });
        }

        const testCases = Array.isArray(report?.test_cases)
          ? report.test_cases
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
              testCase?.test_scenario ||
              testCase?.scenario_name ||
              testCase?.feature_name ||
              testCase?.name ||
              `Test Case ${index + 1}`;
            const contextBits = [];
            if (testCase?.test_type) {
              contextBits.push(`Type: ${capitalize(testCase.test_type)}`);
            }
            if (testCase?.priority) {
              contextBits.push(`Priority: ${capitalize(testCase.priority)}`);
            }
            if (testCase?.status) {
              contextBits.push(`Status: ${capitalize(testCase.status)}`);
            }
            const headline = contextBits.length
              ? `${index + 1}. ${label} (${contextBits.join(" · ")})`
              : `${index + 1}. ${label}`;
            blockEntries.push(
              createGroup(headline, {
                size: 9,
                color: [45, 55, 72],
                indent: 4,
                spacing: 1.5,
              })
            );

            if (testCase?.notes || testCase?.description) {
              blockEntries.push(
                createGroup(truncate(testCase.notes || testCase.description, 200), {
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
                } captured in this run`,
                {
                  size: 8,
                  color: [148, 163, 184],
                  indent: 4,
                  spacing: 1.5,
                }
              )
            );
          }
        }

        const testResults = Array.isArray(report?.test_results)
          ? report.test_results
          : [];
        if (testResults.length) {
          blockEntries.push(
            createGroup("Latest Execution Results", {
              size: 9,
              bold: true,
              color: [30, 41, 59],
              spacing: 3,
            })
          );

          testResults.slice(0, 6).forEach((result, index) => {
            const status = String(result?.status || "UNKNOWN").toUpperCase();
            let statusColor = neutralText;
            if (["PASS", "PASSED", "SUCCESS"].includes(status)) {
              statusColor = successColor;
            } else if (["WARN", "SKIPPED", "PENDING"].includes(status)) {
              statusColor = warningColor;
            } else if (["FAIL", "FAILED", "ERROR"].includes(status)) {
              statusColor = failureColor;
            }

            const title = result?.name || result?.test_name || `Result ${index + 1}`;
            const descriptor = [
              status,
              result?.duration ? `Duration: ${result.duration}` : null,
              result?.browser ? `Browser: ${result.browser}` : null,
            ]
              .filter(Boolean)
              .join("  ·  ");

            blockEntries.push(
              createGroup(`${index + 1}. ${title}`, {
                size: 8.5,
                color: [45, 55, 72],
                indent: 4,
                spacing: 1,
              })
            );
            blockEntries.push(
              createGroup(descriptor || status, {
                size: 8,
                color: statusColor,
                indent: 8,
                spacing: 1.5,
              })
            );

            if (statusColor === failureColor && result?.error_message) {
              blockEntries.push(
                createGroup(truncate(result.error_message, 260), {
                  size: 7.8,
                  color: failureColor,
                  indent: 10,
                  spacing: 1.5,
                })
              );
            }
          });

          if (testResults.length > 6) {
            blockEntries.push(
              createGroup(
                `…plus ${testResults.length - 6} additional result${
                  testResults.length - 6 === 1 ? "" : "s"
                } logged`,
                {
                  size: 8,
                  color: [148, 163, 184],
                  indent: 4,
                  spacing: 1.5,
                }
              )
            );
          }
        }

        const totalContentHeight = blockEntries.reduce(
          (sum, entry) => sum + entry.height + entry.spacing,
          0
        ) - (blockEntries.length
          ? blockEntries[blockEntries.length - 1].spacing
          : 0);

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
        doc.setFillColor(119, 44, 232);
        doc.circle(pageWidth - 30, -12, 52, "F");
        doc.setFillColor(216, 180, 254);
        doc.circle(pageWidth - 68, 12, 34, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(21);
        doc.setTextColor(255, 255, 255);
        doc.text("Testing Agent", margin, 22);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text("End-to-End Functional Execution Report", margin, 32);

        doc.setFontSize(9);
        doc.text(`Project: ${projectName}`, pageWidth - margin - 64, 18);
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 64, 26);

        drawPageDecorations();
        y = 56;
      };

      drawHeader();
      sectionTitle("Executive Summary", "Functional journeys executed by the testing agent across recent automated runs.");
      drawIntroParagraph();

      const totalRuns = reports.length;
      const totals = reports.reduce(
        (acc, report) => {
          acc.passed += report?.passed || report?.summary?.passed || 0;
          acc.failed += report?.failed || report?.summary?.failed || 0;
          acc.skipped += report?.skipped || report?.summary?.skipped || 0;
          acc.tests +=
            report?.total_tests ||
            report?.summary?.total ||
            report?.summary?.executed ||
            0;
          return acc;
        },
        { passed: 0, failed: 0, skipped: 0, tests: 0 }
      );
      const avgDuration = (() => {
        const durations = reports
          .map((report) => report?.duration_seconds || report?.duration)
          .filter((value) => typeof value === "number" && !Number.isNaN(value));
        if (!durations.length) return "Not captured";
        const avg = durations.reduce((sum, value) => sum + value, 0) / durations.length;
        return `${avg.toFixed(1)}s average duration`;
      })();
      const passRate = totals.tests
        ? `${((totals.passed / totals.tests) * 100).toFixed(1)}%`
        : "No executions";
      const lastRun = reports
        .map((report) => report?.updated_at || report?.created_at)
        .filter(Boolean)
        .map((value) => new Date(value))
        .filter((date) => !Number.isNaN(date.getTime()))
        .sort((a, b) => b.getTime() - a.getTime())[0];

      renderSummaryCards([
        {
          label: "Total Runs",
          value: totalRuns,
          helper: "Automated E2E executions captured in this report.",
        },
        {
          label: "Total Tests",
          value: totals.tests,
          helper: "Aggregate count across all runs.",
        },
        {
          label: "Pass Rate",
          value: passRate,
          helper: `Pass ${totals.passed} • Fail ${totals.failed} • Skip ${totals.skipped}`,
        },
        {
          label: "Average Duration",
          value: avgDuration,
          helper: lastRun ? `Last Run: ${lastRun.toLocaleString()}` : "No timestamps captured",
        },
      ]);

      sectionTitle(
        "Run Breakdown",
        "Detailed context for each automated end-to-end execution including highlighted cases and result excerpts."
      );

      reports.forEach((report, idx) => {
        renderRunBlock(report, idx);
      });

      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
          align: "center",
        });
        doc.text("Generated by Testing Agent", margin, pageHeight - 10);
      }

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

