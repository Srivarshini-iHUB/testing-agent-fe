import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('all');

  const agents = [
    {
      id: 'test-case-generator',
      name: 'Test Case Generation',
      icon: 'fa-file-alt',
      iconColor: 'text-indigo-700 dark:text-indigo-300',
      iconBg: 'bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-indigo-700 dark:to-purple-700',
      description: 'Automatically generates comprehensive test cases based on your code structure and requirements.',
      category: 'generation'
    },
    {
      id: 'unit-testing',
      name: 'Unit Testing',
      icon: 'fa-vial',
      iconColor: 'text-blue-700 dark:text-blue-300',
      iconBg: 'bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-blue-700 dark:to-cyan-700',
      description: 'Executes unit tests to validate individual components and functions of your application.',
      category: 'testing'
    },
    {
      id: 'integration-testing',
      name: 'Integration Testing',
      icon: 'fa-link',
      iconColor: 'text-teal-700 dark:text-teal-300',
      iconBg: 'bg-gradient-to-br from-teal-200 to-emerald-200 dark:from-teal-700 dark:to-emerald-700',
      description: 'Verifies the interaction between different modules and systems in your application.',
      category: 'testing'
    },
    {
      id: 'e2e-testing',
      name: 'Functional Testing',
      icon: 'fa-route',
      iconColor: 'text-purple-700 dark:text-purple-300',
      iconBg: 'bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-700 dark:to-pink-700',
      description: 'Simulates real user scenarios to validate the entire application workflow from start to finish.',
      category: 'testing'
    },
    {
      id: 'security-testing',
      name: 'Security Testing',
      icon: 'fa-shield-alt',
      iconColor: 'text-red-700 dark:text-red-300',
      iconBg: 'bg-gradient-to-br from-red-200 to-rose-200 dark:from-red-700 dark:to-rose-700',
      description: 'Identifies vulnerabilities and security risks in your application code and infrastructure.',
      category: 'security'
    },
    {
      id: 'smoke-testing',
      name: 'Smoke Testing',
      icon: 'fa-fire',
      iconColor: 'text-orange-700 dark:text-orange-300',
      iconBg: 'bg-gradient-to-br from-orange-200 to-amber-200 dark:from-orange-700 dark:to-amber-700',
      description: 'Performs basic functionality checks to ensure critical features are working after deployment.',
      category: 'testing'
    },
    {
      id: 'visual-testing',
      name: 'UI Testing',
      icon: 'fa-mouse-pointer',
      iconColor: 'text-violet-700 dark:text-violet-300',
      iconBg: 'bg-gradient-to-br from-violet-200 to-fuchsia-200 dark:from-violet-700 dark:to-fuchsia-700',
      description: 'Validates user interface elements, layouts, and visual consistency across different devices.',
      category: 'testing'
    },
    {
      id: 'performance-testing',
      name: 'Performance Testing',
      icon: 'fa-tachometer-alt',
      iconColor: 'text-emerald-700 dark:text-emerald-300',
      iconBg: 'bg-gradient-to-br from-emerald-200 to-green-200 dark:from-emerald-700 dark:to-green-700',
      description: 'Evaluates system responsiveness, stability, and scalability under various load conditions.',
      category: 'performance'
    },
    {
      id: 'regression-testing',
      name: 'Regression Testing',
      icon: 'fa-undo',
      iconColor: 'text-slate-700 dark:text-slate-300',
      iconBg: 'bg-gradient-to-br from-slate-200 to-gray-200 dark:from-slate-700 dark:to-gray-700',
      description: 'Ensures new code changes don\'t adversely affect existing functionality of your application.',
      category: 'testing'
    }
  ];

  const features = [
    {
      icon: 'fa-robot',
      title: 'AI-Powered Testing',
      description: 'Leverage advanced AI algorithms to automatically generate and execute comprehensive test suites.',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30'
    },
    {
      icon: 'fa-bolt',
      title: 'Fast & Efficient',
      description: 'Run multiple testing agents simultaneously with optimized performance and quick results.',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
    },
    {
      icon: 'fa-chart-line',
      title: 'Detailed Analytics',
      description: 'Get comprehensive reports with actionable insights and visual representations of test results.',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    {
      icon: 'fa-shield-alt',
      title: 'Security First',
      description: 'Built-in security testing ensures your applications are protected against vulnerabilities.',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30'
    },
    {
      icon: 'fa-code-branch',
      title: 'CI/CD Integration',
      description: 'Seamlessly integrate with your existing CI/CD pipelines for automated testing workflows.',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      icon: 'fa-users',
      title: 'Team Collaboration',
      description: 'Share test results, collaborate on test strategies, and maintain quality across teams.',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    }
  ];

  const workflowSteps = [
    {
      number: '01',
      title: 'Configure Project',
      description: 'Set up your project by providing repository details, documentation, and test requirements.',
      icon: 'fa-cog'
    },
    {
      number: '02',
      title: 'Select Agents',
      description: 'Choose from our suite of specialized testing agents based on your testing needs.',
      icon: 'fa-hand-pointer'
    },
    {
      number: '03',
      title: 'Run Tests',
      description: 'Execute tests individually or run comprehensive testing across all selected agents.',
      icon: 'fa-play'
    },
    {
      number: '04',
      title: 'Analyze Results',
      description: 'Review detailed reports, identify issues, and export results for team collaboration.',
      icon: 'fa-chart-pie'
    }
  ];

  const stats = [
    { value: '24/7', label: 'Use Testing Agents', icon: 'fa-robot' },
    { value: '500+', label: 'Create Projects', icon: 'fa-folder-open' },
    { value: '10,000+', label: 'Perform Testing', icon: 'fa-check-circle' },
    { value: '99.9%', label: 'Generate Reports', icon: 'fa-file' },
  ];

  const filteredAgents = activeTab === 'all' 
    ? agents 
    : agents.filter(agent => agent.category === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-900 transition-colors duration-300">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-flask text-white text-lg"></i>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Testing Agents</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                Features
              </a>
              <a href="#agents" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                Agents
              </a>
              <a href="#workflow" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                How It Works
              </a>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>
              <button
                onClick={() => navigate('/onboarding')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-md"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <i className="fas fa-star"></i>
              AI-Powered Quality Assurance Platform
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Automate Your Testing
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                With Intelligent Agents
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              Revolutionize your QA process with AI-powered testing agents that automatically generate, execute, and analyze comprehensive test suites for your applications.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={() => navigate('/onboarding')}
                className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-indigo-500/50 transition-all transform hover:scale-105 flex items-center gap-2"
              >
                Start Testing
                <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </button>
              <button
                onClick={() => document.getElementById('agents').scrollIntoView({ behavior: 'smooth' })}
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 flex items-center gap-2"
              >
                <i className="fas fa-play-circle"></i>
                Explore Agents
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <i className={`fas ${stat.icon} text-3xl text-indigo-600 dark:text-indigo-400 mb-3`}></i>
                  {/* <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div> */}
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200 dark:bg-indigo-900 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl opacity-20"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Modern Testing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to ensure your applications meet the highest quality standards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all hover:shadow-xl group"
              >
                <div className={`${feature.bgColor} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <i className={`fas ${feature.icon} text-2xl ${feature.color}`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents Section - Minimalistic */}
        <section id="agents" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Our Testing Agents
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
                Specialized AI agents designed to handle every aspect of your testing needs
            </p>

            {/* Category Filters - Compact */}
            <div className="flex flex-wrap justify-center gap-2">
                {[
                { id: 'all', label: 'All', icon: 'fa-th' },
                { id: 'generation', label: 'Generation', icon: 'fa-magic' },
                { id: 'testing', label: 'Testing', icon: 'fa-vial' },
                { id: 'security', label: 'Security', icon: 'fa-shield-alt' },
                { id: 'performance', label: 'Performance', icon: 'fa-tachometer-alt' }
                ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    }`}
                >
                    <i className={`fas ${tab.icon} text-xs`}></i>
                    {tab.label}
                </button>
                ))}
            </div>
            </div>

            {/* Compact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent, index) => (
                <div
                key={agent.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg transition-all duration-200 group"
                >
                <div className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                    <div className={`${agent.iconBg} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                        <i className={`fas ${agent.icon} ${agent.iconColor} text-xl`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 leading-tight">
                        {agent.name}
                        </h3>
                        <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                        <i className="fas fa-circle text-[6px] mr-1.5"></i>
                        Ready
                        </div>
                    </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                    {agent.description}
                    </p>
                </div>
                </div>
            ))}
            </div>
        </div>
        </section>

      {/* Workflow Section - Professional Timeline */}
        <section id="workflow" className="py-20 bg-white dark:bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Get started with automated testing in four simple steps
            </p>
            </div>

            {/* Timeline Container */}
            <div className="relative">
            {/* Connection Line - Desktop Only */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800"></div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                {workflowSteps.map((step, index) => (
                <div key={index} className="relative flex flex-col items-center">
                    {/* Step Number Circle */}
                    {/* <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform"> */}
                    {/* <span className="text-2xl font-bold text-white">{index + 1}</span> */}
                    {/* </div> */}

                    {/* Arrow Connector - Desktop Only */}
                    {index < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-1/2 w-full">
                        <div className="flex items-center justify-end pr-6">
                        <i className="fas fa-arrow-right text-2xl text-indigo-300 dark:text-indigo-700"></i>
                        </div>
                    </div>
                    )}

                    {/* Content Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xl transition-all w-full h-full flex flex-col group">
                    {/* Icon */}
                    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <i className={`fas ${step.icon} text-2xl text-indigo-600 dark:text-indigo-400`}></i>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                        {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-grow">
                        {step.description}
                    </p>

                    {/* Step Indicator */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                        Step {index + 1}
                        </span>
                    </div>
                    </div>

                    {/* Mobile Arrow - Between Cards */}
                    {index < workflowSteps.length - 1 && (
                    <div className="lg:hidden flex justify-center my-4">
                        <i className="fas fa-arrow-down text-3xl text-indigo-300 dark:text-indigo-700"></i>
                    </div>
                    )}
                </div>
                ))}
            </div>
            </div>
        </div>
        </section>


      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Revolutionize Your Testing?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who trust Testing Agents for their quality assurance needs
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/onboarding')}
                className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2"
              >
                Start Testing Now
                <i className="fas fa-rocket"></i>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg border-2 border-white/20 hover:bg-white/20 transition-all flex items-center gap-2"
              >
                View Dashboard
                <i className="fas fa-chart-line"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="fas fa-flask text-white"></i>
                </div>
                <span className="text-xl font-bold">Testing Agents</span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Empowering developers with AI-driven quality assurance. Automate your testing workflow and ship with confidence.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#agents" className="hover:text-white transition-colors">Agents</a></li>
                <li><a href="#workflow" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Connect</h3>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-colors">
                  <i className="fab fa-github"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-colors">
                  <i className="fab fa-linkedin"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 Testing Agents Platform. All rights reserved. Built with ❤️ for developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
