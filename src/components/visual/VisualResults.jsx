import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const VisualRegressionResults = ({ resultData }) => {
  const { theme } = useTheme();
  const [selectedDiff, setSelectedDiff] = useState(null);
  const [imageView, setImageView] = useState('side-by-side'); // 'side-by-side' or 'overlay'

  if (!resultData || resultData.status !== 'success') {
    return null;
  }

  const { report, ssim_score, baseline_base64, annotated_current_base64 } = resultData.data;

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-500 dark:bg-red-600';
      case 'medium': return 'bg-yellow-500 dark:bg-yellow-600';
      case 'low': return 'bg-blue-500 dark:bg-blue-600';
      default: return 'bg-gray-500 dark:bg-gray-600';
    }
  };

  const getStatusColor = (status) => {
    return status === 'pass' 
      ? 'bg-green-500 dark:bg-green-600' 
      : 'bg-red-500 dark:bg-red-600';
  };

  return (
    <div className="space-y-6 mt-8">
      {/* Compact Header Card */}
      <div className={`p-4 rounded-lg ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } shadow-md border-l-4 ${
        report.status === 'pass' ? 'border-green-500' : 'border-red-500'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className={`text-xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Test Results
            </h2>
            <p className={`text-sm mt-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {report.summary}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-lg text-white text-sm font-semibold ${getStatusColor(report.status)}`}>
              {report.status.toUpperCase()}
            </span>
            <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
              theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
            }`}>
              SSIM: {(ssim_score * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Image Comparison - Collapsible */}
      <div className={`rounded-lg overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } shadow-md`}>
        <div className={`px-4 py-3 flex items-center justify-between ${
          theme === 'dark' ? 'bg-gray-700 border-b border-gray-600' : 'bg-gray-100 border-b border-gray-200'
        }`}>
          <h3 className={`font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Image Comparison
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setImageView('side-by-side')}
              className={`px-3 py-1 text-xs font-medium rounded transition ${
                imageView === 'side-by-side'
                  ? 'bg-primary-500 text-white'
                  : theme === 'dark' 
                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Side by Side
            </button>
            <button
              onClick={() => setImageView('overlay')}
              className={`px-3 py-1 text-xs font-medium rounded transition ${
                imageView === 'overlay'
                  ? 'bg-primary-500 text-white'
                  : theme === 'dark' 
                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
              Overlay
            </button>
          </div>
        </div>

        <div className="p-4">
          {imageView === 'side-by-side' ? (
            <div className="grid lg:grid-cols-2 gap-4">
              <div className={`border rounded-lg overflow-hidden ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className={`px-3 py-2 text-sm font-medium text-center ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'
                }`}>
                  Baseline
                </div>
                <img 
                  src={`data:image/jpeg;base64,${baseline_base64}`} 
                  alt="Baseline" 
                  className="w-full h-auto"
                />
              </div>
              <div className={`border rounded-lg overflow-hidden ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className={`px-3 py-2 text-sm font-medium text-center ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'
                }`}>
                  Current (Annotated)
                </div>
                <img 
                  src={`data:image/jpeg;base64,${annotated_current_base64}`} 
                  alt="Current with annotations" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          ) : (
            <div className="relative max-w-4xl mx-auto">
              <img 
                src={`data:image/jpeg;base64,${baseline_base64}`} 
                alt="Baseline" 
                className="w-full h-auto rounded-lg"
              />
              <img 
                src={`data:image/jpeg;base64,${annotated_current_base64}`} 
                alt="Current overlay" 
                className="absolute top-0 left-0 w-full h-auto rounded-lg opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                title="Hover to see annotations"
              />
            </div>
          )}
        </div>
      </div>

      {/* Differences Summary - Compact Cards */}
      {report.differences && report.differences.length > 0 && (
        <div className={`rounded-lg overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-md`}>
          <div className={`px-4 py-3 ${
            theme === 'dark' ? 'bg-gray-700 border-b border-gray-600' : 'bg-gray-100 border-b border-gray-200'
          }`}>
            <h3 className={`font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Detected Differences 
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
              }`}>
                {report.differences.length}
              </span>
            </h3>
          </div>

          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {report.differences.map((diff, index) => (
              <div
                key={index}
                onClick={() => setSelectedDiff(diff)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  theme === 'dark' 
                    ? 'border-gray-700 hover:border-primary-500 bg-gray-700/50 hover:bg-gray-700' 
                    : 'border-gray-200 hover:border-primary-400 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        #{index + 1}
                      </span>
                      <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full text-white ${getSeverityColor(diff.severity)}`}>
                        {diff.severity.toUpperCase()}
                      </span>
                      <span className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {(diff.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {diff.description}
                    </p>
                    <p className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      Location: ({diff.location.x}, {diff.location.y}) · Size: {diff.location.w}×{diff.location.h}px
                    </p>
                  </div>
                  <svg 
                    className={`w-5 h-5 flex-shrink-0 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Differences Message */}
      {(!report.differences || report.differences.length === 0) && (
        <div className={`p-4 rounded-lg border-l-4 border-green-500 ${
          theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
        }`}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className={`font-semibold ${
              theme === 'dark' ? 'text-green-400' : 'text-green-700'
            }`}>
              No differences detected! Images are identical.
            </p>
          </div>
        </div>
      )}

      {/* Modal for Difference Details */}
      {selectedDiff && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedDiff(null)}
        >
          <div 
            className={`rounded-xl p-6 max-w-lg w-full shadow-2xl ${
              theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Difference Details
              </h3>
              <button
                onClick={() => setSelectedDiff(null)}
                className={`p-1 rounded-lg transition ${
                  theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className={`text-sm font-semibold block mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </span>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {selectedDiff.description}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className={`text-sm font-semibold block mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Position
                  </span>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    X: {selectedDiff.location.x}, Y: {selectedDiff.location.y}
                  </p>
                </div>
                <div>
                  <span className={`text-sm font-semibold block mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Size
                  </span>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {selectedDiff.location.w} × {selectedDiff.location.h}px
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <span className={`text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Severity
                  </span>
                  <div className="mt-1">
                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full text-white ${getSeverityColor(selectedDiff.severity)}`}>
                      {selectedDiff.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Confidence
                  </span>
                  <p className={`text-lg font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {(selectedDiff.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualRegressionResults;
