import React, { useState } from 'react';
import { GeneratedInvention, GenerationState } from '../types';
import { Download, ThumbsUp, ThumbsDown, CheckCircle2, Bookmark, Info, Target, MapPin, Hammer, Calculator, Printer, ChefHat, Utensils, Box, Zap, ClipboardList, Copy, Check, Share2, CloudRain, ArrowLeft, PlusCircle, ScanLine } from 'lucide-react';

interface InventionDisplayProps {
  invention: GeneratedInvention;
  onReset: () => void;
  onSave?: (invention: GeneratedInvention) => void;
  isSaved?: boolean;
  state: GenerationState;
}

const ImageSkeleton = () => (
  <div className="w-full h-full bg-carp-950 relative overflow-hidden flex flex-col items-center justify-center">
    {/* Grid Background */}
    <div 
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: 'radial-gradient(circle, #4c7539 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}
    />
    
    {/* Scanning Bar */}
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
      <div className="w-full h-[2px] bg-tech-500/50 shadow-[0_0_15px_rgba(14,165,233,0.5)] absolute top-0 animate-[scan_3s_ease-in-out_infinite]" />
    </div>

    {/* Schematic Shapes */}
    <div className="relative z-0 flex items-center justify-center">
      <div className="w-48 h-48 border border-carp-700/50 rounded-full animate-pulse flex items-center justify-center">
        <div className="w-32 h-32 border border-carp-600/30 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
      </div>
      <div className="absolute w-64 h-32 border border-carp-700/50 rounded-lg animate-pulse" style={{ animationDelay: '0.4s' }} />
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-tech-500/40" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-tech-500/40" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-tech-500/40" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-tech-500/40" />
    </div>

    {/* Loading Info */}
    <div className="mt-8 text-center z-10">
      <div className="flex items-center justify-center gap-2 text-tech-500 mb-2 font-mono text-xs uppercase tracking-[0.2em] animate-pulse">
        <ScanLine className="w-4 h-4" />
        AI Rendering in Progress
      </div>
      <p className="text-carp-400 text-xs font-medium px-6">Synthesizing visual prototype from physical constraints...</p>
    </div>
    
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes scan {
        0% { top: -10%; }
        50% { top: 110%; }
        100% { top: -10%; }
      }
    `}} />
  </div>
);

export const InventionDisplay: React.FC<InventionDisplayProps> = ({ invention, onReset, onSave, isSaved = false, state }) => {
  const isLoadingImage = state === GenerationState.VISUALIZING;
  const isDIY = invention.originalParams?.resourceMode === 'diy';
  const is3DPrint = invention.originalParams?.resourceMode === '3dprint';
  const isBait = invention.originalParams?.resourceMode === 'bait';
  const isNormal = invention.originalParams?.resourceMode === 'normal';
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(invention, null, 2)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = `${invention.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(element);
    element.click();
  };

  const handleCopyInstructions = () => {
    if (invention.instructions) {
      const text = invention.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n');
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
      const shareText = `🎣 CarpCrafter AI Invention\n\n💡 Idea: ${invention.name}\n🚀 Slogan: ${invention.tagline}\n⚙️ Score: ${invention.feasibilityScore}/100 (${getFeasibilityLabel()})\n\nCheck out this AI-generated concept! #CarpFishing #CarpCrafterAI`;
      navigator.clipboard.writeText(shareText);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
  };

  const getModeLabel = () => {
      if (isDIY) return 'DIY Concept';
      if (is3DPrint) return '3D Print Model';
      if (isBait) return 'Bait Recipe';
      if (isNormal) return 'Standard Product';
      return 'Pro Prototype';
  };

  const getModeIcon = () => {
      if (isDIY) return <Hammer className="w-5 h-5" />;
      if (is3DPrint) return <Printer className="w-5 h-5" />;
      if (isBait) return <ChefHat className="w-5 h-5" />;
      if (isNormal) return <Box className="w-5 h-5" />;
      return <Calculator className="w-5 h-5" />;
  };

  const getFeasibilityLabel = () => {
      if (isDIY) return 'Build Difficulty';
      if (is3DPrint) return 'Printability';
      if (isBait) return 'Prep Ease';
      if (isNormal) return 'Practicality';
      return 'Feasibility';
  };

  const getFeasibilityAnalysisLabel = () => {
      if (is3DPrint) return 'Recommended Slicer Settings';
      if (isBait) return 'Nutritional Analysis';
      if (isDIY) return 'Construction Analysis';
      if (isNormal) return 'Viability Analysis';
      return 'Manufacturing Analysis';
  };

  const getInstructionsLabel = () => {
      if (isDIY) return 'Step-by-Step Build Guide';
      if (is3DPrint) return 'Assembly & Finishing';
      if (isBait) return 'Preparation Method';
      if (isNormal) return 'Usage Instructions';
      return 'Usage Guide';
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <button 
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-carp-900/50 hover:bg-carp-800 text-carp-300 hover:text-white rounded-lg text-sm font-medium transition-all border border-carp-700/50 group"
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Lab
        </button>
        <div className="flex gap-3">
             <button 
                onClick={handleShare}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    shared 
                    ? 'bg-tech-500 text-white cursor-default' 
                    : 'bg-carp-800 text-carp-300 hover:bg-carp-700 hover:text-white border border-carp-700/50'
                }`}
            >
                {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {shared ? 'Copied' : 'Share Idea'}
            </button>
             {onSave && (
                <button 
                    onClick={() => onSave(invention)}
                    disabled={isSaved}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        isSaved 
                        ? 'bg-carp-800 text-carp-400 cursor-default' 
                        : 'bg-carp-600 hover:bg-carp-500 text-white shadow-lg'
                    }`}
                >
                    {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    {isSaved ? 'Saved to Gallery' : 'Save to Gallery'}
                </button>
             )}
             <button 
                onClick={handleDownload}
                className="p-2 bg-carp-900/50 hover:bg-carp-800 text-carp-300 rounded-lg transition-colors border border-carp-700/50"
                title="Download JSON Specs"
            >
                <Download className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-carp-900/80 backdrop-blur-md border border-carp-700/50 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Title Section */}
        <div className="p-8 border-b border-carp-800/50 bg-gradient-to-r from-carp-900 to-carp-800/30">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-carp-400 text-xs font-bold uppercase tracking-widest mb-2">
                        {getModeIcon()}
                        {getModeLabel()}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">{invention.name}</h1>
                    <p className="text-xl text-carp-300 italic">"{invention.tagline}"</p>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                        <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-carp-300 to-carp-500">
                            {invention.feasibilityScore}
                        </span>
                        <span className="text-carp-500 text-sm font-bold">/100</span>
                    </div>
                    <span className="text-xs text-carp-500 uppercase tracking-wide">{getFeasibilityLabel()}</span>
                </div>
            </div>

            {/* Mission Brief */}
            {invention.originalParams && (
                <div className="mt-6 p-4 bg-carp-950/40 rounded-xl border border-carp-800/50 flex flex-col md:flex-row gap-4 md:gap-8 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <div className="text-[10px] text-carp-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Target className="w-3 h-3" /> Challenge
                        </div>
                        <p className="text-sm text-carp-200">{invention.originalParams.challenge}</p>
                    </div>
                    <div className="flex-1 md:flex-none md:w-1/4">
                        <div className="text-[10px] text-carp-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Environment
                        </div>
                        <p className="text-sm text-carp-200">{invention.originalParams.environment}</p>
                    </div>
                    {invention.originalParams.weather && (
                        <div className="flex-1 md:flex-none md:w-1/4">
                            <div className="text-[10px] text-tech-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <CloudRain className="w-3 h-3" /> Weather Conditions
                            </div>
                            <p className="text-sm text-carp-200">
                                {invention.originalParams.weather.temperature}°C, {invention.originalParams.weather.windSpeed} km/h, {invention.originalParams.weather.condition}
                            </p>
                        </div>
                    )}
                    {invention.originalParams.availableSupplies && (
                        <div className="flex-1 md:flex-none md:w-full">
                            <div className="text-[10px] text-carp-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Box className="w-3 h-3" /> Supplies Used
                            </div>
                            <p className="text-sm text-carp-200 line-clamp-2" title={invention.originalParams.availableSupplies}>
                                {invention.originalParams.availableSupplies}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Visual Column */}
            <div className="p-8 border-b lg:border-b-0 lg:border-r border-carp-800/50 bg-carp-950/20 flex flex-col">
                <div className="aspect-square rounded-xl overflow-hidden bg-carp-950 shadow-inner relative group mb-6">
                    {invention.imageUrl ? (
                        <img 
                            src={invention.imageUrl} 
                            alt={invention.name} 
                            className="w-full h-full object-cover transition-all duration-1000 animate-fade-in group-hover:scale-105"
                        />
                    ) : (
                        isLoadingImage ? <ImageSkeleton /> : (
                            <div className="w-full h-full flex items-center justify-center text-carp-600 p-6 text-center">
                                <p className="text-sm">Visual generation pending...</p>
                            </div>
                        )
                    )}
                    
                    {/* Visual Prompt Overlay */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6 text-center backdrop-blur-sm pointer-events-none">
                        <p className="text-xs text-carp-300">{invention.visualPrompt}</p>
                    </div>
                </div>

                {/* Materials List */}
                <div className="mt-auto">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                        {isBait ? <Utensils className="w-4 h-4 text-carp-500" /> : <Box className="w-4 h-4 text-carp-500" />}
                        {isBait ? 'Ingredients List' : 'Bill of Materials'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {invention.materials.map((mat, i) => (
                            <span key={i} className="px-3 py-1 bg-carp-800/60 text-carp-200 text-xs rounded-full border border-carp-700/50">
                                {mat}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Details Column */}
            <div className="p-8 flex flex-col gap-8">
                
                {/* Description */}
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-carp-500" />
                        Concept Overview
                    </h3>
                    <p className="text-carp-200 leading-relaxed text-sm">{invention.description}</p>
                </div>

                {/* Mechanism */}
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-carp-500" />
                        {isBait ? 'Attraction Profile' : 'The Mechanism'}
                    </h3>
                    <div className="bg-carp-800/20 p-4 rounded-xl border border-carp-800/50">
                        <p className="text-carp-200 leading-relaxed text-sm italic">{invention.mechanism}</p>
                    </div>
                </div>

                {/* Instructions Section */}
                {invention.instructions && invention.instructions.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-carp-500" />
                                {getInstructionsLabel()}
                            </h3>
                            <button 
                                onClick={handleCopyInstructions}
                                className="text-[10px] text-carp-400 hover:text-white flex items-center gap-1 bg-carp-800/50 px-2 py-1 rounded transition-colors"
                            >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copied ? 'Copied' : 'Copy Guide'}
                            </button>
                        </div>
                        <div className="bg-carp-950/40 rounded-xl border border-carp-800 overflow-hidden">
                            <ol className="divide-y divide-carp-800/50">
                                {invention.instructions.map((step, i) => (
                                    <li key={i} className="p-3 flex gap-4 text-carp-200 text-sm hover:bg-carp-800/10 transition-colors">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-carp-800 text-carp-400 flex items-center justify-center text-xs font-bold border border-carp-700">
                                            {i + 1}
                                        </span>
                                        <span className="mt-0.5">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                )}

                {/* Feasibility Analysis */}
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                         <CheckCircle2 className="w-4 h-4 text-carp-500" />
                         {getFeasibilityAnalysisLabel()}
                    </h3>
                    <div className={`p-4 rounded-xl border border-l-4 ${
                        invention.feasibilityScore > 70 ? 'bg-green-900/10 border-green-500/50 border-l-green-500' :
                        invention.feasibilityScore > 40 ? 'bg-yellow-900/10 border-yellow-500/50 border-l-yellow-500' :
                        'bg-red-900/10 border-red-500/50 border-l-red-500'
                    }`}>
                        <p className="text-carp-200 text-sm whitespace-pre-line">{invention.feasibilityAnalysis || "No analysis provided."}</p>
                    </div>
                </div>

                {/* Pros & Cons */}
                <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div className="bg-carp-950/30 p-4 rounded-xl">
                        <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" /> Advantages
                        </h4>
                        <ul className="space-y-2">
                            {invention.pros.slice(0, 3).map((pro, i) => (
                                <li key={i} className="text-xs text-carp-300 flex items-start gap-2">
                                    <span className="text-green-500/50 mt-0.5">•</span>
                                    {pro}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-carp-950/30 p-4 rounded-xl">
                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                            <ThumbsDown className="w-3 h-3" /> Drawbacks
                        </h4>
                        <ul className="space-y-2">
                            {invention.cons.slice(0, 3).map((con, i) => (
                                <li key={i} className="text-xs text-carp-300 flex items-start gap-2">
                                    <span className="text-red-500/50 mt-0.5">•</span>
                                    {con}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="pt-6 mt-4 border-t border-carp-800/50">
                    <button 
                        onClick={onReset}
                        className="w-full py-4 bg-gradient-to-r from-carp-800 to-carp-700 hover:from-carp-700 hover:to-carp-600 text-white rounded-xl font-bold transition-all shadow-lg border border-carp-600/30 flex items-center justify-center gap-3 group"
                    >
                        <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        Create Another Invention
                    </button>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};