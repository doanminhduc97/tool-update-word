<template>
  <div class="editor">
    <div class="card common-card" style="margin-bottom: 24px; text-align: center;">
      <h2 style="font-size: 1.25rem; font-weight: 700; color: #0284c7;">{{ currentConfig.title }}</h2>
    </div>

    <!-- Form thông tin chung -->
    <section v-show="placeholdersCommon.length" class="card common-card">
      <h3 class="title-form">Thông Tin Chung Của Các File</h3>
      <form>
        <div v-for="ph in placeholdersCommon" :key="'c-' + ph" class="form-group">
          <label :for="'c-' + ph">{{ ph }}</label>
          <input type="text" :id="'c-' + ph" v-model="formValuesCommon[ph]" required>
        </div>
      </form>
    </section>

    <!-- Form riêng của từng file nếu có placeholder riêng -->
    <section v-for="(file, i) in filesWithPlaceholders" :key="file.name" class="card file-card">
      <h3 class="title-form">Thông Tin File ({{ file.name }}.docx)</h3>
      <form>
        <div v-for="ph in file.placeholders" :key="'f' + i + '-' + ph" class="form-group">
          <label :for="'f' + i + '-' + ph">{{ ph }}</label>
          <input type="text" :id="'f' + i + '-' + ph" v-model="file.formValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- Nhóm nút bấm -->
    <section v-show="placeholdersCommon.length || filesWithPlaceholders.length" class="btn-group">
      <button @click="resetAll()" class="btn-refesh">Làm Mới</button>
      <button :disabled="updating" @click="applyChanges()" class="btn-primary">
        {{ updating ? 'Đang Tạo File...' : 'Tạo File Mới' }}
      </button>
    </section>
  </div>
</template>

<script>
const CLIENT_ID = "735739572072-i6e10mu5530gmqa21e1bt3iffperiit8.apps.googleusercontent.com";
const API_KEY = "AIzaSyA1_t274mJWSiJ--Fosg0bVxylPX1AV4Tw";
const SCOPES = "https://www.googleapis.com/auth/drive.readonly";
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

const CONFIGS = {
  '1tv': {
    title: 'Hồ Sơ Tạm Ngừng Kinh Doanh - Công Ty 1 Thành Viên',
    specificFile: {
      name: '2. Quyết định của CSH',
      link: 'https://docs.google.com/document/d/1xX6D06U9OB_GI2Hc3nePcJxefOQmgEVd/edit?usp=sharing&ouid=107831693588829116850&rtpof=true&sd=true',
    }
  },
  '2tv': {
    title: 'Hồ Sơ Tạm Ngừng Kinh Doanh - Công Ty 2 Thành Viên Trở Lên',
    specificFile: {
      name: '2. Quyết định của HĐTV',
      link: 'https://docs.google.com/document/d/10kd6o75B4KgF3E4noYt8xgtSMzkHkmR-/edit?usp=sharing&ouid=107831693588829116850&rtpof=true&sd=true',
    }
  },
  'cp': {
    title: 'Hồ Sơ Tạm Ngừng Kinh Doanh - Công Ty Cổ Phần',
    specificFile: {
      name: '2. Quyết định của HĐQT',
      link: 'https://docs.google.com/document/d/14eaVjA9TqhLhndJNZBsmz5TnnvLQb431/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
    }
  }
};

const COMMON_FILES = [
  {
    name: '1. Thông báo tạm ngừng kinh doanh',
    link: 'https://docs.google.com/document/d/1rD3DzjwJ5o5jlfwRThUcRXnKPMPgaNF0/edit?usp=sharing&ouid=107831693588829116850&rtpof=true&sd=true',
  },
  {
    name: '3. Giấy ủy quyền',
    link: 'https://docs.google.com/document/d/1EfdQ1yFqu_jEtMR8rZYrhP7cPuZDun_8/edit?usp=sharing&ouid=107831693588829116850&rtpof=true&sd=true',
  },
  {
    name: 'Hướng dẫn ký hồ sơ',
    link: 'https://docs.google.com/document/d/10-ZVb_8bVIZXt3KaOJOEj6HVTviwiKQW/edit?usp=sharing&ouid=107831693588829116850&rtpof=true&sd=true',
  }
];

