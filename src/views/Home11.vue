<template>
  <div class="editor">
    <div class="card common-card" style="margin-bottom: 24px; text-align: center;">
      <h2 style="font-size: 1.25rem; font-weight: 700; color: #0284c7;">Hồ sơ tăng vốn công ty 1 thành viên</h2>
    </div>

    <!-- KHỐI 1: THÔNG TIN CÔNG TY (Gom tất cả các biến liên quan đến công ty & vốn) -->
    <section v-show="companyPlaceholders.length" class="card common-card">
      <h3 class="title-form">Thông Tin Công Ty</h3>
      <form>
        <div v-for="ph in companyPlaceholders" :key="'comp-' + ph" class="form-group">
          <label :for="'comp-' + ph">{{ formatLabel(ph) }}</label>
          <PhongDkkdInput v-if="ph === 'Phòng ĐKKD Tỉnh/TP' || ph === 'Cơ quan đăng ký kinh doanh cấp tỉnh'" :input-id="'comp-' + ph" v-model="companyValues[ph]" />
          <GenderRadio v-else-if="isGenderField(ph)" :name="'comp-' + ph" v-model="companyValues[ph]" />
          <input v-else type="text" :id="'comp-' + ph" v-model="companyValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- KHỐI 2: THÔNG TIN NGƯỜI ĐẠI DIỆN PL & CHỦ SỞ HỮU -->
    <section v-show="repPlaceholders.length" class="card common-card">
      <h3 class="title-form">Thông Tin Người Đại Diện Pháp Luật &amp; Chủ Sở Hữu</h3>
      <form>
        <div v-for="ph in repPlaceholders" :key="'rep-' + ph" class="form-group">
          <label :for="'rep-' + ph">{{ formatLabel(ph) }}</label>
          <GenderRadio v-if="isGenderField(ph)" :name="'rep-' + ph" v-model="repValues[ph]" />
          <input v-else type="text" :id="'rep-' + ph" v-model="repValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- KHỐI 3: THÔNG TIN NGƯỜI ĐƯỢC ỦY QUYỀN (Autofill từ phiên đăng nhập) -->
    <section v-show="authorizedPersonPlaceholders.length" class="card common-card">
      <h3 class="title-form">Thông Tin Người Được Ủy Quyền</h3>
      <form>
        <div v-for="ph in authorizedPersonPlaceholders" :key="'auth-' + ph" class="form-group">
          <label :for="'auth-' + ph">{{ formatLabel(ph) }}</label>
          <GenderRadio v-if="isGenderField(ph)" :name="'auth-' + ph" v-model="authorizedPersonValues[ph]" />
          <input v-else type="text" :id="'auth-' + ph" v-model="authorizedPersonValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- Các trường riêng khác (nếu có trường nào không thuộc 3 khối trên) -->
    <section v-for="(file, i) in otherFilesWithPlaceholders" :key="file.name" class="card file-card">
      <h3 class="title-form">Thông Tin File ({{ file.name }}.docx)</h3>
      <form>
        <div v-for="ph in file.otherPlaceholders" :key="'other-' + i + '-' + ph" class="form-group">
          <label :for="'other-' + i + '-' + ph">{{ formatLabel(ph) }}</label>
          <PhongDkkdInput v-if="ph === 'Phòng ĐKKD Tỉnh/TP' || ph === 'Cơ quan đăng ký kinh doanh cấp tỉnh'" :input-id="'other-' + i + '-' + ph" v-model="file.formValues[ph]" />
          <GenderRadio v-else-if="isGenderField(ph)" :name="'other-' + i + '-' + ph" v-model="file.formValues[ph]" />
          <input v-else type="text" :id="'other-' + i + '-' + ph" v-model="file.formValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- Nhóm nút bấm -->
    <section v-if="hasAnyForm" class="btn-group">
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
import { deductExportFee } from '@/services/wallet';
import { useAuth } from '@/stores/auth';
import { autofillLoginPlaceholders } from '@/lib/loginPlaceholders';
import { enforceTimesNewRoman } from '@/lib/fontHelper';
import { isGenderField } from '@/lib/genderHelper';

