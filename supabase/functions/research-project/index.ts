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

const MODEL_RESEARCH = "gemini-2.5-pro-preview-03-25"; 
// const MODEL_FORMAT = "gemini-2.0-flash"; // Removed, not needed here anymore

async function callGeminiSearch(apiKey: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_RESEARCH}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 429) throw new Error("Google Search Quota Exceeded.");
    throw new Error(`Gemini Search Error: ${err}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callGeminiBasic(apiKey: string, prompt: string) {
  // Dùng cho batch extract bước 1 (đọc hiểu text thô, không search)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_RESEARCH}:generateContent?key=${apiKey}`;
   const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1 }
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { query, mode, raw_content } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY not set')

    let resultText = "";

    if (mode === 'batch_extract') {
      // Bước 1: Đọc text thô và chuẩn hóa thành danh sách dạng text
      const prompt = `
      Nhiệm vụ: Đọc văn bản bên dưới và liệt kê danh sách các dự án BĐS.
      Định dạng dòng: "Tên Dự Án | Chủ Đầu Tư | Vị Trí"
      Văn bản nguồn:
      ${raw_content}
      `;
      resultText = await callGeminiBasic(apiKey, prompt);
    } 
    else if (mode === 'scout') {
      const prompt = `Bạn là chuyên gia dữ liệu BĐS. Tìm kiếm thông tin mới nhất về: "${query}".
      Liệt kê các dự án BĐS liên quan tìm thấy. Với mỗi dự án, cung cấp: Tên, Chủ đầu tư, Vị trí cụ thể, Trạng thái hiện tại.
      Trả về báo cáo dạng văn bản chi tiết.`;
      resultText = await callGeminiSearch(apiKey, prompt);
    } 
    else if (mode === 'deep_scan') {
      const prompt = `Bạn là chuyên gia Thẩm định giá. Tìm kiếm chi tiết về dự án: "${query}".
      Thu thập: Tổng quan, Thông số (số căn, tầng), Giá bán (mở bán, hiện tại, phí QL), Tiện ích, Tình trạng pháp lý.
      Trả về báo cáo dạng văn bản chi tiết.`;
      resultText = await callGeminiSearch(apiKey, prompt);
    }

    // CHỈ TRẢ VỀ TEXT, KHÔNG PARSE JSON
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