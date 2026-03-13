import React, { useState } from 'react';
import UploadPage from './pages/UploadPage';
import ReportPage from './pages/ReportPage';
import './App.css';

export default function App() {
  const [ddrData, setDdrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async ({ inspectionFile, thermalFile, apiKey, backendUrl }) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('inspection_report', inspectionFile);
    formData.append('thermal_report', thermalFile);
    if (apiKey) formData.append('api_key', apiKey);

    try {
      const url = `${backendUrl}/generate-ddr`;
      const res = await fetch(url, { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.detail || data.error || 'Generation failed');
      }
      setDdrData(data.ddr);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDdrData(null);
    setError(null);
  };

  if (ddrData) {
    return <ReportPage ddr={ddrData} onReset={handleReset} />;
  }

  return (
    <UploadPage
      onGenerate={handleGenerate}
      loading={loading}
      error={error}
    />
  );
}
