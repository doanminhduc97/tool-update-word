<template>
  <div class="editor">
    <PageLoader v-if="pageLoading" title="Đang tải hồ sơ Giảm vốn công ty 2 thành viên..." :error="pageError" @retry="loadData" />
    <template v-else>
      <div class="card common-card" style="margin-bottom: 24px; text-align: center;">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #0284c7;">Hồ sơ giảm vốn công ty 2 thành viên</h2>
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

    <!-- KHỐI 2: DANH SÁCH THÀNH VIÊN (ít nhất 2 thành viên) -->
    <section class="card common-card">
      <div class="card-head">
        <h3 class="title-form">Danh Sách Thành Viên</h3>
        <button type="button" @click="addUser" class="btn-add">Thêm thành viên</button>
      </div>
      <p :class="userInfoForm.length < 2 ? 'required-hint missing' : 'required-hint ok'">
        {{ userInfoForm.length < 2
          ? `⚠️ Bắt buộc ít nhất 2 thành viên (hiện có ${userInfoForm.length})`
          : `✓ Đã đủ tối thiểu ${userInfoForm.length} thành viên` }}
      </p>
      <template v-if="userInfoForm.length > 0">
        <div v-for="(item, index) in userInfoForm" :key="index" class="member-card">
          <div class="member-head">
            <h4 class="member-title">Thành viên {{ index + 1 }}</h4>
            <button type="button" @click="removeUser(index)" class="btn-remove">Xóa</button>
          </div>
          <div class="member-grid">
            <div class="form-group">
              <label>Họ tên</label>
              <input type="text" v-model="item.name" placeholder="Nguyễn Văn A">
            </div>
            <div class="form-group">
              <label>Giới tính</label>
              <GenderRadio :name="'tv15-gender-' + index" v-model="item.gender" />
            </div>
            <div class="form-group">
              <label>Ngày sinh</label>
              <input type="text" v-model="item.birthday" placeholder="DD/MM/YYYY">
            </div>
            <div class="form-group">
              <label>Số định danh cá nhân</label>
              <input type="text" v-model="item.idNumber" placeholder="Số CCCD">
            </div>
            <div class="form-group">
              <label>Số nhà</label>
              <input type="text" v-model="item.homeNumber" placeholder="Số nhà, đường">
            </div>
            <div class="form-group">
              <label>Phường</label>
              <input type="text" v-model="item.ward" placeholder="Phường / Xã">
            </div>
            <div class="form-group">
              <label>Tỉnh</label>
              <input type="text" v-model="item.city" placeholder="Tỉnh / Thành phố">
            </div>
            <div class="form-group">
              <label>Chức danh</label>
              <input type="text" v-model="item.position" placeholder="Thành viên công ty / Chủ tịch HĐTV">
            </div>
            <div class="form-group">
              <label>Vốn góp bằng số</label>
              <input type="text" v-model="item.vbs" placeholder="Ví dụ: 500.000.000">
            </div>
            <div class="form-group">
              <label>Vốn góp bằng chữ</label>
              <input type="text" v-model="item.vbc" placeholder="Năm tỷ Việt Nam đồng...">
            </div>
            <div class="form-group">
              <label>Tỷ lệ % vốn góp</label>
              <input type="text" v-model="item.tl" placeholder="Ví dụ: 50 hoặc 50%">
            </div>
          </div>
        </div>
      </template>
      <p v-else class="empty-hint">Chưa có thành viên nào. Nhấn "Thêm thành viên" để bắt đầu.</p>
    </section>

    <!-- KHỐI 3: THÔNG TIN NGƯỜI ĐẠI DIỆN PL & CHỦ TỊCH HĐTV -->
    <section v-show="repPlaceholders.length" class="card common-card">
      <h3 class="title-form">Thông Tin Người Đại Diện Pháp Luật &amp; Chủ Tịch HĐTV</h3>
      <form>
        <div v-for="ph in repPlaceholders" :key="'rep-' + ph" class="form-group">
          <label :for="'rep-' + ph">{{ formatLabel(ph) }}</label>
          <GenderRadio v-if="isGenderField(ph)" :name="'rep-' + ph" v-model="repValues[ph]" />
          <input v-else type="text" :id="'rep-' + ph" v-model="repValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- KHỐI 4: THÔNG TIN NGƯỜI ĐƯỢC ỦY QUYỀN (Autofill từ phiên đăng nhập) -->
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

    <!-- KHỐI 5: Các trường riêng khác (nếu có trường nào không thuộc các khối trên) -->
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

    <FileExportFormatSelector
      v-if="hasAnyForm"
      :files="exportFilesList"
      v-model="exportFormats"
    />

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
import FileExportFormatSelector from '@/components/FileExportFormatSelector.vue';
import { exportFilesWithFormats } from '@/services/fileExportService';
import { useAuth } from '@/stores/auth';
import { autofillLoginPlaceholders } from '@/lib/loginPlaceholders';
import { enforceTimesNewRoman } from '@/lib/fontHelper';
import { isGenderField } from '@/lib/genderHelper';

