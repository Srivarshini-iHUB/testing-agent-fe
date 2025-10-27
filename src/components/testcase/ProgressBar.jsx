import React from 'react';

const ProgressBar = ({ progress }) => {
  return (
    <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <i className="fas fa-spinner fa-spin text-indigo-600 dark:text-indigo-400"></i>
          Generating Test Cases
        </h3>
        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{Math.round(progress)}%</span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 transition-all duration-500 ease-out rounded-full relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/30 dark:bg-white/10 animate-pulse"></div>
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <i className="fas fa-file-alt"></i>
          Extracting features
        </span>
        <span className="flex items-center gap-1">
          <i className="fas fa-search"></i>
          Analyzing requirements
        </span>
        <span className="flex items-center gap-1">
          <i className="fas fa-magic"></i>
          Generating test cases
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
