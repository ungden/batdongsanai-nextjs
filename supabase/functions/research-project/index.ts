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
    // Cấu hình an toàn để tránh bị lọc nội dung vô lý
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
    if (response.status === 429) throw new Error("Google Search Quota Exceeded. Please try again later.");
    throw new Error(`Gemini Search Error: ${err}`);
  }

  const data = await response.json();
  // Kiểm tra kỹ xem có nội dung trả về không
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Lỗi: AI không trả về dữ liệu (Empty Response).";
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
      Nhiệm vụ: Trích xuất danh sách dự án BĐS từ văn bản sau.
      Chỉ trả về danh sách, mỗi dòng 1 dự án.
      Văn bản:
      ${raw_content}
      `;
      resultText = await callGeminiBasic(apiKey, prompt);
    } 
    else if (mode === 'scout') {
      const prompt = `Tìm kiếm thông tin BĐS mới nhất về: "${query}". Liệt kê các dự án liên quan.`;
      resultText = await callGeminiSearch(apiKey, prompt);
    } 
    else if (mode === 'deep_scan') {
      // PROMPT ĐƯỢC VIẾT LẠI ĐỂ CẤM CHAT VÀ ÉP BUỘC TRẢ DỮ LIỆU
      const prompt = `
      NHIỆM VỤ: Thu thập dữ liệu chi tiết (Audit) về dự án Bất động sản: "${query}".
      
      QUY TẮC BẮT BUỘC (NGHIÊM NGẶT):
      1. KHÔNG ĐƯỢC chào hỏi (VD: "Chào bạn...", "Dưới đây là...").
      2. KHÔNG viết đoạn mở đầu hay kết luận.
      3. TRẢ LỜI NGAY LẬP TỨC vào các mục dữ liệu bên dưới.
      4. BẮT BUỘC dùng Google Search để tìm con số chính xác (Giá, Diện tích, Năm).
      5. Nếu không tìm thấy số liệu chính xác, hãy tìm dự án lân cận để ước lượng và ghi chú "(ước lượng)".

      HÃY ĐIỀN THÔNG TIN VÀO MẪU SAU (Giữ nguyên cấu trúc tiêu đề):

      --- BẮT ĐẦU BÁO CÁO ---

      1. TỔNG QUAN (Overview)
      - Tên thương mại chính thức:
      - Chủ đầu tư (Uy tín/Lịch sử):
      - Vị trí chính xác (Số nhà, Đường, Phường, Quận):
      - Mô tả vị trí (Liên kết vùng, Tầm nhìn):

      2. THÔNG SỐ KỸ THUẬT (Specs)
      - Tổng diện tích đất (ha/m2):
      - Quy mô (Số tòa, Số tầng):
      - Tổng số lượng sản phẩm (Căn hộ/Nhà phố):
      - Mật độ xây dựng (%):
      - Các loại diện tích căn hộ (chi tiết m2):
      - Tiêu chuẩn bàn giao (Thô/Cơ bản/Full):

      3. GIÁ BÁN & TÀI CHÍNH (Pricing)
      - Giá mở bán (Launch Price): ... VNĐ/m2
      - Giá thị trường hiện tại (Current Price): ... VNĐ/m2 (Cập nhật mới nhất)
      - Tổng giá tham khảo (Range): Ví dụ "3 - 7 tỷ/căn"
      - Chính sách thanh toán nổi bật:
      - Ngân hàng bảo lãnh/cho vay:

      4. PHÁP LÝ & TIẾN ĐỘ (Legal)
      - Tình trạng pháp lý hiện tại (Sổ hồng/HĐMB/Quyết định 1/500):
      - Giấy phép xây dựng (Đã có/Chưa):
      - Thời gian khởi công:
      - Thời gian bàn giao (Dự kiến hoặc Thực tế):
      - Tình trạng xây dựng thực tế (Mô tả hiện trạng công trường):

      5. TIỆN ÍCH (Amenities)
      - Nội khu (Liệt kê ít nhất 5 cái):
      - Ngoại khu (Trường học, Bệnh viện, Mall gần nhất):

      --- KẾT THÚC BÁO CÁO ---
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