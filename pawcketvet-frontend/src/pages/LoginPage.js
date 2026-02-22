import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, UserPlus, Heart, Shield, Calendar, BookOpen } from 'lucide-react';
import PawcketVetLogo from '../components/PawcketVetLogo';

const LoginPage = () => {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
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
      const result = await register({
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
        role: 'OWNER',
      });
      if (result.success) {
        toast.success('Bienvenue sur PawcketVet ! Ajoutez vos compagnons pour commencer.');
        navigate('/client/my-pets?onboarding=true');
      } else {
        toast.error(result.error || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'inscription');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '0.85rem 1rem 0.85rem 2.75rem',
    borderRadius: '12px',
    border: '1.5px solid #E7E5E4',
    fontSize: '0.92rem',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#FAFAF9',
    color: '#3E2723',
  };

  const labelStyle = {
    display: 'block', marginBottom: '0.4rem', fontWeight: 600,
    color: '#44403C', fontSize: '0.82rem', letterSpacing: '0.01em',
  };

  const features = [
    { icon: Heart, title: 'Suivi médical complet', desc: 'Carnet de santé numérique pour chaque animal' },
    { icon: Calendar, title: 'Rendez-vous en ligne', desc: 'Réservez 24h/24 en quelques clics' },
    { icon: BookOpen, title: 'Carnet de santé', desc: 'Historique médical, vaccinations, traitements' },
    { icon: Shield, title: 'Données sécurisées', desc: 'Protection RGPD de toutes vos données' },
  ];

  const isMobileView = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <div lang="fr" style={{
      minHeight: '100vh',
      display: isMobileView ? 'flex' : 'grid',
      flexDirection: isMobileView ? 'column' : undefined,
      gridTemplateColumns: isMobileView ? undefined : '1fr 1fr',
      fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
    }}>
      {/* Left - Branding Panel */}
      <div aria-hidden="true" style={{
        background: 'linear-gradient(135deg, #B8704F 0%, #8B4F33 100%)',
        padding: isMobileView ? '2rem 1.5rem' : '3rem',
        display: isMobileView ? 'none' : 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative shapes */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: '400px', height: '400px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-10%',
          width: '500px', height: '500px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '50%',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px', margin: '0 auto' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            marginBottom: '3rem',
          }}>
            <PawcketVetLogo size={36} />
            <span style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#fff',
            }}>
              PawcketVet
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: '2.8rem',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            letterSpacing: '-0.03em',
          }}>
            La santé de vos compagnons, simplifiée.
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: '1.1rem',
            lineHeight: 1.7,
            marginBottom: '3rem',
          }}>
            Plateforme vétérinaire nouvelle génération. Gérez les dossiers médicaux,
            les rendez-vous et le carnet de santé de chaque animal en un seul endroit.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '0.75rem',
                  }}>
                    <Icon size={18} color="#fff" />
                  </div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.25rem' }}>
                    {f.title}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', lineHeight: 1.5 }}>
                    {f.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right - Form Panel */}
      <main style={{
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '1.8rem',
              fontWeight: 700,
              color: '#3E2723',
              marginBottom: '0.5rem',
            }}>
              {mode === 'login' ? 'Bienvenue' : 'Créer un compte'}
            </h2>
            <p style={{ color: '#57534E', fontSize: '0.92rem' }}>
              {mode === 'login' ? 'Connectez-vous à votre espace' : 'Inscrivez-vous en tant que propriétaire d\'animal'}
            </p>
          </div>

          {/* Tab toggle */}
          <div role="tablist" aria-label="Type de formulaire" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px',
            background: '#F5F5F4', borderRadius: '10px', padding: '3px', marginBottom: '2rem',
          }}>
            {['login', 'register'].map(m => (
              <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} style={{
                background: mode === m ? '#fff' : 'transparent',
                border: 'none', borderRadius: '8px', padding: '0.6rem', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.85rem',
                color: mode === m ? '#3E2723' : '#78716C',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s',
              }}>
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} role="tabpanel" aria-label="Formulaire de connexion">
              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="login-email" style={labelStyle}>Adresse email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} aria-hidden="true" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }} />
                  <input id="login-email" type="email" value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="votre@email.com" required autoComplete="email"
                    aria-required="true"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <label htmlFor="login-password" style={labelStyle}>Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} aria-hidden="true" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }} />
                  <input id="login-password" type={showPassword ? 'text' : 'password'} value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Votre mot de passe" required autoComplete="current-password"
                    aria-required="true"
                    style={inputStyle}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#78716C', padding: '0.5rem', margin: '-0.5rem' }}>
                    {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                <button type="button" onClick={() => toast('Contactez la clinique pour réinitialiser votre mot de passe.', { icon: 'ℹ️' })}
                  style={{ background: 'none', border: 'none', color: '#B8704F', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}>
                  Mot de passe oublié ?
                </button>
              </div>

              <button type="submit" disabled={loading} aria-busy={loading} style={{
                width: '100%',
                background: loading ? '#D4956C' : 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
                color: '#fff', border: 'none', borderRadius: '12px', padding: '0.9rem',
                fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: '0 4px 16px rgba(184, 112, 79, 0.25)', transition: 'all 0.2s',
              }}>
                {loading ? 'Connexion en cours...' : <>Se connecter <ArrowRight size={17} aria-hidden="true" /></>}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} role="tabpanel" aria-label="Formulaire d'inscription">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label htmlFor="register-firstName" style={labelStyle}>Prénom</label>
                  <div style={{ position: 'relative' }}>
                    <User size={17} aria-hidden="true" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }} />
                    <input id="register-firstName" type="text" value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                      placeholder="Jean" required autoComplete="given-name" aria-required="true" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label htmlFor="register-lastName" style={labelStyle}>Nom</label>
                  <div style={{ position: 'relative' }}>
                    <User size={17} aria-hidden="true" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }} />
                    <input id="register-lastName" type="text" value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      placeholder="Dupont" required autoComplete="family-name" aria-required="true" style={inputStyle} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="register-email" style={labelStyle}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} aria-hidden="true" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }} />
                  <input id="register-email" type="email" value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="votre@email.com" required autoComplete="email" aria-required="true" style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="register-phone" style={labelStyle}>Téléphone</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={17} aria-hidden="true" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }} />
                  <input id="register-phone" type="tel" value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    placeholder="06 12 34 56 78" required autoComplete="tel" aria-required="true" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.75rem' }}>
                <div>
                  <label htmlFor="register-password" style={labelStyle}>Mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={17} aria-hidden="true" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }} />
                    <input id="register-password" type="password" value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      placeholder="6 car. min." required minLength={6} autoComplete="new-password"
                      aria-required="true" aria-describedby="password-hint" style={inputStyle} />
                  </div>
                  <div id="password-hint" style={{ fontSize: '0.8rem', color: '#78716C', marginTop: '0.25rem' }}>
                    Minimum 6 caractères
                  </div>
                </div>
                <div>
                  <label htmlFor="register-confirm" style={labelStyle}>Confirmer le mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={17} aria-hidden="true" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }} />
                    <input id="register-confirm" type="password" value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      placeholder="Confirmer" required minLength={6} autoComplete="new-password"
                      aria-required="true" style={inputStyle} />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} aria-busy={loading} style={{
                width: '100%',
                background: loading ? '#D4956C' : 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
                color: '#fff', border: 'none', borderRadius: '12px', padding: '0.9rem',
                fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: '0 4px 16px rgba(184, 112, 79, 0.25)', transition: 'all 0.2s',
              }}>
                {loading ? 'Inscription en cours...' : <>Créer mon compte <UserPlus size={17} aria-hidden="true" /></>}
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', color: '#78716C', fontSize: '0.78rem', marginTop: '2rem' }}>
            PawcketVet &copy; 2026 - Plateforme de gestion vétérinaire
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
