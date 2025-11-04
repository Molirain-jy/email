/**
 * 邮件模板系统
 * 提供预定义的邮件模板，方便快速发送常见类型的邮件
 */

export const emailTemplates = {
  /**
   * 欢迎邮件模板
   */
  welcome: (data) => {
    const { userName, activationLink } = data;
    return {
      subject: '欢迎加入我们！',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">欢迎，${userName}！</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              感谢您注册我们的服务。我们很高兴您能加入我们的社区！
            </p>
            
            ${activationLink ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${activationLink}" 
                   style="display: inline-block; padding: 12px 30px; 
                          background-color: #007bff; color: white; 
                          text-decoration: none; border-radius: 5px; 
                          font-weight: bold;">
                  激活账号
                </a>
              </div>
              <p style="color: #666; font-size: 14px; text-align: center;">
                或复制此链接到浏览器：<br>
                <span style="color: #007bff;">${activationLink}</span>
              </p>
            ` : ''}
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              如有任何问题，请随时联系我们的客服团队。
            </p>
          </div>
        </div>
      `,
      text: `欢迎，${userName}！\n\n感谢您注册我们的服务。${activationLink ? `\n\n请访问以下链接激活您的账号：\n${activationLink}` : ''}`
    };
  },

  /**
   * 验证码邮件模板
   */
  verificationCode: (data) => {
    const { code, expiryMinutes = 10 } = data;
    return {
      subject: '您的验证码',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">验证码</h2>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
              您的验证码是：
            </p>
            
            <div style="font-size: 36px; font-weight: bold; 
                        color: #007bff; letter-spacing: 8px; 
                        padding: 20px; background: white; 
                        display: inline-block; border-radius: 8px;
                        border: 2px dashed #007bff;">
              ${code}
            </div>
            
            <p style="color: #666; margin-top: 20px; font-size: 14px;">
              验证码将在 ${expiryMinutes} 分钟后失效
            </p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #fff3cd; 
                      border-radius: 5px; border-left: 4px solid #ffc107;">
            <p style="color: #856404; font-size: 14px; margin: 0;">
              ⚠️ 请勿将验证码透露给他人，包括客服人员。
            </p>
          </div>
        </div>
      `,
      text: `您的验证码是：${code}\n\n验证码将在 ${expiryMinutes} 分钟后失效。\n\n请勿将验证码透露给他人。`
    };
  },

  /**
   * 密码重置邮件模板
   */
  passwordReset: (data) => {
    const { userName, resetLink, expiryHours = 1 } = data;
    return {
      subject: '密码重置请求',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">密码重置请求</h2>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            ${userName ? `您好，${userName}！` : '您好！'}
          </p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            我们收到了您的密码重置请求。请点击下方按钮重置您的密码：
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; padding: 14px 40px; 
                      background-color: #dc3545; color: white; 
                      text-decoration: none; border-radius: 5px; 
                      font-weight: bold; font-size: 16px;">
              重置密码
            </a>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              此链接将在 ${expiryHours} 小时后失效。
            </p>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #d1ecf1; 
                      border-radius: 5px; border-left: 4px solid #0c5460;">
            <p style="color: #0c5460; font-size: 14px; margin: 0;">
              ℹ️ 如果您没有请求重置密码，请忽略此邮件。您的密码将保持不变。
            </p>
          </div>
          
          <div style="margin-top: 20px;">
            <p style="color: #999; font-size: 12px;">
              如果按钮无法点击，请复制以下链接到浏览器：<br>
              <span style="color: #007bff; word-break: break-all;">${resetLink}</span>
            </p>
          </div>
        </div>
      `,
      text: `密码重置请求\n\n${userName ? `您好，${userName}！\n\n` : ''}我们收到了您的密码重置请求。\n\n请访问以下链接重置您的密码：\n${resetLink}\n\n此链接将在 ${expiryHours} 小时后失效。\n\n如果您没有请求重置密码，请忽略此邮件。`
    };
  },

  /**
   * 订单确认邮件模板
   */
  orderConfirmation: (data) => {
    const { orderNumber, orderDate, orderTotal, items, orderUrl } = data;
    
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #dee2e6; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #dee2e6; text-align: right;">¥${item.price.toFixed(2)}</td>
      </tr>
    `).join('');

    return {
      subject: `订单确认 - ${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #28a745; margin: 0;">✓ 订单确认</h1>
          </div>
          
          <p style="font-size: 16px; color: #555;">
            感谢您的购买！您的订单已成功提交。
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">订单信息</h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0; color: #666;">订单号：</td>
                <td style="padding: 8px 0; font-weight: bold;">${orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">下单时间：</td>
                <td style="padding: 8px 0;">${orderDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">订单金额：</td>
                <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #28a745;">
                  ¥${orderTotal.toFixed(2)}
                </td>
              </tr>
            </table>
          </div>
          
          <h3 style="color: #333;">商品清单</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">商品</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">数量</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">单价</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          ${orderUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${orderUrl}" 
                 style="display: inline-block; padding: 12px 30px; 
                        background-color: #007bff; color: white; 
                        text-decoration: none; border-radius: 5px; 
                        font-weight: bold;">
                查看订单详情
              </a>
            </div>
          ` : ''}
        </div>
      `,
      text: `订单确认 - ${orderNumber}\n\n感谢您的购买！\n\n订单号：${orderNumber}\n下单时间：${orderDate}\n订单金额：¥${orderTotal.toFixed(2)}\n\n${orderUrl ? `查看订单：${orderUrl}` : ''}`
    };
  },

  /**
   * 通知邮件模板
   */
  notification: (data) => {
    const { title, message, actionText, actionUrl, type = 'info' } = data;
    
    const colors = {
      info: { bg: '#d1ecf1', border: '#0c5460', text: '#0c5460', icon: 'ℹ️' },
      success: { bg: '#d4edda', border: '#155724', text: '#155724', icon: '✓' },
      warning: { bg: '#fff3cd', border: '#856404', text: '#856404', icon: '⚠️' },
      error: { bg: '#f8d7da', border: '#721c24', text: '#721c24', icon: '✕' }
    };
    
    const color = colors[type];
    
    return {
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${color.bg}; padding: 20px; 
                      border-radius: 8px; border-left: 4px solid ${color.border};">
            <h2 style="color: ${color.text}; margin-top: 0;">
              ${color.icon} ${title}
            </h2>
            <p style="color: ${color.text}; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
              ${message}
            </p>
          </div>
          
          ${actionUrl && actionText ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${actionUrl}" 
                 style="display: inline-block; padding: 12px 30px; 
                        background-color: #007bff; color: white; 
                        text-decoration: none; border-radius: 5px; 
                        font-weight: bold;">
                ${actionText}
              </a>
            </div>
          ` : ''}
        </div>
      `,
      text: `${title}\n\n${message}${actionUrl ? `\n\n${actionText}: ${actionUrl}` : ''}`
    };
  }
};

/**
 * 使用模板生成邮件内容
 */
export function generateEmailFromTemplate(templateName, data) {
  const template = emailTemplates[templateName];
  if (!template) {
    throw new Error(`模板 "${templateName}" 不存在`);
  }
  return template(data);
}
