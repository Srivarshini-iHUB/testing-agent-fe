import jsPDF from "jspdf";
import { dialog } from "../dialogService";

export class RegressionPdfGenerator {
  static generatePdf(regressionData, projectName = "Project", filename = null) {
    const regressionTest = regressionData?.regression_test;
    const runs = Array.isArray(regressionTest?.regression_runs)
      ? regressionTest.regression_runs
      : [];

    if (!regressionTest || !runs.length) {
       dialog.alert({
        title: "No data available",
        message: "No regression test data available to generate PDF report.",
        variant: "warning",
      });
      return;
    }

    const testData = regressionData.regression_test;


    if (runs.length === 0) {
      alert("No regression test runs available to generate PDF report");
      return;
    }

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 18;
      const contentWidth = pageWidth - 2 * margin;
      const accentColor = { r: 6, g: 182, b: 212 };
      const accentSoft = { r: 34, g: 211, b: 238 };
      const neutralText = [51, 65, 85];
      const successColor = [34, 197, 94];
      const warningColor = [251, 191, 36];
      const dangerColor = [248, 113, 113];
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

      const formatPercent = (num, denom) => {
        if (!denom) return "—";
        return `${((num / denom) * 100).toFixed(1)}%`;
      };

      const formatStatusColor = (status) => {
        const normalized = String(status || "unknown").toLowerCase();
        if (["pass", "passed", "complete"].includes(normalized)) return successColor;
        if (["partial", "in_progress", "running"].includes(normalized)) return warningColor;
        if (["fail", "failed", "blocked", "error"].includes(normalized)) return dangerColor;
        return [148, 163, 184];
      };

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
        doc.setDrawColor(224, 242, 254);
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
        doc.setDrawColor(224, 242, 254);
        doc.setLineWidth(0.2);
        doc.line(margin + 35, y, pageWidth - margin, y);
        y += 8;
      };

