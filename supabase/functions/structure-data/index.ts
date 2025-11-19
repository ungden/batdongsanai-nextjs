/* eslint-disable */
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

declare const Deno: {
  env: { get(key: string): string | undefined };
};

const MODEL_FORMAT = "gemini-2.0-flash";

function extractJSON(text: string): any {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try { return JSON.parse(match[1]); } catch (e2) { /* continue */ }
    }
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1) {
      try { return JSON.parse(text.substring(firstOpen, lastClose + 1)); } catch (e3) { /* continue */ }
    }
    // Return empty object instead of crashing if JSON fails
    console.error("JSON parse failed, returning empty object");
    return {};
  }
}

async function callGemini(apiKey: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_FORMAT}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini Error: ${text}`);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { content, type } = await req.json()
    
    // Kiểm tra nếu bước trước bị fail
    if (content && typeof content === 'string' && content.startsWith("RAW_DATA_NOT_FOUND")) {
       return new Response(JSON.stringify({ data: {} }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY not set')

    let prompt = "";

    if (type === 'project_detail') {
      prompt = `
      Convert this Real Estate Data into standard JSON.
      INPUT:
      """
      ${content}
      """
      
      RULES:
      1. Extract numbers strictly (e.g. "5 billion" -> 5000000000).
      2. If data is missing, use null.
      3. Output valid JSON only.
      
      SCHEMA:
      {
        "overview": { "description": "string", "developer": "string", "location": "string", "city": "string", "district": "string" },
        "specs": { "total_units": number, "total_floors": number, "blocks": number, "density_construction": number, "handover_standard": "string" },
        "pricing": { "price_per_sqm": number, "launch_price": number, "price_range": "string" },
        "legal": { "legal_status": "string", "completion_date": "string" },
        "amenities": ["string"]
      }`;
    }
    else if (type === 'project_list') {
      prompt = `Extract list to JSON array. Input: ${content}`;
    }
    else if (type === 'raw_list') {
      prompt = `Convert to JSON array. Input: ${content}`;
    }

    const jsonString = await callGemini(apiKey, prompt);
    const data = extractJSON(jsonString);

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})