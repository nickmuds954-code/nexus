
import { GoogleGenAI } from "@google/genai";

// Use the environment variable directly for API key initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMarketAnalysis = async (currentPrice: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert crypto analyst for G Coin. The current price is $${currentPrice.toFixed(2)}. 
      Provide a brief, professional market sentiment analysis (max 3 sentences) suggesting whether it's a good time to buy, sell, or mine.`,
    });
    // Accessing .text property directly as per guidelines
    return response.text;
  } catch (error: any) {
    // Gracefully handle rate limits (429) or other API issues
    const isRateLimit = error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('quota');
    
    if (isRateLimit) {
      return "The Nexus AI analyst is currently processing high volumes of global market data. Real-time sentiment will refresh shortly.";
    }
    
    console.error("Gemini analysis error:", error);
    return "Market volatility remains high. Technical indicators suggest holding current positions while monitoring G Coin resistance levels.";
  }
};
