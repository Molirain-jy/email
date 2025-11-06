import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

// 内存兜底（仅用于无 KV 绑定时的开发场景；生产请绑定 KV）
const memoryRateStore = new Map();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Requested-With',
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
      send: 'POST /api/send - 发送邮件（支持 API Key 或签名 Token）',
      verify: 'POST /api/verify - 验证 Token 有效性'
    },
    features: [
      '✅ 多收件人支持',
      '✅ 抄送（CC）和密送（BCC）',
      '✅ HTML 和纯文本内容',
      '✅ 自定义发件人名称',
      '✅ 回复地址设置',
      '✅ API Key 或 HMAC 签名 Token（更安全）'
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

    // 生成签名 Token（HMAC-SHA256），默认 24 小时有效
    if (!env.TOKEN_SECRET) {
      console.error('未配置 TOKEN_SECRET，无法签发安全 Token');
      return jsonResponse({ error: '系统配置错误：未配置 TOKEN_SECRET' }, 500);
    }

    const token = await createSignedToken({
      sub: username,
      ttlSeconds: 24 * 60 * 60
    }, env.TOKEN_SECRET);

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

    if (!env.TOKEN_SECRET) {
      return jsonResponse({ error: '系统未配置 TOKEN_SECRET' }, 500);
    }

    const verified = await verifySignedToken(token, env.TOKEN_SECRET);
    if (verified.valid) {
      return jsonResponse({ success: true, sub: verified.payload.sub, exp: verified.payload.exp });
    }

    return jsonResponse({ error: verified.error || 'Token 无效' }, 401);

  } catch (error) {
    return jsonResponse({ error: '验证失败' }, 500);
  }
}

/**
 * 处理发送邮件
 */
async function handleSendEmail(request, env) {
  try {
    // 要求 JSON 请求
    const contentType = request.headers.get('Content-Type') || '';
    if (!contentType.toLowerCase().startsWith('application/json')) {
      return jsonResponse({ error: '不支持的内容类型' }, 415);
    }

    // 验证 Authorization 头
    const authHeader = request.headers.get('Authorization') || '';
    const apiKeyHeader = request.headers.get('X-API-Key') || '';

    const bearer = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : '';

  let authorized = false;

    // 1) API Key 验证（如配置）
    if (env.API_KEY) {
      if ((apiKeyHeader && apiKeyHeader === env.API_KEY) || (bearer && bearer === env.API_KEY)) {
        authorized = true;
      }
    }

    // 2) 签名 Token 验证（如提供并配置了 TOKEN_SECRET）
    if (!authorized && env.TOKEN_SECRET && bearer) {
      const verified = await verifySignedToken(bearer, env.TOKEN_SECRET);
      if (verified.valid) {
        authorized = true;
      }
    }

    if (!authorized) {
      return jsonResponse({ error: '未授权' }, 401);
    }

    // 速率限制（优先使用 KV；无 KV 时使用内存兜底，仅适合开发）
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rlMax = Number.parseInt(env.RATE_LIMIT_MAX || '100');
    const rlWindow = Number.parseInt(env.RATE_LIMIT_WINDOW || '3600');
    const rlKey = `rate:send:${clientIP}`;

    const allowed = await checkRateLimit(env, rlKey, rlMax, rlWindow);
    if (!allowed) {
      return jsonResponse({ error: '请求过于频繁，请稍后再试' }, 429);
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

    // 基本字段长度限制（简单保护）
    if (typeof subject === 'string' && subject.length > 200) {
      return jsonResponse({ error: 'subject 过长' }, 400);
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Requested-With',
    }
  });
}

/**
 * 签名 Token 工具（HMAC-SHA256）
 * Token 结构：base64url(payloadJSON).base64url(signature)
 * payload: { sub, iat, exp }
 */
async function createSignedToken({ sub, ttlSeconds = 86400 }, secret) {
  const nowSec = Math.floor(Date.now() / 1000);
  const payload = { sub, iat: nowSec, exp: nowSec + ttlSeconds };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = base64urlEncode(new TextEncoder().encode(payloadStr));
  const sigB64 = await hmacSignToBase64Url(payloadB64, secret);
  return `${payloadB64}.${sigB64}`;
}

async function verifySignedToken(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'Token 结构无效' };
    }
    const [payloadB64, sigB64] = parts;
    const ok = await hmacVerifyFromBase64Url(payloadB64, sigB64, secret);
    if (!ok) return { valid: false, error: '签名校验失败' };
    const payloadJson = new TextDecoder().decode(base64urlDecodeToBytes(payloadB64));
    const payload = JSON.parse(payloadJson);
    const nowSec = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || nowSec >= payload.exp) {
      return { valid: false, error: 'Token 已过期' };
    }
    return { valid: true, payload };
  } catch (e) {
    return { valid: false, error: 'Token 解析失败' };
  }
}

async function importHmacKey(secret) {
  const keyData = new TextEncoder().encode(secret);
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * 速率限制：使用 KV（优先）或内存兜底
 */
async function checkRateLimit(env, key, maxRequests, windowSeconds) {
  // KV 存储分支
  const kv = env.EMAIL_RATE_LIMIT;
  const nowSec = Math.floor(Date.now() / 1000);
  const windowStart = nowSec - windowSeconds;

  try {
    if (kv && kv.get && kv.put) {
      const raw = await kv.get(key);
      let count = 0;
      let lastReset = nowSec;
      if (raw) {
        const data = JSON.parse(raw);
        count = data.count || 0;
        lastReset = data.lastReset || nowSec;
        if (lastReset < windowStart) {
          count = 0;
          lastReset = nowSec;
        }
      }
      if (count >= maxRequests) return false;
      count += 1;
      await kv.put(key, JSON.stringify({ count, lastReset }), { expirationTtl: windowSeconds });
      return true;
    }
  } catch (e) {
    // KV 异常时回退到内存
  }

  // 内存兜底（仅适合开发；多实例/重启会丢失）
  const record = memoryRateStore.get(key) || { count: 0, lastReset: nowSec };
  if (record.lastReset < windowStart) {
    record.count = 0;
    record.lastReset = nowSec;
  }
  if (record.count >= maxRequests) return false;
  record.count += 1;
  memoryRateStore.set(key, record);
  return true;
}

async function hmacSignToBase64Url(messageStr, secret) {
  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(messageStr));
  return base64urlEncode(new Uint8Array(sig));
}

async function hmacVerifyFromBase64Url(messageStr, sigB64, secret) {
  try {
    const key = await importHmacKey(secret);
    const sigBytes = base64urlDecodeToBytes(sigB64);
    const ok = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(messageStr));
    return ok;
  } catch (e) {
    return false;
  }
}

function base64urlEncode(bytes) {
  let binary = '';
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64urlDecodeToBytes(b64url) {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad) b64 += '='.repeat(4 - pad);
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
