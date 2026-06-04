<div align="center">
  <span>
    <a href="README.md"><img alt="Tiếng Việt" src="https://img.shields.io/badge/Tiếng%20Việt-VI-green?logo=github&style=flat-square"></a>
    <a href="../en/README.md"><img alt="English" src="https://img.shields.io/badge/English-EN-blue?logo=github&style=flat-square"></a>
  </span>

  <h1 style="margin:0.5rem 0">Lịch thi đấu World Cup 2026 — Lịch & WebCal</h1>
  <p style="margin:0.25rem 0"><strong>Nhẹ nhàng, bảo vệ riêng tư và cung cấp nguồn lịch iCalendar (WebCal) chính thức.</strong></p>

  <p style="margin-top:0.5rem">
    <img alt="modules" src="https://img.shields.io/badge/modules-4-lightgrey?style=flat-square"> 
    <img alt="lang" src="https://img.shields.io/badge/languages-TypeScript%20%7C%20JS-blue?style=flat-square"> 
    <img alt="framework" src="https://img.shields.io/badge/framework-Next.js-yellow?style=flat-square"> 
    <img alt="license" src="https://img.shields.io/badge/license-MIT-brightgreen?style=flat-square">
  </p>
</div>
---

## Vấn đề cốt lõi — Vì sao dự án này cần thiết

> Sự thật khó: người dùng lịch cần một nguồn dữ liệu chính thống — nhưng nhiều trang thể thao chỉ cung cấp trang tĩnh, sai lệch múi giờ, và không có đường dẫn đăng ký. Không có một feed đáng tin cậy, người dùng phải nhập tay hoặc dùng CSV lỗi thời.

KHÔNG CÓ dự án này:

- Người hâm mộ sao chép thời gian trận đấu thủ công và bỏ lỡ cập nhật.
- Nhà phát triển xây dựng scraper mong manh hoặc nhúng phân tích nặng để trích xuất dữ liệu.

CÓ dự án này:

- Một endpoint WebCal nhẹ, minh bạch và có thể được đăng ký bởi mọi ứng dụng lịch.
- Lịch cá nhân và tích hợp bên thứ ba luôn được cập nhật tự động — không scraping, không telemetery phức tạp.

---

## Kiến trúc và Thành phần

Thư mục chính và vai trò:

- `app/` — Ứng dụng Next.js, các trang và giao diện người dùng.
- `components/` — Thành phần giao diện tái sử dụng (AddToCalendar, MonthCalendar, v.v.).
- `data/` — Nguồn dữ liệu chính: `schedule.ts`, `teams.ts` (danh sách đội và lịch thi đấu).
- `lib/` — Tiện ích: `generateIcs.ts`, hàm xử lý ngày giờ.
- `api/` — Route cung cấp feed WebCal (`/api/calendar.ics`).

---

## Bắt đầu nhanh

```
# cài đặt
bun install

# chạy dev
bun dev
```

Truy cập `http://localhost:3000`. Đường dẫn WebCal: `/api/calendar.ics`.

---

## Đối tượng và Yêu cầu

- Người dùng: mọi ứng dụng lịch hỗ trợ WebCal.
- Nhà phát triển: Node 18+, `bun` (khuyến nghị) hoặc `npm`/`pnpm`, biết cơ bản Next.js và TypeScript.

---

## Cấu trúc kho mã (tóm tắt)

```
World-Cup-2026-Schedule-Calendar/
├─ app/
├─ components/
├─ data/
├─ lib/
├─ api/
├─ public/
├─ package.json
└─ README.md
```

---

## Ghi chú

- Để thêm đội hình chi tiết cho từng trận, mở `data/schedule.ts` và mở rộng `Match` bằng trường `lineup`.
- Nên cung cấp API JSON nhỏ cho các nhà phát triển bên thứ ba nếu cần.

---

MIT — xem tệp LICENSE.

