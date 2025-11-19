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
      // CHẾ ĐỘ DEEP SCAN - Nâng cấp logic tìm giá
      systemPrompt = `Bạn là chuyên gia Thẩm định giá và Nghiên cứu thị trường BĐS.
      
      NHIỆM VỤ QUAN TRỌNG VỀ GIÁ (PRICING):
      1. Tìm kiếm ít nhất 3-5 nguồn tin khác nhau (batdongsan.com.vn, cafef, các trang rao vặt, báo cáo thị trường) trong 3 tháng gần nhất.
      2. Loại bỏ các mức giá "ảo" (quá thấp để câu khách) hoặc giá cũ.
      3. Tổng hợp và tính GIÁ TRUNG BÌNH thực tế trên thị trường chuyển nhượng hoặc giá chủ đầu tư đang bán.
      4. Phân biệt rõ giá mở bán (Launch) và giá hiện tại (Current).
      
      Output JSON Schema (KHÔNG markdown):
      {
        "overview": { 
          "description": "Mô tả tổng quan dự án (~200 từ)", 
          "address": "Địa chỉ chính xác", 
          "district": "Quận/Huyện", 
          "city": "Tỉnh/TP", 
          "website": "Link (nếu có)" 
        },
        "specs": { 
          "site_area": number (m2), 
          "construction_density": number (%), 
          "total_blocks": number, 
          "total_floors": number, 
          "total_units": number, 
          "unit_types": ["1PN", "2PN", "3PN"] 
        },
        "legal": { 
          "status": "Pháp lý hiện tại (Sổ hồng/HĐMB/Chưa rõ)", 
          "construction_permit": boolean, 
          "bank_guarantee": "Tên ngân hàng bảo lãnh (nếu có)" 
        },
        "amenities": ["Tiện ích 1", "Tiện ích 2", "Tiện ích 3"],
        "pricing": { 
          "min_price": number (VNĐ/m2), 
          "max_price": number (VNĐ/m2), 
          "price_per_sqm": number (VNĐ/m2 - Giá trung bình đã tính toán),
          "launch_price": number (VNĐ/m2 - Giá mở bán đợt đầu, nếu tìm thấy),
          "pricing_note": "Ghi chú rõ nguồn gốc giá (Ví dụ: 'Giá trung bình dựa trên 5 tin đăng tháng 6/2024, giá đã bao gồm VAT' hoặc 'Giá rumor từ môi giới')"
        }
      }`
      
      userPrompt = `Deep Scan (Thẩm định chi tiết) dự án: ${query}. Hãy tìm kiếm kỹ về giá bán hiện tại.`
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
        temperature: 0.1, // Giữ nhiệt độ thấp để AI tập trung vào số liệu chính xác
        responseMimeType: "application/json"
      }
    };

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
    
    // Trích xuất text từ response của Gemini
    const candidates = data.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from Gemini");
    }

    const textResponse = candidates[0].content.parts[0].text;
    
    // Lấy thông tin grounding (nguồn tham khảo)
    const groundingMetadata = candidates[0].groundingMetadata;
    
    // In ra log để debug nguồn
    if (groundingMetadata?.groundingChunks) {
      console.log("Sources used:", groundingMetadata.groundingChunks.map((c: any) => c.web?.title).join(", "));
    }

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