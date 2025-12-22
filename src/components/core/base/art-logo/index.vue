<!-- 系统logo -->
<template>
  <div class="flex-cc">
    <img :style="logoStyle" src="@imgs/common/logo.webp" alt="logo" class="w-full h-full" />
  </div>
</template>

<script setup>
  import { computed } from 'vue'

  defineOptions({ name: 'ArtLogo' })

  const props = defineProps({
    /** logo 大小 */
    size: {
      type: [Number, String],
      default: 36
    }
  })

  const logoStyle = computed(() => ({ width: `${props.size}px` }))
</script>
