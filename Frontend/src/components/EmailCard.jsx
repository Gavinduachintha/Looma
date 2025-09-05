import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EmailCard = ({ email, subject, summary, date }) => {
  const [expanded, setExpanded] = useState(false);

  // Animation variants for modal
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  return (
    <>
      <motion.div
        className="group max-w-xs mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex flex-col items-start p-4 border border-gray-200 cursor-pointer transition-colors duration-300"
        whileTap={{ scale: 0.97 }}
        onClick={() => setExpanded(true)}
      >
        <div className="w-full mb-2">
          <p className="text-base font-semibold text-gray-800">Sender Name</p>
          <p className="text-xs text-gray-500">{email}</p>
        </div>
        <p className="text-sm font-medium text-gray-700 mb-1">{subject}</p>
        <div className="relative h-10 overflow-hidden w-full">
          <p
            className="text-xs text-gray-600 line-clamp-2 pr-6"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "normal",
            }}
          >
            {summary}
          </p>
          <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </motion.div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={() => setExpanded(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                transition: { type: "spring", stiffness: 260, damping: 22 },
              }}
              exit={{ scale: 0.7, opacity: 0, transition: { duration: 0.2 } }}
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setExpanded(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <div className="w-full mb-2">
                <p className="text-lg font-semibold text-gray-800">
                  Sender Name
                </p>
                <p className="text-xs text-gray-500">{email}</p>
              </div>
              <p className="text-base font-medium text-gray-700 mb-2">
                {subject}
              </p>
              <p className="text-sm text-gray-700 mb-4 whitespace-pre-line">
                {summary}
              </p>
              <p className="text-xs text-gray-400">{date}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default EmailCard;
