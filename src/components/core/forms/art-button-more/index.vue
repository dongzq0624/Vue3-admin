<!-- 更多按钮 -->
<template>
  <div>
    <ElDropdown v-if="hasAnyAuthItem">
      <ArtIconButton icon="ri:more-2-fill" class="!size-8 bg-g-200 dark:bg-g-300/45 text-sm" />
      <template #dropdown>
        <ElDropdownMenu>
          <template v-for="item in list" :key="item.key">
            <ElDropdownItem
              v-if="!item.auth || hasAuth(item.auth)"
              :disabled="item.disabled"
              @click="handleClick(item)"
            >
              <div class="flex-c gap-2" :style="{ color: item.color }">
                <ArtSvgIcon v-if="item.icon" :icon="item.icon" />
                <span>{{ item.label }}</span>
              </div>
            </ElDropdownItem>
          </template>
        </ElDropdownMenu>
      </template>
    </ElDropdown>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { useAuth } from '@/hooks/core/useAuth'

  defineOptions({ name: 'ArtButtonMore' })

  const { hasAuth } = useAuth()

  const props = defineProps({
    /** 下拉项列表 */
    list: {
      type: Array,
      required: true
    },
    /** 整体权限控制 */
    auth: {
      type: String,
      default: ''
    }
  })

  // 检查是否有任何有权限的 item
  const hasAnyAuthItem = computed(() => {
    return props.list.some((item) => !item.auth || hasAuth(item.auth))
  })

  const emit = defineEmits(['click'])

  const handleClick = (item) => {
    emit('click', item)
  }
</script>
