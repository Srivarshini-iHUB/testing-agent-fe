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
    bgColor: 'bg-white dark:bg-gray-800',
    iconColor: 'text-indigo-700 dark:text-indigo-300',
    iconBg: 'bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-indigo-700 dark:to-purple-700',
    borderColor: 'border-gray-200 dark:border-gray-700',
    accentColor: 'text-indigo-700 dark:text-indigo-300',
    titleBg: 'bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30',
    description: 'Automatically generates comprehensive test cases based on your code structure and requirements.',
    path: '/test-case-generator',
    status: 'Ready'
  },
  {
    id: 'unit-testing',
    name: 'Unit Testing',
    icon: 'fa-vial',
    bgColor: 'bg-white dark:bg-gray-800',
    iconColor: 'text-blue-700 dark:text-blue-300',
    iconBg: 'bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-blue-700 dark:to-cyan-700',
    borderColor: 'border-gray-200 dark:border-gray-700',
    accentColor: 'text-blue-700 dark:text-blue-300',
    titleBg: 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30',
    description: 'Executes unit tests to validate individual components and functions of your application.',
    path: '/unit-testing',
    status: 'Ready'
  },
  {
    id: 'integration-testing',
    name: 'Integration Testing',
    icon: 'fa-link',
    bgColor: 'bg-white dark:bg-gray-800',
    iconColor: 'text-teal-700 dark:text-teal-300',
    iconBg: 'bg-gradient-to-br from-teal-200 to-emerald-200 dark:from-teal-700 dark:to-emerald-700',
    borderColor: 'border-gray-200 dark:border-gray-700',
    accentColor: 'text-teal-700 dark:text-teal-300',
    titleBg: 'bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30',
    description: 'Verifies the interaction between different modules and systems in your application.',
    path: '/integration-testing',
    status: 'Coming Soon'
  },
  {
    id: 'e2e-testing',
    name: 'Functional Testing',
    icon: 'fa-route',
    bgColor: 'bg-white dark:bg-gray-800',
    iconColor: 'text-purple-700 dark:text-purple-300',
    iconBg: 'bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-700 dark:to-pink-700',
    borderColor: 'border-gray-200 dark:border-gray-700',
    accentColor: 'text-purple-700 dark:text-purple-300',
    titleBg: 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30',
    description: 'Simulates real user scenarios to validate the entire application workflow from start to finish.',
    path: '/e2e-testing',
    status: 'Ready'
  },
  {
    id: 'security-testing',
    name: 'Security Testing',
    icon: 'fa-shield-alt',
    bgColor: 'bg-white dark:bg-gray-800',
    iconColor: 'text-red-700 dark:text-red-300',
    iconBg: 'bg-gradient-to-br from-red-200 to-rose-200 dark:from-red-700 dark:to-rose-700',
    borderColor: 'border-gray-200 dark:border-gray-700',
    accentColor: 'text-red-700 dark:text-red-300',
    titleBg: 'bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30',
    description: 'Identifies vulnerabilities and security risks in your application code and infrastructure.',
    path: '/security-testing',
    status: 'Ready'
  },
  {
    id: 'smoke-testing',
    name: 'Smoke Testing',
    icon: 'fa-fire',
    bgColor: 'bg-white dark:bg-gray-800',
    iconColor: 'text-orange-700 dark:text-orange-300',
    iconBg: 'bg-gradient-to-br from-orange-200 to-amber-200 dark:from-orange-700 dark:to-amber-700',
    borderColor: 'border-gray-200 dark:border-gray-700',
    accentColor: 'text-orange-700 dark:text-orange-300',
    titleBg: 'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30',
    description: 'Performs basic functionality checks to ensure critical features are working after deployment.',
    path: '/smoke-testing',
    status: 'Ready'
  },
  {
    id: 'visual-testing',
    name: 'UI Testing',
    icon: 'fa-mouse-pointer',
    bgColor: 'bg-white dark:bg-gray-800',
    iconColor: 'text-violet-700 dark:text-violet-300',
    iconBg: 'bg-gradient-to-br from-violet-200 to-fuchsia-200 dark:from-violet-700 dark:to-fuchsia-700',
    borderColor: 'border-gray-200 dark:border-gray-700',
    accentColor: 'text-violet-700 dark:text-violet-300',
    titleBg: 'bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30',
    description: 'Validates user interface elements, layouts, and visual consistency across different devices.',
    path: '/visual-testing',
    status: 'Ready'
  },
  {
    id: 'performance-testing',
    name: 'Performance Testing',
    icon: 'fa-tachometer-alt',
    bgColor: 'bg-white dark:bg-gray-800',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    iconBg: 'bg-gradient-to-br from-emerald-200 to-green-200 dark:from-emerald-700 dark:to-green-700',
    borderColor: 'border-gray-200 dark:border-gray-700',
    accentColor: 'text-emerald-700 dark:text-emerald-300',
    titleBg: 'bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30',
    description: 'Evaluates system responsiveness, stability, and scalability under various load conditions.',
    path: '/performance-testing',
    status: 'Ready'
  },
  {
    id: 'regression-testing',
    name: 'Regression Testing',
    icon: 'fa-undo',
    bgColor: 'bg-white dark:bg-gray-800',
    iconColor: 'text-slate-700 dark:text-slate-300',
    iconBg: 'bg-gradient-to-br from-slate-200 to-gray-200 dark:from-slate-700 dark:to-gray-700',
    borderColor: 'border-gray-200 dark:border-gray-700',
    accentColor: 'text-slate-700 dark:text-slate-300',
    titleBg: 'bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-900/30 dark:to-gray-900/30',
    description: 'Ensures new code changes don\'t adversely affect existing functionality of your application.',
    path: '/regression-testing',
    status: 'Ready'
  }
];


  const toggleAgent = (agentId) => {
    if (isRunning) return
    
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    )
  }

  const selectAllAgents = () => {
    if (isRunning) return
    setSelectedAgents(agents.map(a => a.id))
  }

  const removeAgent = (agentId) => {
    setSelectedAgents(prev => prev.filter(id => id !== agentId))
  }

  const handleTestModeChange = (mode) => {
    if (isRunning) return
    setTestMode(mode)
    if (mode === 'comprehensive') {
      selectAllAgents()
    }
  }

  const executeTests = () => {
    if (selectedAgents.length === 0) {
      alert('Please select at least one agent to run')
      return
    }

    setIsRunning(true)
    setShowReport(false)
    setProgress(0)
    
    const initialStatuses = {}
    selectedAgents.forEach(id => {
      initialStatuses[id] = 'running'
    })
    setAgentStatuses(initialStatuses)

    let completed = 0
    const totalAgents = selectedAgents.length

    selectedAgents.forEach((agentId, index) => {
      setTimeout(() => {
        setAgentStatuses(prev => ({
          ...prev,
          [agentId]: 'completed'
        }))
        
        completed++
        setProgress((completed / totalAgents) * 100)
        
        if (completed === totalAgents) {
          setTimeout(() => {
            finishTesting()
          }, 1000)
        }
      }, (index + 1) * 2500)
    })
  }

  const finishTesting = () => {
    setIsRunning(false)
    setShowReport(true)
    setTestResults({
      passed: 142,
      failed: 18,
      skipped: 7,
      total: 167,
      duration: '4m 23s'
    })
  }

  const handleNewProject = () => {
    if (window.confirm('Are you sure you want to start a new project? Your current configuration will be reset.')) {
      navigate('/onboarding')
    }
  }

  const exportReport = () => {
    alert('Exporting report... (Feature coming soon)')
  }

  const exploreAgent = (agentId) => {
    const agent = agents.find(a => a.id === agentId)
    if (agent && agent.path) {
      navigate(agent.path)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-16 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user.name.split(' ')[0]}!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Continue your testing journey for {project.name}
            </p>
          </div>
          <button
            onClick={handleNewProject}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2 w-fit"
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
              {/* <button
                onClick={selectAllAgents}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
              >
                <i className="fas fa-check-square"></i>
                Select All
              </button> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {agents.map(agent => (
                <div
                  key={agent.id}
                  className={`${agent.bgColor} ${agent.borderColor} border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group ${
                    selectedAgents.includes(agent.id) ? 'ring-2 ring-indigo-400 dark:ring-indigo-500' : ''
                  }`}
                >
                  <div className="h-full flex flex-col">
                    {/* Colorful Title Section */}
                    <div className={`${agent.titleBg} p-6 rounded-t-2xl`}>
                      <div className="flex items-start gap-4">
                        <div className={`${agent.iconBg} ${agent.iconColor} w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                          <i className={`fas ${agent.icon} text-xl`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:${agent.accentColor} transition-colors`}>
                            {agent.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                            <i className="fas fa-circle text-xs"></i>
                            {agent.status}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Neutral Content Section */}
                    <div className="p-6 flex-1 flex flex-col">
                      <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed flex-1">
                        {agent.description}
                      </p>
                      
                      <div className="mt-auto">
                        <button
                          onClick={() => exploreAgent(agent.id)}
                          className={`w-full ${agent.iconBg} ${agent.iconColor} py-2.5 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-md group-hover:scale-105 border ${agent.borderColor} hover:border-opacity-60`}
                        >
                          <i className="fas fa-arrow-right mr-2 group-hover:translate-x-1 transition-transform"></i>
                          Explore Agent
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-8 mt-12">
        <p>Testing Agents Platform © 2025 | Empowering testers with AI-driven quality assurance</p>
      </footer>
    </div>
  )
}

export default Dashboard
