import React from 'react';

const InsufficientAlert = ({ data }) => {
  if (!data || data.status !== 'insufficient') return null;

  return (
    <div className="card border-l-4 border-error-500">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="w-8 h-8 text-error-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="ml-4 flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Cannot Generate Test Cases
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{data.notice}</p>
          
          {/* Coverage Badge */}
          {data.coverage_percentage !== undefined && (
            <div className="mb-4">
              <span className="inline-flex items-center px-4 py-2 bg-error-100 text-error-800 rounded-lg font-semibold text-sm">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7z" />
                </svg>
                Feature Coverage: {data.coverage_percentage}%
              </span>
            </div>
          )}
          
          {/* Missing Elements */}
          {data.missing_elements && data.missing_elements.length > 0 && (
            <div className="mb-4">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                What's Missing:
              </h4>
              <ul className="space-y-1">
                {data.missing_elements.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-error-600 mr-2">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* User Advice */}
          {data.user_advice && data.user_advice.length > 0 && (
            <div className="mb-4">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                How to Fix:
              </h4>
              <ul className="space-y-2">
                {data.user_advice.map((advice, idx) => (
                  <li key={idx} className="flex items-start bg-secondary-50 dark:bg-gray-700 p-3 rounded-lg">
                    <span className="font-bold text-primary-600 dark:text-primary-400 mr-2">{idx + 1}.</span>
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
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-secondary-200 dark:border-gray-600">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  FRD Should Include:
                </h4>
                <ul className="space-y-1 text-sm">
                  {data.frd_checklist.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-4 h-4 text-success-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* User Story Checklist */}
            {data.user_story_checklist && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-secondary-200 dark:border-gray-600">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  User Stories Should Include:
                </h4>
                <ul className="space-y-1 text-sm">
                  {data.user_story_checklist.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-4 h-4 text-success-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
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
