import React, { useState } from 'react';

const MismatchAlert = ({ mismatched_features }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!mismatched_features || mismatched_features.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <svg className="w-7 h-7 text-yellow-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-yellow-800 mb-2">
              Mismatched Features Detected
            </h3>
            <p className="text-yellow-700 mb-3">
              The following <strong>{mismatched_features.length}</strong> feature(s) in your FRD 
              do not have corresponding user stories:
            </p>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold rounded-lg transition-colors mb-3"
            >
              {isExpanded ? 'Hide Details' : 'Show Details'}
              <svg className={`w-5 h-5 ml-2 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {isExpanded && (
              <div className="space-y-3 mt-4">
                {mismatched_features.map((feature, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-bold text-sm">
                        {feature.feature_id}
                      </span>
                      <span className="text-xs text-gray-500">Not mapped to any user story</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{feature.feature_name}</h4>
                    {feature.functions_covered && feature.functions_covered.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {feature.functions_covered.map((func, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {func}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 bg-amber-100 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Recommendation:</strong> Add user stories that cover these features, or verify that feature IDs 
                match between your FRD and User Story documents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MismatchAlert;
