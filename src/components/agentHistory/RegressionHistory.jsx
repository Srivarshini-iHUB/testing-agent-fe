import React, { useEffect, useMemo, useState } from 'react';
import { regressionApi } from '../../api/regressionApi';

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

const RegressionHistory = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [expandedRuns, setExpandedRuns] = useState({});

  const toggleRun = (runIndex) => {
    setExpandedRuns((prev) => ({ ...prev, [runIndex]: !(prev[runIndex] ?? true) }));
  };

  const totals = useMemo(() => {
    if (!data?.regression_test) return { totalRuns: 0, totalBugsTested: 0 };
    const test = data.regression_test;
    return {
      totalRuns: test.regression_runs?.length || 0,
      totalBugsTested: test.regression_runs?.reduce((sum, run) => sum + (run.total_bugs_tested || 0), 0) || 0,
    };
  }, [data]);

  useEffect(() => {
    let mounted = true;
    const fetchTests = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await regressionApi.getProjectRegressionTests(projectId);
        if (mounted) setData(res);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load regression tests');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (projectId) fetchTests();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  if (!projectId) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Regression Testing - History</h2>
        <div style={styles.note}>Provide a valid projectId to view regression tests.</div>
      </div>
    );
  }

  if (!data?.regression_test) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Regression Testing - History</h2>
        {loading && <div style={styles.note}>Loading…</div>}
        {error && <div style={styles.error}>{error}</div>}
        {!loading && !error && (
          <div style={styles.note}>No regression tests found for this project.</div>
        )}
      </div>
    );
  }

  const testData = data.regression_test;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Regression Testing - History</h2>

      {loading && <div style={styles.note}>Loading…</div>}
      {error && <div style={styles.error}>{error}</div>}

      {testData && (
        <div>
          <div style={styles.summaryRow}>
            <div style={styles.summaryItem}><strong>Total Runs:</strong> {totals.totalRuns}</div>
            <div style={styles.summaryItem}><strong>Total Bugs Tested:</strong> {totals.totalBugsTested}</div>
          </div>

          <div style={styles.metadataSection}>
            <div style={styles.subSectionTitle}>Project Information</div>
            <div style={styles.metadataGrid}>
              <div style={styles.metadataItem}>
                <strong>Project Name:</strong> {testData.project_name || '-'}
              </div>
              <div style={styles.metadataItem}>
                <strong>Latest Run Index:</strong> {testData.latest_run_index || 0}
              </div>
              {testData.bug_sheet_url && (
                <div style={styles.metadataItem}>
                  <strong>Bug Sheet:</strong>{' '}
                  <a href={testData.bug_sheet_url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                    View Sheet
                  </a>
                </div>
              )}
              <div style={styles.metadataItem}>
                <strong>Created:</strong> {formatDate(testData.created_at)}
              </div>
              <div style={styles.metadataItem}>
                <strong>Updated:</strong> {formatDate(testData.updated_at)}
              </div>
            </div>
          </div>

          <div style={styles.sectionTitle}>Regression Runs ({testData.regression_runs?.length || 0})</div>
          {testData.regression_runs && testData.regression_runs.length > 0 ? (
            testData.regression_runs.map((run, idx) => {
              const runKey = run.run_index || idx;
              const isRunOpen = expandedRuns[runKey] ?? true;
              
              return (
                <div key={runKey} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.headerLeft}>
                      <div style={styles.docId}>
                        <strong>Run #{runKey}</strong>
                      </div>
                      <div style={styles.meta}>
                        <strong>Created:</strong> {formatDate(run.created_at)}
                      </div>
                      <div style={styles.meta}>
                        <strong>Duration:</strong> {run.duration || '-'}
                      </div>
                    </div>
                    <div style={styles.headerRight}>
                      <div style={styles.statsContainer}>
                        <div style={styles.statBadge('green')}>Verified: {run.bugs_verified || 0}</div>
                        <div style={styles.statBadge('red')}>Reopened: {run.bugs_reopened || 0}</div>
                        <div style={styles.statBadge('blue')}>Total: {run.total_bugs_tested || 0}</div>
                        <div style={styles.statusBadge(run.status)}>{run.status || 'unknown'}</div>
                      </div>
                      <button
                        onClick={() => toggleRun(runKey)}
                        title="Toggle run details"
                        aria-label={isRunOpen ? 'Collapse run' : 'Expand run'}
                        style={styles.toggleBtn}
                      >
                        {isRunOpen ? '▼' : '▶'}
                      </button>
                      <DownloadJsonButton 
                        fileName={`regression_run_${runKey}`} 
                        data={run} 
                      />
                    </div>
                  </div>

                  {isRunOpen && (
                    <div style={styles.runDetails}>
                      <div style={styles.detailGrid}>
                        <div style={styles.detailItem}>
                          <strong>Bugs Verified:</strong> {run.bugs_verified || 0}
                          <div style={styles.description}>Bugs that were fixed and verified successfully</div>
                        </div>
                        <div style={styles.detailItem}>
                          <strong>Bugs Reopened:</strong> {run.bugs_reopened || 0}
                          <div style={styles.description}>Bugs that were reopened after testing</div>
                        </div>
                        <div style={styles.detailItem}>
                          <strong>Total Bugs Tested:</strong> {run.total_bugs_tested || 0}
                          <div style={styles.description}>Total number of bugs tested in this run</div>
                        </div>
                        <div style={styles.detailItem}>
                          <strong>Status:</strong> {run.status || 'unknown'}
                          <div style={styles.description}>Overall test run status</div>
                        </div>
                        <div style={styles.detailItem}>
                          <strong>Duration:</strong> {run.duration || '-'}
                          <div style={styles.description}>Time taken to execute the regression tests</div>
                        </div>
                        <div style={styles.detailItem}>
                          <strong>Run Index:</strong> {run.run_index || runKey}
                          <div style={styles.description}>Sequential index of this regression run</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={styles.note}>No regression runs in this test.</div>
          )}
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
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  note: {
    padding: 12,
    background: '#f6f8fa',
    border: '1px solid #e1e4e8',
    borderRadius: 8,
    display: 'inline-block',
    color: '#586069',
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
    fontSize: '14px',
  },
  card: {
    border: '1px solid #e1e4e8',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    background: '#ffffff',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    minWidth: 200,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  docId: {
    marginBottom: 4,
    fontSize: '16px',
    fontWeight: 600,
  },
  meta: {
    color: '#586069',
    fontSize: 14,
    marginBottom: 4,
  },
  statsContainer: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  statBadge: (color) => ({
    padding: '6px 12px',
    background: color === 'green' ? '#28a745' : color === 'red' ? '#dc3545' : '#0366d6',
    color: 'white',
    borderRadius: 6,
    fontSize: '13px',
    fontWeight: 600,
  }),
  statusBadge: (status) => ({
    padding: '6px 12px',
    background: status === 'passed' ? '#28a745' : status === 'failed' ? '#dc3545' : status === 'partial' ? '#ffc107' : '#6c757d',
    color: 'white',
    borderRadius: 6,
    fontSize: '13px',
    fontWeight: 600,
    textTransform: 'capitalize',
  }),
  sectionTitle: {
    fontWeight: 600,
    marginTop: 16,
    marginBottom: 12,
    fontSize: '16px',
  },
  subSectionTitle: {
    fontWeight: 600,
    marginTop: 12,
    marginBottom: 8,
    fontSize: '14px',
  },
  metadataSection: {
    marginBottom: 16,
    padding: 12,
    background: '#f6f8fa',
    borderRadius: 8,
    border: '1px solid #e1e4e8',
  },
  metadataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 12,
    marginTop: 8,
  },
  metadataItem: {
    fontSize: '13px',
    color: '#24292e',
  },
  link: {
    color: '#0366d6',
    textDecoration: 'none',
  },
  runDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1px solid #e1e4e8',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 16,
  },
  detailItem: {
    padding: 12,
    background: '#fafbfc',
    borderRadius: 8,
    border: '1px solid #e1e4e8',
  },
  description: {
    fontSize: '12px',
    color: '#586069',
    marginTop: 4,
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
    fontSize: '13px',
  },
  toggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 6,
    background: '#f6f8fa',
    border: '1px solid #e1e4e8',
    color: '#586069',
    cursor: 'pointer',
  },
};

export default RegressionHistory;

