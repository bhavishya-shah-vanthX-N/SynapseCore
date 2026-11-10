import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  RESEARCH_BREAKTHROUGHS,
  EXPERT_PROFILES,
  ACADEMIC_INSTITUTIONS,
  COMMUNITY_FORUMS,
} from './src/data/neurotech-database.ts';
import { scoreSearchMatch } from './src/utils/neural-dsp.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI with required headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'SynapseCore Neurotech Intelligence Engine',
  });
});

// Structured Search Endpoint
app.post('/api/search', (req, res) => {
  try {
    const { query = '', domain = 'all', phase = 'all' } = req.body;
    const cleanQuery = typeof query === 'string' ? query.trim() : '';

    // Filter and score breakthroughs
    let breakthroughs = RESEARCH_BREAKTHROUGHS.map((item) => {
      const score = cleanQuery ? scoreSearchMatch(cleanQuery, item) : 10;
      return { ...item, matchScore: score };
    });

    if (cleanQuery) {
      breakthroughs = breakthroughs.filter((item) => item.matchScore > 0);
      breakthroughs.sort((a, b) => b.matchScore - a.matchScore);
    }

    if (domain !== 'all') {
      breakthroughs = breakthroughs.filter((item) => item.domain === domain);
    }
    if (phase !== 'all') {
      breakthroughs = breakthroughs.filter((item) => item.clinicalPhase === phase);
    }

    // Filter and score experts
    let experts = EXPERT_PROFILES.map((expert) => {
      let score = 10;
      if (cleanQuery) {
        score = scoreSearchMatch(cleanQuery, {
          title: expert.name + ' ' + expert.title + ' ' + expert.role,
          abstract: expert.bio,
          institutions: [expert.institution, expert.labName],
          tags: expert.researchFocus,
        });
      }
      return { ...expert, matchScore: score };
    });

    if (cleanQuery) {
      experts = experts.filter((e) => e.matchScore > 0);
      experts.sort((a, b) => b.matchScore - a.matchScore);
    }

    // Filter institutions
    let institutions = ACADEMIC_INSTITUTIONS.map((inst) => {
      let score = 10;
      if (cleanQuery) {
        score = scoreSearchMatch(cleanQuery, {
          title: inst.name,
          abstract: inst.specialtyHighlight,
          institutions: inst.departments,
          tags: [...inst.coreFacilities, ...inst.prominentPIs],
        });
      }
      return { ...inst, matchScore: score };
    });

    if (cleanQuery) {
      institutions = institutions.filter((i) => i.matchScore > 0);
      institutions.sort((a, b) => b.matchScore - a.matchScore);
    }

    // Filter communities
    let communities = COMMUNITY_FORUMS.map((com) => {
      let score = 10;
      if (cleanQuery) {
        score = scoreSearchMatch(cleanQuery, {
          title: com.name,
          abstract: com.description,
          tags: [...com.primaryTopics, ...com.keyChannels],
        });
      }
      return { ...com, matchScore: score };
    });

    if (cleanQuery) {
      communities = communities.filter((c) => c.matchScore > 0);
      communities.sort((a, b) => b.matchScore - a.matchScore);
    }

    res.json({
      query: cleanQuery,
      domain,
      counts: {
        breakthroughs: breakthroughs.length,
        experts: experts.length,
        institutions: institutions.length,
        communities: communities.length,
      },
      results: {
        breakthroughs,
        experts,
        institutions,
        communities,
      },
    });
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ error: 'Search processing failed' });
  }
});

