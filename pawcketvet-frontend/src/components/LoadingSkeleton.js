import React from 'react';
import PawcketVetLogo from './PawcketVetLogo';

// Shimmer animation is defined in index.css (@keyframes shimmer)

const Skeleton = ({ width = '100%', height = '1rem', borderRadius = '8px', style = {} }) => (
  <div style={{
    width,
    height,
    borderRadius,
    background: 'linear-gradient(90deg, #F5E6D3 25%, #FFF8F0 50%, #F5E6D3 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    ...style,
  }} />
);

// Card skeleton for dashboard stat cards
export const StatCardSkeleton = ({ count = 4 }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
    gap: '1rem',
    marginBottom: '1.5rem',
  }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{
        background: '#fff',
        borderRadius: '18px',
        padding: '1.5rem',
        boxShadow: '0 2px 15px rgba(184, 112, 79, 0.06)',
        border: '1px solid rgba(184, 112, 79, 0.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <Skeleton width="60%" height="0.75rem" style={{ marginBottom: '0.75rem' }} />
            <Skeleton width="40%" height="2rem" />
          </div>
          <Skeleton width="44px" height="44px" borderRadius="14px" />
        </div>
      </div>
    ))}
  </div>
);

// List item skeleton
export const ListItemSkeleton = ({ count = 5 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 2px 12px rgba(184, 112, 79, 0.06)',
        border: '1px solid rgba(184, 112, 79, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <Skeleton width="52px" height="52px" borderRadius="14px" />
        <div style={{ flex: 1 }}>
          <Skeleton width="45%" height="1rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="70%" height="0.75rem" style={{ marginBottom: '0.35rem' }} />
          <Skeleton width="30%" height="0.65rem" />
        </div>
        <Skeleton width="80px" height="28px" borderRadius="6px" />
      </div>
    ))}
  </div>
);

// Card grid skeleton for patients/inventory
export const CardGridSkeleton = ({ count = 6, minWidth = '350px' }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
    gap: '1.5rem',
  }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 15px rgba(184, 112, 79, 0.06)',
        border: '1px solid rgba(184, 112, 79, 0.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <Skeleton width="50%" height="1.2rem" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="70%" height="0.85rem" />
          </div>
          <Skeleton width="40px" height="40px" borderRadius="50%" />
        </div>
        <div style={{ background: '#FFF8F0', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
          <Skeleton width="80%" height="0.85rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="50%" height="0.85rem" />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Skeleton width="100%" height="40px" borderRadius="12px" />
          <Skeleton width="40px" height="40px" borderRadius="12px" />
          <Skeleton width="40px" height="40px" borderRadius="12px" />
        </div>
      </div>
    ))}
  </div>
);

// Appointment card skeleton
export const AppointmentSkeleton = ({ count = 3 }) => (
  <div>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{
        background: '#fff',
        borderRadius: '24px',
        padding: '2rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 25px rgba(184, 112, 79, 0.08)',
        border: '2px solid rgba(184, 112, 79, 0.08)',
        borderLeft: '6px solid #F5E6D3',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <Skeleton width="80px" height="48px" borderRadius="16px" />
          <Skeleton width="48px" height="48px" borderRadius="50%" />
          <div style={{ flex: 1 }}>
            <Skeleton width="35%" height="1.2rem" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="55%" height="0.85rem" />
          </div>
        </div>
        <Skeleton width="180px" height="44px" borderRadius="12px" />
      </div>
    ))}
  </div>
);

// Dashboard section skeleton
export const DashboardSkeleton = () => (
  <div style={{ animation: 'fadeIn 0.3s ease' }}>
    {/* Header */}
    <div style={{ marginBottom: '2rem' }}>
      <Skeleton width="280px" height="2rem" style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="220px" height="1rem" />
    </div>
    <StatCardSkeleton count={4} />
    <StatCardSkeleton count={4} />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <div style={{
        background: '#fff', borderRadius: '18px', padding: '1.5rem',
        boxShadow: '0 2px 15px rgba(184, 112, 79, 0.06)',
      }}>
        <Skeleton width="50%" height="1.1rem" style={{ marginBottom: '1.25rem' }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0' }}>
            <Skeleton width="32px" height="32px" borderRadius="50%" />
            <div style={{ flex: 1 }}>
              <Skeleton width="60%" height="0.85rem" style={{ marginBottom: '0.3rem' }} />
              <Skeleton width="40%" height="0.7rem" />
            </div>
          </div>
        ))}
      </div>
      <div style={{
        background: '#fff', borderRadius: '18px', padding: '1.5rem',
        boxShadow: '0 2px 15px rgba(184, 112, 79, 0.06)',
      }}>
        <Skeleton width="50%" height="1.1rem" style={{ marginBottom: '1.25rem' }} />
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '160px', paddingTop: '1rem' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <Skeleton width="100%" height={`${30 + Math.random() * 90}px`} borderRadius="6px 6px 0 0" />
              <Skeleton width="24px" height="0.6rem" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Page-level loading wrapper
export const PageLoading = ({ message = 'Chargement...' }) => (
  <div style={{
    textAlign: 'center',
    padding: '4rem 2rem',
    animation: 'fadeIn 0.3s ease',
  }}>
    <div style={{
      marginBottom: '1rem',
      animation: 'scaleIn 0.5s ease',
      display: 'flex', justifyContent: 'center',
    }}>
      <PawcketVetLogo size={56} />
    </div>
    <div style={{
      color: '#B8704F',
      fontSize: '1.1rem',
      fontWeight: 500,
    }}>
      {message}
    </div>
    <div style={{
      width: '48px',
      height: '4px',
      background: 'linear-gradient(90deg, #F5E6D3 25%, #B8704F 50%, #F5E6D3 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.2s infinite',
      borderRadius: '2px',
      margin: '1rem auto 0',
    }} />
  </div>
);

export default Skeleton;
