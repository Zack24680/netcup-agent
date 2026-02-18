import { useState } from 'react';

const TONE_OPTIONS = [
  { value: 'calm', label: 'Calm' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'compassionate', label: 'Compassionate' },
  { value: 'energising', label: 'Energising' },
];

const PRESET_SYMPTOMS = [
  'anxiety', 'insomnia', 'chronic pain', 'low confidence',
  'stress', 'phobia', 'smoking cessation', 'weight management',
];

/**
 * SymptomForm — main input panel for generating a new script
 * Props:
 *   onGenerate  — (params: { symptoms, tone, duration, title }) => Promise<void>
 *   generating  — boolean
 */
export default function SymptomForm({ onGenerate, generating }) {
  const [symptoms, setSymptoms] = useState([]);
  const [input, setInput] = useState('');
  const [tone, setTone] = useState('calm');
  const [duration, setDuration] = useState(20);
  const [title, setTitle] = useState('');

  function addSymptom(value) {
    const cleaned = value.trim().toLowerCase();
    if (cleaned && !symptoms.includes(cleaned)) {
      setSymptoms((prev) => [...prev, cleaned]);
    }
    setInput('');
  }

  function removeSymptom(s) {
    setSymptoms((prev) => prev.filter((x) => x !== s));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSymptom(input);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (symptoms.length === 0) return;
    onGenerate({ symptoms, tone, duration, title: title || undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Session title (optional)</label>
        <input
          type="text"
          className="input"
          placeholder="e.g. Evening anxiety session"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Symptoms */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">
          Client symptoms <span className="text-red-500">*</span>
        </label>

        {/* Tag input */}
        <div className="bg-panel border border-border rounded-lg px-3 py-2 flex flex-wrap gap-2 min-h-[44px]">
          {symptoms.map((s) => (
            <span key={s} className="tag">
              {s}
              <button
                type="button"
                onClick={() => removeSymptom(s)}
                className="ml-1 text-gray-500 hover:text-white"
              >×</button>
            </span>
          ))}
          <input
            type="text"
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-600 min-w-[120px]"
            placeholder={symptoms.length === 0 ? 'Type a symptom, press Enter…' : 'Add more…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => input.trim() && addSymptom(input)}
          />
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {PRESET_SYMPTOMS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addSymptom(s)}
              disabled={symptoms.includes(s)}
              className="text-xs px-2.5 py-1 rounded-full border border-border text-gray-500 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tone */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Therapist tone</label>
        <div className="grid grid-cols-2 gap-2">
          {TONE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTone(opt.value)}
              className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                tone === opt.value
                  ? 'border-accent bg-accent/10 text-accent-light'
                  : 'border-border text-gray-500 hover:border-gray-500 hover:text-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">
          Session duration — <span className="text-white">{duration} minutes</span>
        </label>
        <input
          type="range"
          min={5}
          max={60}
          step={5}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>5 min</span><span>60 min</span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={symptoms.length === 0 || generating}
        className="btn-primary w-full"
      >
        {generating ? 'Generating script…' : 'Generate script'}
      </button>
    </form>
  );
}
