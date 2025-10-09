const VisualConfigPanel = ({
  actualPreview,
  developedPreview,
  isProcessing,
  isDraggingActual,
  isDraggingDeveloped,
  actualInputRef,
  developedInputRef,
  assignActual,
  assignDeveloped,
  runVisualTest
}) => {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Visual Diff Configuration
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload Actual Image (Baseline)
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); }}
            className={`relative flex items-center justify-center w-full border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
              isDraggingActual ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
            } ${actualPreview ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}`}
            onClick={() => actualInputRef.current?.click()}
          >
            {actualPreview ? (
              <div className="w-full">
                <img src={actualPreview} alt="Actual preview" className="max-h-64 mx-auto rounded-md border border-gray-200 dark:border-gray-600" />
                <div className="mt-2 text-center text-xs text-gray-600 dark:text-gray-300">Click to replace</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-2">🖼️</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Drag & drop image here, or click to upload</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, JPEG</div>
              </div>
            )}
            <input ref={actualInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => assignActual(e.target.files?.[0] || null)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload Developed Image (Current)
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); }}
            className={`relative flex items-center justify-center w-full border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
              isDraggingDeveloped ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
            } ${developedPreview ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}`}
            onClick={() => developedInputRef.current?.click()}
          >
            {developedPreview ? (
              <div className="w-full">
                <img src={developedPreview} alt="Developed preview" className="max-h-64 mx-auto rounded-md border border-gray-200 dark:border-gray-600" />
                <div className="mt-2 text-center text-xs text-gray-600 dark:text-gray-300">Click to replace</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-2">🖼️</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Drag & drop image here, or click to upload</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, JPEG</div>
              </div>
            )}
            <input ref={developedInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => assignDeveloped(e.target.files?.[0] || null)} />
          </div>
        </div>

        <button
          onClick={runVisualTest}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Generating Visual Diff...' : 'Generate Visual Diff'}
        </button>
      </div>
    </div>
  );
};

export default VisualConfigPanel;


