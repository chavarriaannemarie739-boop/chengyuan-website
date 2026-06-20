# 诚远汽车零部件官网 — 项目交接与上下文记忆文件 (v2.0)

本项目为 **聊城市茌平区诚远汽车零部件制造有限公司** 开发的汽车散热器（汽车配件）官方网站。本文件包含完整的项目开发材料目录、技术架构说明以及用于后期无缝恢复开发对话的“记忆胶囊”。

---

## 📂 1. 项目文件目录与路径

所有开发成果已完整保存在您本地的电脑中，项目根目录为：
📂 `[chengyuan-website](file:///Users/lizengrui/chengyuan-website)`

### 📑 网页页面 (Pages)
* **首页**：[index.html](file:///Users/lizengrui/chengyuan-website/index.html) — 商务大气风格，动态载入 Hero、关于预览、核心优势、产品推荐、数据统计、新闻、合作伙伴。
* **关于我们**：[about.html](file:///Users/lizengrui/chengyuan-website/about.html) — 公司长篇介绍、核心价值观、发展历史时间轴。
* **产品中心**：[products.html](file:///Users/lizengrui/chengyuan-website/products.html) — 支持分类动态筛选及产品详情弹窗。
* **联系我们**：[contact.html](file:///Users/lizengrui/chengyuan-website/contact.html) — 带有表单校验的联系表单，提交后直接对接云端 API 保存留言。
* **后台管理**：[admin.html](file:///Users/lizengrui/chengyuan-website/admin.html) — 独立的响应式后台管理控制台，默认登录账号 `admin`，密码 `123456`。支持登录锁屏、管理网站内容、增删改查产品/动态、备份恢复配置、阅读/删除客户留言。

### 🎨 资源与逻辑 (CSS & JS)
* **核心设计系统**：[style.css](file:///Users/lizengrui/chengyuan-website/css/style.css) — 配色：深蓝（`#0B1D3A`）+ 驼金（`#C8963E`）的高端商务配色。
* **后台管理样式**：[admin.css](file:///Users/lizengrui/chengyuan-website/css/admin.css) — 后台与登录弹窗专属样式。
* **数据读取控制层**：[data.js](file:///Users/lizengrui/chengyuan-website/js/data.js) — 全局数据读取与写入操作，目前已全部升级为对接 `api.php` 接口。
* **主站核心逻辑**：[main.js](file:///Users/lizengrui/chengyuan-website/js/main.js) — 异步加载页头、页脚，滚动与动效初始化。
* **后台交互逻辑**：[admin.js](file:///Users/lizengrui/chengyuan-website/js/admin.js) — 承载后台管理面板登录认证、图片真实上传、数据保存及留言管理。

### ⚙️ 后端逻辑与配置 (PHP Backend)
* **后端主路由**：[api.php](file:///Users/lizengrui/chengyuan-website/api.php) — 路由并处理数据存取、用户登录认证（基于Token安全过期校验）、图片物理上传存储、客户留言读写。
* **系统配置模板**：[config.template.php](file:///Users/lizengrui/chengyuan-website/config.template.php) — 部署配置文件指引。

---

## 🛠️ 2. 当前技术架构 (Current State)

```mermaid
graph TD
    subgraph 浏览器客户端 (Browser Client)
        Pages[index/about/products/contact.html]
        Admin[admin.html - 登录拦截]
        main_js[main.js / admin.js]
        data_js[data.js - window.CMS]
    end

    subgraph 云端服务器 (PHP 7.4 + Nginx)
        API[api.php]
        Config[config.php - 管理员密码Hash]
        DataStore[(data/cms_data.json)]
        MsgStore[(data/messages.json)]
        UploadsDir[uploads/ - 上传图片目录]
    end

    Pages -->|读取展示 / 提交留言| API
    Admin -->|登录 / 修改CMS / 管理留言 / 上传图片| API
    data_js <-->|AJAX 请求| API
    API <-->|读取与更新| DataStore
    API <-->|追加与删除| MsgStore
    API -->|保存文件| UploadsDir
    API -->|比对鉴权| Config
```

1. **前后端解耦与数据持久化**：全面移除了客户端 `localStorage` 缓存，所有数据持久化至云端 `cms_data.json` 与 `messages.json`。
2. **后台登录锁屏**：访问 `admin.html` 需强校验登录状态，成功获取 Bearer Token 后方可操作，密码以加盐哈希存储在服务器本地 `config.php` 中。
3. **真实上传**：产品和新闻配图直接保存到云端 `uploads/` 目录，前端获取真实 URL 展示，避免大图使数据文件过度庞大。

---

## 🚀 3. 云端服务器部署路线图 (宝塔面板)

等用户提供新的服务器宝塔信息后，我们将执行以下步骤：

1. **新建站点**：在宝塔面板新建站点，绑定域名（如 `chengyuan.xnssoft.com`），确认 PHP 版本为 7.4+。
2. **源码同步**：通过 Git 关联您的 GitHub 仓库并拉取最新代码。
   * 仓库地址：`https://github.com/chavarriaannemarie739-boop/chengyuan-website.git`
3. **配置文件**：
   * 复制 `config.template.php` 并重命名为 `config.php`。
   * 在 `config.php` 中配置您的管理员登录用户名和新的安全密码哈希。
4. **权限设置**：
   * 将 `data/` 目录与 `uploads/` 目录的写入权限赋予 `www` 用户（设为 `755` 权限），确保数据能正常写入与上传。
5. **开启安全锁**：配置 Nginx 阻止外部直接访问 `data/` 目录下的原始 json 文件。
6. **HTTPS 配置**：申请免费的 Let's Encrypt 证书并启用强制 HTTPS 访问。

---

## 💾 4. 对话上下文记忆胶囊 (Memory Capsule)

> [!NOTE]
> **以下内容是为下一阶段接手的 AI 助手准备的上下文导入数据。当您明天重新开启对话时，只需把这部分内容发给 AI 助手，它就能瞬间恢复 100% 的项目记忆。**

```json
{
  "project_name": "聊城市茌平区诚远汽车零部件制造有限公司官方网站",
  "business_domain": "汽车散热器、中冷器、油冷器及暖风散热器制造与销售 (汽车配件行业)",
  "github_repository": "https://github.com/chavarriaannemarie739-boop/chengyuan-website.git",
  "technical_stack": [
    "HTML5 Semantic tags",
    "Vanilla CSS (Modern Design System Variables)",
    "Vanilla JS (Async/Await data layers)",
    "PHP 7.4+ native backend (no third-party frameworks, highly portable)",
    "JSON file-based storage: data/cms_data.json and data/messages.json"
  ],
  "history_decisions": {
    "api_php_role": "api.php serves as the central backend router for data saving/loading, secure admin login (Bearer token check), local file image upload, and visitor feedback submission.",
    "login_protection": "admin.html embeds a modal overlay that prompts for username/password and calls api.php?action=login. Successful login stores a bearer token in localStorage for header authentication.",
    "async_initialization": "initPage() in main.js is refactored to be asynchronous and awaits CMS.loadData() to cache CMS JSON values before page content rendering and animation triggers."
  },
  "next_action": "Authenticate with the user's new Baota Panel credentials (to be provided), set up the website on the new server with domain chengyuan.xnssoft.com, git clone/pull the repository, configure config.php, set directories write permissions, and enable SSL/HTTPS."
}
```
