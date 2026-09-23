import { useState, useEffect } from 'react';
import { sendReportToChatGPT } from '@/functions/sendReportToChatGPT';
import { Bug } from 'lucide-react';

/**
 * Hidden dev-only debug button.
 * Only renders when localStorage.getItem('dev_mode') === 'true'
 * To enable: open browser console and run: localStorage.setItem('dev_mode', 'true')
 */
export default function DebugReportButton() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem('dev_mode') === 'true');
    } catch (_) {}
  }, []);

  if (!visible) return null;

  const handleSendReport = async () => {
    setLoading(true);
    try {
      // Collect any console-captured logs if available, else send empty array
      const logs = window.__devLogs || [];
      const response = await sendReportToChatGPT({ logs });
      console.group('[DebugReport] Response from sendReportToChatGPT');
      console.log('Status:', response?.data?.status);
      console.log('Report:', response?.data?.report);
      if (response?.data?.analysis) {
        console.log('GPT Analysis:', response?.data?.analysis);
      }
      if (response?.data?.reason) {
        console.warn('Fallback reason:', response?.data?.reason);
      }
      console.groupEnd();
    } catch (err) {
      console.error('[DebugReport] Failed to send report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSendReport}
      disabled={loading}
      title="Send Debug Report to ChatGPT (dev only)"
      className="fixed bottom-4 left-4 z-[9999] flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-bold shadow-lg transition-all"
      style={{
        background: loading ? 'rgba(30,30,40,0.95)' : 'rgba(20,20,30,0.95)',
        border: '1px solid rgba(0,212,255,0.4)',
        color: loading ? '#888' : '#00D4FF',
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      <Bug className="w-3 h-3" />
      {loading ? 'Sending...' : 'Send Debug Report'}
    </button>
  );
}