// Deep High-Thinking Neurotechnology Synthesis API
app.post('/api/deep-analysis', async (req, res) => {
  const { query, topicContext, userSpecialization } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'A valid query string is required' });
  }

  const prompt = `You are a world-class neurotech research director, principal neural engineer, and clinical neurosurgeon.
The user is asking for an in-depth technological, mathematical, and translational analysis of this neurotechnology query:
"${query}"

User Specialization Context: ${userSpecialization || 'Complex integrated neurological and technological systems, specifically Brain-Computer Interface (BCI) development and real-time neural data processing'}.
Additional System Context: ${topicContext || 'Cutting-edge neurology integration with AI, ML, robotics, and biochip microelectrode hardware'}.

Produce a comprehensive, peer-reviewed grade engineering breakdown in Markdown. Include:
1. Executive Technical Summary & State-of-the-Art (2025-2026 status)
2. Biochip & Neural Hardware Interface (Electrodes, active CMOS shanks, input-referred noise specs, CMRR, power budget <50μW/mm² to prevent cortical heating)
3. Real-Time Neural DSP & Feature Extraction Pipeline (Common Average Referencing CAR, digital filtering, sub-millisecond spike thresholding/sorting, wavelet vs PCA, latency budget)
4. AI/ML Neural Decoding Architecture (Kalman filters, State-Space Models, Transformers, recurrent neural network decoders, intended movement or speech reconstruction)
5. Neuro-Robotics & Closed-Loop Actuation (Bidirectional sensory feedback, FES, robotic limb or orthosis synchronization, latency targets <20ms)
6. Prominent Academic Institutions & Principal Investigators driving this research (Stanford, UCSF, EPFL, Brown, JHU, MIT, etc.)
7. Active Working Groups, Communities & Forums (IEEE EMBS, NeurotechX channels, BCI Society, preprint hubs)
8. Critical Engineering Bottlenecks & Future Roadmap for BCI Engineers`;

  try {
    // Attempt with requested gemini-4-argon with high thinking level
    let responseText = '';
    let modelUsed = 'gemini-4-argon';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-argon',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an authoritative Senior Neural Engineer and Clinical BCI Scientist providing rigorous mathematical and hardware specifications. Use precise units (μV, kS/s, ms, mW, nm) and avoid superficial generalities.',
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      });
      responseText = response.text || '';
    } catch (argonError: unknown) {
      console.warn('Argon request fell back to gemini-3.8-flash:', (argonError as Error)?.message);
      modelUsed = 'gemini-3.8-flash';
      // Graceful fallback to gemini-3.8-flash with HIGH thinking level
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an authoritative Senior Neural Engineer and Clinical BCI Scientist providing rigorous mathematical and hardware specifications.',
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      });
      responseText = fallbackResponse.text || '';
    }

    res.json({
      query,
      modelUsed,
      thinkingLevel: 'HIGH',
      timestamp: new Date().toISOString(),
      analysisMarkdown: responseText,
    });
  } catch (error: unknown) {
    console.error('Deep analysis error:', error);
    res.status(500).json({
      error: 'Failed to generate deep neurotechnology synthesis',
      details: (error as Error)?.message || 'Unknown error',
    });
  }
});

// Real-Time BCI Presets Endpoint
app.get('/api/bci-presets', (_req, res) => {
  res.json({
    presets: [
      {
        id: 'preset-motor-cortex-spikes',
        name: '1024-Ch Motor Cortex M1 Spike Decoding',
        samplingRateKHz: 30,
        channelCount: 16,
        targetBand: 'Spikes (300Hz - 3000Hz)',
        nominalLatencyMs: 3.8,
        description: 'Simulates intracortical microelectrode recordings for real-time robotic cursor and grasp trajectory reconstruction.',
      },
      {
        id: 'preset-speech-muecog',
        name: '2048-Ch High-Density μECoG Speech Synthesis',
        samplingRateKHz: 10,
        channelCount: 16,
        targetBand: 'High-Gamma (70Hz - 150Hz)',
        nominalLatencyMs: 5.2,
        description: 'Simulates high-density cortical surface potentials over vocal motor cortex for real-time phoneme decoding.',
      },
      {
        id: 'preset-adbs-movement',
        name: 'Adaptive Closed-Loop DBS (Subthalamic Nucleus)',
        samplingRateKHz: 4,
        channelCount: 8,
        targetBand: 'Beta Oscillations (13Hz - 30Hz)',
        nominalLatencyMs: 8.0,
        description: 'Bidirectional sensing and stimulation loop for suppressing Parkinsonian tremor using reinforcement learning.',
      },
    ],
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SynapseCore server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
});
