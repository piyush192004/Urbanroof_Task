import React from 'react';

export default function ThermalCard({ data }) {
  if (!data) return null;
  const { image_ids = [], hotspot_temp, coldspot_temp, temperature_differential, interpretation } = data;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f1923 0%, #1a2d3e 100%)',
      borderRadius: '10px',
      padding: '16px 20px',
      color: 'white',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#63b3ed', textTransform: 'uppercase' }}>
          🌡️ Thermal Analysis
        </span>
      </div>

      {image_ids.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
          {image_ids.map(id => (
            <span key={id} style={{
              background: 'rgba(99, 179, 237, 0.15)',
              border: '1px solid rgba(99, 179, 237, 0.3)',
              color: '#90cdf4',
              padding: '2px 9px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 600,
              fontFamily: 'monospace',
            }}>{id}</span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {hotspot_temp && (
          <div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Hotspot</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fc8181' }}>{hotspot_temp}</div>
          </div>
        )}
        {coldspot_temp && (
          <div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Coldspot</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#90cdf4' }}>{coldspot_temp}</div>
          </div>
        )}
        {temperature_differential && (
          <div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Δ Temp</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f6e05e' }}>{temperature_differential}</div>
          </div>
        )}
      </div>

      {interpretation && (
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', margin: 0 }}>
          {interpretation}
        </p>
      )}
    </div>
  );
}
