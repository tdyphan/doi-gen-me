<div align="center">
  <br />
  <img src="./assets/favicon.svg" alt="DOIGenMe Logo" width="100">
  <h1>DOIGenMe</h1>
  <p><strong><i>Smart DOI to Citation & PDF Extractor</i></strong></p>

  <div>
    <img src="https://img.shields.io/badge/Vanilla-JS-yellow?style=flat-square&logo=javascript&logoColor=black" alt="Vanilla JS">
    <img src="https://img.shields.io/badge/Vue.js-CDN-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white" alt="Vue via CDN">
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind">
  </div>
</div>

---

- [English](#english-version)
- [Tiếng Việt](#phiên-bản-tiếng-việt)

---

<h2 id="english-version">English</h2>

<details open>
  <summary><b>Table of Contents</b></summary>
  <ol>
    <li><a href="#-introduction">Introduction</a></li>
    <li><a href="#-usage">Usage</a></li>
    <li><a href="#-features">Features</a></li>
    <li><a href="#-architecture">Architecture</a></li>
    <li><a href="#-changelog">Changelog</a></li>
  </ol>
</details>

<h3 id="-introduction">🌟 Introduction</h3>

DOIGenMe is a lightweight, 100% browser-based tool that helps researchers automatically extract bibliography information from DOI strings, format them into Vancouver style, and bulk download PDF articles.

<h3 id="-usage">🎯 Usage</h3>

1. Access the `index.html` file directly or via Github Pages.
2. Paste the raw text containing DOI codes into the input box.
3. The app automatically extracts DOIs and calls the Crossref API to retrieve author, title, and journal metadata.
4. Manage extraction and PDF downloads with the smart Queue system.
5. Download a CSV file containing citations or click "Copy All".

<h3 id="-features">✨ Features</h3>

- 🔍 **Smart Detection**: Accurately extracts DOIs from messy, unstructured text.
- 📚 **Vancouver Citations**: Auto-formats into standard Vancouver style with DOI links.
- ⚡ **IndexedDB Cache**: Local caching for instantaneous retrieval without consuming API quota.
- ⬇️ **Bulk Download**: Queue support for downloading multiple PDFs concurrently, with smart CORS bypass / fallback links.
- 🌓 **UI/UX**: Tailwind Dark/Light mode + Multilingual support (English/Vietnamese).
- 🕒 **History**: Manage previous working sessions (Projects).

<h3 id="-architecture">🏗️ Architecture</h3>

Built with a **Zero-Build** approach:
- HTML + Tailwind CDN for layout.
- Vue 3 CDN (Options API) for state management.
- Modular JS files: `00_model.js`, `01_api.js`, `02_view.js`, `03_main.js`, `i18n.js`.
This architecture enables rapid editing and instant deployment without needing Node.js or bundlers. See `SPEC.md` for detailed architectural evaluation.

<h3 id="-changelog">📝 Changelog</h3>

See detailed changes at [CHANGELOG.md](./CHANGELOG.md).

---

<h2 id="phiên-bản-tiếng-việt">Tiếng Việt</h2>

<details open>
  <summary><b>Mục lục</b></summary>
  <ol>
    <li><a href="#-giới-thiệu">Giới thiệu</a></li>
    <li><a href="#-cách-dùng">Cách dùng</a></li>
    <li><a href="#-tính-năng-chính">Tính năng chính</a></li>
    <li><a href="#-kiến-trúc">Kiến trúc</a></li>
    <li><a href="#-changelog-vi">Changelog</a></li>
  </ol>
</details>

<h3 id="-giới-thiệu">🌟 Giới thiệu</h3>

DOIGenMe là công cụ nhỏ gọn, chạy 100% trên trình duyệt giúp giới nghiên cứu tự động lấy thông tin thư mục từ mã DOI, định dạng chuẩn Vancouver, và tải hàng loạt PDF.

<h3 id="-cách-dùng">🎯 Cách dùng</h3>

1. Truy cập trực tiếp file `index.html` hoặc qua Github Pages.
2. Dán đoạn văn bản chứa mã DOI (hoặc nhiều mã DOI) vào ô nhập liệu.
3. Ứng dụng tự động bóc tách DOI, gọi API Crossref để lấy thông tin tác giả, tiêu đề, tạp chí.
4. Quản lý việc trích xuất và tải file PDF với hàng đợi (Queue) thông minh.
5. Tải file CSV chứa danh sách trích dẫn hoặc nhấn "Copy All".

<h3 id="-tính-năng-chính">✨ Tính năng chính</h3>

- 🔍 **Nhận diện thông minh**: Bóc tách chính xác DOI từ đoạn text hỗn độn.
- 📚 **Trích dẫn Vancouver**: Tự động format chuẩn Vancouver có chứa link DOI.
- ⚡ **Cache IndexedDB**: Lưu trữ cục bộ giúp truy xuất lại lập tức không tốn quota API.
- ⬇️ **Bulk Download**: Hỗ trợ Queue tải nhiều PDF cùng lúc, tự động bypass/gom link nếu gặp lỗi CORS để tải thủ công.
- 🌓 **Giao diện**: Tailwind Dark/Light mode + Hỗ trợ Đa ngôn ngữ (Anh/Việt).
- 🕒 **History**: Quản lý các phiên làm việc cũ (Projects).

<h3 id="-kiến-trúc">🏗️ Kiến trúc</h3>

Sử dụng phương pháp **Zero-Build**:
- HTML + Tailwind CDN cho layout.
- Vue 3 CDN (Options API) quản lý trạng thái.
- File JS tách module: `00_model.js`, `01_api.js`, `02_view.js`, `03_main.js`, `i18n.js`.
Kiến trúc này cho phép chỉnh sửa nhanh chóng và deploy tức thì mà không cần cài đặt Node.js. Xem thêm chi tiết đánh giá kiến trúc tại `SPEC.md`.

<h3 id="-changelog-vi">📝 Changelog</h3>

Xem chi tiết các thay đổi tại [CHANGELOG.md](./CHANGELOG.md).
