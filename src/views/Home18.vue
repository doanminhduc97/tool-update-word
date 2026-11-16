<template>
  <div class="editor">
    <PageLoader v-if="pageLoading" title="Đang tải hồ sơ Cập nhật CSH hưởng lợi, địa chỉ cty, đại diện PL..." :error="pageError" @retry="loadData" />
    <template v-else>
      <div class="card common-card" style="margin-bottom: 24px; text-align: center;">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #0284c7;">Hồ sơ cập nhật CSH hưởng lợi, địa chỉ công ty, địa chỉ đại diện PL</h2>
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

    <!-- KHỐI 2: ĐỊA CHỈ TRỤ SỞ CHÍNH (MỚI) -->
    <section v-show="companyAddressPlaceholders.length" class="card common-card">
      <h3 class="title-form">Địa Chỉ Trụ Sở Chính (Cập Nhật Mới)</h3>
      <form>
        <div v-for="ph in companyAddressPlaceholders" :key="'caddr-' + ph" class="form-group">
          <label :for="'caddr-' + ph">{{ formatLabel(ph) }}</label>
          <ProvinceSelectInput v-if="isProvinceField(ph)" :input-id="'caddr-' + ph" v-model="companyAddressValues[ph]" />
          <input v-else type="text" :id="'caddr-' + ph" v-model="companyAddressValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- KHỐI 3: THÔNG TIN & ĐỊA CHỈ ĐẠI DIỆN PL (MỚI) -->
    <section v-show="repPlaceholders.length" class="card common-card">
      <h3 class="title-form">Thông Tin &amp; Địa Chỉ Đại Diện PL (Cập Nhật Mới)</h3>
      <form>
        <div v-for="ph in repPlaceholders" :key="'rep-' + ph" class="form-group">
          <label :for="'rep-' + ph">{{ formatLabel(ph) }}</label>
          <ProvinceSelectInput v-if="isProvinceField(ph)" :input-id="'rep-' + ph" v-model="repValues[ph]" />
          <GenderRadio v-else-if="isGenderField(ph)" :name="'rep-' + ph" v-model="repValues[ph]" />
          <input v-else type="text" :id="'rep-' + ph" v-model="repValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- KHỐI 4: Các file hồ sơ (Danh Sách CSH Hưởng Lợi gắn vào File 2) -->
    <template v-for="(file, i) in files" :key="file.name">
      <!-- File 2 (DS CSH hưởng lợi) chỉ là loop thêm CSH: không render card Thông Tin File -->
      <section v-if="file.placeholders.length && !isCshListFile(file)" class="card file-card">
        <h3 class="title-form">Thông Tin File ({{ file.name }})</h3>
        <form>
          <div v-for="ph in file.placeholders" :key="'f' + i + '-' + ph" class="form-group">
            <label :for="'f' + i + '-' + ph">{{ formatLabel(ph) }}</label>
            <PhongDkkdInput v-if="ph === 'Phòng ĐKKD Tỉnh/TP' || ph === 'Cơ quan đăng ký kinh doanh cấp tỉnh'" :input-id="'f' + i + '-' + ph" v-model="file.formValues[ph]" />
            <ProvinceSelectInput v-else-if="isProvinceField(ph)" :input-id="'f' + i + '-' + ph" v-model="file.formValues[ph]" />
            <GenderRadio v-else-if="isGenderField(ph)" :name="'f' + i + '-' + ph" v-model="file.formValues[ph]" />
            <input v-else type="text" :id="'f' + i + '-' + ph" v-model="file.formValues[ph]" required>
          </div>
        </form>
      </section>

      <!-- Danh Sách CSH Hưởng Lợi: gắn ngay sau Thông Tin File (2. DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI) -->
      <section v-if="isCshListFile(file)" class="card common-card">
        <div class="card-head">
          <h3 class="title-form">Danh Sách CSH Hưởng Lợi</h3>
          <button type="button" @click="addUser" class="btn-add">Thêm CSH</button>
        </div>
        <p :class="userInfoForm.length < 1 ? 'required-hint missing' : 'required-hint ok'">
          {{ userInfoForm.length < 1
            ? '⚠️ Vui lòng thêm ít nhất 1 CSH hưởng lợi'
            : `✓ Đã có ${userInfoForm.length} CSH hưởng lợi` }}
        </p>
        <template v-if="userInfoForm.length > 0">
          <div v-for="(item, index) in userInfoForm" :key="index" class="member-card">
            <div class="member-head">
              <h4 class="member-title">CSH hưởng lợi {{ index + 1 }}</h4>
              <button type="button" @click="removeUser(index)" class="btn-remove">Xóa</button>
            </div>
            <div class="member-grid">
              <div class="form-group">
                <label>Họ tên</label>
                <input type="text" v-model="item.name" placeholder="Nguyễn Văn A">
              </div>
              <div class="form-group">
                <label>Giới tính</label>
                <GenderRadio :name="'csh18-gender-' + index" v-model="item.gender" />
              </div>
              <div class="form-group">
                <label>Ngày sinh</label>
                <input type="text" v-model="item.birthday" placeholder="DD/MM/YYYY">
              </div>
              <div class="form-group">
                <label>Số định danh cá nhân</label>
                <input type="text" v-model="item.idNumber" placeholder="Số CCCD">
              </div>
              <div class="form-group form-group-wide">
                <label>Địa chỉ liên lạc</label>
                <input type="text" v-model="item.address" placeholder="Số nhà, đường, phường/xã, tỉnh/TP">
              </div>
              <div class="form-group">
                <label>Tỷ lệ sở hữu vốn điều lệ (%)</label>
                <input type="text" v-model="item.tlvd" placeholder="Ví dụ: 100">
              </div>
              <div class="form-group">
                <label>Tỷ lệ cổ phần có quyền biểu quyết (%)</label>
                <input type="text" v-model="item.tlcp" placeholder="Ví dụ: 100">
              </div>
            </div>
          </div>
        </template>
        <p v-else class="empty-hint">Chưa có CSH hưởng lợi nào. Nhấn "Thêm CSH" để bắt đầu.</p>
      </section>
    </template>

    <!-- KHỐI 5: THÔNG TIN NGƯỜI ĐƯỢC ỦY QUYỀN (Autofill từ phiên đăng nhập) -->
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
import { filterCshHuongLoiList } from '@/lib/cshHelper';

