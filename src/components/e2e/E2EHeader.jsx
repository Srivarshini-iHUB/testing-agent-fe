const E2EHeader = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="text-purple-700 dark:text-purple-300 w-24 h-24 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
          <i className="fas fa-route text-4xl"></i>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Functional Testing Agent
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
            Comprehensive testing of complete user workflows with automated execution and reporting
          </p>
        </div>
      </div>
    </div>
  );
};

export default E2EHeader;
