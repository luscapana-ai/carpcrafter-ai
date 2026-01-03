import { GoogleGenAI, Type, Schema } from "@google/genai";
import { InventionIdea, InventionParams, ResourceMode } from '../types';

// Ensure API key is present; in a real app, handle this more gracefully UI-side if missing
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

const INVENTION_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "A catchy name for the new fishing tool or bait."
    },
    tagline: {
      type: Type.STRING,
      description: "A short, punchy slogan describing what it does."
    },
    description: {
      type: Type.STRING,
      description: "A detailed description of the tool/bait and its primary function."
    },
    mechanism: {
      type: Type.STRING,
      description: "A technical explanation of how it works. For Bait: The attraction profile/solubility."
    },
    materials: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of materials or ingredients used."
    },
    visualPrompt: {
      type: Type.STRING,
      description: "A highly descriptive prompt to generate a photorealistic concept image. Describe angles, materials/textures, lighting, and setting."
    },
    feasibilityScore: {
      type: Type.INTEGER,
      description: "A score from 1 to 100. For DIY: Ease of Build. For 3D Print: Printability. For Bait: Ease of Preparation. For Pro/Normal: Commercial Viability/Practicality."
    },
    feasibilityAnalysis: {
      type: Type.STRING,
      description: "A detailed analysis justifying the score. For DIY: Why is it easy/hard? For 3D Print: Specific Slicer settings. For Bait: Why is it nutritious/safe? For Pro/Normal: Manufacturing/Practical analysis."
    },
    instructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A step-by-step guide. For DIY: Construction steps. For Bait: Cooking/Mixing steps. For 3D Print: Assembly/Finishing. For Pro/Normal: User Guide."
    },
    pros: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of benefits."
    },
    cons: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of potential drawbacks."
    }
  },
  required: ["name", "tagline", "description", "mechanism", "materials", "visualPrompt", "feasibilityScore", "feasibilityAnalysis", "instructions", "pros", "cons"]
};

