import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, matchPath } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Shield,
  Info,
  Calendar,
  LogOut,
  User,
  Mail,
  Mails,
  Trash2,
  Trash,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useCount } from "../context/CountContext";
import CountBadge from "./CountBadge";
import toast from "react-hot-toast";
import TrashEmailsModal from "../pages/Trash.jsx";

const Navigation = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showTrashModal, setShowTrashModal] = useState(false);
  const { isDarkMode } = useTheme();
  const { unreadEmailsCount, eventsCount, refreshCounts } = useCount();
  const navigate = useNavigate();
  const location = useLocation();

  // Add an id and optional matchPaths so we can highlight nav item for
  // nested / variant routes (e.g., an event planning sub-route)
  const navigationItems = [
    {
      name: "Home",
      icon: Home,
      href: "/dashboard",
      matchPaths: ["/dashboard"],
    },
    { name: "Compose", icon: Mails, href: "/compose", matchPath: ["/compose"] },

    { name: "Emails", icon: Mail, href: "/emails", matchPaths: ["/emails"] },
    // Support both /events and potential future /event-plan (user request: "even plan tab")
    {
      name: "Event Viewer",
      icon: Calendar,
      href: "/events",
      matchPaths: ["/events", "/event-plan"],
    },

    { name: "Trash", icon: Trash, href: "/trash", matchPaths: ["/trash"] },
    { name: "About", icon: Info, href: "/about", matchPaths: ["/about"] },
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleNavigation = (href) => navigate(href);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Error parsing userData:", error);
      }
    }
  }, []);

  const textColor = isDarkMode ? "text-white" : "text-gray-600";
  const activeTextColor = isDarkMode ? "text-white" : "text-gray-800";
  const borderColor = isDarkMode ? "border-white" : "border-gray-800";
  // Hover background tuned per theme (light mode previously looked too dark)
  const hoverItemBg = isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"; // subtle tint for light mode
  // Different dark background for Event Planner tab
  const isEventPlan = ["/events", "/event-plan"].some((p) =>
    location.pathname.startsWith(p)
  );
  const darkBaseBg = "#0a0a0a"; // original
  const darkEventBg = "#05261e"; // slightly tinted dark green for events
  const navigateHome = useEffect;

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-64"
      } min-h-screen flex flex-col border-r`}
      style={{
        background: isDarkMode
          ? isEventPlan
            ? darkEventBg
            : darkBaseBg
          : "#ffffff", // Supabase backgrounds
        borderRight: isDarkMode ? "1px solid #27272a" : "1px solid #e5e7eb",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDarkMode ? "bg-emerald-600" : "bg-emerald-500"
              }`}
            >
              <span
                className="text-white font-bold text-sm cursor-pointer"
                onClick={() => navigate("/")}
              >
                L
              </span>
            </div>
            <span
              className={`font-bold ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Looma
            </span>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg transition-colors duration-150 ease-out ${textColor}`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
      {/* Navigation Items */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = item.matchPaths
              ? item.matchPaths.some((p) => location.pathname.startsWith(p))
              : location.pathname === item.href;

            // Determine badge count for each item
            let badgeCount = 0;
            if (item.name === "Emails") {
              badgeCount = unreadEmailsCount;
            } else if (item.name === "Event Viewer") {
              badgeCount = eventsCount;
            }

            return (
              <li key={item.name}>
                <button
                  onClick={() => handleNavigation(item.href)}
                  className={`relative w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium border-l-4 border-transparent transition-colors duration-200 ease-in-out ${hoverItemBg} ${
                    isActive ? `${activeTextColor} ${borderColor}` : textColor
                  } ${isCollapsed ? "justify-center" : ""}`}
                  title={isCollapsed ? item.name : ""}
                >
                  <div className="relative">
                    <IconComponent
                      className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`}
                    />
                    {badgeCount > 0 && (
                      <CountBadge count={badgeCount} isDarkMode={isDarkMode} />
                    )}
                  </div>
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* Trash + User Section & Logout */}
      <div className="p-2">
        {/* Trash */}
        {/* <button
          onClick={() => setShowTrashModal(true)}
          className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium border-l-4 border-transparent transition-colors duration-200 ease-in-out mb-2 ${hoverItemBg} ${textColor} ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Trash" : ""}
        >
          <Trash2 className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`} />
          {!isCollapsed && <span>Trash</span>}
        </button> */}

        {/* User Profile */}
        {!isCollapsed && (
          <div className="px-3 py-2 mb-2">
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDarkMode ? "bg-emerald-700" : "bg-emerald-100"
                }`}
              >
                <User
                  className={`w-4 h-4 ${
                    isDarkMode ? "text-white" : "text-gray-600"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${textColor}`}>
                  {currentUser?.name || "Guest user"}
                </p>
                <p className={`text-xs truncate ${textColor}`}>
                  {currentUser?.email || "No email"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed avatar */}
        {isCollapsed && (
          <div className="relative flex justify-center mb-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isDarkMode ? "bg-emerald-700" : "bg-emerald-100"
              } cursor-pointer`}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <User
                className={`w-4 h-4 ${
                  isDarkMode ? "text-white" : "text-gray-600"
                }`}
              />
            </div>
            {showTooltip && (
              <div
                className={`absolute left-full ml-2 px-3 py-2 rounded-lg shadow-lg z-50 ${
                  isDarkMode
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-800"
                } border ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}
              >
                <p className="text-sm font-medium">
                  {currentUser?.name || "Guest user"}
                </p>
                <p className="text-xs">{currentUser?.email || "No email"}</p>
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ease-out hover:text-red-500 ${textColor} ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
      {/* Trash Emails Modal */}
      {/* <TrashEmailsModal
        isOpen={showTrashModal}
        onClose={() => setShowTrashModal(false)}
      /> */}
    </div>
  );
};

export default Navigation;
