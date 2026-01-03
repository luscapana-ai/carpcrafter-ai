import React, { useRef } from 'react';
import { GeneratedInvention } from '../types';
import { Trash2, Eye, Calendar, Sparkles, Download, Upload, ImageOff } from 'lucide-react';

interface GalleryProps {
  inventions: GeneratedInvention[];
  onSelect: (invention: GeneratedInvention) => void;
  onDelete: (id: string) => void;
  onExport?: () => void;
  onImport?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ inventions, onSelect, onDelete, onExport, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (inventions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-carp-400 min-h-[50vh] animate-fade-in w-full">
        <div className="bg-carp-900/50 p-6 rounded-full mb-6">
            <Sparkles className="w-12 h-12 opacity-50" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Gallery Empty</h3>
        <p className="text-sm opacity-60 max-w-xs text-center mb-6">Generate your first fishing innovation to start building your collection.</p>
        
        {onImport && (
          <div className="flex gap-4">
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-carp-800 hover:bg-carp-700 text-carp-200 rounded-lg text-sm transition-colors border border-carp-700"
             >
                <Upload className="w-4 h-4" />
                Import Backup
             </button>
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={onImport} 
                className="hidden" 
                accept=".json"
             />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-carp-800 pb-4 gap-4">
        <h2 className="text-2xl font-bold text-white">Your Invention Collection</h2>
        <div className="flex gap-3">
             {onExport && (
                <button 
                    onClick={onExport}
                    className="flex items-center gap-2 px-3 py-2 bg-carp-900 hover:bg-carp-800 text-carp-300 rounded-lg text-xs transition-colors border border-carp-800"
                    title="Download all inventions as a JSON backup"
                >
                    <Download className="w-3 h-3" />
                    Export Backup
                </button>
             )}
             {onImport && (
                <>
                  <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 bg-carp-900 hover:bg-carp-800 text-carp-300 rounded-lg text-xs transition-colors border border-carp-800"
                      title="Import inventions from a JSON file"
                  >
                      <Upload className="w-3 h-3" />
                      Import
                  </button>
                  <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={onImport} 
                      className="hidden" 
                      accept=".json"
                  />
                </>
             )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {inventions.map((inv) => (
          <div key={inv.id} className="bg-carp-900/40 border border-carp-800 rounded-xl overflow-hidden hover:border-carp-600 transition-all hover:shadow-xl hover:shadow-carp-900/50 group flex flex-col">
            <div className="aspect-video bg-carp-950 relative overflow-hidden cursor-pointer" onClick={() => onSelect(inv)}>
              {inv.imageUrl ? (
                <img src={inv.imageUrl} alt={inv.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-carp-700 bg-carp-950 gap-2">
                  <ImageOff className="w-8 h-8 opacity-50" />
                  <span className="text-xs">Image Missing (Storage Limit)</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-carp-900 via-transparent to-transparent opacity-90"></div>
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-white font-bold truncate text-lg">{inv.name}</h3>
                <p className="text-xs text-carp-300 truncate opacity-80">{inv.tagline}</p>
              </div>
            </div>
            
            <div className="p-4 flex justify-between items-center bg-carp-900/60 mt-auto border-t border-carp-800/50">
              <span className="text-[10px] text-carp-500 flex items-center gap-1">
                 <Calendar className="w-3 h-3" />
                 {new Date(inv.timestamp).toLocaleDateString()}
              </span>
              <div className="flex gap-2">
                 <button 
                   onClick={() => onSelect(inv)}
                   className="p-2 hover:bg-carp-700 rounded-lg text-carp-300 hover:text-white transition-colors"
                   title="View Details"
                 >
                   <Eye className="w-4 h-4" />
                 </button>
                 <button 
                   onClick={(e) => { e.stopPropagation(); onDelete(inv.id); }}
                   className="p-2 hover:bg-red-900/20 rounded-lg text-carp-600 hover:text-red-400 transition-colors"
                   title="Delete"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};