import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Zap, Star, Crown } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const INTERESTS = [
  { id: 'fashion', label: 'Fashion', emoji: '👗' },
  { id: 'streetwear', label: 'Streetwear', emoji: '🧢' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'art', label: 'Art', emoji: '🎨' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'sports', label: 'Sports', emoji: '⚡' },
];

const DEFAULT_AVATARS = [
  { id: 'avatar-1', label: 'Cyber', url: 'https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb', thumb: 'https://api.readyplayer.me/v1/avatars/6460d95f9ae10f45bffb2864.png?scene=fullbody-portrait-v1' },
  { id: 'avatar-2', label: 'Street', url: 'https://models.readyplayer.me/65e24e8c1f91b9bf7af7e882.glb', thumb: 'https://api.readyplayer.me/v1/avatars/65e24e8c1f91b9bf7af7e882.png?scene=fullbody-portrait-v1' },
  { id: 'avatar-3', label: 'Genesis', url: 'https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb', thumb: 'https://api.readyplayer.me/v1/avatars/6460d95f9ae10f45bffb2864.png?scene=fullbody-portrait-v1' },
  { id: 'avatar-4', label: 'Nova', url: 'https://models.readyplayer.me/65e24e8c1f91b9bf7af7e882.glb', thumb: 'https://api.readyplayer.me/v1/avatars/65e24e8c1f91b9bf7af7e882.png?scene=fullbody-portrait-v1' },
];

