import React from 'react';

const DocumentUpload = ({ frdFiles, setFrdFiles, userStoryFiles, setUserStoryFiles }) => {
  return (
    <div className="mb-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Upload Project Documents</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Upload your FRD and User Story documents to generate test cases
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FRD Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <i className="fas fa-file-alt text-xl text-white"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Functional Requirements</h3>
                <p className="text-xs text-white/90">PDF, DOCX, TXT</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="relative">
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFrdFiles(Array.from(e.target.files))}
                id="frd-upload"
                className="hidden"
              />
              <label
                htmlFor="frd-upload"
                className="block w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 dark:text-gray-500 mb-2 block"></i>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                  Click to upload
                </p>
              </label>
            </div>

            {frdFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    <i className="fas fa-check-circle text-emerald-500 mr-1"></i>
                    {frdFiles.length} File{frdFiles.length > 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={() => setFrdFiles([])}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold"
                  >
                    <i className="fas fa-times-circle mr-1"></i>Clear
                  </button>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                  {frdFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-file-pdf text-blue-600 dark:text-blue-400 text-xs"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Story Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <i className="fas fa-book text-xl text-white"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">User Stories</h3>
                <p className="text-xs text-white/90">PDF, DOCX, TXT</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="relative">
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                onChange={(e) => setUserStoryFiles(Array.from(e.target.files))}
                id="userstory-upload"
                className="hidden"
              />
              <label
                htmlFor="userstory-upload"
                className="block w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
              >
                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 dark:text-gray-500 mb-2 block"></i>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                  Click to upload
                </p>
              </label>
            </div>

            {userStoryFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    <i className="fas fa-check-circle text-emerald-500 mr-1"></i>
                    {userStoryFiles.length} File{userStoryFiles.length > 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={() => setUserStoryFiles([])}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold"
                  >
                    <i className="fas fa-times-circle mr-1"></i>Clear
                  </button>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                  {userStoryFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-file-word text-purple-600 dark:text-purple-400 text-xs"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
