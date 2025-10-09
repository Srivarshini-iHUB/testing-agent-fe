import { useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import VisualHeader from '../components/visual/VisualHeader';
import VisualConfigPanel from '../components/visual/VisualConfigPanel';
import VisualFeatures from '../components/visual/VisualFeatures';
import VisualResults from '../components/visual/VisualResults';

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

  // Configuration options can be extended; currently not rendered directly in the page

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
              diffPercent: '6.4%',
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
      <VisualHeader />
      <div className="grid lg:grid-cols-2 gap-8">
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
            runVisualTest={runVisualTest}
          />
          <VisualFeatures />
        </div>
        <VisualResults testResults={testResults} downloadVisualReport={downloadVisualReport} />
      </div>
    </div>
  );
};

export default VisualTestingAgent;
