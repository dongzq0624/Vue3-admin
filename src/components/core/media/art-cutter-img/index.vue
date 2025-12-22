<!-- 图片裁剪组件 github: https://github.com/acccccccb/vue-img-cutter/tree/master -->
<template>
  <div class="cutter-container">
    <div class="cutter-component">
      <div class="title">{{ title }}</div>
      <ImgCutter
        ref="imgCutterModal"
        @cutDown="cutDownImg"
        @onPrintImg="cutterPrintImg"
        @onImageLoadComplete="handleImageLoadComplete"
        @onImageLoadError="handleImageLoadError"
        @onClearAll="handleClearAll"
        v-bind="cutterProps"
        class="img-cutter"
      >
        <template #choose>
          <ElButton type="primary" plain v-ripple>选择图片</ElButton>
        </template>
        <template #cancel>
          <ElButton type="danger" plain v-ripple>清除</ElButton>
        </template>
        <template #confirm>
          <!-- <ElButton type="primary" style="margin-left: 10px">确定</ElButton> -->
          <div></div>
        </template>
      </ImgCutter>
    </div>

    <div v-if="showPreview" class="preview-container">
      <div class="title">{{ previewTitle }}</div>
      <div
        class="preview-box"
        :style="{
          width: `${cutterProps.cutWidth}px`,
          height: `${cutterProps.cutHeight}px`
        }"
      >
        <img class="preview-img" :src="temImgPath" alt="预览图" v-if="temImgPath" />
      </div>
      <ElButton class="download-btn" @click="downloadImg" :disabled="!temImgPath" v-ripple
        >下载图片</ElButton
      >
    </div>
  </div>
</template>

<script setup>
  import ImgCutter from 'vue-img-cutter'
  import { ref, computed, onMounted, watch } from 'vue'

  defineOptions({ name: 'ArtCutterImg' })

  const props = defineProps({
    // 基础配置
    /** 是否模态框 */
    isModal: {
      type: Boolean,
      default: false
    },
    /** 是否显示工具栏 */
    tool: {
      type: Boolean,
      default: true
    },
    /** 工具栏背景色 */
    toolBgc: {
      type: String,
      default: '#fff'
    },
    /** 标题 */
    title: {
      type: String,
      default: ''
    },
    /** 预览标题 */
    previewTitle: {
      type: String,
      default: ''
    },
    /** 是否显示预览 */
    showPreview: {
      type: Boolean,
      default: true
    },

    // 尺寸相关
    /** 容器宽度 */
    boxWidth: {
      type: Number,
      default: 700
    },
    /** 容器高度 */
    boxHeight: {
      type: Number,
      default: 458
    },
    /** 裁剪宽度 */
    cutWidth: {
      type: Number,
      default: 470
    },
    /** 裁剪高度 */
    cutHeight: {
      type: Number,
      default: 270
    },
    /** 是否允许大小调整 */
    sizeChange: {
      type: Boolean,
      default: true
    },

    // 移动和缩放
    /** 是否允许移动 */
    moveAble: {
      type: Boolean,
      default: true
    },
    /** 是否允许图片移动 */
    imgMove: {
      type: Boolean,
      default: true
    },
    /** 是否允许缩放 */
    scaleAble: {
      type: Boolean,
      default: true
    },

    // 图片相关
    /** 是否显示原始图片 */
    originalGraph: {
      type: Boolean,
      default: true
    },
    /** 是否允许跨域 */
    crossOrigin: {
      type: Boolean,
      default: true
    },
    /** 文件类型 */
    fileType: {
      type: String,
      default: 'png'
    },
    /** 质量 */
    quality: {
      type: Number,
      default: 0.9
    },

    // 水印
    /** 水印文本 */
    watermarkText: {
      type: String,
      default: ''
    },
    /** 水印字体大小 */
    watermarkFontSize: {
      type: Number,
      default: 20
    },
    /** 水印颜色 */
    watermarkColor: {
      type: String,
      default: '#ffffff'
    },

    // 其他功能
    /** 是否保存裁剪位置 */
    saveCutPosition: {
      type: Boolean,
      default: true
    },
    /** 是否预览模式 */
    previewMode: {
      type: Boolean,
      default: true
    },

    // 输入图片
    imgUrl: {
      type: String,
      default: ''
    }
  })

  const emit = defineEmits(['update:imgUrl', 'error', 'imageLoadComplete', 'imageLoadError'])

  const temImgPath = ref('')
  const imgCutterModal = ref()

  // 计算属性：整合所有ImgCutter的props
  const cutterProps = computed(() => ({
    ...props,
    WatermarkText: props.watermarkText,
    WatermarkFontSize: props.watermarkFontSize,
    WatermarkColor: props.watermarkColor
  }))

  // 图片预加载
  function preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve()
      img.onerror = reject
      img.src = url
    })
  }

  // 初始化裁剪器
  async function initImgCutter() {
    if (props.imgUrl) {
      try {
        await preloadImage(props.imgUrl)
        imgCutterModal.value?.handleOpen({
          name: '封面图片',
          src: props.imgUrl
        })
      } catch (error) {
        emit('error', error)
        console.error('图片加载失败:', error)
      }
    }
  }

  // 生命周期钩子
  onMounted(() => {
    if (props.imgUrl) {
      temImgPath.value = props.imgUrl
      initImgCutter()
    }
  })

  // 监听图片URL变化
  watch(
    () => props.imgUrl,
    (newVal) => {
      if (newVal) {
        temImgPath.value = newVal
        initImgCutter()
      }
    }
  )

  // 实时预览
  function cutterPrintImg(result) {
    temImgPath.value = result.dataURL
  }

  // 裁剪完成
  function cutDownImg(result) {
    emit('update:imgUrl', result.dataURL)
  }

  // 图片加载完成
  function handleImageLoadComplete(result) {
    emit('imageLoadComplete', result)
  }

  // 图片加载失败
  function handleImageLoadError(error) {
    emit('error', error)
    emit('imageLoadError', error)
  }

  // 清除所有
  function handleClearAll() {
    temImgPath.value = ''
  }

  // 下载图片
  function downloadImg() {
    console.log('下载图片')
    const a = document.createElement('a')
    a.href = temImgPath.value
    a.download = 'image.png'
    a.click()
  }
