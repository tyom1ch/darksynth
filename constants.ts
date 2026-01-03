import { ScaleType } from './types';

export const DEFAULT_SETTINGS = {
  bpm: 120,
  threshold: 100,
  durationBars: 4,
  minNote: 36, // C2
  maxNote: 96, // C7
  scale: ScaleType.CHROMATIC,
  rootNote: 'C',
  resolutionX: 128,
  resolutionY: 64,
  channel: 0,
};

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALES: Record<string, number[]> = {
  [ScaleType.CHROMATIC]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  [ScaleType.MAJOR]: [0, 2, 4, 5, 7, 9, 11],
  [ScaleType.MINOR]: [0, 2, 3, 5, 7, 8, 10],
  [ScaleType.PENTATONIC_MAJOR]: [0, 2, 4, 7, 9],
  [ScaleType.PENTATONIC_MINOR]: [0, 3, 5, 7, 10],
  [ScaleType.BLUES]: [0, 3, 5, 6, 7, 10],
};