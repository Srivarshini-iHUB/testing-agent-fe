import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PerformanceTesting = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const proj = JSON.parse(localStorage.getItem('project') || 'null');
  const projectId = proj?.id;
  
  const [config, setConfig] = useState({
    url: '',
    method: 'GET',
    testMode: 'load',
    duration: 30,
    connections: 10,
    headers: {},
    body: '',
    projectId,
    stressConfig: {
      startConnections: 10,
      maxConnections: 100,
      step: 10,
      durationPerStep: 30
    }
  });   

  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);

  const runTest = async () => {
    if (!config.url) {
      setError('Please enter a target URL');
      return;
    }

    setIsRunning(true);
    setError(null);
    setResults(null);
    setRawData(null);
    setCurrentStep('Initializing test...');
    setProgress(10);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 1000);

      const response = await fetch('http://localhost:8080/api/performance/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
      
      // Extract raw data from JSON in report
      if (data.report) {
        const jsonMatch = data.report.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          setRawData(JSON.parse(jsonMatch[1]));
        }
      }
      
      setCurrentStep('Test completed!');
    } catch (err) {
      setError(err.message || 'Failed to run performance test');
      setCurrentStep('');
    } finally {
      setIsRunning(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const stopTest = () => {
    setIsRunning(false);
    setCurrentStep('Test stopped by user');
    setProgress(0);
  };

  const downloadMarkdown = () => {
    if (!results || !results.report) return;
    
    const blob = new Blob([results.report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-test-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getChartData = () => {
    if (!rawData) return null;

    const latencyData = [];
    const requestData = [];
    const statusData = [];
    const throughputData = [];

    // Build latency data from response
    if (rawData.latency) {
      const percentiles = ['p50', 'p75', 'p90', 'p97_5', 'p99'];
      const labels = ['P50', 'P75', 'P90', 'P95', 'P99'];
      
      percentiles.forEach((p, i) => {
        if (rawData.latency[p] !== undefined) {
          latencyData.push({
            name: labels[i],
            value: rawData.latency[p]
          });
        }
      });
    }

    // Build request data from response
    if (rawData.requests) {
      const percentiles = ['p1', 'p10', 'p50', 'p75', 'p90', 'p99'];
      
      percentiles.forEach((p) => {
        if (rawData.requests[p] !== undefined) {
          requestData.push({
            name: p.toUpperCase(),
            value: rawData.requests[p]
          });
        }
      });
    }

    // Build status data from response
    const statusCodes = [
      { key: '2xx', name: '2xx Success', color: '#10b981' },
      { key: '4xx', name: '4xx Client Error', color: '#f59e0b' },
      { key: '5xx', name: '5xx Server Error', color: '#ef4444' }
    ];

    statusCodes.forEach(status => {
      if (rawData[status.key] !== undefined && rawData[status.key] > 0) {
        statusData.push({
          name: status.name,
          value: rawData[status.key],
          color: status.color
        });
      }
    });

    // If no errors, add success data
    if (statusData.length === 0 && rawData['2xx']) {
      statusData.push({
        name: '2xx Success',
        value: rawData['2xx'],
        color: '#10b981'
      });
    }

    // Build throughput data from response
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

  const chartData = getChartData();

  const updateHeader = (key, value) => {
    setConfig(prev => ({
      ...prev,
      headers: { ...prev.headers, [key]: value }
    }));
  };

  const removeHeader = (key) => {
    const newHeaders = { ...config.headers };
    delete newHeaders[key];
    setConfig(prev => ({ ...prev, headers: newHeaders }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-900 text-gray-900 dark:text-white p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Back Button & Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-300 font-semibold transition-all"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <i className="fas fa-tachometer-alt text-4xl text-rose-600 dark:text-rose-400"></i>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Testing</h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">AI-powered load and stress testing for your APIs</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main Configuration Panel */}
          <div className="lg:col-span-4 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg h-fit">
            <div className="flex items-center gap-2 mb-6">
              <i className="fas fa-cog text-rose-600 dark:text-rose-400"></i>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Test Configuration</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Target URL <span className="text-rose-500 dark:text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="https://api.example.com/endpoint"
                  value={config.url}
                  onChange={(e) => setConfig({ ...config, url: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400"
                  disabled={isRunning}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    HTTP Method
                  </label>
                  <input
                    type="text"
                    value="GET"
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Test Mode
                  </label>
                  <select
                    value={config.testMode}
                    onChange={(e) => setConfig({ ...config, testMode: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400"
                    disabled={isRunning}
                  >
                    <option value="load">Load Test</option>
                    <option value="stress">Stress Test</option>
                  </select>
                </div>
              </div>

              {config.testMode === 'load' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Duration (seconds)
                    </label>
                    <input
                      type="number"
                      value={config.duration}
                      onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400"
                      disabled={isRunning}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Connections
                    </label>
                    <input
                      type="number"
                      value={config.connections}
                      onChange={(e) => setConfig({ ...config, connections: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400"
                      disabled={isRunning}
                      min="1"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Start Connections
                    </label>
                    <input
                      type="number"
                      value={config.stressConfig.startConnections}
                      onChange={(e) => setConfig({
                        ...config,
                        stressConfig: { ...config.stressConfig, startConnections: parseInt(e.target.value) }
                      })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400"
                      disabled={isRunning}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Max Connections
                    </label>
                    <input
                      type="number"
                      value={config.stressConfig.maxConnections}
                      onChange={(e) => setConfig({
                        ...config,
                        stressConfig: { ...config.stressConfig, maxConnections: parseInt(e.target.value) }
                      })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400"
                      disabled={isRunning}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Step Size
                    </label>
                    <input
                      type="number"
                      value={config.stressConfig.step}
                      onChange={(e) => setConfig({
                        ...config,
                        stressConfig: { ...config.stressConfig, step: parseInt(e.target.value) }
                      })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400"
                      disabled={isRunning}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Duration Per Step (s)
                    </label>
                    <input
                      type="number"
                      value={config.stressConfig.durationPerStep}
                      onChange={(e) => setConfig({
                        ...config,
                        stressConfig: { ...config.stressConfig, durationPerStep: parseInt(e.target.value) }
                      })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400"
                      disabled={isRunning}
                      min="1"
                    />
                  </div>
                </div>
              )}

             

              
            </div>


            {/* Action Buttons */}
            <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg mt-6">
              <div className="space-y-3">
                <button
                  onClick={runTest}
                  disabled={isRunning || !config.url}
                  className={`w-full ${
                    isRunning
                      ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  } text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center space-x-2`}
                >
                  {isRunning ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Running Test...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-play"></i>
                      <span>Start Test</span>
                    </>
                  )}
                </button>

                {isRunning && (
                  <button
                    onClick={stopTest}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <i className="fas fa-stop"></i>
                    <span>Stop Test</span>
                  </button>
                )}

                {isRunning && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>{currentStep}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Tips - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <i className="fas fa-lightbulb text-yellow-500 dark:text-yellow-400"></i>
                <h3 className="font-bold text-gray-900 dark:text-white">Quick Tips</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <i className="fas fa-chart-line text-rose-600 dark:text-rose-400 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-300">Load Test</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Tests consistent load over time</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fas fa-fire text-orange-600 dark:text-orange-400 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-300">Stress Test</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Gradually increases load to find breaking point</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fas fa-exclamation-triangle text-yellow-600 dark:text-yellow-400 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-300">Start Small</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Begin with lower connection counts and increase gradually</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fas fa-download text-blue-600 dark:text-blue-400 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-300">Export Reports</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Download detailed performance reports in Markdown format</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel - Full Width Below */}
        <div className="mt-6">
            {(results || error) && (
              <div className="space-y-6">
                {error && (
                  <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <i className="fas fa-exclamation-circle text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0"></i>
                        <div>
                          <p className="font-semibold text-red-800 dark:text-red-200">Error</p>
                          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {results && (
                  <>
                    <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <i className="fas fa-chart-line text-rose-600 dark:text-rose-400"></i>
                          Test Results Summary
                        </h2>
                        {results.report && (
                          <button
                            onClick={downloadMarkdown}
                            className="px-4 py-2 bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-500/30 flex items-center gap-2 transition-all"
                          >
                            <i className="fas fa-download"></i>
                            Download Report
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-rose-500/20 to-pink-500/20 p-4 rounded-lg border border-rose-500/30">
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Latency</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {results.avgLatency || 'N/A'}<span className="text-sm text-gray-500 dark:text-gray-400 ml-1">ms</span>
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-lg border border-blue-500/30">
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Req/Sec</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {results.requestsPerSec || 'N/A'}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30">
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Success Rate</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {results.successRate || 'N/A'}%
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 p-4 rounded-lg border border-orange-500/30">
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Total Requests</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {results.totalRequests || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

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
                                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
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
                              <Area type="monotone" dataKey="value" stroke="#f43f5e" fillOpacity={1} fill="url(#latencyGradient)" />
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
                  </>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceTesting;