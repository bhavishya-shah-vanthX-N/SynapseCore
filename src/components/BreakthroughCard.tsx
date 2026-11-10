import React, { useState } from 'react';
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Cpu, Sparkles, ExternalLink } from 'lucide-react';
import { ResearchBreakthrough } from '../types/neurotech';

interface BreakthroughCardProps {
  breakthrough: ResearchBreakthrough;
  isSaved: boolean;
  onToggleSave: (item: ResearchBreakthrough) => void;
  onDeepAnalyze: (query: string, context?: string) => void;
}

export const BreakthroughCard: React.FC<BreakthroughCardProps> = ({
  breakthrough,
  isSaved,
  onToggleSave,
  onDeepAnalyze,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700/80 transition-colors">
      {/* Zero-Pill Metadata Line */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span className="font-semibold text-cyan-400">{breakthrough.journal}</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span className="font-mono tabular-nums">{breakthrough.year}</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span className="text-slate-300 font-medium">{breakthrough.clinicalPhase}</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span className="font-mono tabular-nums">{breakthrough.citationCount} citations</span>
      </div>

      {/* Title */}
      <h3 className="mt-2 text-lg font-semibold text-white tracking-tight hover:text-cyan-300 transition-colors">
        {breakthrough.title}
      </h3>

      {/* Authors and Institutions */}
      <p className="mt-1 text-xs text-slate-400">
        <span className="text-slate-300">{breakthrough.authors.slice(0, 3).join(', ')}</span>
        {breakthrough.authors.length > 3 && ' et al.'}
        <span className="mx-1 text-slate-600">/</span>
        <span className="italic text-slate-400">{breakthrough.institutions.join(' · ')}</span>
      </p>

      {/* Abstract */}
      <p className="mt-3 text-sm text-slate-300 leading-relaxed">
        {breakthrough.abstract}
      </p>

      {/* Technical Hardware Specs Grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-lg border border-slate-800/80 bg-slate-950/60 p-3">
        <div>
          <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-500">
            Channel Count
          </span>
          <span className="text-sm font-semibold text-slate-100 font-mono tabular-nums">
            {breakthrough.hardwareSpecs.channelCount} ch
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-500">
            Sampling Rate
          </span>
          <span className="text-sm font-semibold text-slate-100 font-mono tabular-nums">
            {breakthrough.hardwareSpecs.samplingRateKHz} kS/s
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-500">
            Decoder Latency
          </span>
          <span className="text-sm font-semibold text-emerald-400 font-mono tabular-nums">
            {breakthrough.hardwareSpecs.latencyMs} ms
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-500">
            Power Budget
          </span>
          <span className="text-sm font-semibold text-slate-100 font-mono tabular-nums">
            {breakthrough.hardwareSpecs.powerConsumptionMicroWatts ? `${breakthrough.hardwareSpecs.powerConsumptionMicroWatts} μW` : 'Passive'}
          </span>
        </div>
      </div>

      {/* Expandable Technical Section */}
      {isExpanded && (
        <div className="mt-4 space-y-3 pt-3 border-t border-slate-800 text-xs">
          <div>
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              Methodology & DSP Architecture
            </h4>
            <p className="mt-1 text-slate-400 leading-relaxed">
              {breakthrough.methodology}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              Electrode & Implant Topology
            </h4>
            <p className="mt-1 text-slate-400 font-mono text-[11px]">
              {breakthrough.hardwareSpecs.implantType}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              Collaborating Research Labs
            </h4>
            <p className="mt-1 text-slate-400">
              {breakthrough.collaboratingLabs.join(' · ')}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="text-slate-500 font-mono">DOI: {breakthrough.doi}</span>
            <a
              href={`https://doi.org/${breakthrough.doi}`}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>View Source</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* Card Actions */}
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/60">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          {isExpanded ? (
            <>
              <span>Hide Technical Details</span>
              <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              <span>View Technical Details</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleSave(breakthrough)}
            aria-label={isSaved ? `Remove ${breakthrough.title} from dossier` : `Save ${breakthrough.title} to dossier`}
            className={`p-1.5 rounded-md border text-xs transition-colors flex items-center gap-1 ${
              isSaved
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {isSaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
            <span className="text-[11px]">{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={() => onDeepAnalyze(breakthrough.title, breakthrough.abstract)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 rounded-md hover:bg-cyan-900/50 transition-colors"
          >
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>Deep Synthesis</span>
          </button>
        </div>
      </div>
    </article>
  );
};
