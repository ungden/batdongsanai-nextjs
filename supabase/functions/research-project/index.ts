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

// Cấu hình Models
const MODEL_RESEARCH = "gemini-2.5-pro-preview-03-25"; 
const MODEL_FORMAT = "gemini-2.0-flash";   
const MAX_TOKENS = 50000;

// Hàm gọi AI cơ bản đã nâng cấp để hỗ trợ Tool
async function callGemini(apiKey: string, prompt: string, model: string, jsonMode: boolean = false, useSearch: boolean = false) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const payload: any = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: MAX_TOKENS,
    }
  };

  if (jsonMode) {
    payload.generationConfig.responseMimeType = "application/json";
  }

  if (useSearch) {
    payload.tools = [{ google_search: {} }];
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    if (response.status === 429) {
      throw new Error(`Google API Quota Exceeded (429). Model ${model} đang quá tải.`);
    }
    throw new Error(`Gemini API Error (${model}): ${errText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Hàm làm sạch JSON
function cleanAndParseJSON(text: string): any {
  try {
    let clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const firstBrace = clean.indexOf('{');
    const firstBracket = clean.indexOf('[');
    const lastBrace = clean.lastIndexOf('}');
    const lastBracket = clean.lastIndexOf(']');

    let start = -1; 
    let end = -1;

    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      start = firstBracket;
      end = lastBracket;
    } else if (firstBrace !== -1) {
      start = firstBrace;
      end = lastBrace;
    }

    if (start !== -1 && end !== -1) {
      clean = clean.substring(start, end + 1);
    }

    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON Parse Error. Raw text:", text);
    return null;
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { query, mode = 'scout', raw_content } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY not set')

    let resultData;

    // === 1. BATCH EXTRACT ===
    if (mode === 'batch_extract') {
      const step1Prompt = `
      Nhiệm vụ: Đọc văn bản bên dưới và liệt kê danh sách các dự án BĐS.
      Định dạng dòng: "Tên Dự Án | Chủ Đầu Tư | Vị Trí"
      Văn bản nguồn:
      ${raw_content}
      `;
      // Step 1: Trích xuất thô (Không search, không JSON)
      const rawList = await callGemini(apiKey, step1Prompt, MODEL_RESEARCH, false, false);
      
      const step2Prompt = `
      Chuyển danh sách sau thành JSON Array:
      ${rawList}
      Output Format: { "projects": [{ "name", "developer", "location", "type", "raw_text" }] }
      `;
      // Step 2: Format JSON (Flash, JSON Mode)
      const jsonResult = await callGemini(apiKey, step2Prompt, MODEL_FORMAT, true, false);
      resultData = cleanAndParseJSON(jsonResult);
    } 
    
    // === 2. SCOUT & DEEP SCAN (Sử dụng Google Search) ===
    else if (mode === 'scout' || mode === 'deep_scan') {
      
      // BƯỚC 1: RESEARCH (Dùng Search Tool, trả về Text tự nhiên)
      let researchPrompt = "";
      if (mode === 'scout') {
        researchPrompt = `Bạn là chuyên gia dữ liệu BĐS. Hãy tìm kiếm thông tin mới nhất về: "${query}".
        Liệt kê các dự án BĐS liên quan tìm thấy. Với mỗi dự án, cung cấp: Tên, Chủ đầu tư, Vị trí cụ thể, Trạng thái hiện tại.
        Trả về báo cáo dạng văn bản chi tiết.`;
      } else {
        researchPrompt = `Bạn là chuyên gia Thẩm định giá. Hãy tìm kiếm chi tiết (Deep Scan) về dự án: "${query}".
        Thu thập: Tổng quan, Thông số (số căn, tầng), Giá bán (mở bán, hiện tại, phí QL), Tiện ích, Tình trạng pháp lý.
        Trả về báo cáo dạng văn bản chi tiết.`;
      }

      const searchResultText = await callGemini(apiKey, researchPrompt, MODEL_RESEARCH, false, true);

      // BƯỚC 2: FORMATTING (Dùng Flash, JSON Mode, Input là kết quả bước 1)
      let formatPrompt = "";
      if (mode === 'scout') {
        formatPrompt = `Từ báo cáo sau, trích xuất thành JSON:
        ${searchResultText}
        
        Output Schema:
        { "projects": [{ "name", "developer", "location", "status", "type", "confidence" }], "summary": "string" }`;
      } else {
        formatPrompt = `Từ báo cáo sau, trích xuất thành JSON:
        ${searchResultText}
        
        Output Schema:
        { "overview": {"description"}, "specs": {"total_units", "total_floors"}, "pricing": {"price_per_sqm", "launch_price", "price_range"}, "amenities": ["string"] }`;
      }

      const jsonResultText = await callGemini(apiKey, formatPrompt, MODEL_FORMAT, true, false);
      resultData = cleanAndParseJSON(jsonResultText);
    }

    if (!resultData) {
      // Fallback nếu JSON parse lỗi
      throw new Error("Failed to parse result data.");
    }

    return new Response(JSON.stringify({ data: resultData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})