export default {
  name: 'Home15',
  components: {
    FileExportFormatSelector,
  },
  // Giảm Vốn Cty 2 Thành Viên
  data() {
    const files = [
      {
        name: '1. GĐN đăng ký thay đổi nội dung ĐKDN',
        link: 'https://docs.google.com/document/d/1r7_MojOYh0FKZAlMqZ8sa0kERM4kfyki/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '2. Quyết định của HĐTV',
        link: 'https://docs.google.com/document/d/1WHMSM25hADG10WblamZ_yRhIJAZpyL6d/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '3. Danh sách thành viên',
        link: 'https://docs.google.com/document/d/13GkLIJ5m3eqYoA4GaB1TBkQArFtubRu0/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '4. Cam kết bảo đảm khi giảm vốn điều lệ',
        link: 'https://docs.google.com/document/d/1i4A8L0YM60EGQ6s4QNfGGT0-ZXLKp_rr/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '5. Giấy ủy quyền',
        link: 'https://docs.google.com/document/d/1e2pTVk_bnLijZC5PcJajU7Gkxm4ORmYy/edit?usp=drivesdk&rtpof=true&sd=true',
      },
    ].map(f => ({
      ...f,
      placeholders: [],
      allPlaceholders: [],
      formValues: {},
    }));
    return {
      files,
      exportFilesList: files.map(f => ({ name: f.name })),
      exportFormats: Object.fromEntries(files.map(f => [f.name, 'docx'])),
      // 1. Khối thông tin công ty
      companyPlaceholders: [],
      companyValues: {},

      // 2. Khối danh sách thành viên
      userInfoForm: [],

      // 3. Khối thông tin người đại diện PL + Chủ tịch HĐTV
      repPlaceholders: [],
      repValues: {},

      // 4. Khối thông tin người được ủy quyền (Login_*)
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
            return !this.isCompanyField(ph) && !this.isRepField(ph)
              && !this.isLoginField(ph) && !this.isMemberOrLoopVariable(ph);
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

    // Biến thuộc loop / thành viên (lấy từ Danh Sách Thành Viên, không đưa vào form tự do)
    isMemberOrLoopVariable(ph) {
      if (!ph) return false;
      const t = String(ph).trim();
      if (t === '#listUser' || t === '/listUser' || t === 'listUser') return true;
      if (t.startsWith('tv1_')) return true;
      if (t === 'Họ tên TV1' || t === 'Số vốn góp TV1' || t === 'Tỷ lệ % vốn góp TV1' ||
          t === 'Họ tên TV2' || t === 'Số vốn góp TV2' || t === 'Tỷ lệ % vốn góp TV2') return true;
      return false;
    },

    // Tự nhận diện biến thuộc Thông tin Công ty
    isCompanyField(ph) {
      if (!ph || this.isMemberOrLoopVariable(ph)) return false;
      const s = String(ph).trim().toLowerCase();
      // Loại trừ các trường thuộc người đại diện / chủ tịch hay người ủy quyền
      if (s.includes('đại diện') || s.includes('đại điện') || s.includes('chủ tịch')) {
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
        s.includes('hình thức') ||
        s.includes('giảm vốn') ||
        s.includes('thời điểm')
      );
    },

    // Nhận diện biến thuộc Người đại diện PL / Chủ tịch HĐTV
    isRepField(ph) {
      if (!ph || this.isMemberOrLoopVariable(ph)) return false;
      const s = String(ph).trim().toLowerCase();
      if (s.startsWith('login_')) return false;
      return s.includes('đại diện') || s.includes('đại điện') || s.includes('chủ tịch');
    },

    // Nhận diện biến thuộc Người được ủy quyền
    isLoginField(ph) {
      if (!ph) return false;
      return String(ph).startsWith('Login_');
    },

    addUser() {
      this.userInfoForm.push({
        name: '', gender: 'Nam', birthday: '', idNumber: '',
        homeNumber: '', ward: '', city: '',
        position: '', vbs: '', vbc: '', tl: ''
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
          'mã số doanh nghiệp',
          'tỉnh công ty',
          'cơ quan đăng ký kinh doanh cấp tỉnh',
          'vốn điều lệ hiện tại',
          'vốn điều lệ hiện tại bằng chữ',
          'vốn điều lệ mới',
          'vốn điều lệ mới bằng chữ',
          'hình thức giảm vốn',
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

        // 3. Khối Người đại diện PL + Chủ tịch HĐTV
        const repList = allPlaceholders.filter(p => this.isRepField(p));
        const repOrder = [
          'họ tên đại diện',
          'giới tính đại diện',
          'sinh ngày đại diện',
          'số định danh cá nhân đại diện',
          'địa chỉ của đại điện',
          'họ tên chủ tịch hd tv',
          'họ tên chủ tịch hđtv',
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

        // 4. Khối Người được ủy quyền (Login_*)
        const authList = allPlaceholders.filter(p => this.isLoginField(p));
        this.authorizedPersonPlaceholders = authList;
        this.authorizedPersonValues = {};
        this.authorizedPersonPlaceholders.forEach(k => {
          this.authorizedPersonValues[k] = isGenderField(k) ? 'Nam' : '';
        });

        // Prune: loại các key đã thuộc các khối / loop thành viên ra khỏi formValues từng file
        const blockKeys = new Set([
          ...this.companyPlaceholders,
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
      if (this.userInfoForm.length < 2) {
        alert("Vui lòng thêm ít nhất 2 thành viên");
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

        // listUser: mỗi thành viên 1 phần tử theo chuẩn tv1_*
        const listUser = this.userInfoForm.map(item => ({
          'tv1_Giới tính': item.gender || '',
          'tv1_Họ tên': item.name || '',
          'tv1_Số định danh cá nhân': item.idNumber || '',
          'tv1_chức danh': item.position || '',
          'tv1_ngày sinh': item.birthday || '',
          'tv1_phường': item.ward || '',
          'tv1_số nhà': item.homeNumber || '',
          'tv1_tỉ lệ %': item.tl || '',
          'tv1_tỉnh': item.city || '',
          'tv1_vốn bằng chữ': item.vbc || '',
          'tv1_vốn bằng số': item.vbs || '',
          // tương thích các field viết thiếu TV1_* trong template (dòng loop "Số vốn góp"...)
          'Họ tên TV2': item.name || '',
          'Số vốn góp': item.vbs || '',
          'Tỷ lệ % vốn góp': item.tl || '',
        }));

        // Slot cố định TV1/TV2 lấy từ Danh Sách Thành Viên (TV1 = add đầu tiên, TV2 = tiếp theo)
        const tv1 = this.userInfoForm[0] || {};
        const tv2 = this.userInfoForm[1] || {};
        const tvFixed = {
          'Họ tên TV1': tv1.name || '',
          'Số vốn góp TV1': tv1.vbs || '',
          'Tỷ lệ % vốn góp TV1': tv1.tl || '',
          'Họ tên TV2': tv2.name || '',
          'Số vốn góp TV2': tv2.vbs || '',
          'Tỷ lệ % vốn góp TV2': tv2.tl || '',
        };

        const renderDataList = this.files.map(file => ({
          ...this.companyValues,
          ...tvFixed,
          ...this.repValues,
          ...this.authorizedPersonValues,
          ...file.formValues,
          listUser,
        }));

        const outBlobs = docs.map((doc, i) => this.renderToBlob(doc, renderDataList[i]));

        const fileArr = this.files.map((file, i) => ({
          name: file.name,
          data: outBlobs[i],
        }));

        await exportFilesWithFormats(
          fileArr,
          this.exportFormats,
          'Giảm Vốn Cty 2 Thành Viên'
        );
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
.empty-hint {
  font-size: 13px;
  color: #64748b;
  font-style: italic;
}
</style>
