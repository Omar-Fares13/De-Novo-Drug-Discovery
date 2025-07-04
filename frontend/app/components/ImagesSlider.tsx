"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import molecule from "@/public/molecule.jpg";
import micros from "@/public/micros.jpeg";
import FloatingCircles from "./FloatingCircles";
import Link from "next/link";

export default function ImagesSlider() {
  return (
    <div className="relative min-h-screen darkBG">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 5 }}
      >
        <FloatingCircles />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50, height: "50vh" }}
        animate={{ opacity: 1, y: 0, height: "90vh" }}
        transition={{ duration: 0.7, height: { duration: 2, delay: 4, ease: "anticipate" } }}
        className="w-full px-6 py-4 overflow-x-hidden"
      >
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.3,
                delay: 0.7,
                delayChildren: 0.5
              }
            }
          }}
          className="w-full h-full flex items-center gap-12"
        >
          {/* Left Content Container*/}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 5, duration: 1.5 }}
            className="min-w-[30%] flex flex-col gap-6"
          >
            <span className="text-8xl font-bold glowing-text">
              AI Driven
            </span>
            <h1 className="text-white text-4xl">De novo Drug Discovery</h1>

            <Link href="/runs" passHref>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
              </motion.button>
            </Link>
          </motion.div>



          <div className="flex-1 h-full flex items-center gap-4 overflow-visible">
            <motion.div
              initial={{ x: '100vw' }}
              animate={{ x: '-100vw' }}
              transition={{ duration: 4, ease: "linear" }}
              className="relative w-[100%] h-[80%] rounded-md"
            >
              <Image
                src={micros}
                fill
                className="object-cover w-full h-full rounded-md"
                alt="Microscope"
              />
            </motion.div>

            <motion.div
              initial={{ x: '100vw' }}
              animate={{ x: '-100vw' }}
              transition={{ duration: 5, ease: "linear" }}
              className="relative w-[100%] h-[80%] rounded-md"
            >
              <Image
                src={molecule}
                fill
                className="object-cover w-full h-full rounded-md"
                alt="Molecule"
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ x: "100vw", width: "40%" }}
            animate={{ x: 0, width: "40%" }}
            transition={{ duration: 6, ease: "easeOut" }}
            className="relative h-full ml-auto flex-shrink-0"
          >
            <div className="w-full h-full rounded-lg overflow-hidden shadow-xl">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/DNA video.mp4" type="video/mp4" />
              </video>
            </div>
          </motion.div>

        </motion.div>
      </motion.div>
    </div>
  );
}