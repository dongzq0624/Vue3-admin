<!-- 表格按钮 -->
<template>
  <div
    :class="[
      'inline-flex items-center justify-center min-w-8 h-8 px-2.5 mr-2.5 text-sm c-p rounded-md align-middle',
      buttonClass
    ]"
    :style="{ backgroundColor: buttonBgColor, color: iconColor }"
    @click="handleClick"
  >
    <ArtSvgIcon :icon="iconContent" />
  </div>
</template>

<script setup>
  import { computed } from 'vue'

  defineOptions({ name: 'ArtButtonTable' })

  const props = defineProps({
    /** 按钮类型 */
    type: {
      type: String,
      default: ''
    },
    /** 按钮图标 */
    icon: {
      type: String,
      default: ''
    },
    /** 按钮样式类 */
    iconClass: {
      type: String,
      default: ''
    },
    /** icon 颜色 */
    iconColor: {
      type: String,
      default: ''
    },
    /** 按钮背景色 */
    buttonBgColor: {
      type: String,
      default: ''
    }
  })

  const emit = defineEmits(['click'])

  // 默认按钮配置
  const defaultButtons = {
    add: { icon: 'ri:add-fill', class: 'bg-theme/12 text-theme' },
    edit: { icon: 'ri:pencil-line', class: 'bg-secondary/12 text-secondary' },
    delete: { icon: 'ri:delete-bin-5-line', class: 'bg-error/12 text-error' },
    view: { icon: 'ri:eye-line', class: 'bg-info/12 text-info' },
    more: { icon: 'ri:more-2-fill', class: '' }
  }

  // 获取图标内容
  const iconContent = computed(() => {
    return props.icon || (props.type ? defaultButtons[props.type]?.icon : '') || ''
  })

  // 获取按钮样式类
  const buttonClass = computed(() => {
    return props.iconClass || (props.type ? defaultButtons[props.type]?.class : '') || ''
  })

  const handleClick = () => {
    emit('click')
  }
</script>
