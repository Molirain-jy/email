import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

export default {
  async fetch(request, env) {
    // 只接受 POST 请求
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "只支持 POST 请求" }),
        {
          status: 405,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    try {
      // 解析请求体
      const { from, to, subject, text, html } = await request.json();

      // 验证必需字段
      if (!from || !to || !subject) {
        return new Response(
          JSON.stringify({ 
            error: "缺少必需字段: from, to, subject" 
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" }
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
      if (Array.isArray(to)) {
        to.forEach(recipient => {
          if (typeof recipient === "string") {
            msg.setRecipient(recipient);
          } else {
            msg.setRecipient({ name: recipient.name || "", addr: recipient.email });
          }
        });
      } else if (typeof to === "string") {
        msg.setRecipient(to);
      } else {
        msg.setRecipient({ name: to.name || "", addr: to.email });
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
            headers: { "Content-Type": "application/json" }
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

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "邮件发送成功" 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
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
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  }
};
