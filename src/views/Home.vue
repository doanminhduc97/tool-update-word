<template>
  <section class="editor">
    <h2>Chinh sua file word tu link</h2>
    <!-- Input link -->
    <div class="field">
      <label for="link">Google Drive / One Drive</label>
      <input type="url" id="link" v-model="docLink" placeholder="https://drive.google.com/..." @keyup.enter="loadDocument">
      <button @click="loadDocument" :disabled="loading">Tải File</button>
    </div>
    <!-- STATUS -->
    <p v-if="loading" class="status">Đang tải và phân tích file...</p>
    <!-- PREVIEW (mammoth)-->
    <section v-if="previewHtml" class="preview">
      <h3>Preview hiện tại</h3>
      <div v-html="previewHtml" class="docx-preview"></div>
    </section>
    <!-- FORM chỉnh sửa -->
    <section v-if="placeholders.length" class="edit-form">
      <h3>Thông tin cập nhật</h3>
      <form @submit.prevent="applyChanges">
        <div v-for="ph in placeholders" :key="ph" class="form-group">
          <label :for="ph">{{ ph }}</label>
          <input type="text" :id="ph" v-model="formValues[ph]" required>
        </div>
        <button type="submit" :disabled="updating">{{ updating ? 'Đang tạo file...' : 'Tạo file mới' }}</button>
      </form>
    </section>
    <!-- Download link -->
    <section v-if="downloadUrl" class="download">
      <h3>File mới đã sẵn sàng</h3>
      <a :href="downloadUrl" download="updated.docx" class="btn-download">Tải file</a>
    </section>
  </section>
</template>
<script setup>
import { ref, reactive } from "vue";
import mammoth from 'mammoth';
import PizZip from 'pizzip';
import Docxtemplater from  'docxtemplater';
import { saveAs } from 'file-saver';
import { fetchWordFile } from "@/api/drive";
import JSZip from "jszip";
// import { uploadWordFile } from "@/api/upload"

// STATE
const docLink = ref('');
const loading = ref(false);
const updating = ref(false);
const previewHtml = ref('');
const downloadUrl = ref('');
const placeholders = ref([]);
const formValues = ref({});

// HELPERS
function resetAll() {
  previewHtml.value = '';
  downloadUrl.value = '';
  placeholders.value = [];
  Object.keys(formValues).forEach(k => delete formValues[k]);
}

// Load File
async function loadDocument() {
  if (!docLink.value) return alert('Vui Lòng Nhập Link!');
  loading.value = true;
  resetAll();
  try {
    // Lấy file Blob từ link
    const blob = await fetchWordFile(docLink.value);

    // Preview bằng mammoth
    const arrayBuffer = await blob.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const { value: html } = await mammoth.convertToHtml({ zip });
    // console.log(await mammoth.convertToHtml({ arrayBuffer: arrayBuffer }))
    // previewHtml.value = html;

    // // Lấy danh sách {{ placeholder }}
    // const zip = new PizZip(arrayBuffer);
    // const doc = new Docxtemplater(zip, {
    //   paragraphLoop: true,
    //   linebreaks: true,
    // });

    // // Lấy toàn bộ text (có placeholder) và regex tìm {{ xxx }}
    // const rawText = doc.getFullText();
    // const matches = rawText.match(/{{\s*([^}]+)\s*}}/g) || [];
    // const uniq = [...new Set(matches.map(m => m.replace(/[{}]/g, '').trim()))];
    // placeholders.value = uniq;

    // // Khởi tạo giá trị mặc định rỗng cho form
    // uniq.forEach(key => (formValues[key] = ''));
  } catch (error) {
    console.log(error);
    alert("Lỗi khi tải hoặc phân tích file: " + error.message);
  } finally {
    loading.value = false;
  }
}

// APPLY CHANGES
async function applyChanges() {
  if (!placeholders.value.length) return;
  updating.value = true;
  try {
    // Lấy lại file gốc (đảm bảo không dùng file đã bị thay đổi)
    const blob = await fetchWordFile(docLink.value);
    const arrayBuffer = await blob.arrayBuffer();

    const zip = new PizZip(arrayBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Thay thế giá trị
    doc.render(formValues);

    // Tạo blob .docx mới
    const outBlob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    // Tạo url để người dùng tải về
    const url = URL.createObjectURL(outBlob);
    downloadUrl.value = url;

    // (Tùy chọn) mở hộp thoại Save As ngay lập tức
    saveAs(outBlob, 'updated.docx');
  } catch (error) {
    console.log(error);
    alert("không thể tạo file: " + error.message);
  } finally {
    updating.value = false;
  }
}
</script>
<style lang="scss">
  .editor {
    max-width: 800px;
    margin: 2rem auto;
    font-family: system-ui sans-serif;
    padding: 1rem;

    .field {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      input {
        flex: 1;
        padding: 0.4rem;
      }
      button {
        padding: 0.4rem 1rem;
      }
    }
    .status {
      font-style: italic;
      color: #555;
    }
    .preview {
      margin-top: 1.5rem;
      border: 1px solid #e0e0e0;
      background: #fafafa;
      padding: 1rem;

      .docx-preview img {
        max-width: 100%;
      }
    }
    .edit-form {
      margin-top: 2rem;
      .form-group {
        margin-bottom: 0.8rem;

        label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.2rem;
        }
        input {
          width: 100%;
          padding: 0.3rem;
        }
      }
      button {
        margin-top: 0.5rem;
        padding: 0.4rem 1rem;
      }
    }
    .download {
      margin-top: 2rem;

      .btn-download {
        background: #1976d2;
        color: #fff;
        padding: 0.6rem 1.2rem;
        text-decoration: none;
        border-radius: 4px;
        &:hover {
          background: #1565c0;
        }
      }
    }
  }
</style>