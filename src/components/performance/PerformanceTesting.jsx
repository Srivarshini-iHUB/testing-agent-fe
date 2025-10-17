import React, { useState } from 'react';
import { Play, StopCircle, Settings, FileText, AlertCircle, TrendingUp, Zap, Activity, Download, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PerformanceTesting = () => {
  const [config, setConfig] = useState({
    url: '',
    method: 'GET',
    testMode: 'load',
    duration: 30,
    connections: 10,
    headers: {},
    body: '',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Performance Testing</h1>
          </div>
          <p className="text-slate-300">AI-powered load and stress testing for your APIs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Test Configuration
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Target URL *
                  </label>
                  <input
                    type="text"
                    placeholder="https://api.example.com/endpoint"
                    value={config.url}
                    onChange={(e) => setConfig({ ...config, url: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isRunning}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      HTTP Method
                    </label>
                    <input
                      type="text"
                      value="GET"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Test Mode
                    </label>
                    <select
                      value={config.testMode}
                      onChange={(e) => setConfig({ ...config, testMode: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Duration (seconds)
                      </label>
                      <input
                        type="number"
                        value={config.duration}
                        onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={isRunning}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Connections
                      </label>
                      <input
                        type="number"
                        value={config.connections}
                        onChange={(e) => setConfig({ ...config, connections: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={isRunning}
                        min="1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Start Connections
                      </label>
                      <input
                        type="number"
                        value={config.stressConfig.startConnections}
                        onChange={(e) => setConfig({
                          ...config,
                          stressConfig: { ...config.stressConfig, startConnections: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={isRunning}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Max Connections
                      </label>
                      <input
                        type="number"
                        value={config.stressConfig.maxConnections}
                        onChange={(e) => setConfig({
                          ...config,
                          stressConfig: { ...config.stressConfig, maxConnections: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={isRunning}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Step Size
                      </label>
                      <input
                        type="number"
                        value={config.stressConfig.step}
                        onChange={(e) => setConfig({
                          ...config,
                          stressConfig: { ...config.stressConfig, step: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={isRunning}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Duration Per Step (s)
                      </label>
                      <input
                        type="number"
                        value={config.stressConfig.durationPerStep}
                        onChange={(e) => setConfig({
                          ...config,
                          stressConfig: { ...config.stressConfig, durationPerStep: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={isRunning}
                        min="1"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-2"
                  disabled={isRunning}
                >
                  <Settings className="w-4 h-4" />
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </button>

                {showAdvanced && (
                  <div className="space-y-4 pt-4 border-t border-slate-700">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Custom Headers
                      </label>
                      {Object.entries(config.headers).map(([key, value]) => (
                        <div key={key} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={key}
                            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                            disabled
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updateHeader(key, e.target.value)}
                            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                            disabled={isRunning}
                          />
                          <button
                            onClick={() => removeHeader(key)}
                            className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                            disabled={isRunning}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => updateHeader(`header${Object.keys(config.headers).length + 1}`, '')}
                        className="text-sm text-purple-400 hover:text-purple-300"
                        disabled={isRunning}
                      >
                        + Add Header
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(results || error) && (
              <div className="space-y-6">
                {error && (
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Error</p>
                          <p className="text-sm">{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {results && (
                  <>
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                          <FileText className="w-5 h-5 text-purple-400" />
                          Test Results Summary
                        </h2>
                        {results.report && (
                          <button
                            onClick={downloadMarkdown}
                            className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 flex items-center gap-2 transition-all"
                          >
                            <Download className="w-4 h-4" />
                            Download Report
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-purple-500/30">
                          <p className="text-slate-400 text-sm">Avg Latency</p>
                          <p className="text-2xl font-bold text-white">
                            {results.avgLatency || 'N/A'}<span className="text-sm text-slate-400 ml-1">ms</span>
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-lg border border-blue-500/30">
                          <p className="text-slate-400 text-sm">Req/Sec</p>
                          <p className="text-2xl font-bold text-white">
                            {results.requestsPerSec || 'N/A'}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30">
                          <p className="text-slate-400 text-sm">Success Rate</p>
                          <p className="text-2xl font-bold text-green-400">
                            {results.successRate || 'N/A'}%
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 p-4 rounded-lg border border-orange-500/30">
                          <p className="text-slate-400 text-sm">Total Requests</p>
                          <p className="text-2xl font-bold text-white">
                            {results.totalRequests || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {chartData && chartData.latencyData.length > 0 && (
                      <>
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-purple-400" />
                            Latency Distribution (Percentiles)
                          </h3>
                          <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData.latencyData}>
                              <defs>
                                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                              <XAxis dataKey="name" stroke="#94a3b8" />
                              <YAxis stroke="#94a3b8" label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                labelStyle={{ color: '#e2e8f0' }}
                              />
                              <Area type="monotone" dataKey="value" stroke="#a855f7" fillOpacity={1} fill="url(#latencyGradient)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {chartData.requestData.length > 0 && (
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                              <h3 className="text-lg font-semibold text-white mb-4">Requests/Second Distribution</h3>
                              <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={chartData.requestData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                  <XAxis dataKey="name" stroke="#94a3b8" />
                                  <YAxis stroke="#94a3b8" />
                                  <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                    labelStyle={{ color: '#e2e8f0' }}
                                  />
                                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          )}

                          {chartData.statusData.length > 0 && (
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                              <h3 className="text-lg font-semibold text-white mb-4">Status Code Distribution</h3>
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
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                        </div>

                        {chartData.throughputData.length > 0 && (
                          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Throughput Distribution (KB/s)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart data={chartData.throughputData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                  labelStyle={{ color: '#e2e8f0' }}
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

          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={runTest}
                  disabled={isRunning || !config.url}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  <Play className="w-5 h-5" />
                  {isRunning ? 'Running...' : 'Start Test'}
                </button>

                {isRunning && (
                  <button
                    onClick={stopTest}
                    className="w-full px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 transition-all"
                  >
                    <StopCircle className="w-5 h-5" />
                    Stop Test
                  </button>
                )}
              </div>

              {isRunning && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm text-slate-300">
                    <span>{currentStep}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Quick Tips
              </h2>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                  <p><strong>Load Test:</strong> Tests consistent load over time</p>
                </div>
                <div className="flex items-start gap-2">
                  <Activity className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                  <p><strong>Stress Test:</strong> Gradually increases load to find breaking point</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                  <p>Start with lower connection counts and increase gradually</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTesting;