import { useRef, useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import VisualHeader from '../components/visual/VisualHeader';
import VisualConfigPanel from '../components/visual/VisualConfigPanel';
import VisualFeatures from '../components/visual/VisualFeatures';
import VisualRegressionResults from '../components/visual/VisualResults';
import axios from 'axios';

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
  const [apiUrl, setApiUrl] = useState('http://localhost:8080');
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

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
    <div className="space-y-8">
      <VisualHeader />
      <div className="grid lg:grid-cols-1 gap-8">
        <div className="space-y-6">
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
          {/* <VisualFeatures /> */}
        </div>
        {/* <VisualResults
          testResults={testResults} 
          actualInputRef={actualInputRef} 
          developedInputRef={developedInputRef}
          apiUrl={apiUrl}
        /> */}
      </div>
      
      {/* Full Results Section - Shows after processing completes */}
      {apiResponse && testResults?.status === 'completed' && (
        <div className="mt-8">
          <VisualRegressionResults resultData={apiResponse} />
        </div>
      )}
    </div>
  );
};

export default VisualTestingAgent;
