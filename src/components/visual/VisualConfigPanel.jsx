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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Visual Diff Configuration
      </h2>
      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      <div className="space-y-4">
        {/* Actual Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload Actual Image (Baseline)
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setIsDraggingActual(true)}
            onDragLeave={() => setIsDraggingActual(false)}
            className={`relative flex items-center justify-center w-full border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
              isDraggingActual
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
            } ${actualPreview ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}`}
            onClick={() => actualInputRef.current?.click()}
          >
            {actualPreview ? (
              <div className="w-full">
                <img
                  src={actualPreview}
                  alt="Actual preview"
                  className="max-h-64 mx-auto rounded-md border border-gray-200 dark:border-gray-600"
                />
                <div className="mt-2 text-center text-xs text-gray-600 dark:text-gray-300">
                  Click to replace
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-2">🖼️</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Drag & drop image here, or click to upload
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, JPEG</div>
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

        {/* Developed Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload Developed Image (Current)
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setIsDraggingDeveloped(true)}
            onDragLeave={() => setIsDraggingDeveloped(false)}
            className={`relative flex items-center justify-center w-full border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
              isDraggingDeveloped
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
            } ${developedPreview ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}`}
            onClick={() => developedInputRef.current?.click()}
          >
            {developedPreview ? (
              <div className="w-full">
                <img
                  src={developedPreview}
                  alt="Developed preview"
                  className="max-h-64 mx-auto rounded-md border border-gray-200 dark:border-gray-600"
                />
                <div className="mt-2 text-center text-xs text-gray-600 dark:text-gray-300">
                  Click to replace
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-2">🖼️</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Drag & drop image here, or click to upload
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, JPEG</div>
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

        {/* Run Test Button */}
        <button
          onClick={runVisualTest}
          disabled={isProcessing}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Generating Visual Diff...' : 'Generate Visual Diff'}
        </button>
      </div>
    </div>
  );
};

export default VisualConfigPanel;
