import React, { useEffect, useMemo, useState } from 'react';
import { testCaseApi } from '../../api/testCaseApi';

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

const TestCaseHistory = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [expandedGenerations, setExpandedGenerations] = useState({});
  const [expandedTestCases, setExpandedTestCases] = useState({});

  const toggleGeneration = (generationId) => {
    setExpandedGenerations((prev) => ({ ...prev, [generationId]: !(prev[generationId] ?? true) }));
  };

  const toggleTestCase = (key) => {
    setExpandedTestCases((prev) => ({ ...prev, [key]: !(prev[key] ?? true) }));
  };

  const totals = useMemo(() => {
    if (!data || !Array.isArray(data)) return { totalGenerations: 0, totalTestCases: 0 };
    return {
      totalGenerations: data.length ?? 0,
      totalTestCases: data.reduce((sum, gen) => sum + (gen.test_cases?.length ?? 0), 0),
    };
  }, [data]);

  useEffect(() => {
    let mounted = true;
    const fetchGenerations = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await testCaseApi.getProjectTestCaseGenerations(projectId);
        if (mounted) setData(res);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load test case generations');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (projectId) fetchGenerations();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  if (!projectId) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Test Case Generation - History</h2>
        <div style={styles.note}>Provide a valid projectId to view test case generations.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Test Case Generation - History</h2>

      {loading && <div style={styles.note}>Loading…</div>}
      {error && <div style={styles.error}>{error}</div>}

      {data && Array.isArray(data) && (
        <div>
          <div style={styles.summaryRow}>
            <div style={styles.summaryItem}><strong>Total Generations:</strong> {totals.totalGenerations}</div>
            <div style={styles.summaryItem}><strong>Total Test Cases:</strong> {totals.totalTestCases}</div>
          </div>

          {data.length === 0 ? (
            <div style={styles.note}>No test case generations found for this project.</div>
          ) : (
            data.map((generation) => {
              const generationId = generation.id || generation.testcase_id;
              const isGenerationOpen = expandedGenerations[generationId] ?? true;
              
              return (
                <div key={generationId} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.headerLeft}>
                      <div style={styles.docId}>
                        <strong>Generation #{generation.generation_index !== undefined ? generation.generation_index + 1 : 'N/A'}</strong>
                        {' - '}
                        <span style={{ fontSize: '13px', fontWeight: 'normal' }}>
                          ID: {generation.testcase_id || generationId}
                        </span>
                      </div>
                      <div style={styles.meta}>
                        <strong>Created:</strong> {formatDate(generation.created_at)}
                      </div>
                      <div style={styles.meta}>
                        <strong>Updated:</strong> {formatDate(generation.updated_at)}
                      </div>
                      {generation.generation_metadata && (
                        <div style={styles.meta}>
                          <strong>Duration:</strong> {generation.generation_metadata.generation_duration_seconds || '-'}s
                        </div>
                      )}
                      {generation.generation_index !== undefined && (
                        <div style={styles.meta}>
                          <strong>Generation Index:</strong> {generation.generation_index}
                        </div>
                      )}
                    </div>
                    <div style={styles.headerRight}>
                      <div style={styles.badge}>
                        Test Cases: {generation.test_cases?.length ?? 0}
                      </div>
                      <button
                        onClick={() => toggleGeneration(generationId)}
                        title="Toggle generation details"
                        aria-label={isGenerationOpen ? 'Collapse generation' : 'Expand generation'}
                        style={styles.toggleBtn}
                      >
                        {isGenerationOpen ? '▼' : '▶'}
                      </button>
                      <DownloadJsonButton 
                        fileName={`testcase_generation_${generation.testcase_id || generationId}`} 
                        data={generation} 
                      />
                    </div>
                  </div>

                  {isGenerationOpen && (
                    <>
                      {generation.generation_metadata && (
                        <div style={styles.metadataSection}>
                          <div style={styles.subSectionTitle}>Generation Metadata</div>
                          <div style={styles.metadataGrid}>
                            <div style={styles.metadataItem}>
                              <strong>Total Features:</strong> {generation.generation_metadata.total_features || '-'}
                            </div>
                            <div style={styles.metadataItem}>
                              <strong>Total Test Cases:</strong> {generation.generation_metadata.total_test_cases || '-'}
                            </div>
                            {generation.generation_metadata.priority_distribution && (
                              <>
                                <div style={styles.metadataItem}>
                                  <strong>High Priority:</strong> {generation.generation_metadata.priority_distribution.high || 0}
                                </div>
                                <div style={styles.metadataItem}>
                                  <strong>Medium Priority:</strong> {generation.generation_metadata.priority_distribution.medium || 0}
                                </div>
                                <div style={styles.metadataItem}>
                                  <strong>Low Priority:</strong> {generation.generation_metadata.priority_distribution.low || 0}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      <div style={styles.sectionTitle}>Test Cases ({generation.test_cases?.length || 0})</div>
                      {generation.test_cases && generation.test_cases.length > 0 ? (
                        generation.test_cases.map((tc, idx) => {
                          const tcKey = `${generationId}_${tc.test_case_id || idx}`;
                          const isTestCaseOpen = expandedTestCases[tcKey] ?? false;
                          
                          return (
                            <div key={tcKey} style={styles.testCaseBlock}>
                              <div style={styles.testCaseHeader}>
                                <div style={styles.testCaseInfo}>
                                  <div style={styles.testCaseName}>
                                    {tc.test_case_id || `TC-${idx + 1}`}: {tc.test_scenario || tc.feature_name}
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
                                    <strong>Test Steps:</strong>
                                    <pre style={styles.codeBlock}>{tc.test_steps || '-'}</pre>
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
                        <div style={styles.note}>No test cases in this generation.</div>
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
  badge: {
    padding: '6px 12px',
    background: '#0366d6',
    color: 'white',
    borderRadius: 6,
    fontSize: '13px',
    fontWeight: 600,
  },
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
};

export default TestCaseHistory;

