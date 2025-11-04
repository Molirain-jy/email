# 🚀 GitHub + Cloudflare 自动部署指南

## 📦 需要上传到 GitHub 的文件

```
✅ 自动推送的文件（git add .）：

.github/workflows/deploy.yml    ← 自动部署配置
src/index-with-ui.js            ← 后端代码
public/index.html               ← 发送界面
public/login.html               ← 登录界面
wrangler.json                   ← CF 配置
package.json                    ← 依赖
.gitignore                      ← Git 规则
README.md                       ← 文档
LICENSE                         ← 许可证

❌ 不会上传的文件（.gitignore 已配置）：

node_modules/                   ← npm 依赖
.dev.vars                       ← 本地密码
.wrangler/                      ← 本地缓存
package-lock.json               ← 依赖锁
```

## 🎯 三步部署

### 1️⃣ 推送到 GitHub

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

### 2️⃣ 配置 GitHub Secrets

仓库 → Settings → Secrets and variables → Actions

添加：
- `CLOUDFLARE_API_TOKEN`（从 https://dash.cloudflare.com/profile/api-tokens 获取）
- `CLOUDFLARE_ACCOUNT_ID`（从 Cloudflare Dashboard 右侧复制）

### 3️⃣ 配置 Cloudflare 环境变量

部署后在 Workers & Pages → 你的 Worker → Settings → Variables

添加：
- `ADMIN_USERS` = `admin:YourPassword123`
- `JWT_SECRET` = `random-secret-key-2025`

## ✨ 完成！

**访问：** `https://email-sender-worker.你的账号.workers.dev/login`

**更新：** 以后只需 `git push`，自动部署！

---

详细说明请查看 [README.md](README.md)