export default {
  name: 'Home18',
  // Cập nhật CSH hưởng lợi, địa chỉ công ty, địa chỉ đại diện PL
  data() {
    const files = [
      {
        name: '1. Giấy đề nghị đăng ký thay đổi nội dung ĐKDN',
        link: 'https://drive.google.com/file/d/1_5PxBvC_HvF6ANkCx7UgmPy4LYSZa3Uz/view?usp=sharing',
      },
      {
        name: '2. DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI CỦA DOANH NGHIỆP',
        link: 'https://drive.google.com/file/d/11hQTRw6cZY3wcNz7BTlznMJYCs1sPpzM/view?usp=sharing',
      },
      {
        name: '3. Giấy ủy quyền',
        link: 'https://drive.google.com/file/d/1cqHIvQRIbBKKWw-YlLgjexErEOO2EQYA/view?usp=sharing',
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

      // 2. Khối địa chỉ trụ sở chính (mới)
      companyAddressPlaceholders: [],
      companyAddressValues: {},

      // 3. Khối thông tin & địa chỉ đại diện PL (mới)
      repPlaceholders: [],
      repValues: {},

      // 4. Khối danh sách CSH hưởng lợi
      userInfoForm: [],

      // 5. Khối thông tin người được ủy quyền (Login_*)
      authorizedPersonPlaceholders: [],
      authorizedPersonValues: {},

      updating: false,
      pageLoading: true,
      pageError: null,
    };
  },

  computed: {
    hasAnyForm() {
      return this.companyPlaceholders.length > 0
        || this.companyAddressPlaceholders.length > 0
        || this.repPlaceholders.length > 0
        || this.authorizedPersonPlaceholders.length > 0
        || this.files.some(f => f.placeholders.length > 0);
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
      return s.startsWith('Login_') ? s.slice(6) : s;
    },

    // File "DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI CỦA DOANH NGHIỆP" — Danh Sách CSH gắn vào file này
    isCshListFile(file) {
      return String(file.name || '').toUpperCase().includes('DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI');
    },

    // Biến thuộc loop / CSH hưởng lợi (lấy từ Danh Sách CSH, không đưa vào form tự do)
    isMemberOrLoopVariable(ph) {
      if (!ph) return false;
      const t = String(ph).trim();
      if (t === '#listUser' || t === '/listUser' || t === 'listUser') return true;
      if (t.startsWith('tv1_')) return true;
      if (t === 'tỷ lệ % cđ1') return true;
      return false;
    },

    // Tự nhận diện biến thuộc Thông tin Công ty
    isCompanyField(ph) {
      if (!ph || this.isMemberOrLoopVariable(ph)) return false;
      const s = String(ph).trim().toLowerCase();
      if (s.includes('đại diện') || s.includes('đại điện') || s.startsWith('login_')) {
        return false;
      }
      if (this.isCompanyAddressField(ph)) return false;
      return (
        s.includes('công ty') ||
        s.includes('cty') ||
        s.includes('mã số thuế') ||
        s.includes('mst') ||
        s.includes('mã số doanh nghiệp') ||
        s.includes('phòng đkkd') ||
        s.includes('cơ quan đăng ký')
      );
    },

    // Nhận diện biến thuộc Địa chỉ trụ sở chính (mới)
    isCompanyAddressField(ph) {
      if (!ph) return false;
      const s = String(ph).trim().toLowerCase();
      return s === 'số nhà công ty' || s === 'phường công ty';
    },

    // Nhận diện biến thuộc thông tin & địa chỉ Đại diện PL (mới)
    isRepField(ph) {
      if (!ph || this.isMemberOrLoopVariable(ph)) return false;
      const s = String(ph).trim().toLowerCase();
      if (s.startsWith('login_')) return false;
      return s.includes('đại diện') || s.includes('đại điện');
    },

    // Nhận diện biến thuộc Người được ủy quyền
    isLoginField(ph) {
      if (!ph) return false;
      return String(ph).startsWith('Login_');
    },

    addUser() {
      this.userInfoForm.push({
        name: '', gender: 'Nam', birthday: '', idNumber: '',
        address: '', tlvd: '', tlcp: ''
      });
    },

    removeUser(index) {
      this.userInfoForm.splice(index, 1);
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
          'mã số thuế',
          'mã số doanh nghiệp',
          'thành phố công ty',
          'phòng đkkd tỉnh/tp',
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

        // 2. Khối Địa chỉ trụ sở chính (mới)
        const cAddrList = allPlaceholders.filter(p => this.isCompanyAddressField(p));
        const cAddrOrder = ['số nhà công ty', 'phường công ty'];
        cAddrList.sort((a, b) => {
          const idxA = cAddrOrder.indexOf(a.trim().toLowerCase());
          const idxB = cAddrOrder.indexOf(b.trim().toLowerCase());
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.localeCompare(b);
        });
        this.companyAddressPlaceholders = cAddrList;
        this.companyAddressValues = {};
        this.companyAddressPlaceholders.forEach(k => {
          this.companyAddressValues[k] = '';
        });

        // 3. Khối Thông tin & địa chỉ Đại diện PL (mới)
        const repList = allPlaceholders.filter(p => this.isRepField(p));
        const repOrder = [
          'họ tên đại diện',
          'giới tính đại diện',
          'sinh ngày đại diện',
          'số định danh cá nhân đại diện',
          'số nhà của đại điện',
          'phường của đại điện',
          'thành phố của đại điện',
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

        // 5. Khối Người được ủy quyền (Login_*)
        const authList = allPlaceholders.filter(p => this.isLoginField(p));
        this.authorizedPersonPlaceholders = authList;
        this.authorizedPersonValues = {};
        this.authorizedPersonPlaceholders.forEach(k => {
          this.authorizedPersonValues[k] = isGenderField(k) ? 'Nam' : '';
        });

        // Prune: loại các key đã thuộc các khối / loop CSH ra khỏi formValues từng file
        const blockKeys = new Set([
          ...this.companyPlaceholders,
          ...this.companyAddressPlaceholders,
          ...this.repPlaceholders,
          ...this.authorizedPersonPlaceholders,
          ...allPlaceholders.filter(k => this.isMemberOrLoopVariable(k)),
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
          autofillLoginPlaceholders(this.repValues, currentUser);
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
      Object.keys(this.companyAddressValues).forEach(k => (this.companyAddressValues[k] = ''));
      Object.keys(this.repValues).forEach(k => (this.repValues[k] = isGenderField(k) ? 'Nam' : ''));
      Object.keys(this.authorizedPersonValues).forEach(k => (this.authorizedPersonValues[k] = isGenderField(k) ? 'Nam' : ''));
      this.files.forEach(f => {
        Object.keys(f.formValues).forEach(k => (f.formValues[k] = isGenderField(k) ? 'Nam' : ''));
      });
      this.userInfoForm = [];

      const currentUser = useAuth().state.user;
      if (currentUser) {
        autofillLoginPlaceholders(this.companyValues, currentUser);
        autofillLoginPlaceholders(this.repValues, currentUser);
        autofillLoginPlaceholders(this.authorizedPersonValues, currentUser);
        this.files.forEach(f => autofillLoginPlaceholders(f.formValues, currentUser));
      }
    },

    // APPLY CHANGES
    async applyChanges() {
      if (this.userInfoForm.length < 1) {
        alert("Vui lòng thêm ít nhất 1 CSH hưởng lợi");
        return;
      }

      const loading = document.getElementById("loading-overlay");
      if (loading) loading.style.display = "flex";
      this.updating = true;
      try {
        await checkExportBalance();
        const buffers = await Promise.all(
          this.files.map(async f => this.fixUnclosedListUser(await this.fetchDocBuffer(this.extractDocId(f.link))))
        );

        const docs = buffers.map(buffer => this.createDoc(buffer));

        // listUser: mỗi CSH hưởng lợi 1 phần tử theo chuẩn tv1_*
        const listUser = this.userInfoForm.map(item => ({
          'Họ tên tv1': item.name || '',
          'ngày sinh tv1': item.birthday || '',
          'giới tính tv1': item.gender || '',
          'số định danh tv1': item.idNumber || '',
          'địa chỉ tv1': item.address || '',
          'tỷ lệ % tv1': item.tlvd || '',
          'tỷ lệ % cđ1': item.tlcp || '',
        }));

        // Lọc CSH hưởng lợi đạt ngưỡng >= 25% cho file Danh Sách CSH Hưởng Lợi
        const listUserCsh = filterCshHuongLoiList(listUser, 'auto');

        const renderDataList = this.files.map(file => ({
          ...this.companyValues,
          ...this.companyAddressValues,
          ...this.repValues,
          ...this.authorizedPersonValues,
          ...file.formValues,
          listUser: this.isCshListFile(file) ? listUserCsh : listUser,
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
        await deductExportFee('Cập Nhật CSH Hưởng Lợi, Địa Chỉ Cty, Địa Chỉ Đại Diện PL');
      } catch (error) {
        alert("không thể tạo file: " + error.message);
        console.log(JSON.stringify(error, null, 2));
        console.log(error.properties && error.properties.errors);
      } finally {
        this.updating = false;
        if (loading) loading.style.display = "none";
      }
    },

    // Vá template bị lỗi "Unclosed loop listUser" (thiếu tag [[/listUser]])
    fixUnclosedListUser(buffer) {
      try {
        const zip = new PizZip(buffer);
        const xml = zip.file('word/document.xml');
        if (!xml) return buffer;
        let content = xml.asText();
        const opens = (content.match(/\[\[#\s*listUser\]\]/g) || []).length;
        const closes = (content.match(/\[\[\/\s*listUser\]\]/g) || []).length;
        if (opens === closes + 1) {
          // thay tag mở cuối cùng bằng tag đóng
          const idx = content.lastIndexOf('[[#listUser]]');
          if (idx !== -1) {
            content = content.slice(0, idx) + '[[/listUser]]' + content.slice(idx + '[[#listUser]]'.length);
            zip.file('word/document.xml', content);
            return zip.generate({ type: 'arraybuffer' });
          }
        }
        return buffer;
      } catch (e) {
        console.log('fixUnclosedListUser error', e);
        return buffer;
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

<style scoped>
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.btn-add {
  background: #0284c7;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.btn-add:hover {
  background: #0369a1;
}
.btn-remove {
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.3rem 0.8rem;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.btn-remove:hover {
  background: #dc2626;
}
.required-hint {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 1rem;
}
.required-hint.missing {
  color: #dc2626;
}
.required-hint.ok {
  color: #16a34a;
}
.member-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8fafc;
}
.member-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.member-title {
  font-size: 14px;
  font-weight: 700;
  color: #0369a1;
}
.member-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}
.form-group-wide {
  grid-column: span 3;
}
.empty-hint {
  font-size: 13px;
  color: #64748b;
  font-style: italic;
}
</style>
