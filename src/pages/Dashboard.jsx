import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useUser } from "../contexts/UserContext";
import EditProjectModal from "../components/EditProjectModal";
import AgentHistory from "../components/AgentHistory";
import { projectApi } from "../api/projectApi";

const Dashboard = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, project, updateProject } = useUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("history");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Projects from API
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true); // Start as true to indicate initial loading
  const [projectsError, setProjectsError] = useState("");

  // Check if user is new (no projects) - only after loading is complete
  const isFirstTimeUser = !projectsLoading && projects.length === 0;

  // Current project from state or first from API
  const [currentProject, setCurrentProject] = useState(null);

  // Load projects for the user
  useEffect(() => {
    const load = async () => {
      if (!user) {
        setProjectsLoading(false);
        return;
      }
      const userId = user.user_id;
      if (!userId) {
        setProjectsLoading(false);
        return;
      }
      setProjectsLoading(true);
      setProjectsError("");
      try {
        const list = await projectApi.getProjects({ userId });
        setProjects(list);
        const preferred = list.find((p) => p.name === project?.name) || list[0] || null;
        if (preferred) {
          setCurrentProject(preferred);
          updateProject({
            id: preferred.id,
            name: preferred.name,
            repository: preferred.repository,
            frdDocument: preferred.frdDocument,
            userStories: preferred.userStories,
            postmanCollection: preferred.postmanCollection,
          });
        }
      } catch (e) {
        setProjectsError(e?.message || "Failed to load projects");
      } finally {
        setProjectsLoading(false);
      }
    };
    load();
  }, [user]);

  // Agents data
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProjectDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProjectSwitch = (proj) => {
    setCurrentProject(proj);
    updateProject({
      id: proj.id,
      name: proj.name,
      repository: proj.repository,
      frdDocument: proj.frdDocument,
      userStories: proj.userStories,
      postmanCollection: proj.postmanCollection,
    });
    setShowProjectDropdown(false);
    
    
  };

  const handleNewProject = () => {
    navigate("/NewProjectPopup");
  };

  const handleSaveProject = (updatedData) => {
    setCurrentProject(currentProject ? { ...currentProject, ...updatedData } : updatedData);
    updateProject(updatedData);
    alert("Project configuration updated successfully!");
    setShowEditModal(false);
  };

  const exploreAgent = (agentId) => {
    const agent = agents.find((a) => a.id === agentId);
    if (agent && agent.path) {
      navigate(agent.path);
    }
  };

  // Extract filename from URL
  const getFileNameFromUrl = (url) => {
    if (!url) return '';
    
    try {
      // Try to decode the URL, but if it fails (already decoded), use the original
      let decodedUrl = url;
      try {
        decodedUrl = decodeURIComponent(url);
      } catch (e) {
        // URL might already be decoded, use original
        decodedUrl = url;
      }
      
      // Split by '/' and find the last segment that contains a file extension
      const segments = decodedUrl.split('/');
      
      // Start from the end and find the first segment with a file extension
      for (let i = segments.length - 1; i >= 0; i--) {
        const segment = segments[i];
        // Check if segment contains a file extension (has a dot and at least one char after)
        if (segment.includes('.') && segment.split('.').pop().length > 0 && segment.split('.').pop().length < 10) {
          // Remove query parameters if any
          const cleanFileName = segment.split('?')[0];
          // Remove hash if any
          const finalFileName = cleanFileName.split('#')[0];
          return finalFileName;
        }
      }
      
      // Fallback: return last segment if no extension found
      const lastSegment = segments[segments.length - 1].split('?')[0].split('#')[0];
      return lastSegment || url.split('/').pop() || url;
    } catch (e) {
      // Fallback: return last part of URL
      const segments = url.split('/');
      return segments[segments.length - 1].split('?')[0] || url;
    }
  };

  // Show loading screen while projects are being fetched
  if (projectsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading your projects...</p>
        </div>
      </div>
    );
  }

  // First-Time User Welcome Screen
  if (projectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (isFirstTimeUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-8">
          
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Testing Agents, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Let's set up your first project and start automated testing with AI-powered agents
            </p>
          </div>

          {/* Getting Started Card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-rocket text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Get Started in 4 Easy Steps</h2>
                    <p className="text-indigo-100 text-sm">Create your first project and unlock powerful testing</p>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="p-8">
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                  {[
                    { icon: 'fab fa-github', title: 'Connect GitHub', description: 'Link your repository', color: 'indigo' },
                    { icon: 'fas fa-cog', title: 'Project Details', description: 'Configure project info', color: 'purple' },
                    { icon: 'fas fa-file-upload', title: 'Upload Docs', description: 'Add FRD & User Stories', color: 'pink' },
                    { icon: 'fas fa-robot', title: 'Run Agents', description: 'Start automated testing', color: 'blue' }
                  ].map((step, index) => (
                    <div key={index} className="text-center">
                      <div className={`w-14 h-14 bg-${step.color}-100 dark:bg-${step.color}-900/30 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                        <i className={`${step.icon} text-${step.color}-600 dark:text-${step.color}-400 text-xl`}></i>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">{step.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{step.description}</p>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="text-center">
                  <button
                    onClick={handleNewProject}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <i className="fas fa-plus-circle text-xl"></i>
                    Create Your First Project
                    <i className="fas fa-arrow-right"></i>
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                    Takes only 2 minutes to set up
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="bg-gray-900 text-white text-center py-8 mt-16">
          <p>Testing Agents Platform © 2025 | Empowering testers with AI</p>
        </footer>
      </div>
    );
  }

  // Regular Dashboard (for users with projects)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-16 py-8">
        
        {/* Dashboard Header with Enhanced Project Display */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-6">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Welcome back, {user?.name?.split(" ")[0]}!
            </h2>
            
            {/* Enhanced Project Info Card */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 inline-block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-folder-open text-white text-lg"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {currentProject?.name || project?.name}
                    </h3>
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <i className="fas fa-calendar-alt"></i>
                    Last updated: {currentProject?.updatedAt ? new Date(currentProject.updatedAt).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {/* Project Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-5 py-3 rounded-xl font-semibold hover:border-indigo-500 transition-all shadow-md hover:shadow-lg flex items-center gap-3 min-w-[220px] group"
              >
                <div className="flex items-center gap-2 flex-1">
                  <i className="fas fa-layer-group text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform"></i>
                  <span className="text-sm font-medium">Switch Project</span>
                </div>
                <i className={`fas fa-chevron-down text-sm transition-all duration-300 ${showProjectDropdown ? 'rotate-180 text-indigo-600' : 'text-gray-400'}`}></i>
              </button>

              {showProjectDropdown && (
                <div className="absolute top-full mt-3 right-0 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Your Projects</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{projects.length} total</p>
                      </div>
                      <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <i className="fas fa-folder text-white"></i>
                      </div>
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {projects.map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => handleProjectSwitch(proj)}
                        className={`w-full text-left px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all border-l-4 ${
                          currentProject?.id === proj.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                currentProject?.id === proj.id ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                              }`}>
                                <i className={`fas fa-folder text-sm ${
                                  currentProject?.id === proj.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                                }`}></i>
                              </div>
                              <p className={`font-semibold truncate ${
                                currentProject?.id === proj.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
                              }`}>
                                {proj?.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <i className="fas fa-calendar-alt"></i>
                                {proj?.updatedAt ? new Date(proj.updatedAt).toLocaleDateString() : ''}
                              </span>
                            </div>
                          </div>
                          {currentProject?.id === proj.id && (
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                <i className="fas fa-check text-white text-xs"></i>
                              </div>
                              <span className="text-xs font-semibold text-green-600">Active</span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <button
                      onClick={() => {
                        setShowProjectDropdown(false);
                        handleNewProject();
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2 shadow-md"
                    >
                      <i className="fas fa-plus-circle"></i>
                      Create New Project
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* New Project Button */}
            <button
              onClick={handleNewProject}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              New Project
            </button>
          </div>
        </div>

        {/* Project Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <i className="fas fa-cog text-indigo-600 dark:text-indigo-400"></i>
              Current Project Configuration
            </h3>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all text-sm shadow-md"
            >
              <i className="fas fa-edit"></i>
              Edit Project
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'fab fa-github', label: 'Repository', value: currentProject?.repository || project?.repository, isUrl: true, isRepo: true },
              { icon: 'fas fa-file-alt', label: 'FRD Document', value: currentProject?.frdDocument || project?.frdDocument, isUrl: true, isRepo: false },
              { icon: 'fas fa-book', label: 'User Stories', value: currentProject?.userStories || project?.userStories, isUrl: true, isRepo: false },
              { icon: 'fas fa-cube', label: 'Postman/Swagger', value: currentProject?.postmanCollection || project?.postmanCollection, isUrl: true, isRepo: false }
            ].map((item, idx) => {
              // For repository, format the display value and URL
              const getRepositoryInfo = (repoValue) => {
                if (!repoValue) return { display: '', url: null };
                
                // If it already starts with http:// or https://
                if (repoValue.startsWith('http://') || repoValue.startsWith('https://')) {
                  // Extract a cleaner display name (e.g., "user/repo" from "https://github.com/user/repo")
                  const githubMatch = repoValue.match(/github\.com\/([^\/]+\/[^\/\s?#]+)/);
                  const display = githubMatch ? githubMatch[1] : repoValue.replace(/^https?:\/\//, '').replace(/^www\./, '');
                  return { display, url: repoValue };
                }
                
                // If it looks like a GitHub repo path (e.g., "user/repo" or "github.com/user/repo")
                if (repoValue.includes('/') && !repoValue.includes(' ')) {
                  // Remove "github.com/" if present
                  const cleanPath = repoValue.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/^github\.com\//, '');
                  return { display: cleanPath, url: `https://github.com/${cleanPath}` };
                }
                
                return { display: repoValue, url: null };
              };

              // For documents, extract filename. For repository, format it
              const getDisplayAndUrl = () => {
                if (!item.value) return { display: '', url: null };
                
                if (item.isRepo) {
                  return getRepositoryInfo(item.value);
                }
                
                if (item.isUrl) {
                  return { display: getFileNameFromUrl(item.value), url: item.value };
                }
                
                return { display: item.value, url: null };
              };

              const { display: displayValue, url: linkUrl } = getDisplayAndUrl();

              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className={`${item.icon} text-indigo-600 dark:text-indigo-400 text-xl`}></i>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{item.label}</h4>
                    {linkUrl ? (
                      <a
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 break-words hover:underline flex items-center gap-1"
                      >
                        <i className="fas fa-external-link-alt text-xs"></i>
                        {displayValue || (item.isRepo ? 'View Repository' : 'View Document')}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-300 break-words">{displayValue || 'Not set'}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-md overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-semibold text-sm transition-all ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              AGENT HISTORY
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`px-6 py-3 font-semibold text-sm transition-all ${
                activeTab === 'agents'
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              TESTING AGENTS
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'agents' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Testing Agents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agents.map(agent => (
                    <div
                      key={agent.id}
                      className={`${agent.bgColor} ${agent.borderColor} border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}
                    >
                      <div className="h-full flex flex-col">
                        <div className={`${agent.titleBg} p-6 rounded-t-2xl`}>
                          <div className="flex items-start gap-4">
                            <div className={`${agent.iconBg} ${agent.iconColor} w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                              <i className={`fas ${agent.icon} text-xl`}></i>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{agent.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                                <i className="fas fa-circle text-xs"></i>
                                {agent.status}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6 flex-1 flex flex-col">
                          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed flex-1">{agent.description}</p>
                          <button
                            onClick={() => exploreAgent(agent.id)}
                            className={`w-full ${agent.iconBg} ${agent.iconColor} py-2.5 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-md group-hover:scale-105 border ${agent.borderColor}`}
                          >
                            <i className="fas fa-arrow-right mr-2 group-hover:translate-x-1 transition-transform"></i>
                            Explore Agent
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && <AgentHistory key={currentProject?.id} currentProject={currentProject} />}
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white text-center py-8 mt-12">
        <p>Testing Agents Platform © 2025 | Empowering testers with AI</p>
      </footer>

      <EditProjectModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProject}
      />
    </div>
  );
};

export default Dashboard;