export default {
  name: 'Home7',
  props: {
    type: {
      type: String,
      default: '1tv'
    }
  },
  data() {
    return {
      files: [],
      placeholdersCommon: [],
      formValuesCommon: {},
      updating: false,
    };
  },

  computed: {
    currentConfig() {
      return CONFIGS[this.type] || CONFIGS['1tv'];
    },
    filesWithPlaceholders() {
      return this.files.filter(f => f.placeholders && f.placeholders.length > 0);
    },
  },

  watch: {
    type: {
      immediate: true,
      async handler() {
        this.initFiles();
        if (window.gapi && gapi.client && gapi.client.drive) {
          await this.getFile();
        }
      }
    }
  },

  async mounted() {
    await this.initGapi();
    await this.initAuth();
    await this.getFile();
  },

  methods: {
    initFiles() {
      const cfg = this.currentConfig;
      const rawList = [
        COMMON_FILES[0], // 1. Thông báo tạm ngừng kinh doanh
        cfg.specificFile, // 2. Quyết định
        COMMON_FILES[1], // 3. Giấy ủy quyền
        COMMON_FILES[2], // Hướng dẫn ký hồ sơ
      ];

      this.files = rawList.map(f => ({
        ...f,
        placeholders: [],
        allPlaceholders: [],
        formValues: {},
      }));
    },

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
      if (loading) loading.style.display = "flex";
      try {
        const arrays = await Promise.all(
          this.files.map(f => this.getPlaceholdersFromDoc(f.link))
        );
        const { commonAtLeast2, uniqueByArray } = this.analyzeArrays(arrays);

        this.files.forEach((f, i) => {
          f.allPlaceholders = arrays[i];
          const filteredUnique = uniqueByArray[i];
          f.placeholders = this.sortCustom(filteredUnique);
          f.formValues = {};
          filteredUnique.forEach(key => {
            f.formValues[key] = '';
          });
        });

        const filteredCommon = commonAtLeast2;
        this.placeholdersCommon = this.sortCustom(filteredCommon);
        this.formValuesCommon = {};
        this.placeholdersCommon.forEach(key => {
          this.formValuesCommon[key] = '';
        });
      } catch (error) {
        alert("Lỗi khi tải hoặc phân tích file: " + error.message);
      } finally {
        if (loading) loading.style.display = "none";
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
      const matches = rawText.match(/\[\[\s*([^[\]]+?)\s*\]\]/g) || [];

      return [
        ...new Set(
          matches.map(m => m.replace(/\[\[|\]\]/g, "").trim())
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

    async applyChanges() {
      const loading = document.getElementById("loading-overlay");
      if (loading) loading.style.display = "flex";
      this.updating = true;

      try {
        const buffers = await Promise.all(
          this.files.map(f => this.fetchDocxBuffer(this.extractDocId(f.link)))
        );

        const docs = buffers.map(buffer => this.createDoc(buffer));

        const renderDataList = this.files.map((file) => {
          return {
            ...this.formValuesCommon,
            ...file.formValues,
          };
        });

        const outBlobs = docs.map((doc, i) => this.renderToBlob(doc, renderDataList[i]));

        outBlobs.forEach((blob, i) => {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `${this.files[i].name}.docx`;
          a.click();
        });
      } catch (error) {
        alert("Lỗi khi tạo file: " + error.message);
      } finally {
        if (loading) loading.style.display = "none";
        this.updating = false;
      }
    },

    createDoc(buffer) {
      const zip = new PizZip(buffer);
      return new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: "[[",
          end: "]]",
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
      const m = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
      return m ? m[1] : null;
    },

    async fetchDocBuffer(fileId) {
      const res = await gapi.client.drive.files.get(
        { fileId, alt: "media" },
        { responseType: "arraybuffer" }
      );
      return res.body;
    },

    isValidDocx(buffer) {
      try {
        const zip = new PizZip(buffer);
        return Boolean(zip.file("word/document.xml"));
      } catch (e) {
        return false;
      }
    },

    async fetchDocxBuffer(fileId) {
      try {
        const buf = await this.fetchDocBuffer(fileId);
        if (this.isValidDocx(buf)) {
          return buf;
        }
      } catch (e) {
        console.warn("fetch alt:media that bai, thu fallback export docx:", e);
      }

      const exportUrl = `https://docs.google.com/document/d/${fileId}/export?format=docx`;
      const resp = await fetch(exportUrl);
      if (!resp.ok) {
        throw new Error(`Khong the tai file docx (HTTP ${resp.status})`);
      }
      return await resp.arrayBuffer();
    },

    sortCustom(arr) {
      const grouped = {};
      arr.forEach(item => {
        const prefix = item.slice(0, 4);
        if (!grouped[prefix]) grouped[prefix] = [];
        grouped[prefix].push(item);
      });

      let sorted = [];
      Object.keys(grouped).forEach(prefix => {
        grouped[prefix].sort((a, b) => a.localeCompare(b, "vi"));
        sorted = sorted.concat(grouped[prefix]);
      });

      return sorted.reverse();
    },
  },
};
</script>