export const generateInventionConcept = async (params: InventionParams): Promise<InventionIdea> => {
  if (!API_KEY) throw new Error("API Key is missing");

  const isDIY = params.resourceMode === 'diy';
  const is3DPrint = params.resourceMode === '3dprint';
  const isBait = params.resourceMode === 'bait';
  const isNormal = params.resourceMode === 'normal';

  let rolePrompt = "";
  let guidelinePrompt = "";

  const suppliesContext = params.availableSupplies 
    ? `\n    Constraint: The user has these specific ingredients/materials available: "${params.availableSupplies}". You MUST prioritize using these items in the solution.` 
    : "";

  const weatherContext = params.weather
    ? `\n    CRITICAL WEATHER FACTOR: The current conditions are: Temp ${params.weather.temperature}°C, Wind ${params.weather.windSpeed} km/h, Pressure ${params.weather.pressure} hPa, Sky ${params.weather.condition}. 
       YOU MUST ADAPT THE INVENTION TO THESE CONDITIONS. 
       (e.g., High wind = heavy/aerodynamic/sinking tools. Low Pressure = Carp are active/feeding on bottom. Cold Temp = Highly soluble/alcohol-based baits).`
    : "";

  if (isDIY) {
    rolePrompt = `You are a master "Garden Shed" Inventor and Carp Fishing expert. You specialize in creating clever, effective fishing tools using ONLY cheap, accessible materials found in hardware stores, supermarkets, or basic tackle boxes.`;
    guidelinePrompt = `
      Guidelines for DIY Mode:
      1. The invention MUST be buildable by a regular person with basic tools (drill, glue, pliers).
      2. USE ONLY ACCESSIBLE MATERIALS: PVC pipe, plastic bottles, wire, rubber bands, buoyant foam, simple springs, washers, nuts, bolts.
      3. AVOID: Custom injection molding, advanced electronics, expensive composites, or proprietary sensors.
      4. Focus on mechanical ingenuity. How can simple physics solve the problem?
      5. The "feasibilityScore" represents "Ease of DIY Construction". High score = Easy to build.
      6. The "feasibilityAnalysis" MUST explain the construction difficulty (e.g. "Requires precise drilling").
      7. The "instructions" MUST be a detailed numbered list of BUILD STEPS (e.g. "1. Cut the pipe...", "2. Drill a hole...").
    `;
  } else if (is3DPrint) {
    rolePrompt = `You are an expert in 3D Printing and Additive Manufacturing for fishing tackle. You specialize in designing functional, printable tools using standard FDM printers (like Ender 3 or Prusa).`;
    guidelinePrompt = `
      Guidelines for 3D Print Mode:
      1. The invention MUST be printable on a standard hobbyist 3D printer.
      2. SUGGEST MATERIALS: PLA (for prototypes/baiting tools), PETG (for water resistance/strength), TPU (for flexible bumpers/sleeves), or ABS/ASA (for durability).
      3. Focus on print-in-place mechanisms, threaded parts, snap-fits, and modular designs that avoid non-printable hardware where possible.
      4. "feasibilityScore" represents "Printability". High score = Easy to print, minimal supports required.
      5. "feasibilityAnalysis" MUST describe recommended slicer settings (e.g., "100% infill for weight", "0.2mm layer height", "Print orientation: upright").
      6. The "instructions" MUST be a numbered list of ASSEMBLY or POST-PROCESSING steps (e.g. "1. Remove supports...", "2. Snap part A into B...").
    `;
  } else if (isBait) {
    rolePrompt = `You are a legendary Carp Bait Chef and Fish Nutritionist. You specialize in creating high-attract, nutritionally balanced bait recipes (boilies, stick mixes, glugs, particles) that trigger feeding responses in specific conditions.`;
    guidelinePrompt = `
      Guidelines for Bait Kitchen Mode:
      1. Invent a novel bait recipe (boilie, paste, dip, or particle blend) utilizing the user's available ingredients if listed.
      2. "materials" must be the list of INGREDIENTS with recommended ratios/quantities (e.g., "200g Predigested Fishmeal", "10ml Squid Hydro").
      3. "mechanism" must explain the ATTRACTION PROFILE: solubility, signal leakage, pH levels, and how it digests in the carp.
      4. "feasibilityScore" represents "Ease of Preparation". High score = Simple mix in a bucket. Low score = Requires complex heating/fermentation.
      5. "feasibilityAnalysis" MUST explain why this mix is safe and effective (nutritional value, digestion).
      6. The "instructions" MUST be a step-by-step RECIPE METHOD (e.g. "1. Crack eggs...", "2. Add liquids...", "3. Boil for 90s...").
      7. Visual Prompt should describe the texture, color, and consistency of the bait.
    `;
  } else if (isNormal) {
    rolePrompt = `You are a pragmatic Carp Fishing Product Designer. You specialize in designing practical, reliable, and commercially viable fishing tackle that appeals to the everyday angler.`;
    guidelinePrompt = `
      Guidelines for Standard Mode:
      1. Invent a practical, effective tool or accessory that fits into a standard tackle box.
      2. Focus on standard manufacturing methods (injection molding, machining) and common materials (plastic, aluminum, rubber).
      3. AVOID: Overly complex electronics (unless simple), 3D print artifacts, or scavenged parts.
      4. The "feasibilityScore" represents "Commercial Viability & Practicality".
      5. The "feasibilityAnalysis" MUST explain why this product would sell and work reliably.
      6. The "instructions" MUST be a USER GUIDE (e.g. "1. Attach to line...", "2. Adjust tension...").
    `;
  } else {
    rolePrompt = `You are a world-class angling product designer and engineer specializing in future-tech carp fishing innovation.`;
    guidelinePrompt = `
      Guidelines for Pro Mode:
      1. The invention must be NOVEL and commercially viable for a high-end brand.
      2. Be creative with advanced technology (sensors, biodegradable tech, carbon fiber) or precision engineering.
      3. Keep it plausible but futuristic.
      4. The "feasibilityScore" represents "Manufacturing Feasibility".
      5. The "instructions" MUST be a USER MANUAL guide on how to operate the device.
    `;
  }

  const prompt = `
    ${rolePrompt}
    Your task is to INVENT a brand new, novel tool, rig component, accessory, or bait for carp fishing.
    
    Context:
    The user is facing this challenge: "${params.challenge}".
    The fishing environment is: "${params.environment}".${suppliesContext}${weatherContext}
    
    ${guidelinePrompt}
    
    General Rules:
    1. Consider physics, hydrodynamics, biology, and carp behavior.
    2. Return the data in strictly structured JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: INVENTION_SCHEMA,
        // Enable thinking to allow the model to deliberate on the mechanics before answering
        thinkingConfig: { thinkingBudget: 4096 }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");

    return JSON.parse(text) as InventionIdea;
  } catch (error) {
    console.error("Error generating concept:", error);
    throw error;
  }
};

export const generateInventionVisual = async (visualPrompt: string, resourceMode: ResourceMode = 'pro'): Promise<string> => {
  if (!API_KEY) throw new Error("API Key is missing");

  // Dynamically adjust visual style based on resource mode
  let styleModifiers = "";
  switch (resourceMode) {
    case 'diy':
      styleModifiers = "rustic, handmade, workshop aesthetic, gritty, visible duct tape or glue, garage workbench background";
      break;
    case '3dprint':
      styleModifiers = "3d printed texture, visible layer lines, matte pla plastic finish, clean tech background, rapid prototype aesthetic";
      break;
    case 'bait':
      styleModifiers = "realistic food texture, moist appearance, macro food photography, crumbs, organic, appetizing for fish";
      break;
    case 'normal':
      styleModifiers = "clean product photography, matte green fishing tackle finish, studio lighting, white or neutral background, professional catalogue style";
      break;
    default:
      styleModifiers = "high tech, sleek, carbon fiber finish, product studio lighting";
  }

  const finalPrompt = `Product photography concept shot: ${visualPrompt}. ${styleModifiers}. High detail, cinematic lighting, photorealistic, 4k render style, macro shot, shallow depth of field.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: finalPrompt,
    });

    // Extract image from response parts
    // The model typically returns an inlineData part for the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            }
        }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating visual:", error);
    // Return a fallback or rethrow. For this app, we rethrow to show error state.
    throw error;
  }
};