<template>
  <div class="pdkkd-autocomplete">
    <input
      ref="inputEl"
      type="text"
      :id="inputId"
      :value="modelValue"
      :placeholder="placeholder || 'Nhập để search Phòng ĐKKD Tỉnh/TP'"
      autocomplete="off"
      @input="onInput($event)"
      @keydown.down.prevent="moveHighlight(1)"
      @keydown.up.prevent="moveHighlight(-1)"
      @keydown.enter.prevent="selectHighlighted"
      @keydown.esc="closeList"
      @focus="openList"
      @blur="onBlur"
    >
    <ul v-if="open && filtered.length > 0" class="pdkkd-list">
      <li
        v-for="(item, idx) in filtered"
        :key="item"
        :class="{ 'pdkkd-active': idx === highlightIndex }"
        @mousedown.prevent="selectItem(item)"
        @mousemove="highlightIndex = idx"
      >{{ item }}</li>
    </ul>
  </div>
</template>

<script>
import phongDkkdList from '@/data/phong-dkkd.json';

export default {
  name: 'PhongDkkdInput',
  props: {
    modelValue: { type: String, default: '' },
    inputId: { type: String, default: '' },
    placeholder: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      open: false,
      highlightIndex: 0,
      items: phongDkkdList,
    };
  },
  computed: {
    // Chuẩn hóa: bỏ dấu, bỏ khoảng trắng, lowercase để tìm gần đúng
    normalizedValue() {
      return this.normalize(this.modelValue);
    },
    filtered() {
      const q = this.normalizedValue;
      if (!q) return this.items;
      return this.items.filter(item => this.normalize(item).includes(q));
    },
  },
  methods: {
    normalize(str) {
      if (!str) return '';
      return String(str)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
        .replace(/đ/g, 'd')
        .replace(/\s+/g, ' ')
        .trim();
    },
    onInput(e) {
      this.$emit('update:modelValue', e.target.value);
      this.openList();
    },
    openList() {
      this.open = true;
      this.highlightIndex = 0;
    },
    closeList() {
      this.open = false;
    },
    onBlur() {
      // Delay nhỏ để mousedown trên item kịp chạy trước blur
      setTimeout(() => {
        this.open = false;
        // Nếu người dùng nhập giá trị nhưng không khớp bất kỳ Phòng ĐKKD nào trong danh sách -> reset về rỗng
        if (this.modelValue && this.filtered.length === 0) {
          this.$emit('update:modelValue', '');
        }
      }, 150);
    },
    moveHighlight(delta) {
      if (!this.open || this.filtered.length === 0) return;
      const len = this.filtered.length;
      this.highlightIndex = (this.highlightIndex + delta + len) % len;
    },
    selectHighlighted() {
      if (!this.open || this.filtered.length === 0) return;
      this.selectItem(this.filtered[this.highlightIndex]);
    },
    selectItem(item) {
      this.$emit('update:modelValue', item);
      this.open = false;
    },
  },
};
</script>

<style scoped>
.pdkkd-autocomplete {
  position: relative;
}
.pdkkd-list {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1200;
}
.pdkkd-list li {
  padding: 7px 12px;
  font-size: 13.5px;
  cursor: pointer;
  line-height: 1.4;
}
.pdkkd-list li:hover,
.pdkkd-list li.pdkkd-active {
  background: #eef4ff;
  color: #1d4ed8;
}
</style>
