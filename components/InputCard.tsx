import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { InventionParams, ResourceMode, WeatherData } from '../types';
import { Search, MapPin, Fish, Sparkles, Calculator, Hammer, Printer, ChefHat, Plus, CloudRain, Wind, Thermometer, Gauge, Loader2, Package, Save, Box } from 'lucide-react';

interface InputCardProps {
  onGenerate: (params: InventionParams) => void;
  isGenerating: boolean;
}

export const InputCard: React.FC<InputCardProps> = ({ onGenerate, isGenerating }) => {
  const [challenge, setChallenge] = useState('');
  const [environment, setEnvironment] = useState('General Lake');
  const [resourceMode, setResourceMode] = useState<ResourceMode>('diy');
  const [supplies, setSupplies] = useState('');
  
  // Weather State
  const [weather, setWeather] = useState<WeatherData | undefined>(undefined);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Initialize supplies from storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`carp_crafter_inventory_${resourceMode}`);
    if (saved) setSupplies(saved);
  }, []);

  const handleModeChange = (newMode: ResourceMode) => {
    // Save current supplies before switching
    localStorage.setItem(`carp_crafter_inventory_${resourceMode}`, supplies);
    
    // Load new supplies
    const saved = localStorage.getItem(`carp_crafter_inventory_${newMode}`);
    setSupplies(saved || '');
    
    setResourceMode(newMode);
  };

  // Auto-save supplies when they change (debouncing could be added for optimization, but localstorage is fast enough here)
  useEffect(() => {
    localStorage.setItem(`carp_crafter_inventory_${resourceMode}`, supplies);
  }, [supplies, resourceMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (challenge.trim()) {
      onGenerate({ 
        challenge, 
        environment, 
        resourceMode,
        availableSupplies: supplies.trim() || undefined,
        weather
      });
    }
  };

  const handleSurprise = () => {
    const randomChallenges = [
        "Preventing lead loss in snaggy waters while ensuring absolute fish safety",
        "Delivering liquid attractants slowly over 48 hours without washing out",
        "Detecting liner bites vs proper runs in high wind conditions",
        "Mapping bottom contours silently without using a marker float or boat",
        "A night fishing indicator that doesn't use sound or bright lights",
        "Biodegradable hooklink that is stronger than braid but dissolves if cut",
        "Instant depth measurement of casting spot without plumbing around",
        "Camouflaging the line against changing bottom debris colors",
        "A bait that matches the pH of the silt to prevent spoilage",
        "High leakage winter bait that doesn't satiate the fish"
    ];
    const randomEnvs = [
        "Weedy Pit", "Deep Reservoir", "Fast Flowing River", "Canal", "Small Commercial Pond"
    ];
    
    setChallenge(randomChallenges[Math.floor(Math.random() * randomChallenges.length)]);
    setEnvironment(randomEnvs[Math.floor(Math.random() * randomEnvs.length)]);
  };

  const suggestions = [
    "Dealing with thick silkweed",
    "Casting extreme distances",
    "Shy bites in winter",
    "Fishing over deep silt",
    "Avoiding crayfish"
  ];

  // Helper to add supplies from chips
  const addSupply = (item: string) => {
    setSupplies(prev => {
        const current = prev.trim();
        if (current.includes(item)) return current;
        return current ? `${current}, ${item}` : item;
    });
  };

  const getCategorizedSuggestions = () => {
    if (resourceMode === 'bait') return {
      "Liquids": ["CSL", "Molasses", "Salmon Oil", "Hemp Oil", "Minamino", "Liquid Liver"],
      "Base Mix": ["Fishmeal", "Semolina", "Soya Flour", "Maize Meal", "Krill Meal", "Breadcrumb"],
      "Additives": ["Betaine", "GLM", "Liver Powder", "Robin Red", "Salt", "Chilli", "Garlic", "Butyric Acid"],
      "Particles": ["Sweetcorn", "Hemp", "Tiger Nuts", "Chickpeas", "Maples", "Maggots", "Belachan"]
    };
    if (resourceMode === 'diy') return {
      "Tackle Scraps": ["Fluorocarbon", "Mono Line", "Heavy Braid", "Leadcore", "Safety Clips", "Tail Rubbers", "Leads", "Swivels", "Quick Links", "Beads", "Silicone", "Anti-Tangle Sleeves", "Hooks", "Rig Rings"],
      "Structural": ["PVC Pipe", "Aluminium Tube", "Banksticks", "Wood Strip", "Wire"],
      "Fasteners": ["Cable Ties", "Duct Tape", "Superglue", "Epoxy", "Screws", "Bolts"],
      "Mechanics": ["Springs", "Elastic", "Lead (Sinkers)", "Magnets", "Washers"],
      "Scrap/Misc": ["Plastic Bottle", "Cork", "Foam", "Old Inner Tube", "Shrink Tube"]
    };
    if (resourceMode === '3dprint') return {
      "Filament": ["PLA", "PETG", "TPU", "ABS", "ASA", "Carbon Fiber PLA"],
      "Fishing Hardware": ["Rod Butt Thread", "Camera Screw (1/4\")", "Buzzer Bar Thread", "Isotope Slot"],
      "General Hardware": ["M3 Bolts", "M4 Bolts", "Bearings (608)", "Heat Inserts", "Magnets (Neodymium)"],
      "Finish": ["Sandpaper", "Primer", "Epoxy Resin", "Superglue"]
    };
    if (resourceMode === 'normal') return {
      "Terminal Tackle": ["Size 6 Hooks", "Size 8 Swivels", "Lead Clips", "Anti-Tangle Sleeves", "Shrink Tube", "Beads", "Buffer Beads", "Quick Links"],
      "Lines": ["15lb Mono", "20lb Braid", "Fluorocarbon Leader", "Leadcore", "Coated Braid"],
      "Components": ["Rig Rings", "Micro Swivels", "Bait Screws", "Hook Beads", "Kick aligners"],
      "Weights": ["3oz Leads", "Backleads", "Tungsten Putty"]
    };
    return {};
  };

  const getSuppliesLabel = () => {
      if (resourceMode === 'bait') return "My Kitchen Pantry";
      if (resourceMode === 'diy') return "My Shed / Workshop";
      if (resourceMode === '3dprint') return "My Hardware Stock";
      if (resourceMode === 'normal') return "My Tackle Box";
      return "Budget / Constraints";
  };

  const getWeatherCodeLabel = (code: number) => {
    if (code === 0) return "Clear Sky";
    if (code <= 3) return "Cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 55) return "Drizzle";
    if (code <= 67) return "Rain";
    if (code <= 77) return "Snow";
    if (code <= 82) return "Showers";
    return "Stormy";
  };

  const fetchWeather = () => {
    if (!navigator.geolocation) {
      setWeatherError("Geolocation is not supported by your browser");
      return;
    }

    setIsLoadingWeather(true);
    setWeatherError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,surface_pressure,wind_speed_10m,weather_code`
          );
          
          if (!response.ok) throw new Error("Weather service unavailable");
          
          const data = await response.json();
          const current = data.current;
          
          setWeather({
            temperature: current.temperature_2m,
            windSpeed: current.wind_speed_10m,
            pressure: current.surface_pressure,
            condition: getWeatherCodeLabel(current.weather_code)
          });
        } catch (error) {
          setWeatherError("Failed to fetch weather data");
          console.error(error);
        } finally {
          setIsLoadingWeather(false);
        }
      },
      (error) => {
        setWeatherError("Location access denied");
        setIsLoadingWeather(false);
      }
    );
  };

  return (
    <div className="w-full max-w-2xl bg-carp-900/80 backdrop-blur-md border border-carp-700/50 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-carp-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <Fish className="w-6 h-6 text-carp-400" />
        Describe the Challenge
      </h2>
      <p className="text-carp-200 mb-6 text-sm">Tell the AI what problem you want to solve on the bank.</p>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-carp-400 ml-1">The Problem</label>
            <button 
              type="button" 
              onClick={handleSurprise} 
              className="text-xs text-tech-500 flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              title="Generate a random challenge"
            >
                <Sparkles className="w-3 h-3" />
                Surprise Me
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              placeholder="e.g., Keeping bait fresh in hot weather..."
              className="w-full bg-carp-950/50 border border-carp-700 rounded-xl px-4 py-4 text-white placeholder-carp-600 focus:outline-none focus:ring-2 focus:ring-carp-500/50 focus:border-carp-500 transition-all"
              required
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-carp-600" />
          </div>
          
          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {suggestions.slice(0, 5).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setChallenge(s)}
                className="text-xs bg-carp-800/50 hover:bg-carp-700 text-carp-300 px-3 py-1.5 rounded-full transition-colors border border-carp-700/30"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-carp-400 ml-1">The Environment</label>
            <div className="relative">
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full bg-carp-950/50 border border-carp-700 rounded-xl px-4 py-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-carp-500/50 focus:border-carp-500 transition-all cursor-pointer"
              >
                <option value="General Lake">General Lake</option>
                <option value="Fast Flowing River">Fast Flowing River</option>
                <option value="Weedy Pit">Weedy Pit</option>
                <option value="Deep Reservoir">Deep Reservoir</option>
                <option value="Small Commercial Pond">Small Commercial Pond</option>
                <option value="Canal">Canal</option>
              </select>
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-carp-600 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-carp-400 ml-1">Creation Mode</label>
            {/* Grid layout for buttons to accommodate 5 options */}
            <div className="grid grid-cols-2 md:grid-cols-5 bg-carp-950/50 p-1 rounded-xl border border-carp-700 gap-1">
              <button
                type="button"
                onClick={() => handleModeChange('diy')}
                className={`flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-[10px] md:text-xs font-medium transition-all ${
                  resourceMode === 'diy' 
                    ? 'bg-carp-700 text-white shadow-lg' 
                    : 'text-carp-400 hover:text-carp-200 hover:bg-carp-800/50'
                }`}
                title="Garden Shed / DIY"
              >
                <Hammer className="w-4 h-4" />
                DIY
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('3dprint')}
                className={`flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-[10px] md:text-xs font-medium transition-all ${
                  resourceMode === '3dprint' 
                    ? 'bg-blue-600/30 text-blue-200 shadow-lg border border-blue-500/30' 
                    : 'text-carp-400 hover:text-carp-200 hover:bg-carp-800/50'
                }`}
                title="3D Printing"
              >
                <Printer className="w-4 h-4" />
                3D Print
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('bait')}
                className={`flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-[10px] md:text-xs font-medium transition-all ${
                  resourceMode === 'bait' 
                    ? 'bg-amber-600/30 text-amber-200 shadow-lg border border-amber-500/30' 
                    : 'text-carp-400 hover:text-carp-200 hover:bg-carp-800/50'
                }`}
                title="Bait Kitchen"
              >
                <ChefHat className="w-4 h-4" />
                Kitchen
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('normal')}
                className={`flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-[10px] md:text-xs font-medium transition-all ${
                  resourceMode === 'normal' 
                    ? 'bg-green-600/30 text-green-200 shadow-lg border border-green-500/30' 
                    : 'text-carp-400 hover:text-carp-200 hover:bg-carp-800/50'
                }`}
                title="Standard Equipment"
              >
                <Box className="w-4 h-4" />
                Standard
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('pro')}
                className={`flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-[10px] md:text-xs font-medium transition-all ${
                  resourceMode === 'pro' 
                    ? 'bg-tech-500/20 text-tech-500 shadow-lg border border-tech-500/30' 
                    : 'text-carp-400 hover:text-carp-200 hover:bg-carp-800/50'
                }`}
                title="Pro Lab / Advanced"
              >
                <Calculator className="w-4 h-4" />
                Pro Lab
              </button>
            </div>
          </div>
        </div>

        {/* Weather Integration */}
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-carp-400 ml-1">Live Conditions</label>
                {!weather && (
                    <button 
                        type="button"
                        onClick={fetchWeather}
                        disabled={isLoadingWeather}
                        className="text-xs text-tech-500 hover:text-white flex items-center gap-1 transition-colors"
                        title="Get weather based on your current location"
                    >
                        {isLoadingWeather ? <Loader2 className="w-3 h-3 animate-spin" /> : <CloudRain className="w-3 h-3" />}
                        {isLoadingWeather ? 'Scanning...' : 'Fetch Local Weather'}
                    </button>
                )}
            </div>
            
            {weather ? (
                <div className="bg-carp-800/40 border border-carp-700 rounded-xl p-3 flex flex-wrap gap-4 items-center justify-between text-sm animate-fade-in relative group">
                    <button 
                        type="button"
                        onClick={() => setWeather(undefined)}
                        className="absolute top-1 right-2 text-carp-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Weather"
                    >
                        Clear
                    </button>
                    <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-orange-400" />
                        <span className="text-carp-200">{weather.temperature}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Wind className="w-4 h-4 text-blue-400" />
                        <span className="text-carp-200">{weather.windSpeed} km/h</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-purple-400" />
                        <span className="text-carp-200">{weather.pressure} hPa</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CloudRain className="w-4 h-4 text-gray-400" />
                        <span className="text-carp-200">{weather.condition}</span>
                    </div>
                </div>
            ) : (
                <div className="bg-carp-950/30 border border-carp-800/50 border-dashed rounded-xl p-3 text-center text-xs text-carp-600">
                    {weatherError ? (
                        <span className="text-red-400">{weatherError}</span>
                    ) : (
                        "Sync with local weather to optimize for pressure, wind & temp."
                    )}
                </div>
            )}
        </div>

        {/* Current Available Materials Section */}
        <div className="space-y-3 bg-carp-950/30 p-4 rounded-xl border border-carp-800/50">
             <div className="flex justify-between items-center">
                 <label className="text-xs font-semibold uppercase tracking-wider text-carp-300 flex items-center gap-2">
                    <Package className="w-4 h-4 text-carp-500" />
                    {getSuppliesLabel()}
                 </label>
                 <span className="text-[10px] text-carp-600 flex items-center gap-1">
                    <Save className="w-3 h-3" /> Auto-Saved
                 </span>
             </div>
             
             <textarea
                value={supplies}
                onChange={(e) => setSupplies(e.target.value)}
                placeholder={resourceMode === 'bait' ? "e.g. 1 tin sweetcorn, hemp oil, white bread..." : "e.g. 20mm PVC pipe, old bike tube, cable ties..."}
                className="w-full bg-carp-900 border border-carp-700 rounded-lg px-4 py-3 text-white placeholder-carp-600 focus:outline-none focus:ring-2 focus:ring-carp-500/50 focus:border-carp-500 transition-all h-20 text-sm resize-none"
             />
             
             {/* Categorized Quick Add Catalog */}
             <div className="space-y-2">
                {Object.entries(getCategorizedSuggestions()).map(([category, items]) => (
                    <div key={category} className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold text-carp-500 uppercase tracking-wide ml-1">{category}</span>
                        <div className="flex flex-wrap gap-1.5">
                            {Array.isArray(items) && items.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => addSupply(item)}
                                    title={`Add ${item} to your inventory`}
                                    className="flex items-center gap-1 text-[10px] bg-carp-800 hover:bg-carp-700 hover:text-white text-carp-400 px-2 py-1 rounded transition-colors border border-carp-700/50"
                                >
                                    <Plus className="w-2 h-2 opacity-70" />
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
             </div>
        </div>

        <Button 
          type="submit" 
          isLoading={isGenerating} 
          className="w-full text-lg shadow-carp-500/20 shadow-xl"
          title="Generate Invention"
        >
          {isGenerating 
            ? 'Inventing...' 
            : resourceMode === 'diy' 
                ? 'Design DIY Solution' 
                : resourceMode === '3dprint'
                    ? 'Generate 3D Print Model'
                    : resourceMode === 'bait'
                        ? 'Calculate Bait Recipe'
                        : resourceMode === 'normal'
                          ? 'Design Standard Product'
                          : 'Invent Pro Concept'}
        </Button>
      </form>
    </div>
  );
};