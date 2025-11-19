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
const MODEL_RESEARCH = "gemini-2.0-pro-exp-02-05"; // Dùng cho Research/Thinking
const MODEL_FORMAT = "gemini-2.0-flash";           // Dùng cho Formatting/JSON
const MAX_TOKENS = 50000;

// Hàm gọi AI cơ bản với tham số model linh hoạt
async function callGemini(apiKey: string, prompt: string, model: string, jsonMode: boolean = false) {
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

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
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

    if (mode === 'batch_extract') {
      // === BƯỚC 1: Trích xuất thô (Dùng Model Research mạnh - Pro) ===
      const step1Prompt = `
      Bạn là chuyên gia xử lý dữ liệu BĐS.
      Nhiệm vụ: Đọc văn bản lộn xộn bên dưới và liệt kê lại danh sách các dự án BĐS.
      
      Yêu cầu output (Raw Text):
      - Mỗi dự án một dòng.
      - Định dạng: "Tên Dự Án | Chủ Đầu Tư | Vị Trí"
      - Nếu thiếu thông tin nào, ghi "Đang cập nhật".
      - Chỉ trả về danh sách, không lời dẫn.
      
      Văn bản nguồn:
      ${raw_content}
      `;

      console.log("Step 1: Extracting with Research Model...");
      const rawList = await callGemini(apiKey, step1Prompt, MODEL_RESEARCH, false);
      
      // === BƯỚC 2: Định dạng JSON (Dùng Model Format nhanh - Flash) ===
      const step2Prompt = `
      Nhiệm vụ: Chuyển danh sách text sau thành JSON Array hợp lệ.
      
      Danh sách:
      ${rawList}

      Output Format (JSON):
      {
        "projects": [
          {
            "name": "string (Viết hoa chữ cái đầu)",
            "developer": "string",
            "location": "string",
            "type": "string (Căn hộ/Nhà phố/Đất nền - tự suy luận)",
            "raw_text": "string (dòng gốc)"
          }
        ]
      }
      `;

      console.log("Step 2: Formatting with Flash Model...");
      const jsonResult = await callGemini(apiKey, step2Prompt, MODEL_FORMAT, true);
      resultData = cleanAndParseJSON(jsonResult);

      // Fallback thủ công nếu Step 2 lỗi
      if (!resultData || !resultData.projects) {
         console.warn("Step 2 JSON failed, parsing raw list manually");
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
      // Các mode cần Search và suy luận sâu -> Dùng Model Research (Pro)
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

      // Với mode dùng Tool (Google Search), ta cần dùng endpoint có hỗ trợ tools
      // Lưu ý: Hiện tại model Pro Exp hỗ trợ tools tốt.
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_RESEARCH}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { 
          temperature: 0.1, 
          responseMimeType: "application/json",
          maxOutputTokens: MAX_TOKENS 
        }
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