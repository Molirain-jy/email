# 📧 Cloudflare Workers 邮件系统#  Cloudflare �ʼ�����ϵͳ



> 带 Web UI 的完整邮件发送系统，基于 Cloudflare Workers 和 Email Routing> ���� Cloudflare Workers �������ʼ�ϵͳ������¼�ͷ��ͽ���



[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)##  ����

[![Auto Deploy](https://img.shields.io/badge/Deploy-Automatic-success)](https://github.com/features/actions)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)-  ��¼��֤��JWT��

-  Web ���ͽ���

## 🎨 功能特点-  5���ʼ�ģ��

-  ��Ӧʽ���

- 🔐 **用户认证** - 安全登录系统（账号通过 CF 环境变量管理，无注册接口）-  �������������˺�

- 📝 **富文本编辑器** - Quill.js 支持格式化邮件

- 📤 **完整邮件功能** - 支持多收件人、抄送、密送##  ������

- 📋 **发送历史** - 记录已发送的邮件

- 🌐 **响应式设计** - 适配桌面和移动设备### 1 �ϴ��� Cloudflare Pages

- 🔄 **自动部署** - GitHub 推送自动更新到 Cloudflare

- ⚡ **零成本运行** - 使用 Cloudflare 免费计划**��Ҫ�ϴ���Щ�ļ���**



## 🚀 快速部署（GitHub + Cloudflare 自动部署）```

public/

### 步骤 1：Fork 或推送到 GitHub index.html     ��¼ҳ

 app.html       ���ͽ���

**方式 A：Fork 本仓库** style.css      ��ʽ

- 点击右上角 "Fork" 按钮 app.js         ǰ���߼�

```

**方式 B：推送现有代码**

```powershell**�������裺**

cd d:\email1. ��¼ https://dash.cloudflare.com

git init2. Workers & Pages  Create  Pages  Upload assets

git add .3. �ϴ� `public` �ļ��е� 4 ���ļ�

git commit -m "Initial commit"4. ��¼ Pages URL���磺`https://xxx.pages.dev`��

git branch -M main

git remote add origin https://github.com/你的用户名/仓库名.git### 2 ���� Worker

git push -u origin main

``````powershell

npx wrangler login

### 步骤 2：获取 Cloudflare 凭证npm run deploy

```

1. **获取 API Token**

   - 访问：https://dash.cloudflare.com/profile/api-tokens��¼ Worker URL���磺`https://xxx.workers.dev`��

   - 点击 "Create Token"

   - 使用 "Edit Cloudflare Workers" 模板### 3 ���û�������

   - 复制生成的 Token（⚠️ 只显示一次！）

�� Worker ���������ӣ�

2. **获取 Account ID**

   - 访问：https://dash.cloudflare.com| ���� | ֵʾ�� | ˵�� |

   - 右侧 "Account ID"，点击复制|------|--------|------|

| `USERS` | `{"admin":"pass123"}` | �˺����� |

### 步骤 3：配置 GitHub Secrets| `JWT_SECRET` | `random-secret-key` | JWT��Կ |

| `CORS_ORIGIN` | `https://xxx.pages.dev` | Pages URL |

1. 进入你的 GitHub 仓库

2. Settings → Secrets and variables → Actions### 4 ����ǰ������

3. 点击 "New repository secret"

4. 添加两个 Secrets：�༭ `public/app.js` ��2�У�



   | Name | Value |```javascript

   |------|-------|const API_BASE_URL = 'https://���worker.workers.dev';

   | `CLOUDFLARE_API_TOKEN` | 你的 Cloudflare API Token |```

   | `CLOUDFLARE_ACCOUNT_ID` | 你的 Cloudflare Account ID |

�����ϴ��� Pages��

### 步骤 4：触发首次部署

### 5 ���� Email Routing

```powershell

# 推送任意更改触发部署1. Cloudflare  ����  Email  Email Routing

git commit --allow-empty -m "Trigger deployment"2. Enable Email Routing

git push3. ���Ӳ���֤Ŀ������

```

##  ʹ��

或在 GitHub 上：Actions → Deploy to Cloudflare Workers → Run workflow

1. ���� Pages URL

### 步骤 5：配置 Cloudflare 环境变量2. �����õ��˺ŵ�¼

3. ��д�ʼ���Ϣ����

部署成功后：

##  ���ؿ���

1. 访问 https://dash.cloudflare.com

2. Workers & Pages → `email-sender-worker````powershell

3. Settings → Variables → Environment Variables# ���

4. 添加以下变量：npm run dev



   | Variable name | Value | Type |# ǰ�ˣ����նˣ�

   |---------------|-------|------|cd public

   | `ADMIN_USERS` | `admin:YourPassword123` | Text |python -m http.server 8080

   | `JWT_SECRET` | `random-secret-key-2025` | Secret |```



   **格式说明：**���� http://127.0.0.1:8080

   - `ADMIN_USERS`：多个账号用逗号分隔，如 `admin:Pass123,user:Pass456`

   - `JWT_SECRET`：随机字符串，建议 32 位以上##  ��������



5. 点击 "Save and Deploy"**Q: ��������û���**  

�޸� Worker �������� `USERS`

### 步骤 6：启用 Email Routing

**Q: �ղ����ʼ���**  

1. 在 Cloudflare Dashboard 选择你的域名��飺�����䡢��������֤��������ȷ

2. Email → Email Routing → Enable

3. Destination addresses → Add destination address##  ����֤

4. 输入你的邮箱并验证

MIT

### 🎉 完成！

**访问地址：**
```
https://email-sender-worker.你的账号.workers.dev/login
```

**以后更新只需：**
```powershell
git add .
git commit -m "更新内容"
git push
```

GitHub Actions 会自动部署！✨

## 📁 项目结构

```
email/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions 自动部署配置
├── src/
│   └── index-with-ui.js        ← 主程序（后端 + 前端）
├── public/
│   ├── index.html              ← 邮件发送界面
│   └── login.html              ← 登录界面
├── wrangler.json               ← Cloudflare Workers 配置
├── package.json                ← 依赖配置
└── README.md                   ← 使用说明
```

## 🎯 使用指南

### 登录系统
1. 访问 `https://你的worker地址/login`
2. 输入在 Cloudflare 环境变量中设置的账号密码
3. 登录成功后自动跳转到发送界面

### 发送邮件
1. **发件人**：必须是你域名下的邮箱（如 `noreply@yourdomain.com`）
2. **收件人**：可以是多个，用逗号分隔
3. **主题**：邮件标题
4. **内容**：支持纯文本或富文本（HTML）
5. 点击"发送邮件"按钮

### 管理账号
在 Cloudflare Dashboard 修改 `ADMIN_USERS` 环境变量：
```
格式：用户名1:密码1,用户名2:密码2
示例：admin:SecurePass123,sales:Sales2025,support:Support456
```

修改后点击 "Save and Deploy" 使配置生效。

## 🔧 本地开发

1. **安装依赖**
   ```powershell
   npm install
   ```

2. **创建本地环境变量**
   
   创建 `.dev.vars` 文件：
   ```
   ADMIN_USERS=admin:test123,demo:demo123
   JWT_SECRET=local-development-secret-key
   ```

3. **启动开发服务器**
   ```powershell
   npm run dev
   ```

4. **访问**
   ```
   http://localhost:8787/login
   ```

## 📊 监控部署

### GitHub Actions
- 仓库 → Actions 标签
- 查看部署历史和日志
- 绿色 ✅ = 成功，红色 ❌ = 失败

### Cloudflare Dashboard
- Workers & Pages → 你的 Worker
- Deployments：查看部署历史
- Real-time logs：实时日志
- Metrics：性能指标

## 🔄 版本管理

### 查看部署历史
Cloudflare Dashboard → Workers & Pages → Deployments

### 回滚到之前版本
1. 找到想要回滚的版本
2. 点击右侧 "..." → Rollback to this deployment
3. 或者在 GitHub 回退 commit 后推送

### 分支部署
GitHub Actions 配置支持多分支：
```yaml
on:
  push:
    branches:
      - main      # 生产环境
      - develop   # 开发环境
```

## 🔒 安全说明

### API Token 安全
- ⚠️ **不要**在代码中硬编码 Token
- ✅ **使用** GitHub Secrets 存储
- ✅ **最小权限**原则
- ✅ **定期轮换** Token

### 账号安全
- ✅ 使用强密码（至少 8 位，字母+数字+特殊字符）
- ✅ 不同用户使用不同密码
- ✅ 定期更换密码
- ✅ 监控登录日志

### 邮件安全
- ✅ 发件人域名必须配置 Email Routing
- ✅ 收件人必须验证
- ✅ 防止被用于垃圾邮件

## ❓ 常见问题

### Q: GitHub Actions 部署失败？
**检查清单：**
1. Secrets 是否正确设置（区分大小写）
2. API Token 权限是否足够
3. Account ID 是否正确
4. 查看 Actions 日志获取详细错误

### Q: 部署成功但访问 404？
**解决方法：**
1. 等待几分钟让配置生效
2. 确认 Worker 名称：`email-sender-worker`
3. 访问完整 URL：`https://email-sender-worker.你的账号.workers.dev/login`

### Q: 登录失败？
**检查：**
1. 环境变量 `ADMIN_USERS` 格式是否正确
2. 密码中不要包含逗号或冒号
3. 修改环境变量后需要 "Save and Deploy"
4. 清除浏览器缓存

### Q: 收不到邮件？
**排查步骤：**
1. 检查垃圾邮件文件夹
2. 确认收件人邮箱已在 Email Routing 中验证
3. 确认发件人使用正确的域名
4. 查看 Worker 日志

### Q: 如何添加自定义域名？
1. Workers & Pages → 你的 Worker → Triggers
2. Custom Domains → Add Custom Domain
3. 输入域名（如 `mail.yourdomain.com`）
4. 添加 DNS 记录（自动提示）

### Q: 免费额度够用吗？
**Cloudflare 免费计划：**
- ✅ 100,000 次请求/天
- ✅ 足够个人和小团队使用
- ✅ 超出可升级到付费计划

## 🌟 项目亮点

| 特性 | 说明 |
|------|------|
| 🔄 **自动部署** | Git push 即自动部署 |
| 📝 **版本控制** | 完整的 Git 历史记录 |
| 📊 **部署日志** | GitHub Actions 详细日志 |
| 🔙 **快速回滚** | 一键回滚到任意版本 |
| 🆓 **完全免费** | GitHub + Cloudflare 免费 |
| 🌍 **全球加速** | Cloudflare CDN 300+ 节点 |
| 🔒 **安全可靠** | 企业级安全防护 |

## 📚 高级用法

### API 接口（可选）

如果需要通过 API 调用：

```bash
# 1. 登录获取 Token
curl -X POST https://your-worker.workers.dev/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"yourpass"}'

# 2. 使用 Token 发送邮件
curl -X POST https://your-worker.workers.dev/api/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "from": "noreply@yourdomain.com",
    "to": "user@example.com",
    "subject": "测试邮件",
    "text": "这是一封测试邮件",
    "html": "<h1>测试</h1><p>这是一封测试邮件</p>"
  }'
```

### 环境变量完整说明

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| `ADMIN_USERS` | ✅ | 用户账号列表 | `admin:Pass123,user:Pass456` |
| `JWT_SECRET` | ✅ | JWT 加密密钥 | `random-secret-key-123` |

## 📄 许可证

MIT License - 可自由使用、修改和分发

## 🔗 相关资源

- [Cloudflare Email Routing 文档](https://developers.cloudflare.com/email-routing/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Quill.js 富文本编辑器](https://quilljs.com/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

提交前请确保：
- 代码通过测试
- 遵循现有代码风格
- 更新相关文档

## 📞 支持

- 📖 查看文档：本 README
- 💬 提交 Issue：[GitHub Issues](https://github.com/your-repo/issues)
- 🌐 Cloudflare 社区：[community.cloudflare.com](https://community.cloudflare.com/)

---

**开始使用 →** 按照上面的步骤部署你的邮件系统！

**遇到问题？** 查看常见问题或提交 Issue

**觉得有用？** 给个 ⭐ Star 吧！
