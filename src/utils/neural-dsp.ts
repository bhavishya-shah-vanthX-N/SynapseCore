/**
 * Neural Signal Processing and Real-time BCI Mathematics
 * Decoupled pure logic functions for microelectrode array processing,
 * Common Average Referencing (CAR), spike thresholding, and latency estimation.
 */

/**
 * Apply Common Average Referencing (CAR) across multi-channel neural recordings.
 * Subtracts the instantaneous mean voltage of all viable channels from each channel,
 * effectively eliminating common-mode electronic and biological noise.
 */
export function applyCAR(channelsData: number[][]): number[][] {
  const channelCount = channelsData.length;
  if (channelCount === 0) return [];
  const sampleCount = channelsData[0].length;
  if (sampleCount === 0) return channelsData.map(() => []);

  // Compute mean across channels for each sample point
  const commonAverage = new Float64Array(sampleCount);
  for (let s = 0; s < sampleCount; s++) {
    let sum = 0;
    for (let c = 0; c < channelCount; c++) {
      sum += channelsData[c][s];
    }
    commonAverage[s] = sum / channelCount;
  }

  // Subtract common average
  const result: number[][] = [];
  for (let c = 0; c < channelCount; c++) {
    const cleaned = new Array(sampleCount);
    for (let s = 0; s < sampleCount; s++) {
      cleaned[s] = Number((channelsData[c][s] - commonAverage[s]).toFixed(4));
    }
    result.push(cleaned);
  }
  return result;
}

/**
 * Calculate Quiroga robust noise standard deviation and detect negative-going action potential spikes.
 * sigma_n = median(|x|) / 0.6745
 * Threshold = -multiplier * sigma_n
 */
export function detectSpikes(signal: number[], multiplier: number = 4.0, refractorySamples: number = 15): number[] {
  if (signal.length === 0) return [];

  // Approximate median absolute deviation for noise estimation
  const absValues = signal.map(Math.abs).sort((a, b) => a - b);
  const mid = Math.floor(absValues.length / 2);
  const median = absValues.length % 2 !== 0 ? absValues[mid] : (absValues[mid - 1] + absValues[mid]) / 2;
  const sigmaN = median / 0.6745;
  const threshold = -1 * multiplier * (sigmaN || 1.0);

  const spikeIndices: number[] = [];
  let lastSpikeIndex = -refractorySamples;

  for (let i = 1; i < signal.length - 1; i++) {
    // Look for local negative minima below threshold
    if (signal[i] < threshold && signal[i] <= signal[i - 1] && signal[i] < signal[i + 1]) {
      if (i - lastSpikeIndex >= refractorySamples) {
        spikeIndices.push(i);
        lastSpikeIndex = i;
      }
    }
  }

  return spikeIndices;
}

/**
 * Approximate spectral band energy from neural signal buffer.
 * Bands: Delta (0.5-4 Hz), Theta (4-8 Hz), Alpha (8-13 Hz), Beta (13-30 Hz), Gamma (30-100 Hz).
 */
export function calculateSpectralBands(signal: number[], samplingRateHz: number = 1000): {
  delta: number;
  theta: number;
  alpha: number;
  beta: number;
  gamma: number;
} {
  if (signal.length === 0) {
    return { delta: 0, theta: 0, alpha: 0, beta: 0, gamma: 0 };
  }

  const N = signal.length;
  // Compute discrete Fourier energy for band bins
  const getBandPower = (fLow: number, fHigh: number): number => {
    let power = 0;
    const kLow = Math.max(1, Math.floor((fLow * N) / samplingRateHz));
    const kHigh = Math.min(Math.floor(N / 2), Math.ceil((fHigh * N) / samplingRateHz));

    for (let k = kLow; k <= kHigh; k++) {
      let real = 0;
      let imag = 0;
      const omega = (2 * Math.PI * k) / N;
      for (let n = 0; n < N; n++) {
        real += signal[n] * Math.cos(omega * n);
        imag -= signal[n] * Math.sin(omega * n);
      }
      power += (real * real + imag * imag) / (N * N);
    }
    return Math.sqrt(power);
  };

  const rawDelta = getBandPower(0.5, 4);
  const rawTheta = getBandPower(4, 8);
  const rawAlpha = getBandPower(8, 13);
  const rawBeta = getBandPower(13, 30);
  const rawGamma = getBandPower(30, 100);

  const total = rawDelta + rawTheta + rawAlpha + rawBeta + rawGamma || 1.0;

  const delta = Number(((rawDelta / total) * 100).toFixed(1));
  const theta = Number(((rawTheta / total) * 100).toFixed(1));
  const alpha = Number(((rawAlpha / total) * 100).toFixed(1));
  const beta = Number(((rawBeta / total) * 100).toFixed(1));
  const gamma = Number(((rawGamma / total) * 100).toFixed(1));

  return { delta, theta, alpha, beta, gamma };
}

