/**
 * 诚远汽车零部件 — 网站后台管理 JavaScript (API 联动版)
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Ensure CMS is loaded
  if (!window.CMS) {
    console.error('CMS data layer (data.js) not loaded!');
    return;
  }

  // DOM Elements for Login
  const loginOverlay = document.getElementById('login-overlay');
  const loginForm = document.getElementById('login-form');
  const loginUsername = document.getElementById('login-username');
  const loginPassword = document.getElementById('login-password');

  // Verify Login Status
  function checkLogin() {
    const token = localStorage.getItem('chengyuan_admin_token');
    if (token) {
      loginOverlay.classList.add('login-overlay--hidden');
      return true;
    } else {
      loginOverlay.classList.remove('login-overlay--hidden');
      return false;
    }
  }

  // Handle Login Submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = loginUsername.value.trim();
    const password = loginPassword.value;
    
    const result = await window.CMS.login(username, password);
    if (result.success) {
      window.showToast('登录成功，欢迎使用后台系统');
      checkLogin();
      // Load data and refresh
      await window.CMS.loadData();
      renderSection(currentSection);
    } else {
      window.showToast(result.message, 'error');
    }
  });

  // State Management
  let currentSection = 'dashboard';
  let activeEditId = null;

  // DOM Elements
  const navItems = document.querySelectorAll('.sidebar__nav-item');
  const pageTitle = document.getElementById('page-title');
  const adminView = document.getElementById('admin-view');

  const modal = document.getElementById('admin-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalForm = document.getElementById('modal-form');
  const modalClose = document.getElementById('modal-close');
  const modalCancel = document.getElementById('modal-cancel');
  const modalSubmit = document.getElementById('modal-submit');

  // Load Initial Data
  await window.CMS.loadData();
  
  if (checkLogin()) {
    renderSection('dashboard');
  }

  // ============================================================
  //  UI Event Listeners
  // ============================================================
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      if (!checkLogin()) return;

      navItems.forEach(nav => nav.classList.remove('sidebar__nav-item--active'));
      item.classList.add('sidebar__nav-item--active');

      const section = item.dataset.section;
      currentSection = section;
      pageTitle.textContent = item.querySelector('.sidebar__nav-label').textContent;
      renderSection(section);
    });
  });

  // Modal actions
  const closeModal = () => {
    modal.classList.remove('admin-modal--active');
    activeEditId = null;
  };

  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);

  // Close modal on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('admin-modal--active')) {
      closeModal();
    }
  });

  // ============================================================
  //  Section Renderers
  // ============================================================
  function renderSection(section) {
    if (!checkLogin()) return;
    adminView.innerHTML = '';
    const data = window.CMS.getData();

    switch (section) {
      case 'dashboard':
        renderDashboard(data);
        break;
      case 'company':
        renderCompany(data);
        break;
      case 'products':
        renderProducts(data);
        break;
      case 'news':
        renderNews(data);
        break;
      case 'advantages':
        renderAdvantages(data);
        break;
      case 'stats':
        renderStats(data);
        break;
      case 'milestones':
        renderMilestones(data);
        break;
      case 'messages':
        renderMessages();
        break;
      case 'settings':
        renderSettings();
        break;
    }
  }

  // ---- Section: Dashboard ----
  function renderDashboard(data) {
    adminView.innerHTML = `
      <div class="dashboard-grid">
        <div class="dashboard-card">
          <div class="dashboard-card__info">
            <span class="dashboard-card__label">核心产品</span>
            <span class="dashboard-card__value">${data.products.length} 款</span>
          </div>
          <div class="dashboard-card__icon">🔧</div>
        </div>
        <div class="dashboard-card">
          <div class="dashboard-card__info">
            <span class="dashboard-card__label">新闻发布</span>
            <span class="dashboard-card__value">${data.news.length} 篇</span>
          </div>
          <div class="dashboard-card__icon">📰</div>
        </div>
        <div class="dashboard-card">
          <div class="dashboard-card__info">
            <span class="dashboard-card__label">发展历程</span>
            <span class="dashboard-card__value">${data.milestones.length} 条</span>
          </div>
          <div class="dashboard-card__icon">⏳</div>
        </div>
        <div class="dashboard-card">
          <div class="dashboard-card__info">
            <span class="dashboard-card__label">客户留言</span>
            <span class="dashboard-card__value" id="dashboard-msg-count">加载中...</span>
          </div>
          <div class="dashboard-card__icon">💬</div>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card__header">
          <h3 class="admin-card__title">企业官网基本信息</h3>
        </div>
        <div class="admin-card__body">
          <p style="margin-bottom: 15px;"><strong>企业全称：</strong>${data.company.fullName}</p>
          <p style="margin-bottom: 15px;"><strong>Slogan / 标语：</strong>${data.company.slogan}</p>
          <p style="margin-bottom: 15px;"><strong>联系电话：</strong>${data.company.mobile || data.company.phone}</p>
          <p style="margin-bottom: 15px;"><strong>联系邮箱：</strong>${data.company.email}</p>
          <p style="margin-bottom: 15px;"><strong>ICP备案号：</strong>${data.company.icp}</p>
          <p style="margin-bottom: 0;"><strong>系统说明：</strong>修改内容后，前台网页会实时同步更新。您可以退出登录，也可以前往系统设置备份或重置数据。</p>
        </div>
      </div>
    `;

    // Load message count asynchronously
    window.CMS.getMessages().then(msgs => {
      const countEl = document.getElementById('dashboard-msg-count');
      if (countEl) countEl.textContent = msgs.length + ' 条';
    });
  }

  // ---- Section: Company Info ----
  function renderCompany(data) {
    adminView.innerHTML = `
      <div class="admin-card">
        <div class="admin-card__header">
          <h3 class="admin-card__title">编辑公司基本信息</h3>
        </div>
        <form class="admin-card__body" id="company-form">
          <div class="admin-form-grid">
            <div class="form-group">
              <label class="form-label">公司名称 (简写)</label>
              <input type="text" class="form-input" name="name" value="${data.company.name || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">公司名称 (全称)</label>
              <input type="text" class="form-input" name="fullName" value="${data.company.fullName || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">英文名称 / 拼音</label>
              <input type="text" class="form-input" name="nameEn" value="${data.company.nameEn || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">宣传语 / Slogan</label>
              <input type="text" class="form-input" name="slogan" value="${data.company.slogan || ''}" required>
            </div>
            <div class="form-group form-group--full">
              <label class="form-label">公司Logo</label>
              <div class="upload-wrapper">
                <div class="upload-preview" id="logo-preview">
                  ${data.company.logo ? `<img src="${data.company.logo}">` : '<span>无Logo</span>'}
                </div>
                <div class="upload-btn-wrapper">
                  <button type="button" class="btn btn-outline btn-sm">上传图片</button>
                  <input type="file" id="logo-file" accept="image/*">
                </div>
                <span class="text-gray" style="font-size:12px;">建议透明背景PNG，大小不超过 2MB</span>
              </div>
            </div>
            <div class="form-group form-group--full">
              <label class="form-label">核心简介 (首页展示，建议200字以内)</label>
              <textarea class="form-input" name="description" rows="3" required>${data.company.description || ''}</textarea>
            </div>
            <div class="form-group form-group--full">
              <label class="form-label">详细介绍 (关于我们展示，字数不限)</label>
              <textarea class="form-input" name="descriptionLong" rows="6" required>${data.company.descriptionLong || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">座机号码</label>
              <input type="text" class="form-input" name="phone" value="${data.company.phone || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">手机号码</label>
              <input type="text" class="form-input" name="mobile" value="${data.company.mobile || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">联系邮箱</label>
              <input type="email" class="form-input" name="email" value="${data.company.email || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">公司地址</label>
              <input type="text" class="form-input" name="address" value="${data.company.address || ''}">
            </div>
            <div class="form-group form-group--full">
              <label class="form-label">公司详细地址 (用于地图显示与联系详情)</label>
              <input type="text" class="form-input" name="addressDetail" value="${data.company.addressDetail || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">ICP 备案号</label>
              <input type="text" class="form-input" name="icp" value="${data.company.icp || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">创立年份</label>
              <input type="number" class="form-input" name="foundedYear" value="${data.company.foundedYear || ''}">
            </div>
          </div>
          <div style="margin-top: var(--space-8); display: flex; justify-content: flex-end;">
            <button type="submit" class="btn btn-primary">保存修改</button>
          </div>
        </form>
      </div>
    `;

    // Logo upload handler
    const logoFile = document.getElementById('logo-file');
    const logoPreview = document.getElementById('logo-preview');
    let logoUrl = data.company.logo;

    logoFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          logoUrl = await window.CMS.uploadImage(file);
          logoPreview.innerHTML = `<img src="${logoUrl}">`;
          window.showToast('Logo 已上传，提交表单后生效');
        } catch (err) {
          window.showToast(err.message, 'error');
        }
      }
    });

    // Form submit handler
    const form = document.getElementById('company-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const updatedCompany = { ...data.company };
      
      formData.forEach((value, key) => {
        updatedCompany[key] = value;
      });
      updatedCompany.logo = logoUrl;

      const success = await window.CMS.set('company', updatedCompany);
      if (success) {
        window.showToast('公司基本信息已更新');
        renderSection('company');
      } else {
        window.showToast('保存失败', 'error');
      }
    });
  }

  // ---- Section: Products ----
  function renderProducts(data) {
    const listHTML = data.products.map(prod => `
      <tr>
        <td>
          <div style="width: 50px; height: 50px; border-radius: 4px; overflow: hidden; background: #eee;">
            ${prod.image ? `<img src="${prod.image}" style="width:100%; height:100%; object-fit:cover;">` : '<div style="line-height:50px; text-align:center; color:#999; font-size:12px;">暂无</div>'}
          </div>
        </td>
        <td><strong>${prod.name}</strong></td>
        <td><span class="badge badge--gray">${prod.category}</span></td>
        <td>${prod.isHot ? '<span class="badge badge--accent">热销</span>' : '<span class="badge badge--gray">普通</span>'}</td>
        <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${prod.description}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-icon--edit" data-id="${prod.id}" title="编辑">✏️</button>
            <button class="btn-icon btn-icon--delete" data-id="${prod.id}" title="删除">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

    adminView.innerHTML = `
      <div class="admin-card">
        <div class="admin-card__header">
          <h3 class="admin-card__title">产品中心管理</h3>
          <button class="btn btn-primary btn-sm" id="btn-add-product">+ 新增产品</button>
        </div>
        <div class="admin-card__body">
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th width="80">图片</th>
                  <th width="200">产品名称</th>
                  <th width="150">分类</th>
                  <th width="80">热销状态</th>
                  <th>描述</th>
                  <th width="100">操作</th>
                </tr>
              </thead>
              <tbody>
                ${listHTML || '<tr><td colspan="6" class="text-center" style="padding: 40px; color: #999;">暂无产品，请点击“新增产品”添加</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Add Product click
    document.getElementById('btn-add-product').addEventListener('click', () => {
      openProductModal();
    });

    // Action button handlers
    adminView.querySelectorAll('.btn-icon--edit').forEach(btn => {
      btn.addEventListener('click', () => {
        openProductModal(btn.dataset.id);
      });
    });

    adminView.querySelectorAll('.btn-icon--delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('确定要删除这款产品吗？此操作无法撤销。')) {
          const products = data.products.filter(p => p.id !== btn.dataset.id);
          const success = await window.CMS.set('products', products);
          if (success) {
            window.showToast('产品已成功删除');
            renderSection('products');
          }
        }
      });
    });
  }

  function openProductModal(id = null) {
    const data = window.CMS.getData();
    const isEdit = !!id;
    activeEditId = id;

    const prod = isEdit 
      ? data.products.find(p => p.id === id) 
      : { name: '', category: data.productCategories[1] || '', description: '', features: [], image: '', isHot: false };

    modalTitle.textContent = isEdit ? '编辑产品信息' : '添加全新产品';

    // Build form fields
    const categoriesOptions = data.productCategories
      .filter(cat => cat !== '全部')
      .map(cat => `<option value="${cat}" ${cat === prod.category ? 'selected' : ''}>${cat}</option>`)
      .join('');

    modalForm.innerHTML = `
      <div class="admin-form-grid admin-form-grid--full">
        <div class="form-group">
          <label class="form-label">产品名称</label>
          <input type="text" class="form-input" name="name" value="${prod.name}" required>
        </div>
        <div class="form-group">
          <label class="form-label">所属分类</label>
          <select class="form-input" name="category" required>
            ${categoriesOptions}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">产品主图</label>
          <div class="upload-wrapper">
            <div class="upload-preview" id="prod-preview">
              ${prod.image ? `<img src="${prod.image}">` : '<span>无图片</span>'}
            </div>
            <div class="upload-btn-wrapper">
              <button type="button" class="btn btn-outline btn-sm">上传图片</button>
              <input type="file" id="prod-file" accept="image/*">
            </div>
            <span class="text-gray" style="font-size:12px;">最佳比例 4:3，不超过 2MB</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">产品特性 (用英文逗号隔开，例如: 轻量化设计,高耐腐蚀,导热极佳)</label>
          <input type="text" class="form-input" name="features" value="${(prod.features || []).join(',')}">
        </div>
        <div class="form-group">
          <label class="form-label" style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" name="isHot" value="true" ${prod.isHot ? 'checked' : ''} style="width:18px;height:18px;">
            标记为热销产品 (会在首页优先展示，并显示热销标签)
          </label>
        </div>
        <div class="form-group">
          <label class="form-label">产品详情描述</label>
          <textarea class="form-input" name="description" rows="4" required>${prod.description}</textarea>
        </div>
      </div>
    `;

    // Handle Image Upload inside modal
    const prodFile = document.getElementById('prod-file');
    const prodPreview = document.getElementById('prod-preview');
    let prodImageUrl = prod.image;

    prodFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          prodImageUrl = await window.CMS.uploadImage(file);
          prodPreview.innerHTML = `<img src="${prodImageUrl}">`;
          window.showToast('产品图片上传成功');
        } catch (err) {
          window.showToast(err.message, 'error');
        }
      }
    });

    // Show modal
    modal.classList.add('admin-modal--active');

    // Handle Submit
    modalSubmit.onclick = async () => {
      if (!modalForm.reportValidity()) return;

      const formData = new FormData(modalForm);
      const isHotChecked = modalForm.querySelector('input[name="isHot"]').checked;

      const newProduct = {
        id: isEdit ? id : 'prod-' + Date.now(),
        name: formData.get('name'),
        category: formData.get('category'),
        description: formData.get('description'),
        features: formData.get('features').split(',').map(f => f.trim()).filter(Boolean),
        isHot: isHotChecked,
        image: prodImageUrl
      };

      let products = [...data.products];
      if (isEdit) {
        products = products.map(p => p.id === id ? newProduct : p);
      } else {
        products.unshift(newProduct);
      }

      const success = await window.CMS.set('products', products);
      if (success) {
        window.showToast(isEdit ? '产品编辑成功' : '产品添加成功');
        closeModal();
        renderSection('products');
      } else {
        window.showToast('保存失败', 'error');
      }
    };
  }

  // ---- Section: News ----
  function renderNews(data) {
    const listHTML = data.news.map(item => `
      <tr>
        <td>
          <div style="width: 50px; height: 50px; border-radius: 4px; overflow: hidden; background: #eee;">
            ${item.image ? `<img src="${item.image}" style="width:100%; height:100%; object-fit:cover;">` : '<div style="line-height:50px; text-align:center; color:#999; font-size:12px;">暂无</div>'}
          </div>
        </td>
        <td><strong>${item.title}</strong></td>
        <td>${item.date}</td>
        <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.summary}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-icon--edit" data-id="${item.id}">✏️</button>
            <button class="btn-icon btn-icon--delete" data-id="${item.id}">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

    adminView.innerHTML = `
      <div class="admin-card">
        <div class="admin-card__header">
          <h3 class="admin-card__title">企业新闻管理</h3>
          <button class="btn btn-primary btn-sm" id="btn-add-news">+ 新增新闻</button>
        </div>
        <div class="admin-card__body">
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th width="80">图片</th>
                  <th width="250">新闻标题</th>
                  <th width="120">发布日期</th>
                  <th>摘要说明</th>
                  <th width="100">操作</th>
                </tr>
              </thead>
              <tbody>
                ${listHTML || '<tr><td colspan="5" class="text-center" style="padding: 40px; color: #999;">暂无新闻，请点击“新增新闻”添加</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-add-news').addEventListener('click', () => {
      openNewsModal();
    });

    adminView.querySelectorAll('.btn-icon--edit').forEach(btn => {
      btn.addEventListener('click', () => {
        openNewsModal(btn.dataset.id);
      });
    });

    adminView.querySelectorAll('.btn-icon--delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('确定要删除这篇新闻吗？')) {
          const news = data.news.filter(n => n.id !== btn.dataset.id);
          const success = await window.CMS.set('news', news);
          if (success) {
            window.showToast('新闻已成功删除');
            renderSection('news');
          }
        }
      });
    });
  }

  function openNewsModal(id = null) {
    const data = window.CMS.getData();
    const isEdit = !!id;
    activeEditId = id;

    const item = isEdit 
      ? data.news.find(n => n.id === id) 
      : { title: '', summary: '', date: new Date().toISOString().split('T')[0], image: '' };

    modalTitle.textContent = isEdit ? '编辑新闻文章' : '发布新闻资讯';

    modalForm.innerHTML = `
      <div class="admin-form-grid admin-form-grid--full">
        <div class="form-group">
          <label class="form-label">新闻标题</label>
          <input type="text" class="form-input" name="title" value="${item.title}" required>
        </div>
        <div class="form-group">
          <label class="form-label">发布日期</label>
          <input type="date" class="form-input" name="date" value="${item.date}" required>
        </div>
        <div class="form-group">
          <label class="form-label">新闻配图</label>
          <div class="upload-wrapper">
            <div class="upload-preview" id="news-preview">
              ${item.image ? `<img src="${item.image}">` : '<span>无配图</span>'}
            </div>
            <div class="upload-btn-wrapper">
              <button type="button" class="btn btn-outline btn-sm">上传图片</button>
              <input type="file" id="news-file" accept="image/*">
            </div>
            <span class="text-gray" style="font-size:12px;">最佳比例 16:9，不超过 2MB</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">新闻摘要 / 内容概述</label>
          <textarea class="form-input" name="summary" rows="5" required>${item.summary}</textarea>
        </div>
      </div>
    `;

    const newsFile = document.getElementById('news-file');
    const newsPreview = document.getElementById('news-preview');
    let newsImageUrl = item.image;

    newsFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          newsImageUrl = await window.CMS.uploadImage(file);
          newsPreview.innerHTML = `<img src="${newsImageUrl}">`;
          window.showToast('新闻配图上传成功');
        } catch (err) {
          window.showToast(err.message, 'error');
        }
      }
    });

    modal.classList.add('admin-modal--active');

    modalSubmit.onclick = async () => {
      if (!modalForm.reportValidity()) return;

      const formData = new FormData(modalForm);
      const newNews = {
        id: isEdit ? id : 'news-' + Date.now(),
        title: formData.get('title'),
        date: formData.get('date'),
        summary: formData.get('summary'),
        image: newsImageUrl
      };

      let news = [...data.news];
      if (isEdit) {
        news = news.map(n => n.id === id ? newNews : n);
      } else {
        news.unshift(newNews);
      }

      const success = await window.CMS.set('news', news);
      if (success) {
        window.showToast(isEdit ? '新闻编辑已保存' : '新闻发布成功');
        closeModal();
        renderSection('news');
      } else {
        window.showToast('保存失败', 'error');
      }
    };
  }

  // ---- Section: Core Advantages ----
  function renderAdvantages(data) {
    const listHTML = data.advantages.map((adv, index) => `
      <div class="admin-card" style="margin-bottom: 20px;">
        <div class="admin-card__header">
          <h3 class="admin-card__title">优势项 ${index + 1}</h3>
        </div>
        <div class="admin-card__body">
          <div class="admin-form-grid" style="grid-template-columns: 100px 1fr 2fr;">
            <div class="form-group">
              <label class="form-label">图标 (Emoji)</label>
              <input type="text" class="form-input adv-icon" value="${adv.icon}" style="text-align:center; font-size:24px;">
            </div>
            <div class="form-group">
              <label class="form-label">核心标题</label>
              <input type="text" class="form-input adv-title" value="${adv.title}">
            </div>
            <div class="form-group">
              <label class="form-label">详细优势描述</label>
              <input type="text" class="form-input adv-desc" value="${adv.description}">
            </div>
          </div>
        </div>
      </div>
    `).join('');

    adminView.innerHTML = `
      ${listHTML}
      <div style="display:flex; justify-content:flex-end; margin-top:20px;">
        <button class="btn btn-primary" id="btn-save-adv">保存全部优势配置</button>
      </div>
    `;

    document.getElementById('btn-save-adv').addEventListener('click', async () => {
      const advCards = adminView.querySelectorAll('.admin-card');
      const updatedAdvantages = [];

      advCards.forEach((card, index) => {
        updatedAdvantages.push({
          id: data.advantages[index].id,
          icon: card.querySelector('.adv-icon').value,
          title: card.querySelector('.adv-title').value,
          description: card.querySelector('.adv-desc').value
        });
      });

      const success = await window.CMS.set('advantages', updatedAdvantages);
      if (success) {
        window.showToast('核心优势设置已成功更新');
      } else {
        window.showToast('保存失败', 'error');
      }
    });
  }

  // ---- Section: Stats ----
  function renderStats(data) {
    const listHTML = data.stats.map((stat, index) => `
      <div class="admin-card" style="margin-bottom: 20px;">
        <div class="admin-card__header">
          <h3 class="admin-card__title">统计指标 ${index + 1}</h3>
        </div>
        <div class="admin-card__body">
          <div class="admin-form-grid" style="grid-template-columns: repeat(3, 1fr);">
            <div class="form-group">
              <label class="form-label">数值 (例如: 10, 200, 99.5)</label>
              <input type="text" class="form-input stat-number" value="${stat.number}">
            </div>
            <div class="form-group">
              <label class="form-label">单位 (例如: +, %, 套)</label>
              <input type="text" class="form-input stat-unit" value="${stat.unit}">
            </div>
            <div class="form-group">
              <label class="form-label">指标名称说明 (例如: 年行业经验)</label>
              <input type="text" class="form-input stat-label" value="${stat.label}">
            </div>
          </div>
        </div>
      </div>
    `).join('');

    adminView.innerHTML = `
      ${listHTML}
      <div style="display:flex; justify-content:flex-end; margin-top:20px;">
        <button class="btn btn-primary" id="btn-save-stats">保存数据统计配置</button>
      </div>
    `;

    document.getElementById('btn-save-stats').addEventListener('click', async () => {
      const statCards = adminView.querySelectorAll('.admin-card');
      const updatedStats = [];

      statCards.forEach((card, index) => {
        updatedStats.push({
          number: card.querySelector('.stat-number').value,
          unit: card.querySelector('.stat-unit').value,
          label: card.querySelector('.stat-label').value
        });
      });

      const success = await window.CMS.set('stats', updatedStats);
      if (success) {
        window.showToast('指标配置更新成功');
      } else {
        window.showToast('保存失败', 'error');
      }
    });
  }

  // ---- Section: Milestones ----
  function renderMilestones(data) {
    const listHTML = data.milestones.map(item => `
      <tr>
        <td><strong>${item.year} 年</strong></td>
        <td><strong>${item.title}</strong></td>
        <td style="max-width: 350px;">${item.description}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-icon--edit" data-id="${item.year}">✏️</button>
            <button class="btn-icon btn-icon--delete" data-id="${item.year}">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

    adminView.innerHTML = `
      <div class="admin-card">
        <div class="admin-card__header">
          <h3 class="admin-card__title">企业发展历程时间轴</h3>
          <button class="btn btn-primary btn-sm" id="btn-add-milestone">+ 新增里程碑</button>
        </div>
        <div class="admin-card__body">
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th width="120">年份</th>
                  <th width="200">里程碑事件</th>
                  <th>事件详情说明</th>
                  <th width="100">操作</th>
                </tr>
              </thead>
              <tbody>
                ${listHTML || '<tr><td colspan="4" class="text-center" style="padding: 40px; color: #999;">暂无数据，请点击“新增里程碑”</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-add-milestone').addEventListener('click', () => {
      openMilestoneModal();
    });

    adminView.querySelectorAll('.btn-icon--edit').forEach(btn => {
      btn.addEventListener('click', () => {
        openMilestoneModal(btn.dataset.id);
      });
    });

    adminView.querySelectorAll('.btn-icon--delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('确认要删除这条里程碑吗？')) {
          const milestones = data.milestones.filter(m => m.year !== btn.dataset.id);
          const success = await window.CMS.set('milestones', milestones);
          if (success) {
            window.showToast('里程碑已成功删除');
            renderSection('milestones');
          }
        }
      });
    });
  }

  function openMilestoneModal(yearId = null) {
    const data = window.CMS.getData();
    const isEdit = !!yearId;
    activeEditId = yearId;

    const item = isEdit 
      ? data.milestones.find(m => m.year === yearId) 
      : { year: new Date().getFullYear().toString(), title: '', description: '' };

    modalTitle.textContent = isEdit ? '编辑里程碑' : '添加里程碑';

    modalForm.innerHTML = `
      <div class="admin-form-grid admin-form-grid--full">
        <div class="form-group">
          <label class="form-label">事件年份 (例如: 2026)</label>
          <input type="text" class="form-input" name="year" value="${item.year}" required ${isEdit ? 'readonly' : ''}>
          ${isEdit ? '<span class="text-gray" style="font-size:12px;">年份作为核心唯一标识，不可修改</span>' : ''}
        </div>
        <div class="form-group">
          <label class="form-label">里程碑标题</label>
          <input type="text" class="form-input" name="title" value="${item.title}" required>
        </div>
        <div class="form-group">
          <label class="form-label">大事件具体说明</label>
          <textarea class="form-input" name="description" rows="4" required>${item.description}</textarea>
        </div>
      </div>
    `;

    modal.classList.add('admin-modal--active');

    modalSubmit.onclick = async () => {
      if (!modalForm.reportValidity()) return;

      const formData = new FormData(modalForm);
      const newMilestone = {
        year: formData.get('year'),
        title: formData.get('title'),
        description: formData.get('description')
      };

      let milestones = [...data.milestones];

      if (isEdit) {
        milestones = milestones.map(m => m.year === yearId ? newMilestone : m);
      } else {
        if (milestones.some(m => m.year === newMilestone.year)) {
          window.showToast(`已存在 ${newMilestone.year} 年的里程碑，请直接编辑它或删除后再试`, 'error');
          return;
        }
        milestones.push(newMilestone);
        milestones.sort((a, b) => parseInt(a.year) - parseInt(b.year));
      }

      const success = await window.CMS.set('milestones', milestones);
      if (success) {
        window.showToast(isEdit ? '里程碑修改成功' : '里程碑创建成功');
        closeModal();
        renderSection('milestones');
      } else {
        window.showToast('保存失败', 'error');
      }
    };
  }

  // ---- Section: Customer Feedback Messages ----
  async function renderMessages() {
    const msgs = await window.CMS.getMessages();
    const listHTML = msgs.map(msg => `
      <tr>
        <td><strong>${msg.name}</strong></td>
        <td><a href="tel:${msg.phone}" style="color: var(--color-primary); text-decoration: underline;">${msg.phone}</a></td>
        <td>${msg.email || '<span class="text-gray">-</span>'}</td>
        <td style="word-break: break-all; max-width: 300px;">${msg.message}</td>
        <td><span class="badge badge--gray">${msg.time}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-icon--delete" data-id="${msg.id}" title="删除留言">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

    adminView.innerHTML = `
      <div class="admin-card">
        <div class="admin-card__header">
          <h3 class="admin-card__title">客户留言反馈管理</h3>
        </div>
        <div class="admin-card__body">
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th width="120">姓名</th>
                  <th width="150">联系电话</th>
                  <th width="180">电子邮箱</th>
                  <th>留言内容</th>
                  <th width="180">提交日期</th>
                  <th width="80">操作</th>
                </tr>
              </thead>
              <tbody>
                ${listHTML || '<tr><td colspan="6" class="text-center" style="padding: 40px; color: #999;">当前没有新留言</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    adminView.querySelectorAll('.btn-icon--delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('确认删除这条客户留言吗？此操作无法撤销。')) {
          const success = await window.CMS.deleteMessage(btn.dataset.id);
          if (success) {
            window.showToast('留言已删除');
            renderMessages();
          } else {
            window.showToast('删除失败', 'error');
          }
        }
      });
    });
  }

  // ---- Section: Settings & Reset ----
  function renderSettings() {
    adminView.innerHTML = `
      <div class="settings-section">
        <div class="settings-card">
          <div class="settings-card__icon">📥</div>
          <h4 class="settings-card__title">备份网站数据</h4>
          <p class="settings-card__desc">导出当前所有的企业配置、产品列表、新闻资讯和里程碑为 JSON 数据备份包。</p>
          <button class="btn btn-outline btn-sm btn-block" id="btn-export">导出数据备份</button>
        </div>
        
        <div class="settings-card">
          <div class="settings-card__icon">📤</div>
          <h4 class="settings-card__title">还原网站数据</h4>
          <p class="settings-card__desc">通过导入之前备份的 JSON 数据包，恢复网站的所有设置和展示内容。</p>
          <div class="upload-btn-wrapper btn-block">
            <button type="button" class="btn btn-outline btn-sm btn-block">选择并导入备份</button>
            <input type="file" id="btn-import-file" accept=".json">
          </div>
        </div>

        <div class="settings-card" style="border-color: rgba(239, 68, 68, 0.2);">
          <div class="settings-card__icon">🚪</div>
          <h4 class="settings-card__title" style="color:var(--color-error)">退出系统后台</h4>
          <p class="settings-card__desc">退出当前的管理员身份，清空安全会话缓存并锁屏管理面板。</p>
          <button class="btn btn-outline btn-sm btn-block" id="btn-logout" style="color:var(--color-error); border-color:var(--color-error)">安全退出登录</button>
        </div>
      </div>
    `;

    // Bind settings buttons
    document.getElementById('btn-export').addEventListener('click', () => {
      window.CMS.exportJSON();
      window.showToast('备份导出成功！正在启动下载...');
    });

    const fileInput = document.getElementById('btn-import-file');
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        if (confirm('导入备份将覆盖当前网站的所有数据，确定要导入吗？')) {
          try {
            await window.CMS.importJSON(file);
            window.showToast('数据导入恢复成功，正在刷新页面...');
            setTimeout(() => location.reload(), 1000);
          } catch (err) {
            window.showToast('导入文件解析错误: ' + err.message, 'error');
          }
        }
      }
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
      localStorage.removeItem('chengyuan_admin_token');
      window.showToast('您已成功安全退出');
      setTimeout(() => location.reload(), 800);
    });
  }
});
