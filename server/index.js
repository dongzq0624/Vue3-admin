/**
 * Express 后端服务器
 * 提供登录、token 刷新、用户信息等接口
 *
 * @module server/index
 * @author Vue3-Admin Team
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth.js'
import { userRouter } from './routes/user.js'
import { systemRouter } from './routes/system.js'
import { errorHandler } from './middleware/errorHandler.js'

// 加载环境变量
dotenv.config()

const app = express()

/**
 * 从环境变量获取端口
 * 只使用 PORT 环境变量或默认 3002 端口
 * 避免与前端 VITE_PORT 冲突
 */
const PORT = process.env.PORT || 3002

// 中间件配置
app.use(
  cors({
    origin: true, // 允许所有来源（生产环境应配置具体域名）
    credentials: true
  })
)
app.use(express.json()) // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })) // 解析 URL 编码的请求体

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// 路由配置
app.use('/api/auth', authRouter) // 认证相关路由
app.use('/api/user', userRouter) // 用户相关路由
app.use('/api', systemRouter) // 系统管理路由（用户列表、角色列表等）
app.use('/api/v3', systemRouter) // 系统管理路由（菜单列表等）

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Vue3-Admin Backend'
  })
})

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    msg: '接口不存在',
    data: null
  })
})

// 错误处理中间件（必须放在最后）
app.use(errorHandler)

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
  console.log(`📝 API 接口:`)
  console.log(`   POST /api/auth/login - 用户登录`)
  console.log(`   POST /api/auth/refresh - 刷新 accessToken`)
  console.log(`   GET  /api/user/info - 获取用户信息`)
  console.log(`   GET  /api/user/list - 获取用户列表（分页）`)
  console.log(`   GET  /api/role/list - 获取角色列表（分页）`)
  console.log(`   GET  /api/v3/system/menus/simple - 获取菜单列表`)
  console.log(`   GET  /health - 健康检查`)
})