export default {
  name: 'Home11',
  // Tăng Vốn Cty 1 Thành Viên
  data() {
    const files = [
      {
        name: '1. GĐN đăng ký thay đổi nội dung ĐKDN',
        link: 'https://docs.google.com/document/d/1i0z-Xb6wI4x-WLaPt_97pvyjGbOb2PAK/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '2. Quyết định của Chủ sở hữu',
        link: 'https://docs.google.com/document/d/1BKe7BsjVL4JtMfaCIpqACpQ9qxCcaa28/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '3. Giấy ủy quyền',
        link: 'https://docs.google.com/document/d/1YHaGFpcOIbASmmgZwWDatP8GXON5MXp_/edit?usp=drivesdk&rtpof=true&sd=true',
      },
    ].map(f => ({
      ...f,
      placeholders: [],
      allPlaceholders: [],
      formValues: {},
    }));
    return {
      files,
      // 1. Khối thông tin công ty
      companyPlaceholders: [],
      companyValues: {},

      // 2. Khối thông tin người đại diện PL + Chủ sở hữu
      repPlaceholders: [],
      repValues: {},

      // 3. Khối thông tin người được ủy quyền (Login_*)
      authorizedPersonPlaceholders: [],
      authorizedPersonValues: {},

      updating: false,
    };
  },

  computed: {
    otherFilesWithPlaceholders() {
      return this.files
        .map(f => {
          const others = (f.placeholders || []).filter(ph => {
            return !this.isCompanyField(ph) && !this.isRepField(ph) && !this.isLoginField(ph);
          });
          return {
            ...f,
            otherPlaceholders: others,
          };
        })
        .filter(f => f.otherPlaceholders.length > 0);
    },
    hasAnyForm() {
      return this.companyPlaceholders.length > 0
        || this.repPlaceholders.length > 0
        || this.authorizedPersonPlaceholders.length > 0
        || this.otherFilesWithPlaceholders.length > 0;
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

    formatLabel(ph) {
      if (!ph) return '';
      const s = String(ph);
      return s.startsWith('Login_') ? s.slice(6) : s;
    },

    // Tự nhận diện biến thuộc Thông tin Công ty
    isCompanyField(ph) {
      if (!ph) return false;
      const s = String(ph).trim().toLowerCase();
      // Loại trừ các trường thuộc người đại diện / chủ sở hữu hay người ủy quyền
      if (s.includes('đại diện') || s.includes('đại điện') || s.includes('chủ sở hữu') || s.startsWith('login_')) {
        return false;
      }
      return (
        s.includes('công ty') ||
        s.includes('cty') ||
        s.includes('mã số thuế') ||
        s.includes('mst') ||
        s.includes('doanh nghiệp') ||
        s.includes('phòng đkkd') ||
        s.includes('cơ quan đăng ký') ||
        s.includes('vốn điều lệ') ||
        s.includes('hình thức tăng vốn')
      );
    },

    // Nhận diện biến thuộc Thông tin Người đại diện PL / Chủ sở hữu
    isRepField(ph) {
      if (!ph) return false;
      const s = String(ph).trim().toLowerCase();
      if (s.startsWith('login_')) return false;
      return s.includes('đại diện') || s.includes('đại điện') || s.includes('chủ sở hữu');
    },

    // Nhận diện biến thuộc Người được ủy quyền
    isLoginField(ph) {
      if (!ph) return false;
      return String(ph).startsWith('Login_');
    },

    async getFile() {
      const loading = document.getElementById("loading-overlay");
      if (loading) loading.style.display = "flex";
      try {
        const arrays = await Promise.all(
          this.files.map(f => this.getPlaceholdersFromDoc(f.link))
        );

        this.files.forEach((f, i) => {
          f.allPlaceholders = arrays[i];
          f.placeholders = arrays[i];
          f.formValues = {};
          arrays[i].forEach(key => {
            f.formValues[key] = isGenderField(key) ? 'Nam' : '';
          });
        });

        // Thu thập toàn bộ placeholder trên cả 3 file để chia khối
        const allSet = new Set();
        arrays.forEach(arr => arr.forEach(k => allSet.add(k)));
        const allPlaceholders = [...allSet];

        // 1. Khối Công ty
        const compList = allPlaceholders.filter(p => this.isCompanyField(p));
        const compOrder = [
          'tên công ty',
          'mã số doanh nghiệp',
          'tỉnh công ty',
          'cơ quan đăng ký kinh doanh cấp tỉnh',
          'vốn điều lệ hiện tại',
          'vốn điều lệ hiện tại bằng chữ',
          'hình thức tăng vốn',
          'vốn điều lệ mới',
          'vốn điều lệ mới bằng chữ',
        ];
        compList.sort((a, b) => {
          const idxA = compOrder.indexOf(a.trim().toLowerCase());
          const idxB = compOrder.indexOf(b.trim().toLowerCase());
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.localeCompare(b);
        });
        this.companyPlaceholders = compList;
        this.companyValues = {};
        this.companyPlaceholders.forEach(k => {
          this.companyValues[k] = isGenderField(k) ? 'Nam' : '';
        });

        // 2. Khối Người đại diện PL + Chủ sở hữu
        const repList = allPlaceholders.filter(p => this.isRepField(p));
        const repOrder = [
          'họ tên chủ sở hữu',
          'họ tên đại diện',
          'giới tính đại diện',
          'sinh ngày đại diện',
          'số định danh cá nhân đại diện',
          'địa chỉ của đại điện',
        ];
        repList.sort((a, b) => {
          const idxA = repOrder.indexOf(a.trim().toLowerCase());
          const idxB = repOrder.indexOf(b.trim().toLowerCase());
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.localeCompare(b);
        });
        this.repPlaceholders = repList;
        this.repValues = {};
        this.repPlaceholders.forEach(k => {
          this.repValues[k] = isGenderField(k) ? 'Nam' : '';
        });

        // 3. Khối Người được ủy quyền (Login_*)
        const authList = allPlaceholders.filter(p => this.isLoginField(p));
        this.authorizedPersonPlaceholders = authList;
        this.authorizedPersonValues = {};
        this.authorizedPersonPlaceholders.forEach(k => {
          this.authorizedPersonValues[k] = isGenderField(k) ? 'Nam' : '';
        });

        // Prune: loại các key đã thuộc 3 khối ra khỏi formValues từng file (tránh trùng lặp / ghi đè)
        const blockKeys = new Set([...this.companyPlaceholders, ...this.repPlaceholders, ...this.authorizedPersonPlaceholders]);
        this.files.forEach(f => {
          const kept = f.placeholders.filter(k => !blockKeys.has(k));
          const newFv = {};
          kept.forEach(k => { newFv[k] = f.formValues[k] ?? ''; });
          f.placeholders = kept;
          f.formValues = newFv;
        });

        // Tự động điền các placeholder có tiền tố "Login_" từ user hiện tại
        const currentUser = useAuth().state.user;
        if (currentUser) {
          autofillLoginPlaceholders(this.authorizedPersonValues, currentUser);
          this.files.forEach(f => autofillLoginPlaceholders(f.formValues, currentUser));
        }
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
        delimiters: {
          start: "[[",
          end: "]]",
        },
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
      Object.keys(this.companyValues).forEach(k => (this.companyValues[k] = isGenderField(k) ? 'Nam' : ''));
      Object.keys(this.repValues).forEach(k => (this.repValues[k] = isGenderField(k) ? 'Nam' : ''));
      Object.keys(this.authorizedPersonValues).forEach(k => (this.authorizedPersonValues[k] = isGenderField(k) ? 'Nam' : ''));
      this.files.forEach(f => {
        Object.keys(f.formValues).forEach(k => (f.formValues[k] = isGenderField(k) ? 'Nam' : ''));
      });

      const currentUser = useAuth().state.user;
      if (currentUser) {
        autofillLoginPlaceholders(this.authorizedPersonValues, currentUser);
        this.files.forEach(f => autofillLoginPlaceholders(f.formValues, currentUser));
      }
    },

    // APPLY CHANGES
    async applyChanges() {
      const loading = document.getElementById("loading-overlay");
      if (loading) loading.style.display = "flex";
      this.updating = true;
      try {
        await deductExportFee('Tăng Vốn Cty 1 Thành Viên');
        const buffers = await Promise.all(
          this.files.map(f => this.fetchDocBuffer(this.extractDocId(f.link)))
        );

        const docs = buffers.map(buffer => this.createDoc(buffer));

        const renderDataList = this.files.map(file => ({
          ...this.companyValues,
          ...this.repValues,
          ...this.authorizedPersonValues,
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
        if (loading) loading.style.display = "none";
      }
    },

    async fetchDocxBuffer(fileId) {
      let buffer;
      const res = await gapi.client.drive.files.get(
        { fileId, alt: "media" },
        { responseType: "arraybuffer" }
      );
      buffer = res.body;

      if (!this.isValidDocx(buffer)) {
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
          start: "[[",
          end: "]]",
        },
      });
    },

    renderToBlob(doc, data) {
      doc.render(data);
      enforceTimesNewRoman(doc.getZip());
      return doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
    },

    isGenderField(ph) {
      return isGenderField(ph);
    },

    extractDocId(url) {
      const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : null;
    },
  }
}
</script>
