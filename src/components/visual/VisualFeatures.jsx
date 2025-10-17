const VisualFeatures = () => {
  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Visual Testing Features
      </h3>
      <ul className="space-y-3">
        <li className="flex items-start">
          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          <span className="text-gray-600 dark:text-gray-300">Screenshot comparison</span>
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          <span className="text-gray-600 dark:text-gray-300">Layout shift detection</span>
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          <span className="text-gray-600 dark:text-gray-300">Cross-browser consistency</span>
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          <span className="text-gray-600 dark:text-gray-300">Color contrast analysis</span>
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          <span className="text-gray-600 dark:text-gray-300">Responsive design validation</span>
        </li>
      </ul>
    </div>
  );
};

export default VisualFeatures;


