import { Project } from "@/types/project";

// 1. DỮ LIỆU THẬT (SEED GỐC)
const realProjects: Project[] = [
  {
    id: "hn-01",
    name: "Vinhomes Ocean Park 1",
    location: "Gia Lâm, Hà Nội",
    city: "Hà Nội",
    district: "Gia Lâm",
    developer: "Vingroup",
    status: "good",
    description: "Thành phố biển hồ giữa lòng Hà Nội. Biển hồ nước mặn 6.1ha và hồ ngọc trai 24.5ha.",
    priceRange: "45 - 120 triệu/m²",
    pricePerSqm: 55000000,
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80",
    completionDate: "Đã hoàn thành",
    legalScore: 10,
    totalUnits: 42000,
    soldUnits: 38000,
    amenities: ["Biển hồ nước mặn", "Vincom Mega Mall", "VinUni", "TechnoPark"],
    warnings: [],
    launchDate: "2018-10-01",
    currentPrice: 55000000,
    launchPrice: 35000000,
    rentalYield: 5.5
  },
  {
    id: "hcm-61",
    name: "Vinhomes Grand Park",
    location: "TP. Thủ Đức, TP.HCM",
    city: "TP. Hồ Chí Minh",
    district: "Thủ Đức",
    developer: "Vingroup",
    status: "good",
    description: "Đại đô thị thông minh công viên quy mô 271ha, trung tâm mới của khu Đông Sài Gòn.",
    priceRange: "2.5 - 80 tỷ/căn",
    pricePerSqm: 65000000,
    completionDate: "Đang bàn giao",
    legalScore: 10,
    amenities: ["Công viên 36ha", "Vincom Mega Mall", "Bến du thuyền", "Xe buýt điện"],
    warnings: [],
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    launchDate: "2019-07-01",
    currentPrice: 65000000,
    launchPrice: 45000000,
    rentalYield: 4.8
  },
  {
    id: "hcm-62",
    name: "The Global City",
    location: "An Phú, TP. Thủ Đức",
    city: "TP. Hồ Chí Minh",
    district: "Thủ Đức",
    developer: "Masterise Homes",
    status: "good",
    description: "Khu Downtown mới của TP.HCM, thiết kế bởi Foster + Partners.",
    priceRange: "30 - 100 tỷ/căn",
    pricePerSqm: 350000000,
    completionDate: "Đang triển khai",
    legalScore: 10,
    amenities: ["Kênh đào nhạc nước", "TTTM hạng A", "Sân golf"],
    warnings: [],
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    launchDate: "2022-03-01",
    currentPrice: 350000000,
    launchPrice: 300000000,
    rentalYield: 3.5
  },
  {
    id: "hcm-255",
    name: "Masteri Thảo Điền",
    location: "Xa lộ Hà Nội, Thảo Điền",
    city: "TP. Hồ Chí Minh",
    district: "Thủ Đức",
    developer: "Masterise Homes",
    status: "good",
    description: "Dự án làm nên tên tuổi Masterise, vị trí kết nối trực tiếp ga Metro số 1.",
    priceRange: "75 - 90 triệu/m²",
    pricePerSqm: 82000000,
    completionDate: "Đã hoàn thành",
    legalScore: 10,
    amenities: ["Vincom Mega Mall", "Kết nối Metro"],
    warnings: [],
    image: "/placeholder.svg",
    launchDate: "2014-10-01",
    currentPrice: 82000000,
    launchPrice: 38000000,
    rentalYield: 5.2
  },
  {
    id: "hcm-256",
    name: "Estella Heights",
    location: "An Phú, TP. Thủ Đức",
    city: "TP. Hồ Chí Minh",
    district: "Thủ Đức",
    developer: "Keppel Land",
    status: "good",
    description: "Khu căn hộ nghỉ dưỡng chuẩn resort, được cộng đồng Expat cực kỳ yêu thích.",
    priceRange: "100 - 130 triệu/m²",
    pricePerSqm: 115000000,
    completionDate: "Đã hoàn thành",
    legalScore: 10,
    amenities: ["Hồ bơi lười", "TTTM Estella Place"],
    warnings: [],
    image: "/placeholder.svg",
    launchDate: "2015-01-01",
    currentPrice: 115000000,
    launchPrice: 45000000,
    rentalYield: 6.0
  },
  {
    id: "hcm-265",
    name: "Phú Mỹ Hưng (Khu Cảnh Đồi)",
    location: "Quận 7, TP.HCM",
    city: "TP. Hồ Chí Minh",
    district: "Quận 7",
    developer: "Phú Mỹ Hưng",
    status: "good",
    description: "Khu đô thị kiểu mẫu đầu tiên của Việt Nam, cộng đồng cư dân văn minh, hạ tầng hoàn chỉnh.",
    priceRange: "60 - 150 triệu/m²",
    pricePerSqm: 85000000,
    completionDate: "Đã hoàn thành",
    legalScore: 10,
    warnings: [],
    image: "/placeholder.svg",
    launchDate: "2010-01-01",
    currentPrice: 85000000,
    launchPrice: 35000000,
    rentalYield: 4.5
  },
  {
    id: "hcm-268",
    name: "Sunrise City",
    location: "Nguyễn Hữu Thọ, Quận 7",
    city: "TP. Hồ Chí Minh",
    district: "Quận 7",
    developer: "Novaland",
    status: "good",
    description: "Dự án biểu tượng làm nên tên tuổi Novaland tại khu Nam Sài Gòn.",
    priceRange: "45 - 60 triệu/m²",
    pricePerSqm: 52000000,
    completionDate: "Đã hoàn thành",
    legalScore: 10,
    warnings: [],
    image: "/placeholder.svg",
    launchDate: "2009-01-01",
    currentPrice: 52000000,
    launchPrice: 30000000,
    rentalYield: 5.0
  },
  {
    id: "hn-201",
    name: "Vinhomes Times City (Park Hill)",
    location: "Minh Khai, Hai Bà Trưng",
    city: "Hà Nội",
    district: "Hai Bà Trưng",
    developer: "Vingroup",
    status: "good",
    description: "Khu đô thị kiểu mẫu sầm uất nhất phía Nam Hà Nội, nổi tiếng với thủy cung và nhạc nước.",
    priceRange: "60 - 90 triệu/m²",
    pricePerSqm: 75000000,
    completionDate: "Đã hoàn thành",
    legalScore: 10,
    amenities: ["Thủy cung Vinpearl", "Bệnh viện Vinmec", "Trường Vinschool"],
    warnings: [],
    image: "/placeholder.svg",
    launchDate: "2015-03-01",
    currentPrice: 75000000,
    launchPrice: 38000000,
    rentalYield: 5.5
  },
  {
    id: "hn-202",
    name: "Vinhomes Royal City",
    location: "Nguyễn Trãi, Thanh Xuân",
    city: "Hà Nội",
    district: "Thanh Xuân",
    developer: "Vingroup",
    status: "good",
    description: "Thành phố Hoàng gia phong cách Châu Âu, sở hữu quảng trường và hầm TTTM lớn nhất ĐNA.",
    priceRange: "55 - 85 triệu/m²",
    pricePerSqm: 65000000,
    completionDate: "Đã hoàn thành",
    legalScore: 10,
    amenities: ["TTTM ngầm", "Sân trượt băng", "Quảng trường"],
    warnings: [],
    image: "/placeholder.svg",
    launchDate: "2011-05-01",
    currentPrice: 65000000,
    launchPrice: 40000000,
    rentalYield: 5.0
  },
  {
    id: "hn-204",
    name: "Keangnam Hanoi Landmark Tower",
    location: "Phạm Hùng, Nam Từ Liêm",
    city: "Hà Nội",
    district: "Nam Từ Liêm",
    developer: "Keangnam Enterprises",
    status: "good",
    description: "Tòa nhà cao nhất Việt Nam một thời, biểu tượng của khu vực người Hàn Quốc sinh sống.",
    priceRange: "45 - 60 triệu/m²",
    pricePerSqm: 52000000,
    completionDate: "Đã hoàn thành",
    legalScore: 10,
    warnings: [],
    image: "/placeholder.svg",
    launchDate: "2008-01-01",
    currentPrice: 52000000,
    launchPrice: 35000000,
    rentalYield: 6.5
  },
  // ... (Add a few more distinct ones if needed, but let's generate the rest)
];

