import { FC, useRef } from "react";

/**
 * Debug component that tracks and displays render count.
 * Remove before production.
 */
export const RenderCounter: FC<{ label: string }> = ({ label }) => {
    const renderCount = useRef(0);
    renderCount.current += 1;
  
    console.log(`[${label}] Rendered ${renderCount.current} times`);
  
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '80px',
          padding: '12px 16px',
          border: '2px solid #0066cc',
          borderRadius: '8px',
          backgroundColor: renderCount.current > 1 ? '#ffe6e6' : '#e6ffe6',
          zIndex: 9999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: '14px',
        }}
      >
        <strong>{label}</strong>
        <div>
          Render count: <strong style={{ fontSize: '20px' }}>{renderCount.current}</strong>
          {renderCount.current > 1 ? (
            <span style={{ color: 'red', marginLeft: '8px' }}>⚠️</span>
          ) : (
            <span style={{ color: 'green', marginLeft: '8px' }}>✓</span>
          )}
        </div>
      </div>
    );
  };