import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EmailCard = () => {
  const [hovered, setHovered] = useState(false);
  // Animation variants for staggered reveal
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.4,
        type: "spring",
        stiffness: 100,
      },
    }),
  };

  return (
    <motion.div
      className="group max-w-xs mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex flex-col items-center p-4 border border-gray-200 cursor-pointer transition-colors duration-300"
      whileHover={{
        scale: 1.07,
        boxShadow: "0 8px 32px 0 rgba(59,130,246,0.25)",
        backgroundColor: "#f0f6ff",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <motion.img
        className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 mb-2"
        src="https://img.freepik.com/premium-photo/anime-male-avatar_950633-956.jpg"
        alt="User avatar"
        whileHover={{ scale: 1.15 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      <div className="text-center w-full">
        <p className="text-base font-semibold text-gray-800">
          gavindu.al@gmail.com
        </p>
        <p className="text-xs text-gray-500 mt-1">Heading - a meeting</p>
        {/* Preview content only visible when not hovered */}
        {!hovered && (
          <div className="relative mt-2 h-5 overflow-hidden">
            <p className="text-xs text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis pr-6">
              Hi Gavindu, just a reminder about our meeting scheduled for
              tomorrow at 10 AM.
            </p>
            <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>
        )}
        {/* Full content only visible when hovered, with staggered animation */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              className="overflow-visible mt-2 text-left"
              initial={{ maxHeight: 0, opacity: 0 }}
              animate={{ maxHeight: 200, opacity: 1 }}
              exit={{ maxHeight: 0, opacity: 0 }}
              transition={{
                maxHeight: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.4 },
              }}
            >
              <motion.p
                className="text-xs text-gray-700"
                custom={1}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                Hi Gavindu, just a reminder about our meeting scheduled for
                tomorrow at 10 AM. Please bring the project documents and be
                prepared for a quick demo.
              </motion.p>
              <motion.p
                className="text-xs text-gray-700 mt-1"
                custom={2}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                Location: Conference Room B
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default EmailCard;