const TOTAL_STEPS = 5;

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [saving, setSaving] = useState(false);

  // Redirect if already onboarded or not logged in
  useEffect(() => {
    if (!user) {
      base44.auth.redirectToLogin('/Onboarding');
      return;
    }
    if (user.onboarding_complete) {
      navigate('/Dashboard');
    }
  }, [user, navigate]);

  const toggleInterest = (id) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setSaving(true);
    const updates = {
      onboarding_complete: true,
      interests: selectedInterests,
    };
    if (selectedAvatar) {
      updates.avatar_config = {
        ...(user?.avatar_config || {}),
        avatarUrl: selectedAvatar.url,
        defaultAvatarId: selectedAvatar.id,
        isDefaultAvatar: true,
      };
    }
    await base44.auth.updateMe(updates).catch(() => {});
    updateUser?.(prev => ({ ...(prev || {}), ...updates }));
    base44.analytics.track({ eventName: 'onboarding_complete', properties: { interests: selectedInterests.join(',') } });
    navigate('/Dashboard');
  };

  const steps = [
    // Step 0: Welcome
    <StepWelcome key="welcome" onNext={() => setStep(1)} />,
    // Step 1: Avatar
    <StepAvatar key="avatar" avatars={DEFAULT_AVATARS} selected={selectedAvatar} onSelect={setSelectedAvatar} onNext={() => setStep(2)} onBack={() => setStep(0)} />,
    // Step 2: Interests
    <StepInterests key="interests" interests={INTERESTS} selected={selectedInterests} onToggle={toggleInterest} onNext={() => setStep(3)} onBack={() => setStep(1)} />,
    // Step 3: Explore
    <StepExplore key="explore" onNext={() => setStep(4)} onBack={() => setStep(2)} />,
    // Step 4: Done
    <StepDone key="done" saving={saving} onComplete={handleComplete} onBack={() => setStep(3)} />,
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: '#07070C' }}>
      {/* Progress dots */}
      {step > 0 && (
        <div className="flex gap-2 mb-10">
          {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-300"
              style={{ width: i < step ? 24 : 6, height: 6, background: i < step ? '#00D4FF' : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-lg"
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StepWelcome({ onNext }) {
  return (
    <div className="text-center">
      <div className="flex justify-center gap-2 mb-8">
        {['#FF0000', '#0000FF', '#FFFF00'].map((c, i) => (
          <span key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />
        ))}
      </div>
      <img src="https://media.base44.com/images/public/68bc2773ba0ba8d2da222a27/d210c1fef_WHITELOGO.png" alt="SKRTLIFE" className="h-12 mx-auto mb-8" />
      <h1 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ letterSpacing: '-0.03em' }}>
        WELCOME TO THE<br />DIGITAL SOCIETY
      </h1>
      <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
        The premium streetwear platform where fashion, avatars, and community collide.
        Let's set up your experience.
      </p>
      <button onClick={onNext} className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2" style={{ background: '#00D4FF', color: '#000' }}>
        Get Started <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function StepAvatar({ avatars, selected, onSelect, onNext, onBack }) {
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-xs mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <ArrowLeft className="w-3 h-3" /> Back
      </button>
      <h2 className="text-3xl font-black text-white mb-2" style={{ letterSpacing: '-0.03em' }}>Choose Your Avatar</h2>
      <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Pick a starter — you can customize in DripSync</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {avatars.map(avatar => (
          <button key={avatar.id} onClick={() => onSelect(avatar)}
            className="relative rounded-2xl overflow-hidden transition-all"
            style={{ border: `2px solid ${selected?.id === avatar.id ? '#00D4FF' : 'rgba(255,255,255,0.08)'}`, aspectRatio: '3/4', background: 'rgba(255,255,255,0.04)' }}>
            <img src={avatar.thumb} alt={avatar.label} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
            <div className="absolute bottom-0 inset-x-0 p-3" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
              <p className="text-white font-bold text-sm">{avatar.label}</p>
            </div>
            {selected?.id === avatar.id && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#00D4FF' }}>
                <Check className="w-3.5 h-3.5 text-black" />
              </div>
            )}
          </button>
        ))}
      </div>

      <button onClick={onNext} className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest" style={{ background: '#00D4FF', color: '#000' }}>
        {selected ? 'Continue' : 'Skip for Now'} <ArrowRight className="w-4 h-4 inline ml-1" />
      </button>
    </div>
  );
}

function StepInterests({ interests, selected, onToggle, onNext, onBack }) {
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-xs mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <ArrowLeft className="w-3 h-3" /> Back
      </button>
      <h2 className="text-3xl font-black text-white mb-2" style={{ letterSpacing: '-0.03em' }}>Your Interests</h2>
      <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Pick what you're into — we'll tailor your experience</p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {interests.map(item => {
          const isSelected = selected.includes(item.id);
          return (
            <button key={item.id} onClick={() => onToggle(item.id)}
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all"
              style={{
                background: isSelected ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isSelected ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: isSelected ? '#00D4FF' : 'rgba(255,255,255,0.7)',
              }}>
              <span className="text-xl">{item.emoji}</span>
              <span className="font-semibold text-sm">{item.label}</span>
              {isSelected && <Check className="w-3.5 h-3.5 ml-auto" />}
            </button>
          );
        })}
      </div>

      <button onClick={onNext} disabled={selected.length === 0}
        className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest disabled:opacity-40 transition-opacity"
        style={{ background: '#00D4FF', color: '#000' }}>
        Continue ({selected.length} selected) <ArrowRight className="w-4 h-4 inline ml-1" />
      </button>
    </div>
  );
}

function StepExplore({ onNext, onBack }) {
  const features = [
    { icon: Zap, color: '#00D4FF', title: 'DripSync', desc: 'Build your avatar look with 3D wearables' },
    { icon: Star, color: '#FF3366', title: 'Community', desc: 'Connect with the digital society' },
    { icon: Crown, color: '#FFD700', title: 'Genesis', desc: 'Unlock exclusive member perks' },
  ];
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-xs mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <ArrowLeft className="w-3 h-3" /> Back
      </button>
      <h2 className="text-3xl font-black text-white mb-2" style={{ letterSpacing: '-0.03em' }}>Here's What's Inside</h2>
      <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Your complete digital society experience</p>

      <div className="space-y-3 mb-8">
        {features.map(({ icon: Icon, color, title, desc }) => (
          <div key={title} className="flex items-center gap-4 p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">{title}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onNext} className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest" style={{ background: '#00D4FF', color: '#000' }}>
        I'm Ready <ArrowRight className="w-4 h-4 inline ml-1" />
      </button>
    </div>
  );
}

function StepDone({ saving, onComplete, onBack }) {
  return (
    <div className="text-center">
      <button onClick={onBack} className="flex items-center gap-2 text-xs mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <ArrowLeft className="w-3 h-3" /> Back
      </button>
      <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)' }}>
        <Check className="w-10 h-10" style={{ color: '#00D4FF' }} />
      </div>
      <h2 className="text-3xl font-black text-white mb-3" style={{ letterSpacing: '-0.03em' }}>You're All Set</h2>
      <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.4)' }}>Your profile is ready. Welcome to the Skrtlife Digital Society.</p>
      <button onClick={onComplete} disabled={saving}
        className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ background: '#00D4FF', color: '#000' }}>
        {saving ? 'Saving...' : <>Enter the Society <ArrowRight className="w-4 h-4" /></>}
      </button>
    </div>
  );
}