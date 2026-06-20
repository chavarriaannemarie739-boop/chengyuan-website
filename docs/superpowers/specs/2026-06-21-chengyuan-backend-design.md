# 诚远汽车零部件官网后端与部署设计方案 (Design Spec)

本项目旨在为“聊城市茌平区诚远汽车零部件制造有限公司官方网站”增加轻量化后端，支持云端数据持久化、管理员安全登录、客户留言板，并实现宝塔面板一键部署。

---

## 🏗️ 1. 系统架构设计 (Architecture)

由于当前服务器采用 PHP 7.4 环境且为小型企业官网，为了实现“免数据库维护、轻量极速、整包易迁移”的目标，我们采用 **PHP + 密码保护的 JSON 文件存储** 方案。

```mermaid
graph TD
    subgraph 客户端 (浏览器)
      Front[前台网页 index/about/products/contact]
      Admin[后台管理 admin.html]
      MainJS[main.js / admin.js / data.js]
    end

    subgraph 云端服务器 (PHP 7.4 + Nginx)
      API[api.php - 路由与逻辑控制]
      Config[config.php - 管理员密码哈希]
      DataStore[data/cms_data.json - CMS 网页数据]
      MsgStore[data/messages.json - 客户留言数据]
      Uploads[uploads/ - 产品与新闻图片目录]
    end

    MainJS -->|获取前台数据 (无鉴权)| API
    MainJS -->|提交留言 (无鉴权)| API
    MainJS -->|登录请求/后台数据修改/图片上传 (需Token)| API
    API <-->|读写| DataStore
    API <-->|读写| MsgStore
    API -->|保存图片| Uploads
    API -->|比对密码| Config
```

---

## 🔒 2. 安全与鉴权设计 (Security & Authentication)

为了保护后台管理权限，防止外界恶意篡改，我们设计以下登录流程：

1. **密码配置**：
   * 在服务器新建 `config.php`，存储管理员用户名和加盐的密码哈希值（Password Hash）。
   * 默认账号：`admin`，默认密码由用户在部署时指定。
   * 该文件加入 `.gitignore`，绝对不提交到 GitHub，确保安全性。

2. **登录交互**：
   * 访问 [admin.html](file:///Users/lizengrui/chengyuan-website/admin.html) 时，如果检测到本地没有合法的 Token，页面将展示一个悬浮的**登录遮罩层 (Login Overlay)**。
   * 管理员输入用户名与密码后，前端向 `api.php?action=login` 发送 POST 请求。
   * 后端验证成功后，返回一个有效期为 24 小时的随机安全 **Token**，同时服务器记录此会话（Session）。
   * 浏览器将 Token 缓存在 `localStorage` 中。

3. **接口保护**：
   * 所有涉及修改（`save`）、上传（`upload`）、读取/删除留言（`get_messages`/`delete_message`）的接口均需要验证请求头（Header）中的 `Authorization: Bearer <Token>`。
   * 校验失败一律返回 `401 Unauthorized`，前端捕获后清除本地 Token 并退回登录界面。

---

## 📂 3. 核心文件与 API 设计 (Core API Specs)

### 📄 接口一：获取网站数据 (`GET api.php?action=get`)
* **权限**：公开
* **返回**：返回 `data/cms_data.json` 内的完整 JSON 数据。如果文件不存在，则读取默认初始化数据。

### 📄 接口二：登录认证 (`POST api.php?action=login`)
* **权限**：公开
* **输入**：`{ "username": "admin", "password": "xxx" }`
* **返回**：`{ "success": true, "token": "random_secure_string" }` 或 `{ "success": false, "message": "用户名或密码错误" }`

### 📄 接口三：保存网站数据 (`POST api.php?action=save`)
* **权限**：需 Token 鉴权
* **输入**：最新的网站配置 JSON 数据
* **返回**：`{ "success": true }`

### 📄 接口四：上传图片文件 (`POST api.php?action=upload`)
* **权限**：需 Token 鉴权
* **输入**：`multipart/form-data` 图片文件
* **输出**：保存到 `uploads/` 并返回访问路径，例如 `{ "success": true, "url": "uploads/abc123xyz.jpg" }`

### 📄 接口五：提交留言 (`POST api.php?action=submit_message`)
* **权限**：公开
* **输入**：`{ "name": "王先生", "phone": "138xxx", "email": "wang@xxx.com", "message": "我想咨询散热器批发价格" }`
* **返回**：`{ "success": true, "message": "留言提交成功，我们会尽快与您联系" }`
* **行为**：自动追加数据并为留言生成唯一 ID 和当前时间戳，存入 `data/messages.json`。

### 📄 接口六：管理留言 (`GET/POST api.php?action=get_messages / delete_message`)
* **权限**：需 Token 鉴权
* **返回**：完整的留言列表或执行单条留言删除。

---

## ⚙️ 4. 前端需要改造的内容 (Frontend Refactoring)

1. [data.js](file:///Users/lizengrui/chengyuan-website/js/data.js)：
   * 重写 `CMS.getData()`：由同步读取 `localStorage` 改为异步 `fetch('api.php?action=get')`。
   * 重写 `CMS.saveData(data)`：改为通过 `fetch` POST 提交数据到服务器。
2. [admin.js](file:///Users/lizengrui/chengyuan-website/js/admin.js)：
   * 增加登录界面呈现与提交逻辑。
   * 增加“客户留言管理”板块的动态渲染。
   * 修改上传逻辑，调用图片上传接口。
3. [main.js](file:///Users/lizengrui/chengyuan-website/js/main.js)：
   * 绑定前台“联系我们”表单提交事件，调用 `submit_message` 接口。
   * 异步加载页头、页脚数据。

---

## 🚀 5. 部署方案 (Deployment)

1. **宝塔面板配置**：
   * 创建站点 `chengyuan.xnssoft.com`，设置根目录。
   * 绑定域名并申请 Let's Encrypt 免费 SSL 证书（启用 HTTPS）。
   * 确认 PHP 版本为 7.4。
2. **源码同步**：
   * 在宝塔面板中使用 Git 关联您的 GitHub 仓库并拉取最新代码。
   * 创建 `config.php`，配置您的管理员登录密码。
   * 设置 `data/` 和 `uploads/` 目录的写权限为 `755`（属主为 `www` 用户）。
