import React, { useState, useRef } from 'react';
import './UploadPage.css';

export default function UploadPage({ onGenerate, loading, error }) {
  const [inspectionFile, setInspectionFile] = useState(null);
  const [thermalFile, setThermalFile] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000');
  const inspRef = useRef();
  const thermRef = useRef();

  const handleDrop = (setter) => (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') setter(file);
  };

  const canSubmit = inspectionFile && thermalFile && !loading;

  return (
    <div className="upload-root">
      <div className="upload-bg-pattern" aria-hidden="true">
        {Array.from({length: 20}).map((_, i) => (
          <div key={i} className="bg-line" style={{ '--i': i }} />
        ))}
      </div>

      <main className="upload-main">
        <header className="upload-header">
          <div className="logo-mark">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="var(--accent)" opacity="0.12"/>
              <path d="M8 26V12l10-4 10 4v14l-10 4L8 26z" stroke="var(--accent)" strokeWidth="1.8" fill="none"/>
              <path d="M18 8v20M8 16h20M8 22h20" stroke="var(--accent)" strokeWidth="1.2" opacity="0.5"/>
            </svg>
          </div>
          <h1 className="upload-title">DDR Generator</h1>
          <p className="upload-subtitle">
            Detailed Diagnostic Report — AI-powered property analysis
          </p>
        </header>

        <div className="upload-card">
          <div className="upload-card-inner">

            <div className="drop-zones">
              {/* Inspection Report */}
              <div
                className={`drop-zone ${inspectionFile ? 'has-file' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop(setInspectionFile)}
                onClick={() => inspRef.current.click()}
              >
                <input
                  type="file"
                  accept=".pdf"
                  ref={inspRef}
                  style={{ display: 'none' }}
                  onChange={(e) => setInspectionFile(e.target.files[0])}
                />
                <div className="drop-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                </div>
                <div className="drop-label">Inspection Report</div>
                <div className="drop-hint">
                  {inspectionFile ? (
                    <span className="file-name">✓ {inspectionFile.name}</span>
                  ) : (
                    'Drop PDF here or click to browse'
                  )}
                </div>
              </div>

              <div className="drop-divider">
                <span>+</span>
              </div>

              {/* Thermal Report */}
              <div
                className={`drop-zone thermal ${thermalFile ? 'has-file' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop(setThermalFile)}
                onClick={() => thermRef.current.click()}
              >
                <input
                  type="file"
                  accept=".pdf"
                  ref={thermRef}
                  style={{ display: 'none' }}
                  onChange={(e) => setThermalFile(e.target.files[0])}
                />
                <div className="drop-icon thermal-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
                  </svg>
                </div>
                <div className="drop-label">Thermal Report</div>
                <div className="drop-hint">
                  {thermalFile ? (
                    <span className="file-name">✓ {thermalFile.name}</span>
                  ) : (
                    'Drop PDF here or click to browse'
                  )}
                </div>
              </div>
            </div>

            <div className="config-fields">
              <div className="field-group">
                <label className="field-label">Gemini API Key</label>
                <input
                  type="password"
                  className="field-input"
                  placeholder="AIza..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <span className="field-hint">Or set GEMINI_API_KEY env variable on backend</span>
              </div>
              <div className="field-group">
                <label className="field-label">Backend URL</label>
                <input
                  type="text"
                  className="field-input"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="error-banner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button
              className={`generate-btn ${loading ? 'loading' : ''}`}
              disabled={!canSubmit}
              onClick={() => onGenerate({ inspectionFile, thermalFile, apiKey, backendUrl })}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Analyzing documents…
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  Generate DDR
                </>
              )}
            </button>

          </div>
        </div>

        <div className="upload-features">
          {[
            { icon: '🏗️', label: 'Area-wise Analysis', desc: 'Room-by-room breakdown' },
            { icon: '🌡️', label: 'Thermal Correlation', desc: 'Cross-referenced heat maps' },
            { icon: '⚠️', label: 'Severity Scoring', desc: 'Evidence-based assessment' },
            { icon: '📋', label: 'Action Plan', desc: 'Prioritized recommendations' },
          ].map(f => (
            <div className="feature-chip" key={f.label}>
              <span className="feature-icon">{f.icon}</span>
              <div>
                <div className="feature-label">{f.label}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
