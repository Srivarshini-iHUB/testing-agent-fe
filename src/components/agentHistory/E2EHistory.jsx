import React, { useEffect, useMemo, useState } from 'react';
import { e2eApi } from '../../api/e2eApi';

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

const E2EHistory = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [expandedReports, setExpandedReports] = useState({});
  const [expandedTestCases, setExpandedTestCases] = useState({});

  const toggleReport = (reportId) => {
    setExpandedReports((prev) => ({ ...prev, [reportId]: !(prev[reportId] ?? true) }));
  };

  const toggleTestCase = (key) => {
    setExpandedTestCases((prev) => ({ ...prev, [key]: !(prev[key] ?? true) }));
  };

  const totals = useMemo(() => {
    if (!data || !data.reports || !Array.isArray(data.reports)) return { totalReports: 0, totalTests: 0 };
    return {
      totalReports: data.reports.length ?? 0,
      totalTests: data.reports.reduce((sum, report) => sum + (report.total_tests || 0), 0),
    };
  }, [data]);

  useEffect(() => {
    let mounted = true;
    const fetchReports = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await e2eApi.getProjectE2EReports(projectId);
        if (mounted) setData(res);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load E2E reports');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (projectId) fetchReports();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  if (!projectId) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Functional Testing - History</h2>
        <div style={styles.note}>Provide a valid projectId to view E2E reports.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Functional Testing - History</h2>

      {loading && <div style={styles.note}>Loading…</div>}
      {error && <div style={styles.error}>{error}</div>}

      {data && data.reports && Array.isArray(data.reports) && (
        <div>
          <div style={styles.summaryRow}>
            <div style={styles.summaryItem}><strong>Total Runs:</strong> {totals.totalReports}</div>
            <div style={styles.summaryItem}><strong>Total Tests:</strong> {totals.totalTests}</div>
          </div>

          {data.reports.length === 0 ? (
            <div style={styles.note}>No E2E reports found for this project.</div>
          ) : (
            data.reports.map((report, idx) => {
              const reportId = report.id || `report_${idx}`;
              const isReportOpen = expandedReports[reportId] ?? true;
              
              return (
                <div key={reportId} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.headerLeft}>
                      <div style={styles.docId}>
                        <strong>Run #{idx + 1}</strong>
                        {' - '}
                        <span style={{ fontSize: '13px', fontWeight: 'normal' }}>
                          ID: {reportId}
                        </span>
                      </div>
                      <div style={styles.meta}>
                        <strong>Created:</strong> {formatDate(report.created_at)}
                      </div>
                      <div style={styles.meta}>
                        <strong>Updated:</strong> {formatDate(report.updated_at)}
                      </div>
                      <div style={styles.meta}>
                        <strong>Project URL:</strong> {report.project_url || '-'}
                      </div>
                    </div>
                    <div style={styles.headerRight}>
                      <div style={styles.statsContainer}>
                        <div style={styles.statBadge('green')}>Passed: {report.passed || 0}</div>
                        <div style={styles.statBadge('red')}>Failed: {report.failed || 0}</div>
                        <div style={styles.statBadge('blue')}>Total: {report.total_tests || 0}</div>
                      </div>
                      <button
                        onClick={() => toggleReport(reportId)}
                        title="Toggle report details"
                        aria-label={isReportOpen ? 'Collapse report' : 'Expand report'}
                        style={styles.toggleBtn}
                      >
                        {isReportOpen ? '▼' : '▶'}
                      </button>
                      <DownloadJsonButton 
                        fileName={`e2e_report_${reportId}`} 
                        data={report} 
                      />
                    </div>
                  </div>

                  {isReportOpen && (
                    <>
                      <div style={styles.metadataSection}>
                        <div style={styles.subSectionTitle}>Test Execution Summary</div>
                        <div style={styles.metadataGrid}>
                          <div style={styles.metadataItem}>
                            <strong>Duration:</strong> {report.duration || '-'}
                          </div>
                          <div style={styles.metadataItem}>
                            <strong>Exit Code:</strong> {report.exit_code || 0}
                          </div>
                          {report.bug_sheet_url && (
                            <div style={styles.metadataItem}>
                              <strong>Bug Sheet:</strong>{' '}
                              <a href={report.bug_sheet_url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                                View Sheet
                              </a>
                            </div>
                          )}
                          {report.bug_csv_url && (
                            <div style={styles.metadataItem}>
                              <strong>Bug CSV:</strong>{' '}
                              <a href={report.bug_csv_url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                                Download CSV
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={styles.sectionTitle}>Test Script</div>
                      <pre style={styles.codeBlock}>
                        <code>{report.test_script || '// No test script available'}</code>
                      </pre>

                      <div style={styles.sectionTitle}>Test Cases ({report.test_cases?.length || 0})</div>
                      {report.test_cases && report.test_cases.length > 0 ? (
                        report.test_cases.map((tc, idx) => {
                          const tcKey = `${reportId}_${tc.test_case_id || tc.test_case_number || idx}`;
                          const isTestCaseOpen = expandedTestCases[tcKey] ?? false;
                          
                          return (
                            <div key={tcKey} style={styles.testCaseBlock}>
                              <div style={styles.testCaseHeader}>
                                <div style={styles.testCaseInfo}>
                                  <div style={styles.testCaseName}>
                                    {tc.test_case_id || tc.test_case_number || `TC-${idx + 1}`}: {tc.test_scenario || tc.feature_name || 'Test Case'}
                                  </div>
                                  <div style={styles.testCaseMeta}>
                                    <span style={styles.typeBadge(tc.test_type)}>{tc.test_type || 'Positive'}</span>
                                    <span style={styles.priorityBadge(tc.priority)}>{tc.priority || 'Medium'}</span>
                                    <span style={styles.statusBadge}>{tc.automation_status || 'Manual'}</span>
                                  </div>
                                </div>
                                <div style={styles.testCaseActions}>
                                  <button
                                    onClick={() => toggleTestCase(tcKey)}
                                    title="Toggle test case details"
                                    aria-label={isTestCaseOpen ? 'Collapse test case' : 'Expand test case'}
                                    style={styles.toggleBtn}
                                  >
                                    {isTestCaseOpen ? '▼' : '▶'}
                                  </button>
                                </div>
                              </div>

                              {isTestCaseOpen && (
                                <div style={styles.testCaseDetails}>
                                  <div style={styles.detailRow}>
                                    <strong>Feature Name:</strong> {tc.feature_name || '-'}
                                  </div>
                                  <div style={styles.detailRow}>
                                    <strong>Preconditions:</strong> {tc.preconditions || '-'}
                                  </div>
                                  <div style={styles.detailSection}>
                                    <strong>Steps to Execute:</strong>
                                    <pre style={styles.codeBlock}>{tc.steps_to_execute || '-'}</pre>
                                  </div>
                                  <div style={styles.detailRow}>
                                    <strong>Test Data:</strong> {tc.test_data || '-'}
                                  </div>
                                  <div style={styles.detailSection}>
                                    <strong>Expected Result:</strong>
                                    <div style={styles.expectedResult}>{tc.expected_result || '-'}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div style={styles.note}>No test cases in this report.</div>
                      )}

                      {report.test_results && report.test_results.length > 0 && (
                        <>
                          <div style={styles.sectionTitle}>Test Results ({report.test_results.length})</div>
                          <div style={styles.resultsContainer}>
                            {report.test_results.map((result, idx) => (
                              <div key={idx} style={styles.resultItem(result.status)}>
                                <div style={styles.resultHeader}>
                                  <span style={styles.resultName}>{result.name || `Test ${idx + 1}`}</span>
                                  <span style={styles.resultStatusBadge(result.status)}>{result.status || 'unknown'}</span>
                                </div>
                                <div style={styles.resultDetails}>
                                  <div><strong>Duration:</strong> {result.duration || '-'}</div>
                                  {result.error_message && (
                                    <div style={styles.errorMessage}>
                                      <strong>Error:</strong> {result.error_message}
                                    </div>
                                  )}
                                  {result.actual_result && (
                                    <div><strong>Actual Result:</strong> {result.actual_result}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
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
  testCaseBlock: {
    border: '1px dashed #e1e4e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    background: '#fafbfc',
  },
  testCaseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  testCaseInfo: {
    flex: 1,
    minWidth: 0,
  },
  testCaseName: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 8,
    color: '#24292e',
  },
  testCaseMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  testCaseActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  testCaseDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1px solid #e1e4e8',
  },
  detailRow: {
    marginBottom: 8,
    fontSize: '14px',
    color: '#24292e',
  },
  detailSection: {
    marginBottom: 12,
    fontSize: '14px',
  },
  expectedResult: {
    marginTop: 4,
    padding: 8,
    background: '#f6f8fa',
    borderRadius: 6,
    color: '#24292e',
    fontSize: '13px',
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
  typeBadge: (type) => ({
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: '12px',
    fontWeight: 600,
    background: type === 'Positive' ? '#28a745' : type === 'Negative' ? '#dc3545' : '#ffc107',
    color: 'white',
  }),
  priorityBadge: (priority) => ({
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: '12px',
    fontWeight: 600,
    background: priority === 'Critical' || priority === 'High' ? '#dc3545' : priority === 'Medium' ? '#ffc107' : '#17a2b8',
    color: 'white',
  }),
  statusBadge: {
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: '12px',
    fontWeight: 600,
    background: '#6c757d',
    color: 'white',
  },
  resultsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  resultItem: (status) => ({
    padding: 12,
    borderRadius: 6,
    border: `1px solid ${status === 'passed' ? '#28a745' : status === 'failed' ? '#dc3545' : '#e1e4e8'}`,
    background: status === 'passed' ? '#f0fff4' : status === 'failed' ? '#fff5f5' : '#f6f8fa',
  }),
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#24292e',
  },
  resultStatusBadge: (status) => ({
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: '12px',
    fontWeight: 600,
    background: status === 'passed' ? '#28a745' : status === 'failed' ? '#dc3545' : '#6c757d',
    color: 'white',
  }),
  resultDetails: {
    fontSize: '13px',
    color: '#586069',
  },
  errorMessage: {
    marginTop: 4,
    padding: 8,
    background: '#fff5f5',
    borderRadius: 4,
    color: '#c53030',
    fontSize: '12px',
  },
};

export default E2EHistory;

