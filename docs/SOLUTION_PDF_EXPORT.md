# Kế hoạch & Giải pháp: Tính năng Xuất file Word / PDF tùy chọn (TUW)

> **Ngày tạo:** 18/11/2026  
> **Trạng thái:** Đã phê duyệt giải pháp — Sẵn sàng triển khai  
> **Dự án liên quan:** `tool-update-word` (Frontend) & `tool-update-word-be` (Backend)

---

## 1. Yêu cầu nghiệp vụ từ khách hàng
1. **Lựa chọn định dạng linh hoạt:** Cho phép người dùng chọn định dạng tải về cho từng file (Word `.docx` hoặc PDF `.pdf`). Mặc định ban đầu luôn là **Word (`.docx`)**.
2. **Đảm bảo tính chính xác & layout 100%:** Khi xuất PDF, tuyệt đối không bị mất dữ liệu, không sai lệch thông tin đã nhập vào form, không bị vỡ layout, lệch bảng biểu, thụt dòng hay ngắt trang (đáp ứng tiêu chuẩn nghiêm ngặt của Phòng ĐKKD - Sở Kế hoạch & Đầu tư / Sở Tài chính).

---

## 2. Kiến trúc giải pháp kỹ thuật (Architecture Solution)

### 2.1. Vấn đề với chuyển đổi Client-side thuần (HTML -> PDF):
- Hiện tại TUW tạo file Word bằng `docxtemplater` + `pizzip` từ template DOCX chuẩn.
- Nếu render sang HTML rồi chuyển sang PDF bằng `jspdf`/`html2pdf`/`mammoth`: **chắc chắn sẽ vỡ layout bảng biểu, thụt đầu dòng, quốc hiệu tiêu ngữ và chữ ký**.

### 2.2. Giải pháp cốt lõi: Render DOCX trước -> Convert sang PDF nguyên bản
- **Bước 1:** Dùng luồng hiện tại của `docxtemplater` để render ra file `.docx` hoàn chỉnh. Đảm bảo 100% placeholder được thay thế chính xác tuyệt đối.
- **Bước 2:** 
  - File nào user chọn **Word**: Tải trực tiếp `.docx`.
  - File nào user chọn **PDF**: Đưa file DOCX qua engine chuyển đổi tài liệu fidelity cao (LibreOffice/soffice headless qua API Backend `tool-update-word-be` hoặc WASM converter) để kết xuất PDF giữ nguyên từng pixel, căn lề, font chữ Times New Roman.

---

## 3. Thiết kế thành phần (Component & Service Design)

### 3.1. Frontend (`tool-update-word`)
1. **Component UI: `src/components/FileExportFormatSelector.vue`**
   - Đặt ngay trên cụm nút `[Làm Mới]` và `[Tạo File Mới]`.
   - Hiển thị danh sách các file trong hồ sơ sắp xuất.
   - Mỗi file có toggle/select giữa `DOCX` và `PDF` (mặc định `DOCX`).
   - Có 2 nút nhanh: `[Tất cả là Word (Mặc định)]` và `[Tất cả là PDF]`.
2. **Service Tải file chung: `src/services/fileExportService.js`**
   - Quản lý tải song song, xử lý chuyển đổi PDF nếu cần, tải về máy client và tự động trừ phí ví (`deductExportFee`).
3. **Module thí điểm:**
   - Triển khai đầu tiên trên **Module 1 (`Home.vue` - ĐKKD 1 thành viên)**.

### 3.2. Backend (`tool-update-word-be`)
- Endpoint chuyển đổi nếu dùng Server engine:
  - `POST /api/v1/convert/docx-to-pdf`
  - Nhận multipart/form-data hoặc base64 docx buffer -> trả về PDF buffer.

---

## 4. Kế hoạch triển khai từng bước (Checklist cho ngày tiếp theo)

- [ ] **Task 1:** Tạo component `FileExportFormatSelector.vue` trong `src/components/`.
- [ ] **Task 2:** Xây dựng service `fileExportService.js` xử lý logic đóng gói và download (DOCX/PDF).
- [ ] **Task 3:** Setup bộ chuyển đổi PDF (Endpoint Backend hoặc WASM) đảm bảo không vỡ layout bảng biểu.
- [ ] **Task 4:** Tích hợp thí điểm vào `Home.vue` (ĐKKD 1 thành viên), test xuất thực tế cả 2 định dạng Word và PDF.
- [ ] **Task 5:** Kiểm tra trực quan file PDF: font Times New Roman, căn lề trái 3cm, căn lề phải 2cm, bảng CSH hưởng lợi.
- [ ] **Task 6:** Nhân rộng ra các màn hình còn lại (`Home2.vue` -> `Home18.vue`).
