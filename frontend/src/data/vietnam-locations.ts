/**
 * Dữ liệu Tỉnh/Thành phố và Quận/Huyện Việt Nam (63 tỉnh thành).
 * value = label để gửi lên API đúng tên hiển thị.
 */
export interface DistrictOption {
  value: string;
  label: string;
}

export interface ProvinceOption {
  value: string;
  label: string;
  districts: DistrictOption[];
}

export const VIETNAM_PROVINCES: ProvinceOption[] = [
  { value: "Hà Nội", label: "Hà Nội", districts: [
    { value: "Ba Đình", label: "Ba Đình" }, { value: "Hoàn Kiếm", label: "Hoàn Kiếm" }, { value: "Tây Hồ", label: "Tây Hồ" },
    { value: "Long Biên", label: "Long Biên" }, { value: "Cầu Giấy", label: "Cầu Giấy" }, { value: "Đống Đa", label: "Đống Đa" },
    { value: "Hai Bà Trưng", label: "Hai Bà Trưng" }, { value: "Hoàng Mai", label: "Hoàng Mai" }, { value: "Thanh Xuân", label: "Thanh Xuân" },
    { value: "Sóc Sơn", label: "Sóc Sơn" }, { value: "Đông Anh", label: "Đông Anh" }, { value: "Gia Lâm", label: "Gia Lâm" },
    { value: "Nam Từ Liêm", label: "Nam Từ Liêm" }, { value: "Thanh Trì", label: "Thanh Trì" }, { value: "Bắc Từ Liêm", label: "Bắc Từ Liêm" },
    { value: "Mê Linh", label: "Mê Linh" }, { value: "Hà Đông", label: "Hà Đông" }, { value: "Sơn Tây", label: "Sơn Tây" },
    { value: "Ba Vì", label: "Ba Vì" }, { value: "Phúc Thọ", label: "Phúc Thọ" }, { value: "Đan Phượng", label: "Đan Phượng" },
    { value: "Hoài Đức", label: "Hoài Đức" }, { value: "Quốc Oai", label: "Quốc Oai" }, { value: "Thạch Thất", label: "Thạch Thất" },
    { value: "Chương Mỹ", label: "Chương Mỹ" }, { value: "Thanh Oai", label: "Thanh Oai" }, { value: "Thường Tín", label: "Thường Tín" },
    { value: "Phú Xuyên", label: "Phú Xuyên" }, { value: "Ứng Hòa", label: "Ứng Hòa" }, { value: "Mỹ Đức", label: "Mỹ Đức" },
  ]},
  { value: "TP. Hồ Chí Minh", label: "TP. Hồ Chí Minh", districts: [
    { value: "Quận 1", label: "Quận 1" }, { value: "Quận 2", label: "Quận 2" }, { value: "Quận 3", label: "Quận 3" },
    { value: "Quận 4", label: "Quận 4" }, { value: "Quận 5", label: "Quận 5" }, { value: "Quận 6", label: "Quận 6" },
    { value: "Quận 7", label: "Quận 7" }, { value: "Quận 8", label: "Quận 8" }, { value: "Quận 9", label: "Quận 9" },
    { value: "Quận 10", label: "Quận 10" }, { value: "Quận 11", label: "Quận 11" }, { value: "Quận 12", label: "Quận 12" },
    { value: "Bình Thạnh", label: "Bình Thạnh" }, { value: "Gò Vấp", label: "Gò Vấp" }, { value: "Phú Nhuận", label: "Phú Nhuận" },
    { value: "Tân Bình", label: "Tân Bình" }, { value: "Tân Phú", label: "Tân Phú" }, { value: "Bình Tân", label: "Bình Tân" },
    { value: "Thủ Đức", label: "Thủ Đức" }, { value: "Củ Chi", label: "Củ Chi" }, { value: "Hóc Môn", label: "Hóc Môn" },
    { value: "Bình Chánh", label: "Bình Chánh" }, { value: "Nhà Bè", label: "Nhà Bè" }, { value: "Cần Giờ", label: "Cần Giờ" },
  ]},
  { value: "Đà Nẵng", label: "Đà Nẵng", districts: [
    { value: "Hải Châu", label: "Hải Châu" }, { value: "Thanh Khê", label: "Thanh Khê" }, { value: "Sơn Trà", label: "Sơn Trà" },
    { value: "Ngũ Hành Sơn", label: "Ngũ Hành Sơn" }, { value: "Liên Chiểu", label: "Liên Chiểu" }, { value: "Cẩm Lệ", label: "Cẩm Lệ" },
    { value: "Hòa Vang", label: "Hòa Vang" },
  ]},
  { value: "Hải Phòng", label: "Hải Phòng", districts: [
    { value: "Hồng Bàng", label: "Hồng Bàng" }, { value: "Ngô Quyền", label: "Ngô Quyền" }, { value: "Lê Chân", label: "Lê Chân" },
    { value: "Hải An", label: "Hải An" }, { value: "Kiến An", label: "Kiến An" }, { value: "Đồ Sơn", label: "Đồ Sơn" },
    { value: "Dương Kinh", label: "Dương Kinh" }, { value: "Thủy Nguyên", label: "Thủy Nguyên" }, { value: "An Dương", label: "An Dương" },
    { value: "An Lão", label: "An Lão" }, { value: "Kiến Thụy", label: "Kiến Thụy" }, { value: "Tiên Lãng", label: "Tiên Lãng" },
    { value: "Vĩnh Bảo", label: "Vĩnh Bảo" }, { value: "Cát Hải", label: "Cát Hải" }, { value: "Bạch Long Vĩ", label: "Bạch Long Vĩ" },
  ]},
  { value: "Cần Thơ", label: "Cần Thơ", districts: [
    { value: "Ninh Kiều", label: "Ninh Kiều" }, { value: "Ô Môn", label: "Ô Môn" }, { value: "Bình Thủy", label: "Bình Thủy" },
    { value: "Cái Răng", label: "Cái Răng" }, { value: "Thốt Nốt", label: "Thốt Nốt" }, { value: "Vĩnh Thạnh", label: "Vĩnh Thạnh" },
    { value: "Cờ Đỏ", label: "Cờ Đỏ" }, { value: "Phong Điền", label: "Phong Điền" }, { value: "Thới Lai", label: "Thới Lai" },
  ]},
  { value: "An Giang", label: "An Giang", districts: [
    { value: "Long Xuyên", label: "Long Xuyên" }, { value: "Châu Đốc", label: "Châu Đốc" }, { value: "Tân Châu", label: "Tân Châu" },
    { value: "Phú Tân", label: "Phú Tân" }, { value: "Châu Phú", label: "Châu Phú" }, { value: "Tịnh Biên", label: "Tịnh Biên" },
    { value: "Tri Tôn", label: "Tri Tôn" }, { value: "Châu Thành", label: "Châu Thành" }, { value: "Chợ Mới", label: "Chợ Mới" },
    { value: "Thoại Sơn", label: "Thoại Sơn" },
  ]},
  { value: "Bà Rịa - Vũng Tàu", label: "Bà Rịa - Vũng Tàu", districts: [
    { value: "Vũng Tàu", label: "Vũng Tàu" }, { value: "Bà Rịa", label: "Bà Rịa" }, { value: "Châu Đức", label: "Châu Đức" },
    { value: "Xuyên Mộc", label: "Xuyên Mộc" }, { value: "Long Điền", label: "Long Điền" }, { value: "Đất Đỏ", label: "Đất Đỏ" },
    { value: "Côn Đảo", label: "Côn Đảo" },
  ]},
  { value: "Bắc Giang", label: "Bắc Giang", districts: [
    { value: "Bắc Giang", label: "Bắc Giang" }, { value: "Yên Thế", label: "Yên Thế" }, { value: "Tân Yên", label: "Tân Yên" },
    { value: "Lạng Giang", label: "Lạng Giang" }, { value: "Lục Nam", label: "Lục Nam" }, { value: "Lục Ngạn", label: "Lục Ngạn" },
    { value: "Sơn Động", label: "Sơn Động" }, { value: "Yên Dũng", label: "Yên Dũng" }, { value: "Việt Yên", label: "Việt Yên" },
    { value: "Hiệp Hòa", label: "Hiệp Hòa" },
  ]},
  { value: "Bắc Kạn", label: "Bắc Kạn", districts: [
    { value: "Bắc Kạn", label: "Bắc Kạn" }, { value: "Ba Bể", label: "Ba Bể" }, { value: "Bạch Thông", label: "Bạch Thông" },
    { value: "Chợ Đồn", label: "Chợ Đồn" }, { value: "Chợ Mới", label: "Chợ Mới" }, { value: "Na Rì", label: "Na Rì" },
    { value: "Ngân Sơn", label: "Ngân Sơn" }, { value: "Pác Nặm", label: "Pác Nặm" },
  ]},
  { value: "Bắc Ninh", label: "Bắc Ninh", districts: [
    { value: "Bắc Ninh", label: "Bắc Ninh" }, { value: "Từ Sơn", label: "Từ Sơn" }, { value: "Tiên Du", label: "Tiên Du" },
    { value: "Quế Võ", label: "Quế Võ" }, { value: "Thuận Thành", label: "Thuận Thành" }, { value: "Gia Bình", label: "Gia Bình" },
    { value: "Lương Tài", label: "Lương Tài" }, { value: "Yên Phong", label: "Yên Phong" },
  ]},
  { value: "Bến Tre", label: "Bến Tre", districts: [
    { value: "Bến Tre", label: "Bến Tre" }, { value: "Châu Thành", label: "Châu Thành" }, { value: "Chợ Lách", label: "Chợ Lách" },
    { value: "Mỏ Cày Bắc", label: "Mỏ Cày Bắc" }, { value: "Mỏ Cày Nam", label: "Mỏ Cày Nam" }, { value: "Giồng Trôm", label: "Giồng Trôm" },
    { value: "Bình Đại", label: "Bình Đại" }, { value: "Ba Tri", label: "Ba Tri" }, { value: "Thạnh Phú", label: "Thạnh Phú" },
  ]},
  { value: "Bình Định", label: "Bình Định", districts: [
    { value: "Quy Nhơn", label: "Quy Nhơn" }, { value: "An Nhơn", label: "An Nhơn" }, { value: "Hoài Nhơn", label: "Hoài Nhơn" },
    { value: "Hoài Ân", label: "Hoài Ân" }, { value: "Phù Mỹ", label: "Phù Mỹ" }, { value: "Vĩnh Thạnh", label: "Vĩnh Thạnh" },
    { value: "Tây Sơn", label: "Tây Sơn" }, { value: "Phù Cát", label: "Phù Cát" }, { value: "An Lão", label: "An Lão" },
    { value: "Tuy Phước", label: "Tuy Phước" }, { value: "Vân Canh", label: "Vân Canh" },
  ]},
  { value: "Bình Dương", label: "Bình Dương", districts: [
    { value: "Thủ Dầu Một", label: "Thủ Dầu Một" }, { value: "Bàu Bàng", label: "Bàu Bàng" }, { value: "Dầu Tiếng", label: "Dầu Tiếng" },
    { value: "Bến Cát", label: "Bến Cát" }, { value: "Phú Giáo", label: "Phú Giáo" }, { value: "Tân Uyên", label: "Tân Uyên" },
    { value: "Dĩ An", label: "Dĩ An" }, { value: "Thuận An", label: "Thuận An" }, { value: "Bắc Tân Uyên", label: "Bắc Tân Uyên" },
  ]},
  { value: "Bình Phước", label: "Bình Phước", districts: [
    { value: "Đồng Xoài", label: "Đồng Xoài" }, { value: "Bình Long", label: "Bình Long" }, { value: "Phước Long", label: "Phước Long" },
    { value: "Bù Đăng", label: "Bù Đăng" }, { value: "Chơn Thành", label: "Chơn Thành" }, { value: "Hớn Quản", label: "Hớn Quản" },
    { value: "Đồng Phú", label: "Đồng Phú" }, { value: "Bù Đốp", label: "Bù Đốp" }, { value: "Lộc Ninh", label: "Lộc Ninh" },
    { value: "Bù Gia Mập", label: "Bù Gia Mập" },
  ]},
  { value: "Bình Thuận", label: "Bình Thuận", districts: [
    { value: "Phan Thiết", label: "Phan Thiết" }, { value: "La Gi", label: "La Gi" }, { value: "Tuy Phong", label: "Tuy Phong" },
    { value: "Bắc Bình", label: "Bắc Bình" }, { value: "Hàm Thuận Bắc", label: "Hàm Thuận Bắc" }, { value: "Hàm Thuận Nam", label: "Hàm Thuận Nam" },
    { value: "Tánh Linh", label: "Tánh Linh" }, { value: "Đức Linh", label: "Đức Linh" }, { value: "Hàm Tân", label: "Hàm Tân" },
    { value: "Phú Quý", label: "Phú Quý" },
  ]},
  { value: "Cà Mau", label: "Cà Mau", districts: [
    { value: "Cà Mau", label: "Cà Mau" }, { value: "U Minh", label: "U Minh" }, { value: "Thới Bình", label: "Thới Bình" },
    { value: "Trần Văn Thời", label: "Trần Văn Thời" }, { value: "Cái Nước", label: "Cái Nước" }, { value: "Đầm Dơi", label: "Đầm Dơi" },
    { value: "Ngọc Hiển", label: "Ngọc Hiển" }, { value: "Năm Căn", label: "Năm Căn" }, { value: "Phú Tân", label: "Phú Tân" },
  ]},
  { value: "Cao Bằng", label: "Cao Bằng", districts: [
    { value: "Cao Bằng", label: "Cao Bằng" }, { value: "Bảo Lâm", label: "Bảo Lâm" }, { value: "Bảo Lạc", label: "Bảo Lạc" },
    { value: "Hà Quảng", label: "Hà Quảng" }, { value: "Trùng Khánh", label: "Trùng Khánh" }, { value: "Hạ Lang", label: "Hạ Lang" },
    { value: "Quảng Hòa", label: "Quảng Hòa" }, { value: "Hoà An", label: "Hoà An" }, { value: "Nguyên Bình", label: "Nguyên Bình" },
    { value: "Thạch An", label: "Thạch An" },
  ]},
  { value: "Đắk Lắk", label: "Đắk Lắk", districts: [
    { value: "Buôn Ma Thuột", label: "Buôn Ma Thuột" }, { value: "Buôn Hồ", label: "Buôn Hồ" }, { value: "Ea H'leo", label: "Ea H'leo" },
    { value: "Ea Súp", label: "Ea Súp" }, { value: "Krông Năng", label: "Krông Năng" }, { value: "Krông Búk", label: "Krông Búk" },
    { value: "Krông Pắk", label: "Krông Pắk" }, { value: "Krông Ana", label: "Krông Ana" }, { value: "Krông Bông", label: "Krông Bông" },
    { value: "Lắk", label: "Lắk" }, { value: "Cư Kuin", label: "Cư Kuin" }, { value: "M'Đrắk", label: "M'Đrắk" },
    { value: "Ea Kar", label: "Ea Kar" }, { value: "Cư M'gar", label: "Cư M'gar" }, { value: "Krông Pắc", label: "Krông Pắc" },
  ]},
  { value: "Đắk Nông", label: "Đắk Nông", districts: [
    { value: "Gia Nghĩa", label: "Gia Nghĩa" }, { value: "Đắk Glong", label: "Đắk Glong" }, { value: "Cư Jút", label: "Cư Jút" },
    { value: "Đắk Mil", label: "Đắk Mil" }, { value: "Krông Nô", label: "Krông Nô" }, { value: "Đắk Song", label: "Đắk Song" },
    { value: "Đắk R'Lấp", label: "Đắk R'Lấp" }, { value: "Tuy Đức", label: "Tuy Đức" },
  ]},
  { value: "Điện Biên", label: "Điện Biên", districts: [
    { value: "Điện Biên Phủ", label: "Điện Biên Phủ" }, { value: "Mường Lay", label: "Mường Lay" }, { value: "Mường Nhé", label: "Mường Nhé" },
    { value: "Mường Chà", label: "Mường Chà" }, { value: "Tủa Chùa", label: "Tủa Chùa" }, { value: "Tuần Giáo", label: "Tuần Giáo" },
    { value: "Điện Biên", label: "Điện Biên" }, { value: "Điện Biên Đông", label: "Điện Biên Đông" }, { value: "Mường Ảng", label: "Mường Ảng" },
    { value: "Nậm Pồ", label: "Nậm Pồ" },
  ]},
  { value: "Đồng Nai", label: "Đồng Nai", districts: [
    { value: "Biên Hòa", label: "Biên Hòa" }, { value: "Long Khánh", label: "Long Khánh" }, { value: "Tân Phú", label: "Tân Phú" },
    { value: "Vĩnh Cửu", label: "Vĩnh Cửu" }, { value: "Định Quán", label: "Định Quán" }, { value: "Trảng Bom", label: "Trảng Bom" },
    { value: "Thống Nhất", label: "Thống Nhất" }, { value: "Cẩm Mỹ", label: "Cẩm Mỹ" }, { value: "Long Thành", label: "Long Thành" },
    { value: "Xuân Lộc", label: "Xuân Lộc" }, { value: "Nhơn Trạch", label: "Nhơn Trạch" },
  ]},
  { value: "Đồng Tháp", label: "Đồng Tháp", districts: [
    { value: "Cao Lãnh", label: "Cao Lãnh" }, { value: "Sa Đéc", label: "Sa Đéc" }, { value: "Hồng Ngự", label: "Hồng Ngự" },
    { value: "Tân Hồng", label: "Tân Hồng" }, { value: "Hồng Ngự", label: "Hồng Ngự" }, { value: "Tam Nông", label: "Tam Nông" },
    { value: "Tháp Mười", label: "Tháp Mười" }, { value: "Cao Lãnh", label: "Cao Lãnh" }, { value: "Thanh Bình", label: "Thanh Bình" },
    { value: "Lấp Vò", label: "Lấp Vò" }, { value: "Lai Vung", label: "Lai Vung" }, { value: "Châu Thành", label: "Châu Thành" },
  ]},
  { value: "Gia Lai", label: "Gia Lai", districts: [
    { value: "Pleiku", label: "Pleiku" }, { value: "An Khê", label: "An Khê" }, { value: "Ayun Pa", label: "Ayun Pa" },
    { value: "KBang", label: "KBang" }, { value: "Đắk Đoa", label: "Đắk Đoa" }, { value: "Chư Pah", label: "Chư Pah" },
    { value: "Ia Grai", label: "Ia Grai" }, { value: "Mang Yang", label: "Mang Yang" }, { value: "Kông Chro", label: "Kông Chro" },
    { value: "Đức Cơ", label: "Đức Cơ" }, { value: "Chư Prông", label: "Chư Prông" }, { value: "Chư Sê", label: "Chư Sê" },
    { value: "Đak Pơ", label: "Đak Pơ" }, { value: "Ia Pa", label: "Ia Pa" }, { value: "Krông Pa", label: "Krông Pa" },
    { value: "Phú Thiện", label: "Phú Thiện" },
  ]},
  { value: "Hà Giang", label: "Hà Giang", districts: [
    { value: "Hà Giang", label: "Hà Giang" }, { value: "Đồng Văn", label: "Đồng Văn" }, { value: "Mèo Vạc", label: "Mèo Vạc" },
    { value: "Yên Minh", label: "Yên Minh" }, { value: "Quản Bạ", label: "Quản Bạ" }, { value: "Vị Xuyên", label: "Vị Xuyên" },
    { value: "Bắc Mê", label: "Bắc Mê" }, { value: "Hoàng Su Phì", label: "Hoàng Su Phì" }, { value: "Xín Mần", label: "Xín Mần" },
    { value: "Bắc Quang", label: "Bắc Quang" }, { value: "Quang Bình", label: "Quang Bình" },
  ]},
  { value: "Hà Nam", label: "Hà Nam", districts: [
    { value: "Phủ Lý", label: "Phủ Lý" }, { value: "Duy Tiên", label: "Duy Tiên" }, { value: "Kim Bảng", label: "Kim Bảng" },
    { value: "Thanh Liêm", label: "Thanh Liêm" }, { value: "Bình Lục", label: "Bình Lục" }, { value: "Lý Nhân", label: "Lý Nhân" },
  ]},
  { value: "Hà Tĩnh", label: "Hà Tĩnh", districts: [
    { value: "Hà Tĩnh", label: "Hà Tĩnh" }, { value: "Hồng Lĩnh", label: "Hồng Lĩnh" }, { value: "Hương Sơn", label: "Hương Sơn" },
    { value: "Đức Thọ", label: "Đức Thọ" }, { value: "Vũ Quang", label: "Vũ Quang" }, { value: "Nghi Xuân", label: "Nghi Xuân" },
    { value: "Can Lộc", label: "Can Lộc" }, { value: "Hương Khê", label: "Hương Khê" }, { value: "Thạch Hà", label: "Thạch Hà" },
    { value: "Cẩm Xuyên", label: "Cẩm Xuyên" }, { value: "Kỳ Anh", label: "Kỳ Anh" }, { value: "Lộc Hà", label: "Lộc Hà" },
  ]},
  { value: "Hải Dương", label: "Hải Dương", districts: [
    { value: "Hải Dương", label: "Hải Dương" }, { value: "Chí Linh", label: "Chí Linh" }, { value: "Nam Sách", label: "Nam Sách" },
    { value: "Kinh Môn", label: "Kinh Môn" }, { value: "Kim Thành", label: "Kim Thành" }, { value: "Thanh Hà", label: "Thanh Hà" },
    { value: "Cẩm Giàng", label: "Cẩm Giàng" }, { value: "Bình Giang", label: "Bình Giang" }, { value: "Gia Lộc", label: "Gia Lộc" },
    { value: "Tứ Kỳ", label: "Tứ Kỳ" }, { value: "Ninh Giang", label: "Ninh Giang" }, { value: "Thanh Miện", label: "Thanh Miện" },
  ]},
  { value: "Hậu Giang", label: "Hậu Giang", districts: [
    { value: "Vị Thanh", label: "Vị Thanh" }, { value: "Ngã Bảy", label: "Ngã Bảy" }, { value: "Châu Thành A", label: "Châu Thành A" },
    { value: "Châu Thành", label: "Châu Thành" }, { value: "Phụng Hiệp", label: "Phụng Hiệp" }, { value: "Vị Thủy", label: "Vị Thủy" },
    { value: "Long Mỹ", label: "Long Mỹ" }, { value: "Long Mỹ", label: "Long Mỹ" },
  ]},
  { value: "Hòa Bình", label: "Hòa Bình", districts: [
    { value: "Hòa Bình", label: "Hòa Bình" }, { value: "Đà Bắc", label: "Đà Bắc" }, { value: "Lương Sơn", label: "Lương Sơn" },
    { value: "Kim Bôi", label: "Kim Bôi" }, { value: "Cao Phong", label: "Cao Phong" }, { value: "Tân Lạc", label: "Tân Lạc" },
    { value: "Mai Châu", label: "Mai Châu" }, { value: "Đạp Thanh", label: "Đạp Thanh" }, { value: "Yên Thủy", label: "Yên Thủy" },
    { value: "Lạc Sơn", label: "Lạc Sơn" }, { value: "Lạc Thủy", label: "Lạc Thủy" },
  ]},
  { value: "Hưng Yên", label: "Hưng Yên", districts: [
    { value: "Hưng Yên", label: "Hưng Yên" }, { value: "Văn Giang", label: "Văn Giang" }, { value: "Văn Lâm", label: "Văn Lâm" },
    { value: "Yên Mỹ", label: "Yên Mỹ" }, { value: "Mỹ Hào", label: "Mỹ Hào" }, { value: "Ân Thi", label: "Ân Thi" },
    { value: "Khoái Châu", label: "Khoái Châu" }, { value: "Kim Động", label: "Kim Động" }, { value: "Tiên Lữ", label: "Tiên Lữ" },
    { value: "Phù Cừ", label: "Phù Cừ" },
  ]},
  { value: "Khánh Hòa", label: "Khánh Hòa", districts: [
    { value: "Nha Trang", label: "Nha Trang" }, { value: "Cam Ranh", label: "Cam Ranh" }, { value: "Cam Lâm", label: "Cam Lâm" },
    { value: "Vạn Ninh", label: "Vạn Ninh" }, { value: "Ninh Hòa", label: "Ninh Hòa" }, { value: "Khánh Vĩnh", label: "Khánh Vĩnh" },
    { value: "Diên Khánh", label: "Diên Khánh" }, { value: "Khánh Sơn", label: "Khánh Sơn" }, { value: "Trường Sa", label: "Trường Sa" },
  ]},
  { value: "Kiên Giang", label: "Kiên Giang", districts: [
    { value: "Rạch Giá", label: "Rạch Giá" }, { value: "Hà Tiên", label: "Hà Tiên" }, { value: "Kiên Lương", label: "Kiên Lương" },
    { value: "Hòn Đất", label: "Hòn Đất" }, { value: "Tân Hiệp", label: "Tân Hiệp" }, { value: "Châu Thành", label: "Châu Thành" },
    { value: "Giồng Riềng", label: "Giồng Riềng" }, { value: "Gò Quao", label: "Gò Quao" }, { value: "An Biên", label: "An Biên" },
    { value: "An Minh", label: "An Minh" }, { value: "Vĩnh Thuận", label: "Vĩnh Thuận" }, { value: "Phú Quốc", label: "Phú Quốc" },
    { value: "Kiên Hải", label: "Kiên Hải" }, { value: "U Minh Thượng", label: "U Minh Thượng" },
  ]},
  { value: "Kon Tum", label: "Kon Tum", districts: [
    { value: "Kon Tum", label: "Kon Tum" }, { value: "Đắk Glei", label: "Đắk Glei" }, { value: "Ngọc Hồi", label: "Ngọc Hồi" },
    { value: "Đắk Tô", label: "Đắk Tô" }, { value: "Kon Plông", label: "Kon Plông" }, { value: "Kon Rẫy", label: "Kon Rẫy" },
    { value: "Đắk Hà", label: "Đắk Hà" }, { value: "Sa Thầy", label: "Sa Thầy" }, { value: "Tu Mơ Rông", label: "Tu Mơ Rông" },
    { value: "Ia H'Drai", label: "Ia H'Drai" },
  ]},
  { value: "Lai Châu", label: "Lai Châu", districts: [
    { value: "Lai Châu", label: "Lai Châu" }, { value: "Tam Đường", label: "Tam Đường" }, { value: "Mường Tè", label: "Mường Tè" },
    { value: "Sìn Hồ", label: "Sìn Hồ" }, { value: "Phong Thổ", label: "Phong Thổ" }, { value: "Than Uyên", label: "Than Uyên" },
    { value: "Tân Uyên", label: "Tân Uyên" }, { value: "Nậm Nhùn", label: "Nậm Nhùn" },
  ]},
  { value: "Lâm Đồng", label: "Lâm Đồng", districts: [
    { value: "Đà Lạt", label: "Đà Lạt" }, { value: "Bảo Lộc", label: "Bảo Lộc" }, { value: "Đam Rông", label: "Đam Rông" },
    { value: "Lạc Dương", label: "Lạc Dương" }, { value: "Lâm Hà", label: "Lâm Hà" }, { value: "Đơn Dương", label: "Đơn Dương" },
    { value: "Đức Trọng", label: "Đức Trọng" }, { value: "Di Linh", label: "Di Linh" }, { value: "Bảo Lâm", label: "Bảo Lâm" },
    { value: "Cát Tiên", label: "Cát Tiên" },
  ]},
  { value: "Lạng Sơn", label: "Lạng Sơn", districts: [
    { value: "Lạng Sơn", label: "Lạng Sơn" }, { value: "Tràng Định", label: "Tràng Định" }, { value: "Bình Gia", label: "Bình Gia" },
    { value: "Văn Lãng", label: "Văn Lãng" }, { value: "Cao Lộc", label: "Cao Lộc" }, { value: "Văn Quan", label: "Văn Quan" },
    { value: "Bắc Sơn", label: "Bắc Sơn" }, { value: "Hữu Lũng", label: "Hữu Lũng" }, { value: "Chi Lăng", label: "Chi Lăng" },
    { value: "Lộc Bình", label: "Lộc Bình" }, { value: "Đình Lập", label: "Đình Lập" },
  ]},
  { value: "Lào Cai", label: "Lào Cai", districts: [
    { value: "Lào Cai", label: "Lào Cai" }, { value: "Bát Xát", label: "Bát Xát" }, { value: "Mường Khương", label: "Mường Khương" },
    { value: "Si Ma Cai", label: "Si Ma Cai" }, { value: "Bắc Hà", label: "Bắc Hà" }, { value: "Bảo Thắng", label: "Bảo Thắng" },
    { value: "Bảo Yên", label: "Bảo Yên" }, { value: "Sa Pa", label: "Sa Pa" }, { value: "Văn Bàn", label: "Văn Bàn" },
  ]},
  { value: "Long An", label: "Long An", districts: [
    { value: "Tân An", label: "Tân An" }, { value: "Kiến Tường", label: "Kiến Tường" }, { value: "Tân Hưng", label: "Tân Hưng" },
    { value: "Vĩnh Hưng", label: "Vĩnh Hưng" }, { value: "Mộc Hóa", label: "Mộc Hóa" }, { value: "Tân Thạnh", label: "Tân Thạnh" },
    { value: "Thạnh Hóa", label: "Thạnh Hóa" }, { value: "Đức Huệ", label: "Đức Huệ" }, { value: "Đức Hòa", label: "Đức Hòa" },
    { value: "Bến Lức", label: "Bến Lức" }, { value: "Thủ Thừa", label: "Thủ Thừa" }, { value: "Tân Trụ", label: "Tân Trụ" },
    { value: "Cần Đước", label: "Cần Đước" }, { value: "Cần Giuộc", label: "Cần Giuộc" }, { value: "Châu Thành", label: "Châu Thành" },
  ]},
  { value: "Nam Định", label: "Nam Định", districts: [
    { value: "Nam Định", label: "Nam Định" }, { value: "Mỹ Lộc", label: "Mỹ Lộc" }, { value: "Vụ Bản", label: "Vụ Bản" },
    { value: "Ý Yên", label: "Ý Yên" }, { value: "Nam Trực", label: "Nam Trực" }, { value: "Trực Ninh", label: "Trực Ninh" },
    { value: "Xuân Trường", label: "Xuân Trường" }, { value: "Giao Thủy", label: "Giao Thủy" }, { value: "Hải Hậu", label: "Hải Hậu" },
    { value: "Nghĩa Hưng", label: "Nghĩa Hưng" },
  ]},
  { value: "Nghệ An", label: "Nghệ An", districts: [
    { value: "Vinh", label: "Vinh" }, { value: "Cửa Lò", label: "Cửa Lò" }, { value: "Thái Hoà", label: "Thái Hoà" },
    { value: "Quế Phong", label: "Quế Phong" }, { value: "Quỳ Châu", label: "Quỳ Châu" }, { value: "Kỳ Sơn", label: "Kỳ Sơn" },
    { value: "Tương Dương", label: "Tương Dương" }, { value: "Nghĩa Đàn", label: "Nghĩa Đàn" }, { value: "Quỳ Hợp", label: "Quỳ Hợp" },
    { value: "Quỳnh Lưu", label: "Quỳnh Lưu" }, { value: "Con Cuông", label: "Con Cuông" }, { value: "Tân Kỳ", label: "Tân Kỳ" },
    { value: "Anh Sơn", label: "Anh Sơn" }, { value: "Diễn Châu", label: "Diễn Châu" }, { value: "Yên Thành", label: "Yên Thành" },
    { value: "Đô Lương", label: "Đô Lương" }, { value: "Thanh Chương", label: "Thanh Chương" }, { value: "Nghi Lộc", label: "Nghi Lộc" },
    { value: "Nam Đàn", label: "Nam Đàn" }, { value: "Hưng Nguyên", label: "Hưng Nguyên" },
  ]},
  { value: "Ninh Bình", label: "Ninh Bình", districts: [
    { value: "Ninh Bình", label: "Ninh Bình" }, { value: "Tam Điệp", label: "Tam Điệp" }, { value: "Nho Quan", label: "Nho Quan" },
    { value: "Gia Viễn", label: "Gia Viễn" }, { value: "Hoa Lư", label: "Hoa Lư" }, { value: "Yên Khánh", label: "Yên Khánh" },
    { value: "Kim Sơn", label: "Kim Sơn" }, { value: "Yên Mô", label: "Yên Mô" },
  ]},
  { value: "Ninh Thuận", label: "Ninh Thuận", districts: [
    { value: "Phan Rang-Tháp Chàm", label: "Phan Rang-Tháp Chàm" }, { value: "Bác Ái", label: "Bác Ái" }, { value: "Ninh Sơn", label: "Ninh Sơn" },
    { value: "Ninh Hải", label: "Ninh Hải" }, { value: "Ninh Phước", label: "Ninh Phước" }, { value: "Thuận Bắc", label: "Thuận Bắc" },
    { value: "Thuận Nam", label: "Thuận Nam" },
  ]},
  { value: "Phú Thọ", label: "Phú Thọ", districts: [
    { value: "Việt Trì", label: "Việt Trì" }, { value: "Phú Thọ", label: "Phú Thọ" }, { value: "Đoan Bái", label: "Đoan Bái" },
    { value: "Thanh Ba", label: "Thanh Ba" }, { value: "Hạ Hoà", label: "Hạ Hoà" }, { value: "Cẩm Khê", label: "Cẩm Khê" },
    { value: "Yên Lập", label: "Yên Lập" }, { value: "Thanh Sơn", label: "Thanh Sơn" }, { value: "Thanh Thủy", label: "Thanh Thủy" },
    { value: "Tân Sơn", label: "Tân Sơn" }, { value: "Lâm Thao", label: "Lâm Thao" }, { value: "Tam Nông", label: "Tam Nông" },
  ]},
  { value: "Quảng Bình", label: "Quảng Bình", districts: [
    { value: "Đồng Hới", label: "Đồng Hới" }, { value: "Minh Hóa", label: "Minh Hóa" }, { value: "Tuyên Hóa", label: "Tuyên Hóa" },
    { value: "Quảng Trạch", label: "Quảng Trạch" }, { value: "Bố Trạch", label: "Bố Trạch" }, { value: "Quảng Ninh", label: "Quảng Ninh" },
    { value: "Lệ Thủy", label: "Lệ Thủy" },
  ]},
  { value: "Quảng Nam", label: "Quảng Nam", districts: [
    { value: "Tam Kỳ", label: "Tam Kỳ" }, { value: "Hội An", label: "Hội An" }, { value: "Tây Giang", label: "Tây Giang" },
    { value: "Đông Giang", label: "Đông Giang" }, { value: "Đại Lộc", label: "Đại Lộc" }, { value: "Điện Bàn", label: "Điện Bàn" },
    { value: "Duy Xuyên", label: "Duy Xuyên" }, { value: "Quế Sơn", label: "Quế Sơn" }, { value: "Nam Giang", label: "Nam Giang" },
    { value: "Phước Sơn", label: "Phước Sơn" }, { value: "Hiệp Đức", label: "Hiệp Đức" }, { value: "Thăng Bình", label: "Thăng Bình" },
    { value: "Tiên Phước", label: "Tiên Phước" }, { value: "Bắc Trà My", label: "Bắc Trà My" }, { value: "Nam Trà My", label: "Nam Trà My" },
    { value: "Núi Thành", label: "Núi Thành" }, { value: "Phú Ninh", label: "Phú Ninh" }, { value: "Nông Sơn", label: "Nông Sơn" },
  ]},
  { value: "Quảng Ngãi", label: "Quảng Ngãi", districts: [
    { value: "Quảng Ngãi", label: "Quảng Ngãi" }, { value: "Bình Sơn", label: "Bình Sơn" }, { value: "Trà Bồng", label: "Trà Bồng" },
    { value: "Sơn Tịnh", label: "Sơn Tịnh" }, { value: "Tư Nghĩa", label: "Tư Nghĩa" }, { value: "Sơn Hà", label: "Sơn Hà" },
    { value: "Sơn Tây", label: "Sơn Tây" }, { value: "Minh Long", label: "Minh Long" }, { value: "Nghĩa Hành", label: "Nghĩa Hành" },
    { value: "Mộ Đức", label: "Mộ Đức" }, { value: "Đức Phổ", label: "Đức Phổ" }, { value: "Ba Tơ", label: "Ba Tơ" },
    { value: "Lý Sơn", label: "Lý Sơn" },
  ]},
  { value: "Quảng Ninh", label: "Quảng Ninh", districts: [
    { value: "Hạ Long", label: "Hạ Long" }, { value: "Cẩm Phả", label: "Cẩm Phả" }, { value: "Uông Bí", label: "Uông Bí" },
    { value: "Móng Cái", label: "Móng Cái" }, { value: "Quảng Yên", label: "Quảng Yên" }, { value: "Đông Triều", label: "Đông Triều" },
    { value: "Hoành Bồ", label: "Hoành Bồ" }, { value: "Ba Chẽ", label: "Ba Chẽ" }, { value: "Vân Đồn", label: "Vân Đồn" },
    { value: "Tiên Yên", label: "Tiên Yên" }, { value: "Bình Liêu", label: "Bình Liêu" }, { value: "Đầm Hà", label: "Đầm Hà" },
    { value: "Hải Hà", label: "Hải Hà" }, { value: "Cô Tô", label: "Cô Tô" },
  ]},
  { value: "Quảng Trị", label: "Quảng Trị", districts: [
    { value: "Đông Hà", label: "Đông Hà" }, { value: "Quảng Trị", label: "Quảng Trị" }, { value: "Vĩnh Linh", label: "Vĩnh Linh" },
    { value: "Gio Linh", label: "Gio Linh" }, { value: "Đa Krông", label: "Đa Krông" }, { value: "Cam Lộ", label: "Cam Lộ" },
    { value: "Triệu Phong", label: "Triệu Phong" }, { value: "Hải Lăng", label: "Hải Lăng" }, { value: "Hướng Hóa", label: "Hướng Hóa" },
    { value: "Cồn Cỏ", label: "Cồn Cỏ" },
  ]},
  { value: "Sóc Trăng", label: "Sóc Trăng", districts: [
    { value: "Sóc Trăng", label: "Sóc Trăng" }, { value: "Châu Thành", label: "Châu Thành" }, { value: "Kế Sách", label: "Kế Sách" },
    { value: "Mỹ Tú", label: "Mỹ Tú" }, { value: "Cù Lao Dung", label: "Cù Lao Dung" }, { value: "Long Phú", label: "Long Phú" },
    { value: "Mỹ Xuyên", label: "Mỹ Xuyên" }, { value: "Ngã Năm", label: "Ngã Năm" }, { value: "Thạnh Trị", label: "Thạnh Trị" },
    { value: "Vĩnh Châu", label: "Vĩnh Châu" }, { value: "Trần Đề", label: "Trần Đề" },
  ]},
  { value: "Sơn La", label: "Sơn La", districts: [
    { value: "Sơn La", label: "Sơn La" }, { value: "Quỳnh Nhai", label: "Quỳnh Nhai" }, { value: "Mường La", label: "Mường La" },
    { value: "Thuận Châu", label: "Thuận Châu" }, { value: "Bắc Yên", label: "Bắc Yên" }, { value: "Phù Yên", label: "Phù Yên" },
    { value: "Mộc Châu", label: "Mộc Châu" }, { value: "Yên Châu", label: "Yên Châu" }, { value: "Mai Sơn", label: "Mai Sơn" },
    { value: "Sông Mã", label: "Sông Mã" }, { value: "Sốp Cộp", label: "Sốp Cộp" }, { value: "Vân Hồ", label: "Vân Hồ" },
  ]},
  { value: "Tây Ninh", label: "Tây Ninh", districts: [
    { value: "Tây Ninh", label: "Tây Ninh" }, { value: "Tân Biên", label: "Tân Biên" }, { value: "Tân Châu", label: "Tân Châu" },
    { value: "Dương Minh Châu", label: "Dương Minh Châu" }, { value: "Châu Thành", label: "Châu Thành" }, { value: "Hòa Thành", label: "Hòa Thành" },
    { value: "Gò Dầu", label: "Gò Dầu" }, { value: "Bến Cầu", label: "Bến Cầu" }, { value: "Trảng Bàng", label: "Trảng Bàng" },
  ]},
  { value: "Thái Bình", label: "Thái Bình", districts: [
    { value: "Thái Bình", label: "Thái Bình" }, { value: "Quỳnh Phụ", label: "Quỳnh Phụ" }, { value: "Hưng Hà", label: "Hưng Hà" },
    { value: "Đông Hưng", label: "Đông Hưng" }, { value: "Thái Thụy", label: "Thái Thụy" }, { value: "Tiền Hải", label: "Tiền Hải" },
    { value: "Kiến Xương", label: "Kiến Xương" }, { value: "Vũ Thư", label: "Vũ Thư" },
  ]},
  { value: "Thái Nguyên", label: "Thái Nguyên", districts: [
    { value: "Thái Nguyên", label: "Thái Nguyên" }, { value: "Sông Công", label: "Sông Công" }, { value: "Định Hóa", label: "Định Hóa" },
    { value: "Phú Lương", label: "Phú Lương" }, { value: "Đồng Hỷ", label: "Đồng Hỷ" }, { value: "Võ Nhai", label: "Võ Nhai" },
    { value: "Đại Từ", label: "Đại Từ" }, { value: "Phổ Yên", label: "Phổ Yên" }, { value: "Phú Bình", label: "Phú Bình" },
  ]},
  { value: "Thanh Hóa", label: "Thanh Hóa", districts: [
    { value: "Thanh Hóa", label: "Thanh Hóa" }, { value: "Bỉm Sơn", label: "Bỉm Sơn" }, { value: "Sầm Sơn", label: "Sầm Sơn" },
    { value: "Mường Lát", label: "Mường Lát" }, { value: "Quan Hóa", label: "Quan Hóa" }, { value: "Bá Thước", label: "Bá Thước" },
    { value: "Quan Sơn", label: "Quan Sơn" }, { value: "Lang Chánh", label: "Lang Chánh" }, { value: "Ngọc Lặc", label: "Ngọc Lặc" },
    { value: "Cẩm Thủy", label: "Cẩm Thủy" }, { value: "Thạch Thành", label: "Thạch Thành" }, { value: "Hà Trung", label: "Hà Trung" },
    { value: "Vĩnh Lộc", label: "Vĩnh Lộc" }, { value: "Yên Định", label: "Yên Định" }, { value: "Thọ Xuân", label: "Thọ Xuân" },
    { value: "Thường Xuân", label: "Thường Xuân" }, { value: "Triệu Sơn", label: "Triệu Sơn" }, { value: "Thiệu Hóa", label: "Thiệu Hóa" },
    { value: "Hoằng Hóa", label: "Hoằng Hóa" }, { value: "Hậu Lộc", label: "Hậu Lộc" }, { value: "Nga Sơn", label: "Nga Sơn" },
    { value: "Như Xuân", label: "Như Xuân" }, { value: "Như Thanh", label: "Như Thanh" }, { value: "Nông Cống", label: "Nông Cống" },
    { value: "Đông Sơn", label: "Đông Sơn" }, { value: "Quảng Xương", label: "Quảng Xương" }, { value: "Tĩnh Gia", label: "Tĩnh Gia" },
  ]},
  { value: "Thừa Thiên Huế", label: "Thừa Thiên Huế", districts: [
    { value: "Huế", label: "Huế" }, { value: "Phong Điền", label: "Phong Điền" }, { value: "Quảng Điền", label: "Quảng Điền" },
    { value: "Phú Vang", label: "Phú Vang" }, { value: "Hương Thủy", label: "Hương Thủy" }, { value: "Hương Trà", label: "Hương Trà" },
    { value: "A Lưới", label: "A Lưới" }, { value: "Phú Lộc", label: "Phú Lộc" }, { value: "Nam Đông", label: "Nam Đông" },
  ]},
  { value: "Tiền Giang", label: "Tiền Giang", districts: [
    { value: "Mỹ Tho", label: "Mỹ Tho" }, { value: "Gò Công", label: "Gò Công" }, { value: "Cai Lậy", label: "Cai Lậy" },
    { value: "Tân Phước", label: "Tân Phước" }, { value: "Cái Bè", label: "Cái Bè" }, { value: "Châu Thành", label: "Châu Thành" },
    { value: "Chợ Gạo", label: "Chợ Gạo" }, { value: "Gò Công Đông", label: "Gò Công Đông" }, { value: "Gò Công Tây", label: "Gò Công Tây" },
    { value: "Tân Phú Đông", label: "Tân Phú Đông" },
  ]},
  { value: "Trà Vinh", label: "Trà Vinh", districts: [
    { value: "Trà Vinh", label: "Trà Vinh" }, { value: "Càng Long", label: "Càng Long" }, { value: "Cầu Kè", label: "Cầu Kè" },
    { value: "Tiểu Cần", label: "Tiểu Cần" }, { value: "Châu Thành", label: "Châu Thành" }, { value: "Cầu Ngang", label: "Cầu Ngang" },
    { value: "Trà Cú", label: "Trà Cú" }, { value: "Duyên Hải", label: "Duyên Hải" }, { value: "Duyên Hải", label: "Duyên Hải" },
  ]},
  { value: "Tuyên Quang", label: "Tuyên Quang", districts: [
    { value: "Tuyên Quang", label: "Tuyên Quang" }, { value: "Lâm Bình", label: "Lâm Bình" }, { value: "Na Hang", label: "Na Hang" },
    { value: "Chiêm Hóa", label: "Chiêm Hóa" }, { value: "Hàm Yên", label: "Hàm Yên" }, { value: "Yên Sơn", label: "Yên Sơn" },
    { value: "Sơn Dương", label: "Sơn Dương" },
  ]},
  { value: "Vĩnh Long", label: "Vĩnh Long", districts: [
    { value: "Vĩnh Long", label: "Vĩnh Long" }, { value: "Long Hồ", label: "Long Hồ" }, { value: "Mang Thít", label: "Mang Thít" },
    { value: "Vũng Liêm", label: "Vũng Liêm" }, { value: "Tam Bình", label: "Tam Bình" }, { value: "Bình Minh", label: "Bình Minh" },
    { value: "Trà Ôn", label: "Trà Ôn" }, { value: "Bình Tân", label: "Bình Tân" },
  ]},
  { value: "Vĩnh Phúc", label: "Vĩnh Phúc", districts: [
    { value: "Vĩnh Yên", label: "Vĩnh Yên" }, { value: "Phúc Yên", label: "Phúc Yên" }, { value: "Lập Thạch", label: "Lập Thạch" },
    { value: "Tam Dương", label: "Tam Dương" }, { value: "Tam Đảo", label: "Tam Đảo" }, { value: "Bình Xuyên", label: "Bình Xuyên" },
    { value: "Yên Lạc", label: "Yên Lạc" }, { value: "Vĩnh Tường", label: "Vĩnh Tường" }, { value: "Sông Lô", label: "Sông Lô" },
  ]},
  { value: "Yên Bái", label: "Yên Bái", districts: [
    { value: "Yên Bái", label: "Yên Bái" }, { value: "Nghĩa Lộ", label: "Nghĩa Lộ" }, { value: "Lục Yên", label: "Lục Yên" },
    { value: "Văn Yên", label: "Văn Yên" }, { value: "Mù Cang Chải", label: "Mù Cang Chải" }, { value: "Trấn Yên", label: "Trấn Yên" },
    { value: "Trạm Tấu", label: "Trạm Tấu" }, { value: "Văn Chấn", label: "Văn Chấn" }, { value: "Yên Bình", label: "Yên Bình" },
  ]},
];

/** Options hướng nhà cho form đăng tin */
export const DIRECTION_OPTIONS = [
  { value: "", label: "Chọn hướng nhà" },
  { value: "Đông", label: "Đông" },
  { value: "Tây", label: "Tây" },
  { value: "Nam", label: "Nam" },
  { value: "Bắc", label: "Bắc" },
  { value: "Đông Bắc", label: "Đông Bắc" },
  { value: "Đông Nam", label: "Đông Nam" },
  { value: "Tây Bắc", label: "Tây Bắc" },
  { value: "Tây Nam", label: "Tây Nam" },
];
