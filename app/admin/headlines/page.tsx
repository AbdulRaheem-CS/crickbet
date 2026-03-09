'use client';

/**
 * Admin Headlines Management
 * Manage the scrolling announcement banner text
 */

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api-client';
import {
  FiPlus, FiTrash2, FiSave, FiAlertCircle, FiCheckCircle,
  FiArrowUp, FiArrowDown, FiToggleLeft, FiToggleRight, FiRefreshCw,
} from 'react-icons/fi';
import { FaBullhorn } from 'react-icons/fa';

interface Headline {
  _id?: string;
  text: string;
  enabled: boolean;
  order: number;
}

export default function HeadlinesPage() {
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchHeadlines();
  }, []);

  const fetchHeadlines = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getHeadlines();
      // apiClient interceptor returns response.data directly → res = { success, data: [...] }
      const data: Headline[] = (res as any)?.data ?? [];
      setHeadlines(data.map((h, i) => ({ ...h, order: i })));
    } catch (err) {
      console.error('Failed to load headlines', err);
      setAlert({ type: 'error', message: 'Failed to load headlines from server.' });
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleTextChange = (index: number, value: string) => {
    setHeadlines((prev) => prev.map((h, i) => (i === index ? { ...h, text: value } : h)));
  };

  const toggleEnabled = (index: number) => {
    setHeadlines((prev) => prev.map((h, i) => (i === index ? { ...h, enabled: !h.enabled } : h)));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setHeadlines((prev) => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy.map((h, i) => ({ ...h, order: i }));
    });
  };

  const moveDown = (index: number) => {
    setHeadlines((prev) => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy.map((h, i) => ({ ...h, order: i }));
    });
  };

  const addHeadline = () => {
    setHeadlines((prev) => [
      ...prev,
      { text: '', enabled: true, order: prev.length },
    ]);
  };

  const removeHeadline = (index: number) => {
    setHeadlines((prev) =>
      prev.filter((_, i) => i !== index).map((h, i) => ({ ...h, order: i }))
    );
  };

  const handleSave = async () => {
    const cleaned = headlines.filter((h) => h.text.trim() !== '');
    if (cleaned.length === 0) {
      showAlert('error', 'Add at least one headline before saving.');
      return;
    }
    try {
      setSaving(true);
      await adminAPI.updateHeadlines(
        cleaned.map((h, i) => ({ text: h.text.trim(), enabled: h.enabled, order: i }))
      );
      showAlert('success', '✅ Headlines saved! The banner will update immediately.');
      await fetchHeadlines();
    } catch (err) {
      console.error('Save failed', err);
      showAlert('error', 'Failed to save headlines. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = headlines.filter((h) => h.enabled && h.text.trim()).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        <p className="text-sm text-gray-500">Loading headlines…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scrolling Headlines</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage the announcement banner that scrolls across the top of the website.
            Changes go live immediately after saving.
          </p>
        </div>
        <button
          onClick={fetchHeadlines}
          title="Refresh"
          className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <FiRefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm">
        <span className="text-blue-700 font-semibold">{headlines.length} total</span>
        <span className="text-gray-400">•</span>
        <span className="text-green-600 font-medium">{enabledCount} active / showing</span>
        <span className="text-gray-400">•</span>
        <span className="text-gray-500">{headlines.length - enabledCount} disabled</span>
      </div>

      {/* Alert */}
      {alert && (
        <div
          className={`flex items-center gap-2 mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
            alert.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {alert.type === 'success' ? (
            <FiCheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <FiAlertCircle className="w-4 h-4 shrink-0" />
          )}
          {alert.message}
        </div>
      )}

      {/* Headlines List */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-sm">
        {headlines.length === 0 && (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">
            No headlines yet. Click <strong>&quot;Add Headline&quot;</strong> below to create one.
          </div>
        )}

        {headlines.map((headline, index) => (
          <div
            key={index}
            className={`p-4 flex items-start gap-3 transition ${
              !headline.enabled ? 'bg-gray-50 opacity-60' : ''
            }`}
          >
            {/* Index badge */}
            <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center mt-2">
              {index + 1}
            </div>

            {/* Order buttons */}
            <div className="flex flex-col gap-1 pt-1 shrink-0">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Move up"
              >
                <FiArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === headlines.length - 1}
                className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Move down"
              >
                <FiArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Text input */}
            <div className="flex-1">
              <textarea
                value={headline.text}
                onChange={(e) => handleTextChange(index, e.target.value)}
                rows={2}
                placeholder="Enter headline text… (emojis supported 🏏🎯)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300"
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-400">{headline.text.length} chars</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  headline.enabled
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {headline.enabled ? 'Showing on site' : 'Hidden'}
                </span>
              </div>
            </div>

            {/* Toggle enabled */}
            <button
              onClick={() => toggleEnabled(index)}
              title={headline.enabled ? 'Click to hide this headline' : 'Click to show this headline'}
              className={`mt-1 transition ${headline.enabled ? 'text-green-500 hover:text-green-600' : 'text-gray-300 hover:text-gray-400'}`}
            >
              {headline.enabled ? (
                <FiToggleRight className="w-7 h-7" />
              ) : (
                <FiToggleLeft className="w-7 h-7" />
              )}
            </button>

            {/* Delete */}
            <button
              onClick={() => removeHeadline(index)}
              title="Delete headline"
              className="mt-1.5 text-red-400 hover:text-red-600 transition"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={addHeadline}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
        >
          <FiPlus className="w-4 h-4" />
          Add Headline
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <FiSave className="w-4 h-4" />
          )}
          {saving ? 'Saving…' : 'Save & Publish'}
        </button>
      </div>

      {/* Live preview */}
      <div className="mt-8 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FaBullhorn className="text-yellow-500 text-sm" />
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Live Preview</h2>
          <span className="text-xs text-gray-400">(only enabled headlines shown)</span>
        </div>
        <div className="bg-[#1E5DAC] text-white py-2 px-4 rounded-lg overflow-hidden relative">
          <style>{`
            @keyframes marquee-preview {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
          <div className="flex whitespace-nowrap" style={{ animation: 'marquee-preview 8s linear infinite' }}>
            {(() => {
              const active = headlines.filter((h) => h.enabled && h.text.trim());
              if (active.length === 0) {
                return <span className="text-sm opacity-50 italic px-4">No enabled headlines to preview</span>;
              }
              return [...active, ...active].map((h, i) => (
                <span key={i} className="inline-flex items-center mx-6 text-sm">
                  {h.text}
                  <span className="mx-3 text-yellow-400">•</span>
                </span>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
