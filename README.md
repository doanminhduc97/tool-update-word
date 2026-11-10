# vue-project

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Quy chuẩn phát triển chức năng (Pháp lý & Kỹ thuật)

### 1. Chuẩn hoá Font chữ xuất file Word (Times New Roman 100%)
- Mọi chức năng xuất `.docx` bắt buộc gọi `enforceTimesNewRoman(doc.getZip())` trong `renderToBlob(doc, data)`. Import từ `@/lib/fontHelper`.

### 2. Trường Giới tính (Radio Nam / Nữ)
- Tất cả các trường liên quan đến giới tính đều dùng component `<GenderRadio :name="..." v-model="..." />`.
- Luôn đặt giá trị khởi tạo mặc định là `"Nam"`.

### 3. Quy chuẩn lọc file "DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI CỦA DOANH NGHIỆP"
- **Căn cứ pháp lý:** Căn cứ quy định về phòng chống rửa tiền và đăng ký doanh nghiệp, chỉ cá nhân nắm giữ **từ 25% trở lên** mới được coi là Chủ sở hữu hưởng lợi (CSH hưởng lợi).
- **Cơ chế lọc theo loại hình:**
  - **Công ty TNHH (1TV, 2TV, Nhiều TV...):** Căn cứ **Tỷ lệ sở hữu vốn điều lệ (Cột 9 & 11)**, chỉ cá nhân đạt **>= 25%** mới được hiển thị. Cá nhân có tỉ lệ < 25% sẽ tự động bị loại bỏ cả hàng khỏi file Word.
  - **Công ty Cổ phần:** Căn cứ **Tỷ lệ sở hữu cổ phần có quyền biểu quyết (Cột 12 & 14)**, chỉ cổ đông đạt **>= 25%** mới được hiển thị.
- **Cách áp dụng khi code view mới:**
  ```javascript
  import { filterCshHuongLoiList } from '@/lib/cshHelper';

  // Lọc riêng cho file CSH hưởng lợi
  const listUserCsh = filterCshHuongLoiList(listUser, 'von'); // hoặc 'cophan' / 'auto'
  ```
- **Lưu ý:** Chỉ áp dụng bộ lọc đối với file *DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI*. Toàn bộ các văn bản khác trong cùng bộ hồ sơ (Điều lệ, Giấy đề nghị, Danh sách thành viên/cổ đông...) **bắt buộc giữ nguyên 100% tất cả thành viên/cổ đông**.

