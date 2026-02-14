import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, UserPlus } from 'lucide-react';

const LoginPage = () => {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      const result = await login(loginData.email, loginData.password);
      if (result.success) {
        toast.success('Connexion réussie');
        if (result.user?.role === 'OWNER') {
          navigate('/client/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(result.error || 'Identifiants incorrects');
      }
    } catch {
      toast.error('Erreur de connexion au serveur');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (registerData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setLoading(true);
    try {
      await authAPI.register({
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
        role: 'OWNER',
      });
      toast.success('Compte créé ! Vous pouvez vous connecter.');
      setMode('login');
      setLoginData({ email: registerData.email, password: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'inscription');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '0.95rem 1.25rem 0.95rem 3rem',
    borderRadius: '14px',
    border: '2px solid #F5E6D3',
    fontSize: '0.95rem',
    fontFamily: "'IBM Plex Sans', sans-serif",
    transition: 'all 0.3s',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fff',
  };

  const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#3E2723', fontSize: '0.9rem' };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 50%, #E8D5C4 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'IBM Plex Sans', sans-serif",
      padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '88px', height: '88px', margin: '0 auto 1.25rem',
            background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
            borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', boxShadow: '0 8px 30px rgba(184, 112, 79, 0.3)',
          }}>
            🐾
          </div>
          <h1 style={{
            fontFamily: "'Fraunces', serif", fontSize: '2.2rem', fontWeight: 700,
            color: '#3E2723', marginBottom: '0.5rem',
          }}>PawcketVet</h1>
          <p style={{ color: '#A1887F', fontSize: '1rem' }}>
            {mode === 'login' ? 'Connectez-vous à votre espace' : 'Créez votre compte propriétaire'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: '24px', padding: '2.5rem',
          boxShadow: '0 12px 60px rgba(184, 112, 79, 0.12)',
          border: '1px solid rgba(184, 112, 79, 0.06)',
        }}>
          {/* Tab toggle */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
            background: '#F5E6D3', borderRadius: '12px', padding: '0.35rem', marginBottom: '2rem',
          }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                background: mode === m ? '#fff' : 'transparent',
                border: 'none', borderRadius: '10px', padding: '0.7rem', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.9rem',
                color: mode === m ? '#3E2723' : '#A1887F',
                boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.3s',
              }}>{m === 'login' ? 'Connexion' : 'Inscription'}</button>
            ))}
          </div>

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Adresse email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#A1887F' }} />
                  <input type="email" value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="votre@email.com" required autoComplete="email"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#B8704F'}
                    onBlur={(e) => e.target.style.borderColor = '#F5E6D3'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <label style={labelStyle}>Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#A1887F' }} />
                  <input type={showPassword ? 'text' : 'password'} value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Votre mot de passe" required autoComplete="current-password"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#B8704F'}
                    onBlur={(e) => e.target.style.borderColor = '#F5E6D3'}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A1887F', padding: 0 }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%',
                background: loading ? '#D4956C' : 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
                color: '#fff', border: 'none', borderRadius: '14px', padding: '1rem',
                fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: '0 4px 20px rgba(184, 112, 79, 0.25)', transition: 'all 0.3s',
              }}>
                {loading ? 'Connexion en cours...' : <>Se connecter <ArrowRight size={18} /></>}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Prénom</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#A1887F' }} />
                    <input type="text" value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                      placeholder="Jean" required style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = '#B8704F'}
                      onBlur={(e) => e.target.style.borderColor = '#F5E6D3'} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Nom</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#A1887F' }} />
                    <input type="text" value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      placeholder="Dupont" required style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = '#B8704F'}
                      onBlur={(e) => e.target.style.borderColor = '#F5E6D3'} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#A1887F' }} />
                  <input type="email" value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="votre@email.com" required autoComplete="email" style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#B8704F'}
                    onBlur={(e) => e.target.style.borderColor = '#F5E6D3'} />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Téléphone</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#A1887F' }} />
                  <input type="tel" value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    placeholder="06 12 34 56 78" required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#B8704F'}
                    onBlur={(e) => e.target.style.borderColor = '#F5E6D3'} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
                <div>
                  <label style={labelStyle}>Mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#A1887F' }} />
                    <input type="password" value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      placeholder="6 car. min." required minLength={6} style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = '#B8704F'}
                      onBlur={(e) => e.target.style.borderColor = '#F5E6D3'} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Confirmer</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#A1887F' }} />
                    <input type="password" value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      placeholder="Confirmer" required minLength={6} style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = '#B8704F'}
                      onBlur={(e) => e.target.style.borderColor = '#F5E6D3'} />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%',
                background: loading ? '#D4956C' : 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
                color: '#fff', border: 'none', borderRadius: '14px', padding: '1rem',
                fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: '0 4px 20px rgba(184, 112, 79, 0.25)', transition: 'all 0.3s',
              }}>
                {loading ? 'Inscription en cours...' : <>Créer mon compte <UserPlus size={18} /></>}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', color: '#A1887F', fontSize: '0.85rem', marginTop: '2rem' }}>
          PawcketVet - Plateforme de gestion vétérinaire
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Fraunces:wght@700&display=swap');
      `}</style>
    </div>
  );
};

export default LoginPage;
