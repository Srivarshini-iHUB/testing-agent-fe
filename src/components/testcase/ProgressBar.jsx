import React from 'react';

const ProgressBar = ({ progress }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-semibold text-gray-800">Processing Documents...</span>
        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {progress}%
        </span>
      </div>
      <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
        </div>
      </div>
      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <span>Extracting features...</span>
        <span>Analyzing requirements...</span>
        <span>Generating test cases...</span>
      </div>
    </div>
  );
};

export default ProgressBar;
