<template>
  <div class="gender-radio-group">
    <label :for="name + '-nam'" class="gender-radio-label">
      <input
        type="radio"
        :id="name + '-nam'"
        :name="name"
        value="Nam"
        :checked="modelValue === 'Nam'"
        @change="$emit('update:modelValue', 'Nam')"
      />
      <span>Nam</span>
    </label>
    <label :for="name + '-nu'" class="gender-radio-label">
      <input
        type="radio"
        :id="name + '-nu'"
        :name="name"
        value="Nữ"
        :checked="modelValue === 'Nữ'"
        @change="$emit('update:modelValue', 'Nữ')"
      />
      <span>Nữ</span>
    </label>
  </div>
</template>

<script>
export default {
  name: 'GenderRadio',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue'],
  mounted() {
    // Nếu chưa có giá trị hoặc chuỗi rỗng -> tự động set mặc định là 'Nam'
    if (!this.modelValue) {
      this.$emit('update:modelValue', 'Nam')
    }
  },
  watch: {
    modelValue(newVal) {
      if (!newVal) {
        this.$emit('update:modelValue', 'Nam')
      }
    }
  }
}
</script>

<style scoped>
.gender-radio-group {
  display: inline-flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0 4px;
  vertical-align: middle;
}
.gender-radio-label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: #374151;
  user-select: none;
  margin-bottom: 0 !important;
  line-height: 1;
}
.gender-radio-label input[type="radio"] {
  width: 1.15rem;
  height: 1.15rem;
  accent-color: #0284c7;
  cursor: pointer;
  margin: 0;
  vertical-align: middle;
}
.gender-radio-label span {
  line-height: 1;
}
</style>

