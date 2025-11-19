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

const MODEL_RESEARCH = "gemini-2.0-flash"; // Sử dụng bản Flash cho tốc độ và tool search tốt

async function callGeminiSearch(apiKey: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_RESEARCH}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192, // Cho phép output dài để chứa chi tiết
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 429) throw new Error("Google Search Quota Exceeded.");
    throw new Error(`Gemini Search Error: ${err}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callGeminiBasic(apiKey: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_RESEARCH}:generateContent?key=${apiKey}`;
   const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1 }
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { query, mode, raw_content } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY not set')

    let resultText = "";

    if (mode === 'batch_extract') {
      const prompt = `
      Nhiệm vụ: Đọc văn bản bên dưới và liệt kê danh sách các dự án BĐS.
      Định dạng dòng: "Tên Dự Án | Chủ Đầu Tư | Vị Trí"
      Văn bản nguồn:
      ${raw_content}
      `;
      resultText = await callGeminiBasic(apiKey, prompt);
    } 
    else if (mode === 'scout') {
      const prompt = `Bạn là chuyên gia dữ liệu BĐS. Tìm kiếm thông tin mới nhất về: "${query}".
      Liệt kê các dự án BĐS liên quan tìm thấy.
      `;
      resultText = await callGeminiSearch(apiKey, prompt);
    } 
    else if (mode === 'deep_scan') {
      // PROMPT CHI TIẾT TỪNG MỤC NHƯ YÊU CẦU NGƯỜI DÙNG
      const prompt = `
      Bạn là Chuyên gia Thẩm định Bất động sản cao cấp.
      Nhiệm vụ: Thực hiện "Audit" toàn diện về dự án: "${query}".
      
      Yêu cầu: Sử dụng Google Search để tìm dữ liệu số liệu cụ thể. Nếu không tìm thấy chính xác, hãy ước lượng dựa trên dữ liệu khu vực lân cận.
      
      Báo cáo phải trình bày rõ ràng theo ĐÚNG cấu trúc sau:

      1. TỔNG QUAN & VỊ TRÍ (Overview):
         - Tên chính thức:
         - Chủ đầu tư (Developer):
         - Địa chỉ chính xác:
         - Quận/Huyện & Tỉnh/Thành:
         - Mô tả vị trí (tiềm năng, kết nối giao thông):

      2. QUY MÔ & THÔNG SỐ (Specs):
         - Tổng diện tích đất (ha):
         - Mật độ xây dựng (%):
         - Tổng số block/tòa:
         - Số tầng (Floors):
         - Tổng số căn hộ (Units):
         - Các loại diện tích (m2):

      3. GIÁ BÁN & TÀI CHÍNH (Pricing):
         - Giá mở bán đợt đầu (Launch Price): ... VNĐ/m2 (năm nào?)
         - Giá thị trường hiện tại (Current Price): ... VNĐ/m2 (trung bình)
         - Khoảng giá (Price Range): Ví dụ "3 - 5 tỷ"
         - Chính sách thanh toán nổi bật:

      4. PHÁP LÝ & TIẾN ĐỘ (Legal & Status):
         - Tình trạng pháp lý (Sổ hồng/HĐMB/Đang hoàn thiện):
         - Giấy phép xây dựng: (Có/Chưa)
         - Tình trạng xây dựng hiện tại (Đang làm móng/Cất nóc/Bàn giao):
         - Thời gian bàn giao (Dự kiến/Thực tế):

      5. TIỆN ÍCH (Amenities):
         - Liệt kê ít nhất 10 tiện ích nội khu và ngoại khu quan trọng.

      Hãy đảm bảo số liệu (Giá, Số lượng) là con số cụ thể để có thể trích xuất vào database.
      `;
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