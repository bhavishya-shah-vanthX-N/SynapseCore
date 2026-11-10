/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { SearchHeader } from './components/SearchHeader';
import { BreakthroughCard } from './components/BreakthroughCard';
import { ExpertCard } from './components/ExpertCard';
import { InstitutionCard } from './components/InstitutionCard';
import { CommunityCard } from './components/CommunityCard';
import { BciInteractiveLab } from './components/BciInteractiveLab';
import { DeepAnalysisModal } from './components/DeepAnalysisModal';
import { DossierDrawer, SavedDossierItem } from './components/DossierDrawer';
import {
  ResearchBreakthrough,
  ExpertProfile,
  AcademicInstitution,
  CommunityForum,
  NeurotechDomain,
} from './types/neurotech';
import {
  RESEARCH_BREAKTHROUGHS,
  EXPERT_PROFILES,
  ACADEMIC_INSTITUTIONS,
  COMMUNITY_FORUMS,
} from './data/neurotech-database';
import { scoreSearchMatch } from './utils/neural-dsp';
import { Cpu, Search, Sparkles, Building2, Users, FileText } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('breakthroughs');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<NeurotechDomain>('all');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [thinkingModeEnabled, setThinkingModeEnabled] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Search results state
  const [breakthroughs, setBreakthroughs] = useState<ResearchBreakthrough[]>(RESEARCH_BREAKTHROUGHS);
  const [experts, setExperts] = useState<ExpertProfile[]>(EXPERT_PROFILES);
  const [institutions, setInstitutions] = useState<AcademicInstitution[]>(ACADEMIC_INSTITUTIONS);
  const [communities, setCommunities] = useState<CommunityForum[]>(COMMUNITY_FORUMS);

  // Deep Analysis Modal state
  const [analysisModalOpen, setAnalysisModalOpen] = useState<boolean>(false);
  const [analysisQuery, setAnalysisQuery] = useState<string>('');
  const [analysisContent, setAnalysisContent] = useState<string>('');
  const [analysisModel, setAnalysisModel] = useState<string>('gemini-4-argon');
  const [analysisLoading, setAnalysisLoading] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Saved Dossier state (stored in localStorage)
  const [dossierDrawerOpen, setDossierDrawerOpen] = useState<boolean>(false);
  const [savedItems, setSavedItems] = useState<SavedDossierItem[]>(() => {
    try {
      const stored = localStorage.getItem('synapscore_dossier');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save dossier to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('synapscore_dossier', JSON.stringify(savedItems));
    } catch (e) {
      console.warn('Could not persist dossier', e);
    }
  }, [savedItems]);

  // Execute Search via Server API with fast client fallback
  const handleExecuteSearch = async () => {
    setIsSearching(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          domain: selectedDomain,
          phase: selectedPhase,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBreakthroughs(data.results.breakthroughs);
        setExperts(data.results.experts);
        setInstitutions(data.results.institutions);
        setCommunities(data.results.communities);
      } else {
        performClientSideSearch();
      }
    } catch (err) {
      console.warn('Server search unavailable, falling back to local client search:', err);
      performClientSideSearch();
    } finally {
      setIsSearching(false);
    }
  };

  const performClientSideSearch = () => {
    const q = searchQuery.trim();

    // Breakthroughs
    let bt = RESEARCH_BREAKTHROUGHS.map((item) => ({
      ...item,
      matchScore: q ? scoreSearchMatch(q, item) : 10,
    }));
    if (q) {
      bt = bt.filter((item) => item.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);
    }
    if (selectedDomain !== 'all') {
      bt = bt.filter((item) => item.domain === selectedDomain);
    }
    if (selectedPhase !== 'all') {
      bt = bt.filter((item) => item.clinicalPhase === selectedPhase);
    }
    setBreakthroughs(bt);

    // Experts
    let exp = EXPERT_PROFILES.map((e) => ({
      ...e,
      matchScore: q
        ? scoreSearchMatch(q, {
            title: `${e.name} ${e.title} ${e.role}`,
            abstract: e.bio,
            institutions: [e.institution, e.labName],
            tags: e.researchFocus,
          })
        : 10,
    }));
    if (q) {
      exp = exp.filter((e) => e.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);
    }
    setExperts(exp);

    // Institutions
    let inst = ACADEMIC_INSTITUTIONS.map((i) => ({
      ...i,
      matchScore: q
        ? scoreSearchMatch(q, {
            title: i.name,
            abstract: i.specialtyHighlight,
            institutions: i.departments,
            tags: [...i.coreFacilities, ...i.prominentPIs],
          })
        : 10,
    }));
    if (q) {
      inst = inst.filter((i) => i.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);
    }
    setInstitutions(inst);

    // Communities
    let com = COMMUNITY_FORUMS.map((c) => ({
      ...c,
      matchScore: q
        ? scoreSearchMatch(q, {
            title: c.name,
            abstract: c.description,
            tags: [...c.primaryTopics, ...c.keyChannels],
          })
        : 10,
    }));
    if (q) {
      com = com.filter((c) => c.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);
    }
    setCommunities(com);
  };

  // Re-run search whenever domain or phase filter changes
  useEffect(() => {
    handleExecuteSearch();
  }, [selectedDomain, selectedPhase]);

  // Handle Deep Analysis with Gemini High-Thinking
  const handleDeepAnalyze = async (queryText: string, context?: string) => {
    const targetQuery = queryText || searchQuery || 'Real-time neural spike sorting and BCI latency bounds';
    setAnalysisQuery(targetQuery);
    setAnalysisModalOpen(true);
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisContent('');

    try {
      const res = await fetch('/api/deep-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: targetQuery,
          topicContext: context,
          userSpecialization:
            'Complex integrated neurological and technological systems, specifically Brain-Computer Interface (BCI) development and real-time neural data processing',
        }),
      });

      if (!res.ok) {
        throw new Error(`Synthesis server returned status ${res.status}`);
      }

      const data = await res.json();
      setAnalysisContent(data.analysisMarkdown);
      setAnalysisModel(data.modelUsed || 'gemini-4-argon');
    } catch (err: unknown) {
      console.error('Deep analysis request failed:', err);
      // Fallback local comprehensive technical synthesis
      setAnalysisError(
        'Server analysis endpoint could not be reached. Showing cached high-precision neural engineering review.'
      );
      setAnalysisContent(`### Executive Technical Review: ${targetQuery}

1. **Sub-millisecond Latency Pipeline Architecture**
- Signal acquisition from 1,024-channel microelectrode array with sampling rate $\ge 30\\text{ kS/s}$ per channel.
- Hardware-accelerated Common Average Referencing (CAR) implemented in digital FPGA logic before DMA buffer transfer.
- Real-time continuous spike thresholding: $\\text{Threshold} = -4.0 \\times \\frac{\\text{median}(|x|)}{0.6745}$.
- Decoder inference using state-space recurrent model running in $<2.5\\text{ms}$ latency budget.

2. **Ultra-Low-Power Biochip & Neural Interface Specs**
- Input-referred noise: $<2.2\\,\\mu\\text{V}_{\\text{rms}}$ across $300\\text{ Hz} - 6\\text{ kHz}$.
- Total implant power dissipation capped strictly at $<40\\,\\mu\\text{W}$ per 512 channels to adhere to ISO 14708 limits ($<1^\\circ\\text{C}$ local tissue heating).
- Hermetic encapsulation: High-purity alumina ceramic package with laser-welded platinum-iridium feedthroughs.

3. **Leading Academic Labs & Clinical Trials**
- **Stanford NPSL** (Shenoy / Henderson): High-speed neural handwriting and intracortical robotic control.
- **UCSF Center for Neural Engineering** (Chang): Direct speech synthesis from high-density $\\mu\\text{ECoG}$ grids.
- **Brown / MGH BrainGate Consortium** (Hochberg): Multi-decade clinical translation for tetraplegia.

4. **Working Groups & Engineering Communities**
- **NeurotechX Discord** (\`#signal-processing\`, \`#hardware-design\`)
- **IEEE EMBS Neural Systems & Rehabilitation Technical Committee**
- **Brain-Computer Interface Society**`);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Dossier Toggle Handlers
  const handleToggleSaveBreakthrough = (item: ResearchBreakthrough) => {
    const exists = savedItems.some((s) => s.id === item.id);
    if (exists) {
      setSavedItems(savedItems.filter((s) => s.id !== item.id));
    } else {
      const newItem: SavedDossierItem = {
        id: item.id,
        type: 'breakthrough',
        title: item.title,
        subtitle: `${item.journal} (${item.year}) · ${item.institutions.join(', ')}`,
        content: `Abstract: ${item.abstract}\nMethodology: ${item.methodology}\nHardware: ${item.hardwareSpecs.channelCount} ch, ${item.hardwareSpecs.samplingRateKHz} kS/s, ${item.hardwareSpecs.latencyMs} ms latency.\nClinical Phase: ${item.clinicalPhase}\nDOI: ${item.doi}`,
        savedAt: new Date().toISOString(),
      };
      setSavedItems([newItem, ...savedItems]);
    }
  };

  const handleToggleSaveExpert = (expert: ExpertProfile) => {
    const exists = savedItems.some((s) => s.id === expert.id);
    if (exists) {
      setSavedItems(savedItems.filter((s) => s.id !== expert.id));
    } else {
      const newItem: SavedDossierItem = {
        id: expert.id,
        type: 'expert',
        title: expert.name,
        subtitle: `${expert.role} · ${expert.institution} (${expert.labName})`,
        content: `Bio: ${expert.bio}\nFocus: ${expert.researchFocus.join(', ')}\nActive Trials: ${expert.activeClinicalTrials.join('; ')}\nStatus: ${expert.collaborationStatus}\nEmail Domain: @${expert.verifiedEmailDomain}`,
        savedAt: new Date().toISOString(),
      };
      setSavedItems([newItem, ...savedItems]);
    }
  };

  const handleSaveSynthesisToDossier = (title: string, content: string) => {
    const id = `synthesis-${Date.now()}`;
    const newItem: SavedDossierItem = {
      id,
      type: 'synthesis',
      title: `Synthesis: ${title}`,
      subtitle: `Gemini High-Thinking Neural Review (${new Date().toLocaleDateString()})`,
      content,
      savedAt: new Date().toISOString(),
    };
    setSavedItems([newItem, ...savedItems]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        savedCount={savedItems.length}
        onOpenDossier={() => setDossierDrawerOpen(true)}
        onOpenBciLab={() => setActiveTab('bci-workbench')}
      />

      {/* Main Search Console */}
      <SearchHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedDomain={selectedDomain}
        setSelectedDomain={setSelectedDomain}
        selectedPhase={selectedPhase}
        setSelectedPhase={setSelectedPhase}
        thinkingModeEnabled={thinkingModeEnabled}
        setThinkingModeEnabled={setThinkingModeEnabled}
        onExecuteSearch={handleExecuteSearch}
        onDeepAnalyze={handleDeepAnalyze}
        isSearching={isSearching}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: Breakthroughs */}
        {activeTab === 'breakthroughs' && (
          <section aria-labelledby="breakthroughs-heading">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id="breakthroughs-heading" className="text-xl font-bold text-white tracking-tight">
                  Ongoing Technological Breakthroughs
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing {breakthroughs.length} peer-reviewed discoveries across neurology, AI/ML, robotics, and biochip hardware.
                </p>
              </div>
            </div>

            {breakthroughs.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
                <Search className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                <h3 className="text-sm font-semibold text-white">No breakthroughs found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting your keywords or clearing the domain filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {breakthroughs.map((item) => (
                  <BreakthroughCard
                    key={item.id}
                    breakthrough={item}
                    isSaved={savedItems.some((s) => s.id === item.id)}
                    onToggleSave={handleToggleSaveBreakthrough}
                    onDeepAnalyze={handleDeepAnalyze}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: Doctors & Engineers */}
        {activeTab === 'experts' && (
          <section aria-labelledby="experts-heading">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id="experts-heading" className="text-xl font-bold text-white tracking-tight">
                  Leading Neurosurgeons, Neural Engineers & Biochip Architects
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing {experts.length} verified researchers and clinical investigators active in BCI, robotics, and neural modulation.
                </p>
              </div>
            </div>

            {experts.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
                <Users className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                <h3 className="text-sm font-semibold text-white">No experts found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Try searching by lab name, clinical focus, or institution.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experts.map((expert) => (
                  <ExpertCard
                    key={expert.id}
                    expert={expert}
                    isSaved={savedItems.some((s) => s.id === expert.id)}
                    onToggleSave={handleToggleSaveExpert}
                    onDeepAnalyze={handleDeepAnalyze}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: Academic Institutions & Collaborations */}
        {activeTab === 'institutions' && (
          <section aria-labelledby="institutions-heading">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id="institutions-heading" className="text-xl font-bold text-white tracking-tight">
                  Collaborating Academic Institutions & Neuro-Engineering Labs
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  World-class cleanrooms, animal surgical suites, 7T MRI facilities, and open postdoc positions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {institutions.map((institution) => (
                <InstitutionCard
                  key={institution.id}
                  institution={institution}
                  onDeepAnalyze={handleDeepAnalyze}
                />
              ))}
            </div>
          </section>
        )}

        {/* TAB 4: Communities & Forums */}
        {activeTab === 'communities' && (
          <section aria-labelledby="communities-heading">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id="communities-heading" className="text-xl font-bold text-white tracking-tight">
                  Professional Working Groups & Engineering Communities
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Join active Discord servers, IEEE EMBS technical committees, preprint peer discussion groups, and open hardware hubs.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
          </section>
        )}

        {/* TAB 5: BCI Workbench & Real-Time DSP Lab */}
        {activeTab === 'bci-workbench' && (
          <section aria-labelledby="workbench-heading">
            <BciInteractiveLab onDeepAnalyze={handleDeepAnalyze} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-500" />
            <span className="font-semibold text-slate-400">SynapseCore</span>
            <span>·</span>
            <span>Neurotechnology & BCI Intelligence Engine</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Gemini 4 Argon & ThinkingLevel.HIGH</span>
            <span>·</span>
            <button
              onClick={() => setActiveTab('bci-workbench')}
              className="text-cyan-400 hover:underline"
            >
              Interactive DSP Oscilloscope
            </button>
          </div>
        </div>
      </footer>

      {/* Deep Analysis Modal */}
      <DeepAnalysisModal
        isOpen={analysisModalOpen}
        onClose={() => setAnalysisModalOpen(false)}
        query={analysisQuery}
        analysisMarkdown={analysisContent}
        modelUsed={analysisModel}
        thinkingMode={thinkingModeEnabled}
        isLoading={analysisLoading}
        error={analysisError}
        onSaveToDossier={handleSaveSynthesisToDossier}
        isSaved={savedItems.some((s) => s.title.includes(analysisQuery))}
      />

      {/* Dossier Drawer */}
      <DossierDrawer
        isOpen={dossierDrawerOpen}
        onClose={() => setDossierDrawerOpen(false)}
        savedItems={savedItems}
        onRemoveItem={(id) => setSavedItems(savedItems.filter((s) => s.id !== id))}
        onClearAll={() => setSavedItems([])}
        onViewSynthesis={(title, content) => {
          setAnalysisQuery(title);
          setAnalysisContent(content);
          setAnalysisModalOpen(true);
          setDossierDrawerOpen(false);
        }}
      />
    </div>
  );
}
