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

// Hàm xử lý JSON mạnh mẽ hơn: Lọc sạch markdown và tìm cặp ngoặc hợp lệ
function extractJSON(text: string): any {
  try {
    // 1. Loại bỏ markdown code blocks (```json, ```)
    let cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    // 2. Tìm vị trí bắt đầu của JSON object ({) hoặc array ([)
    const firstOpenBrace = cleanText.indexOf('{');
    const firstOpenBracket = cleanText.indexOf('[');
    
    let startIdx = -1;
    let endIdx = -1;

    // Xác định xem là Object hay Array dựa vào cái nào xuất hiện trước
    if (firstOpenBrace !== -1 && (firstOpenBracket === -1 || firstOpenBrace < firstOpenBracket)) {
       startIdx = firstOpenBrace;
       endIdx = cleanText.lastIndexOf('}');
    } else if (firstOpenBracket !== -1) {
       startIdx = firstOpenBracket;
       endIdx = cleanText.lastIndexOf(']');
    }

    // 3. Cắt chuỗi JSON hợp lệ
    if (startIdx !== -1 && endIdx !== -1) {
      cleanText = cleanText.substring(startIdx, endIdx + 1);
    }

    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse JSON. Raw text:", text);
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
      // CHẾ ĐỘ BATCH: Trích xuất thuần túy từ văn bản, KHÔNG SEARCH
      useSearchTool = false;
      
      systemPrompt = `Bạn là một API chuyển đổi dữ liệu (Data Parser).
      NHIỆM VỤ:
      1. Đọc danh sách văn bản thô đầu vào.
      2. Trích xuất thông tin từng dự án thành JSON Array.
      3. KHÔNG thêm bớt thông tin không có trong văn bản. Nếu thiếu, để "Đang cập nhật".
      4. TRẢ VỀ CHỈ MỘT JSON DUY NHẤT. KHÔNG MARKDOWN, KHÔNG GIẢI THÍCH.
      
      OUTPUT FORMAT:
      {
        "projects": [
          {
            "name": "Tên dự án (Viết hoa chữ cái đầu)",
            "developer": "Tên CĐT hoặc 'Đang cập nhật'",
            "location": "Vị trí/Quận huyện hoặc 'Đang cập nhật'",
            "type": "Căn hộ/Nhà phố/Đất nền",
            "raw_text": "Dòng văn bản gốc"
          }
        ]
      }`
      
      userPrompt = `DỮ LIỆU ĐẦU VÀO:\n${raw_content || query}`
    } 
    else if (mode === 'scout') {
      // CHẾ ĐỘ SCOUT: Tìm kiếm thông tin mới
      systemPrompt = `Bạn là chuyên gia dữ liệu BĐS. Sử dụng Google Search để tìm thông tin mới nhất.
      Output JSON format (NO MARKDOWN):
      {
        "projects": [
          {
            "name": "Tên đầy đủ",
            "developer": "Chủ đầu tư",
            "location": "Vị trí cụ thể",
            "status": "Trạng thái (Sắp mở bán/Đang bán/Đã bàn giao)",
            "type": "Loại hình",
            "confidence": "High/Medium/Low"
          }
        ],
        "summary": "Tóm tắt ngắn kết quả"
      }`
      userPrompt = `Tìm kiếm thông tin dự án: ${query}`
    } else {
      // CHẾ ĐỘ DEEP SCAN: Phân tích sâu 1 dự án
      systemPrompt = `Bạn là chuyên gia Thẩm định giá BĐS. Tìm kiếm và tổng hợp thông tin chi tiết.
      Output JSON format (NO MARKDOWN):
      {
        "overview": { "description": "..." },
        "specs": { "total_units": 0, "total_floors": 0 },
        "pricing": { "price_per_sqm": 0, "currency": "VND" },
        "amenities": ["..."]
      }`
      userPrompt = `Deep Scan dự án: ${query}`
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const payload: any = {
      contents: [{
        parts: [{ text: systemPrompt + "\n\n" + userPrompt }]
      }],
      generationConfig: {
        temperature: 0.1,
        // Bắt buộc trả về JSON mode để giảm lỗi parsing
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