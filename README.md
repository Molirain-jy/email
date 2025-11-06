# 📧 Cloudflare Workers 邮件系统

> 基于 Cloudflare Workers 与 Email Routing 的轻量级邮件发送服务（提供简洁 Web 界面与 REST API）

- 用户认证（登录 Token）与 API Key 双模式
- 支持 To/CC/BCC、HTML/纯文本、多收件人
- 零维护、全球加速，免费额度友好

---

## 一、项目简介

- 后端 API：`/api/login`、`/api/send`、`/api/verify`
- 鉴权方式：
   - 登录 Token（调用 `/api/login` 获取，默认 24h 内有效）
   - API Key（设置环境变量 `API_KEY`，直接随请求发送）
- 前端页面：登录与发送界面（见 `public/` 或 `frontend-standalone/`）
- 依赖 Cloudflare Email Routing 完成发件域名配置与投递

---

## 二、使用方式（Use）

### 1) Web 界面
1. 打开 `https://你的-worker.workers.dev/login`
2. 使用环境变量中配置的账号密码登录
3. 在发送页填写发件人、收件人、主题与内容后发送

提示：发件人需为已在 Email Routing 中配置/验证的域名邮箱，例如 `noreply@yourdomain.com`。

### 2) API（PowerShell 示例）
方式 A：使用登录 Token（先登录获取，再发送）
```powershell
$body = @{ username = "admin"; password = "your_password" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://你的-worker.workers.dev/api/login" -Method Post -Body $body -ContentType "application/json"
```
使用 Token 发送邮件：
```powershell
$headers = @{ "Content-Type" = "application/json"; "Authorization" = "Bearer <JWT_TOKEN>" }
$body = @{
  from = "noreply@yourdomain.com"
  to   = "user@example.com"
  subject = "测试邮件"
  html = "<h1>Hello</h1><p>这是一封测试邮件</p>"
} | ConvertTo-Json
Invoke-RestMethod -Uri "https://你的-worker.workers.dev/api/send" -Method Post -Body $body -Headers $headers
```

方式 B：使用 API Key（无需登录）

1) 在 Worker 环境变量中设置：`API_KEY=your_api_key_value`

2) 发送邮件时携带 API Key：

```powershell
$headers = @{
   "Content-Type" = "application/json"
   # 默认入口（src/index.js）：将 API Key 放在 Authorization 的 Bearer 中
   "Authorization" = "Bearer your_api_key_value"
}
$body = @{
   from = "noreply@yourdomain.com"
   to   = "user@example.com"
   subject = "使用 API Key 发送"
   text = "这是一封通过 API Key 发送的测试邮件"
} | ConvertTo-Json
Invoke-RestMethod -Uri "https://你的-worker.workers.dev/api/send" -Method Post -Body $body -Headers $headers
```

可选（高级变体 src/index-advanced.js）：也支持使用 `X-API-Key` 请求头携带 Key。

```powershell
$headers = @{
   "Content-Type" = "application/json"
   "X-API-Key"    = "your_api_key_value"
}
Invoke-RestMethod -Uri "https://你的-worker.workers.dev" -Method Post -Body $body -Headers $headers
```

---

## 三、部署方式（Deploy）

### 方式 A：Wrangler CLI（推荐）
1. 安装依赖并登录 Cloudflare：
   ```powershell
   npm install
   npx wrangler login
   ```
2. 在 Cloudflare Dashboard → Workers & Pages → 你的 Worker → Settings → Variables 添加环境变量：
   - `ADMIN_USERS`：示例 `admin:Pass123,user:Pass456`
   - `API_KEY`（可选）：启用 API Key 直连调用时使用，例如 `your_api_key_value`
3. 部署：
   ```powershell
   npm run deploy
   ```
4. 在你的域名下启用 Email Routing 并完成收/发件地址验证。

### 方式 B：Dashboard 手动部署
1. Dashboard → Workers & Pages → Create Application → Create Worker
2. 将 `src/index.js` 粘贴到 Quick Edit 并保存部署
3. 参照“方式 A”的第 2 步配置环境变量
4. 启用 Email Routing

---

## 四、必要环境变量

| 名称        | 说明                         | 示例                                      |
|-------------|------------------------------|-------------------------------------------|
| ADMIN_USERS | 登录账号（逗号分隔）           | `admin:Pass123,user:Pass456`              |
| API_KEY     | 可选，用于启用 API Key 调用     | `your_api_key_value`                      |

说明：当前默认实现使用“登录 Token”（简单 Base64 Token），并未使用 JWT。若需要无登录的后端调用，可设置 `API_KEY` 并按上文示例携带。

至少提供其一的邮件内容字段：`text` 或 `html`。

---

## 五、本地开发

```powershell
npm install
# 可选：根目录创建 .dev.vars（本地开发变量）
# ADMIN_USERS=admin:test
# API_KEY=local-api-key-xxxx
npm run dev
# 打开 http://localhost:8787/login
```

---

## 六、目录结构（简要）

```
email/
├─ src/                   # Worker 代码（包含多种入口变体）
│  ├─ index.js            # 带登录与 /api/send（Authorization: Bearer 支持 API Key）
│  ├─ index-advanced.js   # 仅 POST 根路径，支持 X-API-Key，含示例限流
│  ├─ index-with-ui.js    # 内置 UI 的版本（登录 + 发送）
│  └─ index-with-templates.js # 模板发送示例（演示用途）
├─ public/                # 基础前端页面（登录/发送）
├─ frontend-standalone/   # 可选：独立前端
├─ wrangler.json          # Workers 配置
├─ package.json
└─ README.md
```

---

MIT License
