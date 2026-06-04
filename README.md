<div align="center">
  <!-- Language badges: Vietnamese is default -->
  <span>
    <a href="README.md"><img alt="Tiếng Việt" src="https://img.shields.io/badge/Tiếng%20Việt-VI-green?logo=github&style=flat-square"></a>
    <a href="docs-readme/en/README.md"><img alt="English" src="https://img.shields.io/badge/English-EN-blue?logo=github&style=flat-square"></a>
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

## Mục lục

- [Vấn đề cốt lõi / Hook](#vấn-đề-cốt-lõi--hook)
- [Hệ thống chính / Kiến trúc](#hệ-thống-chính--kiến-trúc)
- [Bắt đầu nhanh / Quick Start](#bắt-đầu-nhanh--quick-start)
- [Khái niệm cốt lõi / Vòng đời hoạt động](#khái-niệm-cốt-lõi--vòng-đời-hoạt-động)
- [Cấu trúc kho mã](#cấu-trúc-kho-mã)
- [Đối tượng & Yêu cầu](#đối-tượng--yêu-cầu)
- [Các dự án liên quan & Lịch sử sao](#các-dự-án-liên-quan--lịch-sử-sao)

---

## Vấn đề cốt lõi / Hook

> Sự thật khó: người dùng lịch cần một nguồn dữ liệu chính thống — nhưng nhiều trang thể thao chỉ cung cấp trang tĩnh, sai lệch múi giờ, và không có đường dẫn đăng ký. Không có một feed đáng tin cậy, người dùng phải nhập tay hoặc dùng CSV lỗi thời.

KHÔNG CÓ dự án này:

- Người hâm mộ phải sao chép thời gian trận đấu thủ công và dễ bỏ lỡ cập nhật hoặc sai lệch múi giờ.
- Nhà phát triển phải xây dựng các bộ cào (scraper) mong manh hoặc nhúng phân tích nặng để hiển thị lịch cơ bản.

CÓ dự án này:

- Một endpoint WebCal nhẹ, minh bạch và có thể đăng ký — xuất bản dữ liệu trận đấu chính thức (bao gồm múi giờ và hỗ trợ đội hình).
- Tích hợp và lịch cá nhân luôn chính xác tự động — không cần scraping hay telemetery phức tạp.

Kho mã này được thiết kế tối giản nhưng sẵn sàng cho sản xuất: lịch xác định (deterministic), hỗ trợ đa ngôn ngữ và API nhỏ để các bên tích hợp có thể tin tưởng.

---

## Hệ thống chính / Kiến trúc

Sơ đồ kiến trúc ASCII (cấp cao):

```
     +-----------------+        +-------------------+        +----------------+
     |  Giao diện Web   | <----> |  Route API (Edge) | <----> |  Động cơ WebCal |
     |   (Next.js)      |        |  /api/calendar     |        |  - generateIcs  |
     +-----------------+        +-------------------+        +----------------+
             ^                          ^    ^                       |
             |                          |    |                       v
             |                          |    |                 +-------------+
             |                          |    +---------------> |  Lớp dữ liệu |
             |                          |                    |  - data/schedule.ts
             |                          |                    |  - data/teams.ts
             |                          |                    +-------------+
             |                          |                            |
             |                          |                            v
             +--------------------------+----------------> +----------------+
                                                  i18n          | Public ICS URL |
                                                               | /api/calendar.ics |
                                                               +----------------+
```

Thành phần (thư mục):

- `app/` — Ứng dụng Next.js, trang có bản địa hóa và các thành phần giao diện.
- `components/` — Các thành phần UI tái sử dụng như lịch tháng, danh sách trận đấu, nút thêm vào lịch.
- `data/` — Nguồn dữ liệu chính: `schedule.ts`, `teams.ts` (danh sách đội, đội hình mẫu, metadata).
- `lib/` — Tiện ích: `generateIcs.ts`, hàm xử lý ngày giờ, helper cho URL.
- `api/` — Route cung cấp WebCal/iCal cho việc đăng ký lịch.

---

## Bắt đầu nhanh / Quick Start

Cấu trúc chính — vị trí những tệp cấu hình quan trọng:

```
/ (root repository)
├─ app/                 # Next.js app + trang bản địa hóa
├─ components/          # Widget UI (AddToCalendar, MonthCalendar)
├─ data/                # schedule.ts, teams.ts (nguồn chính)
├─ lib/                 # generateIcs.ts, dates utilities
├─ api/                 # calendar route (WebCal endpoint)
├─ public/              # tài nguyên tĩnh
├─ package.json
└─ LICENSE
```

Cài đặt & chạy:

```bash
# cài đặt
bun install

# chạy chế độ phát triển
bun dev

# build và chạy production
bun build
bun start
```

Mở `http://localhost:3000` và kiểm tra đường dẫn WebCal tại `/api/calendar.ics`.

---

## Khái niệm cốt lõi / Vòng đời hoạt động

Vòng đời động cơ (ASCII flow):

```
[Dữ liệu chính] --> [Serializer trận đấu] --> [ICS Renderer] --> [HTTP Cache]
       |                     |                     |                 |
       v                     v                     v                 v
   data/schedule.ts       normalize()           generateIcs()     GET /api/calendar.ics
       |                     |                     |                 |
       +-------------------------------------------------------------+
                                 các consumer
```

Quy trình chạy:

1. Lịch chính thức được duy trì trong `data/schedule.ts` và `data/teams.ts`.
2. Khi `/api/calendar` được yêu cầu, route tải lịch theo ngôn ngữ/múi giờ yêu cầu.
3. `lib/generateIcs.ts` chuyển đổi dữ liệu thành iCalendar chuẩn (đảm bảo TZ và UID duy nhất).
4. Feed được cache ở lớp HTTP với TTL ngắn; khi cập nhật `data/` thì feed được làm mới.

Mô hình này đảm bảo footprint nhỏ, kết quả xác định và TTL dự đoán được cho các consumer.

---

## Cấu trúc kho mã

```
World-Cup-2026-Schedule-Calendar/
├─ app/
│  ├─ globals.css
│  └─ [locale]/
├─ components/
├─ data/
│  ├─ schedule.ts
│  └─ teams.ts
├─ lib/
│  └─ generateIcs.ts
├─ api/
│  └─ calendar/route.ts
├─ public/
├─ package.json
└─ README.md
```

---

## Đối tượng & Yêu cầu

| Đối tượng | Yêu cầu |
|---|---|
| Người dùng muốn đăng ký lịch World Cup | Bất kỳ ứng dụng lịch hỗ trợ WebCal (Google Calendar, Apple Calendar, Outlook) |
| Nhà phát triển cần feed fixtures chính thức | Node 18+, `bun` (khuyến nghị) hoặc `npm`/`pnpm`, hiểu cơ bản Next.js & TypeScript |

Công cụ khuyến nghị:

- `bun` để cài nhanh và chạy dev nhanh (hoạt động với `npm`/`pnpm` cũng được).
- Trình soạn thảo có hỗ trợ TypeScript (VS Code).

---

## Các dự án liên quan & Lịch sử sao

Lịch sử sao (dự án):

![Star History](https://starchart.cc/Tylerx404/World-Cup-2026-Schedule-Calendar.svg)

---

## Ghi chú & Bước tiếp theo

- Để thêm đội hình chi tiết cho từng trận, mở `data/schedule.ts` và mở rộng `Match` bằng trường `lineup` (kiểu `string[]` hoặc `Player[]`).
- Cân nhắc thêm API JSON nhỏ cho các consumer lập trình nếu cần.

---

## Giấy phép

MIT — xem tệp LICENSE.
