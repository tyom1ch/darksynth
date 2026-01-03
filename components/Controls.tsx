import React from 'react';
import { MidiSettings } from '../types';
import { NOTE_NAMES, SCALES } from '../constants';

interface ControlsProps {
  settings: MidiSettings;
  onChange: (newSettings: MidiSettings) => void;
  disabled: boolean;
}

// Utility to create a blocky label
const Label = ({ children }: { children: React.ReactNode }) => (
  <div className="text-xs uppercase mb-1 text-zinc-500 font-bold tracking-wider flex items-center">
    <span className="mr-1">»</span> {children}
  </div>
);

const Controls: React.FC<ControlsProps> = ({ settings, onChange, disabled }) => {
  
  const handleChange = (key: keyof MidiSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="bg-black text-gray-300 h-full overflow-y-auto p-4 font-mono">
      <div className="mb-6 text-center border-b border-dashed border-zinc-700 pb-2">
        <h2 className="text-2xl text-white tracking-[0.2em] font-serif uppercase">Config</h2>
      </div>

      {/* Musical Key */}
      <div className="mb-8">
        <div className="text-white bg-zinc-900 px-2 py-1 mb-3 text-sm uppercase tracking-widest border-l-4 border-red-700">
           [ Musical Scale ]
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Root</Label>
            <select
              disabled={disabled}
              value={settings.rootNote}
              onChange={(e) => handleChange('rootNote', e.target.value)}
              className="w-full bg-black border border-zinc-600 rounded-none px-2 py-1 text-xl text-white focus:border-red-500 outline-none uppercase font-bold hover:bg-zinc-900 cursor-pointer"
            >
              {NOTE_NAMES.map(note => (
                <option key={note} value={note}>{note}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Type</Label>
            <select
              disabled={disabled}
              value={settings.scale}
              onChange={(e) => handleChange('scale', e.target.value)}
              className="w-full bg-black border border-zinc-600 rounded-none px-2 py-1 text-xl text-white focus:border-red-500 outline-none uppercase font-bold hover:bg-zinc-900 cursor-pointer"
            >
              {Object.keys(SCALES).map(scale => (
                <option key={scale} value={scale}>{scale.replace('_', ' ').substring(0, 10)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timing */}
      <div className="mb-8">
        <div className="text-white bg-zinc-900 px-2 py-1 mb-3 text-sm uppercase tracking-widest border-l-4 border-white">
           [ Time Domain ]
        </div>
        
        <div className="mb-4">
           <div className="flex justify-between mb-1">
            <Label>BPM</Label>
            <span className="text-red-500 font-bold">{settings.bpm}</span>
          </div>
          <input
            type="range"
            min="40"
            max="240"
            disabled={disabled}
            value={settings.bpm}
            onChange={(e) => handleChange('bpm', Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
           <div className="flex justify-between mb-1">
            <Label>Bars</Label>
            <span className="text-red-500 font-bold">{settings.durationBars}</span>
          </div>
          <input
            type="range"
            min="1"
            max="32"
            disabled={disabled}
            value={settings.durationBars}
            onChange={(e) => handleChange('durationBars', Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Logic */}
      <div className="mb-8">
        <div className="text-white bg-zinc-900 px-2 py-1 mb-3 text-sm uppercase tracking-widest border-l-4 border-white">
           [ Quantization ]
        </div>

        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <Label>Threshold</Label>
            <span className="text-red-500 font-bold">{settings.threshold}</span>
          </div>
          <input
            type="range"
            min="0"
            max="254"
            disabled={disabled}
            value={settings.threshold}
            onChange={(e) => handleChange('threshold', Number(e.target.value))}
            className="w-full"
          />
        </div>

         <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>X-Steps</Label>
             <input
              type="number"
              min="16"
              max="512"
              disabled={disabled}
              value={settings.resolutionX}
              onChange={(e) => handleChange('resolutionX', Number(e.target.value))}
              className="w-full bg-black border-b border-zinc-600 px-2 py-1 text-lg text-white focus:border-red-500 outline-none font-bold"
            />
          </div>
          <div>
            <Label>Y-Steps</Label>
            <input
              type="number"
              min="12"
              max="128"
              disabled={disabled}
              value={settings.resolutionY}
              onChange={(e) => handleChange('resolutionY', Number(e.target.value))}
              className="w-full bg-black border-b border-zinc-600 px-2 py-1 text-lg text-white focus:border-red-500 outline-none font-bold"
            />
          </div>
        </div>
      </div>
      
       {/* Range */}
      <div>
        <div className="text-white bg-zinc-900 px-2 py-1 mb-3 text-sm uppercase tracking-widest border-l-4 border-white">
           [ Range ]
        </div>
        <div className="flex items-center gap-2">
             <input
              type="number"
              min="0"
              max="127"
              disabled={disabled}
              value={settings.minNote}
              onChange={(e) => handleChange('minNote', Number(e.target.value))}
              className="w-full bg-black border border-zinc-700 px-2 py-1 text-center text-white focus:border-red-500 outline-none font-bold"
            />
            <span className="text-zinc-600"> TO </span>
            <input
              type="number"
              min="0"
              max="127"
              disabled={disabled}
              value={settings.maxNote}
              onChange={(e) => handleChange('maxNote', Number(e.target.value))}
              className="w-full bg-black border border-zinc-700 px-2 py-1 text-center text-white focus:border-red-500 outline-none font-bold"
            />
        </div>
      </div>

    </div>
  );
};

export default Controls;