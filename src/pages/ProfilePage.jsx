import React, { useState } from 'react';

const ProfilePage = () => {
  // Dummy user data
  const user = {
    name: 'Ajay Kumar',
    projects: [
      {
        id: 'project-1',
        name: 'E-Commerce Platform',
        repository: 'https://github.com/ajay/ecommerce',
        frdDocument: 'Ecommerce_FRD.pdf',
        userStories: 'Ecommerce_UserStories.pdf',
        postmanCollection: 'Ecommerce_Postman.json',
        agents: [
          {
            id: 'test-case-generator',
            name: 'Test Case Generation',
            tests: [
              { id: 't1', name: 'Login Page Tests', testedUI: '<div class="p-4 bg-green-100">Login Page UI Snapshot</div>' },
              { id: 't2', name: 'Cart Functionality', testedUI: '<div class="p-4 bg-blue-100">Cart UI Snapshot</div>' },
              { id: 't3', name: 'Checkout Flow', testedUI: '<div class="p-4 bg-yellow-100">Checkout UI Snapshot</div>' },
            ],
          },
          {
            id: 'unit-testing',
            name: 'Unit Testing',
            tests: [
              { id: 't4', name: 'Product Component', testedUI: '<div class="p-4 bg-red-100">Product Component UI</div>' },
              { id: 't5', name: 'Search Function', testedUI: '<div class="p-4 bg-purple-100">Search Function UI</div>' },
              { id: 't6', name: 'Filter Module', testedUI: '<div class="p-4 bg-pink-100">Filter Module UI</div>' },
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
        agents: [
          {
            id: 'e2e-testing',
            name: 'Functional Testing',
            tests: [
              { id: 't7', name: 'Feed Loading', testedUI: '<div class="p-4 bg-orange-100">Feed UI Snapshot</div>' },
              { id: 't8', name: 'Profile Update', testedUI: '<div class="p-4 bg-indigo-100">Profile UI Snapshot</div>' },
              { id: 't9', name: 'Messaging Feature', testedUI: '<div class="p-4 bg-teal-100">Messaging UI Snapshot</div>' },
            ],
          },
          {
            id: 'smoke-testing',
            name: 'Smoke Testing',
            tests: [
              { id: 't10', name: 'Login Test', testedUI: '<div class="p-4 bg-gray-100">Login Smoke UI</div>' },
              { id: 't11', name: 'Signup Test', testedUI: '<div class="p-4 bg-cyan-100">Signup Smoke UI</div>' },
              { id: 't12', name: 'Notification Test', testedUI: '<div class="p-4 bg-lime-100">Notification Smoke UI</div>' },
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
        agents: [
          {
            id: 'security-testing',
            name: 'Security Testing',
            tests: [
              { id: 't13', name: 'Login Vulnerability', testedUI: '<div class="p-4 bg-red-200">Login Security UI</div>' },
              { id: 't14', name: 'Transfer Funds', testedUI: '<div class="p-4 bg-green-200">Transfer Funds Security UI</div>' },
              { id: 't15', name: 'Account Settings', testedUI: '<div class="p-4 bg-blue-200">Account Settings Security UI</div>' },
            ],
          },
          {
            id: 'performance-testing',
            name: 'Performance Testing',
            tests: [
              { id: 't16', name: 'Dashboard Load', testedUI: '<div class="p-4 bg-yellow-200">Dashboard Load UI</div>' },
              { id: 't17', name: 'Transactions API', testedUI: '<div class="p-4 bg-pink-200">Transactions API UI</div>' },
              { id: 't18', name: 'Reports Generation', testedUI: '<div class="p-4 bg-purple-200">Reports UI</div>' },
            ],
          },
        ],
      },
    ],
  };

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <h1 className="text-3xl font-bold mb-6">User Profile: {user.name}</h1>

      {/* Project List */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Projects</h2>
        <div className="flex flex-wrap gap-3">
          {user.projects.map((project) => (
            <button
              key={project.id}
              onClick={() => handleProjectSelect(project)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                selectedProject?.id === project.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-indigo-100 dark:hover:bg-gray-700'
              }`}
            >
              {project.name}
            </button>
          ))}
        </div>
      </section>

      {/* Project Configuration & Agents */}
      {selectedProject && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Project Configuration: {selectedProject.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="font-semibold mb-2">Configuration Details</h3>
              <p><strong>Repository:</strong> {selectedProject.repository}</p>
              <p><strong>FRD Document:</strong> {selectedProject.frdDocument}</p>
              <p><strong>User Stories:</strong> {selectedProject.userStories}</p>
              <p><strong>Postman Collection:</strong> {selectedProject.postmanCollection}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="font-semibold mb-2">Agents Used</h3>
              <div className="flex flex-col gap-2">
                {selectedProject.agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent)}
                    className={`px-4 py-2 rounded-lg text-left border transition-all ${
                      selectedAgent?.id === agent.id
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-indigo-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {agent.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Test List */}
      {selectedAgent && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Tests Performed by Agent: {selectedAgent.name} (Showing up to 5 latest tests)
          </h2>
          <div className="flex flex-wrap gap-3">
            {selectedAgent.tests.slice(0, 5).map((test) => (
              <button
                key={test.id}
                onClick={() => handleTestSelect(test)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  selectedTest?.id === test.id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-indigo-100 dark:hover:bg-gray-700'
                }`}
              >
                {test.name}
              </button>
            ))}
          </div>
          {selectedAgent.tests.length > 5 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Note: Only 5 most recent tests are displayed per agent.
            </p>
          )}
        </section>
      )}

      {/* Tested UI Display */}
      {selectedTest && (
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">
            Tested UI for Test: {selectedTest.name}
          </h2>
          <div className="border rounded-lg p-4">
            <div dangerouslySetInnerHTML={{ __html: selectedTest.testedUI }} />
          </div>
        </section>
      )}
    </div>
  );
};

export default ProfilePage;
