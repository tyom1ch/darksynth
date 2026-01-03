import { MidiSettings, ScaleType } from '../types';
import { NOTE_NAMES, SCALES } from '../constants';

// Helper to convert MIDI note number to Frequency (for potential web audio preview, unused here but good practice)
// export const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// Helper to check if a note belongs to a scale
const isNoteInScale = (note: number, rootIndex: number, scaleType: string): boolean => {
  if (scaleType === ScaleType.CHROMATIC) return true;
  const relativeNote = (note - rootIndex + 120) % 12; // +120 to avoid negative modulo issues
  return SCALES[scaleType].includes(relativeNote);
};

// Find nearest valid note in scale
const snapToScale = (note: number, rootIndex: number, scaleType: string): number => {
  if (isNoteInScale(note, rootIndex, scaleType)) return note;
  
  // Simple search for nearest neighbor
  let offset = 1;
  while (offset < 12) {
    if (isNoteInScale(note + offset, rootIndex, scaleType)) return note + offset;
    if (isNoteInScale(note - offset, rootIndex, scaleType)) return note - offset;
    offset++;
  }
  return note;
};

// Variable-length quantity encoder for MIDI
const writeVarLength = (value: number): number[] => {
  const buffer: number[] = [];
  let v = value;
  while (true) {
    let byte = v & 0x7F;
    v >>= 7;
    if (v === 0) {
      buffer.push(byte);
      break;
    }
    buffer.push(byte | 0x80);
  }
  return buffer.reverse();
};

// String to char codes
const strToBytes = (str: string): number[] => str.split('').map(c => c.charCodeAt(0));

// Main Generation Function
export const generateMidiFromImage = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: MidiSettings
): Blob => {
  const { 
    bpm, threshold, durationBars, minNote, maxNote, 
    scale, rootNote, resolutionX, resolutionY 
  } = settings;

  const rootIndex = NOTE_NAMES.indexOf(rootNote);
  const totalTicks = durationBars * 4 * 480; // Assuming 4/4 signature, 480 PPQ
  const ticksPerStep = Math.floor(totalTicks / resolutionX);
  
  // Note: MIDI Note 0 is C-1.
  // We map Y-axis to Pitch. High Y (bottom of image) usually visually means lower pitch? 
  // Standard piano roll: Bottom is low pitch, Top is high pitch.
  // Image coords: 0,0 is Top-Left. So 0 is high pitch (if we want top of image to be high notes).
  // Let's map Image Y=0 to MaxNote, Image Y=Height to MinNote.

  const notes: { pitch: number; velocity: number; startTime: number; duration: number }[] = [];

  // Read pixel data
  // We scan the image in a grid defined by resolutionX and resolutionY
  const blockW = width / resolutionX;
  const blockH = height / resolutionY;

  for (let x = 0; x < resolutionX; x++) {
    for (let y = 0; y < resolutionY; y++) {
      // Sample center of the block
      const sampleX = Math.floor((x + 0.5) * blockW);
      const sampleY = Math.floor((y + 0.5) * blockH);
      
      const pixel = ctx.getImageData(sampleX, sampleY, 1, 1).data;
      // Calculate brightness (perceptual)
      const brightness = 0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2];
      const alpha = pixel[3];

      if (alpha > 0 && brightness > threshold) {
        // Map Y to Pitch
        // y=0 (top) -> maxNote
        // y=max (bottom) -> minNote
        const pitchRatio = 1 - (y / resolutionY); 
        let rawPitch = Math.floor(minNote + pitchRatio * (maxNote - minNote));
        
        // Quantize to Scale
        const finalPitch = snapToScale(rawPitch, rootIndex, scale);
        
        // Map brightness to velocity (louder = brighter)
        // Map range [threshold, 255] to [40, 127]
        const velocity = Math.floor(40 + ((brightness - threshold) / (255 - threshold)) * 87);

        notes.push({
          pitch: finalPitch,
          velocity: velocity,
          startTime: x * ticksPerStep,
          duration: ticksPerStep // Simple staccato/grid duration
        });
      }
    }
  }

  // --- Construct MIDI File ---
  
  // Header Chunk
  // MThd | length(6) | format(0) | nTracks(1) | division(480)
  const header = [
    ...strToBytes('MThd'),
    0, 0, 0, 6,
    0, 0, // Format 0 (single track)
    0, 1, // 1 Track
    0x01, 0xE0 // 480 PPQ (0x01E0)
  ];

  // Track Chunk
  // MTrk | length | events...
  const trackEvents: number[] = [];
  
  // Meta Event: Set Tempo
  // FF 51 03 tttttt
  // Microseconds per quarter note = 60,000,000 / BPM
  const microsPerQuarter = Math.round(60000000 / bpm);
  trackEvents.push(
    0, // Delta time 0
    0xFF, 0x51, 0x03,
    (microsPerQuarter >> 16) & 0xFF,
    (microsPerQuarter >> 8) & 0xFF,
    microsPerQuarter & 0xFF
  );

  // Group events by time for easier delta calculation
  // We need to turn Note On and Note Off events into a linear stream
  interface MidiEvent {
    ticks: number;
    type: 'on' | 'off';
    pitch: number;
    velocity: number;
  }

  const linearEvents: MidiEvent[] = [];
  notes.forEach(note => {
    linearEvents.push({ ticks: note.startTime, type: 'on', pitch: note.pitch, velocity: note.velocity });
    linearEvents.push({ ticks: note.startTime + note.duration, type: 'off', pitch: note.pitch, velocity: 0 });
  });

  // Sort by time
  linearEvents.sort((a, b) => a.ticks - b.ticks);

  let currentTime = 0;
  
  linearEvents.forEach(evt => {
    const deltaTime = evt.ticks - currentTime;
    currentTime = evt.ticks;

    trackEvents.push(...writeVarLength(deltaTime));
    
    // Note On (0x90) for both on (vel>0) and off (vel=0 or 0x80)
    // Using Note On with vel 0 for note off is standard compact MIDI
    const statusByte = 0x90 | (settings.channel & 0x0F);
    trackEvents.push(statusByte, evt.pitch, evt.velocity);
  });

  // End of Track
  // FF 2F 00
  trackEvents.push(0, 0xFF, 0x2F, 0x00);

  // Calculate track length
  const trackLength = trackEvents.length;
  const trackHeader = [
    ...strToBytes('MTrk'),
    (trackLength >> 24) & 0xFF,
    (trackLength >> 16) & 0xFF,
    (trackLength >> 8) & 0xFF,
    trackLength & 0xFF
  ];

  const fileData = new Uint8Array([...header, ...trackHeader, ...trackEvents]);
  return new Blob([fileData], { type: 'audio/midi' });
};
