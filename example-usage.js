// 使用 Node.js fetch API 发送邮件的示例代码

// 替换为你的 Worker URL
const WORKER_URL = 'https://your-worker.workers.dev';

// 示例 1: 发送简单的纯文本邮件
async function sendSimpleEmail() {
  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@yourdomain.com',
      to: 'recipient@example.com',
      subject: '测试邮件',
      text: '这是一封测试邮件的内容'
    })
  });

  const result = await response.json();
  console.log('发送结果:', result);
}

// 示例 2: 发送带名称的邮件
async function sendEmailWithName() {
  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: {
        name: '我的公司',
        email: 'noreply@yourdomain.com'
      },
      to: {
        name: '张三',
        email: 'recipient@example.com'
      },
      subject: '欢迎注册',
      text: '亲爱的用户，感谢您注册我们的服务！'
    })
  });

  const result = await response.json();
  console.log('发送结果:', result);
}

// 示例 3: 发送 HTML 格式邮件
async function sendHtmlEmail() {
  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@yourdomain.com',
      to: 'recipient@example.com',
      subject: '账号激活',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #333;">欢迎注册</h1>
          <p>感谢您注册我们的服务。请点击下方按钮激活您的账号：</p>
          <a href="https://example.com/activate?token=abc123" 
             style="display: inline-block; padding: 10px 20px; 
                    background-color: #007bff; color: white; 
                    text-decoration: none; border-radius: 5px;">
            激活账号
          </a>
          <p style="color: #666; margin-top: 20px;">
            如果按钮无法点击，请复制以下链接到浏览器：<br>
            https://example.com/activate?token=abc123
          </p>
        </div>
      `,
      text: '欢迎注册！请访问以下链接激活您的账号：https://example.com/activate?token=abc123'
    })
  });

  const result = await response.json();
  console.log('发送结果:', result);
}

// 示例 4: 发送到多个收件人
async function sendBulkEmail() {
  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@yourdomain.com',
      to: [
        'user1@example.com',
        'user2@example.com',
        'user3@example.com'
      ],
      subject: '系统维护通知',
      text: '尊敬的用户，我们将在今晚 22:00 - 24:00 进行系统维护，届时服务将暂时不可用。'
    })
  });

  const result = await response.json();
  console.log('发送结果:', result);
}

// 示例 5: 发送验证码邮件
async function sendVerificationCode() {
  const code = Math.floor(100000 + Math.random() * 900000); // 生成6位验证码

  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@yourdomain.com',
      to: 'user@example.com',
      subject: '您的验证码',
      html: `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h2>验证码</h2>
          <p>您的验证码是：</p>
          <div style="font-size: 32px; font-weight: bold; 
                      color: #007bff; letter-spacing: 5px; 
                      padding: 20px; background: #f0f0f0; 
                      display: inline-block; border-radius: 5px;">
            ${code}
          </div>
          <p style="color: #666; margin-top: 20px;">
            验证码将在 10 分钟后失效，请尽快使用。
          </p>
        </div>
      `,
      text: `您的验证码是：${code}，验证码将在 10 分钟后失效。`
    })
  });

  const result = await response.json();
  console.log('发送结果:', result);
  return code;
}

// 示例 6: 错误处理
async function sendEmailWithErrorHandling() {
  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@yourdomain.com',
        to: 'recipient@example.com',
        subject: '测试邮件',
        text: '测试内容'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ 邮件发送成功:', result);
    } else {
      console.error('❌ 邮件发送失败:', result);
    }
  } catch (error) {
    console.error('❌ 请求失败:', error);
  }
}

// 封装成可复用的函数
async function sendEmail(options) {
  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || '发送失败');
    }
    
    return result;
  } catch (error) {
    console.error('发送邮件失败:', error);
    throw error;
  }
}

// 使用封装的函数
async function example() {
  try {
    const result = await sendEmail({
      from: 'noreply@yourdomain.com',
      to: 'recipient@example.com',
      subject: '测试邮件',
      text: '这是通过封装函数发送的邮件'
    });
    console.log('成功:', result);
  } catch (error) {
    console.error('失败:', error.message);
  }
}

// 取消下面一行的注释来运行示例
// example();
