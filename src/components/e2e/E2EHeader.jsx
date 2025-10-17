const E2EHeader = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-4xl shadow-lg">
          🔄
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            End-to-End Testing Agent
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Comprehensive testing of complete user workflows with automated execution and reporting
          </p>
        </div>
      </div>
    </div>
  );
};

export default E2EHeader;
