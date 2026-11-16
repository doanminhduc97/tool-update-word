<template>
  <div class="searchable-select-container" :class="customClass" ref="containerRef">
    <input
      ref="inputEl"
      type="text"
      :id="inputId"
      :value="modelValue"
      :placeholder="computedPlaceholder"
      :disabled="disabled"
      :class="['searchable-select-input', inputClass]"
      autocomplete="off"
      @input="onInput($event)"
      @keydown.down.prevent="moveHighlight(1)"
      @keydown.up.prevent="moveHighlight(-1)"
      @keydown.enter.prevent="selectHighlighted"
      @keydown.esc="closeList"
      @focus="openList"
      @blur="onBlur"
    />
    <ul v-if="open && filtered.length > 0" class="searchable-select-list">
      <li
        v-for="(item, idx) in filtered"
        :key="item"
        :class="{ 'active': idx === highlightIndex }"
        @mousedown.prevent="selectItem(item)"
        @mousemove="highlightIndex = idx"
      >
        {{ item }}
      </li>
    </ul>
    <div v-else-if="open && modelValue.trim() && showEmpty" class="searchable-select-empty">
      {{ emptyText || 'Không tìm thấy kết quả phù hợp' }}
    </div>
  </div>
</template>

<script>
import defaultPhongDkkdList from '@/data/phong-dkkd.json'
import defaultProvincesList from '@/data/provinces-vn.json'

export default {
  name: 'SearchableSelectInput',
  props: {
    modelValue: { type: String, default: '' },
    inputId: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    // Type shortcut: 'pdkkd' | 'province' | 'custom'
    type: { type: String, default: 'pdkkd' },
    // Tuỳ chọn truyền danh sách dữ liệu trực tiếp
    items: { type: Array, default: null },
    inputClass: { type: String, default: '' },
    customClass: { type: String, default: '' },
    showEmpty: { type: Boolean, default: true },
    emptyText: { type: String, default: '' },
    resetOnMismatch: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      open: false,
      highlightIndex: 0,
    }
  },
  computed: {
    sourceList() {
      if (this.items && Array.isArray(this.items)) {
        return this.items
      }
      if (this.type === 'province') {
        return defaultProvincesList
      }
      return defaultPhongDkkdList
    },
    computedPlaceholder() {
      if (this.placeholder) return this.placeholder
      if (this.type === 'province') return 'Tìm và chọn tỉnh / thành phố'
      return 'Nhập để search Phòng ĐKKD Tỉnh/TP'
    },
    normalizedValue() {
      return this.normalize(this.modelValue)
    },
    filtered() {
      const q = this.normalizedValue
      if (!q) return this.sourceList
      return this.sourceList.filter((item) => this.normalize(item).includes(q))
    },
  },
  methods: {
    normalize(str) {
      if (!str) return ''
      return String(str)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/\s+/g, ' ')
        .trim()
    },
    onInput(e) {
      this.$emit('update:modelValue', e.target.value)
      this.openList()
    },
    openList() {
      if (this.disabled) return
      this.open = true
      this.highlightIndex = 0
    },
    closeList() {
      this.open = false
    },
    onBlur() {
      setTimeout(() => {
        this.open = false
        if (this.resetOnMismatch && this.modelValue && this.filtered.length === 0) {
          this.$emit('update:modelValue', '')
        }
      }, 150)
    },
    moveHighlight(delta) {
      if (!this.open || this.filtered.length === 0) return
      const len = this.filtered.length
      this.highlightIndex = (this.highlightIndex + delta + len) % len
    },
    selectHighlighted() {
      if (!this.open || this.filtered.length === 0) return
      this.selectItem(this.filtered[this.highlightIndex])
    },
    selectItem(item) {
      this.$emit('update:modelValue', item)
      this.closeList()
      this.$nextTick(() => {
        if (this.$refs.inputEl) {
          this.$refs.inputEl.blur()
        }
      })
    },
  },
}
</script>

<style scoped>
.searchable-select-container {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.searchable-select-input {
  width: 100%;
  box-sizing: border-box;
}

.searchable-select-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 1200;
  max-height: 240px;
  overflow-y: auto;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

.searchable-select-list li {
  padding: 8px 12px;
  font-size: 13.5px;
  color: #334155;
  cursor: pointer;
  line-height: 1.4;
  transition: background-color 0.12s ease;
}

.searchable-select-list li:hover,
.searchable-select-list li.active {
  background-color: #f1f5f9;
  color: #0284c7;
  font-weight: 500;
}

.searchable-select-empty {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 1200;
  margin: 0;
  padding: 10px 12px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #94a3b8;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
</style>
