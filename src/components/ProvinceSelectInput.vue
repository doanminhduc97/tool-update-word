<template>
  <SearchableSelectInput
    type="province"
    :model-value="modelValue"
    :input-id="inputId"
    :placeholder="placeholder || 'Tìm hoặc chọn Tỉnh / Thành phố...'"
    :disabled="disabled"
    input-class="auth-input"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script>
import SearchableSelectInput from './SearchableSelectInput.vue'

export default {
  name: 'ProvinceSelectInput',
  components: {
    SearchableSelectInput,
  },
  props: {
    modelValue: { type: String, default: '' },
    inputId: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
}
</script>
