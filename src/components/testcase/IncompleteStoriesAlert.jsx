import React, { useState } from 'react';

const IncompleteStoriesAlert = ({ incomplete_user_stories }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!incomplete_user_stories || incomplete_user_stories.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-start">
        <svg className="w-7 h-7 text-orange-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-orange-800 mb-2">
            Incomplete User Stories Found
          </h3>
          <p className="text-orange-700 mb-3">
            <strong>{incomplete_user_stories.length}</strong> user story/stories have formatting or content issues:
          </p>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 font-semibold rounded-lg transition-colors mb-3"
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
            <svg className={`w-5 h-5 ml-2 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          {isExpanded && (
            <div className="space-y-3 mt-4">
              {incomplete_user_stories.map((story, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="flex items-start justify-between mb-2">
                    <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-bold text-sm">
                      {story.story_id}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {story.issue}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm italic">"{story.story}"</p>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 bg-orange-100 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              <strong>Recommended Format:</strong> "As a [user type], I want [action] so that [benefit]"
              <br />
              Each story should also include clear acceptance criteria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncompleteStoriesAlert;
