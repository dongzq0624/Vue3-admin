<!-- 按钮组件 -->
<template>
  <div
    class="size-8.5 inline-flex flex-cc c-p text-g-600 dark:text-g-800 text-xl rounded tad-300 hover:bg-hover-color"
    :class="{ 'rounded-full': circle }"
  >
    <ArtSvgIcon :icon="icon"></ArtSvgIcon>
    <slot></slot>
  </div>
</template>

<script setup>
  defineOptions({ name: 'ArtIconButton' })

  defineProps({
    /** 图标名称 */
    icon: {
      type: String,
      required: true
    },
    /** 圆角按钮 */
    circle: {
      type: Boolean,
      default: false
    }
  })
</script>
