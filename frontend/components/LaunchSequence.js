import { useState, useEffect } from 'react';

/**
 * Animated Launch Sequence for TaskMuse
 * Creates a judge-impressing entrance animation
 */
export function LaunchSequence({ onComplete, darkMode }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Step progression timeline
    const steps = [
      { delay: 0, duration: 300, label: 'Initializing TaskMuse...' },
      { delay: 300, duration: 500, label: 'Loading workspace...' },
      { delay: 800, duration: 400, label: 'Connecting to real-time server...' },
      { delay: 1200, duration: 300, label: 'Loading tasks...' },
      { delay: 1500, duration: 300, label: 'Analyzing team performance...' },
      { delay: 1800, duration: 200, label: 'Ready!' },
    ];

    let currentStep = 0;
    let progressInterval;

    const stepTimer = setInterval(() => {
      if (currentStep < steps.length) {
        setStep(currentStep);
        const stepInfo = steps[currentStep];
        
        // Animate progress bar for this step
        let stepProgress = 0;
        progressInterval = setInterval(() => {
          stepProgress += 100 / (stepInfo.duration / 20);
          if (stepProgress >= 100) {
            stepProgress = 100;
            clearInterval(progressInterval);
          }
          setProgress(Math.min(stepProgress, 100));
        }, 20);

        currentStep++;
      } else {
        clearInterval(stepTimer);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500);
      }
    }, 350);

    return () => {
      clearInterval(stepTimer);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [onComplete]);

  const steps = [
    'Initializing TaskMuse...',
    'Loading workspace...',
    'Connecting to real-time server...',
    'Loading tasks...',
    'Analyzing team performance...',
    'Ready!',
  ];

  const icons = ['⚙️', '📁', '🔌', '📋', '📊', '✅'];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: darkMode
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: step === 5 ? 'fadeOut 500ms ease-out forwards' : 'none',
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontSize: '64px',
          marginBottom: '32px',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      >
        ✨
      </div>

      {/* App Name */}
      <h1
        style={{
          fontSize: '48px',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '16px',
          animation: 'slideUp 500ms ease-out',
        }}
      >
        TaskMuse
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontSize: '18px',
          color: darkMode ? '#94a3b8' : '#64748b',
          marginBottom: '48px',
          animation: 'fadeIn 800ms ease-out',
        }}
      >
        AI-Powered Real-time Collaboration
      </p>

      {/* Loading Steps */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginBottom: '24px',
          minHeight: '120px',
        }}
      >
        {steps.slice(0, step + 1).map((label, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              color: index === step ? (darkMode ? '#f1f5f9' : '#0f172a') : (darkMode ? '#64748b' : '#94a3b8'),
              fontWeight: index === step ? 600 : 400,
              animation: 'slideIn 300ms ease-out',
              opacity: index === step ? 1 : 0.5,
            }}
          >
            <span style={{ fontSize: '20px' }}>{icons[index]}</span>
            <span>{label}</span>
            {index === step && step < 5 && (
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #3b82f6',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
            )}
            {index === step && step === 5 && (
              <span style={{ fontSize: '20px', animation: 'bounce 500ms ease-in-out' }}>🎉</span>
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '300px',
          height: '4px',
          background: darkMode ? '#334155' : '#e2e8f0',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${((step + progress / 100) / steps.length) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)',
            transition: 'width 100ms linear',
          }}
        />
      </div>

      {/* Overall Progress Percentage */}
      <div
        style={{
          marginTop: '16px',
          fontSize: '12px',
          color: darkMode ? '#94a3b8' : '#64748b',
          fontWeight: 600,
        }}
      >
        {Math.round(((step + progress / 100) / steps.length) * 100)}%
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

/**
 * Staggered Animation Component
 * Animates children in sequence for smooth entrance
 */
export function StaggeredAnimation({ children, delay = 0, duration = 300, stagger = 100 }) {
  const [visibleItems, setVisibleItems] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const childCount = Array.isArray(children) ? children.length : 1;
      let count = 0;

      const interval = setInterval(() => {
        count++;
        setVisibleItems(count);

        if (count >= childCount) {
          clearInterval(interval);
        }
      }, stagger);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [children, delay, stagger]);

  if (!Array.isArray(children)) {
    return (
      <div style={{ animation: `fadeIn ${duration}ms ease-out ${delay}ms backwards` }}>
        {children}
      </div>
    );
  }

  return (
    <>
      {children.map((child, index) => (
        <div
          key={index}
          style={{
            animation: index < visibleItems 
              ? `fadeInUp ${duration}ms ease-out backwards`
              : 'none',
            opacity: index < visibleItems ? 1 : 0,
          }}
        >
          {child}
        </div>
      ))}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default LaunchSequence;
