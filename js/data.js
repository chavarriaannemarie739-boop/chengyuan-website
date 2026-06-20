/**
 * 诚远汽车零部件 — CMS 数据管理层 (API 联调升级版)
 * 所有页面内容从云端 API 读取，后台管理面板安全修改
 */

const CMS_STORAGE_KEY = 'chengyuan_cms_data';

// ============================================================
//  默认数据（占位符，可通过后台修改）
// ============================================================
const DEFAULT_DATA = {
  company: {
    name: '诚远汽车零部件',
    fullName: '聊城市茌平区诚远汽车零部件制造有限公司',
    nameEn: 'Chengyuan Auto Parts Mfg. Co., Ltd.',
    slogan: '精工品质 · 驱动未来',
    description: '专注汽车散热器研发、生产与销售，以精湛工艺和卓越品质，为全球客户提供可靠的汽车热管理解决方案。',
    descriptionLong: '聊城市茌平区诚远汽车零部件制造有限公司成立于茌平区，是一家集研发、生产、销售于一体的专业汽车散热器制造企业。公司拥有先进的生产设备和检测仪器，建立了完善的质量管理体系，产品广泛应用于乘用车、商用车、工程机械等领域。我们始终秉承"品质至上、客户为先"的经营理念，不断推动技术创新，为客户提供高性能、高可靠性的散热解决方案。',
    logo: '', 
    phone: '0635-XXXXXXX',
    mobile: '138-XXXX-XXXX',
    email: 'info@chengyuanauto.com',
    address: '山东省聊城市茌平区',
    addressDetail: '山东省聊城市茌平区（具体地址待补充）',
    wechat: '',
    website: 'www.chengyuanauto.com',
    icp: '鲁ICP备XXXXXXXX号',
    foundedYear: '2015',
  },

  banners: [
    {
      id: 'banner-1',
      title: '专业汽车散热器制造商',
      subtitle: '精工品质 · 驱动未来',
      description: '集研发、生产、销售于一体，为全球客户提供高品质汽车散热系统解决方案',
      image: '',
      link: 'products.html',
    }
  ],

  advantages: [
    {
      id: 'adv-1',
      icon: '🏭',
      title: '先进制造',
      description: '引进国际先进生产线，自动化程度高，确保产品一致性和高效率产出。'
    },
    {
      id: 'adv-2',
      icon: '🔬',
      title: '技术研发',
      description: '拥有专业研发团队，持续创新散热技术，获多项实用新型和发明专利。'
    },
    {
      id: 'adv-3',
      icon: '✅',
      title: '品质保障',
      description: '严格执行ISO质量管理体系，从原材料到成品全流程质量把控。'
    },
    {
      id: 'adv-4',
      icon: '🌍',
      title: '全球服务',
      description: '产品远销海内外，建立完善的售后服务网络，响应迅速，服务到位。'
    }
  ],

  stats: [
    { number: '10', unit: '+', label: '年行业经验' },
    { number: '200', unit: '+', label: '产品型号' },
    { number: '50', unit: '+', label: '合作客户' },
    { number: '99.5', unit: '%', label: '客户满意度' }
  ],

  products: [
    {
      id: 'prod-1',
      name: '铝制汽车散热器',
      category: '乘用车散热器',
      description: '采用优质铝合金材料，轻量化设计，散热效率高，适用于各类乘用车型。',
      features: ['高导热铝合金', '轻量化设计', '耐腐蚀', '高散热效率'],
      image: '',
      isHot: true,
    },
    {
      id: 'prod-2',
      name: '铜制汽车散热器',
      category: '商用车散热器',
      description: '传统铜制工艺，导热性能优异，适用于重型商用车 and 工程机械。',
      features: ['纯铜材质', '超强导热', '经久耐用', '大排量适用'],
      image: '',
      isHot: false,
    },
    {
      id: 'prod-3',
      name: '工程机械散热器',
      category: '工程机械散热器',
      description: '针对高负荷工况设计，耐高温高压，适用于挖掘机、装载机等工程机械。',
      features: ['耐高温设计', '高压承受', '防震结构', '长寿命'],
      image: '',
      isHot: false,
    },
    {
      id: 'prod-4',
      name: '中冷器',
      category: '配套散热件',
      description: '涡轮增压发动机专用中冷器，有效降低进气温度，提升发动机动力性能。',
      features: ['高效冷却', '低阻力设计', '增压适配', '性能稳定'],
      image: '',
      isHot: true,
    },
    {
      id: 'prod-5',
      name: '油冷器',
      category: '配套散热件',
      description: '用于发动机、变速箱等润滑油冷却，保持油温在最佳工作范围。',
      features: ['精密翅片', '高效换热', '防泄漏', '全铝焊接'],
      image: '',
      isHot: false,
    },
    {
      id: 'prod-6',
      name: '暖风散热器',
      category: '配套散热件',
      description: '车内暖风系统核心部件，快速升温，均匀散热，提升驾乘舒适度。',
      features: ['快速升温', '均匀散热', '静音设计', '紧凑结构'],
      image: '',
      isHot: false,
    }
  ],

  productCategories: ['全部', '乘用车散热器', '商用车散热器', '工程机械散热器', '配套散热件'],

  milestones: [
    { year: '2015', title: '公司成立', description: '聊城市茌平区诚远汽车零部件制造有限公司正式成立，投产第一批汽车散热器产品。' },
    { year: '2017', title: '产能扩大', description: '引进自动化生产线，年产能突破10万台，产品线覆盖乘用车和商用车领域。' },
    { year: '2019', title: '质量认证', description: '通过ISO 9001质量管理体系认证，产品品质获得客户广泛认可。' },
    { year: '2021', title: '技术升级', description: '成立技术研发中心，开展新型铝制散热器研发，获得多项技术专利。' },
    { year: '2023', title: '市场拓展', description: '产品远销海外市场，与多家国际知名汽车零部件经销商建立长期合作关系。' },
    { year: '2025', title: '智能制造', description: '推进数字化转型，引入智能制造管理系统，进一步提升生产效率和产品质量。' }
  ],

  values: [
    { icon: '🎯', title: '使命', description: '为全球汽车产业提供高品质、高性能的热管理解决方案。' },
    { icon: '👁️', title: '愿景', description: '成为国内领先、国际知名的汽车散热系统制造商。' },
    { icon: '💎', title: '价值观', description: '品质为本、创新驱动、客户至上、合作共赢。' }
  ],

  news: [
    {
      id: 'news-1',
      title: '诚远汽车零部件通过ISO 9001质量管理体系认证',
      summary: '经过严格审核，公司顺利通过ISO 9001:2015质量管理体系认证，标志着公司在质量管理方面迈上新台阶。',
      date: '2024-06-15',
      image: '',
    },
    {
      id: 'news-2',
      title: '新型铝制散热器产品成功下线',
      summary: '公司自主研发的新一代全铝焊接散热器成功下线，产品在散热性能和轻量化方面取得重大突破。',
      date: '2024-03-20',
      image: '',
    },
    {
      id: 'news-3',
      title: '诚远参加2024年上海国际汽车零部件展',
      summary: '公司携最新产品亮相上海国际汽车零部件展，吸引众多国内外客商关注与洽谈。',
      date: '2024-01-10',
      image: '',
    }
  ],

  partners: [
    { name: '合作伙伴 A' },
    { name: '合作伙伴 B' },
    { name: '合作伙伴 C' },
    { name: '合作伙伴 D' },
    { name: '合作伙伴 E' }
  ],
};

// ============================================================
//  CMS 核心操作 (与后端 API 交互)
// ============================================================
const CMS = {
  _cacheData: null,

  /**
   * 异步加载所有数据
   */
  async loadData() {
    if (this._cacheData) {
      return this._cacheData;
    }
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
   * 获取当前缓存的数据
   */
  getData() {
    if (!this._cacheData) {
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
   * 获取指定模块数据
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
      window.showToast('登录已过期，请重新登录', 'error');
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
   * 上传图片文件至服务器
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
      return result.url; // 返回如 uploads/xxx.jpg 的地址
    } else {
      throw new Error(result.message || '图片上传失败');
    }
  },

  /**
   * 提交留言
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
   * 备份导出
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

// 挂载到全局
window.CMS = CMS;
window.DEFAULT_CMS_DATA = DEFAULT_DATA;
