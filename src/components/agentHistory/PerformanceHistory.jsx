import React, { useEffect, useMemo, useState } from 'react';
import { performanceApi } from '../../api/performanceApi';

const formatDate = (value) => {
  if (!value) return '-';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  } catch (e) {
    return value;
  }
};

const DownloadJsonButton = ({ fileName, data }) => {
  const handleDownload = () => {
    try {
      const json = JSON.stringify(data ?? {}, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download JSON', err);
    }
  };

  return (
    <button onClick={handleDownload} title="Download JSON" style={styles.downloadBtn}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      <span style={{ marginLeft: 8 }}>Download</span>
    </button>
  );
};

const PerformanceHistory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [expandedRuns, setExpandedRuns] = useState({});

  const proj = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('project') || 'null');
    } catch {
      return null;
    }
  }, []);

  const projectId = proj?.id;

  const totals = useMemo(() => {
    let totalRuns = 0;
    let totalExecutions = 0;
    (items || []).forEach((it) => {
      totalRuns += 1;
      totalExecutions += (it.runs || []).length;
    });
    return { totalRuns, totalExecutions };
  }, [items]);

  const toggleItem = (id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  };

  const toggleRun = (id) => {
    setExpandedRuns((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  };

  useEffect(() => {
    let mounted = true;
    const fetchRuns = async () => {
      if (!projectId) return;
      setLoading(true);
      setError('');
      try {
        const res = await performanceApi.getProjectTestRuns(projectId);
        if (mounted) setItems(res?.items || []);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load performance runs');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchRuns();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  if (!projectId) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Performance Testing - Test Runs</h2>
        <div style={styles.note}>No project selected. Please select a project.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Performance Testing - Test Runs</h2>

      {loading && <div style={styles.note}>Loading…</div>}
      {error && <div style={styles.error}>{error}</div>}

      {!loading && !error && (
        <>
          <div style={styles.summaryRow}>
            <div style={styles.summaryItem}><strong>Targets:</strong> {totals.totalRuns}</div>
            <div style={styles.summaryItem}><strong>Total Executions:</strong> {totals.totalExecutions}</div>
          </div>

          {(items || []).map((it) => (
            <div key={it.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.headerLeft}>
                  <div style={styles.docId}><strong>Target:</strong> {it.method} {it.url}</div>
                  <div style={styles.meta}><strong>Mode:</strong> {it.testMode?.toUpperCase?.() || it.testMode}</div>
                </div>
                <div style={styles.headerRight}>
                  <div style={styles.badge}>Executions: {(it.runs || []).length}</div>
                  <button
                    onClick={() => toggleItem(it.id)}
                    title="Toggle item details"
                    aria-label={(expandedItems[it.id] ?? true) ? 'Collapse' : 'Expand'}
                    style={styles.toggleBtn}
                  >
                    {(expandedItems[it.id] ?? true) ? '▼' : '▶'}
                  </button>
                </div>
              </div>

              {(expandedItems[it.id] ?? true) && (
                <div>
                  {(it.runs || []).map((run, idx) => {
                    const runId = `${it.id}_${idx}`;
                    const resp = run?.response || {};
                    const req = run?.request || {};
                    const metrics = {
                      avgLatency: resp.avgLatency,
                      requestsPerSec: resp.requestsPerSec,
                      successRate: resp.successRate,
                      totalRequests: resp.totalRequests,
                    };
                    const downloadable = { id: it.id, url: it.url, method: it.method, testMode: it.testMode, timestamp: run?.timestamp, request: req, response: resp };
                    return (
                      <div key={runId} style={styles.runBlock}>
                        <div style={styles.runHeader}>
                          <div>
                            <div style={styles.meta}><strong>Timestamp:</strong> {formatDate(run?.timestamp)}</div>
                            <div style={styles.metaSmall}><strong>Duration:</strong> {req?.duration ?? req?.stressConfig?.durationPerStep ?? '-'}s | <strong>Connections:</strong> {req?.connections ?? req?.stressConfig?.startConnections ?? '-'}</div>
                          </div>
                          <div style={styles.scenarioActions}>
                            <button
                              onClick={() => toggleRun(runId)}
                              title="Toggle run details"
                              aria-label={(expandedRuns[runId] ?? true) ? 'Collapse run' : 'Expand run'}
                              style={styles.toggleBtn}
                            >
                              {(expandedRuns[runId] ?? true) ? '▼' : '▶'}
                            </button>
                            <DownloadJsonButton fileName={`performance_run_${it.id}_${idx}`} data={downloadable} />
                          </div>
                        </div>

                        {(expandedRuns[runId] ?? true) && (
                          <>
                            <div style={styles.metricsRow}>
                              <div style={styles.metric}><strong>Avg Latency:</strong> {metrics.avgLatency ?? 'N/A'} ms</div>
                              <div style={styles.metric}><strong>Req/Sec:</strong> {metrics.requestsPerSec ?? 'N/A'}</div>
                              <div style={styles.metric}><strong>Success Rate:</strong> {metrics.successRate ?? 'N/A'}%</div>
                              <div style={styles.metric}><strong>Total Requests:</strong> {metrics.totalRequests ?? 'N/A'}</div>
                            </div>

                            <div style={styles.subSectionTitle}>Request</div>
                            <pre style={styles.jsonBlock}><code>{JSON.stringify(req, null, 2)}</code></pre>

                            <div style={styles.subSectionTitle}>Response</div>
                            <pre style={styles.jsonBlock}><code>{JSON.stringify(resp, null, 2)}</code></pre>

                            {resp?.report && (
                              <>
                                <div style={styles.subSectionTitle}>Report</div>
                                <pre style={styles.codeBlock}><code>{resp.report}</code></pre>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: 24,
  },
  title: {
    margin: 0,
    marginBottom: 16,
  },
  note: {
    padding: 12,
    background: '#f6f8fa',
    border: '1px solid #e1e4e8',
    borderRadius: 8,
    display: 'inline-block',
  },
  error: {
    padding: 12,
    background: '#fff5f5',
    border: '1px solid #fed7d7',
    color: '#c53030',
    borderRadius: 8,
    marginBottom: 12,
  },
  summaryRow: {
    display: 'flex',
    gap: 16,
    marginBottom: 16,
  },
  summaryItem: {
    padding: '8px 12px',
    background: '#0b3d91',
    color: 'white',
    border: '1px solid #072c6b',
    borderRadius: 6,
  },
  card: {
    border: '1px solid #e1e4e8',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {},
  headerRight: {},
  docId: { marginBottom: 4 },
  meta: { color: '#586069', fontSize: 14 },
  metaSmall: { color: '#586069', fontSize: 13 },
  badge: {
    padding: '6px 10px',
    background: '#eaf5ff',
    color: '#0b3d91',
    borderRadius: 6,
    border: '1px solid #cfe3ff',
    marginRight: 8,
  },
  runBlock: {
    border: '1px dashed #e1e4e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  runHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 8,
    margin: '8px 0 12px 0',
  },
  metric: {
    padding: '6px 10px',
    color:"#101111ff",
    background: '#f6f8fa',
    border: '1px solid #e1e4e8',
    borderRadius: 6,
  },
  subSectionTitle: {
    fontWeight: 600,
    marginTop: 12,
    marginBottom: 6,
  },
  codeBlock: {
    background: '#0b1021',
    color: '#e6edf3',
    padding: 12,
    borderRadius: 6,
    overflowX: 'auto',
  },
  jsonBlock: {
    background: '#f6f8fa',
    color: '#24292e',
    padding: 12,
    borderRadius: 6,
    border: '1px solid #e1e4e8',
    overflowX: 'auto',
  },
  downloadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    background: '#1f6feb',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
  toggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 6,
    background: '#0b3d91',
    color: ' #e1e4e8',
    cursor: 'pointer',
  },
  scenarioActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
};

export default PerformanceHistory;


