import React from 'react';
import { UserCheck, Stethoscope, Cpu, Bookmark, BookmarkCheck, Sparkles, Building2, ExternalLink } from 'lucide-react';
import { ExpertProfile } from '../types/neurotech';

interface ExpertCardProps {
  expert: ExpertProfile;
  isSaved: boolean;
  onToggleSave: (expert: ExpertProfile) => void;
  onDeepAnalyze: (query: string, context?: string) => void;
}

export const ExpertCard: React.FC<ExpertCardProps> = ({
  expert,
  isSaved,
  onToggleSave,
  onDeepAnalyze,
}) => {
  const isDoctor = expert.role === 'Clinical Neurosurgeon';

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700/80 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
            isDoctor
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
          }`}>
            {isDoctor ? <Stethoscope className="h-5 w-5" /> : <Cpu className="h-5 w-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white tracking-tight">
                {expert.name}
              </h3>
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <UserCheck className="h-3 w-3 text-cyan-400" />
                @{expert.verifiedEmailDomain}
              </span>
            </div>

            <p className="text-xs font-medium text-slate-300">
              {expert.title}
            </p>

            {/* Zero-Pill Institution & Lab Metadata */}
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <Building2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span>{expert.institution}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300">{expert.labName}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-500">{expert.location}</span>
            </div>
          </div>
        </div>

        {/* Collaboration Status Flag */}
        <div className="shrink-0 text-right">
          <span className="text-[11px] font-medium font-mono text-cyan-400">
            {expert.collaborationStatus}
          </span>
          <div className="mt-0.5 text-[10px] text-slate-500 font-mono">
            Status
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="mt-3 text-xs text-slate-300 leading-relaxed">
        {expert.bio}
      </p>

      {/* Focus Areas (Unboxed text with dots) */}
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span className="text-slate-500 font-medium">Core Focus:</span>
        {expert.researchFocus.map((focus, idx) => (
          <React.Fragment key={idx}>
            <span className="text-slate-300">{focus}</span>
            {idx < expert.researchFocus.length - 1 && (
              <span aria-hidden="true" className="text-slate-600">·</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Active Clinical Trials */}
      {expert.activeClinicalTrials.length > 0 && (
        <div className="mt-3 rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5 text-xs">
          <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-500">
            Active Clinical Trials / Investigational Registries
          </span>
          <ul className="mt-1 space-y-1 text-slate-300 font-mono text-[11px]">
            {expert.activeClinicalTrials.map((trial, idx) => (
              <li key={idx} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>{trial}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Metrics Row & Actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500">Publications: </span>
            <span className="font-semibold text-slate-200 tabular-nums">{expert.publicationsCount}</span>
          </div>
          <div>
            <span className="text-slate-500">h-index: </span>
            <span className="font-semibold text-slate-200 tabular-nums">{expert.hIndex}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {expert.forumLinks.map((link, idx) => (
            <a
              key={idx}
              href={`https://${link.handleOrUrl}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              <span>{link.platform}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}

          <button
            onClick={() => onToggleSave(expert)}
            aria-label={isSaved ? `Remove ${expert.name} from dossier` : `Save ${expert.name} to dossier`}
            className={`p-1.5 rounded-md border text-xs transition-colors flex items-center gap-1 ${
              isSaved
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {isSaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
            <span className="text-[11px]">{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={() => onDeepAnalyze(
              `${expert.name} ${expert.labName} neural engineering research`,
              `Focus: ${expert.researchFocus.join(', ')}. Active Trials: ${expert.activeClinicalTrials.join('; ')}`
            )}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 rounded-md hover:bg-cyan-900/50 transition-colors"
          >
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>Analyze Lab Research</span>
          </button>
        </div>
      </div>
    </article>
  );
};
