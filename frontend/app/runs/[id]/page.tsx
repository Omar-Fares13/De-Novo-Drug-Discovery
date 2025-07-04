"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CloudArrowUpIcon, DocumentIcon } from "@heroicons/react/24/outline";
import { 
  DocumentTextIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import axios from "axios";
import Link from "next/link";

type Molecule = {
    id: number;
    SMILES: string;
    score: number;
    run_id: number;
};

type Run = {
    id: number;
    title: string;
    creation_date: string;
    model?: {
        name: string;
    };
};

export default function RunDetailsPage() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("Sample Molecules");
    const [selectedScorers, setSelectedScorers] = useState<string[]>([]);
    const [maxScore, setMaxScore] = useState<number>(1.0);
    const [minSteps, setMinSteps] = useState<number>(10);
    const [maxSteps, setMaxSteps] = useState<number>(100);
    const [epochs, setEpochs] = useState<number>(100);
    const [batchSize, setBatchSize] = useState<number>(128);
    const [smilesFile, setSmilesFile] = useState<File | null>(null);


    // .......................
    const [numSamples, setNumSamples] = useState<number>(5);
    const baseURL = process.env.NEXT_PUBLIC_API_URL;
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadMessage, setDownloadMessage] = useState<{success: boolean, text: string} | null>(null);
        const handleSample = async () => {
            setIsDownloading(true);
            setDownloadMessage(null);
            
            const response = await axios.post(
            `${baseURL}run/sample`,
            { run_id: Number(id), num_samples: numSamples },
            { responseType: 'blob' }  // Important for file downloads
            );

            // Extract filename from headers
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'molecules.csv';
            
            if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
            }

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);

            setDownloadMessage({
            success: true,
            text: `Successfully downloaded ${numSamples} molecules!`
            });
    };

    const [agentName, setAgentName] = useState<string>('');
    const [transferLoading, setTransferLoading] = useState<boolean>(false);
    const [transferSuccess, setTransferSuccess] = useState<boolean>(false);
    const [transferError, setTransferError] = useState<string | null>(null);
    const handleSmilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Validate file type and size
        const validTypes = ['text/csv', 'text/plain', 'application/vnd.ms-excel'];
        const extension = file.name.split('.').pop()?.toLowerCase();
        const isValidType = validTypes.includes(file.type) || 
                        ['csv', 'txt', 'smi' , "pdf"].includes(extension || '');
        
        if (!isValidType) {
        setTransferError('Invalid file type. Please upload a CSV, TXT, or SMI file.');
        return;
        }
        
        if (file.size > 100 * 1024 * 1024) {
        setTransferError('File size exceeds 100MB limit');
        return;
        }
        
        setSmilesFile(file);
        setTransferError(null);
    }
    };

    // Transfer learning handler
    const handleTransferLearning = async () => {
        if (!smilesFile) {
            setTransferError('Please upload a dataset first');
            return;
        }
    
        if (!agentName.trim()) {
            setTransferError('Please enter an agent name');
            return;
        }
    
        setTransferLoading(true);
        setTransferError(null);
        
        const formData = new FormData();
        formData.append('prior_id', id.toString());
        formData.append('agent_name', agentName);
        formData.append('epochs', epochs.toString());
        formData.append('batch_size', batchSize.toString());
        formData.append('file', smilesFile);
        
        const response = await axios.post(`${baseURL}run/transfer`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        });
        
        // Handle successful response
        setTransferSuccess(true);
        console.log('Transfer learning started:', response.data);
        
        // Reset form after success
        setTimeout(() => {
        setTransferSuccess(false);
        setSmilesFile(null);
        setAgentName('');
        }, 3000);
    };

    // .............................

    const [stagedLoading, setStagedLoading] = useState<boolean>(false);
    const [stagedSuccess, setStagedSuccess] = useState<boolean>(false);
    const [stagedError, setStagedError] = useState<string | null>(null);
    const [targetSubstructure, setTargetSubstructure] = useState({
    name: "Target Substructure",
    weight: 0.8,
    smarts: "",
    useChirality: false
    });
    
    // State for molecular weight scorer
    const [molecularWeight, setMolecularWeight] = useState({
    name: "Molecular Weight",
    weight: 0.5,
    low: 200,
    high: 500
    });

    // State for custom alert scorer
    const [customAlert, setCustomAlert] = useState({
    name: "Custom Alerts",
    weight: 0.7,
    file: null as File | null,
    smarts: [] as string[]
    });

    // Handle scorer toggle
    const handleScorerToggle = (scorerId: string) => {
    if (selectedScorers.includes(scorerId)) {
        setSelectedScorers(selectedScorers.filter(id => id !== scorerId));
    } else {
        setSelectedScorers([...selectedScorers, scorerId]);
    }
    };
    const handleTargetSubstructureChange = (field: string, value: any) => {
    setTargetSubstructure(prev => ({
        ...prev,
        [field]: value
    }));
    };
    // Handle molecular weight changes
    const handleMolecularWeightChange = (field: string, value: any) => {
    setMolecularWeight(prev => ({
        ...prev,
        [field]: value
    }));
    };

    // Handle custom alert file upload
    const handleCustomAlertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
        // Read file content
        const text = await file.text();
        const smarts = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#'))
        .filter(line => line);
        
        setCustomAlert(prev => ({
        ...prev,
        file,
        smarts
        }));
        
    } catch (error) {
        setStagedError('Failed to process SMARTS file');
        console.error('File processing error:', error);
    }
    };

    // Handle staged learning submission
    const handleStartStagedLearning = async () => {
    if (selectedScorers.length === 0) {
        setStagedError('Please select at least one scorer');
        return;
    }
        setStagedLoading(true);
        setStagedError(null);
        
         const payload = {
            agent_id: Number(id),
            max_score: maxScore,
            min_steps: minSteps,
            max_steps: maxSteps,
            use_custom_alerts: selectedScorers.includes('customAlert'),
            use_molecular_weights: selectedScorers.includes('molecularWeight'),
            target_substruct: selectedScorers.includes('targetSubstructure'),
            substruct_smarts: targetSubstructure.smarts,
            use_chirality: targetSubstructure.useChirality,
            matching_weight: targetSubstructure.weight,
            smarts_weight: customAlert.weight,
            banned_smarts: customAlert.smarts,
            mw_weight: molecularWeight.weight,
            mw_low: molecularWeight.low,
            mw_high: molecularWeight.high
        };
        
        const response = await axios.post(`${baseURL}run/stage`, payload);
        
        setStagedSuccess(true);
        setTimeout(() => setStagedSuccess(false), 3000);
    };

    // ............................... 
    // Add to your existing state declarations
