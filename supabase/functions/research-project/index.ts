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

// Helper để parse JSON từ phản hồi text của Gemini
function extractJSON(text: string): any {
  try {
    // Cố gắng tìm block JSON ```json ... ```
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
    // Hoặc tìm cặp ngoặc { } đầu cuối
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1) {
      return JSON.parse(text.substring(firstOpen, lastClose + 1));
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON:", text);
    return null;
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { query, mode = 'scout', raw_content } = await req.json()
    
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY not set')

    let systemPrompt = ""
    let userPrompt = ""
    let useSearchTool = true;

    if (mode === 'batch_extract') {
      // CHẾ ĐỘ BATCH: Trích xuất thuần túy, không search
      useSearchTool = false;
      systemPrompt = `Bạn là chuyên gia xử lý dữ liệu BĐS.
      Nhiệm vụ: Trích xuất danh sách dự án từ văn bản thô người dùng cung cấp.
      
      Yêu cầu:
      1. Nhận diện tên dự án, chủ đầu tư (nếu có), vị trí (nếu có).
      2. Nếu thiếu thông tin, hãy để null hoặc string rỗng, hoặc tự suy luận logic từ tên (ví dụ: "Vinhomes..." -> CĐT Vingroup).
      3. Trả về danh sách JSON sạch. KHÔNG thêm text thừa.
      
      Output JSON Schema:
      {
        "projects": [
          {
            "name": "Tên dự án chuẩn hóa",
            "developer": "Tên CĐT (hoặc 'Đang cập nhật')",
            "location": "Vị trí (Quận/Huyện/Tỉnh) hoặc 'Đang cập nhật'",
            "status": "upcoming" | "good" | "warning", (Mặc định 'good' nếu không rõ)
            "type": "Căn hộ" | "Nhà phố" | "Biệt thự" | "Đất nền" | "Khu đô thị"
          }
        ]
      }`
      userPrompt = `Trích xuất danh sách dự án từ văn bản sau:\n\n${raw_content || query}`
    } 
    else if (mode === 'scout') {
      systemPrompt = `Bạn là chuyên gia BĐS Việt Nam. Hãy dùng Google Search để tìm dữ liệu MỚI NHẤT.
      Nhiệm vụ: Tìm danh sách dự án BĐS theo yêu cầu tìm kiếm.
      
      Output JSON (KHÔNG markdown, chỉ JSON):
      {
        "projects": [
          {
            "name": "Tên đầy đủ",
            "developer": "Chủ đầu tư",
            "location": "Vị trí cụ thể",
            "status": "Trạng thái hiện tại",
            "type": "Loại hình",
            "confidence": "High"
          }
        ],
        "summary": "Tóm tắt ngắn kết quả tìm kiếm"
      }`
      userPrompt = `Tìm kiếm dự án: ${query}`
    } else {
      // DEEP SCAN
      systemPrompt = `Bạn là chuyên gia Thẩm định giá và Nghiên cứu thị trường BĐS.
      ... (Giữ nguyên prompt cũ cho Deep Scan) ...
      Output JSON Schema (KHÔNG markdown):
      {
        "overview": { ... },
        "specs": { ... },
        "legal": { ... },
        "amenities": [...],
        "pricing": { ... }
      }`
      
      userPrompt = `Deep Scan (Thẩm định chi tiết) dự án: ${query}`
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const payload: any = {
      contents: [{
        parts: [{ text: systemPrompt + "\n\n" + userPrompt }]
      }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    };

    // Chỉ bật Google Search khi cần thiết (scout hoặc deep_scan)
    if (useSearchTool) {
      payload.tools = [{ google_search: {} }];
    }

    console.log(`Calling Gemini (Mode: ${mode})...`);
    
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
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) throw new Error("Empty response from AI");

    const result = extractJSON(textResponse);
    if (!result) throw new Error("Failed to parse JSON from Gemini response");

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})