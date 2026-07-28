<template>
  <div class="editor">
      <!-- <p v-if="loading" class="status">Đang tải và phân tích file...</p> -->
    <!-- <button v-if="!tokenClient" @click="login">Login</button> -->
    <div class="field">
      <!-- <input type="url" disabled id="link" v-model="docLink" placeholder="https://drive.google.com/..." @keyup.enter="getFile"> -->
      <!-- <button @click="getFile" :disabled="loading">Tải File</button>/ -->
    </div>
    <section style="display: flex; padding: 12px;">
      <!-- Input link -->
      <!-- STATUS -->
      <div class="wrapper">
        <!-- PREVIEW (mammoth)-->
        <!-- <section v-if="previewHtml" class="preview">
          <h3 class="title-form">Preview hiện tại</h3>
          <div v-html="previewHtml" class="docx-preview"></div>
        </section> -->
        <!-- FORM chỉnh sửa -->
        <section v-if="placeholdersCommon.length" class="edit-form" style="width: 564px;">
          <div style="display: flex;">
            <div style="margin-right: 12px;">
              <h3 class="title-form" style="height: 58px;">Thông tin chung các file</h3>
              <form>
                <div v-for="ph in placeholdersCommon" :key="ph" class="form-group">
                  <label :for="ph">{{ ph }}</label>
                  <input type="text" :id="ph" v-model="formValuesCommon[ph]" required>
                </div>
              </form>
            </div>
          </div>
        </section>
        <section v-if="placeholders1.length" class="edit-form">
          <h3 class="title-form">Thông Tin File(1. Quyết định của Chủ sở hữu.docx)</h3>
          <form>
            <div v-for="ph in placeholders" :key="ph" class="form-group">
              <label :for="ph">{{ ph }}</label>
              <input type="text" :id="ph" v-model="formValues1[ph]" required>
            </div>
          </form>
        </section>
        <section v-if="placeholders2.length" class="edit-form">
          <h3 class="title-form">Thông Tin File(01. TB giải thể.docx)</h3>
          <form>
            <div v-for="ph in placeholders2" :key="ph" class="form-group">
              <label :for="ph">{{ ph }}</label>
              <input type="text" :id="ph" v-model="formValues2[ph]" required>
            </div>
          </form>
        </section>
        <section v-if="placeholders3.length" class="edit-form">
          <h3 class="title-form">Thông Tin File(02. Biên bản thanh lý tài sản.docx)</h3>
          <form>
            <div v-for="ph in placeholders3" :key="ph" class="form-group">
              <label :for="ph">{{ ph }}</label>
              <input type="text" :id="ph" v-model="formValues3[ph]" required>
            </div>
          </form>
        </section>
        <section v-if="placeholders4.length" class="edit-form">
          <h3 class="title-form">Thông Tin File(02. Danh sách người lao động.docx)</h3>
          <form>
            <div v-for="ph in placeholders4" :key="ph" class="form-group">
              <label :for="ph">{{ ph }}</label>
              <input type="text" :id="ph" v-model="formValues4[ph]" required>
            </div>
          </form>
        </section>
        <section v-if="placeholders5.length" class="edit-form">
          <h3 class="title-form">Thông Tin File(2. Đề nghị chấm dứt hiệu lực MST.doc)</h3>
          <form>
            <div v-for="ph in placeholders5" :key="ph" class="form-group">
              <label :for="ph">{{ ph }}</label>
              <input type="text" :id="ph" v-model="formValues5[ph]" required>
            </div>
          </form>
        </section>
        <section v-if="placeholders6.length" class="edit-form">
          <h3 class="title-form">Thông Tin File(03. Danh sách nợ.docx)</h3>
          <form>
            <div v-for="ph in placeholders6" :key="ph" class="form-group">
              <label :for="ph">{{ ph }}</label>
              <input type="text" :id="ph" v-model="formValues6[ph]" required>
            </div>
          </form>
        </section>
        <section v-if="placeholders7.length" class="edit-form">
          <h3 class="title-form">Thông Tin File(3. Giấy giới thiệu.docx)</h3>
          <form>
            <div v-for="ph in placeholders7" :key="ph" class="form-group">
              <label :for="ph">{{ ph }}</label>
              <input type="text" :id="ph" v-model="formValues7[ph]" required>
            </div>
          </form>
        </section>
        <section v-if="placeholders8.length" class="edit-form">
          <h3 class="title-form">Thông Tin File(4. Công văn xác nhận không nợ thuế xuất nhập khẩu.docx)</h3>
          <form>
            <div v-for="ph in placeholders8" :key="ph" class="form-group">
              <label :for="ph">{{ ph }}</label>
              <input type="text" :id="ph" v-model="formValues8[ph]" required>
            </div>
          </form>
        </section>
        <section v-if="placeholders9.length" class="edit-form">
          <h3 class="title-form">Thông Tin File(04. GUQ.docx)</h3>
          <form>
            <div v-for="ph in placeholders9" :key="ph" class="form-group">
              <label :for="ph">{{ ph }}</label>
              <input type="text" :id="ph" v-model="formValues9[ph]" required>
            </div>
          </form>
        </section>
      </div>
    </section>
    <section v-if="placeholdersCommon.length" class="btn-group">
      <button @click="resetAll()" class="btn-refesh">Làm Mới</button>
      <button :disabled="updating" @click="applyChanges()" class="btn-primary">{{ updating ? 'Đang Tạo File...' : 'Tạo File Mới' }}</button>
    </section>
  </div>
