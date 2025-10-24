import React, { useState } from 'react';

const MyProjects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);

  // Dummy projects data (replace with actual data from context later)
  const userProjects = [
    {
      id: 'project-1',
      name: 'E-Commerce Platform',
      repository: 'https://github.com/ajay/ecommerce',
      frdDocument: 'Ecommerce_FRD.pdf',
      userStories: 'Ecommerce_UserStories.pdf',
      postmanCollection: 'Ecommerce_Postman.json',
      createdAt: '2025-10-15',
      agents: [
        {
          id: 'test-case-generator',
          name: 'Test Case Generation',
          tests: [
            { 
              id: 't1', 
              name: 'Login Page Tests', 
              date: '2025-10-20',
              report: 'Comprehensive test cases for login functionality including edge cases and security checks.' 
            },
            { 
              id: 't2', 
              name: 'Cart Functionality', 
              date: '2025-10-19',
              report: 'Test cases covering add to cart, remove from cart, and cart persistence scenarios.' 
            },
            { 
              id: 't3', 
              name: 'Checkout Flow', 
              date: '2025-10-18',
              report: 'End-to-end checkout process testing with payment gateway integration.' 
            },
          ],
        },
        {
          id: 'unit-testing',
          name: 'Unit Testing',
          tests: [
            { 
              id: 't4', 
              name: 'Product Component', 
              date: '2025-10-21',
              report: 'Unit test results for product display component with 95% code coverage.' 
            },
            { 
              id: 't5', 
              name: 'Search Function', 
              date: '2025-10-20',
              report: 'Search functionality validation with various input scenarios.' 
            },
          ],
        },
      ],
    },
    {
      id: 'project-2',
      name: 'Social Media App',
      repository: 'https://github.com/ajay/socialmedia',
      frdDocument: 'Social_FRD.pdf',
      userStories: 'Social_UserStories.pdf',
      postmanCollection: 'Social_Postman.json',
      createdAt: '2025-10-10',
      agents: [
        {
          id: 'e2e-testing',
          name: 'End-to-End Testing',
          tests: [
            { 
              id: 't7', 
              name: 'Feed Loading', 
              date: '2025-10-22',
              report: 'E2E test for feed loading performance and data accuracy.' 
            },
            { 
              id: 't8', 
              name: 'Profile Update', 
              date: '2025-10-21',
              report: 'Profile update flow testing with image upload validation.' 
            },
          ],
        },
        {
          id: 'smoke-testing',
          name: 'Smoke Testing',
          tests: [
            { 
              id: 't10', 
              name: 'Critical Path Test', 
              date: '2025-10-23',
              report: 'Smoke tests for critical user journeys across the application.' 
            },
          ],
        },
      ],
    },
    {
      id: 'project-3',
      name: 'Banking Dashboard',
      repository: 'https://github.com/ajay/banking',
      frdDocument: 'Banking_FRD.pdf',
      userStories: 'Banking_UserStories.pdf',
      postmanCollection: 'Banking_Postman.json',
      createdAt: '2025-10-05',
      agents: [
        {
          id: 'security-testing',
          name: 'Security Testing',
          tests: [
            { 
              id: 't13', 
              name: 'Authentication Security', 
              date: '2025-10-24',
              report: 'Security vulnerability scan for authentication mechanisms.' 
            },
            { 
              id: 't14', 
              name: 'Data Encryption', 
              date: '2025-10-23',
              report: 'Validation of data encryption at rest and in transit.' 
            },
          ],
        },
        {
          id: 'performance-testing',
          name: 'Performance Testing',
          tests: [
            { 
              id: 't16', 
              name: 'Load Testing', 
              date: '2025-10-22',
              report: 'Load testing results with 1000 concurrent users.' 
            },
          ],
        },
      ],
    },
  ];

  const handleProjectSelect = (proj) => {
    setSelectedProject(proj);
    setSelectedAgent(null);
    setSelectedTest(null);
  };

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    setSelectedTest(null);
  };

  const handleTestSelect = (test) => {
    setSelectedTest(test);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Agents Used ({userProjects.length})</h2>
      
      {/* Project List */}
      <div className="mb-6">
        {/* <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Used Agents ({userProjects.length})
        </h3> */}
        <div className="flex flex-wrap gap-3">
          {userProjects.map((proj) => (
            <button
              key={proj.id}
              onClick={() => handleProjectSelect(proj)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                selectedProject?.id === proj.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-indigo-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <i className="fas fa-folder"></i>
                {proj.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Project Details & Agents */}
      {selectedProject && (
        <div className="mb-6 animate-fadeIn">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            <i className="fas fa-info-circle mr-2 text-indigo-600 dark:text-indigo-400"></i>
            Project: {selectedProject.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <i className="fas fa-cog text-indigo-600 dark:text-indigo-400"></i>
                Configuration Details
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Repository:</strong> 
                  <a href={selectedProject.repository} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline ml-1">
                    {selectedProject.repository}
                  </a>
                </p>
                <p className="text-gray-700 dark:text-gray-300"><strong>FRD:</strong> {selectedProject.frdDocument}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>User Stories:</strong> {selectedProject.userStories}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Postman:</strong> {selectedProject.postmanCollection}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Created:</strong> {selectedProject.createdAt}</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <i className="fas fa-robot text-indigo-600 dark:text-indigo-400"></i>
                Agents Used ({selectedProject.agents.length})
              </h4>
              <div className="flex flex-col gap-2">
                {selectedProject.agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent)}
                    className={`px-4 py-2 rounded-lg text-left border transition-all text-sm flex items-center justify-between ${
                      selectedAgent?.id === agent.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-indigo-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <span>{agent.name}</span>
                    <span className="text-xs opacity-75">
                      {agent.tests.length} test{agent.tests.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test List */}
      {selectedAgent && (
        <div className="mb-6 animate-fadeIn">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            <i className="fas fa-vial mr-2 text-indigo-600 dark:text-indigo-400"></i>
            Tests by {selectedAgent.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedAgent.tests.map((test) => (
              <button
                key={test.id}
                onClick={() => handleTestSelect(test)}
                className={`p-4 rounded-lg border transition-all text-left ${
                  selectedTest?.id === test.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-indigo-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <div className="font-medium mb-2">{test.name}</div>
                <div className="text-xs opacity-75 flex items-center gap-1">
                  <i className="fas fa-calendar-alt"></i>
                  {test.date}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Test Report */}
      {selectedTest && (
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <i className="fas fa-file-alt text-indigo-600 dark:text-indigo-400"></i>
              Report: {selectedTest.name}
            </h3>
            <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-all flex items-center gap-2">
              <i className="fas fa-download"></i>
              Download
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Test Date:</strong> {selectedTest.date}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Agent:</strong> {selectedAgent.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Project:</strong> {selectedProject.name}
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedTest.report}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedProject && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <i className="fas fa-folder-open text-5xl text-gray-400 dark:text-gray-600 mb-4"></i>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Select a project to view details</p>
        </div>
      )}
    </div>
  );
};

export default MyProjects;
