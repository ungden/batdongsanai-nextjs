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
      temperature: 0.1,
      maxOutputTokens: 8192,
    },
    // Tắt safety filter để tránh block các từ khóa nhạy cảm trong BĐS nếu có
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
  // Trả về nguyên văn text để debug ở client
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "[[AI trả về rỗng]]";
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { query, mode, raw_content, section } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY not set')

    let resultText = "";

    if (mode === 'deep_scan') {
      let searchInstructions = "";

      // Prompt cực kỳ cụ thể để ép AI trả về dữ liệu thay vì chat
      switch (section) {
        case 'overview':
          searchInstructions = `TÌM KIẾM: Tên dự án, Chủ đầu tư, Vị trí chính xác, Mô tả.`;
          break;
        case 'specs':
          searchInstructions = `TÌM KIẾM: Diện tích đất, Quy mô (số tòa/tầng/căn), Mật độ xây dựng.`;
          break;
        case 'financial':
          searchInstructions = `TÌM KIẾM: Giá bán (m2), Giá mở bán, Chính sách thanh toán.`;
          break;
        case 'legal':
          searchInstructions = `TÌM KIẾM: Pháp lý (Sổ hồng/HĐMB), Giấy phép xây dựng, Thời gian bàn giao.`;
          break;
        case 'amenities':
          searchInstructions = `TÌM KIẾM: Tiện ích nội khu và ngoại khu.`;
          break;
      }

      const prompt = `
      [SYSTEM: ACT AS A SEARCH ENGINE WRAPPER. NO CONVERSATION.]
      
      QUERY: ${query}
      CONTEXT: ${searchInstructions}
      
      INSTRUCTION:
      1. Use Google Search to find specific data.
      2. OUTPUT RAW DATA ONLY. Do not say "I found this" or "Here is the info".
      3. Just list the facts found. If not found, say "Not found".
      `;
      
      resultText = await callGeminiSearch(apiKey, prompt);
    } 
    else if (mode === 'batch_extract') {
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