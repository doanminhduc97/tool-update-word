<template>
  <div class="editor">
    <section v-if="placeholdersCommon.length" class="card common-card">
      <h3 class="title-form">Thông tin chung các file</h3>
      <form>
        <div v-for="ph in placeholdersCommon" :key="'c-' + ph" class="form-group">
          <label :for="'c-' + ph">{{ ph }}</label>
          <input type="text" :id="'c-' + ph" v-model="formValuesCommon[ph]" required>
        </div>
      </form>
    </section>
    <section v-for="(file, i) in filesWithPlaceholders" :key="file.name" class="card file-card">
      <h3 class="title-form">Thông Tin File ({{ file.name }}.docx)</h3>
      <form>
        <div v-for="ph in file.placeholders" :key="'f' + i + '-' + ph" class="form-group">
          <label :for="'f' + i + '-' + ph">{{ ph }}</label>
          <input type="text" :id="'f' + i + '-' + ph" v-model="file.formValues[ph]" required>
        </div>
      </form>
    </section>
    <section v-if="placeholdersCommon.length || filesWithPlaceholders.length" class="btn-group">
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
    const files = [
      {
        name: '1. Quyết định của Chủ sở hữu',
        link: 'https://docs.google.com/document/d/1xqWzNJCFUshlgyMuM-E6CkBJX1HEwfey/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      },
      {
        name: '01. TB giải thể',
        link: 'https://docs.google.com/document/d/1rA_LzQUh8qbA_p0TJE66D67evWVOOqGd/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      },
      {
        name: '02. Biên bản thanh lý tài sản',
        link: 'https://docs.google.com/document/d/16vXRN5p-uG2LhboGAGNl-uS8DoEsyU0z/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      },
      {
        name: '2. Đề nghị chấm dứt hiệu lực MST',
        link: 'https://docs.google.com/document/d/1gHnR5Y2xCtWaBMoohPu1QKsW9XCCxfoO/edit?usp=sharing&ouid=107831693588829116850&rtpof=true&sd=true',
      },
      {
        name: '03. Danh sách nợ',
        link: 'https://docs.google.com/document/d/1Sidznh7UH2kq8HPaPRIz3Cd_zJ8H4A3T/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      },
      {
        name: '3. Giấy giới thiệu',
        link: 'https://docs.google.com/document/d/1Ka5qtPGmeAdu_AStSVbZjcuQIGC25tDS/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      },
      {
        name: '4. Công văn xác nhận không nợ thuế xuất nhập khẩu',
        link: 'https://docs.google.com/document/d/1qqzLKR8BWUnZAsfhE4M0P49PmcAQ6lOn/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      },
      {
        name: '04. GUQ',
        link: 'https://docs.google.com/document/d/1kkrYO8DuUB6TboFy3MhCHn4suTcCtb2w/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      },
      {
        name: '6. CÔNG VĂN XIN CẤP LẠI MẬT KHẨU',
        link: 'https://docs.google.com/document/d/1iO54iI43a-AJnT50EOOkysuB0j6Qcpxa/edit?usp=sharing&ouid=107831693588829116850&rtpof=true&sd=true',
      },
      {
        name: '7. Công văn khôi phục tk Hóa đơn điện tử',
        link: 'https://docs.google.com/document/d/1c2nH8Z6wg8eIIxJkXKQyFkKsYXO1cPyT/edit?usp=sharing&ouid=107831693588829116850&rtpof=true&sd=true',
      },
      {
        name: 'Hướng dẫn ký hồ sơ',
        link: 'https://docs.google.com/document/d/1Qxx2biFk9W_t5r0GvDnuVe-mjourh5Fw/edit?usp=sharing&ouid=107831693588829116850&rtpof=true&sd=true',
      },
    ].map(f => ({
      ...f,
      placeholders: [],
      allPlaceholders: [],
      formValues: {},
    }));
    return {
      files,
      placeholdersCommon: [],
      formValuesCommon: {},
      updating: false,
    };
  },

  computed: {
    filesWithPlaceholders() {
      return this.files.filter(f => f.placeholders.length > 0);
    },
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
        const arrays = await Promise.all(
          this.files.map(f => this.getPlaceholdersFromDoc(f.link))
        );
        const { commonAtLeast2, uniqueByArray } = this.analyzeArrays(arrays);

        this.files.forEach((f, i) => {
          f.allPlaceholders = arrays[i];
          f.placeholders = this.sortCustom(uniqueByArray[i]);
          f.formValues = {};
          uniqueByArray[i].forEach(key => {
            f.formValues[key] = '';
          });
        });

        this.placeholdersCommon = this.sortCustom(commonAtLeast2);
        this.formValuesCommon = {};
        this.placeholdersCommon.forEach(key => {
          this.formValuesCommon[key] = '';
        });
      } catch (error) {
        alert("Lỗi khi tải hoặc phân tích file: " + error.message);
      } finally {
        loading.style.display = "none";
      }
    },
    async getPlaceholdersFromDoc(link) {
      const fileId = this.extractDocId(link);

      const buffer = await this.fetchDocxBuffer(fileId);

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

      arrays.forEach(arr => {
        [...new Set(arr)].forEach(item => {
          countMap.set(item, (countMap.get(item) || 0) + 1);
        });
      });

      const commonAtLeast2 = [...countMap]
        .filter(([_, count]) => count >= 2)
        .map(([item]) => item);

      const uniqueByArray = arrays.map(arr => {
        return [...new Set(arr)].filter(item => countMap.get(item) === 1);
      });

      return {
        commonAtLeast2,
        uniqueByArray
      };
    },
    resetAll() {
      this.files.forEach(f => {
        Object.keys(f.formValues).forEach(k => (f.formValues[k] = ''));
      });
      Object.keys(this.formValuesCommon).forEach(k => (this.formValuesCommon[k] = ''));
    },
    // APPLY CHANGES
    async applyChanges() {
      const loading = document.getElementById("loading-overlay");
      loading.style.display = "flex";
      this.updating = true;
      try {
        const buffers = await Promise.all(
          this.files.map(f => this.fetchDocBuffer(this.extractDocId(f.link)))
        );

        const docs = buffers.map(buffer => this.createDoc(buffer));

        const renderDataList = this.files.map(file => ({
          ...this.formValuesCommon,
          ...file.formValues,
        }));

        const outBlobs = docs.map((doc, i) => this.renderToBlob(doc, renderDataList[i]));

        this.files.forEach((file, i) => {
          const url = URL.createObjectURL(outBlobs[i]);
          const link = document.createElement('a');
          link.href = url;
          link.download = file.name + ".docx";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      } catch (error) {
        alert("không thể tạo file: " + error.message);
        console.log(JSON.stringify(error, null, 2));
        console.log(error.properties && error.properties.errors);
      } finally {
        this.updating = false;
        loading.style.display = "none";
      }
    },
    async fetchDocxBuffer(fileId) {
      let buffer;
      // Ưu tiên tải qua Drive API (alt: media) - đúng cách app đang dùng
      const res = await gapi.client.drive.files.get(
        { fileId, alt: "media" },
        { responseType: "arraybuffer" }
      );
      buffer = res.body;

      if (!this.isValidDocx(buffer)) {
        // File gốc là .doc cũ (msword) hoặc zip không đủ -> Google không trả docx
        // qua alt:media. Fallback: tải bản export docx từ Google Docs.
        const exportRes = await fetch(
          `https://docs.google.com/document/d/${fileId}/export?format=docx`
        );
        if (!exportRes.ok) {
          throw new Error(`Không tải được bản docx của file ${fileId} (HTTP ${exportRes.status})`);
        }
        buffer = await exportRes.arrayBuffer();
      }

      if (!this.isValidDocx(buffer)) {
        throw new Error(`File ${fileId} không phải file docx hợp lệ`);
      }
      return buffer;
    },
    isValidDocx(buffer) {
      try {
        const zip = new PizZip(buffer);
        return !!(zip.files && zip.files['word/document.xml']);
      } catch (e) {
        return false;
      }
    },
    async fetchDocBuffer(fileId) {
      return this.fetchDocxBuffer(fileId);
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
