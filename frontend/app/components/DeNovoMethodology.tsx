"use client";
import { motion, useInView } from "framer-motion";
import { BeakerIcon, CpuChipIcon,FunnelIcon , ChartBarIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function DeNovoMethodology() {
  const [inView] = [ true]

  return (
    <div className="darkBG min-h-screen flex items-center justify-center p-6">
      <div className="max-w-7xl w-full relative">
        {/* Animated background elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 0.1 } : {}}
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative bg-white/5 p-10 rounded-3xl shadow-2xl backdrop-blur-xl border border-cyan-500/20"
        >
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="mb-12 flex items-center gap-4"
          >
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <BeakerIcon className="h-8 w-8 text-cyan-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              AI-Driven Drug Creation Pipeline
            </h1>
          </motion.div>

          {/* Methodology Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Generative Model */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-xl bg-white/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="p-3 rounded-lg bg-emerald-500/10">
                  <CpuChipIcon className="h-6 w-6 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-semibold text-emerald-300">Generative AI Engine</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Deep neural networks (GANs/Transformers) trained on 2M+ compounds generate novel molecular structures 
                with optimized properties using SMILES notation.
              </p>
              <div className="mt-4 text-emerald-400 text-xs font-mono">
                → 50k+ novel compounds/day
              </div>
            </motion.div>

            {/* Scoring System */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="p-6 rounded-xl bg-white/5 border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="p-3 rounded-lg bg-cyan-500/10">
                  <ChartBarIcon className="h-6 w-6 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-semibold text-cyan-300">Multi-Parametric Scoring</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Real-time evaluation using 12+ metrics including QED, SAscore, synthetic accessibility, 
                and predicted target affinity via ML models.
              </p>
              <div className="mt-4 text-cyan-400 text-xs font-mono">
                → 92% prediction accuracy
              </div>
            </motion.div>

            {/* Filtering */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 }}
              className="p-6 rounded-xl bg-white/5 border border-purple-500/20 hover:border-purple-500/40 transition-all"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <FunnelIcon className="h-6 w-6 text-purple-400" />
                </div>
                <h2 className="text-2xl font-semibold text-purple-300">Smart Filtration</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Automated removal of toxic/unstable compounds using custom rulesets and 
                external databases (ChEMBL, PubChem).
              </p>
              <div className="mt-4 text-purple-400 text-xs font-mono">
                → 99.7% redundancy removal
              </div>
            </motion.div>
          </div>

          {/* Workflow Visualization */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 1 }}
            className="mt-16 group relative h-64 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
          >
            <div className="absolute inset-0 flex items-center justify-center gap-4">
              <SparklesIcon className="h-8 w-8 text-cyan-400 group-hover:text-purple-400 transition-colors" />
              <span className="text-2xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Interactive Pipeline Visualization
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}