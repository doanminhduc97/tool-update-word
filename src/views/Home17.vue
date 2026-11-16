<template>
  <div class="editor">
    <PageLoader v-if="pageLoading" title="Đang tải hồ sơ Thay đổi CSH, đại diện cty 1 thành viên..." :error="pageError" @retry="loadData" />
    <template v-else>
      <div class="card common-card" style="margin-bottom: 24px; text-align: center;">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #0284c7;">Hồ sơ thay đổi CSH, đại diện công ty 1 thành viên</h2>
      </div>

    <!-- KHỐI 1: THÔNG TIN CÔNG TY -->
    <section v-show="companyPlaceholders.length" class="card common-card">
      <h3 class="title-form">Thông Tin Công Ty</h3>
      <form>
        <div v-for="ph in companyPlaceholders" :key="'comp-' + ph" class="form-group">
          <label :for="'comp-' + ph">{{ formatLabel(ph) }}</label>
          <PhongDkkdInput v-if="ph === 'Phòng ĐKKD Tỉnh/TP' || ph === 'Cơ quan đăng ký kinh doanh cấp tỉnh'" :input-id="'comp-' + ph" v-model="companyValues[ph]" />
          <ProvinceSelectInput v-else-if="isProvinceField(ph)" :input-id="'comp-' + ph" v-model="companyValues[ph]" />
          <GenderRadio v-else-if="isGenderField(ph)" :name="'comp-' + ph" v-model="companyValues[ph]" />
          <input v-else type="text" :id="'comp-' + ph" v-model="companyValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- KHỐI 2: THÔNG TIN CSH CŨ (Bên chuyển nhượng - Bên A) -->
    <section v-show="oldOwnerPlaceholders.length" class="card common-card">
      <h3 class="title-form">Thông Tin CSH Cũ (Bên Chuyển Nhượng - Bên A)</h3>
      <form>
        <div v-for="ph in oldOwnerPlaceholders" :key="'old-' + ph" class="form-group">
          <label :for="'old-' + ph">{{ formatLabel(ph) }}</label>
          <ProvinceSelectInput v-if="isProvinceField(ph)" :input-id="'old-' + ph" v-model="oldOwnerValues[ph]" />
          <GenderRadio v-else-if="isGenderField(ph)" :name="'old-' + ph" v-model="oldOwnerValues[ph]" />
          <input v-else type="text" :id="'old-' + ph" v-model="oldOwnerValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- KHỐI 3: THÔNG TIN CSH MỚI (Bên nhận chuyển nhượng - Bên B) -->
    <section v-show="newOwnerPlaceholders.length" class="card common-card">
      <h3 class="title-form">Thông Tin CSH Mới (Bên Nhận Chuyển Nhượng - Bên B)</h3>
      <form>
        <div v-for="ph in newOwnerPlaceholders" :key="'new-' + ph" class="form-group">
          <label :for="'new-' + ph">{{ formatLabel(ph) }}</label>
          <ProvinceSelectInput v-if="isProvinceField(ph)" :input-id="'new-' + ph" v-model="newOwnerValues[ph]" />
          <GenderRadio v-else-if="isGenderField(ph)" :name="'new-' + ph" v-model="newOwnerValues[ph]" />
          <input v-else type="text" :id="'new-' + ph" v-model="newOwnerValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- KHỐI 4: THÔNG TIN CHUYỂN NHƯỢNG VỐN -->
    <section v-show="transferPlaceholders.length" class="card common-card">
      <h3 class="title-form">Thông Tin Chuyển Nhượng Vốn</h3>
      <form>
        <div v-for="ph in transferPlaceholders" :key="'transfer-' + ph" class="form-group">
          <label :for="'transfer-' + ph">{{ formatLabel(ph) }}</label>
          <input type="text" :id="'transfer-' + ph" v-model="transferValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- KHỐI 5: THÔNG TIN NGƯỜI ĐƯỢC ỦY QUYỀN (Autofill từ phiên đăng nhập) -->
    <section v-show="authorizedPersonPlaceholders.length" class="card common-card">
      <h3 class="title-form">Thông Tin Người Được Ủy Quyền</h3>
      <form>
        <div v-for="ph in authorizedPersonPlaceholders" :key="'auth-' + ph" class="form-group">
          <label :for="'auth-' + ph">{{ formatLabel(ph) }}</label>
          <ProvinceSelectInput v-if="isProvinceField(ph)" :input-id="'auth-' + ph" v-model="authorizedPersonValues[ph]" />
          <GenderRadio v-else-if="isGenderField(ph)" :name="'auth-' + ph" v-model="authorizedPersonValues[ph]" />
          <input v-else type="text" :id="'auth-' + ph" v-model="authorizedPersonValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- KHỐI 6: Các trường riêng khác -->
    <section v-for="(file, i) in otherFilesWithPlaceholders" :key="file.name" class="card file-card">
      <h3 class="title-form">Thông Tin File ({{ file.name }})</h3>
      <form>
        <div v-for="ph in file.otherPlaceholders" :key="'other-' + i + '-' + ph" class="form-group">
          <label :for="'other-' + i + '-' + ph">{{ formatLabel(ph) }}</label>
          <PhongDkkdInput v-if="ph === 'Phòng ĐKKD Tỉnh/TP' || ph === 'Cơ quan đăng ký kinh doanh cấp tỉnh'" :input-id="'other-' + i + '-' + ph" v-model="file.formValues[ph]" />
          <ProvinceSelectInput v-else-if="isProvinceField(ph)" :input-id="'other-' + i + '-' + ph" v-model="file.formValues[ph]" />
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
    </template>
  </div>
