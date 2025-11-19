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
    const { query, mode = 'scout' } = await req.json()
    
    // Sử dụng GEMINI_API_KEY thay vì OPENROUTER
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY not set')

    let systemPrompt = ""
    let userPrompt = ""

    if (mode === 'scout') {
      systemPrompt = `Bạn là chuyên gia BĐS Việt Nam. Hãy dùng Google Search để tìm dữ liệu MỚI NHẤT.
      Nhiệm vụ: Tìm danh sách dự án BĐS theo yêu cầu.
      
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
      systemPrompt = `Bạn là chuyên gia dữ liệu BĐS. Hãy dùng Google Search để tìm thông tin CHI TIẾT và MỚI NHẤT.
      
      Output JSON (Full Schema, KHÔNG markdown):
      {
        "overview": { "description": "Mô tả ~200 từ", "address": "Địa chỉ", "district": "Quận", "city": "TP", "website": "Link" },
        "specs": { "site_area": number, "construction_density": number, "total_blocks": number, "total_floors": number, "total_units": number, "unit_types": ["1PN", "2PN"] },
        "legal": { "status": "Pháp lý hiện tại", "construction_permit": boolean, "bank_guarantee": "Ngân hàng" },
        "amenities": ["Tiện ích 1", "Tiện ích 2"],
        "pricing": { "min_price": number, "max_price": number, "price_per_sqm": number }
      }`
      userPrompt = `Deep Scan thông tin dự án: ${query}`
    }

    // Gọi trực tiếp Google Gemini API với tools google_search
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [{ text: systemPrompt + "\n\n" + userPrompt }]
      }],
      tools: [{
        google_search: {} // Kích hoạt Google Search Grounding
      }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json" // Yêu cầu trả về JSON
      }
    };

    console.log("Calling Gemini with Search...");
    
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
    
    // Trích xuất text từ response của Gemini
    const candidates = data.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from Gemini");
    }

    const textResponse = candidates[0].content.parts[0].text;
    
    // Lấy thông tin grounding (nguồn tham khảo) nếu cần hiển thị sau này
    const groundingMetadata = candidates[0].groundingMetadata;
    console.log("Grounding Metadata found:", !!groundingMetadata);

    const result = extractJSON(textResponse);

    if (!result) {
        throw new Error("Failed to parse JSON from Gemini response");
    }

    return new Response(JSON.stringify({ data: result, grounding: groundingMetadata }), {
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