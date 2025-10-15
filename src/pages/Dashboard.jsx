import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const Dashboard = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const agents = [
    {
      id: "unit-testing",
      title: "Unit Testing Agent",
      description:
        "Automated unit test generation and execution for individual components and functions.",
      icon: "🧪",
      path: "/unit-testing",
      color: "blue",
      features: [
        "Test Generation",
        "Code Coverage",
        "Mock Objects",
      ],
    },
    {
      id: "test-case-generator",
      title: "Test Case Generator",
      description:
        "Intelligent test case creation based on requirements and user stories.",
      icon: "📝",
      path: "/test-case-generator",
      color: "green",
      features: [
        "Requirement Analysis",
        "Scenario Generation",
        "Edge Case Detection",
        "Test Data Creation",
      ],
    },
    {
      id: "e2e-testing",
      title: "End-to-End Testing Agent",
      description:
        "Comprehensive testing of complete user workflows and system integration.",
      icon: "🔄",
      path: "/e2e-testing",
      color: "purple",
      features: [
        "Functional Testing",
        "User Journey Simulation",
        "Chrome-Browser Testing",
      ],
    },
    {
      id: "visual-testing",
      title: "Visual Testing Agent",
      description:
        "Automated UI consistency validation.",
      icon: "👁️",
      path: "/visual-testing",
      color: "gray",
      features: [
        "Screenshot Comparison",
      ],
    },
  ];

  const getColorClasses = (color) => {
 const colorMap = {
  blue: "from-[#77BEF0] to-[#77BEF0]",
  gray: "from-[#F7CAC9] to-[#F7CAC9]",
  green: "from-[#BBD8A3] to-[#BBD8A3]",
  purple: "from-[#A7AAE1] to-[#A7AAE1]",
};




    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-10 p-6">
      {/* Header */}
      <div className="text-center mt-6">
        <h1 className="text-2xl md:text-4xl font-extrabold bg-black bg-clip-text text-transparent mb-4">
          Testing Agents Dashboard
        </h1>
        <p className="text-lg md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Explore our suite of AI-powered testing agents designed to automate
          and enhance your software testing lifecycle. Choose the agent that
          fits your workflow and get started effortlessly.
        </p>
      </div>

      {/* Agents Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="relative group bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/20 dark:border-gray-700/40"
          >
            {/* Top Accent Line */}
            <div
              className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getColorClasses(
                agent.color
              )}`}
            ></div>

            {/* Card Content */}
            <div className="p-6">
              <div className="flex items-start mb-5">
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br ${getColorClasses(
                    agent.color
                  )} text-white shadow-md mr-4`}
                >
                  {agent.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    {agent.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-snug">
                    {agent.description}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-5">
                {agent.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white/30 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200 rounded-full text-sm font-medium backdrop-blur-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => navigate(agent.path)}
                className={`inline-block px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r ${getColorClasses(
                  agent.color
                )} hover:opacity-90 transition-all duration-200`}
              >
                Explore Agent →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-10">
        ⚡ Empowering developers with intelligent testing automation.
      </div>
    </div>
  );
};

export default Dashboard;
