'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download, Smartphone, CheckCircle, Loader2 } from 'lucide-react';

const SuccessContent = () => {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const [phone, setPhone] = useState('');
  const [smsStatus, setSmsStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  React.useEffect(() => {
    if (jobId) {
      fetch(`/api/checkout/verify?jobId=${jobId}`)
        .then(res => res.json())
        .then(data => {
          if (data.zipUrl) {
            setZipUrl(data.zipUrl);
          } else {
            setAuthError(data.error || 'Failed to authorize download.');
          }
        })
        .catch(() => setAuthError('Network error verifying payment.'));
    }
  }, [jobId]);

  const handleSmsRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setSmsStatus('sending');
    try {
      const res = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, downloadLink: zipUrl }),
      });

      const data = await res.json();
      if (data.success) {
        setSmsStatus('success');
      } else {
        setSmsStatus('error');
      }
    } catch (e) {
      console.error('SMS Error:', e);
      setSmsStatus('error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center space-y-12 max-w-2xl mx-auto w-full"
    >
      <div className="space-y-4">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Payment Successful!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Thank you for your purchase. Your digital kit (Job: {jobId}) is ready.
        </p>
      </div>

      <div className="w-full bg-gray-50 dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-6">Download Your Kit</h2>

        {authError ? (
          <p className="text-red-500">Error: {authError}</p>
        ) : zipUrl ? (
          <a
            href={zipUrl}
            className="w-full sm:w-auto px-8 py-4 bg-black text-white dark:bg-white dark:text-black rounded-full text-xl font-medium transition-all hover:shadow-lg flex items-center justify-center gap-3"
          >
            <Download className="w-6 h-6" />
            Download ZIP Archive
          </a>
        ) : (
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        )}

        <p className="mt-4 text-sm text-gray-500">
          Contains the high-res mosaic and your print-ready solution grid.
        </p>
      </div>

      <div className="w-full bg-blue-50 dark:bg-blue-900/20 p-8 rounded-3xl border border-blue-100 dark:border-blue-900 flex flex-col items-center text-left">
        <div className="flex items-center gap-3 mb-4 w-full justify-center sm:justify-start">
          <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">Get it on your phone (Optional)</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center sm:text-left w-full">
          Need this for a last-minute print at a local shop? We can send the download link directly via SMS.
        </p>

        {smsStatus === 'success' ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-4 rounded-xl w-full">
            <CheckCircle className="w-5 h-5" />
            <span>SMS sent successfully! Check your phone.</span>
          </div>
        ) : (
          <form onSubmit={handleSmsRequest} className="w-full flex flex-col sm:flex-row gap-3">
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="flex-1 px-6 py-4 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={smsStatus === 'sending' || !phone}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {smsStatus === 'sending' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send SMS'
              )}
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 w-full">
      <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin text-gray-400" />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
