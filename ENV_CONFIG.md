# 环境变量配置说明

本文档说明如何使用 Node.js 后端服务时的环境变量配置。

## 📁 文件结构

```
art-design-pro/
├── .env                    # 通用环境变量（可选，会被模式特定文件覆盖）
├── .env.development        # 开发环境配置（npm run dev）
├── .env.production         # 生产环境配置（npm run build）
└── server/
    ├── .env                # 后端服务环境变量
    └── env.example         # 后端环境变量示例
```

## 🚀 开发环境配置

### 前端配置（`.env.development`）

已自动创建 `.env.development` 文件，包含以下配置：

```env
# 应用基础配置
VITE_VERSION = 3.0.1
VITE_PORT = 3006
VITE_BASE_URL = /

# API 配置（Node.js 后端）
VITE_API_URL = /api                    # API 基础地址（通过 Vite 代理）
VITE_API_PROXY_URL = http://localhost:3002  # 代理目标（Node.js 后端地址）

# 权限配置
VITE_ACCESS_MODE = backend

# 请求配置
VITE_WITH_CREDENTIALS = false

# 功能开关
VITE_OPEN_ROUTE_INFO = false

# 安全配置
VITE_LOCK_ENCRYPT_KEY = s3cur3k3y4adpro
```

### 后端配置（`server/.env`）

后端服务需要创建 `server/.env` 文件（基于 `server/env.example`）：

```bash
cd server
cp env.example .env
```

**必需配置项：**

```env
# 服务器端口（与前端代理地址一致）
VITE_PORT=3002
# 或使用简化命名
PORT=3002

# JWT Access Token 密钥（生产环境必须修改）
VITE_JWT_ACCESS_TOKEN_SECRET=art-design-pro-access-token-secret-key-2024
# 或使用 JWT_ 前缀
JWT_ACCESS_TOKEN_SECRET=art-design-pro-access-token-secret-key-2024

# JWT Refresh Token 密钥（生产环境必须修改）
VITE_JWT_REFRESH_TOKEN_SECRET=art-design-pro-refresh-token-secret-key-2024
# 或使用 JWT_ 前缀
JWT_REFRESH_TOKEN_SECRET=art-design-pro-refresh-token-secret-key-2024

# Access Token 过期时间（默认 2 小时）
VITE_JWT_ACCESS_TOKEN_EXPIRES_IN=2h

# Refresh Token 过期时间（默认 7 天）
VITE_JWT_REFRESH_TOKEN_EXPIRES_IN=7d
```

## 🔄 请求流程

### 开发环境请求流程

1. **前端发起请求**

   ```javascript
   fetchLogin({ userName: 'admin', password: '123456' })
   // → 调用 /api/auth/login
   ```

2. **Axios 处理**
   - `baseURL`: `/api` (来自 `VITE_API_URL`)
   - 完整 URL: `/api/auth/login`

3. **Vite 代理转发**
   - 匹配规则: `/api/*`
   - 代理目标: `http://localhost:3002` (来自 `VITE_API_PROXY_URL`)
   - 最终请求: `http://localhost:3002/api/auth/login`

4. **Node.js 后端处理**
   - Express 服务器监听 `http://localhost:3002`
   - 路由处理: `/api/auth/login`

## 📝 配置说明

### Vite 环境变量加载规则

Vite 会根据运行模式（`mode`）加载对应的环境变量文件：

- `npm run dev` → 加载 `.env.development`
- `npm run build` → 加载 `.env.production`
- `.env` → 所有模式都会加载（优先级最低）

**优先级：** `.env.[mode]` > `.env.local` > `.env`

### 环境变量命名规则

- **前端变量**：必须以 `VITE_` 开头才能在客户端代码中访问
- **后端变量**：支持多种命名方式（`VITE_*`、`JWT_*`、简化命名）

### 后端环境变量命名优先级

后端代码支持多种命名方式，按以下优先级选择：

1. `VITE_*` 前缀（与前端保持一致）
2. `JWT_*` 前缀（推荐用于后端）
3. 简化命名（向后兼容）

## 🛠️ 启动步骤

### 1. 启动后端服务

```bash
cd server
npm install
npm start
```

后端将在 `http://localhost:3002` 运行

### 2. 启动前端开发服务器

```bash
npm run dev
```

前端将在 `http://localhost:3006` 运行（根据 `VITE_PORT` 配置）

### 3. 验证配置

启动后，控制台会显示：

```
🚀 API_URL = /api
🚀 VERSION = 3.0.1
```

## ⚠️ 注意事项

1. **端口配置**
   - 前端端口：`VITE_PORT`（默认 3006）
   - 后端端口：`VITE_PORT` 或 `PORT`（默认 3000）
   - 确保 `VITE_API_PROXY_URL` 中的端口与后端端口一致

2. **CORS 配置**
   - 开发环境后端已配置允许所有来源
   - 生产环境需要配置具体的允许来源

3. **JWT 密钥**
   - 开发环境可以使用默认密钥
   - **生产环境必须修改为强随机字符串**

4. **环境变量文件**
   - `.env` 和 `.env.development` 不应提交到 Git
   - 已配置 `.gitignore` 忽略这些文件
   - `env.example` 和 `.env.development` 可以提交作为示例

## 🔍 故障排查

### 问题：前端请求 404

**检查项：**

1. 后端服务是否已启动（`http://localhost:3002`）
2. `VITE_API_PROXY_URL` 是否正确指向后端地址
3. 后端路由是否正确配置

### 问题：CORS 错误

**检查项：**

1. 后端 CORS 配置是否正确
2. `VITE_WITH_CREDENTIALS` 配置是否与后端一致

### 问题：JWT 验证失败

**检查项：**

1. 后端 `.env` 文件中的 JWT 密钥是否正确配置
2. 前后端 JWT 密钥是否一致（如果共享配置）

## 📚 相关文档

- [Vite 环境变量文档](https://vitejs.dev/guide/env-and-mode.html)
- [Express 后端 README](./server/README.md)
