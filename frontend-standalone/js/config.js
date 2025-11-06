const apiUrlInput = document.getElementById('apiUrl');
const configForm = document.getElementById('configForm');
const testBtn = document.getElementById('testBtn');
const statusDiv = document.getElementById('status');
const currentApiUrlSpan = document.getElementById('currentApiUrl');
const configStatusSpan = document.getElementById('configStatus');

// 加载当前配置
function loadCurrentConfig() {
    const savedApiUrl = localStorage.getItem('api_base_url');
    if (savedApiUrl) {
        currentApiUrlSpan.textContent = savedApiUrl;
        configStatusSpan.textContent = '已配置';
        configStatusSpan.style.color = '#a5d6a7';
        apiUrlInput.value = savedApiUrl;
    }
}

loadCurrentConfig();

// 保存配置
configForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const apiUrl = apiUrlInput.value.trim().replace(/\/$/, ''); // 去除末尾斜杠
    
    localStorage.setItem('api_base_url', apiUrl);
    
    showStatus('success', '✅ 配置已保存！');
    loadCurrentConfig();
});

// 测试连接
testBtn.addEventListener('click', async () => {
    const apiUrl = apiUrlInput.value.trim().replace(/\/$/, '');
    
    if (!apiUrl) {
        showStatus('error', '请先输入 API 地址');
        return;
    }

    testBtn.disabled = true;
    testBtn.textContent = '测试中...';
    statusDiv.className = 'status';

    try {
        // 尝试访问 API（预期会返回 405 因为是 GET 请求）
        const response = await fetch(apiUrl + '/api/send', {
            method: 'OPTIONS'
        });

        // 检查 CORS 头
        const corsHeader = response.headers.get('Access-Control-Allow-Origin');
        
        if (corsHeader) {
            showStatus('success', '✅ 连接成功！API 可访问');
        } else {
            showStatus('error', '⚠️ API 可访问，但 CORS 未正确配置');
        }
    } catch (error) {
        showStatus('error', '❌ 连接失败: ' + error.message);
    } finally {
        testBtn.disabled = false;
        testBtn.textContent = '测试连接';
    }
});

function showStatus(type, message) {
    statusDiv.className = 'status ' + type;
    statusDiv.textContent = message;
    
    setTimeout(() => {
        statusDiv.className = 'status';
    }, 5000);
}
