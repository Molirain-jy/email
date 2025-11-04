import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";
import { generateEmailFromTemplate } from "./templates.js";

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "只支持 POST 请求" }, 405);
    }

    try {
      const body = await request.json();
      const { template, templateData, from, to } = body;

      // 验证必需字段
      if (!template || !templateData || !from || !to) {
        return jsonResponse(
          { error: "缺少必需字段: template, templateData, from, to" },
          400
        );
      }

      // 使用模板生成邮件内容
      let emailContent;
      try {
        emailContent = generateEmailFromTemplate(template, templateData);
      } catch (error) {
        return jsonResponse(
          { error: "模板错误: " + error.message },
          400
        );
      }

      // 发送邮件
      await sendEmail(env, {
        from,
        to,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html
      });

      return jsonResponse(
        { 
          success: true, 
          message: "邮件发送成功",
          template: template
        },
        200
      );

    } catch (error) {
      console.error("发送邮件失败:", error);
      return jsonResponse(
        { error: "发送邮件失败: " + error.message },
        500
      );
    }
  }
};

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

function jsonResponse(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}
