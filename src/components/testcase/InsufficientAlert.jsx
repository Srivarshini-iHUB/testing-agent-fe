import React from 'react';

const InsufficientAlert = ({ data }) => {
  if (!data || data.status !== 'insufficient') return null;

  return (
    <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 dark:border-rose-400 rounded-xl p-6 shadow-lg mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center">
            <i className="fas fa-times-circle text-2xl text-rose-600 dark:text-rose-400"></i>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-rose-800 dark:text-rose-300 mb-2">
            Cannot Generate Test Cases
          </h3>
          <p className="text-rose-700 dark:text-rose-200 mb-4">{data.notice}</p>
          
          {/* Coverage Badge */}
          {data.coverage_percentage !== undefined && (
            <div className="mb-4">
              <span className="inline-flex items-center px-4 py-2 bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 rounded-lg font-semibold text-sm">
                <i className="fas fa-chart-bar mr-2"></i>
                Feature Coverage: {data.coverage_percentage}%
              </span>
            </div>
          )}
          
          {/* Missing Elements */}
          {data.missing_elements && data.missing_elements.length > 0 && (
            <div className="mb-4">
              <h4 className="font-bold text-rose-900 dark:text-rose-200 mb-2 flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                What's Missing:
              </h4>
              <ul className="space-y-2">
                {data.missing_elements.map((item, idx) => (
                  <li key={idx} className="flex items-start bg-white dark:bg-gray-800/50 p-3 rounded-lg">
                    <span className="text-rose-600 dark:text-rose-400 mr-2">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* User Advice */}
          {data.user_advice && data.user_advice.length > 0 && (
            <div className="mb-4">
              <h4 className="font-bold text-rose-900 dark:text-rose-200 mb-2 flex items-center">
                <i className="fas fa-lightbulb mr-2"></i>
                How to Fix:
              </h4>
              <ul className="space-y-2">
                {data.user_advice.map((advice, idx) => (
                  <li key={idx} className="flex items-start bg-white dark:bg-gray-800/50 p-3 rounded-lg border border-rose-200 dark:border-rose-800">
                    <span className="font-bold text-rose-600 dark:text-rose-400 mr-2">{idx + 1}.</span>
                    <span className="text-gray-800 dark:text-gray-200">{advice}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Document Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* FRD Checklist */}
            {data.frd_checklist && (
              <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border-2 border-rose-200 dark:border-rose-800">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  <i className="fas fa-clipboard-list mr-2 text-rose-600 dark:text-rose-400"></i>
                  FRD Should Include:
                </h4>
                <ul className="space-y-2 text-sm">
                  {data.frd_checklist.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <i className="fas fa-check-circle text-emerald-500 dark:text-emerald-400 mr-2 mt-0.5 flex-shrink-0"></i>
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* User Story Checklist */}
            {data.user_story_checklist && (
              <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border-2 border-rose-200 dark:border-rose-800">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  <i className="fas fa-book mr-2 text-rose-600 dark:text-rose-400"></i>
                  User Stories Should Include:
                </h4>
                <ul className="space-y-2 text-sm">
                  {data.user_story_checklist.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <i className="fas fa-check-circle text-emerald-500 dark:text-emerald-400 mr-2 mt-0.5 flex-shrink-0"></i>
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsufficientAlert;
