// 获取 API 基础 URL
function getApiBaseUrl() {
    return localStorage.getItem('api_base_url') || '';
}

const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const loginBtn = document.getElementById('loginBtn');

// 检查是否已配置 API
const apiBaseUrl = getApiBaseUrl();
if (!apiBaseUrl) {
    showError('请先配置 API 地址');
    setTimeout(() => {
        window.location.href = 'config.html';
    }, 2000);
}

// 检查是否已登录
const token = localStorage.getItem('auth_token');
if (token) {
    window.location.href = 'index.html';
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // 禁用按钮
    loginBtn.disabled = true;
    loginBtn.textContent = '登录中...';
    errorMessage.classList.remove('show');

    try {
        const response = await fetch(apiBaseUrl + '/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // 保存 token
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('username', username);
            
            // 如果勾选记住我，也保存到 sessionStorage
            if (rememberMe) {
                sessionStorage.setItem('auth_token', data.token);
            }

            // 跳转到主页
            window.location.href = 'index.html';
        } else {
            showError(data.error || '登录失败，请检查用户名和密码');
        }
    } catch (error) {
        showError('网络错误: ' + error.message);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = '登录';
    }
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    
    // 3秒后自动隐藏
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 3000);
}
