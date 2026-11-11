<template>
  <div class="editor">
    <div class="card common-card" style="margin-bottom: 24px; text-align: center;">
      <h2 style="font-size: 1.25rem; font-weight: 700; color: #0284c7;">Hợp đồng chuyển nhượng và Biên bản thanh lý</h2>
    </div>

    <!-- KHỐI 1: THÔNG TIN CÔNG TY & HỢP ĐỒNG -->
    <section v-show="companyPlaceholders.length" class="card common-card">
      <h3 class="title-form">Thông Tin Công Ty &amp; Hợp Đồng</h3>
      <form>
        <div v-for="ph in companyPlaceholders" :key="'comp-' + ph" class="form-group">
          <label :for="'comp-' + ph">{{ formatLabel(ph) }}</label>
          <PhongDkkdInput v-if="ph === 'Phòng ĐKKD Tỉnh/TP'" :input-id="'comp-' + ph" v-model="companyValues[ph]" />
          <GenderRadio v-else-if="isGenderField(ph)" :name="'comp-' + ph" v-model="companyValues[ph]" />
          <input v-else type="text" :id="'comp-' + ph" v-model="companyValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- KHỐI 2: BÊN CHUYỂN NHƯỢNG (bên bán) -->
    <section v-show="sellerPlaceholders.length" class="card common-card">
      <h3 class="title-form">Thông Tin Bên Chuyển Nhượng (Bên Bán)</h3>
      <form>
        <div v-for="ph in sellerPlaceholders" :key="'seller-' + ph" class="form-group">
          <label :for="'seller-' + ph">{{ formatLabel(ph) }}</label>
          <GenderRadio v-if="isGenderField(ph)" :name="'seller-' + ph" v-model="sellerValues[ph]" />
          <input v-else type="text" :id="'seller-' + ph" v-model="sellerValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- KHỐI 3: BÊN NHẬN CHUYỂN NHƯỢNG (bên mua) -->
    <section v-show="buyerPlaceholders.length" class="card common-card">
      <h3 class="title-form">Thông Tin Bên Nhận Chuyển Nhượng (Bên Mua)</h3>
      <form>
        <div v-for="ph in buyerPlaceholders" :key="'buyer-' + ph" class="form-group">
          <label :for="'buyer-' + ph">{{ formatLabel(ph) }}</label>
          <GenderRadio v-if="isGenderField(ph)" :name="'buyer-' + ph" v-model="buyerValues[ph]" />
          <input v-else type="text" :id="'buyer-' + ph" v-model="buyerValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- KHỐI 4: THÔNG TIN GIAO DỊCH CHUYỂN NHƯỢNG -->
    <section v-show="dealPlaceholders.length" class="card common-card">
      <h3 class="title-form">Thông Tin Giao Dịch Chuyển Nhượng</h3>
      <form>
        <div v-for="ph in dealPlaceholders" :key="'deal-' + ph" class="form-group">
          <label :for="'deal-' + ph">{{ formatLabel(ph) }}</label>
          <GenderRadio v-if="isGenderField(ph)" :name="'deal-' + ph" v-model="dealValues[ph]" />
          <input v-else type="text" :id="'deal-' + ph" v-model="dealValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- Các trường riêng khác (nếu có trường nào không thuộc 4 khối trên) -->
    <section v-for="(file, i) in otherFilesWithPlaceholders" :key="file.name" class="card file-card">
      <h3 class="title-form">Thông Tin File ({{ file.name }}.docx)</h3>
      <form>
        <div v-for="ph in file.otherPlaceholders" :key="'other-' + i + '-' + ph" class="form-group">
          <label :for="'other-' + i + '-' + ph">{{ formatLabel(ph) }}</label>
          <PhongDkkdInput v-if="ph === 'Phòng ĐKKD Tỉnh/TP'" :input-id="'other-' + i + '-' + ph" v-model="file.formValues[ph]" />
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
  name: 'Home6',
  data() {
    const files = [
      {
        name: '4. Hợp đồng chuyển nhượng số 1',
        link: 'https://docs.google.com/document/d/1XvdT41PS-_w5W_C_ntOLwEGwCGup8rq6/edit?usp=sharing&ouid=107831693588829116850&rtpof=true&sd=true',
      },
      {
        name: '5. Biên bản thanh lý HĐCN số 1',
        link: 'https://docs.google.com/document/d/1XZgrNqXXhshKSGW1oSSgFI1XKC_vy2kY/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      },
    ].map(f => ({
      ...f,
      placeholders: [],
      allPlaceholders: [],
      formValues: {},
    }));

    return {
      files,
      // 1. Khối thông tin công ty & hợp đồng
      companyPlaceholders: [],
      companyValues: {},

      // 2. Khối thông tin bên chuyển nhượng (bên bán)
      sellerPlaceholders: [],
      sellerValues: {},

      // 3. Khối thông tin bên nhận chuyển nhượng (bên mua)
      buyerPlaceholders: [],
      buyerValues: {},

      // 4. Khối thông tin giao dịch chuyển nhượng
      dealPlaceholders: [],
      dealValues: {},

      updating: false,
    };
  },

  computed: {
    otherFilesWithPlaceholders() {
      return this.files
        .map(f => {
          const others = (f.placeholders || []).filter(ph => {
            return !this.isCompanyField(ph) && !this.isSellerField(ph) && !this.isBuyerField(ph) && !this.isDealField(ph);
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
        || this.sellerPlaceholders.length > 0
        || this.buyerPlaceholders.length > 0
        || this.dealPlaceholders.length > 0
        || this.otherFilesWithPlaceholders.length > 0;
    },
  },

  async mounted() {
    await this.initGapi();
    await this.initAuth();
    await this.getFile();
  },

  methods: {
    formatLabel(ph) {
      if (!ph) return '';
      const s = String(ph);
      return s.startsWith('Login_') ? s.slice(6) : s;
    },

    // Tự nhận diện biến thuộc Thông tin Công ty & Hợp đồng
    isCompanyField(ph) {
      if (!ph) return false;
      const s = String(ph).trim().toLowerCase();
      if (s.includes('bên cn') || s.includes('bên nhận') || s.includes('đại diện') || s.includes('đại điện') ||
          s.includes('tiền') || s.includes('tỷ lệ') || s.includes('toàn bộ')) {
        return false;
      }
      return s.includes('công ty') || s.includes('cty') || s.includes('số hđ') || s.includes('số hợp đồng');
    },

    // Nhận diện biến thuộc Bên chuyển nhượng (bên bán)
    isSellerField(ph) {
      if (!ph) return false;
      const s = String(ph).trim().toLowerCase();
      if (s.includes('bên nhận') || s.includes('tiền') || s.includes('tỷ lệ') || s.includes('toàn bộ')) return false;
      return s.includes('bên cn') || s.includes('đại diện') || s.includes('đại điện');
    },

    // Nhận diện biến thuộc Bên nhận chuyển nhượng (bên mua)
    isBuyerField(ph) {
      if (!ph) return false;
      const s = String(ph).trim().toLowerCase();
      return s.includes('bên nhận cn');
    },

    // Nhận diện biến thuộc Thông tin giao dịch chuyển nhượng
    isDealField(ph) {
      if (!ph) return false;
      const s = String(ph).trim().toLowerCase();
      return s.includes('tiền') || s.includes('tỷ lệ') || s.includes('toàn bộ');
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

        this.files.forEach((f, i) => {
          f.allPlaceholders = arrays[i];
          f.placeholders = arrays[i];
          f.formValues = {};
          arrays[i].forEach(key => {
            f.formValues[key] = isGenderField(key) ? 'Nam' : '';
          });
        });

        // Thu thập toàn bộ placeholder trên cả 2 file để chia khối
        const allSet = new Set();
        arrays.forEach(arr => arr.forEach(k => allSet.add(k)));
        const allPlaceholders = [...allSet];

        // 1. Khối Công ty & Hợp đồng
        const compList = allPlaceholders.filter(p => this.isCompanyField(p));
        const compOrder = [
          'tên công ty',
          'địa chỉ công ty',
          'số hđ',
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

        // 2. Khối Bên chuyển nhượng (bên bán)
        const sellerList = allPlaceholders.filter(p => this.isSellerField(p));
        const sellerOrder = [
          'họ tên bên cn',
          'họ tên đại diện',
          'giới tính bên cn',
          'ngày sinh bên cn',
          'số định danh bên cn',
          'địa chỉ bên cn',
        ];
        sellerList.sort((a, b) => {
          const idxA = sellerOrder.indexOf(a.trim().toLowerCase());
          const idxB = sellerOrder.indexOf(b.trim().toLowerCase());
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.localeCompare(b);
        });
        this.sellerPlaceholders = sellerList;
        this.sellerValues = {};
        this.sellerPlaceholders.forEach(k => {
          this.sellerValues[k] = isGenderField(k) ? 'Nam' : '';
        });

        // 3. Khối Bên nhận chuyển nhượng (bên mua)
        const buyerList = allPlaceholders.filter(p => this.isBuyerField(p));
        const buyerOrder = [
          'họ tên bên nhận cn',
          'giới tính bên nhận cn',
          'ngày sinh bên nhận cn',
          'số định danh bên nhận cn',
          'địa chỉ bên nhận cn',
        ];
        buyerList.sort((a, b) => {
          const idxA = buyerOrder.indexOf(a.trim().toLowerCase());
          const idxB = buyerOrder.indexOf(b.trim().toLowerCase());
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.localeCompare(b);
        });
        this.buyerPlaceholders = buyerList;
        this.buyerValues = {};
        this.buyerPlaceholders.forEach(k => {
          this.buyerValues[k] = isGenderField(k) ? 'Nam' : '';
        });

        // 4. Khối Thông tin giao dịch chuyển nhượng
        const dealList = allPlaceholders.filter(p => this.isDealField(p));
        const dealOrder = [
          'toàn bộ hoặc một phần',
          'tỷ lệ % vốn',
          'số tiền bằng số',
          'số tiền bằng chữ',
        ];
        dealList.sort((a, b) => {
          const idxA = dealOrder.indexOf(a.trim().toLowerCase());
          const idxB = dealOrder.indexOf(b.trim().toLowerCase());
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.localeCompare(b);
        });
        this.dealPlaceholders = dealList;
        this.dealValues = {};
        this.dealPlaceholders.forEach(k => {
          this.dealValues[k] = isGenderField(k) ? 'Nam' : '';
        });

        // Prune: loại các key đã thuộc 4 khối ra khỏi formValues từng file (tránh trùng lặp / ghi đè)
        const blockKeys = new Set([...this.companyPlaceholders, ...this.sellerPlaceholders, ...this.buyerPlaceholders, ...this.dealPlaceholders]);
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
      Object.keys(this.sellerValues).forEach(k => (this.sellerValues[k] = isGenderField(k) ? 'Nam' : ''));
      Object.keys(this.buyerValues).forEach(k => (this.buyerValues[k] = isGenderField(k) ? 'Nam' : ''));
      Object.keys(this.dealValues).forEach(k => (this.dealValues[k] = isGenderField(k) ? 'Nam' : ''));
      this.files.forEach(f => {
        Object.keys(f.formValues).forEach(k => (f.formValues[k] = isGenderField(k) ? 'Nam' : ''));
      });

      const currentUser = useAuth().state.user;
      if (currentUser) {
        this.files.forEach(f => autofillLoginPlaceholders(f.formValues, currentUser));
      }
    },

    async applyChanges() {
      const loading = document.getElementById("loading-overlay");
      if (loading) loading.style.display = "flex";
      this.updating = true;

      try {
        await deductExportFee('HĐCN và BBTL');
        const buffers = await Promise.all(
          this.files.map(f => this.fetchDocxBuffer(this.extractDocId(f.link)))
        );

        const docs = buffers.map(buffer => this.createDoc(buffer));

        const renderDataList = this.files.map((file) => {
          return {
            ...this.companyValues,
            ...this.sellerValues,
            ...this.buyerValues,
            ...this.dealValues,
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
      enforceTimesNewRoman(doc.getZip());
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

    isGenderField(ph) {
      return isGenderField(ph);
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
  },
};
</script>
