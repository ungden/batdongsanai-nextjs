import { FormattedAnalysis } from "@/types/analysis";

export const analysisData: FormattedAnalysis = {
  meta: {
    title: "Phân tích chuyên sâu dự án The Global City",
    source_type: "project_analysis",
    tags: ["The Global City", "Quận 2", "Masterise Homes", "Bất động sản cao cấp"]
  },
  summary_for_indexing: "Báo cáo phân tích chuyên sâu về tiềm năng đầu tư, pháp lý, và thị trường của dự án The Global City, được phát triển bởi Masterise Homes tại Quận 2.",
  keyHighlights: [
    { text: "Vị trí đắc địa tại trung tâm mới của TP.HCM, kết nối giao thông thuận tiện.", type: "positive" },
    { text: "Chủ đầu tư Masterise Homes có uy tín và kinh nghiệm triển khai các dự án cao cấp.", type: "positive" },
    { text: "Rủi ro về tiến độ bàn giao và hoàn thiện tiện ích cần được theo dõi sát sao.", type: "negative" },
    { text: "Tiềm năng tăng giá cao nhờ quy hoạch hạ tầng và sự phát triển của khu vực.", type: "positive" },
    { text: "Pháp lý dự án tương đối hoàn chỉnh nhưng cần kiểm tra kỹ hợp đồng mua bán.", type: "neutral" }
  ],
  valuation: {
    finalPriceTarget: 65000000,
    finalRecommendation: "KHẢ QUAN",
    summary: "Với mức giá hiện tại và tiềm năng tăng trưởng của khu vực, The Global City là một lựa chọn đầu tư khả quan cho mục tiêu trung và dài hạn. Giá mục tiêu 65 triệu/m² là hợp lý trong vòng 1-2 năm tới."
  },
  sections: [
    {
      section_id: "financial_analysis",
      heading: "Phân tích Tài chính & ROI",
      content_blocks: [
        { type: "paragraph", content: "Phân tích các chỉ số tài chính cốt lõi để đánh giá hiệu quả đầu tư vào dự án The Global City." },
        {
          type: "list",
          items: [
            "Giá bán hiện tại: Trung bình 55 triệu VNĐ/m², cạnh tranh so với các dự án cùng phân khúc trong khu vực.",
            "Tỷ suất cho thuê dự kiến: 4-5%/năm, một con số hấp dẫn đối với phân khúc cao cấp.",
            "Tăng trưởng giá trị vốn: Dự kiến 10-15%/năm trong 3 năm đầu nhờ sóng hạ tầng và sự hình thành của trung tâm mới.",
            "Dòng tiền: Cần chuẩn bị dòng tiền ổn định để theo kịp tiến độ thanh toán linh hoạt của chủ đầu tư."
          ]
        }
      ]
    },
    {
      section_id: "legal_analysis",
      heading: "Phân tích Pháp lý",
      content_blocks: [
        { type: "paragraph", content: "Đánh giá mức độ an toàn và minh bạch về mặt pháp lý của dự án. Đây là nội dung dành riêng cho thành viên VIP." },
        {
          type: "list",
          items: [
            "Giấy phép xây dựng: Đã có giấy phép xây dựng cho các phân khu chính.",
            "Quyền sử dụng đất: Đã hoàn thành nghĩa vụ tài chính về đất, có sổ đỏ cho toàn khu.",
            "Bảo lãnh ngân hàng: Dự án được bảo lãnh bởi ngân hàng Techcombank, tăng độ an toàn cho người mua.",
            "Hợp đồng mua bán: Cần luật sư xem xét kỹ các điều khoản về phạt chậm tiến độ và bàn giao."
          ]
        }
      ]
    },
    {
      section_id: "market_analysis",
      heading: "Phân tích Thị trường",
      content_blocks: [
        { type: "paragraph", content: "So sánh dự án với bối cảnh chung của thị trường bất động sản khu vực. Đây là nội dung dành riêng cho thành viên VIP." },
        {
          type: "list",
          items: [
            "So sánh giá: Mức giá của The Global City cao hơn khoảng 5-7% so với mặt bằng chung Quận 9 nhưng thấp hơn 10-15% so với Thủ Thiêm.",
            "Nguồn cung - cầu: Nguồn cung căn hộ cao cấp tại khu Đông đang khan hiếm trong khi nhu cầu vẫn cao, tạo lợi thế cho dự án.",
            "Đối thủ cạnh tranh: Các đối thủ chính bao gồm Vinhomes Grand Park (phân khúc thấp hơn) và các dự án tại Thủ Thiêm (phân khúc cao hơn).",
            "Xu hướng thị trường: Thị trường đang có xu hướng dịch chuyển về các đại đô thị được quy hoạch bài bản, đây là lợi thế lớn của The Global City."
          ]
        }
      ]
    }
  ],
  risksAndPotentials: {
    risks: [
      "Tiến độ thi công: Rủi ro chậm bàn giao do quy mô lớn và nhiều hạng mục phức tạp.",
      "Cạnh tranh: Áp lực cạnh tranh từ các dự án mới trong tương lai khi hạ tầng hoàn thiện hơn.",
      "Vận hành: Chi phí quản lý và vận hành có thể ở mức cao, ảnh hưởng đến tỷ suất cho thuê."
    ],
    potentials: [
      "Hạ tầng: Hưởng lợi trực tiếp từ các công trình giao thông trọng điểm như Vành đai 3, Metro.",
      "Đại đô thị: Tiềm năng trở thành một trung tâm mới của thành phố với đầy đủ tiện ích, thu hút cư dân và chuyên gia quốc tế.",
      "Thương hiệu CĐT: Masterise Homes có kinh nghiệm phát triển sản phẩm tốt, đảm bảo chất lượng và giá trị thương hiệu."
    ]
  },
  recommendations: {
    shortTerm: "Nhà đầu tư lướt sóng cần cẩn trọng do thị trường chung còn nhiều biến động. Chỉ nên tham gia nếu có thông tin tốt về các đợt mở bán tiếp theo.",
    longTerm: "Lựa chọn tốt cho đầu tư dài hạn (trên 3 năm) để tích lũy tài sản và hưởng lợi từ sự tăng trưởng giá trị của toàn khu đô thị."
  }
};