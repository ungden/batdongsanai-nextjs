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
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
    ]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API Error: ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text || text.length < 50 || text.includes("Tôi sẽ") || text.includes("I will")) {
     return `RAW_DATA_NOT_FOUND: ${text}`; 
  }
  
  return text;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { query, mode, raw_content, section } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY not set')

    let resultText = "";

    if (mode === 'deep_scan') {
      let searchInstructions = "";

      // VIỆT HÓA TOÀN BỘ HƯỚNG DẪN ĐỂ AI HIỂU NGỮ CẢNH VIỆT NAM
      switch (section) {
        case 'overview':
          searchInstructions = `
          YÊU CẦU DỮ LIỆU (Tiếng Việt):
          - Tên dự án chính thức
          - Tên Chủ đầu tư đầy đủ
          - Địa chỉ chính xác (Số, Đường, Phường, Quận, Thành phố)
          - Mô tả dự án (Vị trí, lợi thế, kết nối giao thông)`;
          break;
        case 'specs':
          searchInstructions = `
          YÊU CẦU DỮ LIỆU (Tiếng Việt):
          - Tổng diện tích đất (ha/m2)
          - Mật độ xây dựng (%)
          - Quy mô: Số Block, Số tầng, Số hầm
          - Tổng số căn hộ
          - Diện tích căn hộ (Ví dụ: 50m2 - 100m2)
          - Tiêu chuẩn bàn giao (Thô/Cơ bản/Cao cấp)`;
          break;
        case 'financial':
          searchInstructions = `
          YÊU CẦU DỮ LIỆU (Tiếng Việt):
          - Giá mở bán (đợt đầu) VNĐ/m2
          - Giá thị trường hiện tại VNĐ/m2
          - Tổng giá bán (Ví dụ: 3-5 tỷ)
          - Ngân hàng hỗ trợ
          - Chính sách thanh toán tóm tắt`;
          break;
        case 'legal':
          searchInstructions = `
          YÊU CẦU DỮ LIỆU (Tiếng Việt):
          - Pháp lý hiện tại (Sổ hồng/HĐMB/1:500/GPXD)
          - Tình trạng xây dựng (Đang làm móng/Cất nóc/Đã bàn giao)
          - Thời gian bàn giao (Dự kiến hoặc Thực tế)`;
          break;
        case 'amenities':
          searchInstructions = `
          YÊU CẦU DỮ LIỆU (Tiếng Việt):
          - Tiện ích nội khu (Hồ bơi, Gym, Công viên...)
          - Tiện ích ngoại khu (Trường học, Bệnh viện gần đó)`;
          break;
        default:
          searchInstructions = "Tìm kiếm thông tin chi tiết về dự án Bất Động Sản này.";
      }

      const prompt = `
      NHIỆM VỤ: TÌM KIẾM VÀ TRÍCH XUẤT DỮ LIỆU
      ĐỐI TƯỢNG: Dự án Bất Động Sản "${query}" tại Việt Nam.
      NGÔN NGỮ BẮT BUỘC: TIẾNG VIỆT.
      
      HƯỚNG DẪN:
      1. Google Search thông tin mới nhất.
      2. TRÍCH XUẤT CHÍNH XÁC các mục dữ liệu bên dưới.
      3. ĐỊNH DẠNG: Danh sách văn bản thô (Bullet points).
      4. TUYỆT ĐỐI KHÔNG viết câu mở đầu như "Dưới đây là...", "Tôi tìm thấy...". Chỉ trả về dữ liệu.

      ${searchInstructions}
      
      BẮT ĐẦU TRẢ VỀ KẾT QUẢ (TIẾNG VIỆT):
      `;
      
      resultText = await callGeminiSearch(apiKey, prompt);
    } 
    else if (mode === 'batch_extract') {
      const prompt = `Trích xuất danh sách dự án BĐS từ văn bản sau. Trả về mỗi dự án 1 dòng. Văn bản: \n${raw_content}`;
      resultText = await callGeminiSearch(apiKey, prompt);
    }
    else if (mode === 'scout') {
      const prompt = `Tìm kiếm các dự án BĐS mới liên quan đến: "${query}". Liệt kê danh sách bằng Tiếng Việt.`;
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