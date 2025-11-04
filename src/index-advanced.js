import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

// CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 生产环境中应该限制为特定域名
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
};

// 速率限制配置（使用 KV 存储）
const RATE_LIMIT_WINDOW = 3600; // 1小时
const RATE_LIMIT_MAX = 100; // 每小时最多100封邮件

export default {
  async fetch(request, env) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    // 只接受 POST 请求
    if (request.method !== "POST") {
      return jsonResponse(
        { error: "只支持 POST 请求" },
        405
      );
    }

    // API Key 验证（如果设置了环境变量）
    if (env.API_KEY) {
      const apiKey = request.headers.get('X-API-Key');
      if (!apiKey || apiKey !== env.API_KEY) {
        return jsonResponse(
          { error: "未授权：API Key 无效或缺失" },
          401
        );
      }
    }

    try {
      // 解析请求体
      const body = await request.json();
      const { from, to, subject, text, html, replyTo, cc, bcc } = body;

      // 验证必需字段
      if (!from || !to || !subject) {
        return jsonResponse(
          { error: "缺少必需字段: from, to, subject" },
          400
        );
      }

      // 速率限制检查（如果启用了 KV）
      if (env.EMAIL_RATE_LIMIT) {
        const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
        const rateLimitKey = `rate_limit:${clientIP}`;
        
        const isAllowed = await checkRateLimit(
          env.EMAIL_RATE_LIMIT,
          rateLimitKey,
          RATE_LIMIT_MAX,
          RATE_LIMIT_WINDOW
        );

        if (!isAllowed) {
          return jsonResponse(
            { error: "请求过于频繁，请稍后再试" },
            429
          );
        }
      }

      // 创建并发送邮件
      const result = await sendEmail(env, {
        from,
        to,
        subject,
        text,
        html,
        replyTo,
        cc,
        bcc
      });

      // 记录成功日志
      console.log('邮件发送成功:', {
        from: typeof from === 'string' ? from : from.email,
        to: Array.isArray(to) ? to.length + ' recipients' : (typeof to === 'string' ? to : to.email),
        subject
      });

      return jsonResponse(
        { 
          success: true, 
          message: "邮件发送成功",
          timestamp: new Date().toISOString()
        },
        200
      );

    } catch (error) {
      console.error("发送邮件失败:", error);
      
      return jsonResponse(
        { 
          error: "发送邮件失败: " + error.message,
          timestamp: new Date().toISOString()
        },
        500
      );
    }
  }
};

/**
 * 发送邮件
 */
async function sendEmail(env, options) {
  const { from, to, subject, text, html, replyTo, cc, bcc } = options;

  // 验证内容
  if (!text && !html) {
    throw new Error("必须提供 text 或 html 内容");
  }

  // 创建 MIME 消息
  const msg = createMimeMessage();
  
  // 设置发件人
  if (typeof from === "string") {
    msg.setSender({ addr: from });
  } else {
    msg.setSender({ 
      name: from.name || "", 
      addr: from.email 
    });
  }

  // 设置收件人
  const recipients = Array.isArray(to) ? to : [to];
  recipients.forEach(recipient => {
    if (typeof recipient === "string") {
      msg.setRecipient(recipient);
    } else {
      msg.setRecipient({ 
        name: recipient.name || "", 
        addr: recipient.email 
      });
    }
  });

  // 设置抄送
  if (cc) {
    const ccRecipients = Array.isArray(cc) ? cc : [cc];
    ccRecipients.forEach(recipient => {
      if (typeof recipient === "string") {
        msg.setRecipient(recipient, { type: 'Cc' });
      } else {
        msg.setRecipient({ 
          name: recipient.name || "", 
          addr: recipient.email 
        }, { type: 'Cc' });
      }
    });
  }

  // 设置密送
  if (bcc) {
    const bccRecipients = Array.isArray(bcc) ? bcc : [bcc];
    bccRecipients.forEach(recipient => {
      if (typeof recipient === "string") {
        msg.setRecipient(recipient, { type: 'Bcc' });
      } else {
        msg.setRecipient({ 
          name: recipient.name || "", 
          addr: recipient.email 
        }, { type: 'Bcc' });
      }
    });
  }

  // 设置回复地址
  if (replyTo) {
    msg.setHeader('Reply-To', replyTo);
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

  // 获取发件人和主收件人邮箱
  const senderEmail = typeof from === "string" ? from : from.email;
  const recipientEmail = typeof recipients[0] === "string" 
    ? recipients[0] 
    : recipients[0].email;

  // 创建邮件消息
  const message = new EmailMessage(
    senderEmail,
    recipientEmail,
    msg.asRaw()
  );

  // 发送邮件
  await env.EMAIL_SENDER.send(message);
}

/**
 * 速率限制检查
 */
async function checkRateLimit(kv, key, maxRequests, windowSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSeconds;

  // 获取当前计数
  const countStr = await kv.get(key);
  let count = 0;
  let lastReset = now;

  if (countStr) {
    const data = JSON.parse(countStr);
    count = data.count;
    lastReset = data.lastReset;

    // 如果窗口已过期，重置计数
    if (lastReset < windowStart) {
      count = 0;
      lastReset = now;
    }
  }

  // 检查是否超过限制
  if (count >= maxRequests) {
    return false;
  }

  // 增加计数
  count++;
  await kv.put(
    key,
    JSON.stringify({ count, lastReset }),
    { expirationTtl: windowSeconds }
  );

  return true;
}

/**
 * 创建 JSON 响应
 */
function jsonResponse(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}
