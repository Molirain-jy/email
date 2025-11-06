// 获取 API 基础 URL
function getApiBaseUrl() {
    return localStorage.getItem('api_base_url') || '';
}

// 检查登录状态
const token = localStorage.getItem('auth_token');
const username = localStorage.getItem('username');

if (!token) {
    window.location.href = 'login.html';
}

// 检查 API 配置
const apiBaseUrl = getApiBaseUrl();
if (!apiBaseUrl) {
    alert('请先配置 API 地址');
    window.location.href = 'config.html';
}

// 显示用户名
document.getElementById('usernameDisplay').textContent = username || '用户';

// 初始化 Quill 编辑器
const quill = new Quill('#editor', {
    theme: 'snow',
    placeholder: '请输入邮件内容...',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link'],
            ['clean']
        ]
    }
});

// 格式切换
let isHtmlMode = true;

function toggleFormat(mode) {
    const textEditor = document.getElementById('textEditor');
    const htmlEditor = document.getElementById('htmlEditor');
    const buttons = document.querySelectorAll('.format-btn');

    buttons.forEach(btn => btn.classList.remove('active'));

    if (mode === 'text') {
        isHtmlMode = false;
        textEditor.style.display = 'block';
        htmlEditor.style.display = 'none';
        buttons[0].classList.add('active');
    } else {
        isHtmlMode = true;
        textEditor.style.display = 'none';
        htmlEditor.style.display = 'block';
        buttons[1].classList.add('active');
    }
}

// 退出登录
function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
    sessionStorage.removeItem('auth_token');
    window.location.href = 'login.html';
}

// 显示消息
function showMessage(type, message) {
    const element = document.getElementById(type === 'success' ? 'successMessage' : 'errorMessage');
    element.textContent = message;
    element.classList.add('show');
    
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

// 解析邮箱列表
function parseEmailList(str) {
    if (!str || !str.trim()) return null;
    return str.split(',').map(e => e.trim()).filter(e => e);
}

// 发送邮件
document.getElementById('emailForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;
    sendBtn.textContent = '发送中...';

    const from = document.getElementById('from').value.trim();
    const to = parseEmailList(document.getElementById('to').value);
    const cc = parseEmailList(document.getElementById('cc').value);
    const bcc = parseEmailList(document.getElementById('bcc').value);
    const subject = document.getElementById('subject').value.trim();

    let text = null;
    let html = null;

    if (isHtmlMode) {
        html = quill.root.innerHTML;
        text = quill.getText();
    } else {
        text = document.getElementById('textContent').value.trim();
    }

    try {
        const response = await fetch(apiBaseUrl + '/api/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                from,
                to: to.length === 1 ? to[0] : to,
                cc: cc && cc.length > 0 ? cc : undefined,
                bcc: bcc && bcc.length > 0 ? bcc : undefined,
                subject,
                text,
                html
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('success', '✅ 邮件发送成功！');
            
            // 添加到历史记录
            addToHistory({
                from,
                to: to.join(', '),
                subject,
                time: new Date().toLocaleString('zh-CN')
            });

            // 重置表单
            document.getElementById('emailForm').reset();
            quill.setText('');
        } else {
            if (response.status === 401) {
                showMessage('error', '登录已过期，请重新登录');
                setTimeout(() => logout(), 2000);
            } else {
                showMessage('error', '❌ ' + (data.error || '发送失败'));
            }
        }
    } catch (error) {
        showMessage('error', '❌ 网络错误，请稍后重试');
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = '📤 发送邮件';
    }
});

// 添加到历史记录
function addToHistory(item) {
    let history = JSON.parse(localStorage.getItem('email_history') || '[]');
    history.unshift(item);
    history = history.slice(0, 10); // 只保留最近10条
    localStorage.setItem('email_history', JSON.stringify(history));
    loadHistory();
}

// 加载历史记录
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('email_history') || '[]');
    const historyList = document.getElementById('historyList');

    if (history.length === 0) {
        historyList.innerHTML = '<p style="color: #888; text-align: center;">暂无发送记录</p>';
        return;
    }

    historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="time">${item.time}</div>
            <div class="subject">${item.subject}</div>
            <div class="recipients">发送至：${item.to}</div>
        </div>
    `).join('');
}

// 页面加载时加载历史记录
loadHistory();
