import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, Phone, Calendar, Home, CheckCircle, XCircle, MapPin, Clock } from 'lucide-react';

const speciesQuestions = {
  DOG: 'Chien',
  CAT: 'Chat',
  RABBIT: 'Lapin',
  BIRD: 'Oiseau',
  RODENT: 'Rongeur',
  REPTILE: 'Reptile',
  OTHER: 'Autre',
};

const triageQuestions = [
  {
    id: 'breathing',
    question: 'Votre animal a-t-il des difficultés à respirer ?',
    options: [
      { label: 'Oui, il halète / respire très fort', score: 10, level: 'critical' },
      { label: 'Légèrement, mais il semble inconfortable', score: 5, level: 'moderate' },
      { label: 'Non, il respire normalement', score: 0, level: 'ok' },
    ],
  },
  {
    id: 'consciousness',
    question: "Est-il conscient et réactif ?",
    options: [
      { label: "Non, il est inconscient ou ne répond pas", score: 10, level: 'critical' },
      { label: "Il est léthargique / très fatigué", score: 5, level: 'moderate' },
      { label: "Oui, il est alerte et réactif", score: 0, level: 'ok' },
    ],
  },
  {
    id: 'bleeding',
    question: "Y a-t-il un saignement visible ?",
    options: [
      { label: "Oui, un saignement abondant qui ne s'arrête pas", score: 10, level: 'critical' },
      { label: "Un léger saignement ou une plaie", score: 4, level: 'moderate' },
      { label: "Non, aucun saignement", score: 0, level: 'ok' },
    ],
  },
  {
    id: 'vomiting',
    question: "A-t-il des vomissements ou de la diarrhée ?",
    options: [
      { label: "Oui, répétés (plus de 3 fois) ou avec du sang", score: 8, level: 'serious' },
      { label: "Oui, 1-2 épisodes", score: 3, level: 'moderate' },
      { label: "Non", score: 0, level: 'ok' },
    ],
  },
  {
    id: 'eating',
    question: "Mange-t-il et boit-il normalement ?",
    options: [
      { label: "Il ne mange ni ne boit depuis plus de 24h", score: 7, level: 'serious' },
      { label: "Appétit réduit depuis aujourd'hui", score: 3, level: 'moderate' },
      { label: "Oui, il mange et boit normalement", score: 0, level: 'ok' },
    ],
  },
  {
    id: 'mobility',
    question: "Se déplace-t-il normalement ?",
    options: [
      { label: "Il ne peut pas se lever / est paralysé", score: 9, level: 'critical' },
      { label: "Il boite ou se déplace avec difficulté", score: 4, level: 'moderate' },
      { label: "Oui, il se déplace normalement", score: 0, level: 'ok' },
    ],
  },
  {
    id: 'pain',
    question: "Semble-t-il souffrir ?",
    options: [
      { label: "Oui, il gémit / crie / est très agité", score: 7, level: 'serious' },
      { label: "Il semble inconfortable mais pas en détresse", score: 3, level: 'moderate' },
      { label: "Non, il ne montre pas de signe de douleur", score: 0, level: 'ok' },
    ],
  },
  {
    id: 'ingestion',
    question: "A-t-il ingéré un produit toxique ou un objet dangereux ?",
    options: [
      { label: "Oui, un produit toxique (chocolat, médicament, produit ménager...)", score: 10, level: 'critical' },
      { label: "Possible mais je ne suis pas sûr(e)", score: 5, level: 'moderate' },
      { label: "Non", score: 0, level: 'ok' },
    ],
  },
];

