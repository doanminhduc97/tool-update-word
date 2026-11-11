<template>
  <div class="editor">
    <div class="card common-card" style="margin-bottom: 24px; text-align: center;">
      <h2 style="font-size: 1.25rem; font-weight: 700; color: #0284c7;">Hồ sơ tăng vốn công ty 2 thành viên</h2>
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

    <!-- KHỐI 2: THÔNG TIN NGƯỜI ĐẠI DIỆN PL & CHỦ TỊCH HĐTV -->
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

    <!-- KHỐI 3: DANH SÁCH THÀNH VIÊN (GĐN + Quyết định HĐTV + Danh sách thành viên + CSH hưởng lợi) -->
    <section class="card members-card">
      <div class="card-head">
        <h3 class="title-form">Danh Sách Thành Viên (GĐN + Quyết định HĐTV + Danh sách thành viên + CSH hưởng lợi)</h3>
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
            <h4 class="member-title">
              {{ index === 0 ? 'Thành viên 1 (TV1 - Đại diện ủy quyền)' : index === 1 ? 'Thành viên 2 (TV2)' : 'Thành viên ' + (index + 1) }}
            </h4>
            <button type="button" @click="removeUser(index)" class="btn-remove">Xóa</button>
          </div>
          <div class="member-grid">
            <div class="form-group">
              <label>Họ tên</label>
              <input type="text" v-model="item.name" placeholder="Nguyễn Văn A">
            </div>
            <div class="form-group">
              <label>Giới tính</label>
              <GenderRadio :name="'tv12-gender-' + index" v-model="item.gender" />
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

    <!-- Các trường riêng khác (nếu có trường nào không thuộc 4 khối trên) -->
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
import { filterCshHuongLoiList } from '@/lib/cshHelper';

