import React, { useState } from 'react';
import { Play, StopCircle, Settings, FileText, AlertCircle, TrendingUp, Zap, Activity } from 'lucide-react';

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
    setCurrentStep('Initializing test...');
    setProgress(10);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 1000);

      const response = await fetch('http://localhost:8000/api/performance/test', {
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Performance Testing</h1>
          </div>
          <p className="text-slate-300">AI-powered load and stress testing for your APIs</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Configuration */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Test Configuration
              </h2>

              <div className="space-y-4">
                {/* URL Input */}
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

                {/* Method and Test Mode */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      HTTP Method
                    </label>
                    <select
                      value={config.method}
                      onChange={(e) => setConfig({ ...config, method: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={isRunning}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                      <option value="DELETE">DELETE</option>
                    </select>
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

                {/* Conditional Parameters */}
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

                {/* Advanced Options Toggle */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-2"
                  disabled={isRunning}
                >
                  <Settings className="w-4 h-4" />
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </button>

                {/* Advanced Options */}
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

                    {['POST', 'PUT', 'PATCH'].includes(config.method) && (
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Request Body (JSON)
                        </label>
                        <textarea
                          value={config.body}
                          onChange={(e) => setConfig({ ...config, body: e.target.value })}
                          placeholder='{"key": "value"}'
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                          rows="4"
                          disabled={isRunning}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Results Section */}
            {(results || error) && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Test Results
                </h2>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Error</p>
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {results && (
                  <div className="space-y-4">
                    {results.report ? (
                      <div className="prose prose-invert max-w-none">
                        <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm">
                          {results.report}
                        </pre>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900/50 p-4 rounded-lg">
                          <p className="text-slate-400 text-sm">Avg Latency</p>
                          <p className="text-2xl font-bold text-white">
                            {results.avgLatency || 'N/A'} ms
                          </p>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg">
                          <p className="text-slate-400 text-sm">Req/Sec</p>
                          <p className="text-2xl font-bold text-white">
                            {results.requestsPerSec || 'N/A'}
                          </p>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg">
                          <p className="text-slate-400 text-sm">Success Rate</p>
                          <p className="text-2xl font-bold text-green-400">
                            {results.successRate || 'N/A'}%
                          </p>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg">
                          <p className="text-slate-400 text-sm">Total Requests</p>
                          <p className="text-2xl font-bold text-white">
                            {results.totalRequests || 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Action Buttons */}
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

              {/* Progress Indicator */}
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

            {/* Info Cards */}
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