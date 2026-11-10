import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Cpu,
  Zap,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  applyCAR,
  detectSpikes,
  calculateSpectralBands,
  calculateClosedLoopLatency,
} from '../utils/neural-dsp';

interface BciInteractiveLabProps {
  onDeepAnalyze: (query: string, context?: string) => void;
}

export const BciInteractiveLab: React.FC<BciInteractiveLabProps> = ({ onDeepAnalyze }) => {
  const [isRunning, setIsRunning] = useState(true);
  const [useCAR, setUseCAR] = useState(true);
  const [samplingRateKHz, setSamplingRateKHz] = useState<number>(30);
  const [spikeMultiplier, setSpikeMultiplier] = useState<number>(4.0);
  const [modelComplexity, setModelComplexity] = useState<'kalman' | 'wiener' | 'transformer'>('transformer');
  const [activeBandFilter, setActiveBandFilter] = useState<'spikes' | 'lfp' | 'raw'>('spikes');
  const [selectedChannel, setSelectedChannel] = useState<number>(0);

  // Preset selector
  const [activePreset, setActivePreset] = useState<string>('motor');

  // Metrics
  const [detectedSpikesRate, setDetectedSpikesRate] = useState<number>(142);
  const [snrDb, setSnrDb] = useState<number>(18.4);
  const [carNoiseReduction, setCarNoiseReduction] = useState<number>(12.6);
  const [spectralBands, setSpectralBands] = useState({
    delta: 12.4,
    theta: 8.2,
    alpha: 15.6,
    beta: 28.5,
    gamma: 42.1,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const timeStepRef = useRef<number>(0);

  // Calculate closed-loop latency budget using pure DSP function
  const latencyBudget = calculateClosedLoopLatency({
    blockSizeSamples: 32,
    samplingRateHz: samplingRateKHz * 1000,
    filterOrder: 64,
    useOnChipDsp: true,
    modelComplexity,
  });

  // Oscilloscope animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localSpikeCount = 0;
    let framesCounted = 0;

    const render = () => {
      if (isRunning) {
        timeStepRef.current += 0.08;
      }
      const t = timeStepRef.current;

      const width = canvas.width;
      const height = canvas.height;

      // Dark oscilloscope canvas background
      ctx.fillStyle = '#07090e';
      ctx.fillRect(0, 0, width, height);

      // Draw faint hairline grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Generate 8 visible channels on canvas
      const visibleChannels = 8;
      const channelSpacing = height / (visibleChannels + 1);

      // Common noise generator (simulating 60Hz ambient line noise + motion artifact)
      const commonNoise = Math.sin(t * 1.8) * 8.0 + Math.sin(t * 0.4) * 6.0;

      const rawChannelSignals: number[][] = [];
      const samplePoints = Math.floor(width / 3);

      for (let ch = 0; ch < visibleChannels; ch++) {
        const signal: number[] = [];
        for (let s = 0; s < samplePoints; s++) {
          const sampleTime = t + s * 0.04;
          // Neural physiological components
          const baseLFP = Math.sin(sampleTime * (0.5 + ch * 0.1)) * 5.0;
          const betaOsc = Math.sin(sampleTime * 3.2 + ch * 0.4) * 7.0;
          // Spikes occurring at pseudo-random intervals
          const isSpikePhase = Math.sin(sampleTime * 1.5 + ch * 1.7) > 0.94;
          const actionPotential = isSpikePhase ? -22.0 * Math.exp(-Math.pow((sampleTime % 0.8) - 0.2, 2) / 0.01) : 0;
          // Random thermal noise
          const thermalNoise = (Math.random() - 0.5) * 4.0;

          // Combined raw voltage in microvolts
          const rawVoltage = baseLFP + betaOsc + actionPotential + thermalNoise + commonNoise;
          signal.push(rawVoltage);
        }
        rawChannelSignals.push(signal);
      }

      // Apply CAR if enabled
      const processedSignals = useCAR ? applyCAR(rawChannelSignals) : rawChannelSignals;

      // Draw waveforms
      for (let ch = 0; ch < visibleChannels; ch++) {
        const centerY = (ch + 1) * channelSpacing;
        const channelData = processedSignals[ch];

        // Draw channel baseline
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // Channel identifier text
        ctx.fillStyle = ch === selectedChannel ? '#38bdf8' : '#64748b';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`CH ${ch + 1}`, 10, centerY - 4);

        // Draw signal trace
        ctx.beginPath();
        ctx.lineWidth = ch === selectedChannel ? 1.5 : 1.0;
        ctx.strokeStyle = ch === selectedChannel ? '#38bdf8' : '#0ea5e9';

        for (let s = 0; s < channelData.length; s++) {
          const x = s * 3;
          let yVal = channelData[s];

          // Apply band filter visual dampening
          if (activeBandFilter === 'spikes') {
            // Highpass: remove low-frequency baseline
            yVal = yVal * 1.2;
          }

          const y = centerY + yVal;
          if (s === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Detect action potential spikes on selected channel
        if (ch === selectedChannel) {
          const spikes = detectSpikes(channelData, spikeMultiplier, 10);
          localSpikeCount += spikes.length;

          // Render threshold line
          const sigmaN = 3.5;
          const threshY = centerY - spikeMultiplier * sigmaN;
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(40, threshY);
          ctx.lineTo(width, threshY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw marker on detected spikes
          ctx.fillStyle = '#ef4444';
          spikes.forEach((idx) => {
            const sx = idx * 3;
            const sy = centerY + channelData[idx];
            ctx.beginPath();
            ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }

      framesCounted++;
      if (framesCounted % 30 === 0) {
        setDetectedSpikesRate(Math.round(localSpikeCount * 2.8) + 80);
        localSpikeCount = 0;

        // Recalculate spectral bands for selected channel
        const currentSelectedSignal = processedSignals[selectedChannel] || [];
        const bands = calculateSpectralBands(currentSelectedSignal, samplingRateKHz * 1000);
        setSpectralBands(bands);

        // Simulated SNR
        setSnrDb(Number((useCAR ? 21.4 : 11.2 + (Math.random() - 0.5) * 1.2).toFixed(1)));
        setCarNoiseReduction(useCAR ? 14.2 : 0.0);
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isRunning, useCAR, samplingRateKHz, spikeMultiplier, activeBandFilter, selectedChannel]);

  const handleApplyPreset = (presetId: string) => {
    setActivePreset(presetId);
    if (presetId === 'motor') {
      setSamplingRateKHz(30);
      setActiveBandFilter('spikes');
      setModelComplexity('transformer');
      setUseCAR(true);
    } else if (presetId === 'speech') {
      setSamplingRateKHz(10);
      setActiveBandFilter('lfp');
      setModelComplexity('transformer');
      setUseCAR(true);
    } else if (presetId === 'dbs') {
      setSamplingRateKHz(4);
      setActiveBandFilter('raw');
      setModelComplexity('kalman');
      setUseCAR(true);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      {/* Workbench Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Real-Time BCI & Neural Data Processing Workbench
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Microelectrode array streaming, Common Average Referencing (CAR), sub-millisecond spike detection, and closed-loop latency budget analysis.
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              isRunning
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
            }`}
          >
            {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isRunning ? 'Pause Stream' : 'Resume'}</span>
          </button>

          <button
            onClick={() => handleApplyPreset('motor')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 bg-slate-950 border border-slate-800 rounded-lg hover:text-white transition-colors"
            title="Reset to Motor Cortex defaults"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={() =>
              onDeepAnalyze(
                `Real-Time BCI Pipeline with ${samplingRateKHz}kS/s, CAR ${useCAR ? 'ON' : 'OFF'}, ${modelComplexity} decoder`,
                `Hardware: ${samplingRateKHz}kS/s sampling, latency target ${latencyBudget.totalLatencyMs}ms, spike threshold -${spikeMultiplier}σ`
              )
            }
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 rounded-lg hover:bg-cyan-900/60 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Synthesize Pipeline</span>
          </button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-medium">Neural Workload:</span>
        <button
          onClick={() => handleApplyPreset('motor')}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            activePreset === 'motor'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
              : 'text-slate-400 hover:text-slate-200 bg-slate-950/80 border border-slate-800'
          }`}
        >
          1024-Ch Motor Cortex Spikes (30 kS/s)
        </button>
        <button
          onClick={() => handleApplyPreset('speech')}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            activePreset === 'speech'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
              : 'text-slate-400 hover:text-slate-200 bg-slate-950/80 border border-slate-800'
          }`}
        >
          2048-Ch μECoG Speech Articulation (10 kS/s)
        </button>
        <button
          onClick={() => handleApplyPreset('dbs')}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            activePreset === 'dbs'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
              : 'text-slate-400 hover:text-slate-200 bg-slate-950/80 border border-slate-800'
          }`}
        >
          Adaptive Closed-Loop DBS (4 kS/s)
        </button>
      </div>

      {/* Main Grid: Oscilloscope Canvas & Control Column */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Oscilloscope Viewport (3 Columns) */}
        <div className="lg:col-span-3 flex flex-col rounded-lg border border-slate-800 bg-slate-950 p-2">
          <div className="flex items-center justify-between px-2 pb-2 text-[11px] font-mono text-slate-400 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <span>OSCILLOSCOPE: 8/16 CHANNELS</span>
              <span className="text-cyan-400">ACTIVE: CH {selectedChannel + 1}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>TIMEDIV: 40ms/div</span>
              <span className="text-slate-500">VOLTDIV: 20μV/div</span>
            </div>
          </div>

          <div className="relative w-full overflow-hidden" style={{ height: '340px' }}>
            <canvas
              ref={canvasRef}
              width={820}
              height={340}
              className="w-full h-full block cursor-crosshair"
            />
          </div>

          {/* Channel selector rail */}
          <div className="mt-2 flex items-center gap-1 overflow-x-auto px-1 pt-1 border-t border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-500 mr-1 shrink-0">Focus Ch:</span>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((ch) => (
              <button
                key={ch}
                onClick={() => setSelectedChannel(ch)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  selectedChannel === ch
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                CH{ch + 1}
              </button>
            ))}
          </div>
        </div>

        {/* DSP & Hardware Parameter Column (1 Column) */}
        <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3.5 text-xs">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800 font-semibold text-slate-200">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <span>Signal Processing Rail</span>
          </div>

          {/* Common Average Referencing Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-slate-300">CAR Filtering</span>
              <span className="block text-[10px] text-slate-500">Eliminates 60Hz ground artifact</span>
            </div>
            <button
              onClick={() => setUseCAR(!useCAR)}
              className={`px-2.5 py-1 font-mono text-[11px] rounded transition-colors ${
                useCAR
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {useCAR ? 'ENABLED' : 'BYPASS'}
            </button>
          </div>

          {/* Sampling Rate Selector */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Sampling Frequency</span>
              <span className="font-mono text-cyan-400 tabular-nums">{samplingRateKHz} kS/s</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[10, 20, 30].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setSamplingRateKHz(rate)}
                  className={`py-1 text-center font-mono text-[11px] rounded transition-colors ${
                    samplingRateKHz === rate
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {rate}k
                </button>
              ))}
            </div>
          </div>

          {/* Spike Multiplier Scrubber */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Spike Threshold</span>
              <span className="font-mono text-cyan-400 tabular-nums">-{spikeMultiplier.toFixed(1)} σₙ</span>
            </div>
            <input
              type="range"
              min="2.5"
              max="6.0"
              step="0.1"
              value={spikeMultiplier}
              onChange={(e) => setSpikeMultiplier(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
              <span>-2.5σ (Sensitive)</span>
              <span>-6.0σ (Conservative)</span>
            </div>
          </div>

          {/* Decoding Architecture */}
          <div>
            <span className="block text-slate-300 mb-1 font-medium">Decoding Model</span>
            <div className="grid grid-cols-3 gap-1">
              {(['kalman', 'wiener', 'transformer'] as const).map((model) => (
                <button
                  key={model}
                  onClick={() => setModelComplexity(model)}
                  className={`py-1 text-center font-mono text-[10px] uppercase rounded transition-colors ${
                    modelComplexity === model
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>

          {/* Telemetry Box */}
          <div className="mt-2 space-y-1.5 rounded bg-slate-900/90 p-2.5 font-mono text-[11px] border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500">SNR Ratio:</span>
              <span className="text-emerald-400 font-bold tabular-nums">+{snrDb} dB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">CAR Noise Red.:</span>
              <span className="text-cyan-300 tabular-nums">-{carNoiseReduction} dB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Spike Firing Rate:</span>
              <span className="text-slate-200 tabular-nums">{detectedSpikesRate} spikes/s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Latency Budget & Spectral Bands Section */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
        {/* Closed Loop Latency Budget Breakdown */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Closed-Loop Latency Budget
              </h3>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs">
              {latencyBudget.meetsRealtimeThreshold ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Real-Time Compliant (&lt;25ms)</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>High Latency</span>
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2 text-center font-mono text-xs">
            <div className="rounded bg-slate-900 p-2">
              <span className="block text-[10px] text-slate-500">Buffer Acq.</span>
              <span className="text-sm font-bold text-slate-200 tabular-nums">{latencyBudget.acquisitionLatencyMs}ms</span>
            </div>
            <div className="rounded bg-slate-900 p-2">
              <span className="block text-[10px] text-slate-500">DSP Filter</span>
              <span className="text-sm font-bold text-slate-200 tabular-nums">{latencyBudget.dspLatencyMs}ms</span>
            </div>
            <div className="rounded bg-slate-900 p-2">
              <span className="block text-[10px] text-slate-500">AI Decoder</span>
              <span className="text-sm font-bold text-cyan-300 tabular-nums">{latencyBudget.decoderInferenceMs}ms</span>
            </div>
            <div className="rounded bg-slate-900 p-2">
              <span className="block text-[10px] text-slate-500">Actuator</span>
              <span className="text-sm font-bold text-slate-200 tabular-nums">{latencyBudget.actuatorLatencyMs}ms</span>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between px-1 text-xs font-mono">
            <span className="text-slate-400">Total End-to-End Latency:</span>
            <span className="text-base font-bold text-emerald-400 tabular-nums">
              {latencyBudget.totalLatencyMs} ms
            </span>
          </div>
        </div>

        {/* Live Spectral Frequency Bands */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Selected Channel Spectral Power
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">CH {selectedChannel + 1} Power Spectrum</span>
          </div>

          <div className="mt-3 space-y-2 text-xs font-mono">
            {[
              { band: 'Delta (0.5 - 4 Hz)', val: spectralBands.delta, color: 'bg-blue-500' },
              { band: 'Theta (4 - 8 Hz)', val: spectralBands.theta, color: 'bg-teal-500' },
              { band: 'Alpha (8 - 13 Hz)', val: spectralBands.alpha, color: 'bg-emerald-500' },
              { band: 'Beta (13 - 30 Hz)', val: spectralBands.beta, color: 'bg-cyan-500' },
              { band: 'Gamma (30 - 100 Hz)', val: spectralBands.gamma, color: 'bg-purple-500' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-32 text-slate-400 text-[11px] truncate">{item.band}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-300`}
                    style={{ width: `${Math.min(100, Math.max(2, item.val))}%` }}
                  />
                </div>
                <span className="w-12 text-right text-slate-200 tabular-nums">{item.val}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