export default {
  name: 'Home12',
  // Tăng Vốn Cty 2 Thành Viên
  data() {
    const files = [
      {
        name: '1. GĐN đăng ký thay đổi nội dung ĐKDN',
        link: 'https://docs.google.com/document/d/1hcrWYI_4kpo2DG6vspiMlpsttH4hsoyo/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '2. Quyết định của HĐTV',
        link: 'https://docs.google.com/document/d/1ySfT8D_U2a9J45vn51wextvYyX67vu4E/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '3. Danh sách thành viên',
        link: 'https://docs.google.com/document/d/1x6RWX_02p1_bAn-Isd1HstlAh-75EQkL/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '4. DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI CỦA DOANH NGHIỆP',
        link: 'https://docs.google.com/document/d/1Ypt_gVFn3YTTQkI-7iOO-PlqbF82TjUX/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '5. Giấy ủy quyền',
        link: 'https://docs.google.com/document/d/1lSh4VCJh6NbVpdsgyR3PNDL-vGGVTdJ2/edit?usp=drivesdk&rtpof=true&sd=true',
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

      // 2. Khối thông tin người đại diện PL + Chủ tịch HĐTV
      repPlaceholders: [],
      repValues: {},

      // 3. Khối thông tin người được ủy quyền (Login_*)
      authorizedPersonPlaceholders: [],
      authorizedPersonValues: {},

      updating: false,
      userInfoForm: [],
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
      // Loại trừ các trường thuộc người đại diện / chủ tịch hay người ủy quyền
      if (s.includes('đại diện') || s.includes('đại điện') || s.includes('chủ tịch') || s.startsWith('login_')) {
        return false;
      }
      // Loại trừ biến thành viên & slot TV1/TV2
      if (this.isMemberVar(ph)) return false;
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

    // Nhận diện biến thuộc Thông tin Người đại diện PL / Chủ tịch HĐTV
    isRepField(ph) {
      if (!ph) return false;
      const s = String(ph).trim().toLowerCase();
      if (s.startsWith('login_')) return false;
      if (this.isMemberVar(ph)) return false;
      return s.includes('đại diện') || s.includes('đại điện') || s.includes('chủ tịch');
    },

    // Nhận diện biến thuộc Người được ủy quyền
    isLoginField(ph) {
      if (!ph) return false;
      return String(ph).startsWith('Login_');
    },

    // Nhận diện biến thành viên (tv1_* + alias + slot TV1/TV2 + loop)
    isMemberVar(ph) {
      if (!ph) return false;
      const t = String(ph).trim();
      if (t === '#listUser' || t === '/listUser' || t === 'listUser') return true;
      if (t.startsWith('tv1_')) return true;
      // Alias key của file 4 (DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI)
      if (t === 'Họ tên tv1' || t === 'ngày sinh tv1' || t === 'giới tính tv1' ||
          t === 'số định danh tv1' || t === 'địa chỉ tv1' || t === 'tỷ lệ % tv1' ||
          t === 'tỷ lệ % cđ1') return true;
      // Slot TV1/TV2 tự lấy từ Danh Sách Thành Viên (TV1 = add đầu tiên, TV2 = tiếp theo)
      if (t === 'Họ tên TV1' || t === 'Số vốn góp TV1' || t === 'Tỷ lệ % vốn góp TV1' ||
          t === 'Họ tên TV2' || t === 'Số vốn góp TV2' || t === 'Tỷ lệ % vốn góp TV2') return true;
      return false;
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
      const loading = document.getElementById("loading-overlay");
      if (loading) loading.style.display = "flex";
      try {
        const arrays = await Promise.all(
          this.files.map(f => this.getPlaceholdersFromDoc(f.link))
        );

        this.files.forEach((f, i) => {
          f.allPlaceholders = arrays[i];
          const filtered = arrays[i].filter(key => !this.isMemberVar(key));
          f.placeholders = filtered;
          f.formValues = {};
          filtered.forEach(key => {
            f.formValues[key] = isGenderField(key) ? 'Nam' : '';
          });
        });

        // Thu thập toàn bộ placeholder trên cả 5 file để chia khối
        const allSet = new Set();
        arrays.forEach(arr => arr.forEach(k => {
          if (!this.isMemberVar(k)) allSet.add(k);
        }));
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

        // 2. Khối Người đại diện PL + Chủ tịch HĐTV
        const repList = allPlaceholders.filter(p => this.isRepField(p));
        const repOrder = [
          'họ tên đại diện',
          'giới tính đại diện',
          'sinh ngày đại diện',
          'số định danh cá nhân đại diện',
          'địa chỉ của đại điện',
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
      this.userInfoForm = [];

      const currentUser = useAuth().state.user;
      if (currentUser) {
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
        await deductExportFee('Tăng Vốn Cty 2 Thành Viên');
        const buffers = await Promise.all(
          this.files.map(f => this.fetchDocBuffer(this.extractDocId(f.link)))
        );

        const docs = buffers.map(buffer => this.createDoc(buffer));

        // listUser: mỗi thành viên 1 phần tử, key chuẩn tv1_* + alias file 4
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
          // Alias keys của file 4
          'Họ tên tv1': item.name || '',
          'ngày sinh tv1': item.birthday || '',
          'giới tính tv1': item.gender || '',
          'số định danh tv1': item.idNumber || '',
          'địa chỉ tv1': (item.homeNumber + ', ' + item.ward + ', ' + item.city).replace(/^(, )+/, '') || '',
          'tỷ lệ % tv1': item.tl || '',
        }));

        // Slot cố định TV1/TV2 lấy từ Danh Sách Thành Viên
        // (add đầu tiên = TV1, tiếp theo = TV2); Chủ tịch HĐTV điền trong khối Đại diện PL
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

        // Lọc listUser cho file 4 (DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI): chỉ giữ thành viên sở hữu vốn >= 25%
        const listUserCsh = filterCshHuongLoiList(listUser, 'von');

        const renderDataList = this.files.map(file => {
          const isCshDoc = file.name && file.name.includes('DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI');
          return {
            ...this.companyValues,
            ...this.repValues,
            ...this.authorizedPersonValues,
            ...file.formValues,
            ...tvFixed,
            listUser: isCshDoc ? listUserCsh : listUser,
          };
        });

        const outBlobs = docs.map((doc, i) => {
          const isFileCSH = this.files[i]?.name?.includes('DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI');
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

    extractDocId(url) {
      const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : null;
    },
  }
}
</script>

<style scoped>
.required-hint {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 8px;
}
.required-hint.missing {
  background: #fff7ed;
  border: 1px solid #fdba74;
  color: #c2410c;
}
.required-hint.ok {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
}
</style>
