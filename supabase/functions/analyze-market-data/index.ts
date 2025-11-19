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

function extractJSON(text: string): any {
  try {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) return JSON.parse(match[1]);
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1) return JSON.parse(text.substring(firstOpen, lastClose + 1));
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { raw_content, type } = await req.json()
    
    if (!raw_content) throw new Error('Missing raw_content')

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY not set')

    let systemPrompt = ''

    if (type === 'catalyst') {
      systemPrompt = `Bạn là chuyên gia phân tích thị trường BĐS. 
      Nhiệm vụ: Sử dụng Google Search để KIỂM CHỨNG và BỔ SUNG thông tin từ nội dung đầu vào, sau đó trích xuất thành JSON.
      
      Output JSON Schema:
      {
        "title": "Tiêu đề ngắn gọn",
        "description": "Mô tả chi tiết (có số liệu thực tế từ search)",
        "catalyst_type": "infrastructure" | "policy" | "economic" | "supply_demand",
        "impact_level": "very_high" | "high" | "medium" | "low",
        "impact_direction": "positive" | "negative" | "neutral",
        "affected_areas": ["Quận 1", "Thủ Đức", ...],
        "estimated_price_impact_percent": number (ví dụ: 5.5),
        "effective_date": "YYYY-MM-DD" (dự kiến hoặc chính thức)
      }`
    } else if (type === 'infrastructure') {
      systemPrompt = `Bạn là chuyên gia quy hoạch.
      Nhiệm vụ: Sử dụng Google Search để tìm thông tin MỚI NHẤT về dự án hạ tầng này (tiến độ, vốn, ngày khởi công/hoàn thành).
      
      Output JSON Schema:
      {
        "name": "Tên dự án",
        "infrastructure_type": "metro" | "road" | "bridge" | "airport",
        "description": "Mô tả tiến độ hiện tại",
        "location_district": "Quận/Huyện chính",
        "status": "planned" | "under_construction" | "completed",
        "start_date": "YYYY-MM-DD",
        "expected_completion": "YYYY-MM-DD",
        "budget_vnd": number (VND),
        "estimated_property_impact_percent": number
      }`
    } else if (type === 'regulation') {
      systemPrompt = `Bạn là luật sư BĐS.
      Nhiệm vụ: Sử dụng Google Search để tìm văn bản luật chính xác và phân tích tác động.
      
      Output JSON Schema:
      {
        "title": "Tên văn bản",
        "regulation_type": "law" | "decree" | "circular",
        "regulation_number": "Số hiệu",
        "issuing_authority": "Cơ quan ban hành",
        "effective_date": "YYYY-MM-DD",
        "description": "Nội dung chính",
        "impact_on_buyers": "Tác động người mua",
        "impact_on_investors": "Tác động nhà đầu tư"
      }`
    }

    const userPrompt = `Nội dung cần phân tích: ${raw_content}`;

    // Call Gemini with Google Search Tool
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [{ text: systemPrompt + "\n\n" + userPrompt }]
      }],
      tools: [{ google_search: {} }], // Enable Search
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    };

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
    if (!result) throw new Error("Failed to parse JSON");

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})