</template>
<script>
const CLIENT_ID = "735739572072-i6e10mu5530gmqa21e1bt3iffperiit8.apps.googleusercontent.com";
const API_KEY = "AIzaSyA1_t274mJWSiJ--Fosg0bVxylPX1AV4Tw";
const SCOPES = "https://www.googleapis.com/auth/drive.readonly";
import PizZip from 'pizzip';
import Docxtemplater from  'docxtemplater';
export default {
  // Giải Thể
  data() {
    return {
      fileId: "",
      link1: 'https://docs.google.com/document/d/1xqWzNJCFUshlgyMuM-E6CkBJX1HEwfey/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      link2: 'https://docs.google.com/document/d/1rA_LzQUh8qbA_p0TJE66D67evWVOOqGd/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      link3: 'https://docs.google.com/document/d/16vXRN5p-uG2LhboGAGNl-uS8DoEsyU0z/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      link4: 'https://docs.google.com/document/d/1VAXVhNfpOhThoCov86-e5SGzkXZ3mWwz/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      link5: 'https://docs.google.com/document/d/1fha8vdIHwJgfdfbmWXyOAsYzvwPYIpYt/edit?usp=sharing&ouid=107831693588829116850&rtpof=true&sd=true',
      link6: 'https://docs.google.com/document/d/1Sidznh7UH2kq8HPaPRIz3Cd_zJ8H4A3T/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      link7: 'https://docs.google.com/document/d/1Ka5qtPGmeAdu_AStSVbZjcuQIGC25tDS/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      link8: 'https://docs.google.com/document/d/1qqzLKR8BWUnZAsfhE4M0P49PmcAQ6lOn/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      link9: 'https://docs.google.com/document/d/1kkrYO8DuUB6TboFy3MhCHn4suTcCtb2w/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      updating: false,
      previewHtml: '',
      downloadUrl: '',
      placeholders1: [],
      placeholders2: [],
      placeholders3: [],
      placeholders4: [],
      placeholders5: [],
      placeholders6: [],
      placeholders7: [],
      placeholders8: [],
      placeholders9: [],
      placeholdersCommon: [],
      formValues1: {},
      formValues2: {},
      formValues3: {},
      formValues4: {},
      formValues5: {},
      formValues6: {},
      formValues7: {},
      formValues8: {},
      formValues9: {},
      formValuesCommon: {},
      uniq1: [],
      uniq2: [],
      uniq3: [],
      uniq4: [],
      uniq5: [],
      uniq6: [],
      uniq7: [],
      uniq8: [],
      uniq9: [],
    };
  },

  async mounted() {
    await this.initGapi();
    await this.initAuth();
    await this.getFile();
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
    async getFile() {
      const loading = document.getElementById("loading-overlay");
      loading.style.display = "flex";
      try {
        const [uniq1, uniq2, uniq3, uniq4, uniq5, uniq6, uniq7, uniq8, uniq9] = await Promise.all([
          this.getPlaceholdersFromDoc(this.link1),
          this.getPlaceholdersFromDoc(this.link2),
          this.getPlaceholdersFromDoc(this.link3),
          this.getPlaceholdersFromDoc(this.link4),
          this.getPlaceholdersFromDoc(this.link5),
          this.getPlaceholdersFromDoc(this.link6),
          this.getPlaceholdersFromDoc(this.link7),
          this.getPlaceholdersFromDoc(this.link8),
          this.getPlaceholdersFromDoc(this.link9)
        ]);
        const {commonAtLeast2, uniqueByArray} = this.analyzeArrays([uniq1, uniq2, uniq3, uniq4, uniq5, uniq6, uniq7, uniq8, uniq9]);
        this.uniq1 = uniq1;
        this.uniq2 = uniq2;
        this.uniq3 = uniq3;
        this.uniq4 = uniq4;
        this.uniq5 = uniq5;
        this.uniq6 = uniq6;
        this.uniq7 = uniq7;
        this.uniq8 = uniq8;
        this.uniq9 = uniq9;

        commonAtLeast2.forEach(key => (this.formValuesCommon[key] = ''));
        uniqueByArray[0].forEach(key => (this.formValues[key] = ''));
        uniqueByArray[1].forEach(key => (this.formValues2[key] = ''));
        uniqueByArray[2].forEach(key => (this.formValues3[key] = ''));
        uniqueByArray[3].forEach(key => (this.formValues4[key] = ''));
        uniqueByArray[4].forEach(key => (this.formValues5[key] = ''));
        uniqueByArray[5].forEach(key => (this.formValues6[key] = ''));
        uniqueByArray[6].forEach(key => (this.formValues7[key] = ''));
        uniqueByArray[7].forEach(key => (this.formValues8[key] = ''));
        uniqueByArray[8].forEach(key => (this.formValues9[key] = ''));

        this.placeholders1 = uniqueByArray[0];
        this.placeholders2 = uniqueByArray[1];
        this.placeholders3 = uniqueByArray[2];
        this.placeholders4 = uniqueByArray[3];
        this.placeholders5 = uniqueByArray[4];
        this.placeholders6 = uniqueByArray[5];
        this.placeholders7 = uniqueByArray[6];
        this.placeholders8 = uniqueByArray[7];
        this.placeholders9 = uniqueByArray[8];
        this.placeholdersCommon = commonAtLeast2;
      } catch (error) {
        alert("Lỗi khi tải hoặc phân tích file: " + error.message);
      } finally {
        loading.style.display = "none";
      }
    },
    async getPlaceholdersFromDoc(link) {
      const fileId = this.extractDocId(link);

      const res = await gapi.client.drive.files.get(
        {
          fileId,
          alt: "media",
        },
        {
          responseType: "arraybuffer",
        }
      );

      const buffer = res.body;

      const zip = new PizZip(buffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      const rawText = doc.getFullText();

      const matches = rawText.match(/\[\s*([^[\]]+?)\s*\]/g) || [];

      return [
        ...new Set(
          matches.map(m => m.replace(/\[|\]/g, "").trim())
        ),
      ];
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
    resetAll() {
      Object.keys(this.formValues).forEach(k => this.formValues[k]='');
      Object.keys(this.formValues2).forEach(k => this.formValues2[k]='');
      Object.keys(this.formValues3).forEach(k => this.formValues3[k]='');
      Object.keys(this.formValues4).forEach(k => this.formValues4[k]='');
      Object.keys(this.formValuesCommon).forEach(k => this.formValuesCommon[k]='');
      this.nngd = false;
      this.nncxcq = false;
      this.nnth = false;
      this.bbqa = false;
      this.nnxd = false;
      this.nnmm = false;
      this.nnbbth = false;
    },
    // APPLY CHANGES
    async applyChanges() {
      const loading = document.getElementById("loading-overlay");
      loading.style.display = "flex";
      for (const key in this.formValuesCommon) {
        if (this.uniq1.indexOf(key) !== -1) {
          this.formValues1[key] = this.formValuesCommon[key];
        }
        if (this.uniq2.indexOf(key) !== -1) {
          this.formValues2[key] = this.formValuesCommon[key];
        }
        if (this.uniq3.indexOf(key) !== -1) {
          this.formValues3[key] = this.formValuesCommon[key];
        }
        if (this.uniq4.indexOf(key) !== -1) {
          this.formValues4[key] = this.formValuesCommon[key];
        }
        if (this.uniq5.indexOf(key) !== -1) {
          this.formValues5[key] = this.formValuesCommon[key];
        }
        if (this.uniq6.indexOf(key) !== -1) {
          this.formValues6[key] = this.formValuesCommon[key];
        }
        if (this.uniq7.indexOf(key) !== -1) {
          this.formValues7[key] = this.formValuesCommon[key];
        }
        if (this.uniq8.indexOf(key) !== -1) {
          this.formValues8[key] = this.formValuesCommon[key];
        }
        if (this.uniq9.indexOf(key) !== -1) {
          this.formValues9[key] = this.formValuesCommon[key];
        }
      }
      this.updating = true;
      try {
        // Lấy lại file gốc (đảm bảo không dùng file đã bị thay đổi)
        // extract fileId
        const ids = [
          this.extractDocId(this.link1),
          this.extractDocId(this.link2),
          this.extractDocId(this.link3),
          this.extractDocId(this.link4),
          this.extractDocId(this.link5),
          this.extractDocId(this.link6),
          this.extractDocId(this.link7),
          this.extractDocId(this.link8),
          this.extractDocId(this.link9)
        ];

        // fetch song song
        const [buffer1, buffer2, buffer3, buffer4, buffer5, buffer6, buffer7, buffer8, buffer9] = await Promise.all(
          ids.map(id => this.fetchDocBuffer(id))
        );
        // tạo doc
        const docs = [
          this.createDoc(buffer1),
          this.createDoc(buffer2),
          this.createDoc(buffer3),
          this.createDoc(buffer4),
          this.createDoc(buffer5),
          this.createDoc(buffer6),
          this.createDoc(buffer7),
          this.createDoc(buffer8),
          this.createDoc(buffer9)
        ];
        const [doc1, doc2, doc3, doc4, doc5, doc6, doc7, doc8, doc9] = docs;
        const outBlob1 = this.renderToBlob(doc1, this.formValues1);
        const outBlob2 = this.renderToBlob(doc2, this.formValues2);
        const outBlob3 = this.renderToBlob(doc3, this.formValues3);
        const outBlob4 = this.renderToBlob(doc4, this.formValues4);
        const outBlob5 = this.renderToBlob(doc5, this.formValues5);
        const outBlob6 = this.renderToBlob(doc6, this.formValues6);
        const outBlob7 = this.renderToBlob(doc7, this.formValues7);
        const outBlob8 = this.renderToBlob(doc8, this.formValues8);
        const outBlob9 = this.renderToBlob(doc9, this.formValues9);

        let fileArr = [
          {
            name: '1. Quyết định của Chủ sở hữu',
            data: outBlob1,
          },
          {
            name: '01. TB giải thể',
            data: outBlob2,
          },
          {
            name: '02. Biên bản thanh lý tài sản',
            data: outBlob3,
          },
          {
            name: '02. Danh sách người lao động',
            data: outBlob4,
          },
          {
            name: '2. Đề nghị chấm dứt hiệu lực MST',
            data: outBlob5,
          },
          {
            name: '03. Danh sách nợ',
            data: outBlob6,
          },
          {
            name: '3. Giấy giới thiệu',
            data: outBlob7,
          },
          {
            name: '4. Công văn xác nhận không nợ thuế xuất nhập khẩu',
            data: outBlob8,
          },
          {
            name: '04. GUQ',
            data: outBlob9,
          }
        ]
        fileArr.forEach(item => {
          // Tạo url để người dùng tải về
          const url = URL.createObjectURL(item.data);
          // this.downloadUrl = url;
          const link = document.createElement('a');
          link.href = url;
          link.download = item.name + ".docx";
          
          // Append to document (required for some browsers like Firefox)
          document.body.appendChild(link);
          
          // Trigger the click event
          link.click();
          
          // Clean up by removing the element from the DOM
          document.body.removeChild(link);
          // (Tùy chọn) mở hộp thoại Save As ngay lập tức
          // saveAs(item.data, item.name + '.docx');
        })
        // this.resetAll();
      } catch (error) {
        alert("không thể tạo file: " + error.message);
        console.log(JSON.stringify(error, null, 2));
        console.log(error.properties.errors);
      } finally {
        this.updating = false;
        loading.style.display = "none";
      }
    },
    async fetchDocBuffer(fileId) {
      const res = await gapi.client.drive.files.get(
        { fileId, alt: "media" },
        { responseType: "arraybuffer" }
      );
      return res.body;
    },

    createDoc(buffer) {
      const zip = new PizZip(buffer);
      return new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: "[",
          end: "]",
        },
      });
    },

    renderToBlob(doc, data) {
      doc.render(data);
      return doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
    },
    extractDocId(url) {
      const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : null;
    },
    sortCustom(arr) {
      return arr.sort((a, b) => {
        const prefixA = a.substring(0, 4);
        const prefixB = b.substring(0, 4);

        if (prefixA === prefixB) return a.localeCompare(b);
        return prefixA.localeCompare(prefixB);
      });
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
          width: 200px;
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
    width: 1024px;
  }
  .title-form {
    font-size: 18px;
    font-weight: 700;
  }
  .form-group1 {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  line-height: 36px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.checkbox {
  height: 18px;
  width: 18px;
  cursor: pointer;
}
.checkbox-item {
  gap: 8px;
  cursor: pointer;
  min-width: 300px;
  margin-left: 12px;
  font-size: 18px;

}
.btn-primary {
  height: 46px;
  align-items: center;
  background-color: #1991d1;
  color: #fff;
  outline: #1991d1;
  border: 1px solid #1991d1;
  font-size: 16px;
  padding: 6px;
  cursor: pointer;
}
.btn-group {
  display: flex;
  justify-content: end;
}
.btn-refesh {
  height: 46px;
  color: #727070;
  border: 1px solid #ccc;
  font-size: 16px;
  background-color: #fff;
  margin-right: 16px;
  width: 103px;
  cursor: pointer;
}
</style>