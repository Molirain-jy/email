# 📧 Cloudflare Workers 邮件系统

> 基于 Cloudflare Workers 与 Email Routing 的轻量级邮件发送服务（提供简洁 Web 界面与 REST API）

- 用户认证（环境变量管理账号，JWT 登录）
- 支持 To/CC/BCC、HTML/纯文本、多收件人
- 零维护、全球加速，免费额度友好

---

## 一、项目简介

- 后端 API：`/api/login`、`/api/send`、`/api/verify`
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
登录获取 Token：
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
   - `JWT_SECRET`：随机密钥（建议 ≥ 32 字符）
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

| 名称        | 说明             | 示例                                      |
|-------------|------------------|-------------------------------------------|
| ADMIN_USERS | 登录账号（逗号分隔） | `admin:Pass123,user:Pass456`              |
| JWT_SECRET  | JWT 加密密钥     | `random-secret-key-2025-xxxxxxxxxxxxxxxx` |

至少提供其一的邮件内容字段：`text` 或 `html`。

---

## 五、本地开发

```powershell
npm install
# 可选：根目录创建 .dev.vars（本地开发变量）
# ADMIN_USERS=admin:test
# JWT_SECRET=local-secret-xxxx
npm run dev
# 打开 http://localhost:8787/login
```

---

## 六、目录结构（简要）

```
email/
├─ src/                   # Worker 代码
├─ public/                # 基础前端页面（登录/发送）
├─ frontend-standalone/   # 可选：独立前端
├─ wrangler.json          # Workers 配置
├─ package.json
└─ README.md
```

---

MIT License
