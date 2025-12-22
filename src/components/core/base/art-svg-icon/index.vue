<!-- 图标组件 -->
<template>
  <Icon v-if="icon" :icon="icon" v-bind="bindAttrs" class="art-svg-icon inline" />
</template>

<script setup>
  import { Icon } from '@iconify/vue'
  import { computed, useAttrs } from 'vue'

  defineOptions({ name: 'ArtSvgIcon', inheritAttrs: false })

  defineProps({
    /** Iconify icon name */
    icon: {
      type: String,
      default: ''
    }
  })

  const attrs = useAttrs()

  const bindAttrs = computed(() => ({
    class: attrs.class || '',
    style: attrs.style || ''
  }))
</script>
