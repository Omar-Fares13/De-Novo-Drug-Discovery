"use client";
import { motion } from "framer-motion";
import { BeakerIcon, CpuChipIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";
import { useInView } from "react-intersection-observer";

export default function DeNovoIntro() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    rootMargin: '-100px 0px',
    threshold: 0.1
  });

  return (
    <div ref={ref} className="darkBG min-h-screen flex items-center justify-center p-6">
      <div className="max-w-7xl w-full space-y-12">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent"
        >
          Revolutionizing Drug Discovery
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Problem Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="group relative bg-white/5 p-8 rounded-3xl backdrop-blur-md border border-cyan-400/20 hover:border-cyan-400/40 transition-all"
          >
            <div className="absolute inset-0 bg-cyan-500/5 rounded-3xl transform group-hover:scale-105 transition-transform" />
            <div className="relative">
              <BeakerIcon className="h-12 w-12 text-cyan-400 mb-6" />
              <h2 className="text-2xl font-bold mb-4 text-cyan-300">
                The Traditional Challenge
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Decades of trial-and-error approaches, billions wasted on failed compounds, 
                and endless manual analysis of molecular structures.
              </p>
              <div className="mt-6 text-cyan-400 font-medium">
                ≈12 Years per Drug
              </div>
            </div>
          </motion.div>

          {/* Solution Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative bg-white/5 p-8 rounded-3xl backdrop-blur-md border border-emerald-400/20 hover:border-emerald-400/40 transition-all"
          >
            <div className="absolute inset-0 bg-emerald-500/5 rounded-3xl transform group-hover:scale-105 transition-transform" />
            <div className="relative">
              <CpuChipIcon className="h-12 w-12 text-emerald-400 mb-6" />
              <h2 className="text-2xl font-bold mb-4 text-emerald-300">
                AI-Powered Innovation
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Neural networks that learn molecular blueprints, generative models 
                that create optimized candidates, and predictive validation.
              </p>
              <div className="mt-6 text-emerald-400 font-medium">
                10x Faster Iterations
              </div>
            </div>
          </motion.div>

          {/* Impact Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="group relative bg-white/5 p-8 rounded-3xl backdrop-blur-md border border-purple-400/20 hover:border-purple-400/40 transition-all"
          >
            <div className="absolute inset-0 bg-purple-500/5 rounded-3xl transform group-hover:scale-105 transition-transform" />
            <div className="relative">
              <RocketLaunchIcon className="h-12 w-12 text-purple-400 mb-6" />
              <h2 className="text-2xl font-bold mb-4 text-purple-300">
                Accelerated Discovery
              </h2>
              <p className="text-gray-300 leading-relaxed">
                From years to months: AI-driven candidate generation with 
                built-in efficacy prediction and toxicity screening.
              </p>
              <div className="mt-6 text-purple-400 font-medium">
                ↓90% Failure Rate
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 text-cyan-300 italic text-lg"
        >
          "Where traditional methods see molecules, our AI sees possibilities"
        </motion.div>
      </div>
    </div>
  );
}