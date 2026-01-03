import React, { useState, useRef } from 'react';
import { Upload, Download, Skull, Disc } from 'lucide-react';
import { MidiSettings, ProcessingStatus } from './types';
import { DEFAULT_SETTINGS } from './constants';
import Controls from './components/Controls';
import Visualizer from './components/Visualizer';
import { generateMidiFromImage } from './services/midiGenerator';

const App: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [settings, setSettings] = useState<MidiSettings>(DEFAULT_SETTINGS);
  const [status, setStatus] = useState<ProcessingStatus>({ isProcessing: false, stage: 'idle' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageSrc(result);
        setSettings({ ...DEFAULT_SETTINGS });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadMidi = () => {
    if (!imageSrc) return;
    
    setStatus({ isProcessing: true, stage: 'generating', message: 'WRITING_BYTES...' });

    const canvas = document.createElement('canvas');
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    
    img.onload = () => {
      const MAX_WIDTH = 512; // Lower res for that retro crunch
      const scale = Math.min(1, MAX_WIDTH / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        try {
          const midiBlob = generateMidiFromImage(ctx, canvas.width, canvas.height, settings);
          
          const url = URL.createObjectURL(midiBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `DARK_SYNTH_${Math.floor(Math.random() * 9999)}.mid`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          setStatus({ isProcessing: false, stage: 'complete' });
        } catch (e) {
            console.error(e);
            setStatus({ isProcessing: false, stage: 'error', message: 'FATAL_ERROR' });
        }
      }
    };
  };

  const asciiArt = `
▓█████▄  ▄▄▄       ██▀███   ██ ▄█▀  ██████▓██   ██▓ ███▄    █ ▄▄▄█████▓ ██░ ██ 
▒██▀ ██▌▒████▄    ▓██ ▒ ██▒ ██▄█▒ ▒██    ▒ ▒██  ██▒ ██ ▀█   █ ▓  ██▒ ▓▒▓██░ ██▒
░██   █▌▒██  ▀█▄  ▓██ ░▄█ ▒▓███▄░ ░ ▓██▄    ▒██ ██░▓██  ▀█ ██▒▒ ▓██░ ▒░▒██▀▀██░
░▓█▄   ▌░██▄▄▄▄██ ▒██▀▀█▄  ▓██ █▄   ▒   ██▒ ░ ▐██▓░▓██▒  ▐▌██▒░ ▓██▓ ░ ░▓█ ░██ 
░▒████▓  ▓█   ▓██▒░██▓ ▒██▒▒██▒ █▄▒██████▒▒ ░ ██▒▓░▒██░   ▓██░  ▒██▒ ░ ░▓█▒░██▓
 ▒▒▓  ▒  ▒▒   ▓▒█░░ ▒▓ ░▒▓░▒ ▒▒ ▓▒▒ ▒▓▒ ▒ ░  ██▒▒▒ ░ ▒░   ▒ ▒   ▒ ░░    ▒ ░░▒░▒
 ░ ▒  ▒   ▒   ▒▒ ░  ░▒ ░ ▒░░ ░▒ ▒░░ ░▒  ░ ░▓██ ░▒░ ░ ░░   ░ ▒░    ░     ▒ ░▒░ ░
 ░ ░  ░   ░   ▒     ░░   ░ ░ ░░ ░ ░  ░  ░  ▒ ▒ ░░     ░   ░ ░   ░       ░  ░░ ░
   ░          ░  ░   ░     ░  ░         ░  ░ ░              ░           ░  ░  ░
 ░                                         ░ ░                                 
  `;

  return (
    <div className="min-h-screen bg-black text-gray-300 p-2 md:p-6 flex flex-col font-mono selection:bg-red-900 selection:text-white crt-flicker">
      
      {/* ASCII Header */}
      <header className="mb-6 border-b-2 border-white pb-4">
        <div className="flex flex-col items-center justify-center">
            <pre className="text-[10px] md:text-sm leading-3 md:leading-4 text-center text-white font-bold select-none whitespace-pre opacity-80 hidden md:block">
                {asciiArt}
            </pre>
            <h1 className="md:hidden text-4xl text-white mt-4 tracking-widest uppercase">PixelSynth</h1>
            <div className="flex items-center gap-2 mt-4 text-red-600">
                <Skull className="w-5 h-5" />
                <span className="text-xl tracking-[0.2em] uppercase">NFO Edition v1.0</span>
                <Skull className="w-5 h-5" />
            </div>
            <p className="text-xs text-zinc-500 mt-2 font-mono uppercase">
                [ cracked by zerr0x // 2025 ]
            </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        
        {/* Left: Controls */}
        <div className="lg:col-span-4 h-full">
            <div className="border border-white p-1 h-full">
                <div className="border border-white p-1 h-full">
                     <Controls 
                        settings={settings} 
                        onChange={setSettings} 
                        disabled={status.isProcessing}
                        />
                </div>
            </div>
        </div>

        {/* Center/Right: Visualizer */}
        <div className="lg:col-span-8 flex flex-col space-y-4 h-full">
            
            {/* Display Area */}
            <div className="flex-1 min-h-[400px] bg-black border-2 border-white relative p-1">
                <div className="absolute top-0 left-0 bg-white text-black px-2 py-1 text-sm font-bold z-10">
                    VISUAL_MONITOR.EXE
                </div>
                {/* Decoration Corners */}
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-white"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-white"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-white"></div>

                <div className="w-full h-full border border-zinc-900 p-4 flex items-center justify-center">
                    <Visualizer imageSrc={imageSrc} settings={settings} />
                </div>
            </div>

            {/* Action Bar */}
            <div className="border-t-2 border-white pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="font-mono text-xs text-zinc-500 uppercase">
                    {imageSrc ? (
                        <div className="flex flex-col">
                            <span>STATUS: IMAGE_LOADED</span>
                            <span>RES: {settings.resolutionX}x{settings.resolutionY}</span>
                        </div>
                    ) : (
                        <span className="animate-pulse">STATUS: WAITING_FOR_INPUT...</span>
                    )}
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-black border-2 border-white hover:bg-white hover:text-black px-6 py-2 transition-colors duration-0 group"
                    >
                        <Upload className="w-4 h-4" />
                        <span className="uppercase text-lg">Load .IMG</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                    />

                    <button
                        onClick={handleDownloadMidi}
                        disabled={!imageSrc || status.isProcessing}
                        className={`
                            flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-2 border-2 transition-colors duration-0
                            ${!imageSrc || status.isProcessing 
                                ? 'border-zinc-800 text-zinc-800 cursor-not-allowed' 
                                : 'border-red-600 text-red-600 hover:bg-red-600 hover:text-black'}
                        `}
                    >
                        {status.stage === 'generating' ? (
                            <Disc className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        <span className="uppercase text-lg">
                            {status.stage === 'generating' ? 'PROCESSING' : 'EXPORT .MID'}
                        </span>
                    </button>
                </div>
            </div>
            
            {status.message && (
                <div className="text-center font-mono text-red-500 uppercase text-sm border-t border-zinc-900 pt-2">
                    {`>> SYSTEM_MESSAGE: ${status.message}`}
                </div>
            )}
        </div>
      </main>

       {/* Footer */}
       <footer className="text-center text-zinc-700 text-[10px] uppercase pb-2">
            <p>ASCII GFX by zerr0x | Do not distribute without NFO!</p>
       </footer>
    </div>
  );
};

export default App;
