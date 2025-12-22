<!-- 时间轴列表卡片 -->
<template>
  <div class="art-card p-5">
    <div class="pb-3.5">
      <p class="text-lg font-medium">{{ title }}</p>
      <p class="text-sm text-g-600">{{ subtitle }}</p>
    </div>
    <ElScrollbar :style="{ height: maxHeight }">
      <ElTimeline class="!pl-0.5">
        <ElTimelineItem
          v-for="item in list"
          :key="item.time"
          :timestamp="item.time"
          :placement="TIMELINE_PLACEMENT"
          :color="item.status"
          :center="true"
        >
          <div class="flex-c gap-3">
            <div class="flex-c gap-2">
              <span class="text-sm">{{ item.content }}</span>
              <span v-if="item.code" class="text-sm text-theme"> #{{ item.code }} </span>
            </div>
          </div>
        </ElTimelineItem>
      </ElTimeline>
    </ElScrollbar>
  </div>
</template>

<script setup>
  import { computed } from 'vue'

  defineOptions({ name: 'ArtTimelineListCard' })

  // 常量配置
  const ITEM_HEIGHT = 65
  const TIMELINE_PLACEMENT = 'top'

  // Props 定义和验证
  const props = defineProps({
    /** 时间轴列表数据 */
    list: {
      type: Array,
      required: true
    },
    /** 标题 */
    title: {
      type: String,
      default: ''
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
    }
  })

  // 计算最大高度
  const maxHeight = computed(() => `${ITEM_HEIGHT * props.maxCount}px`)
</script>
