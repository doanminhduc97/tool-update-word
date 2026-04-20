<template>
  <div class="editor">
    <!-- <button v-if="!tokenClient" @click="login">Login</button> -->
    <section>
      <!-- Input link -->
      <div class="field">
        <input type="url" id="link" v-model="docLink" placeholder="https://drive.google.com/..." @keyup.enter="getFile">
        <button @click="getFile" :disabled="loading">Tải File</button>
      </div>
      <!-- STATUS -->
      <p v-if="loading" class="status">Đang tải và phân tích file...</p>
      <div class="wrapper">
        <!-- PREVIEW (mammoth)-->
        <section v-if="previewHtml" class="preview">
          <h3 class="title-form">Preview hiện tại</h3>
          <div v-html="previewHtml" class="docx-preview"></div>
        </section>
        <!-- FORM chỉnh sửa -->
        <section v-if="placeholders.length" class="edit-form">
          <h3 class="title-form">Thông tin cập nhật</h3>
          <form @submit.prevent="applyChanges">
            <div v-for="ph in placeholders" :key="ph" class="form-group">
              <label :for="ph">{{ ph }}</label>
              <input type="text" :id="ph" v-model="formValues[ph]" required>
            </div>
            <div class="form-group">
              <label for="nameFile"> Tạo tên file </label>
              <input type="text" id="nameFile" v-model="nameFile">
            </div>
            <button type="submit" :disabled="updating">{{ updating ? 'Đang tạo file...' : 'Tạo file mới' }}</button>
          </form>
        </section>
      </div>
      <!-- Download link -->
      <section v-if="downloadUrl" class="download">
        <h3>File mới đã sẵn sàng</h3>
        <a :href="downloadUrl" download="updated.docx" class="btn-download">Tải file</a>
      </section>
    </section>
    <!-- <button @click="getFile">Get File</button> -->

    <!-- <textarea v-model="fileContent" rows="10" cols="50"></textarea> -->
  </div>
</template>
<script>
const CLIENT_ID = "735739572072-i6e10mu5530gmqa21e1bt3iffperiit8.apps.googleusercontent.com";
const API_KEY = "AIzaSyA1_t274mJWSiJ--Fosg0bVxylPX1AV4Tw";
const SCOPES = "https://www.googleapis.com/auth/drive.readonly";
import mammoth from 'mammoth';
import PizZip from 'pizzip';
import Docxtemplater from  'docxtemplater';
import { saveAs } from 'file-saver';
export default {
  data() {
    return {
      fileId: "",
      fileContent: "",
      docLink: '',
      loading: false,
      updating: false,
      previewHtml: '',
      downloadUrl: '',
      placeholders: [],
      formValues: {},
      nameFile: 'updated',
      // tokenClient: null,
    };
  },

  mounted() {
    this.initGapi();
    this.initAuth();
  },

  methods: {
    async initGapi() {
      await new Promise((resolve) => {
        gapi.load("client", resolve);
      });

      await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
        ],
      });
    },

    initAuth() {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (resp) => {
          gapi.client.setToken({
            access_token: resp.access_token,
          });
        },
      });
    },

    // login() {
    //   this.tokenClient.requestAccessToken();
    // },
    async getFile() {
      if (!this.docLink) return alert('Vui Lòng Nhập Link!');
      if (this.docLink) {
        this.fileId = this.extractDocId(this.docLink);
      }
      this.loading = true;
      this.resetAll();

      try {
        const res = await gapi.client.drive.files.get(
          {
            fileId: this.fileId,
            alt: "media",
          },
          {
            responseType: "arraybuffer",
          }
        );

        const buffer = res.body;

        // ✅ Preview HTML
        const { value: html } = await mammoth.convertToHtml({
          arrayBuffer: buffer,
        });
        this.previewHtml = html;

        // ✅ Đọc placeholder
        const zip = new PizZip(buffer);
        
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        });
        
        const rawText = doc.getFullText();
        
        const matches = rawText.match(/\$\$\s*([^$]+?)\s*\$\$/g) || [];

        const uniq = [
          ...new Set(
            matches.map(m => m.replace(/\$\$/g, '').trim())
          ),
        ];

        this.placeholders = uniq;
        console.log("this.placeholders", this.placeholders);
        
        uniq.forEach(key => (this.formValues[key] = ''));

      } catch (error) {
        alert("Lỗi khi tải hoặc phân tích file: " + error.message);
      } finally {
        this.loading = false;
      }
    },
    resetAll() {
      this.previewHtml = '';
      this.downloadUrl = '';
      this.placeholders = [];
      Object.keys(this.formValues).forEach(k => delete this.formValues[k]);
    },
    // APPLY CHANGES
    async applyChanges() {
      if (!this.placeholders.length) return;
      this.updating = true;
      try {
        // Lấy lại file gốc (đảm bảo không dùng file đã bị thay đổi)
        const res = await gapi.client.drive.files.get(
              {
                fileId: this.fileId,
                alt: "media",
              },
              {
                responseType: "arraybuffer",
              }
            );

          const buffer = res.body;
        // const arrayBuffer = await blob.arrayBuffer();

        const zip = new PizZip(buffer);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
          delimiters: {
            start: "$$",
            end: "$$",
          },
        });

        // Thay thế giá trị
        doc.render(this.formValues);

        // Tạo blob .docx mới
        const outBlob = doc.getZip().generate({
          type: 'blob',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        // Tạo url để người dùng tải về
        const url = URL.createObjectURL(outBlob);
        this.downloadUrl = url;

        // (Tùy chọn) mở hộp thoại Save As ngay lập tức
        saveAs(outBlob, this.nameFile + '.docx');
      } catch (error) {
        alert("không thể tạo file: " + error.message);
      } finally {
        this.updating = false;
      }
    },
    extractDocId(url) {
      const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : null;
    }
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
    .wrapper {
      .edit-form {
        margin-left: 30px;
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
  }
  .wrapper {
    display: flex;
    justify-content: space-between;
  }
  .title-form {
    width: 300px;
    font-size: 18px;
    font-weight: 700;
  }
</style>