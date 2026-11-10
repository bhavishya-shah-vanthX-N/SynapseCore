import React from 'react';
import { Search, Sparkles, Filter, X } from 'lucide-react';
import { NeurotechDomain } from '../types/neurotech';
import { PRESET_QUERIES } from '../data/neurotech-database';

interface SearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedDomain: NeurotechDomain;
  setSelectedDomain: (d: NeurotechDomain) => void;
  selectedPhase: string;
  setSelectedPhase: (p: string) => void;
  thinkingModeEnabled: boolean;
  setThinkingModeEnabled: (enabled: boolean) => void;
  onExecuteSearch: () => void;
  onDeepAnalyze: (query: string) => void;
  isSearching: boolean;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  selectedDomain,
  setSelectedDomain,
  selectedPhase,
  setSelectedPhase,
  thinkingModeEnabled,
  setThinkingModeEnabled,
  onExecuteSearch,
  onDeepAnalyze,
  isSearching,
}) => {
  const domainTabs: { id: NeurotechDomain; label: string }[] = [
    { id: 'all', label: 'All Domains' },
    { id: 'bci_decoding', label: 'BCI & Decoding' },
    { id: 'ai_neurology', label: 'AI & Neuromodulation' },
    { id: 'neuro_robotics', label: 'Neuro-Robotics' },
    { id: 'biochips', label: 'Biochips & CMOS' },
    { id: 'clinical_trials', label: 'Clinical Trials' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onExecuteSearch();
    }
  };

  return (
    <div className="w-full border-b border-slate-800 bg-slate-900/60 pb-6 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Editorial Subheading */}
        <div className="mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Neural Engineering & Clinical Search Engine
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl text-wrap-balance">
              Discover real-time BCI decoding, ultra-low-power neuromorphic biochips, robotic neuro-prosthetics, collaborating neurosurgeons, and peer working groups.
            </p>
          </div>

          {/* High Thinking Mode Toggle */}
          <div className="flex items-center gap-3 bg-slate-950/80 p-1.5 px-3 rounded-lg border border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className={`h-4 w-4 ${thinkingModeEnabled ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">High-Thinking Mode</span>
                <span className="text-[10px] text-slate-400 font-mono">gemini-4-argon · Deep Reasoning</span>
              </div>
            </div>
            <button
              onClick={() => setThinkingModeEnabled(!thinkingModeEnabled)}
              role="switch"
              aria-checked={thinkingModeEnabled}
              aria-label="Toggle High-Thinking Mode"
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                thinkingModeEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  thinkingModeEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Primary Search Input Row */}
        <div className="relative flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search BCI algorithms, real-time spike sorting, CMOS biochips, neurosurgeons, or clinical trials..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-11 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  onExecuteSearch();
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
                aria-label="Clear search query"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onExecuteSearch}
              disabled={isSearching}
              className="flex-1 sm:flex-initial px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 active:scale-95 transition-all whitespace-nowrap disabled:opacity-50"
            >
              {isSearching ? 'Querying...' : 'Search Engine'}
            </button>

            <button
              onClick={() => onDeepAnalyze(searchQuery || 'Real-time BCI closed-loop spike decoding and latency bounds')}
              className="px-4 py-3 text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 rounded-lg hover:bg-cyan-900/50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              title="Run Deep Synthesis using Gemini 4 Argon"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Deep Reason</span>
            </button>
          </div>
        </div>

        {/* Quick Query Presets */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-400 scrollbar-none">
          <span className="shrink-0 text-slate-500 font-medium">Quick Queries:</span>
          {PRESET_QUERIES.map((queryText, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(queryText);
                onDeepAnalyze(queryText);
              }}
              className="shrink-0 px-2.5 py-1 text-xs rounded-md bg-slate-800/80 hover:bg-slate-700 hover:text-slate-200 text-slate-300 border border-slate-700/60 transition-colors whitespace-nowrap"
            >
              {queryText}
            </button>
          ))}
        </div>

        {/* Domain Filters & Phase Selector */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          {/* Interactive domain filter buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {domainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedDomain(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedDomain === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Phase Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <label htmlFor="phase-select" className="text-xs text-slate-400 whitespace-nowrap">
              Clinical Stage:
            </label>
            <select
              id="phase-select"
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="text-xs bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Stages</option>
              <option value="Preclinical">Preclinical</option>
              <option value="Phase I Early Feasibility">Phase I Early Feasibility</option>
              <option value="Phase II IDE">Phase II IDE</option>
              <option value="FDA Approved / CE Mark">FDA Approved / CE Mark</option>
              <option value="Investigational Device">Investigational Device</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
