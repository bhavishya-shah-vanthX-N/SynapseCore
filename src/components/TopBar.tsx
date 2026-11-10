import React from 'react';
import { Bookmark, Cpu } from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  savedCount: number;
  onOpenDossier: () => void;
  onOpenBciLab: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  savedCount,
  onOpenDossier,
  onOpenBciLab,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('breakthroughs')}
          className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-cyan-400 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu className="h-4 w-4" />
          </div>
          <span>SynapseCore</span>
        </button>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onSelectTab('breakthroughs')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'breakthroughs'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Breakthroughs
          </button>
          <button
            onClick={() => onSelectTab('experts')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'experts'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Doctors & Engineers
          </button>
          <button
            onClick={() => onSelectTab('institutions')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'institutions'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Institutions & Labs
          </button>
          <button
            onClick={() => onSelectTab('communities')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'communities'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Communities & Forums
          </button>
          <button
            onClick={() => onSelectTab('bci-workbench')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'bci-workbench'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            BCI Lab & DSP
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenDossier}
            aria-label="View Research Dossier"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Bookmark className="h-3.5 w-3.5 text-cyan-400" />
            <span>Dossier</span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono bg-cyan-500/20 text-cyan-300 rounded">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenBciLab}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 active:scale-95 transition-all whitespace-nowrap shrink-0 shadow-sm shadow-cyan-950"
          >
            <Cpu className="h-3.5 w-3.5 text-slate-950" />
            <span>Launch BCI Lab</span>
          </button>
        </div>
      </div>
    </header>
  );
};
