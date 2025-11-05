import React, { useEffect, useMemo, useState } from 'react';
import { performanceApi } from '../../api/performanceApi';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
    <button
      onClick={handleDownload}
      title="Download JSON"
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all text-sm font-medium"
    >
      <i className="fas fa-download"></i>
    </button>
  );
};

// Extract chart data from response (similar to PerformanceTesting)
const getChartData = (responseData) => {
  if (!responseData) return null;
  
  // Try to extract raw data from report if it's a string, otherwise use responseData directly
  let rawData = responseData;
  
  // If responseData has latency/requests/throughput directly, use it
  if (responseData.latency || responseData.requests || responseData.throughput) {
    rawData = responseData;
  }
  // Otherwise, try to extract from report string
  else if (typeof responseData.report === 'string') {
    const jsonMatch = responseData.report.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        rawData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        rawData = responseData;
      }
    }
  }

  const latencyData = [];
  const requestData = [];
  const statusData = [];
  const throughputData = [];

  // Build latency data
  if (rawData.latency) {
    const percentiles = ['p50', 'p75', 'p90', 'p97_5', 'p99'];
    const labels = ['P50', 'P75', 'P90', 'P95', 'P99'];
    percentiles.forEach((p, i) => {
      if (rawData.latency[p] !== undefined) {
        latencyData.push({ name: labels[i], value: rawData.latency[p] });
      }
    });
  }

  // Build request data
  if (rawData.requests) {
    const percentiles = ['p1', 'p10', 'p50', 'p75', 'p90', 'p99'];
    percentiles.forEach((p) => {
      if (rawData.requests[p] !== undefined) {
        requestData.push({ name: p.toUpperCase(), value: rawData.requests[p] });
      }
    });
  }

  // Build status data
  const statusCodes = [
    { key: '2xx', name: '2xx Success', color: '#10b981' },
    { key: '4xx', name: '4xx Client Error', color: '#f59e0b' },
    { key: '5xx', name: '5xx Server Error', color: '#ef4444' }
  ];
  statusCodes.forEach(status => {
    if (rawData[status.key] !== undefined && rawData[status.key] > 0) {
      statusData.push({ name: status.name, value: rawData[status.key], color: status.color });
    }
  });
  if (statusData.length === 0 && rawData['2xx']) {
    statusData.push({ name: '2xx Success', value: rawData['2xx'], color: '#10b981' });
  }

  // Build throughput data
  if (rawData.throughput) {
    const percentiles = ['p10', 'p25', 'p50', 'p75', 'p90', 'p99'];
    percentiles.forEach((p) => {
      if (rawData.throughput[p] !== undefined) {
        throughputData.push({
          name: p.toUpperCase(),
          value: parseFloat((rawData.throughput[p] / 1024).toFixed(2))
        });
      }
    });
  }

  return { latencyData, requestData, statusData, throughputData };
};

