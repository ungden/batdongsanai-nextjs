/* eslint-disable */
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

declare const Deno: {
  env: { get(key: string): string | undefined };
};

const MODEL_FORMAT = "gemini-2.0-flash";

// Hàm trích xuất JSON an toàn từ văn bản AI trả về
function extractJSON(text: string): any {
  try {
    // 1. Thử parse trực tiếp
    return JSON.parse(text);
  } catch (e) {
    // 2. Tìm block JSON trong markdown
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try { return JSON.parse(match[1]); } catch (e2) { /* tiếp tục thử */ }
    }
    
    // 3. Tìm cặp ngoặc nhọn { } ngoài cùng
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1) {
      try { 
        return JSON.parse(text.substring(firstOpen, lastClose + 1)); 
      } catch (e3) { 
        console.error("JSON extraction failed:", e3);
      }
    }
    throw new Error("Không thể định dạng JSON từ phản hồi của AI.");
  }
}

async function callGemini(apiKey: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_FORMAT}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json", // Ép kiểu JSON ngay từ model
      maxOutputTokens: 8192,
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini Error: ${text}`);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { content, type } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY not set')

    let prompt = "";

    if (type === 'project_detail') {
      prompt = `
      Nhiệm vụ: Chuyển đổi thông tin BĐS sau thành JSON chuẩn.
      
      DỮ LIỆU ĐẦU VÀO:
      """
      ${content}
      """
      
      QUY TẮC QUAN TRỌNG:
      1. Chỉ lấy con số (Ví dụ: "5 tỷ" -> 5000000000, "60tr/m2" -> 60000000).
      2. Nếu không tìm thấy thông tin, hãy để null. Đừng bịa đặt.
      3. Đảm bảo JSON hợp lệ, không thêm chú thích.
      
      JSON SCHEMA:
      {
        "overview": {
          "description": "string (tóm tắt ngắn gọn)",
          "developer": "string",
          "location": "string",
          "city": "string",
          "district": "string"
        },
        "specs": {
          "total_units": number,
          "total_floors": number,
          "blocks": number,
          "density_construction": number,
          "handover_standard": "string"
        },
        "pricing": {
          "price_per_sqm": number,
          "launch_price": number,
          "price_range": "string"
        },
        "legal": {
          "legal_status": "string",
          "completion_date": "string"
        },
        "amenities": ["string"]
      }`;
    }
    else if (type === 'project_list') {
      prompt = `Extract list of real estate projects to JSON. Input: ${content}`;
    }
    else if (type === 'raw_list') {
      prompt = `Convert list to JSON Array. Input: ${content}`;
    }
    else {
      throw new Error("Invalid type");
    }

    const jsonString = await callGemini(apiKey, prompt);
    const data = extractJSON(jsonString); // Sử dụng hàm trích xuất an toàn

    return new Response(JSON.stringify({ data }), {
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