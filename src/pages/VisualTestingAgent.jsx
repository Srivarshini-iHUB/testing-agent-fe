import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import VisualHeader from '../components/visual/VisualHeader';
import VisualConfigPanel from '../components/visual/VisualConfigPanel';
import VisualFeatures from '../components/visual/VisualFeatures';
import VisualRegressionResults from '../components/visual/VisualResults';
import axios from 'axios';

const VisualTestingAgent = () => {
  const navigate = useNavigate();
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
  const [apiUrl, setApiUrl] = useState('http://localhost:8080');
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  const actualInputRef = useRef(null);
  const developedInputRef = useRef(null);

  useEffect(() => {
    const fetchNgrokUrl = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/ngrok-url`);
        setApiUrl(response.data.ngrok_url);
      } catch (err) {
        console.warn('Failed to fetch ngrok URL, using localhost');
      }
    };
    fetchNgrokUrl();
  }, []);

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

  const runVisualTest = async () => {
    if (!actualInputRef.current?.files[0] || !developedInputRef.current?.files[0]) {
      setError('Please upload both baseline and current images.');
      return;
    }
    
    setIsProcessing(true);
    setTestResults({ status: 'running', progress: 0, currentStep: 'Initializing' });
    setError(null);
    setApiResponse(null);

    try {
      const formData = new FormData();
      formData.append('baseline', actualInputRef.current.files[0]);
      formData.append('current', developedInputRef.current.files[0]);

      setTestResults({ status: 'running', progress: 30, currentStep: 'Processing Images' });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTestResults({ status: 'running', progress: 60, currentStep: 'Analyzing Differences' });

      const response = await axios.post(`${apiUrl}/visual-testing`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('API Response:', response.data);

      // Store the full API response
      setApiResponse(response.data);

      setTestResults({
        status: 'completed',
        results: {
          report: response.data.data.report,
          ssim_score: response.data.data.ssim_score,
          baseline_base64: response.data.data.baseline_base64,
          annotated_current_base64: response.data.data.annotated_current_base64,
        },
      });
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      setError('Failed to process images: ' + (error.response?.data?.detail || error.message));
      setTestResults(null);
      setApiResponse(null);
    } finally {
      setIsProcessing(false);
    }
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
            <i className="fas fa-mouse-pointer text-4xl text-violet-600 dark:text-violet-400"></i>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Visual Testing</h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">AI-powered visual regression testing for UI consistency</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Configuration Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg h-fit">
            <div className="flex items-center gap-2 mb-6">
              <i className="fas fa-cog text-violet-600 dark:text-violet-400"></i>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Test Configuration</h2>
            </div>

            <VisualConfigPanel
              actualPreview={actualPreview}
              developedPreview={developedPreview}
              isProcessing={isProcessing}
              isDraggingActual={isDraggingActual}
              isDraggingDeveloped={isDraggingDeveloped}
              actualInputRef={actualInputRef}
              developedInputRef={developedInputRef}
              assignActual={assignActual}
              assignDeveloped={assignDeveloped}
              setTestResults={setTestResults}
              setIsProcessing={setIsProcessing}
              setIsDraggingActual={setIsDraggingActual}
              setIsDraggingDeveloped={setIsDraggingDeveloped}
              runVisualTest={runVisualTest}
              error={error}
              setError={setError}
            />
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
                  <i className="fas fa-image text-violet-600 dark:text-violet-400 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-300">Image Comparison</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Upload baseline and current images for visual regression testing</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fas fa-search text-blue-600 dark:text-blue-400 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-300">Pixel-Level Analysis</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Detects even minor visual differences between images</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fas fa-chart-line text-green-600 dark:text-green-400 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-300">SSIM Scoring</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Structural Similarity Index for accurate comparison</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fas fa-download text-purple-600 dark:text-purple-400 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-300">Detailed Reports</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Get annotated images and comprehensive analysis reports</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section - Full Width Below */}
        <div className="mt-6">
          {apiResponse && testResults?.status === 'completed' && (
            <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg">
              <VisualRegressionResults resultData={apiResponse} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualTestingAgent;