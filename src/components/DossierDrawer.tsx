import React from 'react';
import { X, Bookmark, Trash2, Download, ExternalLink, FileText, Sparkles } from 'lucide-react';
import { ResearchBreakthrough, ExpertProfile } from '../types/neurotech';

export interface SavedDossierItem {
  id: string;
  type: 'breakthrough' | 'expert' | 'synthesis';
  title: string;
  subtitle: string;
  content?: string;
  metadata?: string;
  savedAt: string;
}

interface DossierDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: SavedDossierItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onViewSynthesis: (title: string, content: string) => void;
}

export const DossierDrawer: React.FC<DossierDrawerProps> = ({
  isOpen,
  onClose,
  savedItems,
  onRemoveItem,
  onClearAll,
  onViewSynthesis,
}) => {
  if (!isOpen) return null;

  const handleExportMarkdown = () => {
    let markdown = `# SynapseCore Neurotech Engineering Dossier\nExported: ${new Date().toISOString()}\n\n`;

    savedItems.forEach((item, index) => {
      markdown += `## ${index + 1}. [${item.type.toUpperCase()}] ${item.title}\n`;
      markdown += `*${item.subtitle}*\n`;
      if (item.metadata) markdown += `Metadata: ${item.metadata}\n`;
      if (item.content) {
        markdown += `\n### Content / Synthesis:\n${item.content}\n`;
      }
      markdown += `\n---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synapscore_dossier_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs">
      <div
        className="relative flex flex-col w-full max-w-md h-full bg-slate-950 border-l border-slate-800 shadow-2xl"
        role="dialog"
        aria-label="Research Dossier"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Personal Research Dossier
            </h2>
            <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300">
              {savedItems.length} items
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            aria-label="Close dossier"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Bar */}
        {savedItems.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/40 border-b border-slate-800 text-xs">
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Markdown</span>
            </button>

            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-slate-500 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}

        {/* Drawer Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
              <Bookmark className="h-8 w-8 stroke-1 text-slate-600 mb-2" />
              <p className="text-xs font-medium text-slate-400">Your dossier is empty</p>
              <p className="mt-1 text-[11px] text-slate-500 max-w-xs">
                Click &ldquo;Save to Dossier&rdquo; on any breakthrough paper, clinical doctor profile, or synthesized report to compile your research here.
              </p>
            </div>
          ) : (
            savedItems.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-lg border border-slate-800 bg-slate-900/60 p-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                    {item.type}
                  </span>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors opacity-70 group-hover:opacity-100"
                    aria-label={`Remove ${item.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h3 className="mt-1 text-xs font-semibold text-white leading-snug">
                  {item.title}
                </h3>
                <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-2">
                  {item.subtitle}
                </p>

                {item.content && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => onViewSynthesis(item.title, item.content || '')}
                      className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>View Full Synthesis</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
