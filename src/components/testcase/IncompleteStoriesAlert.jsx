import React, { useState } from 'react';

const IncompleteStoriesAlert = ({ incomplete_user_stories }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!incomplete_user_stories || incomplete_user_stories.length === 0) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 dark:border-amber-400 rounded-xl p-6 shadow-lg mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <i className="fas fa-exclamation-circle text-2xl text-amber-600 dark:text-amber-400"></i>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-2">
            Incomplete User Stories Found
          </h3>
          <p className="text-amber-700 dark:text-amber-200 mb-4">
            <strong>{incomplete_user_stories.length}</strong> user story/stories have formatting or content issues:
          </p>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-semibold rounded-lg transition-all mb-4"
          >
            {isExpanded ? (
              <>
                <i className="fas fa-eye-slash"></i>
                Hide Details
              </>
            ) : (
              <>
                <i className="fas fa-eye"></i>
                Show Details
              </>
            )}
            <i className={`fas fa-chevron-down transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
          </button>
          
          {isExpanded && (
            <div className="space-y-3 mt-4">
              {incomplete_user_stories.map((story, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full font-bold text-sm">
                      <i className="fas fa-hashtag mr-1"></i>
                      {story.story_id}
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-full text-xs font-semibold">
                      <i className="fas fa-times-circle mr-1"></i>
                      {story.issue}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm italic bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border-l-4 border-amber-300 dark:border-amber-700">
                    "{story.story}"
                  </p>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <i className="fas fa-info-circle text-amber-600 dark:text-amber-400 mt-1"></i>
              <div>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Recommended Format:</strong> "As a [user type], I want [action] so that [benefit]"
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-2">
                  Each story should also include clear acceptance criteria.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncompleteStoriesAlert;
