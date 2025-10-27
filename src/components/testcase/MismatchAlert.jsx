import React, { useState } from 'react';

const MismatchAlert = ({ mismatched_features }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!mismatched_features || mismatched_features.length === 0) return null;

  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 dark:border-orange-400 rounded-xl p-6 shadow-lg mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-2xl text-orange-600 dark:text-orange-400"></i>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-orange-800 dark:text-orange-300 mb-2">
            Mismatched Features Detected
          </h3>
          <p className="text-orange-700 dark:text-orange-200 mb-4">
            The following <strong>{mismatched_features.length}</strong> feature(s) in your FRD 
            do not have corresponding user stories:
          </p>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-800 dark:text-orange-300 font-semibold rounded-lg transition-all mb-4"
          >
            {isExpanded ? (
              <>
                <i className="fas fa-eye-slash"></i>
                Hide Details
              </>
            ) : (
              <>
                <i className="fas fa-eye"></i>
                Show Details
              </>
            )}
            <i className={`fas fa-chevron-down transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
          </button>
          
          {isExpanded && (
            <div className="space-y-3 mt-4">
              {mismatched_features.map((feature, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full font-bold text-sm">
                      <i className="fas fa-tag mr-2"></i>
                      {feature.feature_id}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                      <i className="fas fa-unlink mr-1"></i>
                      Not mapped to any user story
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.feature_name}</h4>
                  {feature.functions_covered && feature.functions_covered.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {feature.functions_covered.map((func, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs rounded-full font-medium">
                          {func}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-2">
              <i className="fas fa-info-circle text-orange-600 dark:text-orange-400 mt-1"></i>
              <div>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>Recommendation:</strong> Add user stories that cover these features, or verify that feature IDs 
                  match between your FRD and User Story documents.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MismatchAlert;
