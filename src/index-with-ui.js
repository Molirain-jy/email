import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // 路由处理
    if (url.pathname === '/') {
      return handleHome(env);
    } else if (url.pathname === '/api/login') {
      return handleLogin(request, env);
    } else if (url.pathname === '/api/send') {
      return handleSendEmail(request, env);
    } else if (url.pathname === '/api/verify') {
      return handleVerifyToken(request, env);
    }

    return new Response('Not Found', { status: 404 });
  }
};

/**
 * 返回前端页面
 */
function handleHome(env) {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>邮件发送系统</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .container {
      width: 100%;
      max-width: 800px;
    }

    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }

    .card-header h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }

    .card-header p {
      opacity: 0.9;
      font-size: 14px;
    }

    .card-body {
      padding: 40px;
    }

    .form-group {
      margin-bottom: 25px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s;
      font-family: inherit;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-group textarea {
      resize: vertical;
      min-height: 120px;
    }

    .btn {
      width: 100%;
      padding: 14px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-logout {
      background: #f44336;
      color: white;
      margin-top: 15px;
    }

    .btn-logout:hover {
      background: #da190b;
    }

    .alert {
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .alert-success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .alert-error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .hidden {
      display: none;
    }

    .user-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .user-info strong {
      color: #667eea;
    }

    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .card-body {
        padding: 25px;
      }
    }

    .editor-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      border-bottom: 2px solid #e0e0e0;
    }

    .editor-tab {
      padding: 10px 20px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      color: #666;
      border-bottom: 3px solid transparent;
      transition: all 0.3s;
    }

    .editor-tab.active {
      color: #667eea;
      border-bottom-color: #667eea;
    }

    .editor-content {
      display: none;
    }

    .editor-content.active {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="card-header">
        <h1>📧 邮件发送系统</h1>
        <p id="headerDesc">安全、快速、可靠</p>
      </div>
      <div class="card-body">
        <!-- 登录表单 -->
        <div id="loginForm">
          <h2 style="margin-bottom: 30px; color: #333; text-align: center;">登录到您的账户</h2>
          
          <div id="loginAlert"></div>

          <form onsubmit="handleLogin(event)">
            <div class="form-group">
              <label for="username">用户名</label>
              <input type="text" id="username" required autocomplete="username">
            </div>

            <div class="form-group">
              <label for="password">密码</label>
              <input type="password" id="password" required autocomplete="current-password">
            </div>

            <button type="submit" class="btn btn-primary" id="loginBtn">
              登录
            </button>
          </form>
        </div>

        <!-- 邮件发送表单 -->
        <div id="emailForm" class="hidden">
          <div class="user-info">
            <strong>当前用户：</strong> <span id="currentUser"></span>
          </div>

          <div id="emailAlert"></div>

          <form onsubmit="handleSendEmail(event)">
            <div class="form-row">
              <div class="form-group">
                <label for="fromEmail">发件人邮箱 *</label>
                <input type="email" id="fromEmail" required placeholder="sender@yourdomain.com">
              </div>

              <div class="form-group">
                <label for="fromName">发件人名称</label>
                <input type="text" id="fromName" placeholder="可选">
              </div>
            </div>

            <div class="form-group">
              <label for="toEmail">收件人邮箱 *</label>
              <input type="email" id="toEmail" required placeholder="recipient@example.com">
            </div>

            <div class="form-group">
              <label for="subject">邮件主题 *</label>
              <input type="text" id="subject" required placeholder="请输入邮件主题">
            </div>

            <div class="form-group">
              <label>邮件内容 *</label>
              <div class="editor-tabs">
                <button type="button" class="editor-tab active" onclick="switchTab('text')">
                  纯文本
                </button>
                <button type="button" class="editor-tab" onclick="switchTab('html')">
                  HTML
                </button>
              </div>

              <div class="editor-content active" id="textEditor">
                <textarea id="textContent" placeholder="输入纯文本邮件内容..."></textarea>
              </div>

              <div class="editor-content" id="htmlEditor">
                <textarea id="htmlContent" placeholder="输入 HTML 邮件内容..."></textarea>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" id="sendBtn">
              发送邮件
            </button>

            <button type="button" class="btn btn-logout" onclick="handleLogout()">
              退出登录
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>

  <script>
    let authToken = null;

    // 页面加载时检查登录状态
    window.addEventListener('DOMContentLoaded', async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        const isValid = await verifyToken(token);
        if (isValid) {
          authToken = token;
          showEmailForm();
        } else {
          localStorage.removeItem('authToken');
        }
      }
    });

    // 验证 Token
    async function verifyToken(token) {
      try {
        const response = await fetch('/api/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        });
        return response.ok;
      } catch (error) {
        return false;
      }
    }

    // 处理登录
    async function handleLogin(event) {
      event.preventDefault();
      
      const loginBtn = document.getElementById('loginBtn');
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      loginBtn.disabled = true;
      loginBtn.innerHTML = '<span class="loading"></span>';

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
          authToken = result.token;
          localStorage.setItem('authToken', authToken);
          localStorage.setItem('username', username);
          showAlert('loginAlert', '登录成功！', 'success');
          setTimeout(() => {
            showEmailForm();
          }, 500);
        } else {
          showAlert('loginAlert', result.error || '登录失败', 'error');
        }
      } catch (error) {
        showAlert('loginAlert', '网络错误，请稍后重试', 'error');
      } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = '登录';
      }
    }

    // 处理发送邮件
    async function handleSendEmail(event) {
      event.preventDefault();

      const sendBtn = document.getElementById('sendBtn');
      const fromEmail = document.getElementById('fromEmail').value;
      const fromName = document.getElementById('fromName').value;
      const toEmail = document.getElementById('toEmail').value;
      const subject = document.getElementById('subject').value;
      const textContent = document.getElementById('textContent').value;
      const htmlContent = document.getElementById('htmlContent').value;

      if (!textContent && !htmlContent) {
        showAlert('emailAlert', '请至少填写纯文本或 HTML 内容', 'error');
        return;
      }

      sendBtn.disabled = true;
      sendBtn.innerHTML = '<span class="loading"></span> 发送中...';

      try {
        const emailData = {
          from: fromName ? { name: fromName, email: fromEmail } : fromEmail,
          to: toEmail,
          subject: subject
        };

        if (textContent) emailData.text = textContent;
        if (htmlContent) emailData.html = htmlContent;

        const response = await fetch('/api/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
          },
          body: JSON.stringify(emailData)
        });

        const result = await response.json();

        if (response.ok) {
          showAlert('emailAlert', '✅ 邮件发送成功！', 'success');
          // 清空表单（除了发件人信息）
          document.getElementById('toEmail').value = '';
          document.getElementById('subject').value = '';
          document.getElementById('textContent').value = '';
          document.getElementById('htmlContent').value = '';
        } else {
          if (response.status === 401) {
            showAlert('emailAlert', '登录已过期，请重新登录', 'error');
            setTimeout(() => {
              handleLogout();
            }, 2000);
          } else {
            showAlert('emailAlert', '❌ ' + (result.error || '发送失败'), 'error');
          }
        }
      } catch (error) {
        showAlert('emailAlert', '❌ 网络错误，请稍后重试', 'error');
      } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = '发送邮件';
      }
    }

    // 退出登录
    function handleLogout() {
      authToken = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('username');
      showLoginForm();
    }

    // 显示邮件表单
    function showEmailForm() {
      document.getElementById('loginForm').classList.add('hidden');
      document.getElementById('emailForm').classList.remove('hidden');
      document.getElementById('headerDesc').textContent = '开始发送您的邮件';
      document.getElementById('currentUser').textContent = localStorage.getItem('username') || '未知用户';
      document.getElementById('emailAlert').innerHTML = '';
    }

    // 显示登录表单
    function showLoginForm() {
      document.getElementById('emailForm').classList.add('hidden');
      document.getElementById('loginForm').classList.remove('hidden');
      document.getElementById('headerDesc').textContent = '安全、快速、可靠';
      document.getElementById('loginAlert').innerHTML = '';
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
    }

    // 切换编辑器标签
    function switchTab(tab) {
      const tabs = document.querySelectorAll('.editor-tab');
      const contents = document.querySelectorAll('.editor-content');
      
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      if (tab === 'text') {
        tabs[0].classList.add('active');
        document.getElementById('textEditor').classList.add('active');
      } else {
        tabs[1].classList.add('active');
        document.getElementById('htmlEditor').classList.add('active');
      }
    }

    // 显示提示信息
    function showAlert(containerId, message, type) {
      const container = document.getElementById(containerId);
      container.innerHTML = \`
        <div class="alert alert-\${type}">
          \${message}
        </div>
      \`;
      
      // 3秒后自动隐藏成功消息
      if (type === 'success') {
        setTimeout(() => {
          container.innerHTML = '';
        }, 3000);
      }
    }
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

/**
 * 处理登录
 */
async function handleLogin(request, env) {
  try {
    // 解析请求体
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return jsonResponse({ error: '请求格式错误' }, 400);
    }

    const { username, password } = body;

    if (!username || !password) {
      return jsonResponse({ error: '用户名和密码不能为空' }, 400);
    }

    // 从环境变量中获取账号信息（格式：username1:password1,username2:password2）
    // 支持 ADMIN_USERS 或 USERS 环境变量
    const accounts = env.ADMIN_USERS || env.USERS || env.ACCOUNTS || '';
    
    if (!accounts) {
      console.error('环境变量未配置: ADMIN_USERS, USERS 或 ACCOUNTS');
      return jsonResponse({ error: '系统配置错误，请联系管理员配置用户账号' }, 500);
    }

    const accountList = accounts.split(',').map(account => {
      const [user, pass] = account.split(':');
      return { username: user?.trim(), password: pass?.trim() };
    }).filter(acc => acc.username && acc.password);

    if (accountList.length === 0) {
      console.error('环境变量格式错误，无有效账号');
      return jsonResponse({ error: '系统配置错误，账号格式不正确' }, 500);
    }

    // 验证账号
    const account = accountList.find(
      acc => acc.username === username && acc.password === password
    );

    if (!account) {
      return jsonResponse({ error: '用户名或密码错误' }, 401);
    }

    // 生成简单的 Token（生产环境建议使用 JWT）
    const token = btoa(`${username}:${Date.now()}:${Math.random()}`);

    return jsonResponse({
      success: true,
      token: token,
      username: username
    });

  } catch (error) {
    console.error('登录失败:', error);
    return jsonResponse({ error: '登录失败：' + error.message }, 500);
  }
}

/**
 * 验证 Token
 */
async function handleVerifyToken(request, env) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return jsonResponse({ error: 'Token 缺失' }, 401);
    }

    // 简单验证（生产环境建议使用 JWT 验证）
    try {
      const decoded = atob(token);
      const parts = decoded.split(':');
      if (parts.length === 3) {
        const timestamp = parseInt(parts[1]);
        const now = Date.now();
        // Token 有效期 24 小时
        if (now - timestamp < 24 * 60 * 60 * 1000) {
          return jsonResponse({ success: true });
        }
      }
    } catch (e) {
      return jsonResponse({ error: 'Token 无效' }, 401);
    }

    return jsonResponse({ error: 'Token 已过期' }, 401);

  } catch (error) {
    return jsonResponse({ error: '验证失败' }, 500);
  }
}

/**
 * 处理发送邮件
 */
async function handleSendEmail(request, env) {
  try {
    // 验证 Authorization 头
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse({ error: '未授权' }, 401);
    }

    const token = authHeader.substring(7);
    
    // 验证 Token
    try {
      const decoded = atob(token);
      const parts = decoded.split(':');
      if (parts.length !== 3) {
        return jsonResponse({ error: 'Token 无效' }, 401);
      }
      
      const timestamp = parseInt(parts[1]);
      const now = Date.now();
      if (now - timestamp >= 24 * 60 * 60 * 1000) {
        return jsonResponse({ error: 'Token 已过期' }, 401);
      }
    } catch (e) {
      return jsonResponse({ error: 'Token 无效' }, 401);
    }

    // 解析请求体
    const { from, to, subject, text, html } = await request.json();

    // 验证必需字段
    if (!from || !to || !subject) {
      return jsonResponse({ error: '缺少必需字段' }, 400);
    }

    if (!text && !html) {
      return jsonResponse({ error: '必须提供邮件内容' }, 400);
    }

    // 发送邮件
    await sendEmail(env, { from, to, subject, text, html });

    return jsonResponse({
      success: true,
      message: '邮件发送成功'
    });

  } catch (error) {
    console.error('发送邮件失败:', error);
    return jsonResponse({ error: '发送失败：' + error.message }, 500);
  }
}

/**
 * 发送邮件
 */
async function sendEmail(env, options) {
  const { from, to, subject, text, html } = options;

  const msg = createMimeMessage();
  
  if (typeof from === "string") {
    msg.setSender({ addr: from });
  } else {
    msg.setSender({ name: from.name || "", addr: from.email });
  }

  if (typeof to === "string") {
    msg.setRecipient(to);
  } else {
    msg.setRecipient({ name: to.name || "", addr: to.email });
  }

  msg.setSubject(subject);

  if (text) {
    msg.addMessage({
      contentType: "text/plain",
      data: text
    });
  }

  if (html) {
    msg.addMessage({
      contentType: "text/html",
      data: html
    });
  }

  const senderEmail = typeof from === "string" ? from : from.email;
  const recipientEmail = typeof to === "string" ? to : to.email;

  const message = new EmailMessage(
    senderEmail,
    recipientEmail,
    msg.asRaw()
  );

  await env.EMAIL_SENDER.send(message);
}

/**
 * 创建 JSON 响应
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
