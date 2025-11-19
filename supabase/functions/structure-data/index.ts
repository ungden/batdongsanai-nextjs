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

async function callGemini(apiKey: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_FORMAT}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json", // Ép kiểu JSON ở đây
      maxOutputTokens: 8192,
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
    
    // Lấy API Key từ Supabase Secrets (Deno env)
    // Lưu ý: Bạn cần đảm bảo biến môi trường GEMINI_API_KEY đã được set
    // Trong Deno Deploy/Supabase Edge Functions: Deno.env.get('GEMINI_API_KEY')
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY not set')

    let prompt = "";

    if (type === 'project_list') { // Cho AI Scout
      prompt = `Extract list of real estate projects from the text below into JSON.
      Text:
      ${content}
      
      Output Schema:
      { "projects": [{ "name": "string", "developer": "string", "location": "string", "status": "string", "type": "string", "confidence": "number" }], "summary": "string" }`;
    } 
    else if (type === 'project_detail') { // Cho Master Editor
      prompt = `Extract project details from the text below into JSON.
      Text:
      ${content}
      
      Output Schema:
      { "overview": {"description": "string"}, "specs": {"total_units": number, "total_floors": number}, "pricing": {"price_per_sqm": number, "launch_price": number, "price_range": "string"}, "amenities": ["string"] }`;
    }
    else if (type === 'raw_list') { // Cho Batch Import
      prompt = `Convert this raw list into structured JSON Array.
      List:
      ${content}
      
      Output Schema:
      { "projects": [{ "name": "string", "developer": "string", "location": "string", "type": "string", "raw_text": "string" }] }`;
    }
    else {
      throw new Error("Invalid type");
    }

    const jsonString = await callGemini(apiKey, prompt);
    const data = JSON.parse(jsonString);

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