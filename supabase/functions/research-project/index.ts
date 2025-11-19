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

const MODEL_RESEARCH = "gemini-2.0-flash"; 

async function callGeminiSearch(apiKey: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_RESEARCH}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini Search Error: ${err}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Lỗi: AI không trả về dữ liệu.";
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { query, mode, raw_content, section } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY not set')

    let resultText = "";

    if (mode === 'batch_extract') {
      // ... (Giữ nguyên logic cũ)
      resultText = "Logic batch cũ"; 
    } 
    else if (mode === 'scout') {
      // ... (Giữ nguyên logic cũ)
       const prompt = `Tìm kiếm thông tin BĐS mới nhất về: "${query}". Liệt kê các dự án liên quan.`;
       resultText = await callGeminiSearch(apiKey, prompt);
    } 
    else if (mode === 'deep_scan') {
      // LOGIC MỚI: Chia nhỏ theo Section
      let prompt = "";
      const basePrompt = `Bạn là Chuyên gia Thẩm định Bất động sản. Nhiệm vụ: Tìm kiếm dữ liệu CHÍNH XÁC cho dự án "${query}".`;

      switch (section) {
        case 'overview':
          prompt = `${basePrompt}
          Tập trung tìm kiếm:
          - Tên thương mại chính thức.
          - Chủ đầu tư (Developer) chính xác.
          - Địa chỉ cụ thể (Số nhà, đường, phường, quận).
          - Mô tả vị trí (tiềm năng, kết nối).
          Trả về dạng văn bản tóm tắt các mục trên.`;
          break;

        case 'specs':
          prompt = `${basePrompt}
          Tập trung tìm kiếm THÔNG SỐ KỸ THUẬT:
          - Tổng diện tích đất (ha/m2).
          - Mật độ xây dựng (%).
          - Quy mô: Số block, Số tầng, Tổng số căn hộ.
          - Các loại diện tích căn hộ (m2).
          - Tiêu chuẩn bàn giao (Thô/Cơ bản/Cao cấp).`;
          break;

        case 'pricing':
          prompt = `${basePrompt}
          Tập trung tìm kiếm GIÁ & TÀI CHÍNH:
          - Giá mở bán đợt đầu (Launch Price) năm nào? Bao nhiêu?
          - Giá thị trường hiện tại (chuyển nhượng/CĐT) trung bình là bao nhiêu VNĐ/m2?
          - Khoảng giá tổng (tỷ đồng/căn).
          - Chính sách thanh toán/ngân hàng hỗ trợ.
          Yêu cầu số liệu cụ thể.`;
          break;

        case 'legal':
          prompt = `${basePrompt}
          Tập trung tìm kiếm PHÁP LÝ & TIẾN ĐỘ:
          - Tình trạng pháp lý hiện tại (Đã có sổ/HĐMB/Chấp thuận đầu tư?).
          - Giấy phép xây dựng (Đã có chưa?).
          - Thời gian khởi công và Bàn giao (Dự kiến hoặc Thực tế).
          - Tình trạng xây dựng hiện tại (Đang làm gì?).`;
          break;

        case 'amenities':
          prompt = `${basePrompt}
          Tập trung tìm kiếm TIỆN ÍCH:
          - Liệt kê các tiện ích nội khu nổi bật.
          - Liệt kê tiện ích ngoại khu (Trường học, bệnh viện, TTTM gần nhất).`;
          break;

        default: // Full scan (fallback)
           prompt = `${basePrompt} Tìm tất cả thông tin tổng quan, giá, pháp lý, tiện ích.`;
      }

      resultText = await callGeminiSearch(apiKey, prompt);
    }

    return new Response(JSON.stringify({ data: resultText }), {
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