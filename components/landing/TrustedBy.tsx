"use client";

import { motion } from "framer-motion";

const companyLogos = [
  "Google",
  "Microsoft",
  "Amazon",
  "Dell",
  "Airbnb",
  "TCS",
  "NVIDIA",
  "Meta",
];

export function TrustedBy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
      className="w-full pt-8 pb-4 border-t border-white/5 flex flex-col items-center gap-4"
    >
      <span className="text-[10px] tracking-widest font-mono uppercase text-neutral-500 font-medium">
        Trusted by engineers & teams at
      </span>
      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60 hover:opacity-90 transition-opacity">
        {companyLogos.map((name) => (
          <span
            key={name}
            className="text-sm font-semibold tracking-tight text-neutral-300 font-sans"
          >
            {name}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
