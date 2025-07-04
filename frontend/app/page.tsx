"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import molecule from "@/public/molecule.jpg";
import micros from "@/public/micros.jpeg";
import FloatingCircles from "./components/FloatingCircles";
import Header from "./components/Header";
import ImagesSlider from "./components/ImagesSlider";
import ScrollPresentation from "./components/ScrollPresentation";
import DeNovoIntro from "./components/DeNovoIntro";
import DeNovoMethodology from "./components/DeNovoMethodology";
import ResultsSection from "./components/ResultsSection";
import TechnologiesUsed from "./components/TechnologiesUsed";

export default function Home() {
  return (
    <div className="relative min-h-screen darkBG">
      <ScrollPresentation components={[ImagesSlider, DeNovoIntro, DeNovoMethodology , ResultsSection , TechnologiesUsed]}/>
    </div>
  );
}

function Tets(){
  return(
    <div className="bg-red-500 h-screen w-screen">
      <h1>testing</h1>
    </div>
  )
}