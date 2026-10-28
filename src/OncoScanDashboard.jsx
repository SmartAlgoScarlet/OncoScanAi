import React, { useState } from 'react';

export default function OncoScanDashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [symptoms, setSymptoms] = useState({
    duration: '1 to 6 months',
    physicalChanges: 'Unsure',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert('Please upload a diagnostic scan image first.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('symptoms', JSON.stringify(symptoms));

      const response = await fetch('https://oncoscanai.onrender.com/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Inference error:', error);
      alert(`Error connecting to backend: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0d14', color: '#fff', padding: '2rem', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, color: '#38bdf8' }}>OncoScan AI</h1>
        <p style={{ color: '#94a3b8' }}>Multi-Modal Early Screening & Visual Segmentation</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Input Panel */}
        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px' }}>
          <h2>1. Upload Diagnostic Scan</h2>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginBottom: '1rem', color: '#cbd5e1' }} />
          {previewUrl && (
            <div style={{ marginBottom: '1.5rem' }}>
              <img src={previewUrl} alt="Scan Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
            </div>
          )}

          <h2>2. Clinical Observations</h2>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Duration of lesion / anomaly:</label>
          <select
            value={symptoms.duration}
            onChange={(e) => setSymptoms({ ...symptoms, duration: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px' }}
          >
            <option value="Under 1 month">Under 1 month</option>
            <option value="1 to 6 months">1 to 6 months</option>
            <option value="Over 6 months">Over 6 months</option>
          </select>

          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Noticeable physical changes?</label>
          <select
            value={symptoms.physicalChanges}
            onChange={(e) => setSymptoms({ ...symptoms, physicalChanges: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '1.5rem', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px' }}
          >
            <option value="Yes (growing/changing shape)">Yes (growing/changing shape)</option>
            <option value="Unsure">Unsure</option>
            <option value="No changes">No changes</option>
          </select>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', backgroundColor: loading ? '#64748b' : '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Running Grad-CAM Inference...' : 'Run Analysis'}
          </button>
        </div>

        {/* Results Panel */}
        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '12px' }}>
          <h2>Diagnostic Segmentation Results</h2>
          {result ? (
            <div>
              <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <p><strong>Malignancy Risk Score:</strong> <span style={{ color: '#f43f5e', fontSize: '1.25rem' }}>{result.riskScore}%</span></p>
                <p><strong>Status:</strong> {result.status}</p>
                <p><strong>Recommendation:</strong> {result.recommendation}</p>
              </div>
            </div>
          ) : (
            <p style={{ color: '#64748b' }}>Upload a scan image on the left to activate the visualization and risk assessment.</p>
          )}
        </div>
      </div>
    </div>
  );
}