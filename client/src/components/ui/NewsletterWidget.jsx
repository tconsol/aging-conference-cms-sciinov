import { useState } from 'react';
import CurvedInput from './CurvedInput';
import { communityAPI } from '../../api/community';
import { getErrorMessage } from '../../utils/helpers';

export default function NewsletterWidget({ light = false }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (email) => {
    if (!email) return;
    setLoading(true);
    try {
      await communityAPI.subscribe(email);
      setDone(true);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <p className={`text-sm font-semibold ${light ? 'text-teal-300' : 'text-teal-700'}`}>
        Subscribed — thank you!
      </p>
    );
  }

  return (
    <CurvedInput
      placeholder="Your email address"
      buttonText={loading ? '...' : 'Subscribe'}
      type="email"
      theme={light ? 'dark' : 'light'}
      bend={18}
      height={56}
      width="100%"
      cornerRadius={16}
      fontSize={13}
      shadowSize="sm"
      backgroundColor={light ? '#1e293b' : '#ffffff'}
      borderColor={light ? '#334155' : '#e2e8f0'}
      buttonColor={getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#0d9488'}
      buttonTextColor="#ffffff"
      placeholderColor={light ? '#64748b' : '#94a3b8'}
      textColor={light ? '#f1f5f9' : '#0f172a'}
      shadowColor={light ? '#000000' : '#0f172a'}
      onSubmit={handleSubmit}
    />
  );
}
