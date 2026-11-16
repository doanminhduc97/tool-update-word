# AGENT MANDATES & WORKFLOW PROTOCOLS FOR TOOL-UPDATE-WORD

Tài liệu này chứa các chỉ thị cốt lõi và bắt buộc đối với tất cả các Agent AI (antigravity, opencode, Claude Code) khi làm việc trên dự án **TUW (Tool Update Word)**.

---

## ⚡ NGUYÊN TẮC BẤT BIẾN: TỰ ĐỘNG CẬP NHẬT KIẾN THỨC & NGHIỆP VỤ

Mỗi khi có bất kỳ thay đổi nào (thêm mới, chỉnh sửa giao diện, cập nhật tính năng, sửa lỗi bugfix, hoặc bổ sung phân hệ hồ sơ pháp lý), **Agent BẮT BUỘC phải tự động cập nhật kiến thức & nghiệp vụ mới vào tài liệu đặc tả của Agent**:

### 1. Ba vị trí đồng bộ bắt buộc:
1. `C:\Users\ADMIN\.config\opencode\agent\tuw-agent.md` *(Global)*
2. `D:\PROJECT\tool-update-word\.opencode\agent\tuw-agent.md` *(Frontend repo)*
3. `D:\PROJECT\tool-update-word-be\.opencode\agent\tuw-agent.md` *(Backend repo)*

### 2. Quy trình chuẩn kết thúc công việc:
$$\text{Chỉnh sửa Code} \longrightarrow \text{Build/Test} \longrightarrow \textbf{Cập nhật tuw-agent.md (3 nơi)} \longrightarrow \text{Git Commit \& Push}$$

---

## 📋 TÓM TẮT CÁC QUY CHUẨN KỸ THUẬT CỐT LÕI CỦA DỰ ÁN

1. **Render Đồng bộ & Loading Đơn**:
   - Mọi trang (`Home.vue` $\rightarrow$ `Home18.vue`, `AdminUsers.vue`, `Profile.vue`) khởi tạo `pageLoading: true`.
   - Toàn bộ giao diện chính chỉ hiển thị khi API & tệp docx đã tải xong (`<template v-else>`).
   - Tuyệt đối **không** bật `#loading-overlay` trong hàm `getFile()`. Khi nạp trang chỉ hiển thị duy nhất `PageLoader`.
2. **Quy chuẩn hiển thị Word**:
   - Cột ngày sinh hẹp xoay dọc chữ 90 độ căn giữa (`rotateDobVertical: true`).
   - Cưỡng chế font chữ `Times New Roman` toàn diện (`enforceTimesNewRoman`).
3. **Lọc CSH hưởng lợi $\ge 25\%$**:
   - Hàm `filterCshHuongLoiList` lọc riêng cho biểu mẫu `DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI CỦA DOANH NGHIỆP`.
4. **Giao diện Người được ủy quyền (`Profile.vue`)**:
   - Không chứa tiền tố `(Login_*)` trên tiêu đề hoặc mô tả.
   - Nhóm 2 nút bấm thao tác nằm ngoài card, canh sát lề phải layout.
5. **Footer Bản quyền cố định**:
   - Cố định sát đáy màn hình (`position: fixed; bottom: 0;`).
   - `body` luôn có `padding-bottom: 55px;` để tránh che khuất nội dung.
