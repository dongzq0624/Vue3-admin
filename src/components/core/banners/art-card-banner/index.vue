<!-- 卡片横幅组件 -->
<template>
  <div class="art-card-sm flex-c flex-col pb-6" :style="{ height: height }">
    <div class="flex-c flex-col gap-4 text-center">
      <div class="w-45">
        <img :src="image" :alt="title" class="w-full h-full object-contain" />
      </div>
      <div class="box-border px-4">
        <p class="mb-2 text-lg font-semibold text-g-800">{{ title }}</p>
        <p class="m-0 text-sm text-g-600">{{ description }}</p>
      </div>
      <div class="flex-c gap-3">
        <div
          v-if="cancelButton?.show"
          class="inline-block h-9 px-3 text-sm/9 c-p select-none rounded-md border border-g-300"
          :style="{
            backgroundColor: cancelButton?.color,
            color: cancelButton?.textColor
          }"
          @click="handleCancel"
        >
          {{ cancelButton?.text }}
        </div>
        <div
          v-if="button?.show"
          class="inline-block h-9 px-3 text-sm/9 c-p select-none rounded-md"
          :style="{ backgroundColor: button?.color, color: button?.textColor }"
          @click="handleClick"
        >
          {{ button?.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  // 导入默认图标
  import defaultIcon from '@imgs/3d/icon1.webp'

  defineOptions({ name: 'ArtCardBanner' })

  // 定义组件属性默认值
  defineProps({
    /** 高度 */
    height: {
      type: String,
      default: '24rem'
    },
    /** 图片路径 */
    image: {
      type: String,
      default: defaultIcon
    },
    /** 标题文本 */
    title: {
      type: String,
      default: ''
    },
    /** 描述文本 */
    description: {
      type: String,
      default: ''
    },
    /** 主按钮配置 */
    button: {
      type: Object,
      default: () => ({
        show: true,
        text: '查看详情',
        color: 'var(--theme-color)',
        textColor: '#fff'
      })
    },
    /** 取消按钮配置 */
    cancelButton: {
      type: Object,
      default: () => ({
        show: false,
        text: '取消',
        color: '#f5f5f5',
        textColor: '#666'
      })
    }
  })

  // 定义组件事件
  const emit = defineEmits(['click', 'cancel'])

  // 主按钮点击处理函数
  const handleClick = () => {
    emit('click')
  }

  // 取消按钮点击处理函数
  const handleCancel = () => {
    emit('cancel')
  }
</script>
