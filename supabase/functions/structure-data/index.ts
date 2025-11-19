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

async function callGemini(apiKey: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_FORMAT}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
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
      Bạn là Data Engineer. Nhiệm vụ: Trích xuất thông tin từ văn bản báo cáo thành JSON chuẩn để import vào Database.
      
      Văn bản nguồn:
      ${content}
      
      YÊU CẦU QUAN TRỌNG:
      1. Chỉ trích xuất các con số (loại bỏ chữ "tỷ", "triệu", "m2").
      2. Giá tiền: Chuyển hết về đơn vị VNĐ (Ví dụ: 60 triệu -> 60000000).
      3. Nếu không có thông tin, để null.
      
      OUTPUT JSON SCHEMA (Bắt buộc tuân thủ):
      {
        "overview": {
          "description": "string (Tóm tắt dự án chuẩn SEO)",
          "developer": "string",
          "location": "string (Địa chỉ chi tiết)",
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
          "price_per_sqm": number (Giá hiện tại trung bình),
          "launch_price": number (Giá mở bán),
          "price_range": "string (Ví dụ: 3 - 5 tỷ)"
        },
        "legal": {
          "legal_status": "string (Ví dụ: Sổ hồng, HĐMB)",
          "completion_date": "string (Ví dụ: Q4/2025)"
        },
        "amenities": ["string"] (Danh sách tiện ích)
      }`;
    }
    else if (type === 'project_list') {
      prompt = `Extract list of real estate projects from the text below into JSON.
      Text:
      ${content}
      
      Output Schema:
      { "projects": [{ "name": "string", "developer": "string", "location": "string", "status": "string", "type": "string", "confidence": "number" }], "summary": "string" }`;
    }
    else if (type === 'raw_list') {
      prompt = `Convert this raw list into structured JSON Array.
      List:
      ${content}
      
      Output Schema:
      { "projects": [{ "name": "string", "developer": "string", "location": "string", "type": "string", "raw_text": "string" }] }`;
    }
    else {
      throw new Error("Invalid type");
    }

    const jsonString = await callGemini(apiKey, prompt);
    const data = JSON.parse(jsonString);

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