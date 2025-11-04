import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

export default {
  async fetch(request, env) {
    // CORS 处理
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
      });
    }

    // 只接受 POST 请求
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "只支持 POST 请求" }),
        {
          status: 405,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    try {
      // 验证 API Key
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({ 
            error: "缺少 Authorization header，格式: Bearer YOUR_API_KEY" 
          }),
          {
            status: 401,
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }

      const apiKey = authHeader.substring(7); // 移除 "Bearer "
      
      // 验证 API Key（从环境变量读取）
      if (apiKey !== env.API_KEY) {
        return new Response(
          JSON.stringify({ error: "无效的 API Key" }),
          {
            status: 401,
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }

      // 解析请求体
      const { from, to, subject, text, html, cc, bcc, replyTo } = await request.json();

      // 验证必需字段
      if (!from || !to || !subject) {
        return new Response(
          JSON.stringify({ 
            error: "缺少必需字段: from, to, subject" 
          }),
          {
            status: 400,
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }

      // 创建 MIME 消息
      const msg = createMimeMessage();
      
      // 解析发件人
      if (typeof from === "string") {
        msg.setSender({ addr: from });
      } else {
        msg.setSender({ name: from.name || "", addr: from.email });
      }

      // 解析收件人
      const addRecipients = (recipients, method) => {
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
        } else if (recipients) {
          msg[method]({ name: recipients.name || "", addr: recipients.email });
        }
      };

      // 添加收件人、抄送、密送
      addRecipients(to, 'setRecipient');
      if (cc) addRecipients(cc, 'setCc');
      if (bcc) addRecipients(bcc, 'setBcc');

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

      // 如果既没有 text 也没有 html，返回错误
      if (!text && !html) {
        return new Response(
          JSON.stringify({ 
            error: "必须提供 text 或 html 内容" 
          }),
          {
            status: 400,
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }

      // 创建邮件消息
      const senderEmail = typeof from === "string" ? from : from.email;
      const recipientEmail = Array.isArray(to) 
        ? (typeof to[0] === "string" ? to[0] : to[0].email)
        : (typeof to === "string" ? to : to.email);

      const message = new EmailMessage(
        senderEmail,
        recipientEmail,
        msg.asRaw()
      );

      // 发送邮件
      await env.EMAIL_SENDER.send(message);

      // 生成邮件 ID（类似 Resend）
      const emailId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return new Response(
        JSON.stringify({ 
          id: emailId,
          from: senderEmail,
          to: Array.isArray(to) ? to : [to],
          subject: subject,
          created_at: new Date().toISOString()
        }),
        {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );

    } catch (error) {
      console.error("发送邮件失败:", error);
      return new Response(
        JSON.stringify({ 
          error: "发送邮件失败: " + error.message 
        }),
        {
          status: 500,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
  }
};
