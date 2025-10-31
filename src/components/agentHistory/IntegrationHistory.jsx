import React, { useEffect, useMemo, useState } from 'react';
import { integrationApi } from '../../api/integrationApi';

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
    <button onClick={handleDownload} title="Download report JSON" style={styles.downloadBtn}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      <span style={{ marginLeft: 8 }}>Download</span>
    </button>
  );
};

const IntegrationHistory = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [expandedRuns, setExpandedRuns] = useState({});
  const [expandedScenarios, setExpandedScenarios] = useState({});

  const toggleRun = (runId) => {
    setExpandedRuns((prev) => ({ ...prev, [runId]: !(prev[runId] ?? true) }));
  };

  const toggleScenario = (key) => {
    setExpandedScenarios((prev) => ({ ...prev, [key]: !(prev[key] ?? true) }));
  };

  const totals = useMemo(() => {
    if (!data) return { totalRuns: 0, totalScenarios: 0 };
    return {
      totalRuns: data.total_test_runs ?? 0,
      totalScenarios: data.total_scenarios ?? 0,
    };
  }, [data]);

  useEffect(() => {
    let mounted = true;
    const fetchRuns = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await integrationApi.getProjectTestRuns(projectId);
        if (mounted) setData(res);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load test runs');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (projectId) fetchRuns();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  if (!projectId) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Integration Testing - Test Runs</h2>
        <div style={styles.note}>Provide a valid projectId to view test runs.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Integration Testing - Test Runs</h2>

      {loading && <div style={styles.note}>Loading…</div>}
      {error && <div style={styles.error}>{error}</div>}

      {data && (
        <div>
          <div style={styles.summaryRow}>
            <div style={styles.summaryItem}><strong>Total Runs:</strong> {totals.totalRuns}</div>
            <div style={styles.summaryItem}><strong>Total Scenarios:</strong> {totals.totalScenarios}</div>
          </div>

          {(data.test_runs ?? []).map((run) => (
            <div key={run.doc_id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.headerLeft}>
                  <div style={styles.docId}><strong>Run ID:</strong> {run.doc_id}</div>
                  <div style={styles.meta}><strong>Created:</strong> {formatDate(run.created_at)}</div>
                  <div style={styles.meta}><strong>Updated:</strong> {formatDate(run.updated_at)}</div>
                </div>
                <div style={styles.headerRight}>
                  <div style={styles.badge}>Runs: {run.testrun_count ?? 0}</div>
                  <button
                    onClick={() => toggleRun(run.doc_id)}
                    title="Toggle run details"
                    aria-label={(expandedRuns[run.doc_id] ?? true) ? 'Collapse run' : 'Expand run'}
                    style={styles.toggleBtn}
                  >
                    {(expandedRuns[run.doc_id] ?? true) ? '▼' : '▶'}
                  </button>
                </div>
              </div>

              {(expandedRuns[run.doc_id] ?? true) && (
                <>
                  <div style={styles.sectionTitle}>Scenarios</div>
                  {(run.scenarios ?? []).map((sc) => {
                    const scKey = `${run.doc_id}_${sc.scenario_name}`;
                    const isScenarioOpen = expandedScenarios[scKey] ?? true;
                    return (
                      <div key={scKey} style={styles.scenarioBlock}>
                        <div style={styles.scenarioHeader}>
                          <div>
                            <div style={styles.scenarioName}>{sc.scenario_name}</div>
                            <div style={styles.metaSmall}>Updated: {formatDate(sc.updated_at || run.updated_at)}</div>
                          </div>
                          <div style={styles.scenarioActions}>
                            <button
                              onClick={() => toggleScenario(scKey)}
                              title="Toggle scenario details"
                              aria-label={isScenarioOpen ? 'Collapse scenario' : 'Expand scenario'}
                              style={styles.toggleBtn}
                            >
                              {isScenarioOpen ? '▼' : '▶'}
                            </button>
                            <DownloadJsonButton fileName={`report_${run.doc_id}_${sc.scenario_name}`} data={sc.report || {}} />
                          </div>
                        </div>

                        {isScenarioOpen && (
                          <>
                            <div style={styles.subSectionTitle}>Flow Names</div>
                            <ul style={styles.flowList}>
                              {(sc.flow_names ?? []).map((f, idx) => (
                                <li key={idx} style={styles.flowItem}>{f}</li>
                              ))}
                            </ul>

                            <div style={styles.subSectionTitle}>Test Script</div>
                            <pre style={styles.codeBlock}>
                              <code>{sc.test_script || '// No test script generated yet'}</code>
                            </pre>

                            <div style={styles.subSectionTitle}>Report (JSON)</div>
                            <pre style={styles.jsonBlock}>
                              <code>{JSON.stringify(sc.report ?? {}, null, 2)}</code>
                            </pre>
                          </>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          ))}
        </div>
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
   
   
  },
  sectionTitle: {
    fontWeight: 600,
    marginTop: 8,
    marginBottom: 8,
  },
  subSectionTitle: {
    fontWeight: 600,
    marginTop: 12,
    marginBottom: 6,
  },
  scenarioBlock: {
    border: '1px dashed #e1e4e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  scenarioHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  scenarioName: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 4,
  },
  flowList: {
    margin: 0,
    paddingLeft: 18,
  },
  flowItem: {
    marginBottom: 4,
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
   
    color: ' #e1e4e8',
    cursor: 'pointer',
  },
  scenarioActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
};

export default IntegrationHistory;


