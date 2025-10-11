import React, { useState } from 'react';
import axios from 'axios';

const VisualConfigPanel = ({
  actualPreview,
  developedPreview,
  isProcessing,
  isDraggingActual,
  isDraggingDeveloped,
  actualInputRef,
  developedInputRef,
  assignActual,
  assignDeveloped,
  setTestResults,
  setIsProcessing,
  setIsDraggingActual,
  setIsDraggingDeveloped,
}) => {
  const [error, setError] = useState(null);

  const runVisualTest = async () => {
    if (!actualInputRef.current?.files[0] || !developedInputRef.current?.files[0]) {
      setError('Please upload both baseline and current images.');
      return;
    }
    if (typeof setIsProcessing === 'function') {
      setIsProcessing(true);
    }
    if (typeof setTestResults === 'function') {
      setTestResults({ status: 'running', progress: 0, currentStep: 'Initializing' });
    }
    setError(null);

    try {
      const formData = new FormData();
      formData.append('baseline', actualInputRef.current.files[0]);
      formData.append('current', developedInputRef.current.files[0]);

      if (typeof setTestResults === 'function') {
        setTestResults({ status: 'running', progress: 30, currentStep: 'Processing Images' });
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (typeof setTestResults === 'function') {
        setTestResults({ status: 'running', progress: 60, currentStep: 'Analyzing Differences' });
      }

      const response = await axios.post('http://localhost:8000/api/visual-testing', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (typeof setTestResults === 'function') {
        setTestResults({
          status: 'completed',
          results: {
            report: response.data.data.report,
            ssim_score: response.data.data.ssim_score,
            baselineSrc: `data:image/jpeg;base64,${response.data.data.baseline_base64}`,
            annotatedSrc: `data:image/jpeg;base64,${response.data.data.annotated_current_base64}`,
            totalComparisons: 1,
            failed: response.data.data.report.differences.length,
            diffPercent: ((1 - response.data.data.ssim_score) * 100).toFixed(2),
          },
        });
      }
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      setError('Failed to process images: ' + (error.response?.data?.detail || error.message));
      if (typeof setTestResults === 'function') {
        setTestResults(null);
      }
    } finally {
      if (typeof setIsProcessing === 'function') {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Visual Diff Configuration
      </h2>
      
      {/* Landscape Layout - Side by Side Images */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Actual/Baseline Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
            Upload Baseline Image
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); }}
            className={`relative flex items-center justify-center w-full h-80 border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
              isDraggingActual 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' 
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
            } ${actualPreview ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}`}
            onClick={() => actualInputRef.current?.click()}
          >
            {actualPreview ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <img 
                  src={actualPreview} 
                  alt="Baseline preview" 
                  className="max-h-full max-w-full object-contain rounded-md border border-gray-200 dark:border-gray-600" 
                />
                <div className="mt-3 text-center text-xs text-gray-600 dark:text-gray-300 font-medium">
                  Click to replace
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-5xl mb-3">🖼️</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Drag & drop baseline image
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  or click to upload
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-4 py-1 bg-gray-100 dark:bg-gray-600 rounded-full inline-block">
                  PNG, JPG, JPEG
                </div>
              </div>
            )}
            <input 
              ref={actualInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => assignActual(e.target.files?.[0] || null)} 
            />
          </div>
        </div>

        {/* Developed/Current Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
            Upload Current Image
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); }}
            className={`relative flex items-center justify-center w-full h-80 border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
              isDraggingDeveloped 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' 
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
            } ${developedPreview ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}`}
            onClick={() => developedInputRef.current?.click()}
          >
            {developedPreview ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <img 
                  src={developedPreview} 
                  alt="Current preview" 
                  className="max-h-full max-w-full object-contain rounded-md border border-gray-200 dark:border-gray-600" 
                />
                <div className="mt-3 text-center text-xs text-gray-600 dark:text-gray-300 font-medium">
                  Click to replace
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-5xl mb-3">🖼️</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Drag & drop current image
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  or click to upload
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-4 py-1 bg-gray-100 dark:bg-gray-600 rounded-full inline-block">
                  PNG, JPG, JPEG
                </div>
              </div>
            )}
            <input 
              ref={developedInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => assignDeveloped(e.target.files?.[0] || null)} 
            />
          </div>
        </div>
      </div>

      {/* Centered Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={runVisualTest}
          disabled={isProcessing || !actualPreview || !developedPreview}
          className="btn-primary px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-w-[300px] shadow-lg hover:shadow-xl transition-all"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Images...
            </span>
          ) : (
            'Generate Visual Diff'
          )}
        </button>
      </div>
    </div>
  );
};

export default VisualConfigPanel;
