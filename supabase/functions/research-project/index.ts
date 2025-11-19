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
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // --- FILTER: Chặn các câu trả lời kiểu "Tôi sẽ..." ---
  const bannedPhrases = [
    "tôi sẽ tìm kiếm", "i will search", "tôi sẽ cung cấp", "i will provide",
    "dưới đây là thông tin", "here is the information", "đang tìm kiếm", "searching for",
    "tôi sẽ tìm thấy", "tôi có thể giúp", "as an ai", "là một ai"
  ];

  // Nếu text quá ngắn (< 100 ký tự) VÀ chứa từ khóa cấm -> Coi là lỗi
  const lowerText = text.toLowerCase();
  if (text.length < 150 && bannedPhrases.some(phrase => lowerText.includes(phrase))) {
     return `RAW_DATA_NOT_FOUND: AI returned conversational filler: "${text}"`; 
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
          - Mô tả dự án (Vị trí, lợi thế, kết nối giao thông, tổng quan)`;
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
      NHIỆM VỤ: TÌM KIẾM VÀ TRÍCH XUẤT DỮ LIỆU THỰC TẾ (FACTUAL DATA extraction).
      ĐỐI TƯỢNG: Dự án Bất Động Sản "${query}" tại Việt Nam.
      
      QUY TẮC NGHIÊM NGẶT:
      1. TUYỆT ĐỐI KHÔNG trả lời các câu như: "Tôi sẽ tìm kiếm...", "Dưới đây là...", "Tôi không tìm thấy...".
      2. NẾU KHÔNG CÓ DỮ LIỆU: Hãy trả về các thông tin liên quan nhất mà bạn tìm thấy về khu vực hoặc chủ đầu tư.
      3. OUTPUT CHỈ LÀ DỮ LIỆU (dạng bullet points hoặc đoạn văn mô tả).
      
      ${searchInstructions}
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