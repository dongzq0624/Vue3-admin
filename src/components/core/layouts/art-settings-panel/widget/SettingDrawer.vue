<template>
  <div class="setting-drawer">
    <ElDrawer
      size="300px"
      v-model="visible"
      :lock-scroll="true"
      :with-header="false"
      :before-close="handleClose"
      :destroy-on-close="false"
      modal-class="setting-modal"
      @open="handleOpen"
      @close="handleDrawerClose"
    >
      <div class="drawer-con">
        <slot />
      </div>
    </ElDrawer>
  </div>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['update:modelValue', 'open', 'close'])

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const handleOpen = () => {
    emit('open')
  }

  const handleDrawerClose = () => {
    emit('close')
  }

  const handleClose = () => {
    visible.value = false
  }
</script>
