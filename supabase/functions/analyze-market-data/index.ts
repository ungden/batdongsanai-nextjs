/* eslint-disable */
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import OpenAI from 'https://esm.sh/openai@4.52.7'

// Add Deno type declaration to fix TS error
declare const Deno: {
  env: { get(key: string): string | undefined };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { raw_content, type, model = 'google/gemini-2.5-flash' } = await req.json()
    
    if (!raw_content) throw new Error('Missing raw_content')

    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openrouterApiKey) throw new Error('OPENROUTER_API_KEY not set')

    const client = new OpenAI({
      apiKey: openrouterApiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://propertyhub.vn',
        'X-Title': 'PropertyHub',
      },
    })

    let systemPrompt = ''
    let userPrompt = ''

    // Định nghĩa Schema và Prompt dựa trên loại phân tích
    if (type === 'catalyst') {
      systemPrompt = `Bạn là chuyên gia phân tích thị trường BĐS. Nhiệm vụ: Trích xuất thông tin từ văn bản thành JSON cho bảng "market_catalysts".
      JSON Schema:
      {
        "title": "string (ngắn gọn)",
        "description": "string (chi tiết)",
        "catalyst_type": "infrastructure" | "policy" | "economic" | "supply_demand",
        "impact_level": "very_high" | "high" | "medium" | "low",
        "impact_direction": "positive" | "negative" | "neutral",
        "affected_areas": ["string"],
        "estimated_price_impact_percent": number (ví dụ: 5.5, -2.0),
        "effective_date": "YYYY-MM-DD" (nếu có)
      }`
    } else if (type === 'infrastructure') {
      systemPrompt = `Bạn là chuyên gia quy hoạch. Nhiệm vụ: Trích xuất thông tin dự án hạ tầng thành JSON.
      JSON Schema:
      {
        "name": "string",
        "infrastructure_type": "metro" | "road" | "bridge" | "airport" | "other",
        "description": "string",
        "location_district": "string",
        "status": "planned" | "under_construction" | "completed",
        "start_date": "YYYY-MM-DD",
        "expected_completion": "YYYY-MM-DD",
        "budget_vnd": number (ước tính),
        "estimated_property_impact_percent": number
      }`
    } else if (type === 'regulation') {
      systemPrompt = `Bạn là luật sư BĐS. Nhiệm vụ: Trích xuất thông tin văn bản luật thành JSON.
      JSON Schema:
      {
        "title": "string",
        "regulation_type": "law" | "decree" | "circular",
        "regulation_number": "string",
        "issuing_authority": "string",
        "effective_date": "YYYY-MM-DD",
        "description": "string",
        "impact_on_buyers": "string",
        "impact_on_investors": "string"
      }`
    }

    userPrompt = `Văn bản nguồn:\n${raw_content}`

    const chat = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(chat.choices[0].message.content || '{}')

    return new Response(JSON.stringify({ data: result }), {
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