</script>

<style lang="scss" scoped>
  .cutter-container {
    display: flex;
    flex-flow: row wrap;

    .title {
      padding-bottom: 10px;
      font-size: 18px;
      font-weight: 500;
    }

    .cutter-component {
      margin-right: 30px;
    }

    .preview-container {
      .preview-box {
        background-color: var(--art-active-color) !important;

        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .download-btn {
        display: block;
        margin: 20px auto;
      }
    }

    :deep(.toolBoxControl) {
      z-index: 100;
    }

    :deep(.dockMain) {
      right: 0;
      bottom: -40px;
      left: 0;
      z-index: 10;
      padding: 0;
      background-color: transparent !important;
      opacity: 1;
    }

    :deep(.copyright) {
      display: none !important;
    }

    :deep(.i-dialog-footer) {
      margin-top: 60px !important;
    }

    :deep(.dockBtn) {
      height: 26px;
      padding: 0 10px;
      font-size: 12px;
      line-height: 26px;
      color: var(--el-color-primary) !important;
      background-color: var(--el-color-primary-light-9) !important;
      border: 1px solid var(--el-color-primary-light-4) !important;
    }

    :deep(.dockBtnScrollBar) {
      margin: 0 10px 0 6px;
      background-color: var(--el-color-primary-light-1);
    }

    :deep(.scrollBarControl) {
      border-color: var(--el-color-primary);
    }

    :deep(.closeIcon) {
      line-height: 15px !important;
    }
  }

  .dark {
    .cutter-container {
      :deep(.toolBox) {
        border: transparent;
      }

      :deep(.dialogMain) {
        background-color: transparent !important;
      }

      :deep(.i-dialog-footer) {
        .btn {
          background-color: var(--el-color-primary) !important;
          border: transparent;
        }
      }
    }
  }
</style>