const PerformanceHistory = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [expandedRuns, setExpandedRuns] = useState({});

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
    setExpandedItems((prev) => ({ ...prev, [id]: !(prev[id] ?? false) }));
  };

  const toggleRun = (id) => {
    setExpandedRuns((prev) => ({ ...prev, [id]: !(prev[id] ?? false) }));
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
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Performance Testing - History</h2>
        <div className="inline-block px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
          No project selected. Please select a project.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Performance Testing - History</h2>

      {loading && (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-indigo-600 dark:text-indigo-400 mb-4"></i>
          <p className="text-gray-600 dark:text-gray-400">Loading history...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 mb-4">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="flex gap-4 mb-6">
            <div className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg font-semibold text-sm">
              <strong>Targets:</strong> {totals.totalRuns}
            </div>
            <div className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg font-semibold text-sm">
              <strong>Total Executions:</strong> {totals.totalExecutions}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
              <i className="fas fa-tachometer-alt text-4xl text-gray-400 dark:text-gray-600 mb-3"></i>
              <p className="text-gray-600 dark:text-gray-400">No performance test runs found for this project.</p>
            </div>
          ) : (
            items.map((it) => {
              const isItemOpen = expandedItems[it.id] ?? false;
              
              return (
                <div
                  key={it.id}
                  className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          Target: {it.method} {it.url}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Mode:</strong> {it.testMode?.toUpperCase?.() || it.testMode || 'N/A'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
                        Executions: {(it.runs || []).length}
                      </span>
                      <button
                        onClick={() => toggleItem(it.id)}
                        title="Toggle item details"
                        aria-label={isItemOpen ? 'Collapse' : 'Expand'}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                      >
                        <i className={`fas fa-chevron-${isItemOpen ? 'down' : 'right'}`}></i>
                      </button>
                    </div>
                  </div>

                  {isItemOpen && (
                    <div className="space-y-4 mt-4">
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
                        const downloadable = {
                          id: it.id,
                          url: it.url,
                          method: it.method,
                          testMode: it.testMode,
                          timestamp: run?.timestamp,
                          request: req,
                          response: resp,
                        };
                        const isRunOpen = expandedRuns[runId] ?? false;
                        const chartData = getChartData(resp);

                        return (
                          <div
                            key={runId}
                            className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/30"
                          >
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                  <strong>Timestamp:</strong> {formatDate(run?.timestamp)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                  <strong>Duration:</strong> {req?.duration ?? req?.stressConfig?.durationPerStep ?? '-'}s |{' '}
                                  <strong>Connections:</strong> {req?.connections ?? req?.stressConfig?.startConnections ?? '-'}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleRun(runId)}
                                  title="Toggle run details"
                                  aria-label={isRunOpen ? 'Collapse run' : 'Expand run'}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex-shrink-0"
                                >
                                  <i className={`fas fa-chevron-${isRunOpen ? 'down' : 'right'}`}></i>
                                </button>
                                <DownloadJsonButton
                                  fileName={`performance_run_${it.id}_${idx}`}
                                  data={downloadable}
                                />
                              </div>
                            </div>

                            {isRunOpen && (
                              <div className="space-y-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                {/* Metrics Summary - Same UI as PerformanceTesting */}
                                <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                    <i className="fas fa-chart-line text-rose-600 dark:text-rose-400"></i>
                                    Test Results Summary
                                  </h2>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gradient-to-br from-rose-500/20 to-pink-500/20 p-4 rounded-lg border border-rose-500/30">
                                      <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Latency</p>
                                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {metrics.avgLatency ?? 'N/A'}<span className="text-sm text-gray-500 dark:text-gray-400 ml-1">ms</span>
                                      </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-lg border border-blue-500/30">
                                      <p className="text-gray-600 dark:text-gray-400 text-sm">Req/Sec</p>
                                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {metrics.requestsPerSec ?? 'N/A'}
                                      </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30">
                                      <p className="text-gray-600 dark:text-gray-400 text-sm">Success Rate</p>
                                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {metrics.successRate ?? 'N/A'}%
                                      </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 p-4 rounded-lg border border-orange-500/30">
                                      <p className="text-gray-600 dark:text-gray-400 text-sm">Total Requests</p>
                                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {metrics.totalRequests ?? 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Request */}
                                <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                                  <div className="font-semibold text-gray-900 dark:text-white mb-2">Request Configuration</div>
                                  <pre className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-300 p-4 rounded-lg overflow-x-auto text-xs font-mono whitespace-pre-wrap border border-gray-200 dark:border-gray-700">
                                    <code>{JSON.stringify(req, null, 2)}</code>
                                  </pre>
                                </div>

                                {/* Response */}
                                <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                                  <div className="font-semibold text-gray-900 dark:text-white mb-2">Response Data</div>
                                  <pre className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-300 p-4 rounded-lg overflow-x-auto text-xs font-mono whitespace-pre-wrap border border-gray-200 dark:border-gray-700">
                                    <code>{JSON.stringify(resp, null, 2)}</code>
                                  </pre>
                                </div>

                                {/* Charts - Same UI as PerformanceTesting */}
                                {chartData && chartData.latencyData.length > 0 && (
                                  <>
                                    <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <i className="fas fa-chart-bar text-rose-600 dark:text-rose-400"></i>
                                        Latency Distribution (Percentiles)
                                      </h3>
                                      <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={chartData.latencyData}>
                                          <defs>
                                            <linearGradient id={`latencyGradient_${runId}`} x1="0" y1="0" x2="0" y2="1">
                                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1}/>
                                            </linearGradient>
                                          </defs>
                                          <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                                          <XAxis dataKey="name" stroke="#6b7280" />
                                          <YAxis stroke="#6b7280" label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
                                          <Tooltip 
                                            contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '8px' }}
                                            labelStyle={{ color: '#374151' }}
                                          />
                                          <Area type="monotone" dataKey="value" stroke="#f43f5e" fillOpacity={1} fill={`url(#latencyGradient_${runId})`} />
                                        </AreaChart>
                                      </ResponsiveContainer>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                      {chartData.requestData.length > 0 && (
                                        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Requests/Second Distribution</h3>
                                          <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={chartData.requestData}>
                                              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                                              <XAxis dataKey="name" stroke="#6b7280" />
                                              <YAxis stroke="#6b7280" />
                                              <Tooltip 
                                                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '8px' }}
                                                labelStyle={{ color: '#374151' }}
                                              />
                                              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                            </BarChart>
                                          </ResponsiveContainer>
                                        </div>
                                      )}

                                      {chartData.statusData.length > 0 && (
                                        <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Code Distribution</h3>
                                          <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                              <Pie
                                                data={chartData.statusData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                              >
                                                {chartData.statusData.map((entry, index) => (
                                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                              </Pie>
                                              <Tooltip 
                                                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '8px' }}
                                              />
                                            </PieChart>
                                          </ResponsiveContainer>
                                        </div>
                                      )}
                                    </div>

                                    {chartData.throughputData.length > 0 && (
                                      <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Throughput Distribution (KB/s)</h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                          <LineChart data={chartData.throughputData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                                            <XAxis dataKey="name" stroke="#6b7280" />
                                            <YAxis stroke="#6b7280" />
                                            <Tooltip 
                                              contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '8px' }}
                                              labelStyle={{ color: '#374151' }}
                                            />
                                            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 6 }} />
                                          </LineChart>
                                        </ResponsiveContainer>
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* Report */}
                                {resp?.report && (
                                  <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                                    <div className="font-semibold text-gray-900 dark:text-white mb-2">Report</div>
                                    <pre className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 p-4 rounded-lg overflow-x-auto text-xs font-mono whitespace-pre-wrap border border-gray-700 dark:border-gray-600">
                                      <code>{resp.report}</code>
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
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

export default PerformanceHistory;
