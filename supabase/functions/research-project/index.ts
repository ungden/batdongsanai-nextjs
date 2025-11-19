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
      // CHẾ ĐỘ BATCH: Trích xuất thuần túy, KHÔNG SEARCH
      useSearchTool = false;
      
      systemPrompt = `Bạn là một công cụ trích xuất dữ liệu (Data Parser) chính xác tuyệt đối.
      
      NHIỆM VỤ:
      - Đọc danh sách văn bản thô người dùng cung cấp (có thể là copy từ Excel, Word, hoặc danh sách gạch đầu dòng).
      - Tách từng dòng/mục thành một đối tượng dự án riêng biệt.
      - Nếu người dùng cung cấp 300 dòng, hãy trả về đủ 300 items (hoặc tối đa khả năng của token).
      - KHÔNG tự bịa thêm thông tin. Chỉ lấy thông tin có trong văn bản. Nếu thiếu, để "Đang cập nhật".
      - Tự động nhận diện cấu trúc: "Tên dự án - Vị trí - CĐT" hoặc các biến thể tương tự.
      
      OUTPUT JSON SCHEMA:
      {
        "projects": [
          {
            "name": "Trích xuất tên dự án chính xác",
            "developer": "Tên CĐT (nếu có trong text) hoặc 'Đang cập nhật'",
            "location": "Vị trí (nếu có trong text) hoặc 'Đang cập nhật'",
            "type": "Căn hộ/Nhà phố/Đất nền (đoán dựa trên tên, nếu không rõ để 'Khác')",
            "raw_text": "Giữ nguyên dòng text gốc để đối chiếu"
          }
        ]
      }`
      
      userPrompt = `DANH SÁCH ĐẦU VÀO:\n${raw_content || query}`
    } 
    else if (mode === 'scout') {
      // ... (Giữ nguyên logic scout cũ)
      systemPrompt = `Bạn là chuyên gia BĐS Việt Nam. Hãy dùng Google Search để tìm dữ liệu MỚI NHẤT.
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
      // ... (Giữ nguyên logic deep scan cũ)
      systemPrompt = `Bạn là chuyên gia Thẩm định giá và Nghiên cứu thị trường BĐS...`
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

    // Chỉ bật Google Search khi KHÔNG PHẢI là batch_extract
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