import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import SymptomForm from '../components/SymptomForm.jsx';
import ScriptViewer from '../components/ScriptViewer.jsx';
import { scripts as scriptsApi } from '../lib/api.js';

export default function Dashboard() {
  const [scriptList, setScriptList] = useState([]);
  const [activeScript, setActiveScript] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [panel, setPanel] = useState('form'); // 'form' | 'viewer' (mobile toggle)

  // Load history on mount
  useEffect(() => {
    scriptsApi.list()
      .then(({ scripts }) => {
        setScriptList(scripts);
        if (scripts.length > 0) setActiveScript(scripts[0]);
      })
      .catch(console.error)
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleGenerate = useCallback(async (params) => {
    setGenerating(true);
    setPanel('viewer');
    try {
      const script = await scriptsApi.generate(params);
      setScriptList((prev) => [script, ...prev]);
      setActiveScript(script);
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
      setPanel('form');
    } finally {
      setGenerating(false);
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!confirm('Delete this script?')) return;
    await scriptsApi.delete(id);
    setScriptList((prev) => prev.filter((s) => s.id !== id));
    if (activeScript?.id === id) setActiveScript(scriptList.find((s) => s.id !== id) ?? null);
  }, [activeScript, scriptList]);

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      <Header />

      <div className="flex flex-1 pt-14 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          scripts={scriptList}
          activeId={activeScript?.id ?? null}
          onSelect={(s) => { setActiveScript(s); setPanel('viewer'); }}
          onDelete={handleDelete}
          loading={loadingHistory}
        />

        {/* Main area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Form panel */}
          <div className={`w-80 shrink-0 border-r border-border bg-panel overflow-y-auto p-6 ${panel === 'form' ? 'block' : 'hidden md:block'}`}>
            <h2 className="text-sm font-semibold text-white mb-5">New script</h2>
            <SymptomForm onGenerate={handleGenerate} generating={generating} />
          </div>

          {/* Script viewer */}
          <div className={`flex-1 flex overflow-hidden ${panel === 'viewer' ? 'flex' : 'hidden md:flex'}`}>
            <ScriptViewer script={activeScript} loading={generating} />
          </div>
        </div>
      </div>
    </div>
  );
}
