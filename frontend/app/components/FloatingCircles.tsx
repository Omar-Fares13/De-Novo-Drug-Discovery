
import Image from "next/image";
import { motion } from "framer-motion";
import molecule from "@/public/molecule.jpg";
import micros from "@/public/micros.jpeg";

const FloatingCircles = () => {
  const colors = ["bg-blue-300", "bg-blue-500", "bg-purple-700", "bg-purple-500" , "bg-blue-100" , "bg-green-300"];
  const sizes = ["w-1 h-1", "w-1.5 h-1.5", "w-2 h-2"];

  return (
    <div className="absolute inset-0 pointer-events-none w-full h-full overflow-hidden">
      {Array(100)
        .fill(null)
        .map((_, index) => {
          const color = colors[Math.floor(Math.random() * colors.length)];
          const size = sizes[Math.floor(Math.random() * sizes.length)];
          const top = Math.random() * 100 - 10;
          const left = Math.random() * 100 - 10;
          const duration = 5 + Math.random() * 5;
          const delay = Math.random() * 2;

          return (
            <motion.div
              key={index}
              className={`absolute rounded-full opacity-30 ${color} ${size}`}
              style={{
                top: `${top}%`,
                left: `${left}%`,
              }}
              initial={{
                y: 0,
                x: 0,
              }}
              animate={{
                y: [0, -40, 0, 40, 0],
                x: [0, 20, -20, 0],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: delay,
              }}
            />
          );
        })}
    </div>
  );
};

export default FloatingCircles