      const drawIntroParagraph = () => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...neutralText);
        const intro =
          "Regression automation ensures bug fix stability across critical releases. Explore run summaries, verification outcomes, and reopened defect signals produced by the Testing Agent.";
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
          doc.setFillColor(236, 254, 255);
          doc.roundedRect(x, rowTop, cardWidth, cardHeight, 4, 4, "F");
          doc.setDrawColor(186, 230, 253);
          doc.roundedRect(x, rowTop, cardWidth, cardHeight, 4, 4, "S");

          doc.setFillColor(accentSoft.r, accentSoft.g, accentSoft.b);
          doc.circle(x + 6, rowTop + 10, 2, "F");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(accentSoft.r, accentSoft.g, accentSoft.b);
          doc.text(card.label.toUpperCase(), x + 12, rowTop + 11);

          doc.setFontSize(13);
          doc.setTextColor(14, 116, 144);
          doc.text(String(card.value), x + 12, rowTop + 21);

          if (card.helper) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
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

      const renderRunBlock = (run, idx) => {
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

        const runIndex = run?.run_index ?? idx + 1;
        blockEntries.push(
          createGroup(`Regression Run #${runIndex}`, {
            size: 12,
            bold: true,
            color: [13, 148, 136],
            spacing: 3.5,
          })
        );

        const createdAt = formatDate(run?.created_at);
        const updatedAt = formatDate(run?.updated_at);
        blockEntries.push(
          createGroup(`Created • ${createdAt}    |    Updated • ${updatedAt}`, {
            size: 9,
            color: [45, 55, 72],
            spacing: 1.5,
          })
        );

        pushIfContent(`Duration: ${run?.duration || "Not provided"}`, {
          size: 8.5,
          color: [71, 85, 105],
          spacing: 1.5,
        });

        const ownerLine = [
          run?.executed_by ? `Executed by ${run.executed_by}` : null,
          run?.release_label ? `Release ${run.release_label}` : null,
          run?.environment ? `Env ${run.environment}` : null,
        ]
          .filter(Boolean)
          .join("    |    ");
        pushIfContent(ownerLine, {
          size: 8,
          color: [100, 116, 139],
          spacing: 2,
        });

        const statsLine = [
          `Tested ${run?.total_bugs_tested || 0}`,
          `Verified ${run?.bugs_verified || 0}`,
          `Reopened ${run?.bugs_reopened || 0}`,
          `Verification Rate ${formatPercent(run?.bugs_verified || 0, run?.total_bugs_tested || 0)}`,
        ].join("    •    ");
        blockEntries.push(
          createGroup(statsLine, {
            size: 8.5,
            color: [22, 163, 140],
            spacing: 2,
          })
        );

        if (run?.status_notes) {
          pushIfContent(truncate(run.status_notes, 240), {
            size: 8,
            color: [107, 114, 128],
            spacing: 2,
          });
        }

        if (Array.isArray(run?.modules) && run.modules.length) {
          blockEntries.push(
            createGroup("Modules Covered", {
              size: 9,
              bold: true,
              color: [30, 41, 59],
              spacing: 3,
            })
          );

          run.modules.slice(0, 6).forEach((module, index) => {
            blockEntries.push(
              createGroup(`${index + 1}. ${module.module_name || module.name || "Module"}`, {
                size: 8.5,
                color: [45, 55, 72],
                indent: 4,
                spacing: 1.5,
              })
            );

            if (module?.defects_found !== undefined || module?.defects_verified !== undefined) {
              blockEntries.push(
                createGroup(
                  `Defects Found ${module.defects_found || 0} • Verified ${module.defects_verified || 0}`,
                  {
                    size: 7.8,
                    color: [71, 85, 105],
                    indent: 8,
                    spacing: 1.5,
                  }
                )
              );
            }

            if (module?.notes) {
              blockEntries.push(
                createGroup(truncate(module.notes, 180), {
                  size: 7.8,
                  color: [120, 133, 154],
                  indent: 8,
                  spacing: 1.5,
                })
              );
            }
          });

          if (run.modules.length > 6) {
            blockEntries.push(
              createGroup(
                `…plus ${run.modules.length - 6} additional module${
                  run.modules.length - 6 === 1 ? "" : "s"
                } tracked`,
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

        if (Array.isArray(run?.reopened_defects) && run.reopened_defects.length) {
          blockEntries.push(
            createGroup("Reopened Defects", {
              size: 9,
              bold: true,
              color: dangerColor,
              spacing: 3,
            })
          );

          run.reopened_defects.slice(0, 5).forEach((defect, index) => {
            blockEntries.push(
              createGroup(`${index + 1}. ${defect.key || defect.id || "Defect"}`, {
                size: 8.5,
                color: dangerColor,
                indent: 4,
                spacing: 1.5,
              })
            );
            if (defect?.summary) {
              blockEntries.push(
                createGroup(truncate(defect.summary, 180), {
                  size: 7.8,
                  color: [107, 114, 128],
                  indent: 8,
                  spacing: 1.5,
                })
              );
            }
          });

          if (run.reopened_defects.length > 5) {
            blockEntries.push(
              createGroup(
                `…plus ${run.reopened_defects.length - 5} more reopened defect${
                  run.reopened_defects.length - 5 === 1 ? "" : "s"
                }`,
                {
                  size: 8,
                  color: dangerColor,
                  indent: 4,
                  spacing: 1.5,
                }
              )
            );
          }
        }

        if (Array.isArray(run?.notes_list) && run.notes_list.length) {
          blockEntries.push(
            createGroup("Run Notes", {
              size: 9,
              bold: true,
              color: [30, 41, 59],
              spacing: 3,
            })
          );

          run.notes_list.slice(0, 4).forEach((note, index) => {
            blockEntries.push(
              createGroup(`${index + 1}. ${truncate(note, 220)}`, {
                size: 8,
                color: [100, 116, 139],
                indent: 4,
                spacing: 1.5,
              })
            );
          });
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
        doc.setFillColor(240, 253, 255);
        doc.roundedRect(margin, blockTop, contentWidth, blockHeight, 6, 6, "F");
        doc.setDrawColor(186, 230, 253);
        doc.roundedRect(margin, blockTop, contentWidth, blockHeight, 6, 6, "S");
        doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
        doc.roundedRect(margin, blockTop, 4, blockHeight, 6, 0, "F");

        const statusBadgeColor = formatStatusColor(run?.status);
        doc.setFillColor(...statusBadgeColor);
        doc.roundedRect(pageWidth - margin - 34, blockTop + 8, 28, 8, 3, 3, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text(String(run?.status || "Unknown").toUpperCase(), pageWidth - margin - 20, blockTop + 14, {
          align: "center",
        });

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
        doc.setFillColor(14, 165, 233);
        doc.circle(pageWidth - 30, -12, 52, "F");
        doc.setFillColor(125, 211, 252);
        doc.circle(pageWidth - 68, 12, 34, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(21);
        doc.setTextColor(255, 255, 255);
        doc.text("Testing Agent", margin, 22);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text("Regression Stability Report", margin, 32);

        doc.setFontSize(9);
        doc.text(`Project: ${projectName}`, pageWidth - margin - 66, 18);
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 66, 26);

        drawPageDecorations();
        y = 56;
      };

      drawHeader();
      sectionTitle("Executive Summary", "Automated regression confidence for the selected release cadence.");
      drawIntroParagraph();

      const totalRuns = runs.length;
      const totalBugsTested = runs.reduce(
        (sum, run) => sum + (run?.total_bugs_tested || 0),
        0
      );
      const bugsVerified = runs.reduce(
        (sum, run) => sum + (run?.bugs_verified || 0),
        0
      );
      const bugsReopened = runs.reduce(
        (sum, run) => sum + (run?.bugs_reopened || 0),
        0
      );
      const verificationRate = formatPercent(bugsVerified, totalBugsTested);
      const lastRun = runs
        .map((run) => run?.updated_at || run?.created_at)
        .filter(Boolean)
        .map((value) => new Date(value))
        .filter((date) => !Number.isNaN(date.getTime()))
        .sort((a, b) => b.getTime() - a.getTime())[0];

      renderSummaryCards([
        {
          label: "Total Runs",
          value: totalRuns,
          helper: `Latest index ${regressionTest?.latest_run_index ?? totalRuns - 1}`,
        },
        {
          label: "Bugs Verified",
          value: bugsVerified,
          helper: `Verified of ${totalBugsTested} tested overall.`,
        },
        {
          label: "Verification Rate",
          value: verificationRate,
          helper: `Reopened defects: ${bugsReopened}`,
        },
        {
          label: "Most Recent Activity",
          value: lastRun ? lastRun.toLocaleString() : "Timestamp unavailable",
          helper: regressionTest?.bug_sheet_url
            ? `Bug sheet: ${regressionTest.bug_sheet_url}`
            : "Bug sheet link not provided",
        },
      ]);

      sectionTitle(
        "Run Breakdown",
        "Examine each regression cycle with coverage stats, reopened defects, and supporting notes."
      );

      runs.forEach((run, idx) => {
        renderRunBlock(run, idx);
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
        filename = `regression_report_${ts}.pdf`;
      }

      doc.save(filename);
      console.log("✅ Regression PDF report generated successfully");
    } catch (err) {
      console.error("❌ Regression PDF generation failed:", err);
      dialog.alert({
        title: "Export failed",
        message: "Failed to generate Regression PDF report. Please try again.",
        variant: "danger",
      });
    }
  }
}

export default RegressionPdfGenerator;