// 2. HÀM SINH DỮ LIỆU MÔ PHỎNG (ĐỂ ĐẠT 300 DỰ ÁN)
const generateMockProjects = (count: number): Project[] => {
  const prefixes = ["The", "Sun", "Moon", "Star", "Eco", "Green", "City", "Park", "River", "Lake", "Vista", "Grand", "Elite", "Royal", "Golden", "Diamond", "Pearl", "Masteri"];
  const suffixes = ["City", "Park", "Residence", "Home", "Tower", "Center", "Plaza", "Garden", "Village", "Riverside", "View", "Point", "Complex", "Suites", "Villas"];
  
  const locations = [
    { city: "TP. Hồ Chí Minh", districts: ["Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 7", "Bình Thạnh", "Thủ Đức", "Tân Bình", "Phú Nhuận", "Bình Tân", "Nhà Bè", "Bình Chánh"] },
    { city: "Hà Nội", districts: ["Hoàn Kiếm", "Ba Đình", "Đống Đa", "Cầu Giấy", "Thanh Xuân", "Tây Hồ", "Hoàng Mai", "Long Biên", "Nam Từ Liêm", "Hà Đông", "Gia Lâm"] },
    { city: "Đà Nẵng", districts: ["Hải Châu", "Sơn Trà", "Ngũ Hành Sơn", "Thanh Khê", "Liên Chiểu"] },
    { city: "Bình Dương", districts: ["Thủ Dầu Một", "Dĩ An", "Thuận An"] },
    { city: "Hưng Yên", districts: ["Văn Giang"] },
    { city: "Quảng Ninh", districts: ["Hạ Long"] }
  ];

  const developers = ["Vingroup", "Masterise Homes", "Novaland", "Keppel Land", "Capitaland", "Gamuda Land", "Khang Dien", "Nam Long", "Dat Xanh", "Hung Thinh", "Sun Group", "Ecopark", "Him Lam", "Sunshine Group", "Bitexco"];

  const generated: Project[] = [];

  for (let i = 0; i < count; i++) {
    const loc = locations[Math.floor(Math.random() * locations.length)];
    const dist = loc.districts[Math.floor(Math.random() * loc.districts.length)];
    const dev = developers[Math.floor(Math.random() * developers.length)];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    // Random number to avoid duplicate names
    const num = Math.floor(Math.random() * 100) + 1; 
    const name = `${prefix} ${suffix} ${dist.split(' ').pop()} ${num}`; // e.g., "Eco Park 1"

    // Random price 30M - 150M
    const basePrice = Math.floor(Math.random() * (150 - 30) + 30) * 1000000;
    // Launch price usually 20-40% lower than current
    const launchPrice = Math.floor(basePrice * (1 - (Math.random() * 0.2 + 0.1)));
    
    const totalUnits = Math.floor(Math.random() * 5000) + 200;
    const soldRate = Math.random(); // 0 to 1
    const soldUnits = Math.floor(totalUnits * soldRate);

    // Status based on sold rate or random
    let status: "good" | "warning" | "danger" = "good";
    if (Math.random() < 0.1) status = "danger";
    else if (Math.random() < 0.2) status = "warning";

    // Legal score
    const legalScore = status === "good" ? Math.floor(Math.random() * 3) + 8 : Math.floor(Math.random() * 5) + 3; // 8-10 or 3-7

    // Date logic
    const launchYear = Math.floor(Math.random() * 10) + 2015;
    const launchDate = `${launchYear}-${Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0')}-01`;
    const completionYear = launchYear + Math.floor(Math.random() * 3) + 2;
    const completionDate = completionYear <= 2024 ? "Đã hoàn thành" : `Q${Math.floor(Math.random() * 4 + 1)}/${completionYear}`;

    generated.push({
      id: `gen-${i + 1}`,
      name: name,
      location: `${dist}, ${loc.city}`,
      city: loc.city,
      district: dist,
      developer: dev,
      status: status,
      description: `Dự án ${name} tọa lạc tại vị trí đắc địa của ${dist}, được phát triển bởi ${dev} với quy mô ${totalUnits} căn hộ cao cấp. Tiện ích đa dạng, thiết kế hiện đại.`,
      priceRange: `${(basePrice/1000000 * 0.9).toFixed(0)} - ${(basePrice/1000000 * 1.2).toFixed(0)} triệu/m²`,
      pricePerSqm: basePrice,
      image: `/placeholder.svg`, // Sử dụng placeholder hoặc random ảnh từ unsplash nếu muốn
      completionDate: completionDate,
      legalScore: legalScore,
      totalUnits: totalUnits,
      soldUnits: soldUnits,
      amenities: ["Hồ bơi", "Gym", "Công viên", "BBQ", "Siêu thị", "Nhà trẻ"],
      warnings: status === "warning" ? ["Chưa hoàn thiện sổ đỏ"] : status === "danger" ? ["Chậm tiến độ", "Tranh chấp pháp lý"] : [],
      launchDate: launchDate,
      currentPrice: basePrice,
      launchPrice: launchPrice,
      rentalYield: parseFloat((Math.random() * 4 + 3).toFixed(1)), // 3% - 7%
      floors: Math.floor(Math.random() * 30) + 15,
      apartmentTypes: ["1PN", "2PN", "3PN", "Penthouse"]
    });
  }

  return generated;
};

// 3. EXPORT DỮ LIỆU GỘP (THỰC + ẢO)
// Generate enough to reach 300 total
const needed = 300 - realProjects.length;
export const projectsData: Project[] = [...realProjects, ...generateMockProjects(Math.max(0, needed))];