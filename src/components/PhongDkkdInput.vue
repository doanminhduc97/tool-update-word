<template>
  <SearchableSelectInput
    type="pdkkd"
    :model-value="modelValue"
    :input-id="inputId"
    :placeholder="placeholder || 'Nhập để search Phòng ĐKKD Tỉnh/TP'"
    :reset-on-mismatch="true"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script>
import SearchableSelectInput from './SearchableSelectInput.vue'

export default {
  name: 'PhongDkkdInput',
  components: {
    SearchableSelectInput,
  },
  props: {
    modelValue: { type: String, default: '' },
    inputId: { type: String, default: '' },
    placeholder: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
}
</script>
