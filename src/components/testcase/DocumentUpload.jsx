import React from 'react';

const DocumentUpload = ({ frdFiles, setFrdFiles, userStoryFiles, setUserStoryFiles }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* FRD Upload */}
      <div className="card overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="p-4 border-b border-blue-300 dark:border-blue-600">
          {/* <h3 className="text-2xl font-bold text-white flex items-center">
            <svg className="w-6 h-6 mr-3 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-gray-900 dark:text-white">Functional Requirements</span>
          </h3> */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Functional Requirements
          </h2>

          <p className="text-gray-600 dark:text-gray-300 text-sm">Upload FRD documents containing features and specifications</p>
        </div>

        <div className="p-6" >
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={(e) => setFrdFiles(Array.from(e.target.files))}
            className="block w-full text-sm text-gray-700 dark:text-gray-300
              file:mr-4 file:py-3 file:px-6
              file:rounded-xl file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700 dark:file:bg-gray-700 dark:file:text-gray-100
              hover:file:bg-primary-100 dark:hover:file:bg-gray-600 cursor-pointer
              file:transition-all file:duration-200"
          />

          {frdFiles.length > 0 && (
            <div className="mt-6 space-y-3" >
              <div className="flex items-center justify-between" >
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {frdFiles.length} Document{frdFiles.length > 1 ? 's' : ''} Selected
                </p>
                <button
                  onClick={() => setFrdFiles([])}
                  className="text-xs text-error-600 hover:text-error-700 font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {frdFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-secondary-50 dark:bg-gray-700 p-3 rounded-lg border border-secondary-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Story Upload */}
      <div className="card overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="p-4 border-b border-blue-300 dark:border-blue-600">
          {/* <h3 className="text-xl font-bold text-white flex items-center">
            <svg className="w-6 h-6 mr-3 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-gray-900 dark:text-white">User Stories</span>
          </h3> */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            User Stories
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Upload documents containing user stories and acceptance criteria</p>
        </div>

        <div className="p-6">
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={(e) => setUserStoryFiles(Array.from(e.target.files))}
            className="block w-full text-sm text-gray-700 dark:text-gray-300
              file:mr-4 file:py-3 file:px-6
              file:rounded-xl file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700 dark:file:bg-gray-700 dark:file:text-gray-100
              hover:file:bg-primary-100 dark:hover:file:bg-gray-600 cursor-pointer
              file:transition-all file:duration-200"
          />

          {userStoryFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {userStoryFiles.length} Document{userStoryFiles.length > 1 ? 's' : ''} Selected
                </p>
                <button
                  onClick={() => setUserStoryFiles([])}
                  className="text-xs text-error-600 hover:text-error-700 font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {userStoryFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-secondary-50 dark:bg-gray-700 p-3 rounded-lg border border-secondary-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
