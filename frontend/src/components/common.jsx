import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function Notice({ notice, onDismiss }) {
  if (!notice) return null;

  return (
    <div className={`notice ${notice.type}`}>
      {notice.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span>{notice.text}</span>
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  );
}

export function SectionTitle({ icon, title }) {
  return (
    <div className="section-title">
      {React.cloneElement(icon, { size: 20 })}
      <h2>{title}</h2>
    </div>
  );
}

export function Metric({ icon, label, value, onClick }) {
  const content = (
    <>
      {React.cloneElement(icon, { size: 22 })}
      <span>{label}</span>
      <strong>{value}</strong>
    </>
  );

  if (onClick) {
    return (
      <button className="metric metric-link" onClick={onClick} type="button">
        {content}
      </button>
    );
  }

  return (
    <div className="metric">
      {content}
    </div>
  );
}

export function Table({ headers, children }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
