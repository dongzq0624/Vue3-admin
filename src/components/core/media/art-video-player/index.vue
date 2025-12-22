<!-- 视频播放器组件：https://h5player.bytedance.com/-->
<template>
  <div :id="playerId" />
</template>

<script setup>
  import Player from 'xgplayer'
  import 'xgplayer/dist/index.min.css'
  import { ref, onMounted, onBeforeUnmount } from 'vue'

  defineOptions({ name: 'ArtVideoPlayer' })

  const props = defineProps({
    /** 播放器容器 ID */
    playerId: {
      type: String,
      default: ''
    },
    /** 视频源URL */
    videoUrl: {
      type: String,
      default: ''
    },
    /** 视频封面图URL */
    posterUrl: {
      type: String,
      default: ''
    },
    /** 是否自动播放 */
    autoplay: {
      type: Boolean,
      default: false
    },
    /** 音量大小(0-1) */
    volume: {
      type: Number,
      default: 1
    },
    /** 可选的播放速率 */
    playbackRates: {
      type: Array,
      default: () => []
    },
    /** 是否循环播放 */
    loop: {
      type: Boolean,
      default: false
    },
    /** 是否静音 */
    muted: {
      type: Boolean,
      default: false
    },
    commonStyle: {
      type: Object,
      default: () => {}
    }
  })

  // 播放器实例引用
  const playerInstance = ref(null)

  // 默认样式配置
  const defaultStyle = {
    progressColor: 'rgba(255, 255, 255, 0.3)',
    playedColor: '#00AEED',
    cachedColor: 'rgba(255, 255, 255, 0.6)',
    sliderBtnStyle: {
      width: '10px',
      height: '10px',
      backgroundColor: '#00AEED'
    },
    volumeColor: '#00AEED'
  }

  // 组件挂载时初始化播放器
  onMounted(() => {
    playerInstance.value = new Player({
      id: props.playerId,
      lang: 'zh', // 设置界面语言为中文
      volume: props.volume,
      autoplay: props.autoplay,
      screenShot: true, // 启用截图功能
      url: props.videoUrl,
      poster: props.posterUrl,
      fluid: true, // 启用流式布局，自适应容器大小
      playbackRate: props.playbackRates,
      loop: props.loop,
      muted: props.muted,
      commonStyle: {
        ...defaultStyle,
        ...props.commonStyle
      }
    })

    // 播放事件监听器
    playerInstance.value.on('play', () => {
      console.log('Video is playing')
    })

    // 暂停事件监听器
    playerInstance.value.on('pause', () => {
      console.log('Video is paused')
    })

    // 错误事件监听器
    playerInstance.value.on('error', (error) => {
      console.error('Error occurred:', error)
    })
  })

  // 组件卸载前清理播放器实例
  onBeforeUnmount(() => {
    if (playerInstance.value) {
      playerInstance.value.destroy()
    }
  })
</script>
