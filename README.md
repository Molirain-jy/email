# 📧 Cloudflare Workers 邮件发送系统# 📧 Cloudflare Workers 邮件系统#  Cloudflare �ʼ�����ϵͳ



> 基于 Cloudflare Workers 和 Email Routing 的轻量级邮件发送服务



[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)> 带 Web UI 的完整邮件发送系统，基于 Cloudflare Workers 和 Email Routing> ���� Cloudflare Workers �������ʼ�ϵͳ������¼�ͷ��ͽ���

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)



## 📖 项目介绍

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)##  ����

这是一个基于 Cloudflare Workers 构建的邮件发送系统，提供简洁的 Web UI 和完整的 API 接口。利用 Cloudflare Email Routing 服务，实现零成本的企业级邮件发送功能。

[![Auto Deploy](https://img.shields.io/badge/Deploy-Automatic-success)](https://github.com/features/actions)

### ✨ 主要特性

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)-  ��¼��֤��JWT��

- 🔐 **用户认证** - JWT Token 认证，账号通过环境变量管理

- 📤 **完整邮件功能** - 支持多收件人、抄送（CC）、密送（BCC）-  Web ���ͽ���

- 📝 **富文本编辑** - 支持 HTML 格式邮件

- 🌐 **响应式界面** - 适配桌面和移动设备## 🎨 功能特点-  5���ʼ�ģ��

- 🚀 **API 接口** - 支持程序化调用

- ⚡ **零成本** - 使用 Cloudflare 免费计划-  ��Ӧʽ���

- 🌍 **全球加速** - Cloudflare 全球 CDN 网络

- 🔐 **用户认证** - 安全登录系统（账号通过 CF 环境变量管理，无注册接口）-  �������������˺�

## 📦 快速部署

- 📝 **富文本编辑器** - Quill.js 支持格式化邮件

### 方式一：使用 Wrangler CLI（推荐）

- 📤 **完整邮件功能** - 支持多收件人、抄送、密送##  ������

#### 1. 环境准备

- 📋 **发送历史** - 记录已发送的邮件

```powershell

# 安装依赖- 🌐 **响应式设计** - 适配桌面和移动设备### 1 �ϴ��� Cloudflare Pages

npm install

- 🔄 **自动部署** - GitHub 推送自动更新到 Cloudflare

# 登录 Cloudflare

npx wrangler login- ⚡ **零成本运行** - 使用 Cloudflare 免费计划**��Ҫ�ϴ���Щ�ļ���**

```



#### 2. 配置环境变量

## 🚀 快速部署（GitHub + Cloudflare 自动部署）```

创建 `.dev.vars` 文件（本地开发用）：

public/

```

ADMIN_USERS=admin:your_password### 步骤 1：Fork 或推送到 GitHub index.html     ��¼ҳ

JWT_SECRET=your-random-secret-key-here

``` app.html       ���ͽ���



**环境变量说明：****方式 A：Fork 本仓库** style.css      ��ʽ



| 变量名 | 说明 | 示例 |- 点击右上角 "Fork" 按钮 app.js         ǰ���߼�

|--------|------|------|

| `ADMIN_USERS` | 用户账号（多个用逗号分隔） | `admin:Pass123,user:Pass456` |```

| `JWT_SECRET` | JWT 加密密钥（建议 32 位以上） | `random-secret-key-2025` |

**方式 B：推送现有代码**

#### 3. 部署到 Cloudflare

```powershell**�������裺**

```powershell

# 部署 Workercd d:\email1. ��¼ https://dash.cloudflare.com

npm run deploy

```git init2. Workers & Pages  Create  Pages  Upload assets



部署成功后会显示访问地址：`https://your-worker.your-account.workers.dev`git add .3. �ϴ� `public` �ļ��е� 4 ���ļ�



#### 4. 配置生产环境变量git commit -m "Initial commit"4. ��¼ Pages URL���磺`https://xxx.pages.dev`��



1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)git branch -M main

2. 进入 **Workers & Pages** → 选择你的 Worker

3. 点击 **Settings** → **Variables**git remote add origin https://github.com/你的用户名/仓库名.git### 2 ���� Worker

4. 添加环境变量：

   - `ADMIN_USERS`: `admin:YourSecurePassword`git push -u origin main

   - `JWT_SECRET`: `your-random-secret-key` (勾选 Encrypt)

5. 点击 **Save and Deploy**``````powershell



#### 5. 配置 Email Routingnpx wrangler login



1. 在 Cloudflare Dashboard 选择你的域名### 步骤 2：获取 Cloudflare 凭证npm run deploy

