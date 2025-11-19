import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import OpenAI from "https://esm.sh/openai@4.52.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

declare const Deno: {
  env: { get(key: string): string | undefined };
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { topic, type, context = '', tone = 'chuyên nghiệp', language = 'vi-VN' } = await req.json()
    
    if (!topic && !context) throw new Error('Cần cung cấp chủ đề (topic) hoặc ngữ cảnh (context)')

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
    
    if (type === 'news') {
      systemPrompt = `Bạn là nhà báo bất động sản chuyên nghiệp tại Việt Nam. Nhiệm vụ: Viết tin tức/bài phân tích dựa trên chủ đề được giao.
      Yêu cầu đầu ra JSON:
      {
        "title": "Tiêu đề hấp dẫn, chuẩn SEO (dưới 70 ký tự)",
        "content": "Nội dung bài viết định dạng Markdown. Chia các đoạn rõ ràng, dùng heading phù hợp. Tối thiểu 500 từ.",
        "summary": "Tóm tắt ngắn gọn (meta description) dưới 160 ký tự",
        "keywords": ["từ khóa 1", "từ khóa 2", ...],
        "meta_title": "Tiêu đề SEO",
        "category": "thị trường" | "dự án" | "chính sách"
      }`
    } else if (type === 'page') {
      systemPrompt = `Bạn là chuyên gia content marketing. Nhiệm vụ: Viết nội dung cho trang web (Landing page, About us, Service...).
      Yêu cầu đầu ra JSON:
      {
        "title": "Tiêu đề trang",
        "content": "Nội dung chi tiết định dạng Markdown/HTML. Tập trung vào chuyển đổi và thông tin rõ ràng.",
        "slug": "url-slug-than-thien-seo",
        "meta_description": "Mô tả chuẩn SEO"
      }`
    } else if (type === 'announcement') {
      systemPrompt = `Bạn là quản trị viên hệ thống. Nhiệm vụ: Viết thông báo chính thức gửi đến người dùng.
      Yêu cầu đầu ra JSON:
      {
        "title": "Tiêu đề thông báo",
        "content": "Nội dung thông báo rõ ràng, lịch sự, ngắn gọn."
      }`
    }

    const userPrompt = `Chủ đề/Yêu cầu: ${topic}
    ${context ? `Thông tin ngữ cảnh bổ sung:\n${context}` : ''}
    Ngôn ngữ: ${language}
    Giọng điệu: ${tone}`

    const chat = await client.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4,
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