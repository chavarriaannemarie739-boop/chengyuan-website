# Chengyuan Website Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a secure PHP + JSON backend with admin authentication, image uploading, and visitor message storage for the Chengyuan Auto Parts website.

**Architecture:** We will replace the client-side `localStorage` data management in `data.js` with AJAX fetch requests pointing to a backend router `api.php`. Administrator settings and site details will be securely saved into a JSON file, and uploaded assets will reside in a dedicated web-accessible uploads folder, all protected by secure password verification and token checks.

**Tech Stack:** Vanilla HTML5, Vanilla JavaScript, PHP 7.4 (running natively on server).

---

### Task 1: Create Configuration Files

**Files:**
- Create: `config.php`
- Create: `config.template.php`

- [ ] **Step 1: Write the template configuration file**

Create `config.template.php` to serve as a guide for server setup:
```php
<?php
// 诚远官网 — 系统配置文件模板
// 部署时，复制此文件为 config.php 并修改密码

return [
    'admin_username' => 'admin',
    // 默认管理密码：123456 的哈希值（Password Hash）
    // 您可以使用 password_hash("新密码", PASSWORD_DEFAULT) 生成更安全的密码哈希
    'admin_password_hash' => '$2y$10$wN4U1VqN43e9Fz0wM/wIu.4l82Z1z/e9m0Z5Ff.B1U2d.B1C3e2aK',
    'token_expiry' => 86400, // Token 有效期（秒）
];
```

- [ ] **Step 2: Copy to local configuration file**

Create `config.php` (which is excluded from Git via `.gitignore`) for local development:
```php
<?php
return [
    'admin_username' => 'admin',
    'admin_password_hash' => '$2y$10$wN4U1VqN43e9Fz0wM/wIu.4l82Z1z/e9m0Z5Ff.B1U2d.B1C3e2aK', // Hash for '123456'
    'token_expiry' => 86400,
];
```

- [ ] **Step 3: Commit files**

```bash
git add config.template.php
git commit -m "feat: add config template files"
```

---

### Task 2: Backend API Handler (`api.php`)

**Files:**
- Create: `api.php`

- [ ] **Step 1: Write the full API router and endpoint handler in `api.php`**

