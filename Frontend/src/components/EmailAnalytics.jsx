import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Mail,
  BarChart3,
  PieChart,
  Calendar,
} from "lucide-react";

const EmailAnalytics = ({ emails, isDarkMode }) => {
  // Email analytics calculations
  const analytics = useMemo(() => {
    if (!emails || emails.length === 0) {
      return {
        topSenders: [],
        emailsByDay: {},
        responseTime: 0,
        busyHours: [],
        unreadByAge: { today: 0, week: 0, month: 0, older: 0 },
      };
    }

    // Top senders
    const senderCounts = {};
    emails.forEach((email) => {
      const sender = email.from_email || email.from || "Unknown";
      senderCounts[sender] = (senderCounts[sender] || 0) + 1;
    });
    const topSenders = Object.entries(senderCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([sender, count]) => ({ sender, count }));

    // Emails by day of week
    const emailsByDay = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };
    emails.forEach((email) => {
      const date = new Date(email.date || email.receivedAt);
      const dayName = date.toLocaleDateString("en", { weekday: "short" });
      if (emailsByDay[dayName] !== undefined) {
        emailsByDay[dayName]++;
      }
    });

    // Unread emails by age
    const now = new Date();
    const unreadEmails = emails.filter((email) => !email.read);
    const unreadByAge = { today: 0, week: 0, month: 0, older: 0 };

    unreadEmails.forEach((email) => {
      const emailDate = new Date(email.date || email.receivedAt);
      const daysDiff = Math.floor((now - emailDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) unreadByAge.today++;
      else if (daysDiff <= 7) unreadByAge.week++;
      else if (daysDiff <= 30) unreadByAge.month++;
      else unreadByAge.older++;
    });

    // Email distribution by hour (if available)
    const hourCounts = Array(24).fill(0);
    emails.forEach((email) => {
      const date = new Date(email.date || email.receivedAt);
      const hour = date.getHours();
      hourCounts[hour]++;
    });
    const maxHourCount = Math.max(...hourCounts);
    const busyHours = hourCounts
      .map((count, hour) => ({
        hour,
        count,
        percentage: maxHourCount > 0 ? (count / maxHourCount) * 100 : 0,
      }))
      .filter((h) => h.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      topSenders,
      emailsByDay,
      unreadByAge,
      busyHours,
    };
  }, [emails]);

  return (
    <div className="space-y-6">
      {/* Quick Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Sender */}
        <motion.div
          className={`rounded-xl border p-4 ${
            isDarkMode
              ? "border-[#262626] bg-[#171717]"
              : "border-[#e5e7eb] bg-white shadow-sm"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDarkMode ? "bg-blue-600/20" : "bg-blue-100"
              }`}
            >
              <Users
                className={`w-4 h-4 ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
            <h3
              className={`text-sm font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Most Active Sender
            </h3>
          </div>
          {analytics.topSenders.length > 0 ? (
            <div>
              <p
                className={`text-lg font-semibold truncate ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {analytics.topSenders[0].sender.split("@")[0] || "Unknown"}
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {analytics.topSenders[0].count} emails
              </p>
            </div>
          ) : (
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No data available
            </p>
          )}
        </motion.div>

        {/* Busiest Day */}
        <motion.div
          className={`rounded-xl border p-4 ${
            isDarkMode
              ? "border-[#262626] bg-[#171717]"
              : "border-[#e5e7eb] bg-white shadow-sm"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDarkMode ? "bg-green-600/20" : "bg-green-100"
              }`}
            >
              <Calendar
                className={`w-4 h-4 ${
                  isDarkMode ? "text-green-400" : "text-green-600"
                }`}
              />
            </div>
            <h3
              className={`text-sm font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Busiest Day
            </h3>
          </div>
          {(() => {
            const busiestDay = Object.entries(analytics.emailsByDay).sort(
              ([, a], [, b]) => b - a
            )[0];
            return busiestDay && busiestDay[1] > 0 ? (
              <div>
                <p
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {busiestDay[0]}
                </p>
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {busiestDay[1]} emails
                </p>
              </div>
            ) : (
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No data available
              </p>
            );
          })()}
        </motion.div>

        {/* Oldest Unread */}
        <motion.div
          className={`rounded-xl border p-4 ${
            isDarkMode
              ? "border-[#262626] bg-[#171717]"
              : "border-[#e5e7eb] bg-white shadow-sm"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDarkMode ? "bg-orange-600/20" : "bg-orange-100"
              }`}
            >
              <Clock
                className={`w-4 h-4 ${
                  isDarkMode ? "text-orange-400" : "text-orange-600"
                }`}
              />
            </div>
            <h3
              className={`text-sm font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Attention Needed
            </h3>
          </div>
          <div>
            <p
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {analytics.unreadByAge.older + analytics.unreadByAge.month}
            </p>
            <p
              className={`text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              old unread emails
            </p>
          </div>
        </motion.div>
      </div>

      {/* Top Senders List */}
      <motion.div
        className={`rounded-xl border p-4 ${
          isDarkMode
            ? "border-[#262626] bg-[#171717]"
            : "border-[#e5e7eb] bg-white shadow-sm"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <BarChart3
            className={`w-5 h-5 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          />
          <h3
            className={`text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Top Email Senders
          </h3>
        </div>
        <div className="space-y-3">
          {analytics.topSenders.length > 0 ? (
            analytics.topSenders.map((sender, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-2 h-2 rounded-full bg-gradient-to-r ${
                      index === 0
                        ? "from-blue-400 to-blue-600"
                        : index === 1
                        ? "from-green-400 to-green-600"
                        : index === 2
                        ? "from-yellow-400 to-yellow-600"
                        : index === 3
                        ? "from-purple-400 to-purple-600"
                        : "from-pink-400 to-pink-600"
                    }`}
                  />
                  <span
                    className={`text-sm truncate ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {sender.sender.split("@")[0] || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {sender.count}
                  </span>
                  <div className="w-16 bg-gray-700 rounded-full h-1">
                    <div
                      className="h-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                      style={{
                        width: `${
                          (sender.count /
                            (analytics.topSenders[0]?.count || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No sender data available
            </p>
          )}
        </div>
      </motion.div>

      {/* Email Activity by Day */}
      <motion.div
        className={`rounded-xl border p-4 ${
          isDarkMode
            ? "border-[#262626] bg-[#171717]"
            : "border-[#e5e7eb] bg-white shadow-sm"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <PieChart
            className={`w-5 h-5 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          />
          <h3
            className={`text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Email Activity by Day
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Object.entries(analytics.emailsByDay).map(([day, count], index) => {
            const maxCount = Math.max(...Object.values(analytics.emailsByDay));
            const height =
              maxCount > 0 ? Math.max((count / maxCount) * 40, 4) : 4;

            return (
              <div key={day} className="flex flex-col items-center">
                <div className="flex flex-col items-center justify-end h-12 w-full">
                  <motion.div
                    className="w-6 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}px` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
                <span
                  className={`text-xs mt-1 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {day}
                </span>
                <span
                  className={`text-xs font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default EmailAnalytics;
