import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyCAR,
  detectSpikes,
  calculateSpectralBands,
  calculateClosedLoopLatency,
  scoreSearchMatch,
} from './neural-dsp';

test('applyCAR removes common mode noise across 4 simulated neural channels', () => {
  // Common mode 60Hz artifact + channel specific signal
  const channel0 = [10.5, 10.2, 9.8, 11.0];
  const channel1 = [10.1, 10.0, 9.9, 10.8];
  const channel2 = [10.9, 10.4, 9.7, 11.2];
  const channel3 = [10.5, 10.2, 9.8, 11.0];

  const filtered = applyCAR([channel0, channel1, channel2, channel3]);
  assert.equal(filtered.length, 4);
  assert.equal(filtered[0].length, 4);

  // The sum of all channels at any sample point after CAR should be ~0
  for (let s = 0; s < 4; s++) {
    const sumAtSample = filtered.reduce((acc, ch) => acc + ch[s], 0);
    assert.ok(Math.abs(sumAtSample) < 0.01, `Sum at sample ${s} should be near zero, got ${sumAtSample}`);
  }
});

test('detectSpikes detects action potentials exceeding negative threshold', () => {
  // Baseline noise with one sharp action potential trough
  const syntheticSignal = [
    0.1, -0.2, 0.3, -0.1, 0.2,
    -15.0, // Sharp spike at index 5
    -0.1, 0.2, -0.3, 0.1, 0.2, -0.1, 0.0, 0.1, 0.2, 0.1,
    -18.0, // Second spike at index 16
    0.1, -0.2, 0.1,
  ];

  const spikes = detectSpikes(syntheticSignal, 3.0, 5);
  assert.ok(spikes.includes(5), 'Should detect spike at index 5');
  assert.ok(spikes.includes(16), 'Should detect spike at index 16');
  assert.equal(spikes.length, 2);
});

test('calculateClosedLoopLatency computes sub-25ms latency budget for on-chip DSP', () => {
  const result = calculateClosedLoopLatency({
    blockSizeSamples: 32,
    samplingRateHz: 10000,
    filterOrder: 64,
    useOnChipDsp: true,
    modelComplexity: 'kalman',
  });

  assert.ok(result.acquisitionLatencyMs > 0);
  assert.ok(result.totalLatencyMs <= 25.0);
  assert.equal(result.meetsRealtimeThreshold, true);
});

test('scoreSearchMatch ranks relevant neurotech queries accurately', () => {
  const item = {
    title: 'High-density microelectrode array with on-chip spike sorting for real-time BCI decoding',
    abstract: 'We present a 1024-channel CMOS biochip integrated with recurrent neural network decoders.',
    tags: ['bci', 'biochips', 'spike sorting', 'real-time'],
    institutions: ['Stanford University', 'MIT'],
  };

  const highMatch = scoreSearchMatch('real-time BCI spike sorting', item);
  const lowMatch = scoreSearchMatch('quantum computing cryptography', item);

  assert.ok(highMatch > 50, `Expected high match score, got ${highMatch}`);
  assert.equal(lowMatch, 0, `Expected zero score for irrelevant query, got ${lowMatch}`);
});
