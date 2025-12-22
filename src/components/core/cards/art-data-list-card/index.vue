<!-- 数据列表卡片 -->
<template>
  <div class="art-card p-5">
    <div class="pb-3.5">
      <p class="text-lg font-medium">{{ title }}</p>
      <p class="text-sm text-g-600">{{ subtitle }}</p>
    </div>
    <ElScrollbar :style="{ height: maxHeight }">
      <div v-for="(item, index) in list" :key="index" class="flex-c py-3">
        <div v-if="item.icon" class="flex-cc mr-3 size-10 rounded-lg" :class="item.class">
          <ArtSvgIcon :icon="item.icon" class="text-xl" />
        </div>
        <div class="flex-1">
          <div class="mb-1 text-sm">{{ item.title }}</div>
          <div class="text-xs text-g-500">{{ item.status }}</div>
        </div>
        <div class="ml-3 text-xs text-g-500">{{ item.time }}</div>
      </div>
    </ElScrollbar>
    <ElButton
      class="mt-[25px] w-full text-center"
      v-if="showMoreButton"
      v-ripple
      @click="handleMore"
      >查看更多</ElButton
    >
  </div>
</template>

<script setup>
  import { computed } from 'vue'

  defineOptions({ name: 'ArtDataListCard' })

  const ITEM_HEIGHT = 66

  const props = defineProps({
    /** 数据列表 */
    list: {
      type: Array,
      required: true
    },
    /** 标题 */
    title: {
      type: String,
      required: true
    },
    /** 副标题 */
    subtitle: {
      type: String,
      default: ''
    },
    /** 最大显示数量 */
    maxCount: {
      type: Number,
      default: 5
    },
    /** 是否显示更多按钮 */
    showMoreButton: {
      type: Boolean,
      default: false
    }
  })

  const maxHeight = computed(() => `${ITEM_HEIGHT * props.maxCount}px`)

  const emit = defineEmits(['more'])

  const handleMore = () => emit('more')
</script>
