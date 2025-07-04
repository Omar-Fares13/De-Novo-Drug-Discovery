"use client";
import { motion } from "framer-motion";
import react from "@/public/react.png"
import rdkit from "@/public/rdkit.png"
import docstream from "@/public/docstream.jpeg"
import python from "@/public/python.png"

const technologies = [
  {
    name: "DocStream",
    img: docstream.src ,
    description: "Docking engine integration for molecular docking and scoring.",
  },
  {
    name: "Rdkit",
    img: rdkit.src,
    description: "Advanced cheminformatics tool for reaction prediction & filtering.",
  },
  {
    name: "React",
    img: react.src,
    description: "Interactive UI development using React and modern JS frameworks.",
  },
  {
    name: "Python",
    img: python.src,
    description: "Core backend pipelines and AI model development with Python.",
  },
];

export default function TechnologiesUsed() {
  return (
    <div className="darkBG py-24 px-6 min-h-screen flex items-center justify-center">
      <div className="max-w-6xl w-full text-center">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-cyan-400 to-purple-400 bg-clip-text mb-8"
        >
          Technologies Used
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-gray-300 max-w-2xl mx-auto mb-16"
        >
          A glimpse into the powerful libraries and platforms that made this AI-driven pipeline possible.
        </motion.p>

        {/* Tech Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + index * 0.2 }}
              className="bg-white/5 backdrop-blur-md border border-cyan-500/10 rounded-2xl p-6 text-center hover:shadow-lg hover:scale-105 transition-all"
            >
              <img
                src={tech.img}
                alt={tech.name}
                className="w-16 h-16 mx-auto mb-4 object-contain rounded-full"
              />
              <h3 className="text-xl font-semibold text-cyan-300 mb-2">{tech.name}</h3>
              <p className="text-sm text-gray-400">{tech.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
