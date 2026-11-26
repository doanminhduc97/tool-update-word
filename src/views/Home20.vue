<template>
  <div class="editor">
    <PageLoader v-if="pageLoading" title="Đang tải hồ sơ Chuyển đổi 1TV sang 2TV (CSH cũ là đại diện PL)..." :error="pageError" @retry="loadData" />
    <template v-else>
      <div class="card common-card" style="margin-bottom: 24px; text-align: center;">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #0284c7;">Hồ sơ chuyển đổi loại hình: Cty 1TV sang 2TV (CSH cũ tiếp tục là đại diện PL)</h2>
      </div>

      <!-- KHỐI 1: THÔNG TIN CÔNG TY & CHUYỂN ĐỔI -->
      <section v-show="companyPlaceholders.length" class="card common-card">
        <h3 class="title-form">1. Thông Tin Công Ty &amp; Chuyển Đổi</h3>
        <form>
          <div v-for="ph in companyPlaceholders" :key="'comp-' + ph" class="form-group">
            <label :for="'comp-' + ph">{{ formatLabel(ph) }}</label>
            <PhongDkkdInput v-if="ph === 'Cơ quan đăng ký kinh doanh cấp tỉnh' || ph === 'Phòng ĐKKD Tỉnh/TP'" :input-id="'comp-' + ph" v-model="companyValues[ph]" />
            <ProvinceSelectInput v-else-if="isProvinceField(ph)" :input-id="'comp-' + ph" v-model="companyValues[ph]" />
            <GenderRadio v-else-if="isGenderField(ph)" :name="'comp-' + ph" v-model="companyValues[ph]" />
            <input v-else type="text" :id="'comp-' + ph" v-model="companyValues[ph]" required>
          </div>
        </form>
      </section>

      <!-- KHỐI 2: THÔNG TIN CSH CŨ - ĐẠI DIỆN PHÁP LUẬT (BÊN A - CHUYỂN NHƯỢNG & ĐẠI DIỆN TIẾP TỤC) -->
      <section v-show="oldOwnerPlaceholders.length" class="card common-card">
        <h3 class="title-form">2. Thông Tin CSH Cũ - Người Đại Diện Pháp Luật (Bên A - Chuyển Nhượng)</h3>
        <form>
          <div v-for="ph in oldOwnerPlaceholders" :key="'old-' + ph" class="form-group">
            <label :for="'old-' + ph">{{ formatLabel(ph) }}</label>
            <ProvinceSelectInput v-if="isProvinceField(ph)" :input-id="'old-' + ph" v-model="oldOwnerValues[ph]" />
            <GenderRadio v-else-if="isGenderField(ph)" :name="'old-' + ph" v-model="oldOwnerValues[ph]" />
            <input v-else type="text" :id="'old-' + ph" v-model="oldOwnerValues[ph]" required>
          </div>
        </form>
      </section>

      <!-- KHỐI 3: THÔNG TIN HỢP ĐỒNG CHUYỂN NHƯỢNG & THANH LÝ -->
      <section v-show="transferPlaceholders.length" class="card common-card">
        <h3 class="title-form">3. Thông Tin Hợp Đồng Chuyển Nhượng &amp; Thanh Lý</h3>
        <form>
          <div v-for="ph in transferPlaceholders" :key="'transfer-' + ph" class="form-group">
            <label :for="'transfer-' + ph">{{ formatLabel(ph) }}</label>
            <input type="text" :id="'transfer-' + ph" v-model="transferValues[ph]" required>
          </div>
        </form>
      </section>

      <!-- KHỐI 4: THÀNH VIÊN MỚI NHẬN CHUYỂN NHƯỢNG / GÓP VỐN (BÊN B) -->
      <section class="card members-card">
        <div class="card-head">
          <h3 class="title-form">4. Danh Sách Thành Viên Mới Nhận Chuyển Nhượng / Góp Thêm (Bên B)</h3>
          <button type="button" @click="addUser" class="btn-add">Thêm thành viên</button>
        </div>
        <p :class="userInfoForm.length < 1 ? 'required-hint missing' : 'required-hint ok'">
          {{ userInfoForm.length < 1
            ? `⚠️ Cần thêm ít nhất 1 thành viên mới để công ty đạt đủ từ 2 thành viên trở lên.`
            : `✓ Đã có ${userInfoForm.length} thành viên mới (kết hợp với CSH cũ tạo thành ${userInfoForm.length + 1} thành viên công ty)` }}
        </p>
        <template v-if="userInfoForm.length > 0">
          <div v-for="(item, index) in userInfoForm" :key="index" class="member-card">
            <div class="member-head">
              <h4 class="member-title">
                {{ index === 0 ? 'Thành viên mới 1 (Bên B nhận chuyển nhượng vốn)' : 'Thành viên mới ' + (index + 1) }}
              </h4>
              <button type="button" @click="removeUser(index)" class="btn-remove">Xóa</button>
            </div>
            <div class="member-grid">
              <div class="form-group">
                <label>Họ và tên</label>
                <input type="text" v-model="item.name" placeholder="Trần Thị B">
              </div>
              <div class="form-group">
                <label>Giới tính</label>
                <GenderRadio :name="'tv20-gender-' + index" v-model="item.gender" />
              </div>
              <div class="form-group">
                <label>Ngày sinh</label>
                <input type="text" v-model="item.birthday" placeholder="DD/MM/YYYY">
              </div>
              <div class="form-group">
                <label>Số định danh cá nhân / CCCD</label>
                <input type="text" v-model="item.idNumber" placeholder="Số CCCD">
              </div>
              <div class="form-group">
                <label>Số nhà, đường</label>
                <input type="text" v-model="item.homeNumber" placeholder="Số nhà, đường">
              </div>
              <div class="form-group">
                <label>Phường / Xã</label>
                <input type="text" v-model="item.ward" placeholder="Phường / Xã">
              </div>
              <div class="form-group">
                <label>Tỉnh / Thành phố</label>
                <ProvinceSelectInput :input-id="'tv20-province-' + index" v-model="item.city" />
              </div>
              <div class="form-group">
                <label>Chức danh</label>
                <input type="text" v-model="item.position" placeholder="Chủ tịch HĐTV / Thành viên">
              </div>
              <div class="form-group">
                <label>Vốn góp bằng số (VNĐ)</label>
                <input type="text" v-model="item.vbs" placeholder="Ví dụ: 400.000.000">
              </div>
              <div class="form-group">
                <label>Vốn góp bằng chữ</label>
                <input type="text" v-model="item.vbc" placeholder="Bốn trăm triệu đồng">
              </div>
              <div class="form-group">
                <label>Tỷ lệ % vốn góp</label>
                <input type="text" v-model="item.tl" placeholder="Ví dụ: 40">
              </div>
            </div>
          </div>
        </template>
        <p v-else class="empty-hint">Chưa có thành viên mới nào. Nhấn "Thêm thành viên" để bắt đầu.</p>
      </section>

      <!-- KHỐI 5: NGÀNH NGHỀ KINH DOANH -->
      <section class="card">
        <h3 class="title-form">5. Ngành Nghề Kinh Doanh</h3>
        <div class="checkbox-grid">
          <div class="form-group1">
            <input type="checkbox" id="cd2_nnbbth" class="checkbox" v-model="nnbbth">
            <label class="checkbox-item" for="cd2_nnbbth">Ngành Nghề Buôn Bán Tổng Hợp</label>
          </div>
          <div class="form-group1">
            <input type="checkbox" class="checkbox" id="cd2_nnmm" v-model="nnmm">
            <label class="checkbox-item" for="cd2_nnmm">Ngành Nghề May Mặc</label>
          </div>
          <div class="form-group1">
            <input type="checkbox" class="checkbox" id="cd2_nnxd" v-model="nnxd">
            <label class="checkbox-item" for="cd2_nnxd">Ngành Nghề Xây Dựng</label>
          </div>
          <div class="form-group1">
            <input type="checkbox" class="checkbox" id="cd2_bbqa" v-model="bbqa">
            <label class="checkbox-item" for="cd2_bbqa">Buôn Bán Quần Áo</label>
          </div>
          <div class="form-group1">
            <input type="checkbox" class="checkbox" id="cd2_nnth" v-model="nnth">
            <label class="checkbox-item" for="cd2_nnth">Ngành Nghề Tổng Hợp</label>
          </div>
          <div class="form-group1">
            <input type="checkbox" class="checkbox" id="cd2_nncxcq" v-model="nncxcq">
            <label class="checkbox-item" for="cd2_nncxcq">Ngành Nghề Cây Xanh, Cảnh Quan</label>
          </div>
          <div class="form-group1">
            <input type="checkbox" class="checkbox" id="cd2_nngd" v-model="nngd">
            <label class="checkbox-item" for="cd2_nngd">Ngành Nghề Giáo Dục</label>
          </div>
        </div>
      </section>

      <!-- KHỐI 6: THÔNG TIN NGƯỜI ĐƯỢC ỦY QUYỀN (Autofill từ phiên đăng nhập) -->
      <section v-show="authorizedPersonPlaceholders.length" class="card common-card">
        <h3 class="title-form">6. Thông Tin Người Được Ủy Quyền</h3>
        <form>
          <div v-for="ph in authorizedPersonPlaceholders" :key="'auth-' + ph" class="form-group">
            <label :for="'auth-' + ph">{{ formatLabel(ph) }}</label>
            <ProvinceSelectInput v-if="isProvinceField(ph)" :input-id="'auth-' + ph" v-model="authorizedPersonValues[ph]" />
            <GenderRadio v-else-if="isGenderField(ph)" :name="'auth-' + ph" v-model="authorizedPersonValues[ph]" />
            <input v-else type="text" :id="'auth-' + ph" v-model="authorizedPersonValues[ph]" required>
          </div>
        </form>
      </section>

      <!-- FileExportFormatSelector -->
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
import { autofillLoginPlaceholders, isProvinceField } from '@/lib/loginPlaceholders';
import { enforceTimesNewRoman } from '@/lib/fontHelper';
import { isGenderField } from '@/lib/genderHelper';
import { filterCshHuongLoiList } from '@/lib/cshHelper';
import PhongDkkdInput from '@/components/PhongDkkdInput.vue';
import ProvinceSelectInput from '@/components/ProvinceSelectInput.vue';
import PageLoader from '@/components/PageLoader.vue';
import GenderRadio from '@/components/GenderRadio.vue';

