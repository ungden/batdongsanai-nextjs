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

function extractJSON(text: string): any {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try { return JSON.parse(match[1]); } catch (e2) { /* continue */ }
    }
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1) {
      try { return JSON.parse(text.substring(firstOpen, lastClose + 1)); } catch (e3) { /* continue */ }
    }
    return {};
  }
}

async function callGemini(apiKey: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_FORMAT}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
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
    
    if (content && typeof content === 'string' && content.startsWith("RAW_DATA_NOT_FOUND")) {
       return new Response(JSON.stringify({ data: {} }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY not set')

    let prompt = "";

    if (type === 'project_detail') {
      prompt = `
      NHIỆM VỤ: Chuyển đổi văn bản BĐS sau thành JSON chuẩn để lưu Database.
      DỮ LIỆU VÀO:
      """
      ${content}
      """
      
      QUY TẮC XỬ LÝ SỐ LIỆU (BẮT BUỘC):
      1. Chuyển đổi TẤT CẢ giá tiền và diện tích về số nguyên (Integer/Float).
         - "5 tỷ" -> 5000000000
         - "60 triệu/m2" -> 60000000
         - "100m2" -> 100
      2. Nếu là khoảng giá (3-5 tỷ), lấy giá trung bình hoặc giá thấp nhất.
      3. Các trường văn bản phải là TIẾNG VIỆT.
      4. Nếu không có dữ liệu, để null.
      
      JSON SCHEMA:
      {
        "overview": {
          "description": "string (Tiếng Việt, tóm tắt)",
          "developer": "string",
          "location": "string (Địa chỉ chi tiết)",
          "city": "string",
          "district": "string"
        },
        "specs": {
          "total_units": number (số nguyên),
          "total_floors": number (số nguyên),
          "blocks": number (số nguyên),
          "handover_standard": "string"
        },
        "pricing": {
          "price_per_sqm": number (VNĐ, ví dụ 60000000),
          "launch_price": number (VNĐ),
          "price_range": "string (ví dụ: 3 - 5 tỷ)"
        },
        "legal": {
          "legal_status": "string (Sổ hồng/HĐMB...)",
          "completion_date": "string (YYYY hoặc Quý/Năm)"
        },
        "amenities": ["string (Tiếng Việt)"]
      }`;
    }
    else if (type === 'project_list') {
      prompt = `Extract list of real estate projects to JSON. Input: ${content}`;
    }
    else if (type === 'raw_list') {
      prompt = `Convert list to JSON Array. Input: ${content}`;
    }

    const jsonString = await callGemini(apiKey, prompt);
    const data = extractJSON(jsonString);

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