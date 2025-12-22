# Vue3-Admin Vue3

一个基于 Vue 3 构建的现代化艺术设计后台管理系统，提供完整的用户认证、权限管理、菜单配置和系统管理功能。

## 🎨 项目特点

- **现代化技术栈**：Vue 3 + Vite + Element Plus + Pinia
- **完整的认证系统**：JWT 令牌认证，支持 accessToken 自动刷新
- **基于角色的权限控制**：RBAC 权限模型，细粒度控制菜单和页面访问
- **响应式设计**：适配桌面端和移动端设备
- **完善的错误处理**：401 错误自动处理，请求重试机制
- **丰富的组件库**：内置多种 UI 组件和业务组件
- **模块化架构**：清晰的代码结构，便于维护和扩展

## 🛠️ 技术栈

### 前端技术栈

- **Vue 3**：渐进式 JavaScript 框架
- **Vite**：下一代前端构建工具
- **Element Plus**：基于 Vue 3 的桌面端组件库
- **Pinia**：Vue 3 官方状态管理库
- **Vue Router**：Vue 3 路由管理器
- **Axios**：HTTP 客户端，用于 API 请求
- **Tailwind CSS**：实用优先的 CSS 框架
- **Vue I18n**：国际化解决方案

### 后端技术栈

- **Node.js**：JavaScript 运行时
- **Express**：Node.js Web 框架
- **JWT**：JSON Web Token 认证
- **CORS**：跨域资源共享支持
- **Dotenv**：环境变量管理

## 🚀 快速开始

### 环境要求

- Node.js >= 20.19.0
- npm >= 9.0.0

### 安装依赖

```bash
# 克隆项目
https://github.com/dongzq0624/Vue3-admin.git
cd art-design-pro-vue3

# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
cd ..
```

### 启动开发服务器

```bash
# 启动前端开发服务器（默认端口：3006）
npm run dev

# 启动后端服务器（默认端口：3000）
node server/index.js
```

### 访问项目

- 前端地址：http://localhost:3006
- 后端地址：http://localhost:3000
- 健康检查：http://localhost:3000/health

## 📁 项目结构

```
├── public/                  # 静态资源
├── src/                     # 前端源代码
│   ├── assets/              # 资源文件（图片、图标等）
│   ├── components/          # 组件
│   │   ├── core/            # 核心组件
│   │   ├── layout/          # 布局组件
│   │   └── widgets/         # 业务组件
│   ├── config/              # 配置文件
│   ├── enums/               # 枚举定义
│   ├── locales/             # 国际化资源
│   ├── router/              # 路由配置
│   ├── store/               # Pinia 状态管理
│   ├── styles/              # 样式文件
│   ├── utils/               # 工具函数
│   │   └── http/            # HTTP 请求封装
│   ├── views/               # 页面组件
│   │   ├── auth/            # 认证相关页面
│   │   ├── dashboard/       # 仪表盘
│   │   ├── system/          # 系统管理
│   │   └── user/            # 用户管理
│   ├── App.vue              # 根组件
│   └── main.js              # 入口文件
├── server/                  # 后端代码
│   ├── data/                # 模拟数据
│   ├── middleware/          # 中间件
│   ├── routes/              # 路由
│   ├── utils/               # 工具函数
│   └── index.js             # 后端入口
├── .env                     # 环境变量
├── vite.config.js           # Vite 配置
├── package.json             # 项目配置
└── README.md                # 项目说明
```

## ⚙️ 配置说明

### 环境变量

在 `.env` 文件中配置项目参数：

```env
# 端口号
VITE_PORT = 3006

# 应用部署基础路径
VITE_BASE_URL = /

# 权限模式【frontend 前端模式 / backend 后端模式】
VITE_ACCESS_MODE = backend

# 跨域请求时是否携带 Cookie
VITE_WITH_CREDENTIALS = false

# 是否打开路由信息
VITE_OPEN_ROUTE_INFO = false

# 锁屏加密密钥
VITE_LOCK_ENCRYPT_KEY = s3cur3k3y4adpro
```

### JWT 配置

在 `server/utils/jwt.js` 中配置 JWT 令牌参数：

```javascript
// Token 过期时间
const ACCESS_TOKEN_EXPIRES_IN = '1m' // 默认 1 分钟
const REFRESH_TOKEN_EXPIRES_IN = '7d' // 默认 7 天
```

### 代理配置

在 `vite.config.js` 中配置 API 代理：

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      rewrite: (path) => path
    }
  }
}
```

## 📊 主要功能

### 用户管理

- 用户列表展示
- 用户信息编辑
- 角色分配
- 状态管理

### 系统管理

- 菜单配置
- 角色管理
- 权限分配
- 系统设置

### 认证系统

- 用户登录
- 密码验证
- Token 刷新
- 权限检查

### 其他功能

- 仪表盘统计
- 响应式布局
- 多语言支持
- 锁屏功能

## 📝 API 接口

### 认证接口

```bash
# 用户登录
POST /api/auth/login

# 刷新 Token
POST /api/auth/refresh
```

### 用户接口

```bash
# 获取用户信息
GET /api/user/info

# 获取用户列表
GET /api/user/list
```

### 系统接口

```bash
# 获取菜单列表
GET /api/v3/system/menus/simple

# 获取角色列表
GET /api/role/list
```

## 🤝 开发指南

### 开发流程

1. 克隆项目代码
2. 安装依赖
3. 启动开发服务器
4. 创建新组件或页面
5. 编写业务逻辑
6. 运行测试
7. 提交代码

### 代码规范

- 使用 ES6+ 语法
- 遵循 Vue 3 代码风格
- 组件命名使用大驼峰式
- 文件命名使用短横线分隔
- 适当添加代码注释

### 组件开发

```vue
<template>
  <!-- 组件模板 -->
</template>

<script setup>
  // 组件逻辑
</script>

<style scoped>
  /* 组件样式 */
</style>
```

## 📦 构建部署

### 构建生产版本

```bash
# 构建前端项目
npm run build

# 构建后的文件位于 dist 目录
```

### 部署方式

1. **静态部署**：将 `dist` 目录部署到 Nginx、Apache 等 Web 服务器
2. **容器化部署**：使用 Docker 容器部署
3. **云服务部署**：部署到 AWS、阿里云、腾讯云等云平台

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/your/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 🔧 常见问题

### Q: 登录后出现 401 错误？

A: 检查用户名和密码是否正确，或者检查后端服务是否正常运行。

### Q: 刷新页面后登录状态丢失？

A: 登录状态通过 localStorage 持久化，检查浏览器是否禁用了 localStorage。

### Q: Token 过期后自动刷新不生效？

A: 检查 `src/utils/http/index.js` 中的 refreshToken 逻辑，确保 refreshToken 已正确存储。

### Q: 端口被占用？

A: 修改 `.env` 文件中的 `VITE_PORT` 配置，使用其他可用端口。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题或建议，欢迎联系项目团队：

- Email: support@artdesignpro.com
- Github: https://github.com/dongzq0624/Vue3-admin.git

---

**Vue3-Admin Vue3** - 让艺术设计更简单 🎨