const SOSTriagePage = () => {
  const navigate = useNavigate();
  const [species, setSpecies] = useState('');
  const [currentQ, setCurrentQ] = useState(-1); // -1 = species selection
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (questionId, option) => {
    const newAnswers = { ...answers, [questionId]: option };
    setAnswers(newAnswers);

    if (currentQ < triageQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateResult = () => {
    const totalScore = Object.values(answers).reduce((sum, a) => sum + a.score, 0);
    const hasCritical = Object.values(answers).some(a => a.level === 'critical');

    if (hasCritical || totalScore >= 30) {
      return {
        level: 'URGENCE',
        color: '#dc2626',
        bgColor: '#FEE2E2',
        icon: <XCircle size={48} />,
        title: 'Urgence vitale',
        description: "Les symptômes décrits nécessitent une prise en charge vétérinaire immédiate. Contactez un vétérinaire d'urgence sans délai.",
        actions: [
          "Appelez immédiatement un vétérinaire ou les urgences vétérinaires",
          "Gardez votre animal au calme et au chaud",
          "Ne lui donnez rien à manger ni à boire",
          "Si possible, transportez-le en le bougeant le moins possible",
        ],
      };
    } else if (totalScore >= 15) {
      return {
        level: 'CONSULTATION RAPIDE',
        color: '#d97706',
        bgColor: '#FEF3C7',
        icon: <AlertTriangle size={48} />,
        title: 'Consultation recommandée rapidement',
        description: "Les symptômes méritent une consultation vétérinaire dans les 24 heures. Prenez rendez-vous dès que possible.",
        actions: [
          "Prenez rendez-vous pour une consultation dans la journée",
          "Surveillez l'évolution des symptômes",
          "Notez les symptômes observés et leur chronologie",
          "Si les symptômes s'aggravent, consultez en urgence",
        ],
      };
    } else {
      return {
        level: 'SURVEILLANCE',
        color: '#059669',
        bgColor: '#D1FAE5',
        icon: <CheckCircle size={48} />,
        title: 'Surveillance à domicile',
        description: "Les symptômes décrits ne semblent pas nécessiter une consultation en urgence. Surveillez votre animal et consultez si les symptômes persistent ou s'aggravent.",
        actions: [
          "Surveillez votre animal pendant 24-48h",
          "Assurez-vous qu'il mange, boit et se comporte normalement",
          "Notez tout changement de comportement",
          "Prenez rendez-vous si les symptômes persistent au-delà de 48h",
        ],
      };
    }
  };

  const restart = () => {
    setSpecies('');
    setCurrentQ(-1);
    setAnswers({});
    setShowResult(false);
  };

  const progress = currentQ >= 0 ? ((currentQ + 1) / triageQuestions.length) * 100 : 0;

  const styles = {
    card: {
      background: '#fff',
      borderRadius: '24px',
      padding: '2.5rem',
      boxShadow: '0 8px 40px rgba(184, 112, 79, 0.12)',
      border: '2px solid rgba(184, 112, 79, 0.08)',
      maxWidth: '700px',
      margin: '0 auto',
    },
    option: {
      padding: '1.25rem 1.5rem',
      borderRadius: '16px',
      border: '2px solid #F5E6D3',
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginBottom: '0.75rem',
      fontWeight: 500,
      fontSize: '1rem',
      color: '#3E2723',
      background: '#fff',
    },
    button: {
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '14px',
      padding: '1rem 2rem',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      justifyContent: 'center',
    },
  };

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/client/dashboard')}
          style={{ background: 'transparent', border: 'none', color: '#B8704F', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0' }}
        >
          <ArrowLeft size={20} /> Retour
        </button>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '2.5rem', marginBottom: '0.5rem', color: '#3E2723', fontWeight: 700 }}>
          SOS Triage Veterinaire
        </h1>
        <p style={{ color: '#78716C', fontSize: '1.05rem' }}>
          Evaluez le niveau d'urgence de la situation de votre animal
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{
        background: '#FEF3C7',
        borderRadius: '16px',
        padding: '1rem 1.5rem',
        marginBottom: '2rem',
        border: '1px solid #F59E0B',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
      }}>
        <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={{ color: '#92400E', fontSize: '0.9rem', margin: 0 }}>
          <strong>Attention :</strong> Cet outil ne remplace pas un avis veterinaire professionnel.
          En cas de doute ou de situation manifestement grave, contactez immediatement un veterinaire.
        </p>
      </div>

      {/* Progress bar */}
      {currentQ >= 0 && !showResult && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#78716C', fontWeight: 600 }}>
              Question {currentQ + 1} sur {triageQuestions.length}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#B8704F', fontWeight: 600 }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ background: '#F5E6D3', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
              height: '100%',
              width: `${progress}%`,
              borderRadius: '8px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      )}

      {/* Species Selection */}
      {currentQ === -1 && !showResult && (
        <div style={styles.card}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#3E2723' }}>
            Quel type d'animal ?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
            {Object.entries(speciesQuestions).map(([key, label]) => (
              <div
                key={key}
                onClick={() => setSpecies(key)}
                style={{
                  ...styles.option,
                  textAlign: 'center',
                  border: species === key ? '3px solid #B8704F' : '2px solid #F5E6D3',
                  background: species === key ? '#FFF8F0' : '#fff',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FFF8F0'}
                onMouseLeave={e => { if (species !== key) e.currentTarget.style.background = '#fff'; }}
              >
                {label}
              </div>
            ))}
          </div>
          <button
            onClick={() => setCurrentQ(0)}
            disabled={!species}
            style={{ ...styles.button, width: '100%', opacity: species ? 1 : 0.5 }}
          >
            Commencer le triage <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* Questions */}
      {currentQ >= 0 && !showResult && (
        <div style={styles.card}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '2rem', color: '#3E2723' }}>
            {triageQuestions[currentQ].question}
          </h2>
          {triageQuestions[currentQ].options.map((option, idx) => (
            <div
              key={idx}
              onClick={() => handleAnswer(triageQuestions[currentQ].id, option)}
              style={styles.option}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#FFF8F0';
                e.currentTarget.style.borderColor = '#B8704F';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.borderColor = '#F5E6D3';
              }}
            >
              {option.label}
            </div>
          ))}
          {currentQ > 0 && (
            <button
              onClick={() => setCurrentQ(currentQ - 1)}
              style={{ ...styles.button, background: '#F5E6D3', color: '#3E2723', marginTop: '1rem', width: '100%' }}
            >
              <ArrowLeft size={18} /> Question precedente
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {showResult && (() => {
        const result = calculateResult();
        return (
          <div style={styles.card}>
            <div style={{
              background: result.bgColor,
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              marginBottom: '2rem',
            }}>
              <div style={{ color: result.color, marginBottom: '0.75rem' }}>{result.icon}</div>
              <div style={{
                display: 'inline-block',
                background: result.color,
                color: '#fff',
                padding: '0.5rem 1.5rem',
                borderRadius: '20px',
                fontWeight: 700,
                fontSize: '1rem',
                marginBottom: '1rem',
              }}>
                {result.level}
              </div>
              <h2 style={{ fontSize: '1.5rem', color: '#3E2723', marginBottom: '0.75rem' }}>
                {result.title}
              </h2>
              <p style={{ color: '#6D4C41', fontSize: '1rem', lineHeight: 1.6 }}>
                {result.description}
              </p>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3E2723', marginBottom: '1rem' }}>
              Actions recommandees :
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {result.actions.map((action, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  padding: '0.75rem 1rem',
                  background: '#FFF8F0',
                  borderRadius: '12px',
                }}>
                  <span style={{ color: result.color, fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: '#3E2723', fontSize: '0.95rem' }}>{action}</span>
                </div>
              ))}
            </div>

            {/* Emergency contacts */}
            <div style={{
              background: '#FEF2F2',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem',
              border: '1px solid #FECACA',
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#dc2626', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={18} /> Numéros d'urgence vétérinaire
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href="tel:3115" style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem', background: '#fff', borderRadius: '12px',
                  textDecoration: 'none', color: '#3E2723', fontWeight: 600,
                  border: '1px solid #E7E5E4',
                }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={16} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>3115</div>
                    <div style={{ fontSize: '0.8rem', color: '#78716C' }}>Urgences vétérinaires 24h/24</div>
                  </div>
                </a>
                <a href="tel:0140471700" style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem', background: '#fff', borderRadius: '12px',
                  textDecoration: 'none', color: '#3E2723', fontWeight: 600,
                  border: '1px solid #E7E5E4',
                }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={16} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Centre antipoison animal</div>
                    <div style={{ fontSize: '0.8rem', color: '#78716C' }}>01 40 47 17 00 — Capae-Ouest</div>
                  </div>
                </a>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {result.level === 'URGENCE' ? (
                <a
                  href="tel:3115"
                  style={{ ...styles.button, background: '#dc2626', textDecoration: 'none' }}
                >
                  <Phone size={18} /> Appeler le 3115
                </a>
              ) : (
                <button
                  onClick={() => navigate('/client/book-appointment')}
                  style={styles.button}
                >
                  <Calendar size={18} /> Prendre RDV
                </button>
              )}
              <button
                onClick={restart}
                style={{ ...styles.button, background: '#F5E6D3', color: '#3E2723' }}
              >
                Recommencer
              </button>
            </div>
          </div>
        );
      })()}
    </>
  );
};

export default SOSTriagePage;
