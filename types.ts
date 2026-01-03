export interface MidiSettings {
  bpm: number;
  threshold: number; // 0-255 brightness threshold
  durationBars: number; // Length of the song in bars
  minNote: number; // MIDI note number (0-127)
  maxNote: number; // MIDI note number (0-127)
  scale: string; // 'chromatic', 'major', 'minor', etc.
  rootNote: string; // 'C', 'C#', etc.
  resolutionX: number; // Horizontal resolution (time steps)
  resolutionY: number; // Vertical resolution (pitch steps)
  channel: number;
}

export interface ProcessingStatus {
  isProcessing: boolean;
  stage: 'idle' | 'generating' | 'complete' | 'error';
  message?: string;
}

export enum ScaleType {
  CHROMATIC = 'chromatic',
  MAJOR = 'major',
  MINOR = 'minor',
  PENTATONIC_MAJOR = 'pentatonic_major',
  PENTATONIC_MINOR = 'pentatonic_minor',
  BLUES = 'blues',
  DIMINISHED = 'diminished'
}

export interface ImageAnalysis {
  suggestedBpm: number;
  suggestedScale: string;
  suggestedRoot: string;
  title: string;
  moodDescription: string;
}