const [molecules, setMolecules] = useState<Molecule[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [searchTerm, setSearchTerm] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;

// Fetch molecules from API
const fetchMolecules = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await axios.get(`${baseURL}run/${id}/molecules`);
    setMolecules(response.data);
  } catch (err) {
    setError("Failed to load molecules. Please try again.");
    console.error("Error fetching molecules:", err);
  } finally {
    setIsLoading(false);
  }
}, [id, baseURL]);

useEffect(() => {
  if (activeTab === "View Molecules") {
    fetchMolecules();
  }
}, [activeTab, fetchMolecules]);

// Filter molecules based on search term
const filteredMolecules = useMemo(() => {
  if (!searchTerm) return molecules;
  
  return molecules.filter(mol => 
    mol.SMILES.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mol.id.toString().includes(searchTerm) ||
    mol.score.toString().includes(searchTerm)
  );
}, [molecules, searchTerm]);

// Pagination logic
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentMolecules = filteredMolecules.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(filteredMolecules.length / itemsPerPage);

// Export to CSV function
const handleExportCSV = () => {
  if (filteredMolecules.length === 0) return;
  
  const headers = ["ID", "SMILES", "Score"];
  const csvContent = [
    headers.join(","),
    ...filteredMolecules.map(mol => 
      `${mol.id},"${mol.SMILES}",${mol.score}`
    )
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `molecules-run-${id}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



    const tabs = [
        "Sample Molecules",
        "Transfer Learning",
        "Staged Learning",
        "View Molecules",
    ];

    const viewMolecules = [
  { id: 1, SMILES: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C", score: 0.9234 },
  { id: 2, SMILES: "C1=CC=C(C=C1)C=O", score: 0.8452 },
];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] to-[#1f1f1f] text-white px-8 py-10 font-sans">
            <div className="max-w-7xl mx-auto space-y-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-cyan-400">
                        Run: {localStorage.getItem("title")|| "..."}
                    </h1>
                    <span className="text-sm text-white/70">
                        Created: {localStorage.getItem("date") || "..."}
                    </span>
                </div>

                <div className="flex space-x-2 mb-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border
                ${activeTab === tab
                                    ? "bg-cyan-500 text-black border-cyan-400"
                                    : "bg-black/20 text-white border-white/10 hover:bg-white/10"}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === "Sample Molecules" && (
                    <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10">
                        <div className="flex justify-between mb-4">
                        <h2 className="text-lg font-semibold text-cyan-300">
                            Sample Molecules
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center">
                            <label className="mr-2 text-sm text-white/80">Samples:</label>
                            <input
                                type="number"
                                value={numSamples}
                                onChange={(e) => setNumSamples(Math.max(1, Number(e.target.value)))}
                                className="w-16 bg-black/30 border border-white/20 rounded px-2 py-1 text-white text-center"
                                min="1"
                            />
                            </div>
                            <button 
                            onClick={handleSample}
                            className={`bg-cyan-600 hover:bg-cyan-700 transition text-white px-4 py-2 rounded-md flex items-center
                                ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            disabled={isDownloading}
                            >
                            {isDownloading ? (
                                <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Downloading...
                                </>
                            ) : (
                                'Sample & Download'
                            )}
                            </button>
                        </div>
                        </div>
                        
                        <div className="text-sm text-white/70 mt-4">
                        <p>Click "Sample & Download" to generate and download a CSV file with {numSamples} molecules.</p>
                        {downloadMessage && (
                            <div className={`mt-2 p-2 rounded-md ${downloadMessage.success ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                            {downloadMessage.text}
                            </div>
                        )}
                        </div>
                    </div>
                    )}

                {activeTab === "Transfer Learning" && (
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10">
                    <h2 className="text-xl font-bold text-cyan-300 mb-6">Transfer Learning Configuration</h2>
                    
                    {/* Status Messages */}
                    {transferError && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
                        <div className="flex items-center text-red-300">
                        <InformationCircleIcon className="w-5 h-5 mr-2" />
                        <span>{transferError}</span>
                        </div>
                    </div>
                    )}
                    
                    {transferSuccess && (
                    <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
                        <div className="flex items-center text-green-300">
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        <span>Transfer learning started successfully! New agent is being trained.</span>
                        </div>
                    </div>
                    )}
                    
                    {/* Agent Name Input */}
                    <div className="mb-8">
                    <label className="block text-sm text-white/80 mb-2">Agent Name</label>
                    <input
                        type="text"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Enter a name for your new agent"
                    />
                    <p className="mt-1 text-xs text-white/50">
                        This will be the name of your new fine-tuned agent
                    </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Epochs Section */}
                    <div>
                        <label className="block text-sm text-white/80 mb-2">Epochs</label>
                        <div className="relative">
                        <input
                            type="number"
                            value={epochs}
                            onChange={(e) => setEpochs(parseInt(e.target.value || '1'))}
                            className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            min="1"
                            max="1000"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-white/50">iterations</span>
                        </div>
                        </div>
                        <div className="mt-2">
                        <input
                            type="range"
                            min="1"
                            max="500"
                            value={epochs}
                            onChange={(e) => setEpochs(parseInt(e.target.value))}
                            className="w-full accent-cyan-500"
                        />
                        <div className="flex justify-between text-xs text-white/60 px-1">
                            <span>1</span>
                            <span>100</span>
                            <span>200</span>
                            <span>300</span>
                            <span>400</span>
                            <span>500</span>
                        </div>
                        </div>
                    </div>
                    
                    {/* Batch Size Section */}
                    <div>
                        <label className="block text-sm text-white/80 mb-2">Batch Size</label>
                        <div className="relative">
                        <input
                            type="number"
                            value={batchSize}
                            onChange={(e) => setBatchSize(parseInt(e.target.value || '8'))}
                            className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            min="1"
                            max="512"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-white/50">molecules</span>
                        </div>
                        </div>
                        <div className="mt-2">
                        <input
                            type="range"
                            min="8"
                            max="512"
                            value={batchSize}
                            onChange={(e) => setBatchSize(parseInt(e.target.value))}
                            className="w-full accent-cyan-500"
                        />
                        <div className="flex justify-between text-xs text-white/60 px-1">
                            <span>8</span>
                            <span>128</span>
                            <span>256</span>
                            <span>384</span>
                            <span>512</span>
                        </div>
                        </div>
                    </div>
                    </div>
                    
                    {/* File Upload Section */}
                    <div className="mb-8">
                    <label className="block text-sm text-white/80 mb-2">SMILES Dataset</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                        <label className="cursor-pointer">
                            <div className={`bg-black/30 border rounded-lg p-6 text-center transition-all
                            ${smilesFile 
                                ? "border-green-500/50 bg-green-500/10" 
                                : "border-dashed border-white/20 hover:bg-white/5"}`}
                            >
                            {smilesFile ? (
                                <div className="text-green-400">
                                <DocumentTextIcon className="w-10 h-10 mx-auto" />
                                <p className="mt-3 font-medium truncate">{smilesFile.name}</p>
                                <p className="text-sm text-white/60 mt-1">
                                    {(smilesFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <p className="text-xs bg-black/30 rounded-full px-3 py-1 mt-3 inline-block">
                                    Ready for transfer learning
                                </p>
                                </div>
                            ) : (
                                <div className="text-white/70">
                                <CloudArrowUpIcon className="w-10 h-10 mx-auto" />
                                <p className="mt-3 font-medium">Upload SMILES Dataset</p>
                                <p className="text-sm mt-1">Drag & drop or click to browse</p>
                                <p className="text-xs text-white/50 mt-3">Supports .csv, .txt, .smi</p>
                                </div>
                            )}
                            <input
                                type="file"
                                className="hidden"
                                accept=".csv,.txt,.smi"
                                onChange={handleSmilesUpload}
                            />
                            </div>
                        </label>
                        </div>
                        
                        <div className="sm:w-1/3 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-lg border border-white/10 p-4">
                        <div className="flex items-start gap-2">
                            <InformationCircleIcon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-white/80">
                            <p className="font-medium text-white mb-1">Dataset Requirements</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>File should contain one SMILES per line</li>
                                <li>CSV files should have SMILES in first column</li>
                                <li>Maximum file size: 100MB</li>
                                <li>Recommended: 10k-1M molecules</li>
                            </ul>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                    
                    {/* Submit Section */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                        <CheckCircleIcon className={`w-5 h-5 ${smilesFile ? "text-green-500" : "text-gray-500"}`} />
                        <span>
                        {smilesFile 
                            ? "Dataset ready for processing" 
                            : "Upload dataset to enable transfer learning"}
                        </span>
                    </div>
                    
                    <button 
                        onClick={handleTransferLearning}
                        disabled={!smilesFile || transferLoading}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                        ${!smilesFile || transferLoading
                            ? "bg-gray-700 text-white/50 cursor-not-allowed"
                            : "bg-gradient-to-r from-cyan-600 to-green-600 hover:from-cyan-500 hover:to-green-500 text-white"}`}
                    >
                        {transferLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Training...
                        </>
                        ) : (
                        <>
                            <ArrowPathIcon className="w-5 h-5" />
                            Start Transfer Learning
                        </>
                        )}
                    </button>
                    </div>
                </div>
                )}

                {activeTab === "Staged Learning" && (
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10">
                    <h2 className="text-xl font-bold text-cyan-300 mb-6">Staged Learning Configuration</h2>
                    
                    {/* Status Messages */}
                    {stagedError && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
                        <div className="flex items-center text-red-300">
                        <InformationCircleIcon className="w-5 h-5 mr-2" />
                        <span>{stagedError}</span>
                        </div>
                    </div>
                    )}
                    
                    {stagedSuccess && (
                    <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
                        <div className="flex items-center text-green-300">
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        <span>Staged learning started successfully!</span>
                        </div>
                    </div>
                    )}
                    
                    {/* Top-level parameters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-black/20 p-4 rounded-xl border border-white/10">
                    <div>
                        <label className="block text-sm text-white/80 mb-1">Max Score</label>
                        <input
                        type="number"
                        value={maxScore}
                        onChange={(e) => setMaxScore(parseFloat(e.target.value))}
                        className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        min="0"
                        step="0.1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white/80 mb-1">Min Steps</label>
                        <input
                        type="number"
                        value={minSteps}
                        onChange={(e) => setMinSteps(parseInt(e.target.value))}
                        className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        min="1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white/80 mb-1">Max Steps</label>
                        <input
                        type="number"
                        value={maxSteps}
                        onChange={(e) => setMaxSteps(parseInt(e.target.value))}
                        className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        min="1"
                        />
                    </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Molecular Weight Scorer */}
                        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl border border-white/10 p-5 relative">
                            <div className="absolute top-3 left-3">
                            <input
                                type="checkbox"
                                checked={selectedScorers.includes('molecularWeight')}
                                onChange={() => handleScorerToggle('molecularWeight')}
                                className="h-5 w-5 rounded-full bg-black/50 border border-cyan-400 checked:bg-cyan-500 focus:ring-0"
                            />
                            </div>
                            
                            <div className="ml-8">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                                Molecular Weight Scorer
                                </h3>
                                <span className="px-2 py-1 bg-cyan-900/30 text-cyan-300 rounded-full text-xs">
                                Penalty
                                </span>
                            </div>
                            
                            <div className="mb-3">
                                <label className="block text-sm text-white/80 mb-1">Scorer Name</label>
                                <input
                                type="text"
                                value={molecularWeight.name}
                                onChange={(e) => handleMolecularWeightChange('name', e.target.value)}
                                className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                placeholder="Enter name"
                                />
                            </div>
                            
                            {selectedScorers.includes('molecularWeight') && (
                                <div className="space-y-4 mt-2">
                                <div>
                                    <label className="block text-sm text-white/80 mb-1">Weight Importance</label>
                                    <div className="relative">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={molecularWeight.weight}
                                        onChange={(e) => handleMolecularWeightChange('weight', parseFloat(e.target.value))}
                                        className="w-full accent-cyan-500"
                                    />
                                    <span className="absolute right-0 top-0 bg-cyan-500 text-black text-xs font-bold px-2 py-0.5 rounded">
                                        {molecularWeight.weight.toFixed(2)}
                                    </span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                    <label className="block text-sm text-white/80 mb-1">Min Weight</label>
                                    <input
                                        type="number"
                                        value={molecularWeight.low}
                                        onChange={(e) => handleMolecularWeightChange('low', parseInt(e.target.value))}
                                        className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                    />
                                    </div>
                                    
                                    <div>
                                    <label className="block text-sm text-white/80 mb-1">Max Weight</label>
                                    <input
                                        type="number"
                                        value={molecularWeight.high}
                                        onChange={(e) => handleMolecularWeightChange('high', parseInt(e.target.value))}
                                        className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                    />
                                    </div>
                                </div>
                                </div>
                            )}
                            </div>
                        </div>

                        {/* Custom Alert Scorer */}
                        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl border border-white/10 p-5 relative">
                            <div className="absolute top-3 left-3">
                            <input
                                type="checkbox"
                                checked={selectedScorers.includes('customAlert')}
                                onChange={() => handleScorerToggle('customAlert')}
                                className="h-5 w-5 rounded-full bg-black/50 border border-cyan-400 checked:bg-cyan-500 focus:ring-0"
                            />
                            </div>
                            
                            <div className="ml-8">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                                Custom Alert Scorer
                                </h3>
                                <span className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs">
                                Custom
                                </span>
                            </div>
                            
                            <div className="mb-3">
                                <label className="block text-sm text-white/80 mb-1">Scorer Name</label>
                                <input
                                type="text"
                                value={customAlert.name}
                                onChange={(e) => setCustomAlert(prev => ({...prev, name: e.target.value}))}
                                className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                placeholder="Enter name"
                                />
                            </div>
                            
                            {selectedScorers.includes('customAlert') && (
                                <div className="space-y-4 mt-2">
                                <div>
                                    <label className="block text-sm text-white/80 mb-1">Weight Importance</label>
                                    <div className="relative">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={customAlert.weight}
                                        onChange={(e) => setCustomAlert(prev => ({...prev, weight: parseFloat(e.target.value)}))}
                                        className="w-full accent-purple-500"
                                    />
                                    <span className="absolute right-0 top-0 bg-purple-500 text-black text-xs font-bold px-2 py-0.5 rounded">
                                        {customAlert.weight.toFixed(2)}
                                    </span>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm text-white/80 mb-1">Alert File</label>
                                    <div className="flex items-center gap-3">
                                    <label className="flex-1 cursor-pointer">
                                        <div className={`bg-black/30 border rounded-lg py-8 text-center transition-colors
                                        ${customAlert.file 
                                            ? "border-green-500/50 bg-green-500/10" 
                                            : "border-dashed border-white/20 hover:bg-white/5"}`}
                                        >
                                        {customAlert.file ? (
                                            <div className="text-green-400">
                                            <DocumentIcon className="w-8 h-8 mx-auto" />
                                            <p className="mt-2 truncate px-4">{customAlert.file.name}</p>
                                            <p className="text-xs text-white/60 mt-1">
                                                {(customAlert.file.size / 1024).toFixed(1)} KB
                                            </p>
                                            <p className="text-xs mt-2">
                                                Contains {customAlert.smarts.length} SMARTS patterns
                                            </p>
                                            </div>
                                        ) : (
                                            <div className="text-white/60">
                                            <CloudArrowUpIcon className="w-8 h-8 mx-auto" />
                                            <p className="mt-2">Click to upload</p>
                                            <p className="text-xs mt-1">.CSV or .TXT files</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".csv,.txt"
                                            onChange={handleCustomAlertUpload}
                                        />
                                        </div>
                                    </label>
                                    </div>
                                </div>
                                
                                {customAlert.smarts.length > 0 && (
                                    <div className="mt-3 text-sm text-white/70">
                                    <p className="font-medium">SMARTS Patterns:</p>
                                    <div className="max-h-32 overflow-y-auto mt-2 bg-black/20 p-2 rounded">
                                        {customAlert.smarts.slice(0, 20).map((smart, index) => (
                                        <div key={index} className="font-mono text-xs py-1 border-b border-white/10 last:border-0">
                                            {smart}
                                        </div>
                                        ))}
                                        {customAlert.smarts.length > 20 && (
                                        <p className="text-xs text-center mt-2">
                                            + {customAlert.smarts.length - 20} more patterns
                                        </p>
                                        )}
                                    </div>
                                    </div>
                                )}
                                </div>
                            )}
                            </div>
                        </div>
                        
                        {/* Target Substructure Scorer */}
                        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl border border-white/10 p-5 relative">
                        <div className="absolute top-3 left-3">
                        <input
                            type="checkbox"
                            checked={selectedScorers.includes('targetSubstructure')}
                            onChange={() => handleScorerToggle('targetSubstructure')}
                            className="h-5 w-5 rounded-full bg-black/50 border border-amber-400 checked:bg-amber-500 focus:ring-0"
                        />
                        </div>
                        
                        <div className="ml-8">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                            Target Substructure
                            </h3>
                            <span className="px-2 py-1 bg-amber-900/30 text-amber-300 rounded-full text-xs">
                            Reward
                            </span>
                        </div>
                        
                        <div className="mb-3">
                            <label className="block text-sm text-white/80 mb-1">Scorer Name</label>
                            <input
                            type="text"
                            value={targetSubstructure.name}
                            onChange={(e) => handleTargetSubstructureChange('name', e.target.value)}
                            className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                            placeholder="Enter name"
                            />
                        </div>
                        
                        {selectedScorers.includes('targetSubstructure') && (
                            <div className="space-y-4 mt-2">
                            <div>
                                <label className="block text-sm text-white/80 mb-1">Weight Importance</label>
                                <div className="relative">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={targetSubstructure.weight}
                                    onChange={(e) => handleTargetSubstructureChange('weight', parseFloat(e.target.value))}
                                    className="w-full accent-amber-500"
                                />
                                <span className="absolute right-0 top-0 bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded">
                                    {targetSubstructure.weight.toFixed(2)}
                                </span>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-white/80 mb-1">SMARTS Pattern</label>
                                <input
                                type="text"
                                value={targetSubstructure.smarts}
                                onChange={(e) => handleTargetSubstructureChange('smarts', e.target.value)}
                                className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                placeholder="Enter SMARTS pattern"
                                />
                                <p className="mt-1 text-xs text-white/50">
                                Example: c1ccccc1 for benzene ring
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={targetSubstructure.useChirality}
                                    onChange={(e) => handleTargetSubstructureChange('useChirality', e.target.checked)}
                                    className="h-4 w-4 rounded bg-black/30 border border-amber-400 checked:bg-amber-500 focus:ring-0"
                                />
                                <span className="text-sm text-white/80">Use Chirality</span>
                                </label>
                                
                                <div className="flex items-center gap-1 text-xs bg-black/30 px-2 py-1 rounded text-amber-300">
                                <InformationCircleIcon className="w-4 h-4" />
                                <span>Enable for chiral matching</span>
                                </div>
                            </div>
                            
                            {targetSubstructure.smarts && (
                                <div className="mt-3 bg-black/20 p-3 rounded-lg">
                                <p className="text-sm text-white/80 mb-1">SMARTS Preview:</p>
                                <div className="font-mono text-xs p-2 bg-black/30 rounded">
                                    {targetSubstructure.smarts}
                                </div>
                                <p className="text-xs text-amber-300 mt-1">
                                    {targetSubstructure.useChirality 
                                    ? "Chiral matching enabled" 
                                    : "Chiral matching disabled"}
                                </p>
                                </div>
                            )}
                            </div>
                        )}
                        </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-8">
                    <button 
                        onClick={handleStartStagedLearning}
                        disabled={selectedScorers.length === 0 || stagedLoading}
                        className={`bg-gradient-to-r from-cyan-600 to-purple-600 px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 transform hover:scale-[1.02] 
                        ${selectedScorers.length === 0 || stagedLoading 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:from-cyan-500 hover:to-purple-500'}`}
                    >
                        {stagedLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Starting Staged Learning...
                        </>
                        ) : (
                        'Start Staged Learning'
                        )}
                    </button>
                    </div>
                </div>
                )}
                {activeTab === "View Molecules" && (
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10">
                    <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-cyan-300">Molecules Explorer</h2>
                    <div className="flex gap-3">
                        <div className="relative">
                        <input
                            type="text"
                            placeholder="Search molecules..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black/30 border border-white/20 rounded-full px-4 py-2 text-white pl-10 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-64"
                        />
                        <svg 
                            className="w-5 h-5 text-white/50 absolute left-3 top-2.5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        </div>
                        <button 
                        onClick={handleExportCSV}
                        className="bg-cyan-600 hover:bg-cyan-700 transition text-white px-4 py-2 rounded-md flex items-center gap-2"
                        >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export CSV
                        </button>
                    </div>
                    </div>
                    
                    {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                    </div>
                    ) : error ? (
                    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-center">
                        <p className="text-red-300">Error loading molecules: {error}</p>
                        <button 
                        onClick={fetchMolecules}
                        className="mt-3 px-4 py-2 bg-red-700 hover:bg-red-600 rounded-md text-white"
                        >
                        Retry
                        </button>
                    </div>
                    ) : (
                    <>
                        <div className="bg-black/20 rounded-xl border border-white/10 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30">
                            <tr>
                                <th className="py-3 px-4 text-left text-cyan-300 font-medium">ID</th>
                                <th className="py-3 px-4 text-left text-cyan-300 font-medium">SMILES</th>
                                <th className="py-3 px-4 text-left text-cyan-300 font-medium">Score</th>
                                <th className="py-3 px-4 text-left text-cyan-300 font-medium">Visualize</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                            {currentMolecules.map((mol) => (
                                <tr 
                                key={mol.id} 
                                className="hover:bg-white/5 transition-colors group"
                                >
                                <td className="py-3 px-4 font-mono text-cyan-400/90">{mol.id}</td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center justify-between">
                                    <span className="font-mono">{mol.SMILES}</span>
                                    <button 
                                        className="text-xs text-white/50 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => navigator.clipboard.writeText(mol.SMILES)}
                                    >
                                        Copy
                                    </button>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                    <div className="w-16 bg-gray-700 rounded-full h-2">
                                        <div 
                                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500" 
                                        style={{ width: `${mol.score * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className={mol.score > 0.7 ? "text-green-400" : mol.score > 0.4 ? "text-yellow-400" : "text-red-400"}>
                                        {mol.score.toFixed(4)}
                                    </span>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <Link
                                    className="text-sm bg-white/10 hover:bg-cyan-600 transition-colors px-3 py-1 rounded-md"
                                    href={`/runs/${id}/molecules/${mol.id}`}>
                                        View 3D
                                    </Link>
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        
                        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-black/20">
                            <div className="text-sm text-white/70">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredMolecules.length)} of {filteredMolecules.length} molecules
                            </div>
                            <div className="flex gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded-md bg-black/30 border border-white/10 hover:bg-white/10 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 rounded-md ${
                                    currentPage === page 
                                    ? "bg-cyan-600 text-white" 
                                    : "bg-black/30 border border-white/10 hover:bg-white/10"
                                }`}
                                >
                                {page}
                                </button>
                            ))}
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded-md bg-black/30 border border-white/10 hover:bg-white/10 disabled:opacity-50"
                            >
                                Next
                            </button>
                            </div>
                        </div>
                        </div>
                    </>
                    )}
                </div>
                )}
            </div>
        </div>
    );
}
