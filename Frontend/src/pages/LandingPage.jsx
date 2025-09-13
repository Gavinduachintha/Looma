import React, { Suspense, useEffect, useState } from "react";
import { Github } from "lucide-react";
import Aurora from "../components/Aurora";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";
import FeatureCard from "../components/FeatureCard";
import Button from "../components/ui/Button";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [reducedMotion, setReducedMotion] = useState(false);

  // Detect user prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReducedMotion(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  const goToSignin = () => {
    navigate("/signin");
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  const gotoDashboard = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Please login first");
      navigate("/signin");
      return;
    } else {
      navigate("/dashboard");
    }
  };

  // Data-driven features
  const features = [
    {
      title: "Instant AI Summaries",
      description:
        "Get AI-generated summaries of your emails in seconds. Never miss important information buried in long email threads.",
      delay: 0.1,
      icon: (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    
    
    {
      title: "Smart Automation",
      description:
        "Automate repetitive email tasks with AI-powered workflows and smart categorization.",
      delay: 0.4,
      icon: (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
          />
        </svg>
      ),
    },
    
    {
      title: "Easy Integration",
      description:
        "Connect with Gmail, Outlook, and other email providers in minutes with our simple setup process.",
      delay: 0.6,
      icon: (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 011 1v1a2 2 0 104 0V4z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-500`}
      style={{ background: isDarkMode ? "#0a0a0a" : "#ffffff" }}
    >
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-emerald-600 text-white px-4 py-2 rounded-md shadow-lg"
      >
        Skip to main content
      </a>

      {/* Aurora Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {!reducedMotion && (
          <Suspense fallback={null}>
            <Aurora
              colorStops={
                isDarkMode
                  ? ["#059669", "#10b981", "#34d399"]
                  : ["#d1fae5", "#6ee7b7", "#34d399"]
              }
              blend={isDarkMode ? 0.3 : 0.6}
              amplitude={0.8}
              speed={0.3}
            />
          </Suspense>
        )}
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
        <div
          className={`absolute inset-0 ${
            isDarkMode
              ? "bg-[radial-gradient(circle_at_30%_40%,rgba(5,150,105,0.08),transparent_60%)]"
              : "bg-[radial-gradient(circle_at_50%_50%,rgba(209,250,229,0.4),transparent_70%)]"
          }`}
        ></div>
        <div
          className={`absolute top-1/4 -left-40 w-80 h-80 rounded-full blur-3xl ${
            isDarkMode ? "bg-emerald-500/10" : "bg-green-200/30"
          }`}
        ></div>
        <div
          className={`absolute top-1/3 -right-40 w-80 h-80 rounded-full blur-3xl ${
            isDarkMode ? "bg-green-400/10" : "bg-emerald-200/30"
          }`}
        ></div>
        <div
          className={`absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-80 h-80 rounded-full blur-3xl ${
            isDarkMode ? "bg-teal-400/10" : "bg-green-300/25"
          }`}
        ></div>
      </div>

      {/* Header */}
      <header className="relative z-20 pt-6" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-transparent"
          >
            <div className="flex justify-between items-center py-4 px-6 md:justify-start md:space-x-10">
              {/* Logo */}
              <div className="flex justify-start lg:w-0 lg:flex-1">
                <motion.div
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg ${
                      isDarkMode ? "bg-emerald-600" : "bg-emerald-500"
                    }`}
                  >
                    <span className="font-bold text-lg text-white">L</span>
                  </div>
                  <span
                    className={` font-bold text-xl  ${
                      isDarkMode ? "text-green-300" : "text-green-800"
                    }`}
                  >
                    Looma
                  </span>
                </motion.div>
              </div>

              {/* Navigation */}
              <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-4">
                {/* Theme Toggle */}
                <Button
                  onClick={toggleTheme}
                  aria-label="Toggle color theme"
                  aria-pressed={isDarkMode}
                  className={`p-2 rounded-xl ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                  size="icon"
                >
                  {isDarkMode ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  )}
                </Button>

                {/* GitHub Icon */}
                <a
                  href="https://github.com/Gavinduachintha/Looma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg ${
                    isDarkMode
                      ? "text-white hover:bg-neutral-800"
                      : "text-black hover:bg-gray-100"
                  }`}
                  title="View Looma on GitHub"
                  aria-label="View Looma repository on GitHub"
                >
                  <Github className="w-6 h-6" />
                </a>

                <Button
                  onClick={gotoDashboard}
                  aria-label="Go to dashboard"
                  className={`rounded-xl font-bold px-5 py-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400/60 ${
                    isDarkMode
                      ? "bg-black text-white hover:bg-neutral-800 border border-gray-700 shadow-lg"
                      : "bg-white text-black hover:bg-gray-200 border border-gray-400 shadow-lg"
                  }`}
                >
                  Dashboard
                </Button>

                <Button
                  onClick={goToSignin}
                  aria-label="Sign in"
                  className={`rounded-xl font-bold px-5 py-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400/60 ${
                    isDarkMode
                      ? "bg-black text-white hover:bg-neutral-800 border border-gray-700 shadow-lg"
                      : "bg-white text-black hover:bg-gray-200 border border-gray-400 shadow-lg"
                  }`}
                >
                  Sign In
                </Button>

                <Button
                  onClick={goToSignup}
                  aria-label="Get started free"
                  className={`rounded-xl font-bold px-5 py-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400/60 ${
                    isDarkMode
                      ? "bg-black text-white hover:bg-neutral-800 border border-gray-700 shadow-lg"
                      : "bg-white text-black hover:bg-gray-200 border border-gray-400 shadow-lg"
                  }`}
                >
                  Get Started
                </Button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center space-x-2">
                <Button
                  onClick={toggleTheme}
                  className={`p-2 rounded-xl ${
                    isDarkMode ? "text-green-300" : "text-green-600"
                  }`}
                  aria-label="Toggle color theme"
                  aria-pressed={isDarkMode}
                >
                  {isDarkMode ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  )}
                </Button>
                <Button
                  onClick={goToSignup}
                  className={`rounded-xl font-semibold text-sm ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                  aria-label="Start free trial"
                >
                  Start
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="relative z-20">
        {/* Hero Section */}
        <section
          className="pt-20 pb-32 text-center"
          aria-labelledby="hero-heading"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <h1
                  id="hero-heading"
                  className={`text-5xl md:text-7xl font-bold leading-tight ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Transform Your{" "}
                  <span
                    className={`bg-gradient-to-r ${
                      isDarkMode
                        ? "from-green-300 to-emerald-400"
                        : "from-green-600 to-emerald-600"
                    } bg-clip-text text-transparent`}
                  >
                    Email
                  </span>{" "}
                  Workflow
                </h1>
                <p
                  className={`text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Get instant AI-powered summaries, insights, and analytics from
                  your email data. Save hours every day with intelligent email
                  processing.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
              >
                <Button
                  onClick={goToSignup}
                  className={`px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl focus:outline-none focus:ring-2 focus:ring-green-400/60 ${
                    isDarkMode
                      ? "bg-[#3ecf8e] text-[#0a0a0a] hover:bg-[#16a34a]"
                      : "bg-[#5cec98] text-green-900 hover:bg-[#bbf7d0]"
                  }`}
                >
                  Start Free Trial
                </Button>

                <Button
                  className={`px-8 py-4 rounded-2xl font-semibold text-lg border backdrop-blur-sm shadow-lg ${
                    isDarkMode
                      ? "border-green-400/30 text-green-200 hover:bg-green-800/30 bg-green-900/20"
                      : "border-green-300 text-green-900 hover:bg-green-800/30 bg-white/60"
                  }`}
                >
                  Watch Demo
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                ✨ Easy implementation  • 🚀 Setup in 2 minutes  • 🔒
                Enterprise-grade security
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          className="relative z-20 py-24"
          aria-labelledby="features-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                id="features-heading"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`text-4xl md:text-5xl font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Powerful Features for Modern Teams
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`text-lg max-w-2xl mx-auto ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Everything you need to transform your email workflow with
                AI-powered intelligence
              </motion.p>
            </div>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              role="list"
              aria-label="Key features"
            >
              {features.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  delay={feature.delay}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-20 py-24" aria-labelledby="cta-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`p-12 rounded-3xl backdrop-blur-xl border ${
                isDarkMode
                  ? "bg-white/5 border-white/20"
                  : "bg-white/60 border-white/40 shadow-2xl"
              }`}
            >
              <h2
                id="cta-heading"
                className={`text-4xl md:text-5xl font-bold mb-6 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Ready to Transform Your Email Experience?
              </h2>
              <p
                className={`text-xl mb-8 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Join thousands of professionals who have revolutionized their
                email workflow with Looma
              </p>
              <Button
                onClick={goToSignup}
                className={`px-10 py-4 rounded-2xl font-semibold text-lg shadow-2xl ${
                  isDarkMode
                    ? "bg-[#3ecf8e] text-[#0a0a0a] hover:bg-[#16a34a]"
                    : "bg-[#5cec98] text-green-900 hover:bg-[#bbf7d0]"
                }`}
              >
                Start Your With Looma
              </Button>
            </motion.div>
          </div>
        <div className="flex flex-col items-center justify-center mt-12">
  <motion.p
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    viewport={{ once: true }}
    className={`text-xl mb-8 ${
      isDarkMode ? "text-gray-300" : "text-gray-600"
    }`}
  >
    Made with <span className="font-semibold">KIRO IDE</span>
  </motion.p>
</div>



        </section>
        
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-12" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <span className="font-bold text-lg text-white">L</span>
              </div>
              <span
                className={`text-xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Looma
              </span>
            </div>

            <div
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              © 2024 Looma. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
