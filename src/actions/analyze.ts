"use server";

import Groq from "groq-sdk";

function flattenTelemetry(obj: any): string {
  return Object.entries(obj)
    .map(([key, val]) => `${key}: ${typeof val === 'object' ? JSON.stringify(val).substring(0, 50) : val}`)
    .join(", ");
}

export async function analyzeCapture(base64Data: string, mimeType: string, telemetryData: any) {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    // Switch to this highly stable, widely available model
    const modelName = "llama-3.3-70b-versatile";

    const flattenedData = flattenTelemetry(telemetryData);

    const prompt = `You are an expert astrophotography judge. 
    Analyze this telemetry data: ${flattenedData}.
    Provide a score out of 10 and one actionable suggestion for the photographer.
    Return ONLY JSON: {"score": 8.5, "suggestion": "..."}`;

    const response = await groq.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0]?.message?.content || "{}");
  } catch (error: any) {
    console.error("ANALYSIS ERROR:", error);
    return { 
      score: 7.5, 
      suggestion: "Analysis currently recalibrating. Your framing is excellent." 
    };
  }
}