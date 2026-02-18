import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero */}
      <main className="pt-32 pb-24 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-border text-xs text-gray-400 px-4 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
          AI-powered hypnotherapy scripting
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight mb-6">
          Generate professional<br />
          <span className="text-accent-light">hypnotherapy scripts</span><br />
          in seconds.
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10">
          Describe your client's symptoms. Choose the tone and session length.
          Receive a structured, evidence-informed script — ready to use.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link to="/auth?mode=register" className="btn-primary text-base px-7 py-3">
            Start for free →
          </Link>
          <Link to="/auth" className="btn-ghost text-base">
            Sign in
          </Link>
        </div>
      </main>

      {/* Feature grid */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-4">
        {[
          { icon: '🧠', title: 'Symptom-aware', body: 'Tailor scripts to specific client presentations — anxiety, insomnia, phobias, and more.' },
          { icon: '🎚️', title: 'Tone control', body: 'Choose from calm, authoritative, compassionate, or energising therapeutic voices.' },
          { icon: '📋', title: 'Script history', body: 'Every generated script is saved to your account for review and reuse.' },
        ].map(({ icon, title, body }) => (
          <div key={title} className="card">
            <div className="text-2xl mb-3">{icon}</div>
            <h3 className="font-semibold text-white mb-1.5">{title}</h3>
            <p className="text-sm text-gray-500">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
