import { useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const VisualTestingAgent = () => {
  const { theme } = useTheme();
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [testType, setTestType] = useState('regression');
  const [testResults, setTestResults] = useState(null);
  const [actualImage, setActualImage] = useState(null);
  const [developedImage, setDevelopedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actualPreview, setActualPreview] = useState(null);
  const [developedPreview, setDevelopedPreview] = useState(null);
  const [isDraggingActual, setIsDraggingActual] = useState(false);
  const [isDraggingDeveloped, setIsDraggingDeveloped] = useState(false);

  const actualInputRef = useRef(null);
  const developedInputRef = useRef(null);

  const assignActual = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setActualImage(file);
    setActualPreview(URL.createObjectURL(file));
  };

  const assignDeveloped = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setDevelopedImage(file);
    setDevelopedPreview(URL.createObjectURL(file));
  };

  const devices = [
    { id: 'desktop', name: 'Desktop', icon: '🖥️', resolution: '1920x1080' },
    { id: 'tablet', name: 'Tablet', icon: '📱', resolution: '768x1024' },
    { id: 'mobile', name: 'Mobile', icon: '📱', resolution: '375x667' },
    { id: 'large-desktop', name: 'Large Desktop', icon: '🖥️', resolution: '2560x1440' }
  ];

  const testTypes = [
    { id: 'regression', name: 'Visual Regression', description: 'Compare with baseline images' },
    { id: 'layout', name: 'Layout Testing', description: 'Check element positioning' },
    { id: 'responsive', name: 'Responsive Design', description: 'Test across screen sizes' },
    { id: 'accessibility', name: 'Accessibility', description: 'Color contrast and readability' }
  ];

  const runVisualTest = () => {
    if (!actualImage || !developedImage) {
      alert('Please upload both Actual and Developed images');
      return;
    }
    setIsProcessing(true);
    setTestResults({ status: 'running', progress: 0, currentStep: 'Analyzing differences...', duration: '0s' });

    const startedAt = Date.now();
    const interval = setInterval(() => {
      setTestResults(prev => {
        const newProgress = Math.min((prev.progress || 0) + 25, 100);
        if (newProgress >= 100) {
          clearInterval(interval);
          const durationSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
          setIsProcessing(false);
          return {
            status: 'completed',
            progress: 100,
            currentStep: 'Visual comparison completed',
            duration: `${durationSec}s`,
            results: {
              totalComparisons: 1,
              passed: 0,
              failed: 1,
              // Simulated diff percentage
              diffPercent: '6.4%',
              // Keep the uploaded images as preview sources
              actualSrc: actualPreview || URL.createObjectURL(actualImage),
              developedSrc: developedPreview || URL.createObjectURL(developedImage)
            }
          };
        }
        return { ...prev, progress: newProgress };
      });
    }, 500);
  };

  const downloadVisualReport = () => {
    const content = `# Visual Test Report\n\n- Status: Completed\n- Differences: ${testResults?.results?.diffPercent || 'N/A'}\n- Total Comparisons: ${testResults?.results?.totalComparisons || 1}`;
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = 'visual_test_report.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          👁️
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Visual Testing Agent
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Automated visual regression testing and UI consistency validation with pixel-perfect comparisons and accessibility checks.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Visual Diff Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Actual Image (Baseline)
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingActual(true); }}
                  onDragLeave={() => setIsDraggingActual(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDraggingActual(false); const f = e.dataTransfer.files?.[0]; assignActual(f); }}
                  className={`relative flex items-center justify-center w-full border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
                    isDraggingActual ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                  } ${actualPreview ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}`}
                  onClick={() => actualInputRef.current?.click()}
                >
                  {actualPreview ? (
                    <div className="w-full">
                      <img src={actualPreview} alt="Actual preview" className="max-h-64 mx-auto rounded-md border border-gray-200 dark:border-gray-600" />
                      <div className="mt-2 text-center text-xs text-gray-600 dark:text-gray-300">Click to replace</div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2">🖼️</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Drag & drop image here, or click to upload</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, JPEG</div>
                    </div>
                  )}
                  <input ref={actualInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => assignActual(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Developed Image (Current)
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingDeveloped(true); }}
                  onDragLeave={() => setIsDraggingDeveloped(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDraggingDeveloped(false); const f = e.dataTransfer.files?.[0]; assignDeveloped(f); }}
                  className={`relative flex items-center justify-center w-full border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
                    isDraggingDeveloped ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                  } ${developedPreview ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}`}
                  onClick={() => developedInputRef.current?.click()}
                >
                  {developedPreview ? (
                    <div className="w-full">
                      <img src={developedPreview} alt="Developed preview" className="max-h-64 mx-auto rounded-md border border-gray-200 dark:border-gray-600" />
                      <div className="mt-2 text-center text-xs text-gray-600 dark:text-gray-300">Click to replace</div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2">🖼️</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Drag & drop image here, or click to upload</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, JPEG</div>
                    </div>
                  )}
                  <input ref={developedInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => assignDeveloped(e.target.files?.[0] || null)} />
                </div>
              </div>

              <button
                onClick={runVisualTest}
                disabled={!actualImage || !developedImage || isProcessing}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Generating Visual Diff...' : 'Generate Visual Diff'}
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Visual Testing Features
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Screenshot comparison</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Layout shift detection</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Cross-browser consistency</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Color contrast analysis</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600 dark:text-gray-300">Responsive design validation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {testResults ? (
            <>
              {/* Progress */}
              {testResults.status === 'running' && (
                <div className="card">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Generating Visual Diff
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Progress</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {testResults.progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${testResults.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Status</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {testResults.currentStep}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Results */}
              {testResults.status === 'completed' && testResults.results && (
                <>
                  <div className="card">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Visual Diff Result
                    </h3>

                    {/* Side-by-side preview */}
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Actual (Baseline)</div>
                        <img src={testResults.results.actualSrc} alt="Actual" className="w-full rounded-lg border border-gray-200 dark:border-gray-700" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Developed (Current)</div>
                        <img src={testResults.results.developedSrc} alt="Developed" className="w-full rounded-lg border border-gray-200 dark:border-gray-700" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Diff Overlay</div>
                        <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img src={testResults.results.actualSrc} alt="Actual" className="w-full opacity-70" />
                          <img src={testResults.results.developedSrc} alt="Developed" className="w-full mix-blend-difference opacity-70 absolute inset-0" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {testResults.results.totalComparisons}
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">Comparisons</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {testResults.results.failed}
                        </div>
                        <div className="text-sm text-red-700 dark:text-red-300">Mismatches</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {testResults.results.diffPercent}
                        </div>
                        <div className="text-sm text-yellow-700 dark:text-yellow-300">Diff %</div>
                      </div>
                    </div>
                  </div>

                  {/* Differences */}
                  {testResults.results.differences.length > 0 && (
                    <div className="card">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Visual Differences Found
                      </h3>
                      <div className="space-y-3">
                        {testResults.results.differences.map((diff, index) => (
                          <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {diff.page} - {diff.element}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  Difference: {diff.difference}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                diff.severity === 'Major' 
                                  ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                                  : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                              }`}>
                                {diff.severity}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded text-sm">
                                View Diff
                              </button>
                              <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-sm">
                                Approve
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex space-x-3">
                    <button onClick={downloadVisualReport} className="flex-1 btn-secondary">Download Report</button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">👁️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready for Visual Testing
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Configure your visual test settings and run comprehensive UI validation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualTestingAgent;