</template>

<script>
const CLIENT_ID = "735739572072-i6e10mu5530gmqa21e1bt3iffperiit8.apps.googleusercontent.com";
const API_KEY = "AIzaSyA1_t274mJWSiJ--Fosg0bVxylPX1AV4Tw";
const SCOPES = "https://www.googleapis.com/auth/drive.readonly";
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { checkExportBalance, deductExportFee } from '@/services/wallet';
import { useAuth } from '@/stores/auth';
import { autofillLoginPlaceholders, isProvinceField } from '@/lib/loginPlaceholders';
import { enforceTimesNewRoman } from '@/lib/fontHelper';
import { isGenderField } from '@/lib/genderHelper';

export default {
  name: 'Home17',
  // Thay đổi CSH, đại diện Cty 1 Thành Viên
  data() {
    const files = [
      {
        name: '1. Giấy đề nghị thay đổi đại diện pháp luật',
        link: 'https://drive.google.com/file/d/1938yAH4ASz5AtqpddIU-qyPXAQdi--_L/view?usp=sharing',
      },
      {
        name: '2. Giấy đề nghị thay đổi ĐKDN',
        link: 'https://drive.google.com/file/d/1c1BaP2vLBte4_EJ5oynu6OLqXW-12lK2/view?usp=sharing',
      },
      {
        name: '3. Giấy đề nghị chủ sở hữu',
        link: 'https://drive.google.com/file/d/1HNQ1DGBunCweNkbkBRucSgmhKi185B_n/view?usp=sharing',
      },
      {
        name: '4. Hợp đồng chuyển nhượng số 1',
        link: 'https://drive.google.com/file/d/1rcLz3W-lnFvjmOPkRf8EnZ-yxtCwxrmd/view?usp=sharing',
      },
      {
        name: '5. Biên bản thanh lý HĐCN số 1',
        link: 'https://drive.google.com/file/d/1lyISoWu9wuJuZ5GPMOzxCHS73FacefSE/view?usp=sharing',
      },
      {
        name: '6. Quyết định',
        link: 'https://drive.google.com/file/d/1wA4PZVEI20nCHoDR4mnYnIsG-UQOii7u/view?usp=sharing',
      },
      {
        name: '7. DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI CỦA DOANH NGHIỆP',
        link: 'https://drive.google.com/file/d/1SgrVkToc1MuM5h2L1YIKQT_4a4k9sizE/view?usp=sharing',
      },
      {
        name: '8. Giấy ủy quyền',
        link: 'https://drive.google.com/file/d/1mN7UEz-BXRXmcHlQnx8F7Zn0JTnkfo02/view?usp=sharing',
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

      // 2. Khối CSH cũ (bên chuyển nhượng - Bên A)
      oldOwnerPlaceholders: [],
      oldOwnerValues: {},

      // 3. Khối CSH mới (bên nhận chuyển nhượng - Bên B)
      newOwnerPlaceholders: [],
      newOwnerValues: {},

      // 4. Khối thông tin chuyển nhượng vốn
      transferPlaceholders: [],
      transferValues: {},

      // 5. Khối thông tin người được ủy quyền (Login_*)
      authorizedPersonPlaceholders: [],
      authorizedPersonValues: {},

      updating: false,
      pageLoading: true,
      pageError: null,
    };
  },

  computed: {
    otherFilesWithPlaceholders() {
      return this.files
        .map(f => {
          const others = (f.placeholders || []).filter(ph => {
            return !this.isCompanyField(ph) && !this.isOldOwnerField(ph) && !this.isNewOwnerField(ph)
              && !this.isTransferField(ph) && !this.isLoginField(ph) && !this.isAutoMappedField(ph);
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
        || this.oldOwnerPlaceholders.length > 0
        || this.newOwnerPlaceholders.length > 0
        || this.transferPlaceholders.length > 0
        || this.authorizedPersonPlaceholders.length > 0
        || this.otherFilesWithPlaceholders.length > 0;
    },
  },

  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      this.pageLoading = true;
      this.pageError = null;
      try {
        await this.initGapi();
        await this.initAuth();
        await this.getFile();
      } catch (err) {
        console.error(err);
        this.pageError = err?.message || 'Lỗi khi kết nối hoặc tải dữ liệu từ Google Drive';
      } finally {
        this.pageLoading = false;
      }
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

    formatLabel(ph) {
      if (!ph) return '';
      const s = String(ph);
      if (s === 'số HĐ' || s === 'số hđ') return 'Số Hợp Đồng';
      return s.startsWith('Login_') ? s.slice(6) : s;
    },

    // Nhận diện file DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI
    isCshListFile(file) {
      return String(file.name || '').toUpperCase().includes('DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI');
    },

    // Các field được tự động điền (mirror) từ khối khác khi render
    isAutoMappedField(ph) {
      if (!ph) return false;
      const s = String(ph).trim().toLowerCase();
      if (s === 'họ tên đại diện') return true;
      if (s.includes('bên nhận cn')) return true;
      return false;
    },

    // Tự nhận diện biến thuộc Thông tin Công ty
    isCompanyField(ph) {
      if (!ph || this.isAutoMappedField(ph)) return false;
      const s = String(ph).trim().toLowerCase();
      if (s.includes('csh') || s.includes('bên cn') || s.startsWith('login_')) {
        return false;
      }
      return (
        s.includes('công ty') ||
        s.includes('cty') ||
        s.includes('mã số doanh nghiệp') ||
        s.includes('mst') ||
        s.includes('mã số thuế') ||
        s.includes('phòng đkkd') ||
        s.includes('cơ quan đăng ký') ||
        s === 'số hđ' ||
        s.includes('số hợp đồng')
      );
    },

    // Nhận diện biến thuộc CSH cũ / Bên chuyển nhượng (Bên A)
    isOldOwnerField(ph) {
      if (!ph) return false;
      const s = String(ph).trim().toLowerCase();
      if (s.startsWith('login_')) return false;
      return s.includes('csh cũ') || (s.includes('bên cn') && !s.includes('bên nhận cn'));
    },

    // Nhận diện biến thuộc CSH mới / Bên nhận chuyển nhượng (Bên B)
    isNewOwnerField(ph) {
      if (!ph || this.isAutoMappedField(ph)) return false;
      const s = String(ph).trim().toLowerCase();
      if (s.startsWith('login_')) return false;
      return s.includes('csh mới') || s.includes('bên nhận cn') || s === 'chức danh';
    },

    // Nhận diện biến thuộc thông tin chuyển nhượng vốn
    isTransferField(ph) {
      if (!ph) return false;
      const s = String(ph).trim().toLowerCase();
      return s.includes('toàn bộ') || s.includes('số tiền') || s.includes('tỷ lệ');
    },

    // Nhận diện biến thuộc Người được ủy quyền
    isLoginField(ph) {
      if (!ph) return false;
      return String(ph).startsWith('Login_');
    },

    async getFile() {
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

        // Thu thập toàn bộ placeholder trên tất cả các file để chia khối
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
          'số hđ',
          'địa chỉ công ty',
          'số nhà công ty',
          'phường công ty',
          'thành phố công ty',
          'số điện thoại cty',
          'email công ty',
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

        // 2. Khối CSH cũ (Bên chuyển nhượng)
        const oldList = allPlaceholders.filter(p => this.isOldOwnerField(p));
        const oldOrder = [
          'họ tên csh cũ',
          'họ tên bên cn',
          'giới tính bên cn',
          'ngày sinh bên cn',
          'số định danh bên cn',
          'địa chỉ bên cn',
        ];
        oldList.sort((a, b) => {
          const idxA = oldOrder.indexOf(a.trim().toLowerCase());
          const idxB = oldOrder.indexOf(b.trim().toLowerCase());
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.localeCompare(b);
        });
        this.oldOwnerPlaceholders = oldList;
        this.oldOwnerValues = {};
        this.oldOwnerPlaceholders.forEach(k => {
          this.oldOwnerValues[k] = isGenderField(k) ? 'Nam' : '';
        });

        // 3. Khối CSH mới (Bên nhận chuyển nhượng)
        const newList = allPlaceholders.filter(p => this.isNewOwnerField(p));
        const newOrder = [
          'họ tên csh mới',
          'giới tính csh mới',
          'ngày sinh csh mới',
          'số định danh csh mới',
          'số nhà csh mới',
          'phường csh mới',
          'tỉnh csh mới',
          'chức danh',
        ];
        newList.sort((a, b) => {
          const idxA = newOrder.indexOf(a.trim().toLowerCase());
          const idxB = newOrder.indexOf(b.trim().toLowerCase());
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.localeCompare(b);
        });
        this.newOwnerPlaceholders = newList;
        this.newOwnerValues = {};
        this.newOwnerPlaceholders.forEach(k => {
          this.newOwnerValues[k] = isGenderField(k) ? 'Nam' : '';
        });

        // 4. Khối Thông tin chuyển nhượng vốn
        const transferList = allPlaceholders.filter(p => this.isTransferField(p));
        const transferOrder = [
          'toàn bộ hoặc một phần',
          'số tiền bằng số',
          'số tiền bằng chữ',
          'tỷ lệ % vốn',
        ];
        transferList.sort((a, b) => {
          const idxA = transferOrder.indexOf(a.trim().toLowerCase());
          const idxB = transferOrder.indexOf(b.trim().toLowerCase());
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.localeCompare(b);
        });
        this.transferPlaceholders = transferList;
        this.transferValues = {};
        this.transferPlaceholders.forEach(k => {
          this.transferValues[k] = '';
        });

        // 5. Khối Người được ủy quyền (Login_*)
        const authList = allPlaceholders.filter(p => this.isLoginField(p));
        this.authorizedPersonPlaceholders = authList;
        this.authorizedPersonValues = {};
        this.authorizedPersonPlaceholders.forEach(k => {
          this.authorizedPersonValues[k] = isGenderField(k) ? 'Nam' : '';
        });

        // Prune: loại các key đã thuộc các khối / được auto-map ra khỏi formValues từng file
        const blockKeys = new Set([
          ...this.companyPlaceholders,
          ...this.oldOwnerPlaceholders,
          ...this.newOwnerPlaceholders,
          ...this.transferPlaceholders,
          ...this.authorizedPersonPlaceholders,
          ...allPlaceholders.filter(k => this.isAutoMappedField(k)),
        ]);
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
          autofillLoginPlaceholders(this.companyValues, currentUser);
          autofillLoginPlaceholders(this.oldOwnerValues, currentUser);
          autofillLoginPlaceholders(this.newOwnerValues, currentUser);
          autofillLoginPlaceholders(this.authorizedPersonValues, currentUser);
          this.files.forEach(f => autofillLoginPlaceholders(f.formValues, currentUser));
        }
      } catch (error) {
        console.error("Lỗi khi tải hoặc phân tích file:", error);
        this.pageError = error.message;
        throw error;
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

    resetAll() {
      Object.keys(this.companyValues).forEach(k => (this.companyValues[k] = isGenderField(k) ? 'Nam' : ''));
      Object.keys(this.oldOwnerValues).forEach(k => (this.oldOwnerValues[k] = isGenderField(k) ? 'Nam' : ''));
      Object.keys(this.newOwnerValues).forEach(k => (this.newOwnerValues[k] = isGenderField(k) ? 'Nam' : ''));
      Object.keys(this.transferValues).forEach(k => (this.transferValues[k] = ''));
      Object.keys(this.authorizedPersonValues).forEach(k => (this.authorizedPersonValues[k] = isGenderField(k) ? 'Nam' : ''));
      this.files.forEach(f => {
        Object.keys(f.formValues).forEach(k => (f.formValues[k] = isGenderField(k) ? 'Nam' : ''));
      });

      const currentUser = useAuth().state.user;
      if (currentUser) {
        autofillLoginPlaceholders(this.companyValues, currentUser);
        autofillLoginPlaceholders(this.oldOwnerValues, currentUser);
        autofillLoginPlaceholders(this.newOwnerValues, currentUser);
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
        await checkExportBalance();
        const buffers = await Promise.all(
          this.files.map(f => this.fetchDocBuffer(this.extractDocId(f.link)))
        );

        const docs = buffers.map(buffer => this.createDoc(buffer));

        // Auto-map: CSH mới = Bên nhận chuyển nhượng (Bên B) & đại diện PL mới
        const cshMoi = this.newOwnerValues || {};
        const cshCu = this.oldOwnerValues || {};
        const hoTenCshCu = cshCu['Họ tên CSH cũ'] || cshCu['Họ tên bên CN'] || '';
        const diaChiCshMoi = [
          cshMoi['Số nhà CSH mới'],
          cshMoi['Phường CSH mới'],
          cshMoi['Tỉnh CSH mới'],
        ].filter(Boolean).join(', ');
        const autoMapped = {
          // Tên công ty: template dùng cả "TÊN CÔNG TY" lẫn "Tên công ty"
          'Tên công ty': this.companyValues['TÊN CÔNG TY'] || this.companyValues['Tên công ty'] || '',
          // Đồng bộ cả 2 alias CSH cũ & Bên chuyển nhượng
          'Họ tên CSH cũ': hoTenCshCu,
          'Họ tên bên CN': hoTenCshCu,
          // Bên nhận chuyển nhượng = CSH mới
          'Họ tên bên nhận CN': cshMoi['Họ tên CSH mới'] || '',
          'giới tính bên nhận CN': cshMoi['giới tính CSH mới'] || '',
          'ngày sinh bên nhận CN': cshMoi['ngày sinh CSH mới'] || '',
          'số định danh bên nhận CN': cshMoi['số định danh CSH mới'] || '',
          'địa chỉ bên nhận CN': diaChiCshMoi,
          // Người đại diện theo pháp luật (mới) = CSH mới
          'Họ tên đại diện': cshMoi['Họ tên CSH mới'] || '',
        };

        const renderDataList = this.files.map(file => ({
          ...this.companyValues,
          ...this.oldOwnerValues,
          ...this.newOwnerValues,
          ...this.transferValues,
          ...this.authorizedPersonValues,
          ...file.formValues,
          ...autoMapped,
        }));

        const outBlobs = docs.map((doc, i) => {
          const isFileCSH = this.isCshListFile(this.files[i]);
          return this.renderToBlob(doc, renderDataList[i], { rotateDobVertical: isFileCSH });
        });

        this.files.forEach((file, i) => {
          const url = URL.createObjectURL(outBlobs[i]);
          const link = document.createElement('a');
          link.href = url;
          link.download = file.name + ".docx";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
        await deductExportFee('Thay Đổi CSH, Đại Diện Cty 1TV');
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

    renderToBlob(doc, data, options = {}) {
      doc.render(data);
      enforceTimesNewRoman(doc.getZip());
      const zip = doc.getZip();

      // Nếu yêu cầu xoay dọc ngày sinh từ dưới lên trên (Bottom-to-Top: btLr) và căn CENTER
      if (options.rotateDobVertical) {
        try {
          const docXmlFile = zip.file('word/document.xml');
          if (docXmlFile) {
            let xml = docXmlFile.asText();
            // Tìm các ô bảng chứa ngày sinh dd/mm/yyyy và chèn <w:textDirection w:val="btLr"/> + căn center tuyệt đối
            xml = xml.replace(/<w:tc[\s\S]*?<\/w:tc>/g, (tc) => {
              const textOnly = tc.replace(/<[^>]+>/g, '').trim();
              if (/\b\d{1,2}[/.-]\d{1,2}[/.-]\d{4}\b/.test(textOnly)) {
                let modified = tc;

                // 1. Căn giữa theo chiều dọc ô bảng (vertical alignment: center)
                if (modified.includes('<w:vAlign')) {
                  modified = modified.replace(/<w:vAlign[^>]*\/>/, '<w:vAlign w:val="center"/>');
                } else if (modified.includes('<w:tcPr>')) {
                  modified = modified.replace('<w:tcPr>', '<w:tcPr><w:vAlign w:val="center"/>');
                }

                // 2. Căn giữa đoạn văn (horizontal alignment: center)
                if (modified.includes('<w:jc')) {
                  modified = modified.replace(/<w:jc[^>]*\/>/, '<w:jc w:val="center"/>');
                } else if (modified.includes('<w:pPr>')) {
                  modified = modified.replace('<w:pPr>', '<w:pPr><w:jc w:val="center"/>');
                }

                // 3. Xóa thụt lề thừa (w:ind) có thể làm lệch vị trí center
                modified = modified.replace(/<w:ind[^>]*\/>/g, '<w:ind w:left="0" w:right="0" w:firstLine="0"/>');

                // 4. Xoay dọc từ dưới lên trên (btLr)
                if (modified.includes('<w:textDirection')) {
                  modified = modified.replace(/<w:textDirection[^>]*\/>/, '<w:textDirection w:val="btLr"/>');
                } else if (modified.includes('<w:tcPr>')) {
                  modified = modified.replace('<w:tcPr>', '<w:tcPr><w:textDirection w:val="btLr"/>');
                } else if (modified.includes('<w:tcPr/>')) {
                  modified = modified.replace('<w:tcPr/>', '<w:tcPr><w:textDirection w:val="btLr"/><w:vAlign w:val="center"/></w:tcPr>');
                } else {
                  modified = modified.replace('<w:tc>', '<w:tc><w:tcPr><w:textDirection w:val="btLr"/><w:vAlign w:val="center"/></w:tcPr>');
                }

                return modified;
              }
              return tc;
            });
            zip.file('word/document.xml', xml);
          }
        } catch (e) {
          console.warn('Lỗi khi xoay dọc textDirection ngày sinh:', e);
        }
      }

      return zip.generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
    },

    isGenderField(ph) {
      return isGenderField(ph);
    },

    isProvinceField(ph) {
      return isProvinceField(ph);
    },

    extractDocId(url) {
      const match = url.match(/\/(?:document|file)\/d\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : null;
    },
  }
}
</script>