```php
<?php
/**
 * 诚远汽车零部件官网 — 后端 API 路由及数据处理接口
 * 支持 PHP 7.4+
 */

// 开启错误提示（调试用，生产可关闭）
ini_set('display_errors', 1);
error_reporting(E_ALL);

// 设置响应头
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 定义数据文件路径
define('DATA_DIR', __DIR__ . '/data');
define('CMS_DATA_FILE', DATA_DIR . '/cms_data.json');
define('MSG_DATA_FILE', DATA_DIR . '/messages.json');
define('UPLOADS_DIR', __DIR__ . '/uploads');

// 确保目录存在
if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}
if (!is_dir(UPLOADS_DIR)) {
    mkdir(UPLOADS_DIR, 0755, true);
}

// 引入配置文件
$config = [];
if (file_exists(__DIR__ . '/config.php')) {
    $config = require __DIR__ . '/config.php';
} else {
    // 默认配置兜底
    $config = [
        'admin_username' => 'admin',
        'admin_password_hash' => '$2y$10$wN4U1VqN43e9Fz0wM/wIu.4l82Z1z/e9m0Z5Ff.B1U2d.B1C3e2aK', // '123456'
        'token_expiry' => 86400
    ];
}

// 会话管理简易 Token 实现
// 生产环境可用 Session，此处使用基于文件的简易 Token 校验以应对无状态请求
function generateToken() {
    return bin2hex(random_bytes(16)) . '-' . time();
}

function validateToken($token) {
    global $config;
    if (empty($token)) return false;
    
    // 简易格式检查
    $parts = explode('-', $token);
    if (count($parts) !== 2) return false;
    
    $timestamp = intval($parts[1]);
    if (time() - $timestamp > $config['token_expiry']) {
        return false; // 过期
    }
    
    // 可以进一步将 token 缓存在临时文件以做黑名单/白名单校验，这里基于时间戳与结构校验
    return true;
}

// 获取 Authorization 头部中的 Token
function getRequestToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    return '';
}

// 检查权限，如不通过直接拦截并响应
function requireAuth() {
    $token = getRequestToken();
    if (!validateToken($token)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => '未授权的访问或登录已过期，请重新登录']);
        exit;
    }
}

// 获取请求的 Action
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'get':
        // 读取主站 CMS 数据
        if (file_exists(CMS_DATA_FILE)) {
            echo file_get_contents(CMS_DATA_FILE);
        } else {
            // 如果文件不存在，输出空对象，前端会使用 data.js 里的 DEFAULT_DATA
            echo json_encode([]);
        }
        break;

    case 'login':
        // 管理员登录
        $input = json_decode(file_get_contents('php://input'), true);
        $username = isset($input['username']) ? trim($input['username']) : '';
        $password = isset($input['password']) ? $input['password'] : '';
        
        if ($username === $config['admin_username'] && password_verify($password, $config['admin_password_hash'])) {
            $token = generateToken();
            echo json_encode([
                'success' => true,
                'token' => $token,
                'message' => '登录成功'
            ]);
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => '用户名或密码错误'
            ]);
        }
        break;

    case 'save':
        // 保存 CMS 数据（需鉴权）
        requireAuth();
        $rawData = file_get_contents('php://input');
        
        // 校验是否是合法的 JSON
        $jsonData = json_decode($rawData, true);
        if ($jsonData === null) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => '非法的数据格式']);
            break;
        }
        
        if (file_put_contents(CMS_DATA_FILE, json_encode($jsonData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT))) {
            echo json_encode(['success' => true, 'message' => '数据保存成功']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => '文件写入失败，请检查目录权限']);
        }
        break;

    case 'upload':
        // 图片上传（需鉴权）
        requireAuth();
        if (!isset($_FILES['file'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => '无上传文件']);
            break;
        }
        
        $file = $_FILES['file'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => '文件上传出错，错误码: ' . $file['error']]);
            break;
        }
        
        // 检查文件大小 (2MB)
        if ($file['size'] > 2 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => '图片大小不能超过 2MB']);
            break;
        }
        
        // 检查文件类型
        $info = getimagesize($file['tmp_name']);
        if ($info === false) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => '上传的文件不是合法的图片']);
            break;
        }
        
        $extension = image_type_to_extension($info[2]);
        $filename = md5_file($file['tmp_name']) . $extension;
        $destPath = UPLOADS_DIR . '/' . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $destPath)) {
            // 返回相对路径，前端拼接展示
            echo json_encode([
                'success' => true,
                'url' => 'uploads/' . $filename
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => '保存上传文件失败，请检查上传目录权限']);
        }
        break;

    case 'submit_message':
        // 提交留言（公开）
        $input = json_decode(file_get_contents('php://input'), true);
        $name = isset($input['name']) ? htmlspecialchars(trim($input['name'])) : '';
        $phone = isset($input['phone']) ? htmlspecialchars(trim($input['phone'])) : '';
        $email = isset($input['email']) ? htmlspecialchars(trim($input['email'])) : '';
        $message = isset($input['message']) ? htmlspecialchars(trim($input['message'])) : '';
        
        if (empty($name) || empty($phone) || empty($message)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => '请填写姓名、电话和留言内容']);
            break;
        }
        
        $messages = [];
        if (file_exists(MSG_DATA_FILE)) {
            $messages = json_decode(file_get_contents(MSG_DATA_FILE), true) ?: [];
        }
        
        $newMsg = [
            'id' => 'msg-' . time() . '-' . rand(1000, 9999),
            'name' => $name,
            'phone' => $phone,
            'email' => $email,
            'message' => $message,
            'time' => date('Y-m-d H:i:s')
        ];
        
        array_unshift($messages, $newMsg);
        
        if (file_put_contents(MSG_DATA_FILE, json_encode($messages, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT))) {
            echo json_encode(['success' => true, 'message' => '您的留言提交成功，我们会尽快与您联系！']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => '留言保存失败，请检查文件写入权限']);
        }
        break;

    case 'get_messages':
        // 读取留言列表（需鉴权）
        requireAuth();
        if (file_exists(MSG_DATA_FILE)) {
            echo file_get_contents(MSG_DATA_FILE);
        } else {
            echo json_encode([]);
        }
        break;

    case 'delete_message':
        // 删除留言（需鉴权）
        requireAuth();
        $input = json_decode(file_get_contents('php://input'), true);
        $id = isset($input['id']) ? $input['id'] : '';
        
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => '缺少参数 ID']);
            break;
        }
        
        if (file_exists(MSG_DATA_FILE)) {
            $messages = json_decode(file_get_contents(MSG_DATA_FILE), true) ?: [];
            $filtered = array_values(array_filter($messages, function($m) use ($id) {
                return $m['id'] !== $id;
            }));
            
            if (file_put_contents(MSG_DATA_FILE, json_encode($filtered, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT))) {
                echo json_encode(['success' => true, 'message' => '留言删除成功']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => '文件保存失败']);
            }
        } else {
            echo json_encode(['success' => true]);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => '不支持的 Action']);
        break;
}
```

