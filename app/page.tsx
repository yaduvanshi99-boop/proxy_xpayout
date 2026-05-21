'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top left, #111827, #030712)',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '720px',
        width: '100%',
        backgroundColor: 'rgba(17, 24, 39, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '40px',
        boxSizing: 'border-box',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 800,
              background: 'linear-gradient(to right, #6366f1, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}>
              XPayout Callback Proxy
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#9ca3af', fontSize: '14px' }}>
              High-performance callback normalization & safety forwarder
            </p>
          </div>
          <div>
            {loading ? (
              <span style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>
                Checking...
              </span>
            ) : health?.ok ? (
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                ONLINE
              </span>
            ) : (
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
                OFFLINE
              </span>
            )}
          </div>
        </div>

        {/* Info Blocks */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Target URL Status</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#e5e7eb' }}>
              {loading ? '...' : health?.targetConfigured ? 'CONNECTED' : 'USING DEFAULT'}
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Security Shield</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#e5e7eb' }}>
              ACTIVE
            </div>
          </div>
        </div>

        {/* Integration Instructions */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f3f4f6', marginBottom: '16px' }}>Endpoint Configuration</h2>
          <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.5, margin: '0 0 16px 0' }}>
            Set your gateway callback target URL in XPayout to:
          </p>
          <div style={{
            backgroundColor: '#030712',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#818cf8',
            wordBreak: 'break-all'
          }}>
            <span>/api/callback</span>
          </div>
        </div>

        {/* Why this exists banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          borderRadius: '16px',
          padding: '24px',
          boxSizing: 'border-box'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 700, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✨ Status Normalization Guard Active
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af', lineHeight: '1.6' }}>
            Ensures that false-positive <code>"success"</code> messages do not bypass validation when actual transaction status remains <code>"processing"</code>. Prevents system timing differences from causing duplicate wallet credits or incorrect transaction updates.
          </p>
        </div>
      </div>

      <footer style={{ marginTop: '24px', fontSize: '12px', color: '#4b5563' }}>
        XPayout Callback Proxy Server &bull; Running on Vercel Edge
      </footer>
    </div>
  );
}
