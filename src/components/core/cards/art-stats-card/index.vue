<!-- 统计卡片 -->
<template>
  <div
    class="art-card h-32 flex-c px-5 transition-transform duration-200 hover:-translate-y-0.5"
    :class="boxStyle"
  >
    <div v-if="icon" class="mr-4 size-11 flex-cc rounded-lg text-xl text-white" :class="iconStyle">
      <ArtSvgIcon :icon="icon"></ArtSvgIcon>
    </div>
    <div class="flex-1">
      <p class="m-0 text-lg font-medium" :style="{ color: textColor }" v-if="title">
        {{ title }}
      </p>
      <ArtCountTo
        class="m-0 text-2xl font-medium"
        v-if="count !== undefined"
        :target="count"
        :duration="2000"
        :decimals="decimals"
        :separator="separator"
      />
      <p
        class="mt-1 text-sm text-g-500 opacity-90"
        :style="{ color: textColor }"
        v-if="description"
        >{{ description }}</p
      >
    </div>
    <div v-if="showArrow">
      <ArtSvgIcon icon="ri:arrow-right-s-line" class="text-xl text-g-500" />
    </div>
  </div>
</template>

<script setup>
  defineOptions({ name: 'ArtStatsCard' })

  defineProps({
    /** 盒子样式 */
    boxStyle: {
      type: String,
      default: ''
    },
    /** 图标 */
    icon: {
      type: String,
      default: ''
    },
    /** 图标样式 */
    iconStyle: {
      type: String,
      default: ''
    },
    /** 标题 */
    title: {
      type: String,
      default: ''
    },
    /** 数值 */
    count: {
      type: Number,
      default: undefined
    },
    /** 小数位 */
    decimals: {
      type: Number,
      default: 0
    },
    /** 分隔符 */
    separator: {
      type: String,
      default: ','
    },
    /** 描述 */
    description: {
      type: String,
      required: true
    },
    /** 文本颜色 */
    textColor: {
      type: String,
      default: ''
    },
    /** 是否显示箭头 */
    showArrow: {
      type: Boolean,
      default: false
    },
    /** 图标大小（默认属性中定义但接口未定义） */
    iconSize: {
      type: Number,
      default: 30
    },
    /** 图标背景半径（默认属性中定义但接口未定义） */
    iconBgRadius: {
      type: Number,
      default: 50
    }
  })
</script>