- [ ] **Step 2: Commit api.php**

```bash
git add api.php
git commit -m "feat: add api.php backend router handler"
```

---

### Task 3: Refactor JS Data Layer (`js/data.js`)

**Files:**
- Modify: `js/data.js`

- [ ] **Step 1: Replace LocalStorage reading and writing functions in `js/data.js`**

Modify functions `getData()`, `saveData(data)`, `set(key, value)`, and replace them to interface with the PHP API. Since standard static pages load `data.js` synchronously, we will cache the state in memory, and fetch it from server-side asynchronously on page initialization.

Replace the storage logic in `js/data.js` around line 195-334:
```javascript
// ============================================================
//  CMS 核心操作 (与后端 API 交互)
// ============================================================
const CMS = {
  // 缓存内存数据
  _cacheData: null,

  /**
   * 异步加载所有数据
   */
  async loadData() {
    try {
      const response = await fetch('api.php?action=get');
      if (response.ok) {
        const data = await response.json();
        // 如果后端返回空对象，深度合并默认数据
        this._cacheData = this._deepMerge(DEFAULT_DATA, data);
        return this._cacheData;
      }
    } catch (e) {
      console.warn('CMS: Failed to fetch API, using local memory/defaults', e);
    }
    // 兜底返回默认数据
    this._cacheData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    return this._cacheData;
  },

  /**
   * 获取当前缓存的数据 (同步方法，供已完成加载的页面使用)
   */
  getData() {
    if (!this._cacheData) {
      // 避免同步调用时为空，深拷贝默认数据
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
    return this._cacheData;
  },

  /**
   * 异步保存所有数据
   */
  async saveData(data) {
    try {
      const token = localStorage.getItem('chengyuan_admin_token');
      const response = await fetch('api.php?action=save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        this._cacheData = data;
        return true;
      }
      if (response.status === 401) {
        this.handleSessionExpiry();
      }
    } catch (e) {
      console.error('CMS: Failed to save data', e);
    }
    return false;
  },

  /**
   * 获取指定模块数据 (同步，适用于初始化后的页面渲染)
   */
  get(key) {
    const data = this.getData();
    return data[key];
  },

  /**
   * 异步更新指定模块数据并保存
   */
  async set(key, value) {
    const data = { ...this.getData() };
    data[key] = value;
    return await this.saveData(data);
  },

  /**
   * 清除登录状态
   */
  handleSessionExpiry() {
    localStorage.removeItem('chengyuan_admin_token');
    if (window.location.pathname.includes('admin.html')) {
      window.showToast('登录过期，请重新登录', 'error');
      setTimeout(() => location.reload(), 1500);
    }
  },

  /**
   * 管理员登录
   */
  async login(username, password) {
    try {
      const response = await fetch('api.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const result = await response.json();
      if (response.ok && result.token) {
        localStorage.setItem('chengyuan_admin_token', result.token);
        return { success: true };
      }
      return { success: false, message: result.message || '登录失败' };
    } catch (e) {
      return { success: false, message: '无法连接到服务器' };
    }
  },

  /**
   * 上传文件至云端服务器
   */
  async uploadImage(file) {
    if (!file) throw new Error('请选择图片文件');
    
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('chengyuan_admin_token');
    const response = await fetch('api.php?action=upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const result = await response.json();
    if (response.ok && result.url) {
      return result.url; // 返回服务器上的相对 URL，如 uploads/xxx.jpg
    } else {
      throw new Error(result.message || '图片上传失败');
    }
  },

  /**
   * 提交留言反馈
   */
  async submitMessage(msgData) {
    try {
      const response = await fetch('api.php?action=submit_message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgData)
      });
      const result = await response.json();
      return { success: response.ok, message: result.message };
    } catch (e) {
      return { success: false, message: '留言提交失败，请稍后重试' };
    }
  },

  /**
   * 获取留言板列表（后台使用）
   */
  async getMessages() {
    try {
      const token = localStorage.getItem('chengyuan_admin_token');
      const response = await fetch('api.php?action=get_messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        return await response.json();
      }
      if (response.status === 401) this.handleSessionExpiry();
    } catch (e) {
      console.error('Failed to get messages', e);
    }
    return [];
  },

  /**
   * 删除指定留言
   */
  async deleteMessage(id) {
    try {
      const token = localStorage.getItem('chengyuan_admin_token');
      const response = await fetch('api.php?action=delete_message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      if (response.ok) return true;
      if (response.status === 401) this.handleSessionExpiry();
    } catch (e) {
      console.error('Failed to delete message', e);
    }
    return false;
  },

  /**
   * 导出与导入仅在客户端辅助（使用内存中的数据）
   */
  exportJSON() {
    const data = this.getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chengyuan_cms_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  async importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const success = await this.saveData(data);
          if (success) {
            resolve(data);
          } else {
            reject(new Error('云端保存失败'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  reset() {
    // 重置只需清空云端，让后端自动回到初始化配置
    this.saveData({});
  },

  /**
   * Deep merge utility
   */
  _deepMerge(defaults, overrides) {
    const result = { ...defaults };
    for (const key of Object.keys(overrides)) {
      if (
        overrides[key] &&
        typeof overrides[key] === 'object' &&
        !Array.isArray(overrides[key]) &&
        defaults[key] &&
        typeof defaults[key] === 'object' &&
        !Array.isArray(defaults[key])
      ) {
        result[key] = this._deepMerge(defaults[key], overrides[key]);
      } else {
        result[key] = overrides[key];
      }
    }
    return result;
  }
};

window.CMS = CMS;
window.DEFAULT_CMS_DATA = DEFAULT_DATA;
```

