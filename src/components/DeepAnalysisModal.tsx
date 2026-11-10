import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Cpu,
  Brain,
  Download,
  Terminal,
} from 'lucide-react';

interface DeepAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  analysisMarkdown: string;
  modelUsed: string;
  thinkingMode: boolean;
  isLoading: boolean;
  error?: string | null;
  onSaveToDossier: (title: string, content: string) => void;
  isSaved?: boolean;
}

export const DeepAnalysisModal: React.FC<DeepAnalysisModalProps> = ({
  isOpen,
  onClose,
  query,
  analysisMarkdown,
  modelUsed,
  thinkingMode,
  isLoading,
  error,
  onSaveToDossier,
  isSaved,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(analysisMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([analysisMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synapscore_analysis_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="analysis-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="analysis-title" className="text-base font-bold text-white tracking-tight">
                  High-Thinking Neurotechnology Synthesis
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {modelUsed} · ThinkingLevel.HIGH
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xl">
                Topic: {query}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isLoading && analysisMarkdown && (
              <>
                <button
                  onClick={handleCopy}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 transition-colors"
                  title="Copy analysis Markdown"
                  aria-label="Copy analysis text"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 transition-colors"
                  title="Export to Markdown File"
                  aria-label="Download markdown report"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onSaveToDossier(query, analysisMarkdown)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                    isSaved
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
                  }`}
                >
                  {isSaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                  <span>{isSaved ? 'In Dossier' : 'Save to Dossier'}</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-slate-200">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-4 animate-pulse">
                <Brain className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Deep Neural Reasoning in Progress...
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-md">
                Gemini 4 Argon is executing multi-step thinking across biochip analog front-ends, continuous state-space spike decoding, and clinical feasibility.
              </p>
              <div className="mt-4 flex items-center gap-1 text-[11px] font-mono text-cyan-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>Evaluating sub-millisecond latency & tissue thermal dissipation margins</span>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 p-5 text-center">
              <h4 className="text-sm font-semibold text-rose-300">Synthesis Error</h4>
              <p className="mt-1 text-xs text-rose-400/90">{error}</p>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none text-sm leading-relaxed space-y-4">
              {/* Render formatted markdown blocks */}
              {analysisMarkdown.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h4 key={index} className="text-base font-bold text-white pt-2 border-b border-slate-800 pb-1">
                      {paragraph.replace('### ', '')}
                    </h4>
                  );
                } else if (paragraph.startsWith('## ')) {
                  return (
                    <h3 key={index} className="text-lg font-bold text-cyan-300 pt-3 border-b border-slate-800 pb-1">
                      {paragraph.replace('## ', '')}
                    </h3>
                  );
                } else if (paragraph.startsWith('# ')) {
                  return (
                    <h2 key={index} className="text-xl font-bold text-white pt-4">
                      {paragraph.replace('# ', '')}
                    </h2>
                  );
                } else if (paragraph.startsWith('```')) {
                  const cleaned = paragraph.replace(/```[a-z]*/g, '').trim();
                  return (
                    <pre key={index} className="p-3 rounded-lg bg-slate-900 font-mono text-xs text-cyan-300 overflow-x-auto border border-slate-800">
                      <code>{cleaned}</code>
                    </pre>
                  );
                } else if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                  const items = paragraph.split('\n').filter(Boolean);
                  return (
                    <ul key={index} className="list-disc list-inside space-y-1 text-slate-300">
                      {items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          {item.replace(/^[-*]\s+/, '')}
                        </li>
                      ))}
                    </ul>
                  );
                } else if (/^\d+\.\s/.test(paragraph)) {
                  const items = paragraph.split('\n').filter(Boolean);
                  return (
                    <ol key={index} className="list-decimal list-inside space-y-1.5 text-slate-300">
                      {items.map((item, itemIdx) => (
                        <li key={itemIdx} className="leading-relaxed">
                          {item.replace(/^\d+\.\s+/, '')}
                        </li>
                      ))}
                    </ol>
                  );
                }
                return (
                  <p key={index} className="text-slate-300">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900/60 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <Terminal className="h-3.5 w-3.5 text-slate-500" />
            <span>Targeting sub-20ms closed loop &lt;50μW power dissipation</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 rounded-lg hover:text-white hover:bg-slate-750 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