// Import danh mục ngành nghề kinh doanh
import buonBanTongHop from '@/data/buonBanTongHop.json';
import buonBanQuanAo from '@/data/buonBanQuanAo.json';
import cayXanhCanhQuan from '@/data/cayXanhCanhQuan.json';
import giaoDuc from '@/data/giaoDuc.json';
import mayMac from '@/data/mayMac.json';
import nganhNgheTongHop from '@/data/nganhNgheTongHop.json';
import xayDung from '@/data/xayDung.json';

export default {
  name: 'Home20',
  components: {
    FileExportFormatSelector,
    PhongDkkdInput,
    ProvinceSelectInput,
    PageLoader,
    GenderRadio,
  },
  data() {
    const files = [
      {
        name: '1. GĐN Đăng ký doanh nghiệp',
        filename: '1. GĐN Đăng ký doanh nghiệp.docx',
        link: 'https://docs.google.com/document/d/1uLFsS255QJwVtjnuoLWNVGQLjEQ5GHB-/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '2. Điều lệ công ty',
        filename: '2. Điều lệ công ty.docx',
        link: 'https://docs.google.com/document/d/1T1Xw33-2CCVwFgDKLGaG_ZmcDjS_Uhjy/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '3. Danh sách thành viên',
        filename: '3. Danh sách thành viên .docx',
        link: 'https://docs.google.com/document/d/1vFnUyhr6HAEjUXjxH5LUUXS_4MdiX71n/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '4. DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI CỦA DOANH NGHIỆP',
        filename: '4. DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI CỦA DOANH NGHIỆP.docx',
        link: 'https://docs.google.com/document/d/1YudnQR--XZX8m44vKrlsvsgTMP7otN2v/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '5. Hợp đồng chuyển nhượng số 1',
        filename: '5.Hợp đồng chuyển nhượng số 1.docx',
        link: 'https://docs.google.com/document/d/1YeXJ3jzBpK-ggnKc276WbzocFLyJSXwY/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '6. Biên bản thanh lý HĐCN số 1',
        filename: '6. Biên bản thanh lý HĐCN số 1.docx',
        link: 'https://docs.google.com/document/d/1sWivkrabAGkkWtlYnjeqykTXoGoQCpRP/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '7. Giấy ủy quyền',
        filename: '7. Giấy ủy quyền.docx',
        link: 'https://docs.google.com/document/d/1G-xR3NLFAjB9luApT0lnEh-A8-Vewx0L/edit?usp=drivesdk&rtpof=true&sd=true',
      },
    ].map(f => ({
      ...f,
      placeholders: [],
      allPlaceholders: [],
    }));

    return {
      files,
      exportFilesList: files.map(f => ({ name: f.name })),
      exportFormats: Object.fromEntries(files.map(f => [f.name, 'docx'])),

      // Khối 1: Thông tin công ty & Chuyển đổi
      companyPlaceholders: [],
      companyValues: {},

      // Khối 2: CSH cũ - Đại diện PL
      oldOwnerPlaceholders: [],
      oldOwnerValues: {},

      // Khối 3: Chuyển nhượng vốn & HĐCN
      transferPlaceholders: [],
      transferValues: {},

      // Khối 4: Thành viên mới nhận chuyển nhượng / góp vốn
      userInfoForm: [
        {
          name: '', gender: 'Nam', birthday: '', idNumber: '',
          homeNumber: '', ward: '', city: 'Thành phố Hà Nội',
          position: 'Thành viên', vbs: '', vbc: '', tl: ''
        }
      ],

      // Khối 5: Ngành nghề kinh doanh
      nnbbth: true,
      nnmm: false,
      nnxd: false,
      bbqa: false,
      nnth: false,
      nncxcq: false,
      nngd: false,

      // Khối 6: Người được ủy quyền
      authorizedPersonPlaceholders: [],
      authorizedPersonValues: {},

      updating: false,
      pageLoading: true,
      pageError: null,
    };
  },

  computed: {
    hasAnyForm() {
      return this.companyPlaceholders.length > 0 ||
        this.oldOwnerPlaceholders.length > 0 ||
        this.transferPlaceholders.length > 0 ||
        this.authorizedPersonPlaceholders.length > 0;
    },
  },

  watch: {
    userInfoForm: {
      handler() {
        this.syncExportFilesList();
      },
      deep: true,
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
        await this.initGapi().catch(e => console.warn('GAPI init warning:', e));
        await this.getFile();
      } catch (err) {
        console.error(err);
        this.pageError = err?.message || 'Lỗi khi tải mẫu hồ sơ';
      } finally {
        this.pageLoading = false;
      }
    },

    async initGapi() {
      if (typeof gapi === 'undefined') return;
      await new Promise(resolve => gapi.load('client', resolve));
      await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      });
    },

    formatLabel(ph) {
      if (!ph) return '';
      let s = String(ph).trim();
      if (s.startsWith('Login_')) return s.slice(6).trim();
      if (s.startsWith('ct_')) {
        const raw = s.slice(3).trim();
        if (raw) {
          const capitalized = raw.charAt(0).toUpperCase() + raw.slice(1);
          return capitalized + ' (Công ty)';
        }
      }
      if (s.startsWith('CSH cũ_')) {
        const raw = s.slice(7).trim();
        if (raw) {
          const capitalized = raw.charAt(0).toUpperCase() + raw.slice(1);
          return capitalized + ' (CSH cũ)';
        }
      }
      if (s.toLowerCase() === 'họ tên csh cũ') {
        return 'Họ tên (CSH cũ)';
      }
      return s;
    },

    isProvinceField(ph) {
      return isProvinceField(ph);
    },

    isGenderField(ph) {
      return isGenderField(ph);
    },

    isMemberVar(ph) {
      if (!ph) return false;
      const t = String(ph).trim();
      if (['#listUser', '/listUser', '#listUser2', '/listUser2', '#nganhList', '/nganhList', 'id', 'name', 'code', 'tv2_Họ tên', 'tv3_Họ tên'].includes(t)) {
        return true;
      }
      if (t.startsWith('tv1_') || t.startsWith('tv_')) return true;
      return false;
    },

    isOldOwnerField(ph) {
      if (!ph) return false;
      const s = String(ph).trim();
      return s.startsWith('CSH cũ_') || s === 'Họ tên CSH cũ';
    },

    isTransferField(ph) {
      if (!ph) return false;
      const s = String(ph).trim();
      return ['số HĐ', 'toàn bộ/một phần', 'số tiền bằng số', 'số tiền bằng chữ', 'Tỷ lệ % vốn góp'].includes(s);
    },

    isLoginField(ph) {
      if (!ph) return false;
      return String(ph).startsWith('Login_');
    },

    isCompanyField(ph) {
      if (!ph) return false;
      if (this.isMemberVar(ph) || this.isOldOwnerField(ph) || this.isTransferField(ph) || this.isLoginField(ph)) {
        return false;
      }
      return true;
    },

    addUser() {
      this.userInfoForm.push({
        name: '', gender: 'Nam', birthday: '', idNumber: '',
        homeNumber: '', ward: '', city: 'Thành phố Hà Nội',
        position: 'Thành viên', vbs: '', vbc: '', tl: ''
      });
      this.syncExportFilesList();
    },

    removeUser(index) {
      if (this.userInfoForm.length <= 1) {
        alert('Cần có ít nhất 1 thành viên mới để công ty chuyển đổi thành 2 thành viên trở lên!');
        return;
      }
      this.userInfoForm.splice(index, 1);
      this.syncExportFilesList();
    },

    syncExportFilesList() {
      const list = [];
      const newFormats = { ...this.exportFormats };

      this.files.forEach(f => {
        if (f.name.includes('5. Hợp đồng chuyển nhượng') || f.name.includes('6. Biên bản thanh lý')) {
          return;
        }
        list.push({ name: f.name });
        if (!newFormats[f.name]) newFormats[f.name] = 'docx';
      });

      this.userInfoForm.forEach((_, idx) => {
        const num = idx + 1;
        const hdName = `5. Hợp đồng chuyển nhượng số ${num}`;
        const tlName = `6. Biên bản thanh lý HĐCN số ${num}`;
        list.push({ name: hdName });
        list.push({ name: tlName });
        if (!newFormats[hdName]) newFormats[hdName] = 'docx';
        if (!newFormats[tlName]) newFormats[tlName] = 'docx';
      });

      this.exportFilesList = list;
      this.exportFormats = newFormats;
    },

    async getFile() {
      const arrays = await Promise.all(
        this.files.map(f => this.getPlaceholdersFromFile(f))
      );

      const allSet = new Set();
      arrays.forEach(arr => arr.forEach(k => {
        if (!this.isMemberVar(k)) allSet.add(k);
      }));
      const allPlaceholders = [...allSet];

      // 1. Khối Công ty
      const compOrder = [
        'TÊN CÔNG TY HIỆN TẠI',
        'Mã số doanh nghiệp',
        'Lý do chuyển đổi loại hình',
        'TÊN CÔNG TY SAU KHI CĐ',
        'TÊN TIẾNG ANH CÔNG TY SAU KHI CĐ',
        'TÊN VIẾT TẮT CÔNG TY SAU KHI CĐ',
        'ct_số nhà',
        'ct_phường',
        'ct_tỉnh',
        'ct_số điện thoại',
        'ct_email',
        'Cơ quan đăng ký kinh doanh cấp tỉnh',
        'ct_vốn bằng số',
        'ct_vốn bằng chữ',
      ];
      const compList = allPlaceholders.filter(p => this.isCompanyField(p) && p !== 'TÊN CÔNG TY');
      compList.sort((a, b) => {
        const idxA = compOrder.indexOf(a);
        const idxB = compOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
      });
      this.companyPlaceholders = compList;
      this.companyValues = {};
      this.companyPlaceholders.forEach(k => {
        if (k === 'ct_tỉnh') this.companyValues[k] = 'Thành phố Hà Nội';
        else if (k === 'Lý do chuyển đổi loại hình') this.companyValues[k] = 'Tiếp nhận thêm thành viên mới góp vốn vào công ty';
        else this.companyValues[k] = isGenderField(k) ? 'Nam' : '';
      });

      // 2. Khối CSH cũ - Đại diện PL
      const oldOrder = [
        'CSH cũ_Họ tên',
        'Họ tên CSH cũ',
        'CSH cũ_Giới tính',
        'CSH cũ_ngày sinh',
        'CSH cũ_Số định danh cá nhân',
        'CSH cũ_số nhà',
        'CSH cũ_phường',
        'CSH cũ_tỉnh',
        'CSH cũ_chức danh',
        'CSH cũ_vốn bằng số',
        'CSH cũ_vốn bằng chữ',
        'CSH cũ_tỉ lệ %',
      ];
      const oldList = allPlaceholders.filter(p => this.isOldOwnerField(p) && p !== 'Họ tên CSH cũ');
      oldList.sort((a, b) => oldOrder.indexOf(a) - oldOrder.indexOf(b));
      this.oldOwnerPlaceholders = oldList;
      this.oldOwnerValues = {};
      this.oldOwnerPlaceholders.forEach(k => {
        if (k === 'CSH cũ_tỉnh') this.oldOwnerValues[k] = 'Thành phố Hà Nội';
        else if (k === 'CSH cũ_chức danh') this.oldOwnerValues[k] = 'Giám đốc';
        else this.oldOwnerValues[k] = isGenderField(k) ? 'Nam' : '';
      });

      // 3. Khối Chuyển nhượng & Thanh lý
      const transferOrder = [
        'số HĐ',
        'toàn bộ/một phần',
        'số tiền bằng số',
        'số tiền bằng chữ',
        'Tỷ lệ % vốn góp',
      ];
      const transferList = allPlaceholders.filter(p => this.isTransferField(p));
      transferList.sort((a, b) => transferOrder.indexOf(a) - transferOrder.indexOf(b));
      this.transferPlaceholders = transferList;
      this.transferValues = {
        'số HĐ': '01/HĐCN',
        'toàn bộ/một phần': 'một phần',
        'số tiền bằng số': '',
        'số tiền bằng chữ': '',
        'Tỷ lệ % vốn góp': '',
      };

      // 4. Khối Người được ủy quyền (Login_*)
      const authList = allPlaceholders.filter(p => this.isLoginField(p));
      this.authorizedPersonPlaceholders = authList;
      this.authorizedPersonValues = {};
      this.authorizedPersonPlaceholders.forEach(k => {
        this.authorizedPersonValues[k] = isGenderField(k) ? 'Nam' : '';
      });

      // Autofill Login user
      const currentUser = useAuth().state.user;
      if (currentUser) {
        autofillLoginPlaceholders(this.companyValues, currentUser);
        autofillLoginPlaceholders(this.authorizedPersonValues, currentUser);
      }

      this.syncExportFilesList();
    },

    async getPlaceholdersFromFile(fileInfo) {
      try {
        const buffer = await this.fetchFileBuffer(fileInfo);
        const zip = new PizZip(buffer);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
          delimiters: { start: '[[', end: ']]' },
        });
        const text = doc.getFullText();
        const matches = [...text.matchAll(/\[\[\s*([^[\]]+?)\s*\]\]/g)].map(m => m[1].trim());
        return [...new Set(matches)];
      } catch (err) {
        console.warn('Lỗi đọc file:', fileInfo.name, err);
        return [];
      }
    },

    async fetchFileBuffer(fileInfo) {
      // 1. Thử fetch từ thư mục public/templates/cd1tv-2tv-cshcu-ddpl/
      try {
        const localUrl = `/templates/cd1tv-2tv-cshcu-ddpl/${encodeURIComponent(fileInfo.filename)}`;
        const res = await fetch(localUrl);
        if (res.ok) {
          const buf = await res.arrayBuffer();
          if (this.isValidDocx(buf)) return buf;
        }
      } catch (e) {
        console.warn('Không tải được từ local public:', e);
      }

      // 2. Fallback tải qua Google API
      const fileId = this.extractDocId(fileInfo.link);
      return this.fetchDocxFromGapi(fileId);
    },

    async fetchDocxFromGapi(fileId) {
      let buffer;
      if (typeof gapi !== 'undefined' && gapi.client && gapi.client.drive) {
        const res = await gapi.client.drive.files.get(
          { fileId, alt: 'media' },
          { responseType: 'arraybuffer' }
        );
        buffer = res.body;
      }
      if (!this.isValidDocx(buffer)) {
        const exportRes = await fetch(
          `https://docs.google.com/document/d/${fileId}/export?format=docx`
        );
        if (!exportRes.ok) throw new Error(`Không tải được bản docx ${fileId}`);
        buffer = await exportRes.arrayBuffer();
      }
      return buffer;
    },

    isValidDocx(buffer) {
      try {
        if (!buffer) return false;
        const zip = new PizZip(buffer);
        return !!(zip.files && zip.files['word/document.xml']);
      } catch (e) {
        return false;
      }
    },

    extractDocId(url) {
      if (!url) return '';
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : '';
    },

    resetAll() {
      Object.keys(this.companyValues).forEach(k => {
        if (k === 'ct_tỉnh') this.companyValues[k] = 'Thành phố Hà Nội';
        else if (k === 'Lý do chuyển đổi loại hình') this.companyValues[k] = 'Tiếp nhận thêm thành viên mới góp vốn vào công ty';
        else this.companyValues[k] = isGenderField(k) ? 'Nam' : '';
      });
      Object.keys(this.oldOwnerValues).forEach(k => {
        if (k === 'CSH cũ_tỉnh') this.oldOwnerValues[k] = 'Thành phố Hà Nội';
        else if (k === 'CSH cũ_chức danh') this.oldOwnerValues[k] = 'Giám đốc';
        else this.oldOwnerValues[k] = isGenderField(k) ? 'Nam' : '';
      });
      this.transferValues = {
        'số HĐ': '01/HĐCN',
        'toàn bộ/một phần': 'một phần',
        'số tiền bằng số': '',
        'số tiền bằng chữ': '',
        'Tỷ lệ % vốn góp': '',
      };
      this.userInfoForm = [
        {
          name: '', gender: 'Nam', birthday: '', idNumber: '',
          homeNumber: '', ward: '', city: 'Thành phố Hà Nội',
          position: 'Thành viên', vbs: '', vbc: '', tl: ''
        }
      ];
      const currentUser = useAuth().state.user;
      if (currentUser) {
        autofillLoginPlaceholders(this.companyValues, currentUser);
        autofillLoginPlaceholders(this.authorizedPersonValues, currentUser);
      }
    },

    buildNganhList() {
      const mapping = [
        { condition: this.nnbbth, data: buonBanTongHop },
        { condition: this.nnmm, data: mayMac },
        { condition: this.nnxd, data: xayDung },
        { condition: this.bbqa, data: buonBanQuanAo },
        { condition: this.nnth, data: nganhNgheTongHop },
        { condition: this.nncxcq, data: cayXanhCanhQuan },
        { condition: this.nngd, data: giaoDuc },
      ];
      const list = mapping
        .filter(item => item.condition)
        .flatMap(item => item.data);
      list.forEach((item, index) => {
        item.id = index + 1;
      });
      return list;
    },

    async applyChanges() {
      if (this.userInfoForm.length < 1) {
        alert('Vui lòng thêm ít nhất 1 thành viên mới nhận chuyển nhượng/góp vốn');
        return;
      }

      const loading = document.getElementById('loading-overlay');
      if (loading) loading.style.display = 'flex';
      this.updating = true;

      try {
        await checkExportBalance();

        const buffers = await Promise.all(
          this.files.map(f => this.fetchFileBuffer(f))
        );

        // 1. Chuẩn bị danh sách thành viên mới (Bên B)
        const listUser = this.userInfoForm.map((item, idx) => ({
          id: idx + 2, // ID tiếp theo sau CSH cũ
          'tv1_Giới tính': item.gender || 'Nam',
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
        }));

        // 2. Chữ ký Điều lệ listUser2
        const tvNew1 = this.userInfoForm[0] || {};
        const tvNew2 = this.userInfoForm[1] || {};
        const listUser2 = [
          {
            'tv1_Họ tên': tvNew1.name || '',
            'tv2_Họ tên': tvNew2.name || '',
            'tv3_Họ tên': this.userInfoForm[2]?.name || '',
          }
        ];

        // 3. Mapping cho Bên B nhận chuyển nhượng (tv1_* trong HĐCN)
        const tvB = {
          'tv1_Họ tên': tvNew1.name || '',
          'tv1_Giới tính': tvNew1.gender || 'Nam',
          'tv1_ngày sinh': tvNew1.birthday || '',
          'tv1_Số định danh cá nhân': tvNew1.idNumber || '',
          'tv1_số nhà': tvNew1.homeNumber || '',
          'tv1_phường': tvNew1.ward || '',
          'tv1_tỉnh': tvNew1.city || '',
        };

        // 4. Ngành nghề
        const nganhList = this.buildNganhList();

        // 5. CSH cũ & Đại diện PL
        const cshCuName = this.oldOwnerValues['CSH cũ_Họ tên'] || '';
        const oldOwnerMap = {
          ...this.oldOwnerValues,
          'Họ tên CSH cũ': cshCuName,
        };

        // 6. Lọc CSH hưởng lợi >= 25% (kết hợp cả CSH cũ và thành viên mới)
        const listUserCsh = filterCshHuongLoiList(listUser, 'von');

        // Master data
        const masterData = {
          ...this.companyValues,
          'TÊN CÔNG TY': this.companyValues['TÊN CÔNG TY SAU KHI CĐ'] || this.companyValues['TÊN CÔNG TY HIỆN TẠI'] || '',
          ...oldOwnerMap,
          ...this.transferValues,
          ...this.authorizedPersonValues,
          ...tvB,
          listUser,
          listUser2,
          nganhList,
        };

        const fileArr = [];

        this.files.forEach((file, i) => {
          const buf = buffers[i];
          const isHdDoc = file.name.includes('5. Hợp đồng chuyển nhượng');
          const isTlDoc = file.name.includes('6. Biên bản thanh lý');
          const isCshDoc = file.name.includes('DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI');

          if (isHdDoc || isTlDoc) {
            // Nhân bản cho từng thành viên mới trong userInfoForm
            this.userInfoForm.forEach((tv, idx) => {
              const num = idx + 1;
              const docName = isHdDoc
                ? `5. Hợp đồng chuyển nhượng số ${num}`
                : `6. Biên bản thanh lý HĐCN số ${num}`;

              const zip = new PizZip(buf);
              const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
                delimiters: { start: '[[', end: ']]' },
              });

              const memberData = {
                ...masterData,
                'số HĐ': `${String(num).padStart(2, '0')}/HĐCN`,
                'số tiền bằng số': tv.vbs || this.transferValues['số tiền bằng số'] || '',
                'số tiền bằng chữ': tv.vbc || this.transferValues['số tiền bằng chữ'] || '',
                'Tỷ lệ % vốn góp': tv.tl || this.transferValues['Tỷ lệ % vốn góp'] || '',
                // Bên nhận chuyển nhượng (Bên B) - hỗ trợ cả tv_* và tv1_*
                'tv_Họ tên': tv.name || '',
                'tv_Giới tính': tv.gender || 'Nam',
                'tv_ngày sinh': tv.birthday || '',
                'tv_Số định danh cá nhân': tv.idNumber || '',
                'tv_số nhà': tv.homeNumber || '',
                'tv_phường': tv.ward || '',
                'tv_tỉnh': tv.city || '',
                'tv1_Họ tên': tv.name || '',
                'tv1_Giới tính': tv.gender || 'Nam',
                'tv1_ngày sinh': tv.birthday || '',
                'tv1_Số định danh cá nhân': tv.idNumber || '',
                'tv1_số nhà': tv.homeNumber || '',
                'tv1_phường': tv.ward || '',
                'tv1_tỉnh': tv.city || '',
              };

              fileArr.push({
                name: docName,
                data: this.renderToBlob(doc, memberData),
              });
            });
          } else {
            const zip = new PizZip(buf);
            const doc = new Docxtemplater(zip, {
              paragraphLoop: true,
              linebreaks: true,
              delimiters: { start: '[[', end: ']]' },
            });

            const fileData = {
              ...masterData,
              listUser: isCshDoc ? listUserCsh : listUser,
            };

            fileArr.push({
              name: file.name,
              data: this.renderToBlob(doc, fileData, { rotateDobVertical: isCshDoc }),
            });
          }
        });

        await exportFilesWithFormats(
          fileArr,
          this.exportFormats,
          'Hồ sơ chuyển đổi Cty 1TV sang 2TV (CSH cũ là đại diện PL)'
        );
      } catch (error) {
        alert('Không thể tạo file: ' + error.message);
        console.error('Lỗi khi tạo file:', error);
      } finally {
        this.updating = false;
        if (loading) loading.style.display = 'none';
      }
    },

    renderToBlob(doc, data, options = {}) {
      doc.render(data);
      enforceTimesNewRoman(doc.getZip());
      const zip = doc.getZip();

      // Xoay dọc ngày sinh cho bảng CSH hưởng lợi
      if (options.rotateDobVertical) {
        try {
          const docXmlFile = zip.file('word/document.xml');
          if (docXmlFile) {
            let xml = docXmlFile.asText();
            xml = xml.replace(/<w:tc[\s\S]*?<\/w:tc>/g, (tc) => {
              const textOnly = tc.replace(/<[^>]+>/g, '').trim();
              if (/\b\d{1,2}[/.-]\d{1,2}[/.-]\d{4}\b/.test(textOnly)) {
                let modified = tc;
                if (modified.includes('<w:vAlign')) {
                  modified = modified.replace(/<w:vAlign[^>]*\/>/, '<w:vAlign w:val="center"/>');
                } else if (modified.includes('<w:tcPr>')) {
                  modified = modified.replace('<w:tcPr>', '<w:tcPr><w:vAlign w:val="center"/>');
                }

                if (modified.includes('<w:jc')) {
                  modified = modified.replace(/<w:jc[^>]*\/>/, '<w:jc w:val="center"/>');
                } else if (modified.includes('<w:pPr>')) {
                  modified = modified.replace('<w:pPr>', '<w:pPr><w:jc w:val="center"/>');
                }

                modified = modified.replace(/<w:ind[^>]*\/>/g, '<w:ind w:left="0" w:right="0" w:firstLine="0"/>');

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
          console.warn('Lỗi xoay dọc textDirection ngày sinh:', e);
        }
      }

      return zip.generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
    },
  },
};
</script>

