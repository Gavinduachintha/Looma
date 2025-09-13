import React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Calendar,
  Shield,
  Github,
  Heart,
  Globe,
  Zap,
  Users,
  Star,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const About = () => {
  const { isDarkMode } = useTheme();

  const features = [
    {
      icon: Mail,
      title: "Smart Email Management",
      description:
        "AI-powered email organization with automatic categorization and intelligent summaries.",
    },
    {
      icon: Calendar,
      title: "Event Planning",
      description:
        "Seamlessly integrate and manage your calendar events with smart scheduling assistance.",
    },
    {
      icon: Shield,
      title: "Secure Authentication",
      description:
        "OAuth 2.0 integration with Google services for secure and seamless login experience.",
    },
    {
      icon: Zap,
      title: "Modern Interface",
      description:
        "Built with React and modern web technologies for fast and responsive user experience.",
    },
  ];

  const stats = [
    { number: "Open", label: "Source" },
    { number: "2025", label: "Built" },
    { number: "React", label: "Powered" },
    { number: "Free", label: "To Use" },
  ];

  return (
    <div
      className="h-screen p-4 flex items-center justify-center overflow-hidden"
      style={{
        background: isDarkMode ? "#0a0a0a" : "#ffffff",
      }}
    >
      {/* Single Big Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`w-full max-w-7xl mx-auto rounded-3xl overflow-hidden ${
          isDarkMode
            ? "bg-[#171717] border border-[#262626]"
            : "bg-white border border-[#e5e7eb] shadow-2xl"
        }`}
        style={{
          height: "calc(100vh - 2rem)",
          boxShadow: isDarkMode
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.8)"
            : "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Hero Section */}
        <div className="relative h-full flex flex-col p-4 md:p-6 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className={`absolute top-1/4 -right-40 w-80 h-80 rounded-full blur-3xl ${
                isDarkMode ? "bg-emerald-400/5" : "bg-emerald-400/10"
              }`}
            />
            <div
              className={`absolute bottom-1/4 -left-40 w-80 h-80 rounded-full blur-3xl ${
                isDarkMode ? "bg-green-400/5" : "bg-green-400/10"
              }`}
            />
          </div>

          <div className="relative z-10 h-full flex flex-col justify-between min-h-0">
            {/* Header */}
            <div className="text-center flex-shrink-0">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 ${
                  isDarkMode ? "bg-emerald-600" : "bg-emerald-500"
                }`}
              >
                <span className="text-white font-bold text-lg">L</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl md:text-5xl font-bold mb-2"
                style={{
                  background: isDarkMode
                    ? "linear-gradient(135deg, #ffffff 0%, #a1a1a1 100%)"
                    : "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Looma
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`text-base md:text-lg mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Your AI/Productivity Companion
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className={`text-sm max-w-xl mx-auto leading-relaxed ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                A modern productivity application designed for hackathon
                demonstration.
              </motion.p>
            </div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="grid grid-cols-4 gap-3 flex-shrink-0 my-4"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="text-center"
                >
                  <div
                    className={`text-5 md:text-2xl font-bold mb-1 ${
                      isDarkMode ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  >
                    {stat.number}
                  </div>
                  <div
                    className={`text-xs font-medium ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-1 min-h-0"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 + index * 0.1 }}
                  className={`p-3 rounded-lg transition-all duration-300 flex flex-col ${
                    isDarkMode
                      ? "bg-[#1a1a1a] border border-[#333333]"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <feature.icon
                    className={`w-6 h-6 mb-2 flex-shrink-0 ${
                      isDarkMode ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  />
                  <h3
                    className={`text-sm font-semibold mb-1 flex-shrink-0 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={`text-xs leading-tight flex-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Tech Stack */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0 }}
              className={`p-3 rounded-lg flex-shrink-0 my-3 ${
                isDarkMode
                  ? "bg-[#1a1a1a] border border-[#333333]"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <h2
                className={`text-base font-bold mb-3 text-center ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Technology Stack
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <h3
                    className={`text-sm font-semibold mb-1 ${
                      isDarkMode ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  >
                    Frontend
                  </h3>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    React, Tailwind
                  </p>
                </div>
                <div className="text-center">
                  <h3
                    className={`text-sm font-semibold mb-1 ${
                      isDarkMode ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  >
                    Backend
                  </h3>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Node.js, Express
                  </p>
                </div>
                <div className="text-center">
                  <h3
                    className={`text-sm font-semibold mb-1 ${
                      isDarkMode ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  >
                    Integration
                  </h3>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Google APIs
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2 }}
              className="text-center flex-shrink-0"
            >
              <p
                className={`text-xs mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Built with KIRO ide for hackathon demonstration
              </p>

              <div className="flex justify-center items-center gap-2">
                <motion.a
                  href="https://github.com/Gavinduachintha/Looma"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    isDarkMode
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  }`}
                >
                  <Github className="w-3 h-3 mr-1" />
                  GitHub
                </motion.a>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    isDarkMode
                      ? "bg-[#333333] hover:bg-[#404040] text-white border border-[#404040]"
                      : "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
                  }`}
                >
                  <Star className="w-3 h-3 mr-1" />
                  Demo
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
