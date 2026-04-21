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
        <!-- <section v-if="previewHtml" class="preview">
          <h3 class="title-form">Preview hiện tại</h3>
          <div v-html="previewHtml" class="docx-preview"></div>
        </section> -->
        <!-- FORM chỉnh sửa -->
        <section v-if="placeholders5.length" class="edit-form">
          <h3 class="title-form">Thông tin Chung của các file</h3>
          <form>
            <div v-for="ph in placeholders5" :key="ph" class="form-group">
              <label :for="ph">{{ ph }}</label>
              <input type="text" :id="ph" v-model="formValues5[ph]" required>
            </div>
            <button :disabled="updating" @click="applyChanges()">{{ updating ? 'Đang tạo file...' : 'Tạo file mới' }}</button>
          </form>
        </section>
        <section v-if="placeholders.length" class="edit-form">
          <h3 class="title-form">Thông tin file(Điều lệ.docx)</h3>
          <form>
            <div v-for="ph in placeholders" :key="ph" class="form-group">
              <label :for="ph">{{ ph }}</label>
              <input type="text" :id="ph" v-model="formValues[ph]" required>
            </div>
          </form>
        </section>
        <section v-if="placeholders2.length" class="edit-form">
          <h3 class="title-form">Thông tin file(GĐN đăng ký doanh nghiệp.docx)</h3>
          <form>
            <div v-for="ph in placeholders2" :key="ph" class="form-group">
              <label :for="ph">{{ ph }}</label>
              <input type="text" :id="ph" v-model="formValues2[ph]" required>
            </div>
          </form>
        </section>
        <section v-if="placeholders3.length" class="edit-form">
          <h3 class="title-form">Thông tin file(Giấy ủy quyền.docx)</h3>
          <form>
            <div v-for="ph in placeholders3" :key="ph" class="form-group">
              <label :for="ph">{{ ph }}</label>
              <input type="text" :id="ph" v-model="formValues3[ph]" required>
            </div>
          </form>
        </section>
        <section v-if="placeholders4.length" class="edit-form">
          <h3 class="title-form">Thông tin file(DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI CỦA DOANH NGHIỆP.docx)</h3>
          <form>
            <div v-for="ph in placeholders4" :key="ph" class="form-group">
              <label :for="ph">{{ ph }}</label>
              <input type="text" :id="ph" v-model="formValues4[ph]" required>
            </div>
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
      docLink: 'https://docs.google.com/document/d/1LmxHi_27COvkOnvk-_1sea9iCnBLhbtM/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      link1: 'https://docs.google.com/document/d/1ZeslPYMNwXKrThmUovvDFg4LfjNAlLhL/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      link2: 'https://docs.google.com/document/d/1YzqneGER0Ka24MNSZPUw1-ZXCc_NHdSS/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      link3: 'https://docs.google.com/document/d/1l8UnC6ANaxXUDi2hq0swL6Ce3eRxJz1k/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      loading: false,
      updating: false,
      previewHtml: '',
      downloadUrl: '',
      placeholders: [],
      placeholders2: [],
      placeholders3: [],
      placeholders4: [],
      placeholders5: [],
      formValues: {},
      formValues2: {},
      formValues3: {},
      formValues4: {},
      formValues5: {},
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

        // START file Điều lệ.docx
        const res1 = await gapi.client.drive.files.get(
          {
            fileId: this.fileId,
            alt: "media",
          },
          {
            responseType: "arraybuffer",
          }
        );

        const buffer = res1.body;

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

        // END file Điều lệ.docx

        // START 2. GĐN đăng ký doanh nghiệp.docx
        let fileId = this.extractDocId(this.link1);
        const res2 = await gapi.client.drive.files.get(
          {
            fileId: fileId,
            alt: "media",
          },
          {
            responseType: "arraybuffer",
          }
        );

        const buffer2 = res2.body;

        // ✅ Đọc placeholder
        const zip2 = new PizZip(buffer2);
        
        const doc2 = new Docxtemplater(zip2, {
          paragraphLoop: true,
          linebreaks: true,
        });
        
        const rawText2 = doc2.getFullText();
        
        const matches2 = rawText2.match(/\$\$\s*([^$]+?)\s*\$\$/g) || [];
        
        const uniq2 = [
          ...new Set(
            matches2.map(m => m.replace(/\$\$/g, '').trim())
          ),
        ];
        
        // END 2. GĐN đăng ký doanh nghiệp.docx

        // START 3. Giấy ủy quyền.docx
        let fileId2 = this.extractDocId(this.link2);
        const res3 = await gapi.client.drive.files.get(
          {
            fileId: fileId2,
            alt: "media",
          },
          {
            responseType: "arraybuffer",
          }
        );

        const buffer3 = res3.body;
        // ✅ Đọc placeholder
        const zip3 = new PizZip(buffer3);
        
        const doc3 = new Docxtemplater(zip3, {
          paragraphLoop: true,
          linebreaks: true,
        });
        
        const rawText3 = doc3.getFullText();
        
        const matches3 = rawText3.match(/\$\$\s*([^$]+?)\s*\$\$/g) || [];

        const uniq3 = [
          ...new Set(
            matches3.map(m => m.replace(/\$\$/g, '').trim())
          ),
        ];

        // END 3. Giấy ủy quyền.docx

        // START 4. DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI CỦA DOANH NGHIỆP

        let fileId3 = this.extractDocId(this.link3);
        const res4 = await gapi.client.drive.files.get(
          {
            fileId: fileId3,
            alt: "media",
          },
          {
            responseType: "arraybuffer",
          }
        );

        const buffer4 = res4.body;
        // ✅ Đọc placeholder
        const zip4 = new PizZip(buffer4);
        
        const doc4 = new Docxtemplater(zip4, {
          paragraphLoop: true,
          linebreaks: true,
        });
        
        const rawText4 = doc4.getFullText();
        
        const matches4 = rawText4.match(/\$\$\s*([^$]+?)\s*\$\$/g) || [];

        const uniq4 = [
          ...new Set(
            matches4.map(m => m.replace(/\$\$/g, '').trim())
          ),
        ];
        // END 4. DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI CỦA DOANH NGHIỆP
        
        const {commonAtLeast2, uniqueByArray} = this.analyzeArrays([uniq, uniq2, uniq3, uniq4]);
        // console.log(same, uniqueByArray);
        console.log(uniq, uniq2, uniq3, uniq4);
        
        commonAtLeast2.forEach(key => (this.formValues5[key] = ''));
        uniqueByArray[0].forEach(key => (this.formValues[key] = ''));
        uniqueByArray[1].forEach(key => (this.formValues2[key] = ''));
        uniqueByArray[2].forEach(key => (this.formValues3[key] = ''));
        uniqueByArray[3].forEach(key => (this.formValues4[key] = ''));
        this.placeholders = uniqueByArray[0];
        this.placeholders2 = uniqueByArray[1];
        this.placeholders3 = uniqueByArray[2];
        this.placeholders4 = uniqueByArray[3];
        this.placeholders5 = commonAtLeast2;

      } catch (error) {
        alert("Lỗi khi tải hoặc phân tích file: " + error.message);
      } finally {
        this.loading = false;
      }
    },
    analyzeArrays(arrays) {
      const countMap = new Map();

      // Đếm số mảng chứa mỗi phần tử
      arrays.forEach(arr => {
        [...new Set(arr)].forEach(item => {
          countMap.set(item, (countMap.get(item) || 0) + 1);
        });
      });

      // 1. Xuất hiện từ 2 mảng trở lên
      const commonAtLeast2 = [...countMap]
        .filter(([_, count]) => count >= 2)
        .map(([item]) => item);

      // 2. Phần tử riêng từng mảng (chỉ xuất hiện 1 lần)
      const uniqueByArray = arrays.map(arr => {
        return [...new Set(arr)].filter(item => countMap.get(item) === 1);
      });

      return {
        commonAtLeast2,
        uniqueByArray
      };
    },
    async getFile1() {
      try {
        

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