"use client"
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import FloatingCircles from "./FloatingCircles";

const AnimatedSection = ({ children, isActive } : any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 200, scale: 0.95 }}
      animate={isActive ? { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 20,
          duration: 0.8
        }
      } : {}}
      style={{ 
        height: "100vh", 
        width: "100%",
        overflow: "hidden",
        position: "absolute",
        top: 0,
        left: 0
      }}
    >
      {children}
    </motion.div>
  );
};

const ScrollPresentation = ({ components } : any) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const handleNavigation = useCallback(
    (direction: "up" | "down") => {
      if (isScrolling) return;
      
      setIsScrolling(true);
      setCurrentSection((prev) => {
        const nextSection = direction === "down" ? prev + 1 : prev - 1;
        return Math.max(0, Math.min(components.length - 1, nextSection));
      });
      
      setTimeout(() => setIsScrolling(false), 1000);
    },
    [components.length, isScrolling]
  );

  // Keyboard navigation (keep previous implementation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNavigation("down");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handleNavigation("up");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNavigation]);

  // Wheel/touchpad scrolling (keep previous implementation)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const direction = e.deltaY > 0 ? "down" : "up";
      handleNavigation(direction);
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [handleNavigation]);

  // Scroll to section (keep previous implementation)
  useEffect(() => {
    const section = document.getElementById(`section-${currentSection}`);
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentSection]);

  return (
    <div style={{ 
      overflow: "hidden",
      scrollSnapType: "y mandatory",
      scrollBehavior: "smooth",
      height: "100vh",
      overflowY: "scroll",
      position: "relative"
    }}>
      {components.map((Component : any, index : any) => (
        <div 
          key={index}
          id={`section-${index}`}
          style={{ 
            height: "100vh",
            scrollSnapAlign: "start",
            position: "relative"
          }}
        >
          <AnimatedSection isActive={currentSection === index}>
            <FloatingCircles/>
            <Component />
          </AnimatedSection>
        </div>
      ))}
    </div>
  );
};

export default ScrollPresentation;