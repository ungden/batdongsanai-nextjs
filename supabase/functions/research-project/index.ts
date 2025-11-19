/* eslint-disable */
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import OpenAI from 'https://esm.sh/openai@4.52.7'

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
    const { query, mode = 'scout' } = await req.json()
    
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

    let systemPrompt = ""
    let userPrompt = ""

    if (mode === 'scout') {
      // Chế độ 1: Tìm kiếm danh sách dự án (Input: Chat query -> Output: List Projects)
      systemPrompt = `Bạn là trợ lý nghiên cứu thị trường BĐS Việt Nam. Bạn có khả năng tìm kiếm thông tin.
      Nhiệm vụ: Dựa trên yêu cầu người dùng, hãy liệt kê các dự án bất động sản phù hợp.
      
      Output JSON format:
      {
        "projects": [
          {
            "name": "Tên dự án",
            "developer": "Chủ đầu tư",
            "location": "Địa chỉ/Khu vực",
            "status": "Trạng thái (Sắp mở bán/Đang bán/Đã bàn giao)",
            "type": "Loại hình (Căn hộ/Nhà phố...)",
            "confidence": "Độ chính xác (High/Medium/Low)"
          }
        ],
        "summary": "Tóm tắt ngắn về kết quả tìm kiếm"
      }
      
      Lưu ý: Hãy đưa ra các dự án có thật tại Việt Nam.`
      userPrompt = `Tìm kiếm: ${query}`
    } else {
      // Chế độ 2: Deep Scan (Input: Project Name -> Output: Full Details)
      systemPrompt = `Bạn là chuyên gia dữ liệu BĐS. Nhiệm vụ: Tìm kiếm và điền đầy đủ thông tin kỹ thuật cho dự án.
      Nếu không chắc chắn thông tin nào, hãy để null. KHÔNG ĐƯỢC BỊA ĐẶT SỐ LIỆU.
      
      Output JSON format (Full Schema):
      {
        "overview": {
          "description": "Mô tả tổng quan khoảng 200 từ",
          "address": "Địa chỉ chính xác",
          "district": "Quận/Huyện",
          "city": "Tỉnh/Thành phố",
          "website": "Website chính thức (nếu có)"
        },
        "specs": {
          "site_area": number (m2),
          "construction_density": number (%),
          "total_blocks": number,
          "total_floors": number,
          "total_units": number,
          "unit_types": ["1PN", "2PN", "3PN", "Duplex", "Penthouse"]
        },
        "legal": {
          "status": "Sổ hồng lâu dài / 50 năm / HĐMB",
          "construction_permit": boolean (đã có GPXD chưa?),
          "bank_guarantee": "Tên ngân hàng bảo lãnh"
        },
        "amenities": ["Hồ bơi", "Gym", "Công viên", "TTTM", ...],
        "pricing": {
          "min_price": number (VND),
          "max_price": number (VND),
          "price_per_sqm": number (VND),
          "maintenance_fee": number (VND/m2/tháng),
          "management_fee": number (VND/m2/tháng)
        }
      }`
      userPrompt = `Deep Scan thông tin cho dự án: ${query}`
    }

    const chat = await client.chat.completions.create({
      model: 'google/gemini-2.5-flash', // Model này nhanh và rẻ, tốt cho trích xuất
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2, // Thấp để tăng độ chính xác
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