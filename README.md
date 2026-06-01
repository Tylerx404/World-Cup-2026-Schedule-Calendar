# Lịch thi đấu World Cup 2026 & WebCal Feed

Một ứng dụng web tối giản giúp người dùng theo dõi lịch thi đấu FIFA World Cup 2026 trực quan, hỗ trợ đa ngôn ngữ và tích hợp tính năng đăng ký lịch tự động qua giao thức WebCal (iCalendar Feed) trực tiếp vào lịch cá nhân.

Dự án được thiết kế theo phong cách tối giản, tập trung vào trải nghiệm xem lịch mượt mà, không quảng cáo và hiển thị chính xác theo múi giờ địa phương của người dùng.

---

## Các chức năng chính

- **Đăng ký lịch tự động**: Người dùng chỉ cần thêm liên kết lịch một lần duy nhất. Lịch thi đấu trên điện thoại hoặc máy tính sẽ tự động đồng bộ kết quả và cập nhật tên các đội tuyển lọt vào vòng knockout sau khi kết thúc vòng bảng.
- **Xem lịch tương tác**: Hỗ trợ hai giao diện xem lịch linh hoạt gồm lịch tháng dạng lưới trực quan và lịch trình phân trang chi tiết theo từng vòng đấu.
- **Đa ngôn ngữ toàn diện**: Hỗ trợ chuyển đổi ngôn ngữ linh hoạt giữa Tiếng Việt và Tiếng Anh.
- **Tối ưu hóa giao diện**: Thiết kế hiện đại hỗ trợ đầy đủ chế độ sáng và tối, tương thích tốt trên cả máy tính lẫn thiết bị di động.

---

## Hướng dẫn đăng ký lịch WebCal

1. Truy cập trang web và chọn sao chép liên kết đăng ký lịch WebCal.
2. Mở ứng dụng lịch cá nhân của bạn:
   - **Google Calendar**: Vào mục Thêm lịch -> Từ URL và dán liên kết.
   - **Apple Calendar**: Chọn Thêm lịch -> Đăng ký lịch mới và dán liên kết.
   - **Outlook**: Chọn Thêm lịch -> Đăng ký từ web và dán liên kết.
3. Lưu lại để lịch bắt đầu tự động đồng bộ hóa thông tin các trận đấu.

---

## Hướng dẫn chạy dự án cục bộ

Để chạy thử nghiệm hoặc phát triển ứng dụng trên máy tính của bạn:

```bash
# Tải mã nguồn về máy
git clone https://github.com/Tylerx404/World-Cup-2026-Schedule-Calendar.git
cd World-Cup-2026-Schedule-Calendar

# Cài đặt các gói phụ thuộc
bun install

# Khởi chạy môi trường phát triển
bun dev
```

Sau khi chạy lệnh trên, truy cập ứng dụng tại địa chỉ: `http://localhost:3000`