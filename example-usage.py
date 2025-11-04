"""
使用 Python 发送邮件的示例代码
需要安装 requests: pip install requests
"""

import requests
import json

# 替换为你的 Worker URL
WORKER_URL = 'https://your-worker.workers.dev'


def send_email(from_addr, to_addr, subject, text=None, html=None):
    """
    发送邮件的通用函数
    
    参数:
        from_addr: 发件人邮箱地址（字符串或字典）
        to_addr: 收件人邮箱地址（字符串、字典或列表）
        subject: 邮件主题
        text: 纯文本内容（可选）
        html: HTML 内容（可选）
    
    返回:
        响应字典
    """
    payload = {
        'from': from_addr,
        'to': to_addr,
        'subject': subject
    }
    
    if text:
        payload['text'] = text
    if html:
        payload['html'] = html
    
    try:
        response = requests.post(
            WORKER_URL,
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        
        result = response.json()
        
        if response.status_code == 200:
            print('✅ 邮件发送成功:', result)
        else:
            print('❌ 邮件发送失败:', result)
        
        return result
    
    except Exception as e:
        print(f'❌ 请求失败: {e}')
        raise


def send_simple_email():
    """示例 1: 发送简单的纯文本邮件"""
    print('\n=== 示例 1: 发送简单邮件 ===')
    send_email(
        from_addr='noreply@yourdomain.com',
        to_addr='recipient@example.com',
        subject='测试邮件',
        text='这是一封测试邮件的内容'
    )


def send_email_with_name():
    """示例 2: 发送带名称的邮件"""
    print('\n=== 示例 2: 带名称的邮件 ===')
    send_email(
        from_addr={'name': '我的公司', 'email': 'noreply@yourdomain.com'},
        to_addr={'name': '张三', 'email': 'recipient@example.com'},
        subject='欢迎注册',
        text='亲爱的用户，感谢您注册我们的服务！'
    )


def send_html_email():
    """示例 3: 发送 HTML 格式邮件"""
    print('\n=== 示例 3: HTML 邮件 ===')
    
    html_content = """
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
    """
    
    send_email(
        from_addr='noreply@yourdomain.com',
        to_addr='recipient@example.com',
        subject='账号激活',
        html=html_content,
        text='欢迎注册！请访问以下链接激活您的账号：https://example.com/activate?token=abc123'
    )


def send_bulk_email():
    """示例 4: 发送到多个收件人"""
    print('\n=== 示例 4: 批量发送 ===')
    send_email(
        from_addr='noreply@yourdomain.com',
        to_addr=[
            'user1@example.com',
            'user2@example.com',
            'user3@example.com'
        ],
        subject='系统维护通知',
        text='尊敬的用户，我们将在今晚 22:00 - 24:00 进行系统维护，届时服务将暂时不可用。'
    )


def send_verification_code():
    """示例 5: 发送验证码邮件"""
    print('\n=== 示例 5: 验证码邮件 ===')
    
    import random
    code = random.randint(100000, 999999)  # 生成6位验证码
    
    html_content = f"""
    <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2>验证码</h2>
        <p>您的验证码是：</p>
        <div style="font-size: 32px; font-weight: bold; 
                    color: #007bff; letter-spacing: 5px; 
                    padding: 20px; background: #f0f0f0; 
                    display: inline-block; border-radius: 5px;">
            {code}
        </div>
        <p style="color: #666; margin-top: 20px;">
            验证码将在 10 分钟后失效，请尽快使用。
        </p>
    </div>
    """
    
    send_email(
        from_addr='noreply@yourdomain.com',
        to_addr='user@example.com',
        subject='您的验证码',
        html=html_content,
        text=f'您的验证码是：{code}，验证码将在 10 分钟后失效。'
    )
    
    return code


def send_password_reset():
    """示例 6: 发送密码重置邮件"""
    print('\n=== 示例 6: 密码重置邮件 ===')
    
    import uuid
    token = str(uuid.uuid4())
    reset_url = f'https://example.com/reset-password?token={token}'
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">密码重置请求</h2>
        <p>我们收到了您的密码重置请求。请点击下方按钮重置您的密码：</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_url}" 
               style="display: inline-block; padding: 12px 30px; 
                      background-color: #dc3545; color: white; 
                      text-decoration: none; border-radius: 5px; 
                      font-weight: bold;">
                重置密码
            </a>
        </div>
        <p style="color: #666; font-size: 14px;">
            此链接将在 1 小时后失效。如果您没有请求重置密码，请忽略此邮件。
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
            如果按钮无法点击，请复制以下链接到浏览器：<br>
            {reset_url}
        </p>
    </div>
    """
    
    send_email(
        from_addr={'name': '账号安全', 'email': 'security@yourdomain.com'},
        to_addr='user@example.com',
        subject='密码重置请求',
        html=html_content,
        text=f'请访问以下链接重置您的密码：{reset_url}\n此链接将在 1 小时后失效。'
    )


def send_order_confirmation():
    """示例 7: 发送订单确认邮件"""
    print('\n=== 示例 7: 订单确认邮件 ===')
    
    order_number = 'ORD-2025-001234'
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #28a745;">订单确认</h1>
        <p>感谢您的购买！您的订单已成功提交。</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">订单信息</h3>
            <p><strong>订单号：</strong>{order_number}</p>
            <p><strong>下单时间：</strong>2025-11-03 16:30:00</p>
            <p><strong>订单金额：</strong>¥299.00</p>
        </div>
        
        <h3>商品清单</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f8f9fa;">
                <th style="padding: 10px; text-align: left;">商品</th>
                <th style="padding: 10px; text-align: right;">数量</th>
                <th style="padding: 10px; text-align: right;">单价</th>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">示例商品</td>
                <td style="padding: 10px; border-bottom: 1px solid #dee2e6; text-align: right;">1</td>
                <td style="padding: 10px; border-bottom: 1px solid #dee2e6; text-align: right;">¥299.00</td>
            </tr>
        </table>
        
        <p style="margin-top: 30px;">
            <a href="https://example.com/orders/{order_number}" 
               style="color: #007bff; text-decoration: none;">
                查看订单详情 →
            </a>
        </p>
    </div>
    """
    
    send_email(
        from_addr={'name': '在线商城', 'email': 'orders@yourdomain.com'},
        to_addr='customer@example.com',
        subject=f'订单确认 - {order_number}',
        html=html_content,
        text=f'您的订单 {order_number} 已确认。订单金额：¥299.00'
    )


if __name__ == '__main__':
    # 取消下面的注释来运行相应的示例
    
    # send_simple_email()
    # send_email_with_name()
    # send_html_email()
    # send_bulk_email()
    # send_verification_code()
    # send_password_reset()
    # send_order_confirmation()
    
    print('\n请取消注释相应的函数调用来测试发送邮件')
    print('不要忘记修改 WORKER_URL 为你的实际 Worker 地址')
