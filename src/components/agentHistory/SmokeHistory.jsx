import React, { useEffect, useMemo, useState } from 'react';
import { smokeApi } from '../../api/smokeApi';

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

const SmokeHistory = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [expandedTests, setExpandedTests] = useState({});

  const toggleTest = (testId) => {
    setExpandedTests((prev) => ({ ...prev, [testId]: !(prev[testId] ?? true) }));
  };

  const totals = useMemo(() => {
    if (!data || !Array.isArray(data)) return { totalTests: 0, totalPassed: 0, totalFailed: 0 };
    return {
      totalTests: data.reduce((sum, test) => sum + (test.total_tests || 0), 0),
      totalPassed: data.reduce((sum, test) => sum + (test.passed || 0), 0),
      totalFailed: data.reduce((sum, test) => sum + (test.failed || 0), 0),
    };
  }, [data]);

  useEffect(() => {
    let mounted = true;
    const fetchTests = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await smokeApi.getProjectSmokeTests(projectId);
        if (mounted) setData(res);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load smoke tests');
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
        <h2 style={styles.title}>Smoke Testing - History</h2>
        <div style={styles.note}>Provide a valid projectId to view smoke tests.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Smoke Testing - History</h2>

      {loading && <div style={styles.note}>Loading…</div>}
      {error && <div style={styles.error}>{error}</div>}

      {data && Array.isArray(data) && (
        <div>
          <div style={styles.summaryRow}>
            <div style={styles.summaryItem}><strong>Total Runs:</strong> {data.length}</div>
            <div style={styles.summaryItem}><strong>Total Tests:</strong> {totals.totalTests}</div>
            <div style={styles.summaryItem}><strong>Total Passed:</strong> {totals.totalPassed}</div>
            <div style={styles.summaryItem}><strong>Total Failed:</strong> {totals.totalFailed}</div>
          </div>

          {data.length === 0 ? (
            <div style={styles.note}>No smoke tests found for this project.</div>
          ) : (
            data.map((test, idx) => {
              const testId = test.id || `test_${idx}`;
              const isTestOpen = expandedTests[testId] ?? true;
              
              return (
                <div key={testId} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.headerLeft}>
                      <div style={styles.docId}>
                        <strong>Run #{idx + 1}</strong>
                        {' - '}
                        <span style={{ fontSize: '13px', fontWeight: 'normal' }}>
                          ID: {testId}
                        </span>
                      </div>
                      <div style={styles.meta}>
                        <strong>Created:</strong> {formatDate(test.created_at)}
                      </div>
                      <div style={styles.meta}>
                        <strong>Updated:</strong> {formatDate(test.updated_at)}
                      </div>
                      <div style={styles.meta}>
                        <strong>Test Suite:</strong> {test.test_suite_name || '-'}
                      </div>
                      <div style={styles.meta}>
                        <strong>Environment:</strong> {test.test_environment || '-'}
                      </div>
                    </div>
                    <div style={styles.headerRight}>
                      <div style={styles.statsContainer}>
                        <div style={styles.statBadge('green')}>Passed: {test.passed || 0}</div>
                        <div style={styles.statBadge('red')}>Failed: {test.failed || 0}</div>
                        <div style={styles.statBadge('blue')}>Total: {test.total_tests || 0}</div>
                        {test.skipped > 0 && (
                          <div style={styles.statBadge('gray')}>Skipped: {test.skipped || 0}</div>
                        )}
                      </div>
                      <button
                        onClick={() => toggleTest(testId)}
                        title="Toggle test details"
                        aria-label={isTestOpen ? 'Collapse test' : 'Expand test'}
                        style={styles.toggleBtn}
                      >
                        {isTestOpen ? '▼' : '▶'}
                      </button>
                      <DownloadJsonButton 
                        fileName={`smoke_test_${testId}`} 
                        data={test} 
                      />
                    </div>
                  </div>

                  {isTestOpen && (
                    <>
                      <div style={styles.metadataSection}>
                        <div style={styles.subSectionTitle}>Test Execution Summary</div>
                        <div style={styles.metadataGrid}>
                          <div style={styles.metadataItem}>
                            <strong>Duration:</strong> {test.duration || '-'}
                          </div>
                          <div style={styles.metadataItem}>
                            <strong>Exit Code:</strong> {test.exit_code || 0}
                          </div>
                          <div style={styles.metadataItem}>
                            <strong>Executed By:</strong> {test.test_executed_by || '-'}
                          </div>
                          {test.build_number && (
                            <div style={styles.metadataItem}>
                              <strong>Build Number:</strong> {test.build_number}
                            </div>
                          )}
                          {test.report_url && (
                            <div style={styles.metadataItem}>
                              <strong>Report URL:</strong>{' '}
                              <a href={test.report_url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                                View Report
                              </a>
                            </div>
                          )}
                          {test.comments && (
                            <div style={styles.metadataItem}>
                              <strong>Comments:</strong> {test.comments}
                            </div>
                          )}
                        </div>
                      </div>

                      {test.test_results?.script && (
                        <>
                          <div style={styles.sectionTitle}>Test Script</div>
                          <pre style={styles.codeBlock}>
                            <code>{test.test_results.script || '// No test script available'}</code>
                          </pre>
                        </>
                      )}

                      {test.test_results?.summary && (
                        <div style={styles.metadataSection}>
                          <div style={styles.subSectionTitle}>Test Summary</div>
                          <div style={styles.metadataGrid}>
                            <div style={styles.metadataItem}>
                              <strong>Total:</strong> {test.test_results.summary?.total || test.total_tests || 0}
                            </div>
                            <div style={styles.metadataItem}>
                              <strong>Passed:</strong> {test.test_results.summary?.passed || test.passed || 0}
                            </div>
                            <div style={styles.metadataItem}>
                              <strong>Failed:</strong> {test.test_results.summary?.failed || test.failed || 0}
                            </div>
                            <div style={styles.metadataItem}>
                              <strong>Skipped:</strong> {test.test_results.summary?.skipped || test.skipped || 0}
                            </div>
                          </div>
                        </div>
                      )}

                      {test.test_results?.input_test_cases && test.test_results.input_test_cases.length > 0 && (
                        <>
                          <div style={styles.sectionTitle}>Input Test Cases ({test.test_results.input_test_cases.length})</div>
                          <div style={styles.testCasesContainer}>
                            {test.test_results.input_test_cases.map((tc, idx) => (
                              <div key={idx} style={styles.testCaseItem}>
                                <div style={styles.testCaseHeader}>
                                  <strong>{tc['Scenario'] || tc['Test Type'] || `Test Case ${idx + 1}`}</strong>
                                </div>
                                {tc['Scenario Description'] && (
                                  <div style={styles.testCaseDetail}><strong>Description:</strong> {tc['Scenario Description']}</div>
                                )}
                                {tc['Steps to Execute'] && (
                                  <div style={styles.testCaseDetail}><strong>Steps:</strong> {tc['Steps to Execute']}</div>
                                )}
                                {tc['Test Data'] && (
                                  <div style={styles.testCaseDetail}><strong>Test Data:</strong> {tc['Test Data']}</div>
                                )}
                                {tc['Expected Result'] && (
                                  <div style={styles.testCaseDetail}><strong>Expected Result:</strong> {tc['Expected Result']}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {test.test_results?.execution_logs && (
                        <>
                          <div style={styles.sectionTitle}>Execution Logs</div>
                          <pre style={styles.codeBlock}>
                            <code>{test.test_results.execution_logs || '// No execution logs available'}</code>
                          </pre>
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })
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
    flexWrap: 'wrap',
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
    background: color === 'green' ? '#28a745' : color === 'red' ? '#dc3545' : color === 'gray' ? '#6c757d' : '#0366d6',
    color: 'white',
    borderRadius: 6,
    fontSize: '13px',
    fontWeight: 600,
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
  codeBlock: {
    background: '#0b1021',
    color: '#e6edf3',
    padding: 12,
    borderRadius: 6,
    overflowX: 'auto',
    fontSize: '13px',
    marginTop: 4,
    whiteSpace: 'pre-wrap',
    fontFamily: 'monospace',
  },
  testCasesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  testCaseItem: {
    padding: 12,
    background: '#fafbfc',
    borderRadius: 8,
    border: '1px solid #e1e4e8',
  },
  testCaseHeader: {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: 8,
    color: '#24292e',
  },
  testCaseDetail: {
    fontSize: '13px',
    color: '#586069',
    marginBottom: 4,
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

export default SmokeHistory;

