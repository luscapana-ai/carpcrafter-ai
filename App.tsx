import React, { useState, useRef } from 'react';
import { InputCard } from './components/InputCard';
import { InventionDisplay } from './components/InventionDisplay';
import { Gallery } from './components/Gallery';
import { InventionParams, GeneratedInvention, GenerationState } from './types';
import { generateInventionConcept, generateInventionVisual } from './services/geminiService';
import { Anchor, Waves, FolderOpen } from 'lucide-react';

const STORAGE_KEY = 'carp_crafter_inventions';

const App: React.FC = () => {
  const [generationState, setGenerationState] = useState<GenerationState>(GenerationState.IDLE);
  const [currentInvention, setCurrentInvention] = useState<GeneratedInvention | null>(null);
  
  // ROBUST DATA SAFETY: Lazy initialization ensures we read from localStorage 
  // BEFORE the initial render.
  const [savedInventions, setSavedInventions] = useState<GeneratedInvention[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse saved inventions on init", e);
      return [];
    }
  });

  const [view, setView] = useState<'create' | 'gallery'>('create');
  const [error, setError] = useState<string | null>(null);

  // Helper to safely write to storage with Quota handling
  const saveToStorage = (inventions: GeneratedInvention[]): GeneratedInvention[] | null => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inventions));
      return inventions;
    } catch (e: any) {
      // Check for quota exceeded error (code 22 for Chrome/Firefox, 1014 for WebKit)
      if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
         console.warn("Storage quota exceeded. Attempting text-only fallback.");
         
         // Fallback 1: Try to remove the image from the newest item (index 0)
         if (inventions.length > 0 && inventions[0].imageUrl) {
             const fallbackList = [...inventions];
             // Remove image from the newest item
             const { imageUrl, ...rest } = fallbackList[0];
             fallbackList[0] = { ...rest, imageUrl: undefined } as GeneratedInvention;
             
             try {
                 localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackList));
                 alert("Storage Limit Reached: This invention was saved as TEXT ONLY to save space. \n\nTip: Use 'Export Backup' in the Gallery to save your full data externally.");
                 return fallbackList;
             } catch (retryE) {
                 // Fallback 2: If still full, strip images from EVERYTHING (nuclear option)
                 try {
                     const textOnlyList = inventions.map(inv => {
                        const { imageUrl, ...rest } = inv;
                        return rest;
                     }) as GeneratedInvention[];
                     
                     localStorage.setItem(STORAGE_KEY, JSON.stringify(textOnlyList));
                     alert("Storage Critical: All images have been removed from local storage to preserve your invention data. Please Export a backup.");
                     return textOnlyList;
                 } catch (finalE) {
                     alert("Storage Full: Cannot save new data. Please delete old items or Export/Clear your gallery.");
                     return null;
                 }
             }
         }
      }
      console.error("Failed to save to localStorage", e);
      return null;
    }
  };

  const handleGenerate = async (params: InventionParams) => {
    try {
      setError(null);
      setGenerationState(GenerationState.BRAINSTORMING);
      setView('create');

      // Step 1: Generate Text Concept
      const idea = await generateInventionConcept(params);
      
      const newInvention: GeneratedInvention = {
        ...idea,
        id: Date.now().toString(),
        timestamp: Date.now(),
        originalParams: params
      };
      
      setCurrentInvention(newInvention);
      setGenerationState(GenerationState.VISUALIZING);

      // Step 2: Generate Visual (Independent async step so user sees text first)
      generateInventionVisual(idea.visualPrompt, params.resourceMode)
        .then((base64Image) => {
          setCurrentInvention(prev => {
            if (!prev || prev.id !== newInvention.id) return prev;
            return { ...prev, imageUrl: base64Image };
          });
          setGenerationState(GenerationState.COMPLETE);
        })
        .catch(err => {
          console.error("Image gen failed", err);
          setGenerationState(GenerationState.COMPLETE);
        });

    } catch (e: any) {
      console.error(e);
      setError(e.message || "Something went wrong during invention process.");
      setGenerationState(GenerationState.ERROR);
    }
  };

  const handleSaveInvention = (invention: GeneratedInvention) => {
    // Prevent duplicates
    if (!savedInventions.some(inv => inv.id === invention.id)) {
      const updatedList = [invention, ...savedInventions];
      const resultList = saveToStorage(updatedList);
      
      if (resultList) {
        setSavedInventions(resultList);
        // If the result list has a modification (like removed image) for the current item, update current view
        if (resultList[0].id === currentInvention?.id && !resultList[0].imageUrl && currentInvention.imageUrl) {
             setCurrentInvention(resultList[0]);
        }
      }
    }
  };

  const handleDeleteInvention = (id: string) => {
    if (window.confirm("Are you sure you want to delete this invention from your gallery? This cannot be undone.")) {
      const updatedList = savedInventions.filter(inv => inv.id !== id);
      setSavedInventions(updatedList);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    }
  };

  const handleSelectInvention = (invention: GeneratedInvention) => {
    setCurrentInvention(invention);
    setView('create');
    setGenerationState(GenerationState.COMPLETE);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(savedInventions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `CarpCrafter_Backup_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files.length > 0) {
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = (event) => {
            try {
                if (event.target?.result) {
                    const parsedData = JSON.parse(event.target.result as string);
                    if (Array.isArray(parsedData)) {
                        // Merge logic: Add imported items if they don't already exist
                        const currentIds = new Set(savedInventions.map(i => i.id));
                        const newItems = parsedData.filter((i: any) => i.id && !currentIds.has(i.id));
                        
                        const merged = [...newItems, ...savedInventions];
                        const saved = saveToStorage(merged);
                        if (saved) {
                            setSavedInventions(saved);
                            alert(`Import successful! Added ${newItems.length} inventions.`);
                        }
                    } else {
                        alert("Invalid backup file format.");
                    }
                }
            } catch (error) {
                console.error(error);
                alert("Failed to parse backup file.");
            }
        };
    }
  };

  // Helper to check if current invention is already saved
  const isCurrentSaved = currentInvention 
    ? savedInventions.some(inv => inv.id === currentInvention.id) 
    : false;

  const handleReset = () => {
    // DATA SAFETY: Check if the user is about to discard an unsaved invention
    if (currentInvention && !isCurrentSaved && generationState === GenerationState.COMPLETE) {
      const confirmDiscard = window.confirm(
        "This invention hasn't been saved to your Gallery yet. \n\nAre you sure you want to start a new one? This idea will be lost."
      );
      if (!confirmDiscard) return;
    }

    setCurrentInvention(null);
    setGenerationState(GenerationState.IDLE);
    setView('create');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#152110] relative text-carp-100 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-carp-900/50 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-carp-500/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-carp-800/50 bg-[#152110]/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
              <div className="bg-gradient-to-br from-carp-500 to-carp-700 p-2 rounded-lg shadow-lg shadow-carp-500/20">
                <Anchor className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-white block leading-none">CarpCrafter</span>
                <span className="text-[10px] uppercase tracking-widest text-carp-400">AI Innovation Lab</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm font-medium">
              <button 
                onClick={() => {
                  setView('gallery');
                }}
                className={`flex items-center gap-2 transition-colors ${view === 'gallery' ? 'text-carp-100' : 'text-carp-400 hover:text-carp-200'}`}
              >
                <FolderOpen className="w-4 h-4" />
                Gallery ({savedInventions.length})
              </button>
              <div className="hidden md:block w-px h-4 bg-carp-800"></div>
              <span className="hidden md:flex items-center gap-1 text-tech-500 text-xs">
                <Waves className="w-4 h-4" />
                Gemini Powered
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        
        {view === 'gallery' ? (
          <Gallery 
            inventions={savedInventions} 
            onSelect={handleSelectInvention}
            onDelete={handleDeleteInvention}
            onExport={handleExportData}
            onImport={handleImportData}
          />
        ) : (
          <>
            {generationState === GenerationState.IDLE && (
              <div className="flex flex-col items-center w-full animate-fade-in">
                 <div className="text-center max-w-2xl mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                      Invent the <span className="text-transparent bg-clip-text bg-gradient-to-r from-carp-400 to-carp-200">Future</span> of Carp Fishing
                    </h1>
                    <p className="text-lg text-carp-300 leading-relaxed">
                      Combine angler intuition with Artificial Intelligence. 
                      Describe a problem, and let the AI prototype a new tool, complete with specs and visuals.
                    </p>
                 </div>
                 <InputCard onGenerate={handleGenerate} isGenerating={false} />
              </div>
            )}

            {(generationState === GenerationState.BRAINSTORMING) && (
               <div className="flex flex-col items-center justify-center text-center animate-fade-in">
                  <div className="w-24 h-24 mb-8 relative">
                    <div className="absolute inset-0 border-4 border-carp-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-carp-400 rounded-full animate-spin"></div>
                    <Anchor className="absolute inset-0 m-auto w-8 h-8 text-carp-500 animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Analyzing Angling Dynamics...</h2>
                  <p className="text-carp-400">Consulting hydrodynamics database & material science logs.</p>
               </div>
            )}

            {(generationState === GenerationState.VISUALIZING || generationState === GenerationState.COMPLETE) && currentInvention && (
              <InventionDisplay 
                invention={currentInvention} 
                onReset={handleReset} 
                onSave={handleSaveInvention}
                isSaved={isCurrentSaved}
                state={generationState}
              />
            )}

            {generationState === GenerationState.ERROR && (
               <div className="text-center max-w-md bg-red-900/20 border border-red-900/50 p-8 rounded-2xl">
                  <h3 className="text-xl font-bold text-red-400 mb-2">System Failure</h3>
                  <p className="text-carp-200 mb-6">{error || "The AI could not generate a valid invention. Try rephrasing your challenge."}</p>
                  <button 
                    onClick={handleReset}
                    className="px-6 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-200 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
               </div>
            )}
          </>
        )}

      </main>
      
      <footer className="relative z-10 border-t border-carp-900 py-8 text-center text-carp-600 text-sm">
        <p>© {new Date().getFullYear()} CarpCrafter AI. Experimental Prototype.</p>
      </footer>
    </div>
  );
};

export default App;