"use client";
import { motion, AnimatePresence } from "framer-motion";

export default function Alert({ message, type = "success", onClose }) {
  if (!message) return null;

  const styles = {
    success: "bg-green-100 border-green-500 text-green-800",
    error: "bg-red-100 border-red-500 text-red-800",
    info: "bg-blue-100 border-blue-500 text-blue-800"
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${styles[type]} border-l-4 p-4 rounded-lg mb-4 flex justify-between items-center`}
      >
        <p className="font-medium">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-lg font-bold hover:opacity-70"
          >
            ×
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
