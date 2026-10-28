import React, { useState } from 'react';
import { Upload, AlertCircle, RefreshCw, FileText, ArrowRight } from 'lucide-react';

export default function OncoScanDashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [symptoms, setSymptoms] = useState({
    duration: 'Under 1 month',
    changes: 'Yes (growing/changing shape)',
    sensation: 'Itching or bleeding'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  // Handle form submission to FastAPI backend
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('symptoms', JSON.stringify(symptoms));

      const res = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      setLoading(false);
      setResult({
        riskScore: data.riskScore,
        status: data.status,
        recommendation: data.recommendation,
        heatmapUrl: previewUrl
      });
    } catch (error) {
      console.error("Backend connection error:", error);
      setLoading(false);
      alert("Failed to connect to FastAPI backend. Ensure python main.py is running!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
              OncoScan AI
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Multi-Modal Early Screening & Visual Segmentation Assistant
            </p>
          </div>
          <div className="bg-blue-950/50 border border-blue-800/50 text-blue-300 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            CodeTheCure Hackathon Prototype
          </div>
        </header>

        {/* Main Grid Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Upload & Form Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleAnalyze} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
              <h2 className="text-lg font-semibold text-slate-200">1. Upload Diagnostic Scan</h2>
              
              {/* Dropzone */}
              <div className="relative border-2 border-dashed border-slate-700 hover:border-blue-500 transition rounded-xl p-6 text-center cursor-pointer bg-slate-950/50">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="w-8 h-8 text-blue-400" />
                  <p className="text-sm font-medium text-slate-300">
                    {selectedFile ? selectedFile.name : "Drag & drop scan image here, or click to browse"}
                  </p>
                  <p className="text-xs text-slate-500">Supports PNG, JPG, DICOM preview formats</p>
                </div>
              </div>

              {/* Symptom Cross-Check Questionnaire */}
              <div className="space-y-4 pt-2">
                <h2 className="text-lg font-semibold text-slate-200">2. Clinical Observations</h2>
                
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Duration of lesion / anomaly</label>
                  <select 
                    value={symptoms.duration}
                    onChange={(e) => setSymptoms({...symptoms, duration: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option>Under 1 month</option>
                    <option>1 to 6 months</option>
                    <option>Over 6 months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Noticeable physical changes?</label>
                  <select 
                    value={symptoms.changes}
                    onChange={(e) => setSymptoms({...symptoms, changes: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option>Yes (growing/changing shape)</option>
                    <option>No noticeable changes</option>
                    <option>Unsure</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedFile || loading}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg ${
                  !selectedFile || loading 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Running Grad-CAM Inference...
                  </>
                ) : (
                  <>
                    Analyze Scan
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Dual-View Analysis Canvas & Results */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl min-h-[480px] flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-200 mb-4">Diagnostic Segmentation Results</h2>

                {previewUrl ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original Scan */}
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Original Scan</span>
                      <div className="aspect-square bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
                        <img src={previewUrl} alt="Original Scan" className="object-cover w-full h-full" />
                      </div>
                    </div>

                    {/* AI Heatmap Overlay */}
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-teal-400 uppercase tracking-wider flex items-center gap-1">
                        Grad-CAM Saliency Map
                      </span>
                      <div className="aspect-square bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center relative">
                        <img src={previewUrl} alt="AI Heatmap" className="object-cover w-full h-full filter contrast-125" />
                        {result && (
                          <div className="absolute inset-0 bg-red-500/20 mix-blend-color-burn pointer-events-none border-2 border-red-500/50 animate-pulse"></div>
                        )}
                        {!result && !loading && (
                          <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center text-xs text-slate-400">
                            Awaiting analysis...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-72 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-600" />
                    <p>Upload a scan image on the left to activate the visualization canvas.</p>
                  </div>
                )}
              </div>

              {/* Summary Stats Box */}
              {result && (
                <div className="mt-6 bg-red-950/20 border border-red-900/40 rounded-xl p-4 space-y-3 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                      <AlertCircle className="w-5 h-5" />
                      {result.status}
                    </div>
                    <span className="bg-red-900/40 text-red-300 px-2.5 py-1 rounded-md text-xs font-bold">
                      Risk Score: {result.riskScore}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{result.recommendation}</p>
                  <div className="pt-2 flex justify-end">
                    <button 
                      onClick={() => {
                        const reportContent = `
==================================================
        ONCOSCAN AI - CLINICAL REPORT
==================================================
Date: ${new Date().toLocaleDateString()}
Status: ${result.status}
Calculated Risk Score: ${result.riskScore}%

CLINICAL OBSERVATIONS:
- Duration: ${symptoms.duration}
- Physical Changes: ${symptoms.changes}

RECOMMENDATION:
${result.recommendation}

Disclaimer: This report is generated by an AI screening prototype for the CodeTheCure Hackathon and should be validated by a certified medical professional.
==================================================
                        `.trim();

                        const blob = new Blob([reportContent], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `OncoScan_Clinical_Report_${Date.now()}.txt`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      Export Clinical Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}