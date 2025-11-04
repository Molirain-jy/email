# 📚 SDK 调用示例

## 🔑 获取 API Key

1. 在 Cloudflare Worker 设置中添加环境变量 `API_KEY`
2. 设置一个安全的随机字符串，例如：`sk_live_abc123xyz456`

---

## 🌐 JavaScript / Node.js

### 安装依赖

```bash
npm install node-fetch
```

### 基础示例

```javascript
// 简单的封装函数
async function sendEmail(apiKey, emailData) {
  const response = await fetch('https://your-worker.workers.dev', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(emailData)
  });
  
  return await response.json();
}

// 使用示例
const result = await sendEmail('sk_live_abc123xyz456', {
  from: 'noreply@yourdomain.com',
  to: 'user@example.com',
  subject: '欢迎注册',
  html: '<h1>欢迎来到我们的平台！</h1>',
  text: '欢迎来到我们的平台！'
});

console.log('邮件 ID:', result.id);
```

### 完整的 SDK 封装

```javascript
class EmailClient {
  constructor(apiKey, workerUrl) {
    this.apiKey = apiKey;
    this.workerUrl = workerUrl;
  }

  async send(emailData) {
    try {
      const response = await fetch(this.workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(emailData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '发送失败');
      }

      return result;
    } catch (error) {
      console.error('邮件发送错误:', error);
      throw error;
    }
  }

  // 便捷方法：发送简单邮件
  async sendSimple(from, to, subject, content) {
    return this.send({
      from,
      to,
      subject,
      html: content
    });
  }

  // 便捷方法：发送 HTML 邮件
  async sendHtml(from, to, subject, html, text = '') {
    return this.send({
      from,
      to,
      subject,
      html,
      text
    });
  }

  // 便捷方法：发送到多人
  async sendBulk(from, toList, subject, html, text = '') {
    return this.send({
      from,
      to: toList,
      subject,
      html,
      text
    });
  }
}

// 使用示例
const client = new EmailClient(
  'sk_live_abc123xyz456',
  'https://your-worker.workers.dev'
);

// 发送简单邮件
await client.sendSimple(
  'noreply@yourdomain.com',
  'user@example.com',
  '欢迎注册',
  '<h1>欢迎！</h1>'
);

// 发送 HTML 邮件
await client.sendHtml(
  'noreply@yourdomain.com',
  'user@example.com',
  '账号激活',
  '<p>点击链接激活：<a href="https://example.com/activate">激活</a></p>',
  '点击链接激活：https://example.com/activate'
);

// 发送到多人
await client.sendBulk(
  'noreply@yourdomain.com',
  ['user1@example.com', 'user2@example.com'],
  '系统通知',
  '<p>系统将在今晚维护</p>'
);
```

---

## 🐍 Python

### 安装依赖

```bash
pip install requests
```

### 基础示例

```python
import requests

def send_email(api_key, worker_url, email_data):
    """发送邮件"""
    response = requests.post(
        worker_url,
        json=email_data,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        }
    )
    
    return response.json()

# 使用示例
result = send_email(
    'sk_live_abc123xyz456',
    'https://your-worker.workers.dev',
    {
        'from': 'noreply@yourdomain.com',
        'to': 'user@example.com',
        'subject': '欢迎注册',
        'html': '<h1>欢迎来到我们的平台！</h1>',
        'text': '欢迎来到我们的平台！'
    }
)

print(f"邮件 ID: {result['id']}")
```

### 完整的 SDK 封装

```python
import requests
from typing import Union, List, Dict, Optional

class EmailClient:
    """邮件发送客户端"""
    
    def __init__(self, api_key: str, worker_url: str):
        self.api_key = api_key
        self.worker_url = worker_url
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        }
    
    def send(self, email_data: Dict) -> Dict:
        """
        发送邮件
        
        参数:
            email_data: 邮件数据字典
        
        返回:
            响应字典，包含邮件 ID 等信息
        """
        try:
            response = requests.post(
                self.worker_url,
                json=email_data,
                headers=self.headers,
                timeout=30
            )
            
            result = response.json()
            
            if not response.ok:
                raise Exception(result.get('error', '发送失败'))
            
            return result
        
        except Exception as e:
            print(f'❌ 邮件发送错误: {e}')
            raise
    
    def send_simple(
        self,
        from_addr: str,
        to_addr: Union[str, List[str]],
        subject: str,
        content: str
    ) -> Dict:
        """发送简单邮件"""
        return self.send({
            'from': from_addr,
            'to': to_addr,
            'subject': subject,
            'html': content
        })
    
    def send_html(
        self,
        from_addr: str,
        to_addr: Union[str, List[str]],
        subject: str,
        html: str,
        text: str = ''
    ) -> Dict:
        """发送 HTML 邮件"""
        return self.send({
            'from': from_addr,
            'to': to_addr,
            'subject': subject,
            'html': html,
            'text': text
        })
    
    def send_with_cc(
        self,
        from_addr: str,
        to_addr: Union[str, List[str]],
        subject: str,
        html: str,
        cc: Optional[Union[str, List[str]]] = None,
        bcc: Optional[Union[str, List[str]]] = None,
        reply_to: Optional[str] = None
    ) -> Dict:
        """发送带抄送的邮件"""
        email_data = {
            'from': from_addr,
            'to': to_addr,
            'subject': subject,
            'html': html
        }
        
        if cc:
            email_data['cc'] = cc
        if bcc:
            email_data['bcc'] = bcc
        if reply_to:
            email_data['replyTo'] = reply_to
        
        return self.send(email_data)


# 使用示例
if __name__ == '__main__':
    # 初始化客户端
    client = EmailClient(
        api_key='sk_live_abc123xyz456',
        worker_url='https://your-worker.workers.dev'
    )
    
    # 示例 1: 发送简单邮件
    result = client.send_simple(
        from_addr='noreply@yourdomain.com',
        to_addr='user@example.com',
        subject='欢迎注册',
        content='<h1>欢迎来到我们的平台！</h1>'
    )
    print(f"✅ 邮件已发送，ID: {result['id']}")
    
    # 示例 2: 发送 HTML 邮件
    result = client.send_html(
        from_addr='noreply@yourdomain.com',
        to_addr='user@example.com',
        subject='账号激活',
        html='<p>点击链接激活：<a href="https://example.com/activate">激活</a></p>',
        text='点击链接激活：https://example.com/activate'
    )
    print(f"✅ 邮件已发送，ID: {result['id']}")
    
    # 示例 3: 发送到多人
    result = client.send_simple(
        from_addr='noreply@yourdomain.com',
        to_addr=['user1@example.com', 'user2@example.com'],
        subject='系统通知',
        content='<p>系统将在今晚维护</p>'
    )
    print(f"✅ 邮件已发送，ID: {result['id']}")
    
    # 示例 4: 发送带抄送的邮件
    result = client.send_with_cc(
        from_addr='noreply@yourdomain.com',
        to_addr='user@example.com',
        subject='重要通知',
        html='<h1>这是一封重要邮件</h1>',
        cc='manager@yourdomain.com',
        reply_to='support@yourdomain.com'
    )
    print(f"✅ 邮件已发送，ID: {result['id']}")
```

