import React from 'react';
import { MessageSquare, Users, ShieldCheck, ExternalLink, Hash, ArrowUpRight } from 'lucide-react';
import { CommunityForum } from '../types/neurotech';

interface CommunityCardProps {
  community: CommunityForum;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({ community }) => {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700/80 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
            <MessageSquare className="h-5 w-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white tracking-tight">
                {community.name}
              </h3>
            </div>
            {/* Zero-Pill Metadata */}
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
              <span className="font-medium text-cyan-400">{community.type}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="flex items-center gap-1 font-mono tabular-nums text-slate-300">
                <Users className="h-3 w-3 text-slate-500" />
                {community.memberCount}
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">{community.accessType}</span>
            </div>
          </div>
        </div>

        <a
          href={community.url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors"
        >
          <span>Join / Access</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <p className="mt-3 text-xs text-slate-300 leading-relaxed">
        {community.description}
      </p>

      {/* Primary Discussion Topics */}
      <div className="mt-3">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
          Core Technical Channels & Topics
        </span>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {community.primaryTopics.map((topic, idx) => (
            <span
              key={idx}
              className="text-xs text-slate-300 font-mono"
            >
              #{topic}{idx < community.primaryTopics.length - 1 ? ' ·' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Specific Working Channels */}
      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5 text-xs font-mono">
        <span className="text-slate-500 text-[10px] uppercase tracking-wider">
          Active Rooms:
        </span>
        {community.keyChannels.map((channel, idx) => (
          <span key={idx} className="text-cyan-400 flex items-center gap-0.5">
            <Hash className="h-2.5 w-2.5 text-slate-500" />
            {channel}
          </span>
        ))}
      </div>
    </article>
  );
};
