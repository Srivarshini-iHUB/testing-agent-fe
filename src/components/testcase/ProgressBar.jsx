import React from 'react';

const ProgressBar = ({ progress }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Processing Documents...</span>
        <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          {progress}%
        </span>
      </div>
      <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/30 dark:bg-white/10 animate-pulse"></div>
        </div>
      </div>
      <div className="mt-4 flex justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Extracting features...</span>
        <span>Analyzing requirements...</span>
        <span>Generating test cases...</span>
      </div>
    </div>
  );
};

export default ProgressBar;
