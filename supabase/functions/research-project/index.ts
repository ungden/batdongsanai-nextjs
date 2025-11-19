/* eslint-disable */
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

declare const Deno: {
  env: { get(key: string): string | undefined };
};

const MODEL_RESEARCH = "gemini-2.0-flash"; 

async function callGeminiSearch(apiKey: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_RESEARCH}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    generationConfig: {
      temperature: 0.1, // Giảm nhiệt độ xuống thấp nhất để giảm sáng tạo/hội thoại
      maxOutputTokens: 8192,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
    ]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API Error: ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  // Kiểm tra nếu kết quả trả về quá ngắn hoặc chứa từ khóa xã giao
  if (!text || text.length < 50 || text.includes("Tôi sẽ") || text.includes("I will")) {
     // Nếu dính lỗi này, trả về một chuỗi đặc biệt để client biết mà retry hoặc xử lý
     return `RAW_DATA_NOT_FOUND: ${text}`; 
  }
  
  return text;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { query, mode, raw_content, section } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY not set')

    let resultText = "";

    if (mode === 'deep_scan') {
      // PROMPT ĐƯỢC VIẾT LẠI HOÀN TOÀN THEO PHONG CÁCH "MÁY MÓC"
      let searchInstructions = "";

      switch (section) {
        case 'overview':
          searchInstructions = `
          DATA POINTS REQUIRED:
          - Official Project Name
          - Developer Name (Full)
          - Exact Address (Number, Street, District, City)
          - Project Description (Location advantages, connections)`;
          break;
        case 'specs':
          searchInstructions = `
          DATA POINTS REQUIRED:
          - Total Land Area (m2/ha)
          - Construction Density (%)
          - Scale: Number of Blocks, Floors per Block
          - Total Units (Apartments)
          - Apartment Areas (e.g., 50m2 - 100m2)
          - Handover Condition (Bare shell/Basic/Full)`;
          break;
        case 'financial':
          searchInstructions = `
          DATA POINTS REQUIRED:
          - Launch Price (Price at first sale) in VND/m2
          - Current Market Price (Secondary market) in VND/m2
          - Total Price Range (e.g., 3-5 billion VND)
          - Bank Support (Bank names)
          - Payment Schedule Summary`;
          break;
        case 'legal':
          searchInstructions = `
          DATA POINTS REQUIRED:
          - Legal Status (Pink book/Sales Contract/1:500)
          - Construction Permit (Yes/No)
          - Construction Status (Foundation/Topped out/Handed over)
          - Estimated/Actual Handover Date (Month/Year)`;
          break;
        case 'amenities':
          searchInstructions = `
          DATA POINTS REQUIRED:
          - Internal Amenities (Pool, Gym, Park...)
          - External Amenities (Nearby Schools, Hospitals, Malls)`;
          break;
        default:
          searchInstructions = "Find all key details about this real estate project.";
      }

      const prompt = `
      TASK: SEARCH_AND_EXTRACT
      TARGET: Real Estate Project "${query}"
      
      INSTRUCTIONS:
      1. Perform a Google Search for the "${query}".
      2. Extract ONLY the data points listed below.
      3. OUTPUT FORMAT: Raw text list.
      
      NEGATIVE CONSTRAINTS (DO NOT DO THIS):
      - DO NOT say "I will search".
      - DO NOT say "Here is the information".
      - DO NOT start with "Based on...".
      - DO NOT act as a chatbot. Be a database query result.

      ${searchInstructions}
      
      START OUTPUT NOW:
      `;
      
      resultText = await callGeminiSearch(apiKey, prompt);
    } 
    else if (mode === 'batch_extract') {
      // Giữ nguyên logic batch cũ nhưng đổi prompt tiếng Anh để model hiểu lệnh tốt hơn
      const prompt = `Extract list of real estate projects from this text. Return strictly 1 project per line. Text: \n${raw_content}`;
      resultText = await callGeminiSearch(apiKey, prompt);
    }
    else if (mode === 'scout') {
      const prompt = `Search for new real estate projects related to: "${query}". List them.`;
      resultText = await callGeminiSearch(apiKey, prompt);
    }

    return new Response(JSON.stringify({ data: resultText }), {
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