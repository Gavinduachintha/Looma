import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Plus } from "lucide-react";
import Button from "../components/ui/Button";
import { useTheme } from "../context/ThemeContext";
import { useCount } from "../context/CountContext";
import EventModal from "../components/EventModal";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const { refreshCounts } = useCount();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:3000/upcomingEvents", {
        withCredentials: true,
      });
      setEvents(res.data.events || []);
      // Refresh counts when events are fetched
      refreshCounts();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [refreshCounts]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreateEvent = async (eventData) => {
    try {
      // API call to create the event
      await axios.post("http://localhost:3000/addEvent", eventData, {
        withCredentials: true,
      });
      await fetchEvents();
      setIsEventModalOpen(false);
      // Refresh counts when event is created
      refreshCounts();
      console.log("Event created:", eventData);
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleCloseEventModal = () => {
    setIsEventModalOpen(false);
  };

  // Skeleton cards while loading
  const skeletons = Array.from({ length: 3 });

  return (
    <div
      className={`p-6 w-full min-h-screen ${
        isDarkMode ? "bg-neutral-950" : "bg-white"
      }`}
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-stretch">
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex-1 rounded-2xl backdrop-blur-xl border p-6 flex flex-col justify-between ${
            isDarkMode
              ? "bg-neutral-900/60 border-white/10"
              : "bg-white/80 border-white/30 shadow-lg"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h1
              className={`text-xl font-semibold tracking-tight ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Upcoming Events
            </h1>
            {/* Group action buttons to avoid large distributed gap */}
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="lg"
                onClick={fetchEvents}
                loading={loading}
                icon={RefreshCw}
              >
                Refresh
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsEventModalOpen(true)}
                icon={Plus}
              >
                Add Event
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            <div
              className={`flex-1 min-w-[140px] rounded-xl px-4 py-3 border ${
                isDarkMode
                  ? "bg-white/5 border-white/10"
                  : "bg-white/70 border-white/40 shadow"
              }`}
            >
              <p
                className={`text-xs mb-1 font-medium ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Total Upcoming
              </p>
              <p
                className={`text-2xl font-bold leading-none ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {events.length}
              </p>
            </div>
            <div
              className={`flex-1 min-w-[140px] rounded-xl px-4 py-3 border ${
                isDarkMode
                  ? "bg-white/5 border-white/10"
                  : "bg-white/70 border-white/40 shadow"
              }`}
            >
              <p
                className={`text-xs mb-1 font-medium ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Next Event
              </p>
              <p
                className={`text-sm font-semibold line-clamp-2 ${
                  isDarkMode ? "text-emerald-300" : "text-emerald-600"
                }`}
              >
                {events[0]?.summary || "--"}
              </p>
            </div>
          </div>
          {error && (
            <p className="text-red-500 text-xs font-medium mb-2">{error}</p>
          )}
          {!loading && !error && events.length === 0 && (
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No upcoming events found.
            </p>
          )}
        </motion.div>
      </div>
      <div
        className={`rounded-2xl backdrop-blur-xl border p-6 ${
          isDarkMode
            ? "bg-neutral-900/60 border-white/10"
            : "bg-white/80 border-white/30 shadow-lg"
        }`}
      >
        <h2
          className={`text-lg font-semibold mb-4 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Event List
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {loading &&
              skeletons.map((_, i) => (
                <motion.div
                  key={`sk-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`rounded-xl border p-4 h-40 animate-pulse flex flex-col gap-3 ${
                    isDarkMode
                      ? "bg-neutral-800/40 border-white/10"
                      : "bg-white border-gray-200 shadow"
                  }`}
                >
                  <div className="h-4 w-3/4 rounded bg-gray-400/30" />
                  <div className="h-3 w-1/2 rounded bg-gray-400/20" />
                  <div className="h-3 w-full rounded bg-gray-400/20" />
                  <div className="mt-auto h-6 w-32 rounded bg-gray-400/20" />
                </motion.div>
              ))}
            {!loading &&
              events.map((evt, idx) => {
                const start = evt.start ? new Date(evt.start) : null;
                const end = evt.end ? new Date(evt.end) : null;
                return (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`rounded-xl border p-4 flex flex-col group hover:shadow-xl transition-shadow ${
                      isDarkMode
                        ? "bg-neutral-800/60 border-white/10 hover:bg-neutral-800/80"
                        : "bg-white border-gray-200 shadow hover:shadow-emerald-100"
                    }`}
                  >
                    <h3
                      className={`font-semibold mb-1 line-clamp-2 leading-snug ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                      title={evt.summary}
                    >
                      {evt.summary}
                    </h3>
                    <p
                      className={`text-[11px] mb-2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {start ? start.toLocaleDateString() : ""}
                      {start && " • "}
                      {start
                        ? start.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                      {end
                        ? ` - ${new Date(end).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : ""}
                    </p>
                    {evt.location && (
                      <p
                        className={`text-xs mb-3 line-clamp-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                        title={evt.location}
                      >
                        {evt.location}
                      </p>
                    )}
                    <div className="mt-auto flex gap-2">
                      {evt.htmlLink && (
                        <a
                          href={evt.htmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-all border flex items-center gap-1 ${
                            isDarkMode
                              ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/30"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          }`}
                        >
                          View
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={handleCloseEventModal}
        emailData={{}}
        onCreateEvent={handleCreateEvent}
      />
    </div>
  );
};

export default Events;
