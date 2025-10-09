const VisualHeader = () => {
  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
        👁️
      </div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Visual Testing Agent
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        Automated visual regression testing and UI consistency validation with pixel-perfect comparisons and accessibility checks.
      </p>
    </div>
  );
};

export default VisualHeader;


