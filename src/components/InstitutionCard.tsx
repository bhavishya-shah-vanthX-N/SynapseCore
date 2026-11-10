import React from 'react';
import { Landmark, Users, Briefcase, ExternalLink, Sparkles } from 'lucide-react';
import { AcademicInstitution } from '../types/neurotech';

interface InstitutionCardProps {
  institution: AcademicInstitution;
  onDeepAnalyze: (query: string, context?: string) => void;
}

export const InstitutionCard: React.FC<InstitutionCardProps> = ({
  institution,
  onDeepAnalyze,
}) => {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700/80 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
            <Landmark className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              {institution.name}
            </h3>
            <p className="text-xs text-slate-400">
              {institution.location}
            </p>
          </div>
        </div>

        {institution.openPostdocsAndFellowships > 0 && (
          <div className="shrink-0 text-right">
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <Briefcase className="h-3 w-3" />
              <span>{institution.openPostdocsAndFellowships} Postdocs / Fellowships</span>
            </span>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-300 leading-relaxed">
        {institution.specialtyHighlight}
      </p>

      {/* Core Facilities */}
      <div className="mt-3">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
          Core Research Infrastructure
        </span>
        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-400">
          {institution.coreFacilities.map((fac, idx) => (
            <React.Fragment key={idx}>
              <span className="text-slate-300">{fac}</span>
              {idx < institution.coreFacilities.length - 1 && (
                <span aria-hidden="true" className="text-slate-600">·</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Prominent PIs & Current Collaborations */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5 text-xs">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
            Leading Principal Investigators
          </span>
          <div className="mt-1 text-slate-300">
            {institution.prominentPIs.join(', ')}
          </div>
        </div>

        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
            Consortia & Grant Collaborations
          </span>
          <div className="mt-1 text-slate-300">
            {institution.currentCollaborations.join(', ')}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/60">
        <a
          href={institution.website}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-cyan-400 hover:underline flex items-center gap-1 transition-colors"
        >
          <span>Visit Institute Portal</span>
          <ExternalLink className="h-3 w-3" />
        </a>

        <button
          onClick={() => onDeepAnalyze(
            `${institution.name} neural engineering and BCI publications`,
            `Specialty: ${institution.specialtyHighlight}. PIs: ${institution.prominentPIs.join(', ')}`
          )}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 rounded-md hover:bg-cyan-900/50 transition-colors"
        >
          <Sparkles className="h-3 w-3 text-cyan-400" />
          <span>Synthesize Research Portfolio</span>
        </button>
      </div>
    </article>
  );
};