2. 进入 **Email** → **Email Routing**

3. 点击 **Enable Email Routing**```

4. 添加目标邮箱地址并完成验证

5. 现在可以使用 `your-name@yourdomain.com` 作为发件人1. **获取 API Token**



### 方式二：手动部署   - 访问：https://dash.cloudflare.com/profile/api-tokens��¼ Worker URL���磺`https://xxx.workers.dev`��



#### 1. 创建 Worker   - 点击 "Create Token"



1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)   - 使用 "Edit Cloudflare Workers" 模板### 3 ���û�������

2. 进入 **Workers & Pages** → **Create application** → **Create Worker**

3. 为 Worker 命名（如 `email-sender`）   - 复制生成的 Token（⚠️ 只显示一次！）

4. 点击 **Deploy**

�� Worker ���������ӣ�

#### 2. 上传代码

2. **获取 Account ID**

1. 点击 **Quick edit**

2. 复制 `src/index.js` 的内容到编辑器   - 访问：https://dash.cloudflare.com| ���� | ֵʾ�� | ˵�� |

3. 点击 **Save and Deploy**

   - 右侧 "Account ID"，点击复制|------|--------|------|

#### 3. 配置环境变量和 Email Routing

| `USERS` | `{"admin":"pass123"}` | �˺����� |

参考方式一的步骤 4 和步骤 5

### 步骤 3：配置 GitHub Secrets| `JWT_SECRET` | `random-secret-key` | JWT��Կ |

## 🎯 使用方式

| `CORS_ORIGIN` | `https://xxx.pages.dev` | Pages URL |

### Web 界面使用

1. 进入你的 GitHub 仓库

#### 1. 登录系统

2. Settings → Secrets and variables → Actions### 4 ����ǰ������

访问：`https://your-worker.workers.dev/login`

3. 点击 "New repository secret"

- 输入在环境变量中配置的用户名和密码

- 登录成功后会自动跳转到邮件发送界面4. 添加两个 Secrets：�༭ `public/app.js` ��2�У�



#### 2. 发送邮件



1. **发件人**：输入你的域名邮箱（需在 Email Routing 中配置）   | Name | Value |```javascript

2. **收件人**：输入收件人邮箱（多个用逗号分隔）

3. **主题**：输入邮件主题   |------|-------|const API_BASE_URL = 'https://���worker.workers.dev';

4. **内容**：编写邮件内容（支持富文本格式）

5. 可选：填写抄送（CC）和密送（BCC）   | `CLOUDFLARE_API_TOKEN` | 你的 Cloudflare API Token |```

6. 点击"发送邮件"按钮

   | `CLOUDFLARE_ACCOUNT_ID` | 你的 Cloudflare Account ID |

### API 接口使用

�����ϴ��� Pages��

#### 1. 登录获取 Token

### 步骤 4：触发首次部署

**请求：**

### 5 ���� Email Routing

```powershell

$body = @{username="admin"; password="your_password"} | ConvertTo-Json```powershell

Invoke-RestMethod -Uri "https://your-worker.workers.dev/api/login" -Method Post -Body $body -ContentType "application/json"

```# 推送任意更改触发部署1. Cloudflare  ����  Email  Email Routing



**响应：**git commit --allow-empty -m "Trigger deployment"2. Enable Email Routing



```jsongit push3. ���Ӳ���֤Ŀ������

{

  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",```

  "username": "admin"

}##  ʹ��

```

或在 GitHub 上：Actions → Deploy to Cloudflare Workers → Run workflow

#### 2. 发送邮件

1. ���� Pages URL

**请求：**

### 步骤 5：配置 Cloudflare 环境变量2. �����õ��˺ŵ�¼

```powershell

$headers = @{3. ��д�ʼ���Ϣ����

    "Content-Type" = "application/json"

    "Authorization" = "Bearer your-jwt-token"部署成功后：

}

