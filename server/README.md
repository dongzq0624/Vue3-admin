# Vue3-Admin 后端服务

基于 Express 和 JWT 的后端服务器，提供登录、token 刷新、用户信息等接口。

## 功能特性

- ✅ JWT 认证（accessToken + refreshToken）
- ✅ 用户登录接口
- ✅ Token 刷新接口
- ✅ 用户信息接口（包含角色和按钮权限）
- ✅ 用户列表接口（支持分页和搜索）
- ✅ 角色列表接口（支持分页和搜索）
- ✅ 菜单列表接口
- ✅ 跨域支持（CORS）
- ✅ 统一错误处理

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

创建 `.env` 文件（或使用项目根目录的 `.env` 文件），配置如下：

```env
# 服务器端口（与前端 VITE_PORT 保持一致）
VITE_PORT=3300
# 或使用 PORT（向后兼容）
PORT=3300

# JWT 密钥（生产环境必须修改为强随机字符串）
# 支持 VITE_ 前缀（与前端保持一致）或直接使用 JWT_ 前缀
VITE_JWT_ACCESS_TOKEN_SECRET=your-access-token-secret-key
VITE_JWT_REFRESH_TOKEN_SECRET=your-refresh-token-secret-key
# 或使用简化命名（向后兼容）
JWT_ACCESS_TOKEN_SECRET=your-access-token-secret-key
JWT_REFRESH_TOKEN_SECRET=your-refresh-token-secret-key

# Token 过期时间
VITE_JWT_ACCESS_TOKEN_EXPIRES_IN=2h
VITE_JWT_REFRESH_TOKEN_EXPIRES_IN=7d
# 或使用简化命名（向后兼容）
JWT_ACCESS_TOKEN_EXPIRES_IN=2h
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
```

**注意**：环境变量支持多种命名方式，优先级如下：

1. `VITE_*` 前缀（与前端保持一致）
2. `JWT_*` 前缀（推荐用于后端）
3. 简化命名（向后兼容）

### 3. 启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务默认运行在 `http://localhost:3300`

## API 接口

### 1. 用户登录

**POST** `/api/auth/login`

请求体：

```json
{
  "userName": "admin",
  "password": "123456"
}
```

响应：

```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. 刷新 Token

**POST** `/api/auth/refresh`

请求体：

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

响应：

```json
{
  "code": 200,
  "msg": "刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. 获取用户信息

**GET** `/api/user/info`

请求头：

```
Authorization: Bearer <accessToken>
```

响应：

```json
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "userId": 1,
    "userName": "admin",
    "email": "admin@example.com",
    "avatar": "",
    "roles": ["R_SUPER"],
    "buttons": ["add", "edit", "delete", "view", "export", "import"]
  }
}
```

### 4. 获取用户列表（分页）

**GET** `/api/user/list`

请求头：

```
Authorization: Bearer <accessToken>
```

查询参数：

- `current`: 当前页码（默认 1）
- `size`: 每页数量（默认 20）
- `userName`: 用户名（模糊搜索，可选）
- `userGender`: 性别（可选）
- `userPhone`: 手机号（模糊搜索，可选）
- `userEmail`: 邮箱（模糊搜索，可选）
- `status`: 状态（'1': 在线, '2': 离线, '3': 异常, '4': 注销，可选）

响应：

```json
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "records": [
      {
        "userId": 1,
        "userName": "admin",
        "userEmail": "admin@example.com",
        "userPhone": "13800138000",
        "userGender": "male",
        "avatar": "",
        "status": "1",
        "roles": ["R_SUPER"],
        "buttons": ["add", "edit", "delete", "view", "export", "import"],
        "createTime": "2024-01-01 00:00:00",
        "updateTime": "2024-01-01 00:00:00"
      }
    ],
    "total": 100,
    "current": 1,
    "size": 20
  }
}
```

### 5. 获取角色列表（分页）

**GET** `/api/role/list`

请求头：

```
Authorization: Bearer <accessToken>
```

查询参数：

- `current`: 当前页码（默认 1）
- `size`: 每页数量（默认 20）
- `roleName`: 角色名称（模糊搜索，可选）
- `roleCode`: 角色编码（模糊搜索，可选）
- `description`: 角色描述（模糊搜索，可选）
- `enabled`: 是否启用（'1'/'true': 启用, '0'/'false': 禁用，可选）

响应：

```json
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "records": [
      {
        "roleId": 1,
        "roleName": "超级管理员",
        "roleCode": "R_SUPER",
        "description": "拥有所有权限的超级管理员",
        "enabled": true,
        "createTime": "2024-01-01 00:00:00",
        "updateTime": "2024-01-01 00:00:00"
      }
    ],
    "total": 10,
    "current": 1,
    "size": 20
  }
}
```

### 6. 获取菜单列表

**GET** `/api/v3/system/menus/simple`

请求头：

```
Authorization: Bearer <accessToken>
```

响应：

```json
{
  "code": 200,
  "msg": "获取成功",
  "data": [
    {
      "id": 1,
      "path": "/dashboard",
      "name": "Dashboard",
      "component": "/index/index",
      "meta": {
        "title": "menus.dashboard.title",
        "icon": "ri:dashboard-line",
        "isHide": false,
        "isHideTab": false,
        "keepAlive": true
      },
      "children": [...]
    }
  ]
}
```

## 测试账号

- **超级管理员**: `admin` / `123456`
  - 角色: `R_SUPER`
  - 权限: 所有按钮权限

- **管理员**: `manager` / `123456`
  - 角色: `R_ADMIN`
  - 权限: `add`, `edit`, `view`, `export`

- **普通用户**: `user` / `123456`
  - 角色: `R_USER`
  - 权限: `view`

## 权限说明

### 角色（Roles）

- `R_SUPER` - 超级管理员
- `R_ADMIN` - 管理员
- `R_USER` - 普通用户

### 按钮权限（Buttons）

- `add` - 新增
- `edit` - 编辑
- `delete` - 删除
- `view` - 查看
- `export` - 导出
- `import` - 导入

## 项目结构

```
server/
├── index.js              # 服务器入口
├── routes/               # 路由文件
│   ├── auth.js          # 认证路由（登录、刷新token）
│   ├── user.js          # 用户路由（获取用户信息）
│   └── system.js        # 系统管理路由（用户列表、角色列表、菜单列表）
├── middleware/          # 中间件
│   ├── auth.js         # JWT 认证中间件
│   └── errorHandler.js # 错误处理中间件
├── utils/               # 工具函数
│   └── jwt.js          # JWT 工具
├── data/                # 数据存储
│   ├── users.js        # 用户数据
│   ├── roles.js        # 角色数据
│   └── menus.js        # 菜单数据
├── .env                 # 环境变量
├── .gitignore          # Git 忽略文件
└── package.json         # 项目配置
```

## 安全注意事项

⚠️ **生产环境必须修改以下配置：**

1. 修改 `.env` 中的 JWT 密钥为强随机字符串
2. 使用数据库存储用户信息（当前为内存存储）
3. 使用 bcrypt 加密存储密码（当前为明文）
4. 配置 HTTPS
5. 添加请求频率限制
6. 添加日志记录和监控