/**
 * Calculate end-to-end BCI closed loop latency budget.
 * Assumes acquisition block size, analog-to-digital conversion, DSP filter group delay,
 * spike sorting latency, AI/ML inference time, and robotic actuator execution.
 */
export function calculateClosedLoopLatency(params: {
  blockSizeSamples: number;
  samplingRateHz: number;
  filterOrder: number;
  useOnChipDsp: boolean;
  modelComplexity: 'kalman' | 'wiener' | 'transformer';
}): {
  acquisitionLatencyMs: number;
  dspLatencyMs: number;
  decoderInferenceMs: number;
  actuatorLatencyMs: number;
  totalLatencyMs: number;
  meetsRealtimeThreshold: boolean;
} {
  const { blockSizeSamples, samplingRateHz, filterOrder, useOnChipDsp, modelComplexity } = params;

  // Acquisition latency is buffer accumulation time
  const acquisitionLatencyMs = Number(((blockSizeSamples / samplingRateHz) * 1000).toFixed(2));

  // DSP latency (FIR group delay + CAR)
  const dspLatencyMs = useOnChipDsp
    ? Number((0.2 + (filterOrder / (2 * samplingRateHz)) * 1000).toFixed(2))
    : Number((1.5 + (filterOrder / (2 * samplingRateHz)) * 1000).toFixed(2));

  // Decoder inference latency
  let decoderInferenceMs = 0.8; // kalman filter
  if (modelComplexity === 'wiener') decoderInferenceMs = 1.6;
  if (modelComplexity === 'transformer') decoderInferenceMs = 4.2;

  // Actuator response delay (FES / Robotic Arm)
  const actuatorLatencyMs = 5.0;

  const totalLatencyMs = Number(
    (acquisitionLatencyMs + dspLatencyMs + decoderInferenceMs + actuatorLatencyMs).toFixed(2)
  );

  // Closed loop neuroscience standard: <= 25ms is considered smooth real-time neuromotor control
  const meetsRealtimeThreshold = totalLatencyMs <= 25.0;

  return {
    acquisitionLatencyMs,
    dspLatencyMs,
    decoderInferenceMs,
    actuatorLatencyMs,
    totalLatencyMs,
    meetsRealtimeThreshold,
  };
}

/**
 * Token relevance search scorer for neurotech queries.
 * Evaluates semantic match across title, abstract, methodology, hardware tags, and institutions.
 */
export function scoreSearchMatch(
  query: string,
  item: {
    title: string;
    abstract?: string;
    institutions?: string[];
    tags?: string[];
    authors?: string[];
    keywords?: string[];
  }
): number {
  if (!query.trim()) return 1.0;

  const cleanQuery = query.toLowerCase().trim();
  const queryTokens = cleanQuery.split(/\s+/).filter((t) => t.length > 2);
  if (queryTokens.length === 0) return 1.0;

  let score = 0;
  const titleLower = item.title.toLowerCase();
  const abstractLower = (item.abstract || '').toLowerCase();
  const tagsLower = (item.tags || []).map((t) => t.toLowerCase()).join(' ');
  const institutionsLower = (item.institutions || []).map((i) => i.toLowerCase()).join(' ');
  const authorsLower = (item.authors || []).map((a) => a.toLowerCase()).join(' ');

  // Exact phrase match gives huge boost
  if (titleLower.includes(cleanQuery)) score += 50;
  if (abstractLower.includes(cleanQuery)) score += 25;
  if (tagsLower.includes(cleanQuery)) score += 30;

  // Token matches
  for (const token of queryTokens) {
    if (titleLower.includes(token)) score += 15;
    if (tagsLower.includes(token)) score += 10;
    if (abstractLower.includes(token)) score += 5;
    if (institutionsLower.includes(token)) score += 8;
    if (authorsLower.includes(token)) score += 8;
  }

  return score;
}
