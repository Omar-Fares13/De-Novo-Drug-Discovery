"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";


type Run = {
    id: number;
    title: string;
    creation_date: string;
    model?: {
        name: string;
    };
};

type Prior = {
    id: number;
    name: string;
};

type ScorerType = {
    id: number;
    title: string;
};

export default function RunsIndexPage() {
    const [runs, setRuns] = useState<Run[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [priors, setPriors] = useState<Prior[]>([]);
    
    const [modelName, setModelName] = useState("");
    const [selectedPriorId, setSelectedPriorId] = useState<number | null>(null);
    
    
    const router = useRouter() ; 

    useEffect(() => {
        const fetchData = async () => {
            try {
                const baseURL = process.env.NEXT_PUBLIC_API_URL;
                
                const [runsRes, priorsRes ] = await Promise.all([
                    axios.get(`${baseURL}runs`),
                    axios.get(`${baseURL}priors`),
                ]);

                setRuns(runsRes.data);
                setPriors(priorsRes.data);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchData();
    }, []);


    const handleCreateRun = async () => {
    try {
        const baseURL = process.env.NEXT_PUBLIC_API_URL;
        await axios.post(`${baseURL}runs/create`, {
            prior_id: selectedPriorId,
            model_name: modelName,
        });

        setShowModal(false);
        setModelName("");
        setSelectedPriorId(null);

        const runsRes = await axios.get(`${baseURL}runs`);
        setRuns(runsRes.data);
    } catch (err) {
        console.error("Error creating run:", err);
    }
};



    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] to-[#1f1f1f] text-white px-8 py-10 font-sans">
            <div className="max-w-6xl mx-auto space-y-10">
                <h1 className="text-3xl font-bold text-cyan-400 text-center drop-shadow">
                    De Novo
                </h1>

                <div className="flex justify-end">
                    <button
                        className="bg-cyan-600 hover:bg-cyan-700 transition px-5 py-2 rounded-md text-white shadow"
                        onClick={() => setShowModal(true)}
                    >
                        + Create Run
                    </button>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-md p-6 border border-white/10">
                    <h2 className="text-xl font-semibold text-cyan-300 mb-4">Runs List</h2>
                    <table className="w-full text-sm text-left border-separate border-spacing-y-2">
                        <thead className="text-cyan-400">
                            <tr>
                                <th>Run Title</th>
                                <th>Model Name</th>
                                <th>Created At</th>
                            </tr>
                        </thead>
                        <tbody className="text-white/90">
                            {runs.map((run) => (
                                <tr
                                    onClick={()=>{
                                        localStorage.setItem("title",run.title)
                                        localStorage.setItem("date",run.creation_date)
                                        router.push(`/runs/${run.id}`)
                                    }}
                                    key={run.id}
                                    className="bg-white/5 hover:bg-cyan-600/10 transition rounded-lg"
                                >
                                    <td className="py-2 px-3">{run.title}</td>
                                    <td className="py-2 px-3">{run.model?.name}</td>
                                    <td className="py-2 px-3">{new Date(run.creation_date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Create Run Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl w-full max-w-lg border border-cyan-400/30">
                            <h2 className="text-lg font-semibold text-cyan-300 mb-4">Create New Run</h2>
                            <select
                                className="w-full mb-3 bg-black/20 border border-cyan-300 rounded-md px-3 py-2 text-white"
                                value={selectedPriorId ?? ""}
                                onChange={(e) => setSelectedPriorId(Number(e.target.value))}
                            >
                                <option value="">Select Prior</option>
                                {priors.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>

                            <input
                                className="w-full mb-4 bg-black/20 border border-pink-300 rounded-md px-3 py-2 text-white"
                                placeholder="Model Name"
                                value={modelName}
                                onChange={(e) => setModelName(e.target.value)}
                            />

                            <div className="flex justify-end space-x-2">
                                <button
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md"
                                    onClick={handleCreateRun}
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
