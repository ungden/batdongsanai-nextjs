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

// Hàm gọi AI cơ bản
async function callGemini(apiKey: string, prompt: string, jsonMode: boolean = false) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  const payload: any = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.1,
    }
  };

  if (jsonMode) {
    payload.generationConfig.responseMimeType = "application/json";
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error: ${errText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Hàm làm sạch JSON
function cleanAndParseJSON(text: string): any {
  try {
    // Bước 1: Xóa markdown
    let clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    // Bước 2: Tìm điểm bắt đầu và kết thúc của JSON (Object hoặc Array)
    const firstBrace = clean.indexOf('{');
    const firstBracket = clean.indexOf('[');
    const lastBrace = clean.lastIndexOf('}');
    const lastBracket = clean.lastIndexOf(']');

    let start = -1; 
    let end = -1;

    // Ưu tiên Array [...] nếu xuất hiện trước hoặc nếu mode batch thường trả về array
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

    if (mode === 'batch_extract') {
      // === CHIẾN LƯỢC 2 BƯỚC CHO BATCH IMPORT ===
      
      // BƯỚC 1: Trích xuất & Chuẩn hóa thô (Raw Normalization)
      // Mục tiêu: Biến đống text lộn xộn thành cấu trúc dễ đọc (CSV-like)
      const step1Prompt = `
      Bạn là trợ lý xử lý dữ liệu. Nhiệm vụ: Đọc văn bản bên dưới và liệt kê các dự án BĐS.
      
      Yêu cầu:
      - Mỗi dự án một dòng.
      - Định dạng dòng: "Tên Dự Án | Chủ Đầu Tư | Vị Trí"
      - Nếu thiếu thông tin nào, ghi "Đang cập nhật".
      - Không thêm lời dẫn, không đánh số thứ tự.
      
      Văn bản nguồn:
      ${raw_content}
      `;

      const rawList = await callGemini(apiKey, step1Prompt, false);
      
      // BƯỚC 2: Định dạng JSON (JSON Formatting)
      // Mục tiêu: Chuyển danh sách sạch ở Bước 1 thành JSON hợp lệ
      const step2Prompt = `
      Nhiệm vụ: Chuyển danh sách văn bản sau thành JSON Array.
      
      Danh sách:
      ${rawList}

      Output Format (JSON):
      {
        "projects": [
          {
            "name": "string",
            "developer": "string",
            "location": "string",
            "type": "string (Căn hộ/Nhà phố/Đất nền - tự suy luận từ tên)",
            "raw_text": "string (dòng gốc)"
          }
        ]
      }
      `;

      const jsonResult = await callGemini(apiKey, step2Prompt, true);
      resultData = cleanAndParseJSON(jsonResult);

      // Fallback: Nếu Bước 2 fail JSON, thử parse thủ công từ Bước 1
      if (!resultData || !resultData.projects) {
         console.log("Step 2 JSON failed, parsing raw list manually");
         const lines = rawList.split('\n').filter((l: string) => l.includes('|'));
         const manualProjects = lines.map((line: string) => {
            const [name, developer, location] = line.split('|').map((s: string) => s.trim());
            return {
                name: name || "Không rõ",
                developer: developer || "Đang cập nhật",
                location: location || "Đang cập nhật",
                type: "Đang cập nhật",
                raw_text: line
            };
         });
         resultData = { projects: manualProjects };
      }

    } else if (mode === 'scout' || mode === 'deep_scan') {
      // Giữ nguyên logic cũ cho các mode khác (vì nó dùng Google Search Tool)
      // Nhưng thêm lớp bảo vệ JSON parsing
      
      let systemPrompt = "";
      let userPrompt = "";
      
      if (mode === 'scout') {
        systemPrompt = `Bạn là chuyên gia dữ liệu BĐS. Tìm kiếm thông tin mới nhất và trả về JSON.
        Format: { "projects": [{ "name", "developer", "location", "status", "type", "confidence" }], "summary" }`;
        userPrompt = `Tìm kiếm: ${query}`;
      } else {
        systemPrompt = `Bạn là chuyên gia Thẩm định giá. Tìm kiếm chi tiết dự án và trả về JSON.
        Format: { "overview": {}, "specs": {}, "pricing": {}, "amenities": [] }`;
        userPrompt = `Deep scan: ${query}`;
      }

      // Gọi Gemini với Search Tool (cần dùng endpoint có tool)
      // Lưu ý: Đoạn code cũ dùng fetch trực tiếp với tool config
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      resultData = cleanAndParseJSON(text);
    }

    if (!resultData) {
      throw new Error("Failed to parse result data after all attempts.");
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