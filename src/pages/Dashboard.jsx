import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useUser } from '../contexts/UserContext'

const Dashboard = () => {
  const { theme, isDark, toggleTheme } = useTheme()
  const { user, project } = useUser()
  const navigate = useNavigate()
  
  const [selectedAgents, setSelectedAgents] = useState([])
  const [testMode, setTestMode] = useState('individual')
  const [isRunning, setIsRunning] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [progress, setProgress] = useState(0)
  const [agentStatuses, setAgentStatuses] = useState({})
  const [testResults, setTestResults] = useState(null)

  const agents = [
    {
      id: 'test-case-generator',
      name: 'Test Case Generation',
      icon: 'fa-file-alt',
      gradient: 'from-blue-500 to-blue-600',
      description: 'Automatically generates comprehensive test cases based on your code structure and requirements.',
      path: '/test-case-generator'
    },
    {
      id: 'unit-testing',
      name: 'Unit Testing',
      icon: 'fa-vial',
      gradient: 'from-indigo-500 to-indigo-600',
      description: 'Executes unit tests to validate individual components and functions of your application.',
      path: '/unit-testing'
    },
    {
      id: 'integration-testing',
      name: 'Integration Testing',
      icon: 'fa-link',
      gradient: 'from-cyan-500 to-cyan-600',
      description: 'Verifies the interaction between different modules and systems in your application.',
      path: '/integration-testing'
    },
    {
      id: 'e2e-testing',
      name: 'End-to-End Testing',
      icon: 'fa-route',
      gradient: 'from-teal-500 to-teal-600',
      description: 'Simulates real user scenarios to validate the entire application workflow from start to finish.',
      path: '/e2e-testing'
    },
    {
      id: 'security-testing',
      name: 'Security Testing',
      icon: 'fa-shield-alt',
      gradient: 'from-emerald-500 to-emerald-600',
      description: 'Identifies vulnerabilities and security risks in your application code and infrastructure.',
      path: '/security-testing'
    },
    {
      id: 'smoke-testing',
      name: 'Smoke Testing',
      icon: 'fa-fire',
      gradient: 'from-orange-500 to-orange-600',
      description: 'Performs basic functionality checks to ensure critical features are working after deployment.',
      path: '/smoke-testing'
    },
    {
      id: 'visual-testing',
      title: 'Visual Testing Agent',
      description: 'Automated visual regression testing and UI consistency validation.',
      icon: '👁️',
      path: '/visual-testing',
      color: 'orange',
      features: ['Screenshot Comparison', 'Layout Testing', 'Responsive Testing', 'Accessibility Testing']
    },
    {
      id: 'smoke-testing',
      title: 'Smoke Testing Agent',
      description: 'Quick validation of application stability and readiness for regression testing.',
      icon: '🔥',
      path: '/smoke-testing',
      color: 'red',
      features: [
        'Critical File Check',
        'Syntax Validation',
        'UI Validation',
        'Error Handling Verification',
        'Build Readiness Check'
      ]
    }
  ]

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
      purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
      red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="card text-center">
          <div className="text-3xl mb-2">🧪</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Unit Tests</h3>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">1,247</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Generated</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Test Cases</h3>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">892</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Created</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">🔄</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">E2E Tests</h3>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">156</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Executed</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">👁️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Visual Tests</h3>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">324</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Validated</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">🔥</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Smoke Tests</h3>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">47</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Executed</p>
        </div>
      </div>

      {/* Testing Agents Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div
          className="card hover:shadow-lg transition-all duration-300 hover:scale-105 group"
        >
          <button
            onClick={() => navigate('/projects/new')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/20"
          >
            <i className="fas fa-plus"></i>
            New Project
          </button>
        </div>

        {/* Project Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Project Configuration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="fab fa-github text-indigo-600 dark:text-indigo-400 text-xl"></i>
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Repository</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 break-words">{project.repository}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="fas fa-file-alt text-indigo-600 dark:text-indigo-400 text-xl"></i>
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">FRD Document</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 break-words">{project.frdDocument}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="fas fa-book text-indigo-600 dark:text-indigo-400 text-xl"></i>
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">User Stories</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 break-words">{project.userStories}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="fas fa-cube text-indigo-600 dark:text-indigo-400 text-xl"></i>
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Postman Collection</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 break-words">{project.postmanCollection}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testing Agents Section */}
        {!isRunning && !showReport && (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Testing Agents</h2>
              <button
                onClick={selectAllAgents}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
              >
                <i className="fas fa-check-square"></i>
                Select All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {agents.map(agent => (
                <div
                  key={agent.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                    selectedAgents.includes(agent.id) ? 'ring-4 ring-emerald-500' : ''
                  }`}
                >
                  <div className={`bg-gradient-to-r ${agent.gradient} text-white p-6`}>
                    <i className={`fas ${agent.icon} text-4xl mb-3 block`}></i>
                    <h3 className="text-xl font-bold">{agent.name}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-6 min-h-[80px]">{agent.description}</p>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                        <i className="fas fa-circle text-xs"></i>
                        Ready
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleAgent(agent.id)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                            selectedAgents.includes(agent.id)
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {selectedAgents.includes(agent.id) ? 'Selected' : 'Select'}
                        </button>
                        <button
                          onClick={() => exploreAgent(agent.id)}
                          className="px-4 py-2 rounded-lg font-semibold transition-all text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          Explore
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Test Configuration */}
            {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configure Your Test</h3> */}
              
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div
                  onClick={() => handleTestModeChange('individual')}
                  className={`p-6 rounded-xl border-2 text-center cursor-pointer transition-all ${
                    testMode === 'individual'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
                  }`}
                >
                  <i className="fas fa-user text-5xl text-indigo-600 dark:text-indigo-400 mb-4"></i>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Individual Agents</h4>
                  <p className="text-gray-600 dark:text-gray-300">Select specific agents to run</p>
                </div>
                <div
                  onClick={() => handleTestModeChange('comprehensive')}
                  className={`p-6 rounded-xl border-2 text-center cursor-pointer transition-all ${
                    testMode === 'comprehensive'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
                  }`}
                >
                  <i className="fas fa-project-diagram text-5xl text-indigo-600 dark:text-indigo-400 mb-4"></i>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Comprehensive Testing</h4>
                  <p className="text-gray-600 dark:text-gray-300">Run all 9 agents for complete coverage</p>
                </div>
              </div> */}

              {/* Selected Agents */}
              {/* <div className="mb-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Selected Agents</h4>
                {selectedAgents.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No agents selected</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {selectedAgents.map(agentId => {
                      const agent = agents.find(a => a.id === agentId)
                      return (
                        <div
                          key={agentId}
                          className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {agent.name}
                          <i
                            onClick={() => removeAgent(agentId)}
                            className="fas fa-times text-rose-500 cursor-pointer hover:text-rose-700"
                          ></i>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div> */}

              {/* <button
                onClick={executeTests}
                disabled={selectedAgents.length === 0}
                className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <i className="fas fa-play-circle text-2xl"></i>
                Execute Test Suite
              </button> */}
            {/* </div> */}
          </>
        )}
        {/* Progress Section */}
        {/* {isRunning && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Test Execution Progress</h3>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{Math.round(progress)}%</span>
            </div>
            
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-8">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="space-y-4">
              {selectedAgents.map(agentId => {
                const agent = agents.find(a => a.id === agentId)
                const status = agentStatuses[agentId]
                
                return (
                  <div
                    key={agentId}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      status === 'completed' 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    {status === 'completed' ? (
                      <i className="fas fa-check-circle text-2xl text-emerald-500"></i>
                    ) : (
                      <i className="fas fa-spinner fa-spin text-2xl text-indigo-600 dark:text-indigo-400"></i>
                    )}
                    <div className="flex-1">
                      <p className={`font-bold ${
                        status === 'completed' 
                          ? 'text-emerald-700 dark:text-emerald-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {status === 'completed' ? `${agent.name} completed` : `Running ${agent.name}...`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )} */}

        {/* Report Section
        {showReport && testResults && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700 flex-wrap gap-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Test Report - {projectData.name}
              </h3>
              <button
                onClick={exportReport}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
              >
                <i className="fas fa-download"></i>
                Export Report
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 text-center border-l-4 border-emerald-500">
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Passed Tests</div>
                <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{testResults.passed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round((testResults.passed / testResults.total) * 100)}% of total tests
                </div>
              </div>
              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-6 text-center border-l-4 border-rose-500">
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Failed Tests</div>
                <div className="text-4xl font-bold text-rose-600 dark:text-rose-400 mb-2">{testResults.failed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round((testResults.failed / testResults.total) * 100)}% of total tests
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 text-center border-l-4 border-amber-500">
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Skipped Tests</div>
                <div className="text-4xl font-bold text-amber-600 dark:text-amber-400 mb-2">{testResults.skipped}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round((testResults.skipped / testResults.total) * 100)}% of total tests
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Test Results Details</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border-l-4 border-emerald-500 flex-wrap gap-3">
                  <div className="font-medium text-gray-900 dark:text-white">Security Testing - SQL Injection Check</div>
                  <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                    PASSED
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border-l-4 border-emerald-500 flex-wrap gap-3">
                  <div className="font-medium text-gray-900 dark:text-white">Unit Testing - User Authentication Module</div>
                  <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                    PASSED
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border-l-4 border-rose-500 flex-wrap gap-3">
                  <div className="font-medium text-gray-900 dark:text-white">Performance Testing - Load Test (1000 users)</div>
                  <span className="bg-rose-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                    FAILED
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border-l-4 border-emerald-500 flex-wrap gap-3">
                  <div className="font-medium text-gray-900 dark:text-white">UI Testing - Responsive Layout Check</div>
                  <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                    PASSED
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border-l-4 border-rose-500 flex-wrap gap-3">
                  <div className="font-medium text-gray-900 dark:text-white">Integration Testing - Payment Gateway</div>
                  <span className="bg-rose-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                    FAILED
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowReport(false)
                setSelectedAgents([])
                setAgentStatuses({})
                setProgress(0)
              }}
              className="mt-8 w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Dashboard
            </button>
          </div>
        )} */}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Recent Activity
        </h2>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">Unit tests completed for UserService</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">2 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">New test cases generated for Payment module</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">15 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">Visual regression test completed</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">1 hour ago</p>
            </div>
          </div>

          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">Smoke tests executed for new build</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">10 minutes ago</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard
