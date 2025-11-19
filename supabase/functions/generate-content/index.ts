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
    const { action = 'generate', topic, content, type, context = '', tone = 'chuyên nghiệp', language = 'vi-VN' } = await req.json()
    
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

    if (action === 'optimize') {
      systemPrompt = `Bạn là biên tập viên SEO chuyên nghiệp. Nhiệm vụ: Tối ưu hóa bài viết có sẵn.
      Yêu cầu đầu ra JSON:
      {
        "title": "Tiêu đề tối ưu (hấp dẫn, chứa từ khóa, dưới 70 ký tự)",
        "content": "Nội dung đã biên tập lại (giữ nguyên ý nghĩa, sửa lỗi chính tả/ngữ pháp, tối ưu mật độ từ khóa, định dạng Markdown đẹp)",
        "meta_description": "Meta description chuẩn SEO (dưới 160 ký tự)",
        "keywords": ["từ khóa 1", "từ khóa 2", ...],
        "improvements": ["Điểm cải thiện 1", "Điểm cải thiện 2"]
      }`
      userPrompt = `Nội dung gốc:\n${content}\n\nYêu cầu: Tối ưu SEO, giọng điệu ${tone}, ngôn ngữ ${language}.\n${context ? `Lưu ý ngữ cảnh: ${context}` : ''}`
    } else {
      // Action: generate
      if (!topic && !context) throw new Error('Cần cung cấp chủ đề (topic) hoặc ngữ cảnh (context)')

      if (type === 'news') {
        systemPrompt = `Bạn là nhà báo bất động sản chuyên nghiệp. Nhiệm vụ: Viết bài mới dựa trên thông tin được cung cấp.
        Yêu cầu đầu ra JSON:
        {
          "title": "Tiêu đề hấp dẫn, chuẩn SEO",
          "content": "Nội dung bài viết định dạng Markdown. Cấu trúc rõ ràng (Intro, Body, Conclusion). Sử dụng H2, H3, Bullet points.",
          "summary": "Tóm tắt ngắn gọn (meta description)",
          "keywords": ["từ khóa"],
          "meta_title": "Tiêu đề SEO"
        }`
      } else if (type === 'page') {
        systemPrompt = `Bạn là chuyên gia content marketing. Nhiệm vụ: Viết nội dung Landing page/Giới thiệu.
        Yêu cầu đầu ra JSON:
        {
          "title": "Tiêu đề trang",
          "content": "Nội dung thuyết phục, định dạng Markdown/HTML.",
          "slug": "url-slug",
          "meta_description": "Mô tả chuẩn SEO"
        }`
      } else {
        systemPrompt = `Bạn là trợ lý ảo. Viết nội dung theo yêu cầu. Trả về JSON có trường title và content.`
      }

      userPrompt = `Chủ đề: ${topic || 'Tự đặt dựa trên ngữ cảnh'}
      ${context ? `DỮ LIỆU ĐẦU VÀO (Sử dụng thông tin này): \n${context}` : ''}
      Ngôn ngữ: ${language}
      Giọng điệu: ${tone}`
    }

    const chat = await client.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const resultText = chat.choices[0].message.content || '{}'
    // Simple JSON cleaning if model adds markdown blocks
    const cleanJson = resultText.replace(/```json|```/g, '').trim()
    const result = JSON.parse(cleanJson)

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