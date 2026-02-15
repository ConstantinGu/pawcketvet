import React from 'react';

const PawcketVetLogo = ({ size = 32, withText = false, textColor = '#3E2723', style = {} }) => {
  const pawSize = size;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: withText ? '0.5rem' : 0, ...style }}>
      <svg
        width={pawSize}
        height={pawSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id={`pawGrad-${pawSize}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B8704F" />
            <stop offset="100%" stopColor="#D4956C" />
          </linearGradient>
        </defs>
        {/* Main pad */}
        <ellipse cx="32" cy="42" rx="14" ry="12" fill={`url(#pawGrad-${pawSize})`} />
        {/* Top left toe */}
        <ellipse cx="16" cy="22" rx="7" ry="8.5" transform="rotate(-15 16 22)" fill={`url(#pawGrad-${pawSize})`} />
        {/* Top right toe */}
        <ellipse cx="48" cy="22" rx="7" ry="8.5" transform="rotate(15 48 22)" fill={`url(#pawGrad-${pawSize})`} />
        {/* Middle left toe */}
        <ellipse cx="24" cy="16" rx="6.5" ry="8" transform="rotate(-5 24 16)" fill={`url(#pawGrad-${pawSize})`} />
        {/* Middle right toe */}
        <ellipse cx="40" cy="16" rx="6.5" ry="8" transform="rotate(5 40 16)" fill={`url(#pawGrad-${pawSize})`} />
      </svg>
      {withText && (
        <span style={{
          fontFamily: "'Fraunces', serif",
          fontSize: `${pawSize * 0.042}rem`,
          fontWeight: 700,
          color: textColor,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}>
          PawcketVet
        </span>
      )}
    </span>
  );
};

export default PawcketVetLogo;
