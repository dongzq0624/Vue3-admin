<!-- 水印组件 -->
<template>
  <div
    v-if="watermarkVisible"
    class="fixed left-0 top-0 h-screen w-screen pointer-events-none"
    :style="{ zIndex: zIndex }"
  >
    <ElWatermark
      :content="content"
      :font="{ fontSize: fontSize, color: fontColor }"
      :rotate="rotate"
      :gap="[gapX, gapY]"
      :offset="[offsetX, offsetY]"
    >
      <div style="height: 100vh"></div>
    </ElWatermark>
  </div>
</template>

<script setup>
  import AppConfig from '@/config'
  import { useSettingStore } from '@/store/modules/setting'
  import { storeToRefs } from 'pinia'

  defineOptions({ name: 'ArtWatermark' })

  const settingStore = useSettingStore()
  const { watermarkVisible } = storeToRefs(settingStore)

  defineProps({
    /** 水印内容 */
    content: {
      type: String,
      default: AppConfig.systemInfo.name
    },
    /** 水印是否可见 */
    visible: {
      type: Boolean,
      default: false
    },
    /** 水印字体大小 */
    fontSize: {
      type: Number,
      default: 16
    },
    /** 水印字体颜色 */
    fontColor: {
      type: String,
      default: 'rgba(128, 128, 128, 0.2)'
    },
    /** 水印旋转角度 */
    rotate: {
      type: Number,
      default: -22
    },
    /** 水印间距X */
    gapX: {
      type: Number,
      default: 100
    },
    /** 水印间距Y */
    gapY: {
      type: Number,
      default: 100
    },
    /** 水印偏移X */
    offsetX: {
      type: Number,
      default: 50
    },
    /** 水印偏移Y */
    offsetY: {
      type: Number,
      default: 50
    },
    /** 水印层级 */
    zIndex: {
      type: Number,
      default: 3100
    }
  })
</script>
