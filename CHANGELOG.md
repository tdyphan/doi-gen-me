# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-26

### Added
**[EN]**
- **Core Functionality**: Extract DOIs from raw text and fetch metadata via Crossref API.
- **Citation Formatting**: Auto-generate Vancouver style citations containing the `doi:` prefix.
- **Bulk PDF Download**: Queue manager for bulk PDF downloads with a progress bar. Smart CORS error handling that aggregates failed links into a Modal for manual fallback downloading.
- **Data Persistence**: Integrated IndexedDB for caching (minimizing API calls) and History (Projects - previous working sessions).
- **Export Capabilities**: Copy all citations to clipboard and export to UTF-8 BOM CSV format.
- **UI & UX**:
  - Tailwind CSS CDN integration with Dark Mode/Light Mode support.
  - Vue 3 CDN (Options API) integration for smooth UI logic handling.
  - Multilingual i18n support (English / Vietnamese).
  - Replaced native alerts/prompts entirely with standardized Custom Modals and Toasts.
  - Synchronized icon system using Lucide/Feather.

**[VI]**
- **Tính năng cốt lõi**: Trích xuất DOI từ văn bản thô, gọi API Crossref để lấy metadata.
- **Định dạng trích dẫn**: Tự động tạo trích dẫn theo chuẩn Vancouver có chứa tiền tố `doi:`.
- **Tải PDF hàng loạt**: Quản lý Queue tải file PDF hàng loạt với thanh tiến trình. Xử lý lỗi CORS thông minh bằng cách gom link lỗi vào Modal để hỗ trợ tải thủ công.
- **Lưu trữ dữ liệu**: Tích hợp IndexedDB cho việc lưu trữ Cache (giảm thiểu API calls) và History (Projects - lịch sử phiên làm việc).
- **Xuất dữ liệu**: Cho phép sao chép tất cả trích dẫn, xuất file CSV định dạng UTF-8 BOM.
- **UI & UX**:
  - Tích hợp Tailwind CSS CDN với hỗ trợ Dark Mode/Light Mode.
  - Tích hợp Vue 3 CDN (Options API) xử lý logic giao diện mượt mà.
  - Tích hợp Đa ngôn ngữ i18n (Tiếng Anh / Tiếng Việt).
  - Thay thế toàn bộ alert/prompt mặc định bằng Custom Modals và Toasts chuẩn hóa.
  - Hệ thống icon đồng bộ từ thư viện Lucide/Feather.