$body = @{##  ���ؿ���

    from = "noreply@yourdomain.com"

    to = "user@example.com"1. 访问 https://dash.cloudflare.com

    subject = "测试邮件"

    html = "<h1>Hello</h1><p>这是一封测试邮件</p>"2. Workers & Pages → `email-sender-worker````powershell

} | ConvertTo-Json

3. Settings → Variables → Environment Variables# ���

Invoke-RestMethod -Uri "https://your-worker.workers.dev/api/send" -Method Post -Body $body -Headers $headers

```4. 添加以下变量：npm run dev



**响应：**



```json   | Variable name | Value | Type |# ǰ�ˣ����նˣ�

{

  "success": true,   |---------------|-------|------|cd public

  "message": "邮件发送成功",

  "messageId": "xxx@yourdomain.com"   | `ADMIN_USERS` | `admin:YourPassword123` | Text |python -m http.server 8080

}

```   | `JWT_SECRET` | `random-secret-key-2025` | Secret |```



#### API 端点说明



| 端点 | 方法 | 说明 | 认证 |   **格式说明：**���� http://127.0.0.1:8080

|------|------|------|------|

| `/api/login` | POST | 用户登录获取 Token | 无需 |   - `ADMIN_USERS`：多个账号用逗号分隔，如 `admin:Pass123,user:Pass456`

| `/api/send` | POST | 发送邮件 | 需要 JWT Token |

| `/api/verify` | POST | 验证 Token 有效性 | 需要 JWT Token |   - `JWT_SECRET`：随机字符串，建议 32 位以上##  ��������



#### 邮件参数说明



| 参数 | 类型 | 必需 | 说明 |5. 点击 "Save and Deploy"**Q: ��������û���**  

|------|------|------|------|

| `from` | String | ✅ | 发件人邮箱（需在 Email Routing 中配置） |�޸� Worker �������� `USERS`

| `to` | String/Array | ✅ | 收件人邮箱（多个用数组或逗号分隔） |

| `subject` | String | ✅ | 邮件主题 |### 步骤 6：启用 Email Routing

| `text` | String | ❌ | 纯文本内容 |

| `html` | String | ❌ | HTML 格式内容 |**Q: �ղ����ʼ���**  

| `cc` | String/Array | ❌ | 抄送 |

| `bcc` | String/Array | ❌ | 密送 |1. 在 Cloudflare Dashboard 选择你的域名��飺�����䡢��������֤��������ȷ

| `replyTo` | String | ❌ | 回复地址 |

2. Email → Email Routing → Enable

**注意：** `text` 和 `html` 至少需要提供一个

3. Destination addresses → Add destination address##  ����֤

### 编程语言示例

4. 输入你的邮箱并验证

#### JavaScript/Node.js

MIT

```javascript

// 登录### 🎉 完成！

const loginResponse = await fetch('https://your-worker.workers.dev/api/login', {

  method: 'POST',**访问地址：**

  headers: { 'Content-Type': 'application/json' },```

  body: JSON.stringify({ username: 'admin', password: 'your_password' })https://email-sender-worker.你的账号.workers.dev/login

});```

const { token } = await loginResponse.json();

**以后更新只需：**

// 发送邮件```powershell

const sendResponse = await fetch('https://your-worker.workers.dev/api/send', {git add .

  method: 'POST',git commit -m "更新内容"

  headers: {git push

    'Content-Type': 'application/json',```

    'Authorization': `Bearer ${token}`

  },GitHub Actions 会自动部署！✨

  body: JSON.stringify({

    from: 'noreply@yourdomain.com',## 📁 项目结构

    to: 'user@example.com',

    subject: '测试邮件',```

    html: '<h1>Hello World</h1>'email/

  })├── .github/

});│   └── workflows/

const result = await sendResponse.json();│       └── deploy.yml          ← GitHub Actions 自动部署配置

console.log(result);├── src/

```│   └── index-with-ui.js        ← 主程序（后端 + 前端）

├── public/

#### Python│   ├── index.html              ← 邮件发送界面

│   └── login.html              ← 登录界面

```python├── wrangler.json               ← Cloudflare Workers 配置

import requests├── package.json                ← 依赖配置

└── README.md                   ← 使用说明

# 登录```

login_response = requests.post(

    'https://your-worker.workers.dev/api/login',## 🎯 使用指南

    json={'username': 'admin', 'password': 'your_password'}

)### 登录系统

token = login_response.json()['token']1. 访问 `https://你的worker地址/login`

2. 输入在 Cloudflare 环境变量中设置的账号密码

# 发送邮件3. 登录成功后自动跳转到发送界面

send_response = requests.post(

    'https://your-worker.workers.dev/api/send',### 发送邮件

    headers={1. **发件人**：必须是你域名下的邮箱（如 `noreply@yourdomain.com`）

        'Content-Type': 'application/json',2. **收件人**：可以是多个，用逗号分隔

        'Authorization': f'Bearer {token}'3. **主题**：邮件标题

    },4. **内容**：支持纯文本或富文本（HTML）

    json={5. 点击"发送邮件"按钮

        'from': 'noreply@yourdomain.com',

        'to': 'user@example.com',### 管理账号

        'subject': '测试邮件',在 Cloudflare Dashboard 修改 `ADMIN_USERS` 或 `USERS` 环境变量：

        'html': '<h1>Hello World</h1>'```

    }格式：用户名1:密码1,用户名2:密码2

)示例：admin:SecurePass123,sales:Sales2025,support:Support456

print(send_response.json())```

```

修改后点击 "Save and Deploy" 使配置生效。

## 🔧 本地开发

## 🔧 本地开发

### 1. 安装依赖

1. **安装依赖**

```powershell   ```powershell

npm install   npm install

```   ```



### 2. 配置本地环境2. **创建本地环境变量**

   

创建 `.dev.vars` 文件：   创建 `.dev.vars` 文件：

   ```

```   ADMIN_USERS=admin:test123,demo:demo123

ADMIN_USERS=admin:test123   JWT_SECRET=local-development-secret-key

JWT_SECRET=local-dev-secret-key   ```

```

3. **启动开发服务器**

### 3. 启动开发服务器   ```powershell

   npm run dev

```powershell   ```

npm run dev

```4. **访问**

   ```

访问：`http://localhost:8787/login`   http://localhost:8787/login

   ```

### 4. 本地测试邮件发送

## 📊 监控部署

**注意：** 本地开发环境无法真实发送邮件，需要部署到 Cloudflare 才能使用 Email Routing 功能。

### GitHub Actions

## 📁 项目结构- 仓库 → Actions 标签

- 查看部署历史和日志

```- 绿色 ✅ = 成功，红色 ❌ = 失败

email/

├── src/### Cloudflare Dashboard

│   └── index.js                 # 主程序（API + 前端路由）- Workers & Pages → 你的 Worker

├── public/- Deployments：查看部署历史

│   ├── index.html               # 邮件发送界面- Real-time logs：实时日志

│   └── login.html               # 登录界面- Metrics：性能指标

├── frontend-standalone/         # 独立前端页面（可选）

│   ├── index.html## 🔄 版本管理

│   ├── login.html

│   └── config.html### 查看部署历史

├── wrangler.json                # Cloudflare Workers 配置Cloudflare Dashboard → Workers & Pages → Deployments

├── package.json                 # 依赖配置

└── README.md                    # 项目文档### 回滚到之前版本

```1. 找到想要回滚的版本

2. 点击右侧 "..." → Rollback to this deployment

## 🔒 安全建议3. 或者在 GitHub 回退 commit 后推送



### 账号安全### 分支部署

GitHub Actions 配置支持多分支：

- ✅ 使用强密码（至少 12 位，包含大小写字母、数字和特殊字符）```yaml

- ✅ 定期更换密码on:

- ✅ 不同用户使用不同密码  push:

- ✅ JWT_SECRET 使用随机字符串，不要泄露    branches:

      - main      # 生产环境

### 邮件安全      - develop   # 开发环境

```

- ✅ 发件人域名必须配置 Email Routing

- ✅ 收件人邮箱需要验证## 🔒 安全说明

- ✅ 避免用于发送垃圾邮件（会被封禁）

- ✅ 设置合理的发送频率限制### API Token 安全

- ⚠️ **不要**在代码中硬编码 Token

### API 安全- ✅ **使用** GitHub Secrets 存储

- ✅ **最小权限**原则

- ✅ 生产环境启用 HTTPS- ✅ **定期轮换** Token

- ✅ 限制 CORS 来源（可配置 `CORS_ORIGIN` 环境变量）

- ✅ Token 设置合理的过期时间### 账号安全

- ✅ 监控异常请求- ✅ 使用强密码（至少 8 位，字母+数字+特殊字符）

- ✅ 不同用户使用不同密码

## ❓ 常见问题- ✅ 定期更换密码

- ✅ 监控登录日志

### Q1: 如何添加新用户？

### 邮件安全

修改 Cloudflare 环境变量 `ADMIN_USERS`：- ✅ 发件人域名必须配置 Email Routing

- ✅ 收件人必须验证

```- ✅ 防止被用于垃圾邮件

admin:Pass123,user1:Pass456,user2:Pass789

```## ❓ 常见问题



修改后点击 "Save and Deploy"。### Q: GitHub Actions 部署失败？

**检查清单：**

### Q2: 收不到邮件怎么办？1. Secrets 是否正确设置（区分大小写）

2. API Token 权限是否足够

**排查步骤：**3. Account ID 是否正确

4. 查看 Actions 日志获取详细错误

1. 检查垃圾邮件文件夹

2. 确认收件人邮箱已在 Email Routing 中验证### Q: 部署成功但访问 404？

3. 确认发件人使用的是已配置的域名邮箱**解决方法：**

4. 查看 Worker 日志是否有错误1. 等待几分钟让配置生效

2. 确认 Worker 名称：`email-sender-worker`

### Q3: 登录失败？3. 访问完整 URL：`https://email-sender-worker.你的账号.workers.dev/login`



**检查：**### Q: 登录失败？

**检查：**

1. 确认环境变量 `ADMIN_USERS` 已正确配置1. 确认环境变量 `ADMIN_USERS` 或 `USERS` 是否已配置

2. 格式是否正确：`username:password`2. 环境变量格式是否正确：`username:password,username2:password2`

3. 密码不要包含冒号（:）或逗号（,）3. 密码中不要包含逗号或冒号

4. 修改后是否点击了 "Save and Deploy"4. 修改环境变量后需要 "Save and Deploy"

5. 清除浏览器缓存和 localStorage5. 清除浏览器缓存和 localStorage

6. 检查浏览器控制台是否有详细错误信息

### Q4: 如何绑定自定义域名？

### Q: 收不到邮件？

1. 进入 Worker → **Triggers** → **Custom Domains****排查步骤：**

2. 点击 **Add Custom Domain**1. 检查垃圾邮件文件夹

3. 输入域名（如 `mail.yourdomain.com`）2. 确认收件人邮箱已在 Email Routing 中验证

4. 按提示添加 DNS 记录3. 确认发件人使用正确的域名

4. 查看 Worker 日志

### Q5: 免费额度够用吗？

### Q: 如何添加自定义域名？

**Cloudflare 免费计划：**1. Workers & Pages → 你的 Worker → Triggers

2. Custom Domains → Add Custom Domain

- ✅ Workers: 100,000 次请求/天3. 输入域名（如 `mail.yourdomain.com`）

- ✅ Email Routing: 无限量转发4. 添加 DNS 记录（自动提示）

- ✅ 足够个人和小团队使用

### Q: 免费额度够用吗？

## 📊 性能优化**Cloudflare 免费计划：**

- ✅ 100,000 次请求/天

- **CDN 加速**：Cloudflare 全球 300+ 节点- ✅ 足够个人和小团队使用

- **请求缓存**：静态资源自动缓存- ✅ 超出可升级到付费计划

- **快速响应**：边缘计算，低延迟

- **自动扩展**：无需关心服务器容量## 🌟 项目亮点



## 🆙 更新日志| 特性 | 说明 |

|------|------|

### v1.0.0 (2025-01-01)| 🔄 **自动部署** | Git push 即自动部署 |

| 📝 **版本控制** | 完整的 Git 历史记录 |

- ✨ 初始版本发布| 📊 **部署日志** | GitHub Actions 详细日志 |

- ✅ 用户认证系统| 🔙 **快速回滚** | 一键回滚到任意版本 |

- ✅ Web UI 界面| 🆓 **完全免费** | GitHub + Cloudflare 免费 |

- ✅ API 接口| 🌍 **全球加速** | Cloudflare CDN 300+ 节点 |

- ✅ 多收件人支持| 🔒 **安全可靠** | 企业级安全防护 |

- ✅ HTML 邮件支持

## 📚 高级用法

## 📄 开源协议

### API 接口（可选）

MIT License - 可自由使用、修改和分发

如果需要通过 API 调用：

## 🔗 相关资源

```bash

- [Cloudflare Email Routing 文档](https://developers.cloudflare.com/email-routing/)# 1. 登录获取 Token

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)curl -X POST https://your-worker.workers.dev/api/login \

- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)  -H "Content-Type: application/json" \

  -d '{"username":"admin","password":"yourpass"}'

## 🤝 贡献

# 2. 使用 Token 发送邮件

欢迎提交 Issue 和 Pull Request！curl -X POST https://your-worker.workers.dev/api/send \

  -H "Content-Type: application/json" \

## 💬 支持  -H "Authorization: Bearer YOUR_TOKEN" \

  -d '{

- 📖 查看本文档    "from": "noreply@yourdomain.com",

- 💬 提交 [GitHub Issues](https://github.com/your-repo/issues)    "to": "user@example.com",

- 🌐 访问 [Cloudflare 社区](https://community.cloudflare.com/)    "subject": "测试邮件",

    "text": "这是一封测试邮件",

---    "html": "<h1>测试</h1><p>这是一封测试邮件</p>"

  }'

**开始使用 →** 按照上面的部署步骤开始你的邮件服务！```



**觉得有用？** 给个 ⭐ Star 吧！### 环境变量完整说明


| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| `ADMIN_USERS` 或 `USERS` | ✅ | 用户账号列表 | `admin:Pass123,user:Pass456` |
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
