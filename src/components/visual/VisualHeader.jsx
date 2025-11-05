const VisualHeader = () => {
  return (
    <div className="text-center">
      <div className="text-violet-700 dark:text-violet-300 w-24 h-24 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 mx-auto mb-4">
        <i className="fas fa-mouse-pointer text-4xl"></i>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Visual Testing Agent
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        Automates pixel-perfect UI validation and accessibility checks to ensure design consistency and quality.
      </p>
    </div>
  );
};

export default VisualHeader;