---

## 🚀 PHP

```php
<?php

class EmailClient {
    private $apiKey;
    private $workerUrl;
    
    public function __construct($apiKey, $workerUrl) {
        $this->apiKey = $apiKey;
        $this->workerUrl = $workerUrl;
    }
    
    public function send($emailData) {
        $ch = curl_init($this->workerUrl);
        
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($emailData));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->apiKey
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        $result = json_decode($response, true);
        
        if ($httpCode !== 200) {
            throw new Exception($result['error'] ?? '发送失败');
        }
        
        return $result;
    }
    
    public function sendSimple($from, $to, $subject, $html) {
        return $this->send([
            'from' => $from,
            'to' => $to,
            'subject' => $subject,
            'html' => $html
        ]);
    }
}

// 使用示例
$client = new EmailClient(
    'sk_live_abc123xyz456',
    'https://your-worker.workers.dev'
);

$result = $client->sendSimple(
    'noreply@yourdomain.com',
    'user@example.com',
    '欢迎注册',
    '<h1>欢迎来到我们的平台！</h1>'
);

echo "邮件已发送，ID: " . $result['id'];
?>
```

---

## 🦀 Rust

```rust
use reqwest;
use serde::{Deserialize, Serialize};
use std::error::Error;

#[derive(Serialize)]
struct EmailData {
    from: String,
    to: String,
    subject: String,
    html: String,
}

#[derive(Deserialize)]
struct EmailResponse {
    id: String,
    from: String,
    to: Vec<String>,
    subject: String,
    created_at: String,
}

async fn send_email(
    api_key: &str,
    worker_url: &str,
    email_data: EmailData,
) -> Result<EmailResponse, Box<dyn Error>> {
    let client = reqwest::Client::new();
    
    let response = client
        .post(worker_url)
        .header("Content-Type", "application/json")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&email_data)
        .send()
        .await?;
    
    let result: EmailResponse = response.json().await?;
    Ok(result)
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let result = send_email(
        "sk_live_abc123xyz456",
        "https://your-worker.workers.dev",
        EmailData {
            from: "noreply@yourdomain.com".to_string(),
            to: "user@example.com".to_string(),
            subject: "欢迎注册".to_string(),
            html: "<h1>欢迎来到我们的平台！</h1>".to_string(),
        },
    )
    .await?;
    
    println!("邮件已发送，ID: {}", result.id);
    Ok(())
}
```

---

## 📝 完整的 API 文档

### 请求格式

```http
POST https://your-worker.workers.dev
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "from": "noreply@yourdomain.com" | { "name": "公司名", "email": "noreply@yourdomain.com" },
  "to": "user@example.com" | ["user1@example.com", "user2@example.com"],
  "subject": "邮件主题",
  "html": "<h1>HTML 内容</h1>",
  "text": "纯文本内容",
  "cc": "cc@example.com" (可选),
  "bcc": "bcc@example.com" (可选),
  "replyTo": "reply@yourdomain.com" (可选)
}
```

### 响应格式

**成功 (200)**
```json
{
  "id": "email_1699000000000_abc123",
  "from": "noreply@yourdomain.com",
  "to": ["user@example.com"],
  "subject": "邮件主题",
  "created_at": "2024-11-04T12:00:00.000Z"
}
```

**失败 (400/401/500)**
```json
{
  "error": "错误描述"
}
```

---

## 🔧 配置 API Key

在 Cloudflare Worker 中添加环境变量：

```bash
# 使用 wrangler
wrangler secret put API_KEY

# 或在 wrangler.toml 中配置
[vars]
API_KEY = "sk_live_abc123xyz456"
```
