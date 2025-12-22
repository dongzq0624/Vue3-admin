<!-- 图片卡片 -->
<template>
  <div class="w-full c-p" @click="handleClick">
    <div class="art-card overflow-hidden">
      <div class="relative w-full aspect-[16/10] overflow-hidden">
        <ElImage
          :src="props.imageUrl"
          fit="cover"
          loading="lazy"
          class="w-full h-full transition-transform duration-300 ease-in-out hover:scale-105"
        >
          <template #placeholder>
            <div class="flex-cc w-full h-full bg-[#f5f7fa]">
              <ElIcon><Picture /></ElIcon>
            </div>
          </template>
        </ElImage>
        <div
          class="absolute right-3.5 bottom-3.5 py-1 px-2 text-xs bg-g-200 rounded"
          v-if="props.readTime"
        >
          {{ props.readTime }} 阅读
        </div>
      </div>

      <div class="p-4">
        <div
          class="inline-block py-0.5 px-2 mb-2 text-xs bg-g-300/70 rounded"
          v-if="props.category"
        >
          {{ props.category }}
        </div>
        <p class="m-0 mb-3 text-base font-medium">{{ props.title }}</p>
        <div class="flex-c gap-4 text-xs text-g-600">
          <span class="flex-c gap-1" v-if="props.views">
            <ElIcon class="text-base"><View /></ElIcon>
            {{ props.views }}
          </span>
          <span class="flex-c gap-1" v-if="props.comments">
            <ElIcon class="text-base"><ChatLineRound /></ElIcon>
            {{ props.comments }}
          </span>
          <span>{{ props.date }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { Picture, View, ChatLineRound } from '@element-plus/icons-vue'

  defineOptions({ name: 'ArtImageCard' })

  const props = defineProps({
    /** 图片地址 */
    imageUrl: {
      type: String,
      default: ''
    },
    /** 标题 */
    title: {
      type: String,
      default: ''
    },
    /** 分类 */
    category: {
      type: String,
      default: ''
    },
    /** 阅读时间 */
    readTime: {
      type: String,
      default: ''
    },
    /** 浏览量 */
    views: {
      type: Number,
      default: 0
    },
    /** 评论数 */
    comments: {
      type: Number,
      default: 0
    },
    /** 日期 */
    date: {
      type: String,
      default: ''
    }
  })

  const emit = defineEmits(['click'])

  const handleClick = () => {
    emit('click', props)
  }
</script>
