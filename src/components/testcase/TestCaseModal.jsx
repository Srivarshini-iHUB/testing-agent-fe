import React from 'react';

const TestCaseModal = ({ testCase, onClose }) => {
  if (!testCase) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2 mb-2">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold">
                  {testCase.test_case_id}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold
                  ${testCase.test_type === 'Positive' ? 'bg-green-400 text-green-900' : ''}
                  ${testCase.test_type === 'Negative' ? 'bg-red-400 text-red-900' : ''}
                  ${testCase.test_type === 'Edge Case' ? 'bg-yellow-400 text-yellow-900' : ''}
                  ${testCase.test_type === 'Boundary' ? 'bg-blue-400 text-blue-900' : ''}
                `}>
                  {testCase.test_type}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold
                  ${testCase.priority === 'Critical' ? 'bg-red-400 text-red-900' : ''}
                  ${testCase.priority === 'High' ? 'bg-orange-400 text-orange-900' : ''}
                  ${testCase.priority === 'Medium' ? 'bg-yellow-400 text-yellow-900' : ''}
                  ${testCase.priority === 'Low' ? 'bg-gray-300 text-gray-900' : ''}
                `}>
                  {testCase.priority} Priority
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white leading-tight">
                {testCase.test_scenario}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-white/20 rounded-xl transition-colors flex-shrink-0"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Modal Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-8 space-y-6">
          
          {/* Feature Name */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wide mb-2">Feature</h4>
            <p className="text-gray-800 dark:text-gray-200 text-lg font-semibold">{testCase.feature_name}</p>
          </div>
          
          {/* Preconditions */}
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Preconditions
            </h4>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{testCase.preconditions}</p>
            </div>
          </div>
          
          {/* Test Steps */}
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Test Steps
            </h4>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-5 border border-indigo-200 dark:border-indigo-800">
              <div className="space-y-3">
                {testCase.test_steps.split('\n').filter(step => step.trim()).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <p className="flex-1 text-gray-800 dark:text-gray-200 pt-1">{step.replace(/^\d+\.\s*/, '')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Test Data */}
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Test Data
            </h4>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
              <div className="font-mono text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {testCase.test_data}
              </div>
            </div>
          </div>
          
          {/* Expected Result */}
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Expected Result
            </h4>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border-2 border-green-300 dark:border-green-700">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-medium">
                {testCase.expected_result}
              </p>
            </div>
          </div>
          
          {/* Automation Status */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Automation Status:</span>
              <span className={`px-4 py-2 rounded-lg text-sm font-bold
                ${testCase.automation_status === 'Automated' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : ''}
                ${testCase.automation_status === 'Manual' ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300' : ''}
                ${testCase.automation_status === 'To Be Automated' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : ''}
              `}>
                {testCase.automation_status}
              </span>
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800/90 backdrop-blur-sm px-8 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Test ID:</span> {testCase.test_case_id}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestCaseModal;
