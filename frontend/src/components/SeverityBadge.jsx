import React from 'react';

const config = {
  Critical:  { bg: 'var(--critical-bg)',  color: 'var(--critical)',  border: '#f5c6c2', dot: '#c0392b' },
  High:      { bg: 'var(--high-bg)',      color: 'var(--high)',      border: '#fcd9b6', dot: '#d35400' },
  Moderate:  { bg: 'var(--moderate-bg)',  color: 'var(--moderate)',  border: '#f9e79f', dot: '#b7860b' },
  Low:       { bg: 'var(--low-bg)',       color: 'var(--low)',       border: '#a9dfbf', dot: '#27ae60' },
};

export default function SeverityBadge({ level, large }) {
  const cfg = config[level] || config.Low;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: large ? '8px' : '5px',
      padding: large ? '8px 14px' : '3px 10px',
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
      borderRadius: '20px',
      fontSize: large ? '1rem' : '0.72rem',
      fontWeight: 700,
      letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: large ? 10 : 7,
        height: large ? 10 : 7,
        borderRadius: '50%',
        background: cfg.dot,
        flexShrink: 0,
      }}/>
      {level || 'N/A'}
    </span>
  );
}
