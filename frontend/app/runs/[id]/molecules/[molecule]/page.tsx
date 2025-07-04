"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type MoleculeData = {
  id: number;
  SMILES: string;
  run_id: number;
  score: number;
  view: string;
};

export default function MoleculePage() {
  const { molecule } = useParams();
  const [moleculeData, setMoleculeData] = useState<MoleculeData | null>(null);
  const [loading, setLoading] = useState(true);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load 3Dmol.js script only once
  useEffect(() => {
    if (scriptLoaded) return;

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/3dmol@2.5.0/build/3Dmol-min.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchMolecule = async () => {
      try {
        setLoading(true);
        const baseURL = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${baseURL}run/molecule/${molecule}`);
        setMoleculeData(res.data);
      } catch (error) {
        console.error("Error fetching molecule data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMolecule();
  }, [molecule]);

  // Render molecule when data and script are ready
  useEffect(() => {
    if (!moleculeData || !scriptLoaded || !viewerRef.current) return;
    
    try {
      // Clear previous content
      viewerRef.current.innerHTML = moleculeData.view;
      
      // Find all scripts within the viewerRef
      const scripts = viewerRef.current.querySelectorAll("script");
      
      // Recreate and execute each script
      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        
        // Copy all attributes
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // Copy script content
        newScript.textContent = oldScript.textContent;
        
        // Replace old script with executable version
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    } catch (error) {
      console.error("Error rendering molecule:", error);
    }
  }, [moleculeData, scriptLoaded]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] to-[#1f1f1f] text-white px-8 py-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-cyan-400 text-center drop-shadow">
          Molecule Details
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : moleculeData ? (
          <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-md p-6 border border-white/10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/20 p-4 rounded-lg">
                <p className="text-cyan-300 text-sm font-semibold">ID:</p>
                <p className="text-white/90 font-mono">{moleculeData.id}</p>
              </div>
              
              <div className="bg-black/20 p-4 rounded-lg">
                <p className="text-cyan-300 text-sm font-semibold">Run ID:</p>
                <p className="text-white/90 font-mono">{moleculeData.run_id}</p>
              </div>
              
              <div className="bg-black/20 p-4 rounded-lg">
                <p className="text-cyan-300 text-sm font-semibold">Score:</p>
                <p className="text-white/90 font-mono">
                  {moleculeData.score.toFixed(4)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-cyan-300 text-lg font-semibold mb-2">SMILES:</p>
              <div className="bg-black/20 p-4 rounded-lg overflow-x-auto">
                <code className="text-white/90 font-mono text-sm">
                  {moleculeData.SMILES}
                </code>
              </div>
            </div>

            <div>
              <p className="text-cyan-300 text-lg font-semibold mb-2">
                3D Visualization:
              </p>
              <div
                ref={viewerRef}
                className="mt-4 border border-white/20 rounded-md bg-black/10 p-4 min-h-[400px] flex items-center justify-center"
              >
                {!scriptLoaded && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500 mx-auto mb-3"></div>
                    <p className="text-white/70">Loading 3D viewer...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-red-400 text-lg mb-4">Failed to load molecule data</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 rounded-md text-white"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}