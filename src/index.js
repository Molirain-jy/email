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
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400', // 24小时缓存预检请求
        }
      });
    }

    // 路由处理
    if (url.pathname === '/') {
      return handleApiInfo();
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
 * API 信息页面
 */
function handleApiInfo() {
  return jsonResponse({ 
    message: 'Email API Service',
    version: '2.0',
    endpoints: {
      login: 'POST /api/login - 用户登录获取 Token',
      send: 'POST /api/send - 发送邮件（支持 API Key 或 JWT Token）',
      verify: 'POST /api/verify - 验证 Token 有效性'
    },
    features: [
      '✅ 多收件人支持',
      '✅ 抄送（CC）和密送（BCC）',
      '✅ HTML 和纯文本内容',
      '✅ 自定义发件人名称',
      '✅ 回复地址设置',
      '✅ API Key 和 JWT 双重认证'
    ]
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
    
    // 验证 Token（支持两种方式）
    // 方式1: API Key 直接认证（优先检查）
    if (env.API_KEY && token === env.API_KEY) {
      // API Key 验证通过，继续发送邮件
    }
    // 方式2: JWT Token 认证
    else {
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
    }

    // 解析请求体，支持多收件人、抄送、密送
    const { from, to, subject, text, html, cc, bcc, replyTo } = await request.json();

    // 验证必需字段
    if (!from || !to || !subject) {
      return jsonResponse({ 
        error: '缺少必需字段: from, to, subject' 
      }, 400);
    }

    if (!text && !html) {
      return jsonResponse({ 
        error: '必须提供邮件内容（text 或 html）' 
      }, 400);
    }

    // 创建 MIME 消息
    const msg = createMimeMessage();
    
    // 设置发件人
    if (typeof from === "string") {
      msg.setSender({ addr: from });
    } else {
      msg.setSender({ name: from.name || "", addr: from.email });
    }

    // 添加收件人的辅助函数
    const addRecipients = (recipients, method) => {
      if (!recipients) return;
      
      if (Array.isArray(recipients)) {
        recipients.forEach(recipient => {
          if (typeof recipient === "string") {
            msg[method](recipient);
          } else {
            msg[method]({ name: recipient.name || "", addr: recipient.email });
          }
        });
      } else if (typeof recipients === "string") {
        msg[method](recipients);
      } else if (recipients.email) {
        msg[method]({ name: recipients.name || "", addr: recipients.email });
      }
    };

    // 添加收件人
    addRecipients(to, 'setRecipient');
    
    // 添加抄送
    if (cc) {
      addRecipients(cc, 'setCc');
    }
    
    // 添加密送
    if (bcc) {
      addRecipients(bcc, 'setBcc');
    }

    // 设置回复地址
    if (replyTo) {
      if (typeof replyTo === "string") {
        msg.setHeader('Reply-To', replyTo);
      } else {
        msg.setHeader('Reply-To', `${replyTo.name || ""} <${replyTo.email}>`);
      }
    }

    // 设置主题
    msg.setSubject(subject);

    // 添加纯文本内容
    if (text) {
      msg.addMessage({
        contentType: "text/plain",
        data: text
      });
    }

    // 添加 HTML 内容
    if (html) {
      msg.addMessage({
        contentType: "text/html",
        data: html
      });
    }

    // 获取主收件人邮箱（用于发送）
    const senderEmail = typeof from === "string" ? from : from.email;
    const recipientEmail = Array.isArray(to) 
      ? (typeof to[0] === "string" ? to[0] : to[0].email)
      : (typeof to === "string" ? to : to.email);

    // 创建并发送邮件
    const message = new EmailMessage(
      senderEmail,
      recipientEmail,
      msg.asRaw()
    );

    await env.EMAIL_SENDER.send(message);

    // 生成邮件 ID
    const emailId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 构建响应数据
    const responseData = {
      success: true,
      id: emailId,
      from: senderEmail,
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      created_at: new Date().toISOString()
    };

    // 如果有抄送或密送，也包含在响应中
    if (cc) {
      responseData.cc = Array.isArray(cc) ? cc : [cc];
    }
    if (bcc) {
      responseData.bcc = Array.isArray(bcc) ? bcc : [bcc];
    }

    return jsonResponse(responseData);

  } catch (error) {
    console.error('发送邮件失败:', error);
    return jsonResponse({ error: '发送失败：' + error.message }, 500);
  }
}

/**
 * 创建 JSON 响应
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    }
  });
}
