import jsPDF from "jspdf";
import { dialog } from "../dialogService";


export class PerformancePdfGenerator {
  static generatePdf(performanceData, projectName = "Project", filename = null) {
    const targets = Array.isArray(performanceData?.items)
      ? performanceData.items
      : [];

    if (!targets.length) {
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
      const margin = 18;
      const contentWidth = pageWidth - 2 * margin;
      const accentColor = { r: 79, g: 70, b: 229 };
      const accentSoft = { r: 129, g: 140, b: 248 };
      const neutralText = [55, 65, 81];
      const performanceGreen = [34, 197, 94];
      const performanceAmber = [251, 191, 36];
      const performanceRed = [248, 113, 113];
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

      const formatNumber = (value, digits = 1) => {
        if (value === null || value === undefined || Number.isNaN(value)) {
          return "-";
        }
        const number = Number(value);
        if (Number.isNaN(number)) return String(value);
        if (Math.abs(number) >= 1000) {
          return `${number.toFixed(digits)}${digits ? "" : ""}`;
        }
        return number.toFixed(digits);
      };

      const formatLatency = (value) => {
        if (value === null || value === undefined || value === "-") return "-";
        const number = Number(value);
        if (Number.isNaN(number)) return String(value);
        if (number >= 1000) {
          return `${(number / 1000).toFixed(1)} s`;
        }
        return `${number.toFixed(1)} ms`;
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
          "This performance digest surfaces the most recent load and stress tests executed by the Testing Agent. Review throughput, latency, and capacity signs across your monitored endpoints.";
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
          doc.setFillColor(245, 245, 255);
          doc.roundedRect(x, rowTop, cardWidth, cardHeight, 4, 4, "F");
          doc.setDrawColor(222, 223, 255);
          doc.roundedRect(x, rowTop, cardWidth, cardHeight, 4, 4, "S");

          doc.setFillColor(accentSoft.r, accentSoft.g, accentSoft.b);
          doc.circle(x + 6, rowTop + 10, 2, "F");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(accentSoft.r, accentSoft.g, accentSoft.b);
          doc.text(card.label.toUpperCase(), x + 12, rowTop + 11);

          doc.setFontSize(13);
          doc.setTextColor(37, 99, 235);
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

      const renderTargetBlock = (target, idx) => {
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

        const runs = Array.isArray(target?.runs) ? target.runs : [];
        const totalExecutions = runs.length;
        const successRates = runs
          .map((run) => Number(run?.response?.successRate))
          .filter((value) => !Number.isNaN(value));
        const avgSuccessRate = successRates.length
          ? `${(successRates.reduce((sum, rate) => sum + rate, 0) / successRates.length).toFixed(1)}%`
          : "—";
        const avgLatency = (() => {
          const latencies = runs
            .map((run) => Number(run?.response?.avgLatency))
            .filter((value) => !Number.isNaN(value));
          if (!latencies.length) return "—";
          return formatLatency(
            latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length
          );
        })();

        blockEntries.push(
          createGroup(`Target #${idx + 1}`, {
            size: 12,
            bold: true,
            color: [37, 99, 235],
            spacing: 3,
          })
        );
        blockEntries.push(
          createGroup(`${target?.method || "GET"} ${target?.url || "Unknown endpoint"}`, {
            size: 9,
            color: [30, 41, 59],
            spacing: 2.5,
          })
        );

        const descriptorBits = [];
        descriptorBits.push(`Mode • ${(target?.testMode || "N/A").toString().toUpperCase()}`);
        descriptorBits.push(`Executions • ${totalExecutions}`);
        descriptorBits.push(`Avg Success • ${avgSuccessRate}`);
        descriptorBits.push(`Avg Latency • ${avgLatency}`);
        blockEntries.push(
          createGroup(descriptorBits.join("    |    "), {
            size: 8.5,
            color: [79, 70, 229],
            spacing: 2,
          })
        );

        if (target?.description) {
          pushIfContent(truncate(target.description, 240), {
            size: 8,
            color: [100, 116, 139],
            spacing: 2.5,
          });
        }

        if (runs.length) {
          blockEntries.push(
            createGroup("Execution Highlights", {
              size: 9,
              bold: true,
              color: [30, 41, 59],
              spacing: 3,
            })
          );

          runs.slice(0, 5).forEach((run, index) => {
            const timestamp = formatDate(run?.timestamp || run?.created_at);
            const requestConfig = run?.request || {};
            const responseMetrics = run?.response || {};

            blockEntries.push(
              createGroup(`${index + 1}. Execution @ ${timestamp}`, {
                size: 8.8,
                color: [45, 55, 72],
                indent: 4,
                spacing: 1.5,
              })
            );

            const configBits = [];
            if (requestConfig.duration !== undefined) {
              configBits.push(`Duration ${requestConfig.duration}s`);
            }
            if (requestConfig.connections !== undefined) {
              configBits.push(`Connections ${requestConfig.connections}`);
            }
            if (requestConfig.rate !== undefined) {
              configBits.push(`Rate ${requestConfig.rate}/s`);
            }
            if (configBits.length) {
              blockEntries.push(
                createGroup(`Config: ${configBits.join(" • ")}`, {
                  size: 8,
                  color: [71, 85, 105],
                  indent: 8,
                  spacing: 1.5,
                })
              );
            }

            const perfBits = [];
            if (responseMetrics.avgLatency !== undefined) {
              perfBits.push(`Latency ${formatLatency(responseMetrics.avgLatency)}`);
            }
            if (responseMetrics.requestsPerSec !== undefined) {
              perfBits.push(`Throughput ${formatNumber(responseMetrics.requestsPerSec, 0)} req/s`);
            }
            if (responseMetrics.successRate !== undefined) {
              perfBits.push(`Success ${formatNumber(responseMetrics.successRate, 1)}%`);
            }
            if (responseMetrics.totalRequests !== undefined) {
              perfBits.push(`Requests ${responseMetrics.totalRequests}`);
            }
            if (perfBits.length) {
              blockEntries.push(
                createGroup(`Performance: ${perfBits.join(" • ")}`, {
                  size: 8,
                  color: performanceGreen,
                  indent: 8,
                  spacing: 1.5,
                })
              );
            }

            if (responseMetrics.latency) {
              const percentileLine = Object.entries(responseMetrics.latency)
                .map(([key, val]) => `${key.toUpperCase()} ${formatLatency(val)}`)
                .join(" • ");
              blockEntries.push(
                createGroup(`Latency spread: ${percentileLine}`, {
                  size: 7.8,
                  color: [107, 114, 128],
                  indent: 8,
                  spacing: 1.5,
                })
              );
            }

            const statusLine = (() => {
              const codes = ["2xx", "3xx", "4xx", "5xx"]
                .map((code) =>
                  responseMetrics[code] !== undefined
                    ? `${code}: ${responseMetrics[code]}`
                    : null
                )
                .filter(Boolean)
                .join(" • ");
              return codes ? `Status: ${codes}` : null;
            })();
            if (statusLine) {
              blockEntries.push(
                createGroup(statusLine, {
                  size: 7.8,
                  color: performanceAmber,
                  indent: 8,
                  spacing: 1.5,
                })
              );
            }

            if (responseMetrics.error && responseMetrics.error !== "OK") {
              blockEntries.push(
                createGroup(`Error: ${truncate(responseMetrics.error, 200)}`, {
                  size: 7.8,
                  color: performanceRed,
                  indent: 8,
                  spacing: 1.5,
                })
              );
            }
          });

          if (runs.length > 5) {
            blockEntries.push(
              createGroup(
                `…plus ${runs.length - 5} additional execution${runs.length - 5 === 1 ? "" : "s"} captured`,
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
            createGroup("No executions recorded for this target.", {
              size: 8.5,
              color: [148, 163, 184],
              spacing: 1.5,
            })
          );
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
        doc.setFillColor(250, 250, 255);
        doc.roundedRect(margin, blockTop, contentWidth, blockHeight, 6, 6, "F");
        doc.setDrawColor(226, 232, 255);
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
        doc.circle(pageWidth - 30, -12, 52, "F");
        doc.setFillColor(165, 180, 252);
        doc.circle(pageWidth - 68, 12, 34, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(21);
        doc.setTextColor(255, 255, 255);
        doc.text("Testing Agent", margin, 22);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text("Performance Insights Report", margin, 32);

        doc.setFontSize(9);
        doc.text(`Project: ${projectName}`, pageWidth - margin - 66, 18);
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 66, 26);

        drawPageDecorations();
        y = 56;
      };

      drawHeader();
      sectionTitle("Executive Summary", "Key load and stress executions across observed performance targets.");
      drawIntroParagraph();

      const totalTargets = targets.length;
      const totalExecutions = targets.reduce(
        (sum, target) => sum + (Array.isArray(target?.runs) ? target.runs.length : 0),
        0
      );
      const aggregateRequests = targets.reduce((sum, target) => {
        const requests = (target?.runs || []).reduce(
          (acc, run) => acc + (run?.response?.totalRequests || 0),
          0
        );
        return sum + requests;
      }, 0);
      const fastestEndpoint = (() => {
        let best = null;
        targets.forEach((target) => {
          (target?.runs || []).forEach((run) => {
            const latency = Number(run?.response?.avgLatency);
            if (Number.isNaN(latency)) return;
            if (!best || latency < best.latency) {
              best = {
                latency,
                label: `${target?.method || "GET"} ${target?.url || "Endpoint"}`,
              };
            }
          });
        });
        return best;
      })();
      const lastExecution = targets
        .flatMap((target) => target?.runs || [])
        .map((run) => run?.timestamp || run?.created_at)
        .filter(Boolean)
        .map((value) => new Date(value))
        .filter((date) => !Number.isNaN(date.getTime()))
        .sort((a, b) => b.getTime() - a.getTime())[0];

      renderSummaryCards([
        {
          label: "Performance Targets",
          value: totalTargets,
          helper: "Distinct endpoints monitored by the agent.",
        },
        {
          label: "Total Executions",
          value: totalExecutions,
          helper: `Cumulative requests processed: ${aggregateRequests}`,
        },
        {
          label: "Fastest Avg Latency",
          value: fastestEndpoint ? formatLatency(fastestEndpoint.latency) : "Not captured",
          helper: fastestEndpoint ? fastestEndpoint.label : "No latency data provided.",
        },
        {
          label: "Most Recent Execution",
          value: lastExecution ? lastExecution.toLocaleString() : "Timestamp unavailable",
          helper: "Derived from captured run metadata.",
        },
      ]);

      sectionTitle(
        "Target Breakdown",
        "Review each monitored endpoint with execution metrics, latency spread, and throughput signals."
      );

      targets.forEach((target, idx) => {
        renderTargetBlock(target, idx);
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
