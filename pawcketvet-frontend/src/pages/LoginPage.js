import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }

    setLoading(false);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'IBM Plex Sans', sans-serif",
    },
    card: {
      background: '#fff',
      borderRadius: '24px',
      padding: '3rem',
      boxShadow: '0 8px 40px rgba(184, 112, 79, 0.12)',
      width: '100%',
      maxWidth: '450px',
    },
    logo: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    logoImage: {
      width: '80px',
      height: '80px',
      marginBottom: '1rem',
    },
    title: {
      fontFamily: "'Fraunces', serif",
      fontSize: '2rem',
      fontWeight: 700,
      color: '#3E2723',
      marginBottom: '0.5rem',
    },
    subtitle: {
      color: '#A1887F',
      fontSize: '0.95rem',
    },
    form: {
      marginTop: '2rem',
    },
    inputGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: 600,
      color: '#3E2723',
      fontSize: '0.9rem',
    },
    input: {
      width: '100%',
      padding: '0.875rem 1.25rem',
      borderRadius: '12px',
      border: '2px solid #F5E6D3',
      fontSize: '0.95rem',
      transition: 'all 0.3s',
      fontFamily: "'IBM Plex Sans', sans-serif",
    },
    button: {
      width: '100%',
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      padding: '1rem',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 4px 15px rgba(184, 112, 79, 0.25)',
    },
    footer: {
      textAlign: 'center',
      marginTop: '2rem',
      color: '#A1887F',
      fontSize: '0.85rem',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, #E8A87C 0%, #D4956C 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
          }}>
            🐾
          </div>
          <h1 style={styles.title}>PawcketVet</h1>
          <p style={styles.subtitle}>Connexion à votre espace clinique</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#B8704F'}
              onBlur={(e) => e.target.style.borderColor = '#F5E6D3'}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#B8704F'}
              onBlur={(e) => e.target.style.borderColor = '#F5E6D3'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div style={styles.footer}>
          <p>Compte de test : test@test.com / Test1234!</p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Fraunces:wght@700&display=swap');
      `}</style>
    </div>
  );
};

export default LoginPage;