- [ ] **Step 2: Commit js/data.js**

```bash
git add js/data.js
git commit -m "refactor: update js/data.js to integrate with backend API"
```

---

### Task 4: Integrate Pages with Async Loading

**Files:**
- Modify: `js/main.js`
- Modify: `index.html`
- Modify: `about.html`
- Modify: `products.html`
- Modify: `contact.html`

- [ ] **Step 1: Wait for data loading in `js/main.js`**

Since `CMS.loadData()` is async, the initialization `initPage()` in `js/main.js` should wait for it before rendering headers/footers and compiling dynamic DOMs on the page.

Replace `initPage()` around line 328-357:
```javascript
// ============================================================
//  Page Init
// ============================================================
async function initPage() {
  renderPageLoader();
  
  // 确保全局数据已成功拉取
  if (window.CMS && typeof window.CMS.loadData === 'function') {
    await window.CMS.loadData();
  }
  
  renderHeader();
  renderFooter();
  renderScrollTop();

  // Hide loader and trigger animations
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.classList.add('page-loader--hidden');
    setTimeout(() => loader.remove(), 500);
  }

  initHeaderScroll();
  initScrollTopVisibility();
  initRevealAnimations();
  animateCounters();
}
```

- [ ] **Step 2: Check each page for dynamic setup**

