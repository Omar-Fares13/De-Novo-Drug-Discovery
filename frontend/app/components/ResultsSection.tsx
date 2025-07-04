"use client";
import { motion } from "framer-motion";

export default function ResultsSection() {
  const workflow = [
    {
      image: "/input-data.png",
      title: "Input Data",
      description: "Curated datasets of known drug compounds & biological targets",
      stat: "2.4M+ Compounds Analyzed"
    },
    {
      image: "/output-results.png",
      title: "AI Output",
      description: "Novel drug candidates with optimized properties",
      stat: "78% Success Rate"
    }
  ];

  return (
    <div className="darkBG min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-7xl w-full space-y-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-4">
            From Data to Discovery
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            See how raw biological data transforms into viable drug candidates through AI processing
          </p>
        </motion.div>

        {/* Input/Output Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {workflow.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative rounded-3xl overflow-hidden border border-cyan-500/20 bg-white/5 backdrop-blur-lg"
            >
              {/* Image with Overlay Text */}
              <div className="relative h-96">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Annotation */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    {item.description}
                  </p>
                  <div className="text-emerald-400 text-lg font-mono">
                    {item.stat}
                  </div>
                </div>
              </div>

              {/* Direction Arrow */}
              {index === 0 && (
                <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-cyan-400 text-4xl hidden md:block">
                  →
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Process Explanation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center text-cyan-300 italic text-lg mt-12 max-w-4xl mx-auto"
        >
          "Our AI processes millions of data points to generate novel molecular structures optimized for efficacy and safety"
        </motion.div>
      </div>
    </div>
  );
}