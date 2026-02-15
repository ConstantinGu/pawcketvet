import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { animalsAPI, consultationsAPI, vaccinationsAPI, prescriptionsAPI } from '../services/api';
import {
  BookOpen, Heart, Syringe, Pill, Activity, Weight,
  Calendar, ChevronRight, ChevronDown, FileText, Shield,
  Thermometer, Clock, AlertCircle, CheckCircle, TrendingUp
} from 'lucide-react';

const ClientHealthBook = () => {
  const navigate = useNavigate();
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    identity: true, vaccinations: true, consultations: true, prescriptions: false, weight: true,
  });

  const { data: animalsData } = useQuery({
    queryKey: ['my-animals'],
    queryFn: () => animalsAPI.getAll().then(res => res.data),
  });

  const animals = animalsData?.animals || [];
  const activeAnimal = selectedAnimal || animals[0];

  const { data: vaccData } = useQuery({
    queryKey: ['vacc-book', activeAnimal?.id],
    queryFn: () => vaccinationsAPI.getByAnimal(activeAnimal.id).then(res => res.data),
    enabled: !!activeAnimal?.id,
  });

  const { data: consultData } = useQuery({
    queryKey: ['consult-book', activeAnimal?.id],
    queryFn: () => consultationsAPI.getAll({ animalId: activeAnimal?.id }).then(res => res.data),
    enabled: !!activeAnimal?.id,
  });

  const { data: prescData } = useQuery({
    queryKey: ['presc-book', activeAnimal?.id],
    queryFn: () => prescriptionsAPI.getAll({ animalId: activeAnimal?.id }).then(res => res.data),
    enabled: !!activeAnimal?.id,
  });

  const vaccinations = Array.isArray(vaccData) ? vaccData : vaccData?.vaccinations || [];
  const consultations = Array.isArray(consultData) ? consultData : consultData?.consultations || [];
  const prescriptions = Array.isArray(prescData) ? prescData : prescData?.prescriptions || [];

  const speciesEmoji = { DOG: '🐕', CAT: '🐈', RABBIT: '🐇', BIRD: '🐦', RODENT: '🐹', REPTILE: '🦎' };
  const speciesLabel = { DOG: 'Chien', CAT: 'Chat', RABBIT: 'Lapin', BIRD: 'Oiseau', RODENT: 'Rongeur', REPTILE: 'Reptile' };

  const getAge = (birthDate) => {
    if (!birthDate) return 'Non renseigne';
    const diff = Date.now() - new Date(birthDate).getTime();
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
    if (years === 0) return `${months} mois`;
    return `${years} an${years > 1 ? 's' : ''}${months > 0 ? ` ${months} mois` : ''}`;
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getVaccStatus = (nextDueDate) => {
    if (!nextDueDate) return { label: 'Fait', color: '#059669', bg: '#ECFDF5' };
    const due = new Date(nextDueDate);
    const now = new Date();
    const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: 'Echu', color: '#DC2626', bg: '#FEF2F2' };
    if (days < 30) return { label: `${days}j restants`, color: '#D97706', bg: '#FFFBEB' };
    return { label: 'A jour', color: '#059669', bg: '#ECFDF5' };
  };

  // Weight history from consultations
  const weightHistory = consultations
    .filter(c => c.weight)
    .map(c => ({ date: c.date, weight: c.weight }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const s = {
    card: {
      background: '#fff', borderRadius: '16px',
      border: '1px solid rgba(184,112,79,0.06)',
      boxShadow: '0 2px 8px rgba(62,39,35,0.04)',
      overflow: 'hidden',
    },
    sectionHeader: (expanded) => ({
      padding: '1rem 1.25rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      cursor: 'pointer', userSelect: 'none',
      borderBottom: expanded ? '1px solid #F5F5F4' : 'none',
      transition: 'background 0.15s',
    }),
    badge: (color, bg) => ({
      padding: '0.2rem 0.6rem', borderRadius: '6px',
      fontSize: '0.72rem', fontWeight: 600,
      color, background: bg,
    }),
    emptyState: {
      padding: '2rem', textAlign: 'center', color: '#A8A29E',
      fontSize: '0.88rem',
    },
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{
              fontFamily: "'Fraunces', serif", fontSize: '1.75rem',
              fontWeight: 700, color: '#3E2723', letterSpacing: '-0.02em',
            }}>
              Carnet de sante
            </h1>
            <p style={{ color: '#78716C', fontSize: '0.88rem' }}>
              Dossier medical complet de vos compagnons
            </p>
          </div>
        </div>
      </div>

      {/* Animal selector tabs */}
      {animals.length > 0 && (
        <div style={{
          display: 'flex', gap: '0.5rem', marginBottom: '1.75rem',
          overflowX: 'auto', paddingBottom: '0.25rem',
        }}>
          {animals.map(animal => {
            const isActive = activeAnimal?.id === animal.id;
            return (
              <button
                key={animal.id}
                onClick={() => setSelectedAnimal(animal)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.6rem 1.25rem', borderRadius: '12px',
                  border: isActive ? '2px solid #B8704F' : '1.5px solid #E7E5E4',
                  background: isActive ? '#FFF8F0' : '#fff',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>{speciesEmoji[animal.species] || '🐾'}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: isActive ? '#B8704F' : '#3E2723' }}>
                    {animal.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#A8A29E' }}>
                    {speciesLabel[animal.species] || 'Autre'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {!activeAnimal ? (
        <div style={{ ...s.card, ...s.emptyState, padding: '4rem' }}>
          <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p>Aucun animal enregistre</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Identity Card */}
          <div style={s.card}>
            <div
              style={s.sectionHeader(expandedSections.identity)}
              onClick={() => toggleSection('identity')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: '#FFF8F0', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Heart size={16} color="#B8704F" />
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#3E2723' }}>Fiche d'identite</span>
              </div>
              {expandedSections.identity ? <ChevronDown size={18} color="#A8A29E" /> : <ChevronRight size={18} color="#A8A29E" />}
            </div>
            {expandedSections.identity && (
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div style={{
                    fontSize: '3.5rem', width: '80px', height: '80px',
                    borderRadius: '16px', background: '#FFF8F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {speciesEmoji[activeAnimal.species] || '🐾'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{
                      fontFamily: "'Fraunces', serif", fontSize: '1.6rem',
                      fontWeight: 700, color: '#3E2723', marginBottom: '0.25rem',
                    }}>
                      {activeAnimal.name}
                    </h2>
                    <p style={{ color: '#78716C', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                      {speciesLabel[activeAnimal.species]} {activeAnimal.breed ? `- ${activeAnimal.breed}` : ''}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {activeAnimal.gender && (
                        <span style={{
                          padding: '0.25rem 0.75rem', borderRadius: '8px',
                          background: '#F5F5F4', fontSize: '0.8rem', color: '#57534E',
                        }}>
                          {activeAnimal.gender === 'MALE' ? 'Male' : 'Femelle'}
                        </span>
                      )}
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '8px',
                        background: '#F5F5F4', fontSize: '0.8rem', color: '#57534E',
                      }}>
                        {getAge(activeAnimal.birthDate)}
                      </span>
                      {activeAnimal.color && (
                        <span style={{
                          padding: '0.25rem 0.75rem', borderRadius: '8px',
                          background: '#F5F5F4', fontSize: '0.8rem', color: '#57534E',
                        }}>
                          {activeAnimal.color}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '0.75rem',
                }}>
                  <div style={{
                    background: '#FAFAF9', borderRadius: '12px', padding: '1rem', textAlign: 'center',
                  }}>
                    <Weight size={20} color="#B8704F" style={{ marginBottom: '0.4rem' }} />
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#3E2723' }}>
                      {activeAnimal.weight ? `${activeAnimal.weight} kg` : 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#A8A29E' }}>Poids</div>
                  </div>
                  <div style={{
                    background: '#FAFAF9', borderRadius: '12px', padding: '1rem', textAlign: 'center',
                  }}>
                    <Activity size={20} color="#2563EB" style={{ marginBottom: '0.4rem' }} />
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#3E2723' }}>
                      {activeAnimal.microchip ? 'Oui' : 'Non'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#A8A29E' }}>Puce</div>
                  </div>
                  <div style={{
                    background: '#FAFAF9', borderRadius: '12px', padding: '1rem', textAlign: 'center',
                  }}>
                    <Syringe size={20} color="#059669" style={{ marginBottom: '0.4rem' }} />
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#3E2723' }}>
                      {vaccinations.length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#A8A29E' }}>Vaccins</div>
                  </div>
                  <div style={{
                    background: '#FAFAF9', borderRadius: '12px', padding: '1rem', textAlign: 'center',
                  }}>
                    <FileText size={20} color="#7C3AED" style={{ marginBottom: '0.4rem' }} />
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#3E2723' }}>
                      {consultations.length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#A8A29E' }}>Visites</div>
                  </div>
                </div>

                {/* Allergies / Chronic */}
                {(activeAnimal.allergies || activeAnimal.chronicConditions) && (
                  <div style={{
                    marginTop: '1rem', padding: '0.875rem 1rem', borderRadius: '10px',
                    background: '#FFFBEB', border: '1px solid #FDE68A',
                    display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
                  }}>
                    <AlertCircle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                    <div style={{ fontSize: '0.85rem', color: '#92400E', lineHeight: 1.6 }}>
                      {activeAnimal.allergies && <div><strong>Allergies :</strong> {activeAnimal.allergies}</div>}
                      {activeAnimal.chronicConditions && <div><strong>Conditions chroniques :</strong> {activeAnimal.chronicConditions}</div>}
                    </div>
                  </div>
                )}

                {activeAnimal.microchip && (
                  <div style={{
                    marginTop: '0.75rem', padding: '0.6rem 1rem', borderRadius: '8px',
                    background: '#F5F5F4', fontSize: '0.82rem', color: '#57534E',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <Shield size={14} color="#B8704F" />
                    N° puce : <strong>{activeAnimal.microchip}</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Vaccinations */}
          <div style={s.card}>
            <div
              style={s.sectionHeader(expandedSections.vaccinations)}
              onClick={() => toggleSection('vaccinations')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: '#ECFDF5', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Syringe size={16} color="#059669" />
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#3E2723' }}>Vaccinations</span>
                <span style={{
                  padding: '0.15rem 0.5rem', borderRadius: '6px',
                  background: '#F5F5F4', fontSize: '0.72rem', color: '#78716C', fontWeight: 600,
                }}>
                  {vaccinations.length}
                </span>
              </div>
              {expandedSections.vaccinations ? <ChevronDown size={18} color="#A8A29E" /> : <ChevronRight size={18} color="#A8A29E" />}
            </div>
            {expandedSections.vaccinations && (
              <div style={{ padding: vaccinations.length === 0 ? '0' : '0.5rem' }}>
                {vaccinations.length === 0 ? (
                  <div style={s.emptyState}>Aucune vaccination enregistree</div>
                ) : vaccinations.map((v, i) => {
                  const status = getVaccStatus(v.nextDueDate);
                  return (
                    <div key={v.id || i} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem', margin: '0 0.5rem',
                      borderBottom: i < vaccinations.length - 1 ? '1px solid #F5F5F4' : 'none',
                    }}>
                      <div style={{
                        width: '4px', height: '36px', borderRadius: '2px',
                        background: status.color, flexShrink: 0,
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#3E2723' }}>
                          {v.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#78716C' }}>
                          {new Date(v.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {v.batchNumber && ` - Lot ${v.batchNumber}`}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={s.badge(status.color, status.bg)}>{status.label}</span>
                        {v.nextDueDate && (
                          <div style={{ fontSize: '0.72rem', color: '#A8A29E', marginTop: '0.2rem' }}>
                            Rappel : {new Date(v.nextDueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Consultations */}
          <div style={s.card}>
            <div
              style={s.sectionHeader(expandedSections.consultations)}
              onClick={() => toggleSection('consultations')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: '#EFF6FF', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <FileText size={16} color="#2563EB" />
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#3E2723' }}>Historique medical</span>
                <span style={{
                  padding: '0.15rem 0.5rem', borderRadius: '6px',
                  background: '#F5F5F4', fontSize: '0.72rem', color: '#78716C', fontWeight: 600,
                }}>
                  {consultations.length}
                </span>
              </div>
              {expandedSections.consultations ? <ChevronDown size={18} color="#A8A29E" /> : <ChevronRight size={18} color="#A8A29E" />}
            </div>
            {expandedSections.consultations && (
              <div style={{ padding: consultations.length === 0 ? '0' : '0.75rem 1.25rem' }}>
                {consultations.length === 0 ? (
                  <div style={s.emptyState}>Aucune consultation enregistree</div>
                ) : consultations.map((c, i) => (
                  <div key={c.id || i} style={{
                    padding: '1rem',
                    background: '#FAFAF9', borderRadius: '12px',
                    marginBottom: i < consultations.length - 1 ? '0.75rem' : 0,
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', marginBottom: '0.6rem',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#3E2723' }}>
                          {c.reason}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#78716C', marginTop: '0.15rem' }}>
                          {new Date(c.date).toLocaleDateString('fr-FR', {
                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                          })}
                          {c.veterinarian && ` - Dr. ${c.veterinarian.lastName || c.veterinarian}`}
                        </div>
                      </div>
                    </div>

                    {c.diagnosis && (
                      <div style={{
                        padding: '0.5rem 0.75rem', borderRadius: '8px',
                        background: '#fff', marginBottom: '0.5rem',
                        fontSize: '0.85rem', color: '#44403C', lineHeight: 1.6,
                      }}>
                        <span style={{ fontWeight: 600, color: '#2563EB', fontSize: '0.78rem' }}>Diagnostic : </span>
                        {c.diagnosis}
                      </div>
                    )}

                    {c.treatment && (
                      <div style={{
                        padding: '0.5rem 0.75rem', borderRadius: '8px',
                        background: '#fff', marginBottom: '0.5rem',
                        fontSize: '0.85rem', color: '#44403C', lineHeight: 1.6,
                      }}>
                        <span style={{ fontWeight: 600, color: '#059669', fontSize: '0.78rem' }}>Traitement : </span>
                        {c.treatment}
                      </div>
                    )}

                    {(c.temperature || c.heartRate || c.weight) && (
                      <div style={{
                        display: 'flex', gap: '1rem', marginTop: '0.5rem',
                        padding: '0.5rem 0.75rem', background: '#fff', borderRadius: '8px',
                      }}>
                        {c.temperature && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#57534E' }}>
                            <Thermometer size={14} color="#DC2626" /> {c.temperature}°C
                          </div>
                        )}
                        {c.heartRate && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#57534E' }}>
                            <Heart size={14} color="#DC2626" /> {c.heartRate} bpm
                          </div>
                        )}
                        {c.weight && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#57534E' }}>
                            <Weight size={14} color="#B8704F" /> {c.weight} kg
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prescriptions */}
          <div style={s.card}>
            <div
              style={s.sectionHeader(expandedSections.prescriptions)}
              onClick={() => toggleSection('prescriptions')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: '#F5F3FF', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Pill size={16} color="#7C3AED" />
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#3E2723' }}>Traitements en cours</span>
                <span style={{
                  padding: '0.15rem 0.5rem', borderRadius: '6px',
                  background: '#F5F5F4', fontSize: '0.72rem', color: '#78716C', fontWeight: 600,
                }}>
                  {prescriptions.length}
                </span>
              </div>
              {expandedSections.prescriptions ? <ChevronDown size={18} color="#A8A29E" /> : <ChevronRight size={18} color="#A8A29E" />}
            </div>
            {expandedSections.prescriptions && (
              <div style={{ padding: prescriptions.length === 0 ? '0' : '0.5rem 1.25rem' }}>
                {prescriptions.length === 0 ? (
                  <div style={s.emptyState}>Aucun traitement en cours</div>
                ) : prescriptions.map((p, i) => {
                  const isActive = !p.endDate || new Date(p.endDate) > new Date();
                  return (
                    <div key={p.id || i} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem 0',
                      borderBottom: i < prescriptions.length - 1 ? '1px solid #F5F5F4' : 'none',
                    }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: isActive ? '#F5F3FF' : '#F5F5F4',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Pill size={16} color={isActive ? '#7C3AED' : '#A8A29E'} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#3E2723' }}>
                          {p.medication?.name || 'Medicament'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#78716C' }}>
                          {p.dosage} - {p.frequency} - {p.duration}
                        </div>
                        {p.instructions && (
                          <div style={{ fontSize: '0.75rem', color: '#A8A29E', marginTop: '0.15rem' }}>
                            {p.instructions}
                          </div>
                        )}
                      </div>
                      <span style={s.badge(
                        isActive ? '#7C3AED' : '#78716C',
                        isActive ? '#F5F3FF' : '#F5F5F4'
                      )}>
                        {isActive ? 'En cours' : 'Termine'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weight History Chart */}
          <div style={s.card}>
            <div
              style={s.sectionHeader(expandedSections.weight)}
              onClick={() => toggleSection('weight')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: '#FFF8F0', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <TrendingUp size={16} color="#B8704F" />
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#3E2723' }}>Courbe de poids</span>
              </div>
              {expandedSections.weight ? <ChevronDown size={18} color="#A8A29E" /> : <ChevronRight size={18} color="#A8A29E" />}
            </div>
            {expandedSections.weight && (
              <div style={{ padding: '1.25rem' }}>
                {weightHistory.length < 2 ? (
                  <div style={{ ...s.emptyState, padding: '1.5rem' }}>
                    <TrendingUp size={32} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                    <p>Pas assez de donnees pour la courbe de poids</p>
                    <p style={{ fontSize: '0.78rem', color: '#D6D3D1', marginTop: '0.25rem' }}>
                      Les mesures seront ajoutees automatiquement lors des visites
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      display: 'flex', alignItems: 'flex-end', gap: '0.75rem',
                      height: '140px', paddingBottom: '1.5rem', position: 'relative',
                    }}>
                      {(() => {
                        const maxW = Math.max(...weightHistory.map(w => w.weight));
                        const minW = Math.min(...weightHistory.map(w => w.weight));
                        const range = maxW - minW || 1;
                        return weightHistory.map((w, i) => (
                          <div key={i} style={{
                            flex: 1, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: '0.3rem',
                          }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#3E2723' }}>
                              {w.weight} kg
                            </div>
                            <div style={{
                              width: '100%', maxWidth: '50px',
                              height: `${Math.max(((w.weight - minW) / range) * 100, 8)}px`,
                              background: i === weightHistory.length - 1
                                ? 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)'
                                : '#EDD5BC',
                              borderRadius: '4px 4px 0 0',
                              transition: 'height 0.5s ease',
                            }} />
                            <div style={{ fontSize: '0.65rem', color: '#A8A29E' }}>
                              {new Date(w.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action CTA */}
          <div style={{
            ...s.card, padding: '1.25rem',
            background: 'linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%)',
            border: '1px solid rgba(184,112,79,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#3E2723', marginBottom: '0.2rem' }}>
                Besoin d'une consultation ?
              </div>
              <div style={{ fontSize: '0.82rem', color: '#78716C' }}>
                Prenez rendez-vous en ligne pour {activeAnimal.name}
              </div>
            </div>
            <button
              onClick={() => navigate(`/client/book-appointment?animalId=${activeAnimal.id}`)}
              style={{
                background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
                color: '#fff', border: 'none', borderRadius: '10px',
                padding: '0.65rem 1.25rem', fontSize: '0.85rem',
                fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                boxShadow: '0 2px 8px rgba(184,112,79,0.25)',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
            >
              <Calendar size={16} />
              Prendre RDV
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientHealthBook;
