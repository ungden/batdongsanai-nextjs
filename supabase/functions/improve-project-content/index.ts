import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import OpenAI from "https://esm.sh/openai@4.52.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-api-version',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
  'Access-Control-Max-Age': '86400',
}

declare const Deno: {
  env: { get(key: string): string | undefined };
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }
  if (req.method === 'GET' || req.method === 'HEAD') {
    return new Response(JSON.stringify({ ok: true, name: 'improve-project-content' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { mode = 'structured', section = 'project_analysis', payload, tone = 'chuyên nghiệp, rõ ràng', length = 'keep', language = 'vi-VN', constraints = '' } = await req.json()

    if (payload === undefined || payload === null) {
      return new Response(JSON.stringify({ error: 'payload is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openrouterApiKey) {
      return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const client = new OpenAI({
      apiKey: openrouterApiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        'HTTP-Referer': 'https://cqcgzmsmtstfjhpgucll.dyad.sh',
        'X-Title': 'PropertyHub',
      },
    });

    const baseRules = `- Ngôn ngữ: ${language}
- Giọng điệu: ${tone}
- Không bịa số liệu hay sự thật. GIỮ NGUYÊN các giá trị số.
- Ngắn gọn, mạch lạc. ${length === 'shorten' ? 'Rút gọn hợp lý.' : length === 'expand' ? 'Mở rộng câu văn nhưng giữ nguyên nội dung.' : 'Giữ độ dài tương đương.'}
- Tránh từ ngữ phô trương, không kiểm chứng.`

    let system = ''
    let user = ''

    if (mode === 'structured') {
      system = `Bạn là biên tập viên AI cho báo cáo phân tích DỰ ÁN BẤT ĐỘNG SẢN.
${baseRules}
- CẢI THIỆN câu chữ trong các trường văn bản của JSON (meta.title, summary_for_indexing, valuation.summary, sections.content_blocks, risksAndPotentials, recommendations, keyHighlights...).
- KHÔNG thay đổi schema, KHÔNG thêm/xoá trường.
- KHÔNG thay đổi giá trị số (finalPriceTarget, rentalYield, v.v.).
- Trả về DUY NHẤT một JSON với cùng schema như đầu vào.`

      user = `SECTION: ${section}
JSON INPUT:
${JSON.stringify(payload)}${constraints ? `\n\nRÀNG BUỘC THÊM:\n${constraints}` : ''}`
    } else {
      system = `Bạn là biên tập viên AI cho nội dung dự án BĐS.\n${baseRules}\n- Trả về CHỈ phần văn bản đã cải thiện (plain text).`
      user = `INPUT:
${typeof payload === 'string' ? payload : JSON.stringify(payload)}${constraints ? `\n\nRÀNG BUỘC THÊM:\n${constraints}` : ''}`
    }

    const chat = await client.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      stream: false,
      temperature: 0.2,
      ...(mode === 'structured' ? { response_format: { type: "json_object" } } : {})
    });

    const resultText = chat.choices?.[0]?.message?.content || ''
    if (!resultText) {
      return new Response(JSON.stringify({ error: 'Empty response from model' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let data: any = resultText
    if (mode === 'structured') {
      try {
        data = JSON.parse(resultText)
      } catch {
        const fenced = resultText.match(/```json\s*([\s\S]*?)\s*```/)
        if (fenced) {
          data = JSON.parse(fenced[1])
        } else {
          const jsonMatch = resultText.match(/\{[\s\S]*\}/)
          if (jsonMatch) data = JSON.parse(jsonMatch[0])
        }
      }
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    console.error('improve-project-content error', e)
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})