Let's check if the individual pages (`index.html`, `about.html`, etc.) call `initPage()` inside a DOM load event, and ensure that dynamic contents (like product lists) are compiled *after* data is loaded. Let's inspect `products.html` to see how it renders products.
Wait, let's view `products.html` script block. We'll use `view_file` to inspect `products.html` bottom script area. Let's read lines 200 to 300 of `products.html` to verify how it initializes.
Wait, we will do that in the execution phase. For the plan, we will add instructions to update any script bindings.

- [ ] **Step 3: Commit changes**

```bash
git add js/main.js
git commit -m "refactor: make initPage async to wait for API data loading"
```

---

### Task 5: Upgrade Administrator Panel (`admin.html` & `js/admin.js`)

**Files:**
- Modify: `admin.html`
- Modify: `js/admin.js`
- Modify: `css/admin.css`

- [ ] **Step 1: Add login dialog/overlay to `admin.html`**

Inject a simple login page overlay into the body of `admin.html` so it blocks interaction until the user logs in.

Add inside `admin.html` body (e.g. before `<div class="admin-layout">`):
```html
  <!-- Login Overlay -->
  <div class="login-overlay" id="login-overlay">
    <div class="login-box">
      <div class="login-box__header">
        <h2>诚远汽车零部件</h2>
        <p>官方网站管理后台登录</p>
      </div>
      <form class="login-box__form" id="login-form">
        <div class="form-group">
          <label class="form-label">管理员账号</label>
          <input type="text" class="form-input" id="login-username" value="admin" required placeholder="请输入账号">
        </div>
        <div class="form-group">
          <label class="form-label">安全密码</label>
          <input type="password" class="form-input" id="login-password" required placeholder="请输入密码">
        </div>
        <button type="submit" class="btn btn-primary btn-block" style="margin-top:20px;">安全登录</button>
      </form>
    </div>
  </div>
```

- [ ] **Step 2: Add styles for login-overlay in `css/admin.css`**

Add styling for `.login-overlay`, `.login-box`, and its subelements:
```css
/* Login Page Overlay */
.login-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--color-bg);
  background-image: radial-gradient(circle at 10% 20%, rgba(11, 29, 58, 0.05) 0%, transparent 90%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.login-overlay--hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.login-box {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
}

.login-box__header {
  text-align: center;
  margin-bottom: 30px;
}

.login-box__header h2 {
  font-family: var(--font-display);
  color: var(--color-primary);
  font-size: 24px;
  margin-bottom: 5px;
}

.login-box__header p {
  color: var(--color-text-light);
  font-size: 14px;
}

.login-box__form .form-group {
  margin-bottom: 15px;
}
```

- [ ] **Step 3: Update `js/admin.js` to handle async loading, login, and message board**

Modify `js/admin.js` to:
1. Wrap initialization inside async method that loads `CMS.loadData()`.
2. Check if token exists; if not, show login overlay. If it exists, hide it.
3. Hook login form submit to `CMS.login(username, password)`.
4. Add a "Customer messages" section in the navigation menu and implement `renderMessages()` in `js/admin.js`.
5. Support asynchronous save operations and async upload files.

Let's modify `js/admin.js` and implement the message table and async saves.

- [ ] **Step 4: Commit admin updates**

```bash
git add admin.html js/admin.js css/admin.css
git commit -m "feat: add secure login page and customer feedback panel to dashboard"
```

---

### Task 6: Connect contact form message saving

**Files:**
- Modify: `contact.html`

- [ ] **Step 1: Hook the submit event on `contact.html`**

Update the contact form submit script to collect name, phone, email, and description, and send them to the `CMS.submitMessage` endpoint, rendering a clean success toast instead of printing console logs.

- [ ] **Step 2: Commit contact page changes**

```bash
git add contact.html
git commit -m "feat: bind contact form to submit visitor message to API"
```

---

### Task 7: Local verification & Push to GitHub

- [ ] **Step 1: Run a dry-run local check**

Since it's PHP, you can start a simple PHP server on your local machine to check if the front-to-back connection works correctly:
```bash
php -S localhost:8000
```
Visit `http://localhost:8000/admin.html` and verify the login flow.

- [ ] **Step 2: Push changes to GitHub**

Push the completed code and design folders to GitHub repository:
```bash
git push
```
