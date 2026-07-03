import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Archive,
  BadgeDollarSign,
  BarChart3,
  BellRing,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Download,
  Eye,
  EyeOff,
  FileText,
  HandCoins,
  HardHat,
  ImageUp,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Plus,
  QrCode,
  ReceiptText,
  RefreshCcw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'

const STORAGE_KEY = 'sanfeng-finance-data-v1'
const ACCOUNT_KEY = 'sanfeng-finance-account-v1'
const ACCOUNTS_KEY = 'sanfeng-finance-accounts-v1'
const SESSION_KEY = 'sanfeng-finance-session-v1'
const DEALER_DATA_PREFIX = `${STORAGE_KEY}:dealer:`
const ADMIN_PASSWORD_RESET_KEY = 'sanfeng-finance-admin-password-reset-20260701-v2'

const categoryOptions = ['水', '电', '瓦', '木', '油', '材料', '其他']
const partnerTypeOptions = ['项目经理', '施工人员', '供货商']
const partnerWorkOptions = ['水', '电', '瓦', '木', '油', '材料', '供货商']
const accountRoleOptions = ['经销商', '财务', '店员']
const paymentMethods = ['微信收款码', '支付宝', '银行转账', '现金']
const incomeStatusOptions = ['待确认', '已到账']
const projectStatusOptions = ['预算确认', '设计中', '施工中', '材料进场', '竣工结算']
const ticketTypes = ['收款票据', '支出票据', '合同文件', '预算清单', '验收资料', '其他']
const colors = ['#0f8f72', '#2f6fd6', '#d69a18', '#c94b4b', '#6a5acd', '#2f9ba8']

function publicAsset(path) {
  return `${import.meta.env.BASE_URL || './'}${path}`
}

const navItems = [
  { id: 'dashboard', label: '首页', icon: LayoutDashboard },
  { id: 'customers', label: '客户档案', icon: Users },
  { id: 'income', label: '收入收款', icon: WalletCards },
  { id: 'expense', label: '支出管理', icon: ReceiptText },
  { id: 'partners', label: '工程人员', icon: HardHat },
  { id: 'commission', label: '业务提成', icon: HandCoins },
  { id: 'budget', label: '预算识别', icon: ClipboardList },
  { id: 'tickets', label: '票据归档', icon: Archive },
  { id: 'reports', label: '统计报表', icon: BarChart3 },
  { id: 'settings', label: '系统设置', icon: Settings },
]

const initialData = {
  paymentQr: null,
  paymentQrs: {},
  customers: [
    {
      id: 'cus-1',
      projectNo: 'SF-2026-001',
      name: '王先生整装项目',
      phone: '13800001234',
      address: '城南华府 8-1201',
      contractTotal: 268000,
      signingTotal: 268000,
      woodDoorOrderNo: 'M-20260418-001',
      customOrderNo: 'D-20260418-001',
      managerId: 'pm-1',
      salespersonId: 'sp-1',
      startDate: '2026-04-18',
      status: '施工中',
      budget: [
        { id: 'b-1', category: '水电', item: '水电改造', budgetAmount: 32000 },
        { id: 'b-2', category: '瓦工', item: '地砖墙砖铺贴', budgetAmount: 46000 },
        { id: 'b-3', category: '木工', item: '吊顶与柜体基础', budgetAmount: 38000 },
        { id: 'b-4', category: '油工', item: '墙面基层与乳胶漆', budgetAmount: 30000 },
        { id: 'b-5', category: '主材', item: '开关石材浴室柜', budgetAmount: 62000 },
      ],
    },
    {
      id: 'cus-2',
      projectNo: 'SF-2026-002',
      name: '李女士全屋改造',
      phone: '13900005678',
      address: '北城锦园 3-802',
      contractTotal: 198000,
      signingTotal: 198000,
      woodDoorOrderNo: 'M-20260506-002',
      customOrderNo: 'D-20260506-002',
      managerId: 'pm-2',
      salespersonId: 'sp-2',
      startDate: '2026-05-06',
      status: '材料进场',
      budget: [
        { id: 'b-6', category: '水电', item: '旧房水电改造', budgetAmount: 28000 },
        { id: 'b-7', category: '瓦工', item: '厨房卫生间铺贴', budgetAmount: 36000 },
        { id: 'b-8', category: '油工', item: '全屋墙面刷新', budgetAmount: 26000 },
        { id: 'b-9', category: '主材', item: '浴室柜及五金', budgetAmount: 42000 },
      ],
    },
    {
      id: 'cus-3',
      projectNo: 'SF-2026-003',
      name: '赵总别墅局改',
      phone: '13700008888',
      address: '山湖别院 12栋',
      contractTotal: 386000,
      signingTotal: 386000,
      woodDoorOrderNo: 'M-20260522-003',
      customOrderNo: 'D-20260522-003',
      managerId: 'pm-3',
      salespersonId: 'sp-1',
      startDate: '2026-05-22',
      status: '预算确认',
      budget: [
        { id: 'b-10', category: '设计', item: '深化设计', budgetAmount: 22000 },
        { id: 'b-11', category: '水电', item: '水电定位与施工', budgetAmount: 52000 },
        { id: 'b-12', category: '石材', item: '楼梯及台面石材', budgetAmount: 86000 },
        { id: 'b-13', category: '浴室柜', item: '定制浴室柜', budgetAmount: 46000 },
      ],
    },
  ],
  incomes: [
    { id: 'in-7', projectNo: 'SF-2026-001', date: '2026-01-15', amount: 32000, method: '银行转账', payer: '王先生', status: '已到账', note: '历史定金' },
    { id: 'in-8', projectNo: 'SF-2026-002', date: '2026-02-19', amount: 42000, method: '微信收款码', payer: '李女士', status: '已到账', note: '历史预付款' },
    { id: 'in-9', projectNo: 'SF-2026-001', date: '2026-03-23', amount: 52000, method: '银行转账', payer: '王先生', status: '已到账', note: '材料款' },
    { id: 'in-10', projectNo: 'SF-2026-003', date: '2026-04-12', amount: 76000, method: '银行转账', payer: '赵总', status: '已到账', note: '方案款' },
    { id: 'in-11', projectNo: 'SF-2026-002', date: '2026-05-18', amount: 58000, method: '支付宝', payer: '李女士', status: '已到账', note: '阶段款' },
    { id: 'in-1', projectNo: 'SF-2026-001', date: '2026-06-04', amount: 80000, method: '微信收款码', payer: '王先生', status: '已到账', note: '首付款' },
    { id: 'in-2', projectNo: 'SF-2026-001', date: '2026-06-20', amount: 65000, method: '银行转账', payer: '王先生', status: '已到账', note: '水电验收款' },
    { id: 'in-3', projectNo: 'SF-2026-002', date: '2026-06-11', amount: 60000, method: '支付宝', payer: '李女士', status: '已到账', note: '首付款' },
    { id: 'in-4', projectNo: 'SF-2026-003', date: '2026-06-26', amount: 100000, method: '银行转账', payer: '赵总', status: '待确认', note: '设计定金' },
  ],
  expenses: [
    { id: 'ex-9', projectNo: 'SF-2026-001', date: '2026-01-22', amount: 12000, category: '设计', purpose: '量房设计', partnerId: 'pm-3', payeeType: '项目经理', note: '' },
    { id: 'ex-10', projectNo: 'SF-2026-002', date: '2026-02-25', amount: 18000, category: '主材', purpose: '主材预订', partnerId: 'vd-1', payeeType: '供货商', note: '' },
    { id: 'ex-11', projectNo: 'SF-2026-001', date: '2026-03-28', amount: 23500, category: '木工', purpose: '木作基层', partnerId: 'pm-3', payeeType: '项目经理', note: '' },
    { id: 'ex-12', projectNo: 'SF-2026-003', date: '2026-04-16', amount: 28000, category: '设计', purpose: '深化设计', partnerId: 'pm-3', payeeType: '项目经理', note: '' },
    { id: 'ex-13', projectNo: 'SF-2026-002', date: '2026-05-20', amount: 24000, category: '油工', purpose: '墙面材料', partnerId: 'pm-3', payeeType: '项目经理', note: '' },
    { id: 'ex-1', projectNo: 'SF-2026-001', date: '2026-06-05', amount: 18000, category: '水电', purpose: '水电人工一期', partnerId: 'pm-1', payeeType: '项目经理', note: '含开槽' },
    { id: 'ex-2', projectNo: 'SF-2026-001', date: '2026-06-14', amount: 16500, category: '水电', purpose: '电线水管材料', partnerId: 'vd-1', payeeType: '供货商', note: '伟星管线' },
    { id: 'ex-3', projectNo: 'SF-2026-001', date: '2026-06-24', amount: 51000, category: '瓦工', purpose: '瓷砖铺贴人工', partnerId: 'pm-2', payeeType: '项目经理', note: '超预算预警样例' },
    { id: 'ex-4', projectNo: 'SF-2026-002', date: '2026-06-18', amount: 21000, category: '瓦工', purpose: '厨房卫生间铺贴', partnerId: 'pm-2', payeeType: '项目经理', note: '' },
    { id: 'ex-5', projectNo: 'SF-2026-002', date: '2026-06-21', amount: 12800, category: '浴室柜', purpose: '浴室柜定金', partnerId: 'vd-3', payeeType: '供货商', note: '' },
    { id: 'ex-6', projectNo: 'SF-2026-003', date: '2026-06-28', amount: 39000, category: '石材', purpose: '石材定金', partnerId: 'vd-2', payeeType: '供货商', note: '' },
  ],
  partners: [
    { id: 'pm-1', type: '项目经理', category: '水电', name: '张工', phone: '13600001111', account: '工行 6222 **** 1188', note: '水电班组' },
    { id: 'pm-2', type: '项目经理', category: '瓦工', name: '刘工', phone: '13600002222', account: '农行 6228 **** 2299', note: '瓦工班组' },
    { id: 'pm-3', type: '项目经理', category: '木工/油工', name: '陈工', phone: '13600003333', account: '建行 6217 **** 3300', note: '木油综合' },
    { id: 'vd-1', type: '供货商', category: '开关/管线', name: '新联电材', phone: '13500001111', account: '对公账户 1001', note: '开关、管线' },
    { id: 'vd-2', type: '供货商', category: '石材', name: '恒盛石材', phone: '13500002222', account: '对公账户 1002', note: '台面、楼梯' },
    { id: 'vd-3', type: '供货商', category: '浴室柜', name: '雅洁柜业', phone: '13500003333', account: '对公账户 1003', note: '浴室柜、镜柜' },
  ],
  salespeople: [
    { id: 'sp-1', name: '周敏', phone: '13911112222', commissionRate: 0.025 },
    { id: 'sp-2', name: '何亮', phone: '13933334444', commissionRate: 0.022 },
  ],
  commissionPayments: [
    { id: 'cp-1', projectNo: 'SF-2026-001', salespersonId: 'sp-1', date: '2026-06-26', amount: 2400, note: '阶段提成' },
  ],
  tickets: [
    { id: 'tk-1', projectNo: 'SF-2026-001', type: '收款票据', title: '首付款收据', date: '2026-06-04', amount: 80000, fileName: '首付款收据.pdf', dataUrl: '', note: '纸质票据已归档' },
    { id: 'tk-2', projectNo: 'SF-2026-001', type: '支出票据', title: '水电材料单', date: '2026-06-14', amount: 16500, fileName: '水电材料单.jpg', dataUrl: '', note: '待补电子件' },
  ],
}

function uid(prefix) {
  if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function encodePassword(value) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

function normalizeAccount(rawAccount, index = 0) {
  const username = String(rawAccount?.username || rawAccount?.dealerCode || 'admin').trim() || 'admin'
  const role = accountRoleOptions.includes(rawAccount?.role) ? rawAccount.role : '经销商'
  return {
    id: rawAccount?.id || `account-${username}-${index}`,
    username,
    dealerCode: String(rawAccount?.dealerCode || username).trim() || username,
    displayName: rawAccount?.displayName || rawAccount?.dealerName || '三峰财务管理员',
    role,
    password: rawAccount?.password || encodePassword('123456'),
  }
}

function fallbackAccount() {
  return normalizeAccount({ username: 'admin', displayName: '三峰财务管理员', role: '经销商', password: encodePassword('123456') })
}

function applyAdminPasswordReset(accounts) {
  if (localStorage.getItem(ADMIN_PASSWORD_RESET_KEY) === 'done') return accounts
  const adminPassword = encodePassword('123456')
  let hasAdmin = false
  const nextAccounts = accounts.map((item) => {
    if (item.username !== 'admin' && item.dealerCode !== 'admin') return item
    hasAdmin = true
    return {
      ...item,
      username: 'admin',
      dealerCode: 'admin',
      displayName: item.displayName || '三峰财务管理员',
      role: '经销商',
      password: adminPassword,
    }
  })
  if (!hasAdmin) nextAccounts.unshift(fallbackAccount())
  localStorage.setItem(ADMIN_PASSWORD_RESET_KEY, 'done')
  saveAccounts(nextAccounts)
  return nextAccounts
}

function loadAccounts() {
  try {
    const storedAccountsRaw = localStorage.getItem(ACCOUNTS_KEY)
    const storedAccounts = storedAccountsRaw ? JSON.parse(storedAccountsRaw) : null
    if (Array.isArray(storedAccounts)) {
      return applyAdminPasswordReset(storedAccounts.map((item, index) => normalizeAccount(item, index)))
    }
    const legacyAccount = JSON.parse(localStorage.getItem(ACCOUNT_KEY))
    return applyAdminPasswordReset([legacyAccount ? normalizeAccount(legacyAccount) : fallbackAccount()])
  } catch {
    return applyAdminPasswordReset([fallbackAccount()])
  }
}

function getInitialAccount(accounts) {
  const sessionAccountId = sessionStorage.getItem(SESSION_KEY)
  return accounts.find((item) => item.id === sessionAccountId) || accounts[0] || fallbackAccount()
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  if (accounts[0]) localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts[0]))
  else localStorage.removeItem(ACCOUNT_KEY)
}

function dealerDataKey(dealerCode) {
  return `${DEALER_DATA_PREFIX}${encodeURIComponent(String(dealerCode || ''))}`
}

function createEmptyData() {
  return {
    paymentQr: null,
    paymentQrs: {},
    customers: [],
    incomes: [],
    expenses: [],
    partners: [],
    salespeople: [],
    commissionPayments: [],
    tickets: [],
  }
}

function loadDealerData(dealerCode) {
  try {
    const dealerData = localStorage.getItem(dealerDataKey(dealerCode))
    if (dealerData !== null) return normalizeData(JSON.parse(dealerData) || createEmptyData())
    if (dealerCode === 'admin') {
      const legacyData = localStorage.getItem(STORAGE_KEY)
      return normalizeData(legacyData ? JSON.parse(legacyData) : initialData)
    }
    return normalizeData(createEmptyData())
  } catch {
    return normalizeData(dealerCode === 'admin' ? initialData : createEmptyData())
  }
}

function saveDealerData(dealerCode, nextData) {
  localStorage.setItem(dealerDataKey(dealerCode), JSON.stringify(nextData))
  if (dealerCode === 'admin') localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData))
}

function removeDealerData(dealerCode) {
  localStorage.removeItem(dealerDataKey(dealerCode))
  if (dealerCode === 'admin') localStorage.removeItem(STORAGE_KEY)
}

function getSigningTotal(customer) {
  return Number(customer?.signingTotal ?? customer?.contractTotal ?? 0)
}

function getBudgetTotal(budget = []) {
  return budget.reduce((sum, item) => sum + Number(item.budgetAmount || 0), 0)
}

function applyBudgetChange(customer, nextBudget, { preserveInitialImport = false } = {}) {
  const previousBudget = customer.budget || []
  const previousTotal = getBudgetTotal(previousBudget)
  const nextTotal = getBudgetTotal(nextBudget)
  const isInitialImport = preserveInitialImport && previousBudget.length === 0 && nextBudget.length > 0
  const delta = isInitialImport ? 0 : nextTotal - previousTotal
  const currentSigningTotal = Number(customer.signingTotal ?? customer.contractTotal ?? 0)
  return {
    ...customer,
    budget: nextBudget,
    signingTotal: Math.max(0, currentSigningTotal + delta),
  }
}

function normalizeBudgetCategory(category) {
  const value = String(category || '').trim()
  if (categoryOptions.includes(value)) return value
  if (value.includes('水')) return '水'
  if (value.includes('电') || value.includes('开关')) return '电'
  if (value.includes('瓦') || value.includes('砖')) return '瓦'
  if (value.includes('木')) return '木'
  if (value.includes('油') || value.includes('乳胶') || value.includes('墙面')) return '油'
  if (value.includes('材料') || value.includes('主材') || value.includes('石材') || value.includes('浴室柜')) return '材料'
  return '其他'
}

function normalizeBudgetSource(source) {
  return source === '客户新增' ? '客户新增' : '原始预算'
}

function normalizeWorkCategory(category) {
  const value = normalizeBudgetCategory(category)
  return value === '其他' ? '供货商' : value
}

function normalizePartnerType(type) {
  return partnerTypeOptions.includes(type) ? type : '供货商'
}

function normalizePaymentMethod(method) {
  return paymentMethods.includes(method) ? method : '微信收款码'
}

function projectLabel(customer) {
  if (!customer) return ''
  return `${customer.projectNo} ${customer.name}`.trim()
}

function normalizeData(rawData) {
  const data = {
    ...initialData,
    ...rawData,
    customers: rawData?.customers || initialData.customers,
    incomes: rawData?.incomes || initialData.incomes,
    expenses: rawData?.expenses || initialData.expenses,
    partners: rawData?.partners || initialData.partners,
    salespeople: rawData?.salespeople || initialData.salespeople,
    commissionPayments: rawData?.commissionPayments || initialData.commissionPayments,
    tickets: rawData?.tickets || initialData.tickets,
    paymentQrs: rawData?.paymentQrs || (rawData?.paymentQr ? { 微信收款码: rawData.paymentQr } : initialData.paymentQrs),
  }
  const customers = data.customers.map((customer, customerIndex) => {
      const budget = (customer.budget || []).map((item, itemIndex) => ({
        id: item.id || `b-${customerIndex + 1}-${itemIndex + 1}`,
        category: normalizeBudgetCategory(item.category),
        item: item.item || `${normalizeBudgetCategory(item.category)}预算`,
        budgetAmount: Number(item.budgetAmount || 0),
        source: normalizeBudgetSource(item.source),
      }))
      const signingTotal = Number(customer.signingTotal ?? 0) || getBudgetTotal(budget)
      const contractTotal = Number(customer.contractTotal ?? 0) || signingTotal
      return {
        ...customer,
        projectNo: customer.projectNo || createProjectNo(data.customers),
        contractTotal,
        signingTotal,
        woodDoorOrderNo: customer.woodDoorOrderNo || '',
        customOrderNo: customer.customOrderNo || '',
        budget,
      }
    })
  return {
    ...data,
    customers,
    incomes: data.incomes.map((income) => ({
      ...income,
      method: normalizePaymentMethod(income.method),
      status: income.status === '已到账' ? '已到账' : '待确认',
    })),
    partners: data.partners.map((partner) => ({
      ...partner,
      type: normalizePartnerType(partner.type),
      category: normalizeWorkCategory(partner.category),
    })),
    expenses: data.expenses.map((expense) => {
      const expenseCategory = normalizeBudgetCategory(expense.category)
      const customer = customers.find((item) => item.projectNo === expense.projectNo)
      const budget = customer?.budget.find((item) => (expense.budgetId && item.id === expense.budgetId) || item.category === expenseCategory)
      return {
        ...expense,
        category: expenseCategory,
        payeeType: normalizePartnerType(expense.payeeType),
        budgetId: expense.budgetId || budget?.id || '',
        budgetItem: expense.budgetItem || budget?.item || '',
      }
    }),
  }
}

function money(value) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function percent(value) {
  return `${Math.round(Number(value || 0) * 1000) / 10}%`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function readFileAsArrayBuffer(file) {
  if (file.arrayBuffer) return file.arrayBuffer()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

function loadImageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = dataUrl
  })
}

async function enhanceImageForOcr(file) {
  const dataUrl = await readFileAsDataUrl(file)
  const image = await loadImageFromDataUrl(dataUrl)
  const longestSide = Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height)
  const scale = Math.min(2.4, Math.max(1.2, 2600 / Math.max(longestSide, 1)))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round((image.naturalWidth || image.width) * scale)
  canvas.height = Math.round((image.naturalHeight || image.height) * scale)
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  for (let index = 0; index < imageData.data.length; index += 4) {
    const gray = imageData.data[index] * 0.299 + imageData.data[index + 1] * 0.587 + imageData.data[index + 2] * 0.114
    const value = Math.max(0, Math.min(255, Math.round((gray - 128) * 1.22 + 138)))
    imageData.data[index] = value
    imageData.data[index + 1] = value
    imageData.data[index + 2] = value
    imageData.data[index + 3] = 255
  }
  context.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png', 0.96)
}

async function callLocalOcrPlugin(payload) {
  if (window.sanfengOcr?.recognizeBudgetImage) {
    return window.sanfengOcr.recognizeBudgetImage(payload)
  }
  const response = await fetch('/api/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || body.ok === false) {
    throw new Error(body.message || '本地 OCR 插件服务不可用')
  }
  return body
}

async function recognizeBudgetImage(file) {
  const originalDataUrl = await readFileAsDataUrl(file)
  let enhancedDataUrl = originalDataUrl
  try {
    enhancedDataUrl = await enhanceImageForOcr(file)
  } catch {
    enhancedDataUrl = originalDataUrl
  }
  return callLocalOcrPlugin({
    dataUrl: enhancedDataUrl,
    originalDataUrl,
    fileName: file.name,
    options: { limitSideLen: 2600 },
  })
}

function gridToManualText(grid) {
  return (grid || [])
    .map((row) => (row || []).map((cell) => normalizeBudgetTextValue(cell)).filter(Boolean).join('\t'))
    .filter(Boolean)
    .join('\n')
}

async function parseExcelBudgetFile(file) {
  const XLSX = await import('xlsx')
  const arrayBuffer = await readFileAsArrayBuffer(file)
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true })
  const grids = workbook.SheetNames.map((sheetName) => {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      defval: '',
      blankrows: false,
      raw: false,
    })
    return { sheetName, rows }
  }).filter((sheet) => sheet.rows.length)
  const rows = dedupeBudgetRows(grids.flatMap((sheet) => parseBudgetGrid(sheet.rows)))
  const text = grids
    .map((sheet) => `【${sheet.sheetName}】\n${gridToManualText(sheet.rows)}`)
    .join('\n\n')
  return { label: 'Excel表格', rows, text }
}

async function parseWordBudgetFile(file) {
  const mammothModule = await import('mammoth/mammoth.browser.js')
  const mammoth = mammothModule.default || mammothModule
  const arrayBuffer = await readFileAsArrayBuffer(file)
  const [htmlResult, rawResult] = await Promise.all([
    mammoth.convertToHtml({ arrayBuffer }),
    mammoth.extractRawText({ arrayBuffer }),
  ])
  const document = new DOMParser().parseFromString(htmlResult.value || '', 'text/html')
  const grids = [...document.querySelectorAll('table')].map((table) =>
    [...table.querySelectorAll('tr')].map((tr) => [...tr.children].map((cell) => cell.textContent || '')),
  )
  const tableRows = dedupeBudgetRows(grids.flatMap((grid) => parseBudgetGrid(grid)))
  const textRows = parseBudgetText(rawResult.value || '')
  const rows = dedupeBudgetRows([...tableRows, ...textRows])
  const tableText = grids.map((grid) => gridToManualText(grid)).filter(Boolean).join('\n\n')
  return {
    label: 'Word文档',
    rows,
    text: [tableText, rawResult.value || ''].filter(Boolean).join('\n\n'),
  }
}

async function parseBudgetDocumentFile(file) {
  const name = String(file?.name || '').toLowerCase()
  if (/\.(xlsx|xls|csv|tsv)$/.test(name)) return parseExcelBudgetFile(file)
  if (/\.docx$/.test(name)) return parseWordBudgetFile(file)
  if (/\.doc$/.test(name)) throw new Error('旧版 .doc 暂不支持，请另存为 .docx 后导入')
  throw new Error('请选择 Excel、CSV 或 Word .docx 文件')
}

function normalizeOcrText(text) {
  return String(text || '')
    .replace(/[|]/g, ' ')
    .replace(/[，]/g, ',')
    .replace(/[。]/g, '.')
    .replace(/[０-９]/g, (value) => String.fromCharCode(value.charCodeAt(0) - 65248))
    .replace(/[Oo](?=\s*(?:元|块|￥|¥|\d))/g, '0')
    .replace(/[Il](?=\s*\d)/g, '1')
}

function isProbablyLowQualityOcr(text, rows) {
  const normalized = String(text || '').trim()
  if (!normalized) return true
  const cjkCount = (normalized.match(/[\u4e00-\u9fa5]/g) || []).length
  const invalidNameRows = rows.filter((row) => /[A-Za-z]{3,}/.test(row.item) && !/[\u4e00-\u9fa5]/.test(row.item)).length
  const letterOnlyLines = normalized
    .split(/\n+/)
    .filter((line) => /^[A-Za-z\s|_\-—]+$/.test(line.trim()) && line.trim().length >= 3).length
  return rows.length === 0 || invalidNameRows > 0 || (cjkCount < 4 && letterOnlyLines >= 2)
}

function createProjectNo(customers = []) {
  const year = new Date().getFullYear()
  const max = customers.reduce((highest, customer) => {
    const match = String(customer.projectNo || '').match(/SF-\d{4}-(\d+)/)
    if (!match) return highest
    return Math.max(highest, Number(match[1]))
  }, 0)
  return `SF-${year}-${String(max + 1).padStart(3, '0')}`
}

function budgetOptionsForCustomer(customer) {
  return (customer?.budget || []).map((item) => ({
    value: item.id,
    label: item.item,
    category: item.category,
    item: item.item,
  }))
}

function normalizeBudgetTextValue(value) {
  return String(value ?? '')
    .replace(/[０-９]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) - 65248))
    .replace(/[，,]/g, '')
    .replace(/[￥¥]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractBudgetAmount(value, { minDigits = 2 } = {}) {
  const normalized = normalizeBudgetTextValue(value)
    .replace(/[Oo](?=\d)/g, '0')
    .replace(/[Il](?=\d)/g, '1')
  const matches = [...normalized.matchAll(/(\d+(?:\.\d{1,2})?)\s*(?:元|块|RMB|rmb)?/g)]
    .map((match) => ({
      raw: match[0],
      value: Number(match[1]),
      digits: match[1].replace(/\D/g, '').length,
      index: match.index || 0,
    }))
    .filter((match) => Number.isFinite(match.value) && match.value > 0 && match.digits >= minDigits)
  return matches.at(-1) || null
}

function cleanBudgetItemName(value) {
  return normalizeBudgetTextValue(value)
    .replace(/(?:￥|¥)?\s*\d+(?:\.\d{1,2})?\s*(?:元|块|RMB|rmb)?/gi, ' ')
    .replace(/^[序项编承]?号\s*/g, '')
    .replace(/^\d{1,3}\s*[.、-]?\s*/g, '')
    .replace(/(?:施工项目|项目名称|预算项目|预算名称|品名|名称|品牌|规格|型号|单位|数量|单价|合价|金额|小计|总计|合计)/g, ' ')
    .replace(/[：:|/\\]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 32)
}

function isBudgetHeaderText(value) {
  const text = normalizeBudgetTextValue(value)
  if (!text) return true
  return /^(序号|编号|项目|施工项目|项目名称|预算项目|预算名称|名称|品名|品牌|规格|型号|单位|数量|单价|合价|金额|小计|总计|合计)$/.test(text)
}

function createBudgetRow(itemName, amount, source = '原始预算') {
  const cleanedName = cleanBudgetItemName(itemName)
  const category = normalizeBudgetCategory(cleanedName)
  return {
    id: uid('ocr'),
    category,
    item: cleanedName || `${category}预算`,
    budgetAmount: Number(amount),
    source,
  }
}

function dedupeBudgetRows(rows) {
  const seen = new Set()
  return rows.filter((row) => {
    const amount = Math.round(Number(row.budgetAmount || 0) * 100) / 100
    if (!row.item || !Number.isFinite(amount) || amount <= 0) return false
    const key = `${row.item}|${amount}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function parseBudgetText(text, { source = '原始预算', minDigits = 3 } = {}) {
  const rows = []
  const lines = String(text || '')
    .replace(/[，]/g, ',')
    .split(/\n|;|；/)
    .map((line) => line.trim())
    .filter(Boolean)

  lines.forEach((line) => {
    const amount = extractBudgetAmount(line, { minDigits })
    if (!amount) return
    const itemName = cleanBudgetItemName(`${line.slice(0, amount.index)} ${line.slice(amount.index + amount.raw.length)}`)
    if (!itemName || isBudgetHeaderText(itemName)) return
    rows.push(createBudgetRow(itemName, amount.value, source))
  })
  return dedupeBudgetRows(rows)
}

function parseBudgetGrid(grid, { source = '原始预算' } = {}) {
  const rows = []
  ;(grid || []).forEach((line) => {
    const cells = (Array.isArray(line) ? line : [])
      .map((cell) => normalizeBudgetTextValue(cell))
      .filter(Boolean)
    if (cells.length < 2) return
    const rowText = cells.join(' ')
    if (/^(序号|编号|项目|施工项目|项目名称|预算项目|名称|品名).*(金额|合价|小计|总计|合计)/.test(rowText)) return
    const amountCellIndex = [...cells]
      .map((cell, index) => ({ index, amount: extractBudgetAmount(cell, { minDigits: 1 }) }))
      .reverse()
      .find((cell) => cell.amount && !/^(序号|编号)$/.test(cells[cell.index]))
    if (!amountCellIndex) return
    const nameCells = cells
      .slice(0, amountCellIndex.index)
      .filter((cell) => !/^\d{1,3}$/.test(cell) && !isBudgetHeaderText(cell))
    const itemName = cleanBudgetItemName(nameCells.join(' ') || rowText)
    if (!itemName || itemName.length < 2) return
    rows.push(createBudgetRow(itemName, amountCellIndex.amount.value, source))
  })
  return dedupeBudgetRows(rows)
}

function ocrItemGeometry(item) {
  const box = Array.isArray(item?.box) ? item.box : []
  const xs = box.map((point) => Number(point?.[0] || 0))
  const ys = box.map((point) => Number(point?.[1] || 0))
  const left = Math.min(...xs)
  const right = Math.max(...xs)
  const top = Math.min(...ys)
  const bottom = Math.max(...ys)
  return {
    left,
    right,
    top,
    bottom,
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2,
    height: bottom - top,
  }
}

function buildOcrTableGrid(items = []) {
  const useful = items
    .map((item) => ({ ...item, text: normalizeBudgetTextValue(item?.text), geometry: ocrItemGeometry(item) }))
    .filter((item) => item.text && Number(item.score || 1) >= 0.2 && Number.isFinite(item.geometry.centerY))
    .sort((a, b) => a.geometry.centerY - b.geometry.centerY)
  const groups = []
  useful.forEach((item) => {
    const group = groups.find((candidate) => Math.abs(candidate.centerY - item.geometry.centerY) <= Math.max(18, item.geometry.height * 0.75))
    if (group) {
      group.items.push(item)
      group.centerY = group.items.reduce((sum, row) => sum + row.geometry.centerY, 0) / group.items.length
    } else {
      groups.push({ centerY: item.geometry.centerY, items: [item] })
    }
  })
  return groups
    .map((group) => group.items.sort((a, b) => a.geometry.left - b.geometry.left).map((item) => item.text))
    .filter((row) => row.length >= 2)
}

function parseBudgetOcrResult(result) {
  const tableRows = parseBudgetGrid(buildOcrTableGrid(result?.items || []))
  const textRows = parseBudgetText(result?.text || '')
  return dedupeBudgetRows([...tableRows, ...textRows])
}

function SanfengLogo({ compact = false }) {
  return (
    <div className={compact ? 'brand compact' : 'brand'}>
      <img src={publicAsset('sanfeng-official-mark.png')} alt="三峰整装" />
      <div>
        <strong>三峰整装</strong>
      </div>
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-header">
          <h3>{title}</h3>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="关闭">
            <X size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function StatCard({ title, value, meta, icon: Icon, tone = 'green' }) {
  return (
    <article className={`stat-card ${tone}`}>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
        {meta && <em>{meta}</em>}
      </div>
      <Icon size={22} />
    </article>
  )
}

function EmptyState({ icon: Icon, title }) {
  return (
    <div className="empty-state">
      <Icon size={28} />
      <span>{title}</span>
    </div>
  )
}

function ToastStack({ toasts, removeToast }) {
  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <button key={toast.id} className={`toast ${toast.type}`} type="button" onClick={() => removeToast(toast.id)}>
          {toast.type === 'warning' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </button>
      ))}
    </div>
  )
}

function LoginScreen({ accounts, account, onLogin, onRegister, onResetPassword }) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [username, setUsername] = useState(account.username)
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState('经销商')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const submit = (event) => {
    event.preventDefault()
    setSuccess('')
    if (isRegistering) {
      if (!username.trim() || !displayName.trim() || password.length < 6) {
        setError('请填写经销商代码、名称和至少 6 位密码')
        return
      }
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致')
        return
      }
      onRegister({
        username: username.trim(),
        dealerCode: username.trim(),
        displayName: displayName.trim(),
        role,
        password: encodePassword(password),
      })
      return
    }
    const matchedAccount = accounts.find((item) =>
      item.username === username.trim()
      && item.role === role
      && item.password === encodePassword(password),
    )
    if (matchedAccount) {
      onLogin(matchedAccount)
      return
    }
    setError('经销商代码、职位或密码不正确')
  }

  const resetPassword = () => {
    setError('')
    setSuccess('')
    const result = onResetPassword({ username: username.trim(), role })
    if (result.ok) setSuccess(result.message)
    else setError(result.message)
  }

  return (
    <main className="login-screen">
      <section className="login-panel">
        <SanfengLogo />
        <div className="login-copy">
          <h1>财务收支管理系统</h1>
          <p>客户项目、收款、支出、预算、票据和提成统一管理。</p>
        </div>
        <form className="login-form" onSubmit={submit}>
          <Field label="经销商代码">
              <input
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value)
                  setError('')
                  setSuccess('')
                }}
                autoComplete="username"
              />
          </Field>
          {isRegistering && (
            <Field label="经销商名称">
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="organization" />
            </Field>
          )}
          <Field label="职位">
            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value)
                setError('')
                setSuccess('')
              }}
            >
              {accountRoleOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="密码">
            <div className="password-field">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                placeholder={isRegistering ? '至少 6 位' : '默认 123456'}
              />
              <button type="button" onClick={() => setShow((value) => !value)} aria-label="显示或隐藏密码">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
          {isRegistering && (
            <Field label="确认密码">
              <input
                type={show ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
              />
            </Field>
          )}
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}
          <button className="primary-btn wide" type="submit">
            <LockKeyhole size={17} />
            {isRegistering ? '注册并进入系统' : '登录系统'}
          </button>
          {!isRegistering && (
            <button
              className="secondary-btn wide"
              type="button"
              disabled={role !== '经销商'}
              title={role === '经销商' ? '重置当前经销商账户密码为默认 123456' : '只有经销商类型账户可以重置密码'}
              onClick={resetPassword}
            >
              <RefreshCcw size={17} />
              重置密码
            </button>
          )}
          <button
            className="link-btn"
            type="button"
            onClick={() => {
              setIsRegistering((value) => !value)
              setError('')
              setSuccess('')
              setPassword('')
              setConfirmPassword('')
              setUsername(account.username)
              setRole('经销商')
            }}
          >
            {isRegistering ? '返回登录' : '注册账户'}
          </button>
        </form>
      </section>
      <aside className="login-aside">
        <div>
          <strong>今日重点</strong>
          <span>收款确认、预算预警、票据归档</span>
        </div>
        <div>
          <strong>成本控制</strong>
          <span>支出录入后自动核对项目预算</span>
        </div>
        <div>
          <strong>数据口径</strong>
          <span>收入、支出、提成与客户档案联动</span>
        </div>
      </aside>
    </main>
  )
}

function App() {
  const [initialState] = useState(() => {
    const initialAccounts = loadAccounts()
    const initialAccount = getInitialAccount(initialAccounts)
    return {
      accounts: initialAccounts,
      account: initialAccount,
      data: loadDealerData(initialAccount.dealerCode),
    }
  })
  const [accounts, setAccounts] = useState(initialState.accounts)
  const [account, setAccount] = useState(initialState.account)
  const [isAuthed, setIsAuthed] = useState(() => Boolean(sessionStorage.getItem(SESSION_KEY)))
  const [data, setData] = useState(initialState.data)
  const [active, setActive] = useState('dashboard')
  const [selectedProject, setSelectedProject] = useState(data.customers[0]?.projectNo || '')
  const [search, setSearch] = useState('')
  const [toasts, setToasts] = useState([])
  const [passwordModal, setPasswordModal] = useState(false)
  const [paymentSession, setPaymentSession] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState('')

  const [incomeDraft, setIncomeDraft] = useState({
    projectNo: selectedProject,
    date: today(),
    amount: '',
    method: '微信收款码',
    payer: '',
    status: '已到账',
    note: '',
  })
  const [expenseDraft, setExpenseDraft] = useState({
    projectNo: selectedProject,
    date: today(),
    amount: '',
    budgetId: '',
    category: '水',
    purpose: '',
    partnerId: '',
    payeeType: '项目经理',
    note: '',
  })
  const [customerDraft, setCustomerDraft] = useState({
    name: '',
    phone: '',
    address: '',
    contractTotal: '',
    signingTotal: '',
    woodDoorOrderNo: '',
    customOrderNo: '',
    managerId: '',
    salespersonId: '',
    status: '预算确认',
  })
  const [budgetDraft, setBudgetDraft] = useState({ category: '水', item: '', budgetAmount: '' })
  const [partnerDraft, setPartnerDraft] = useState({
    type: '项目经理',
    category: '水',
    name: '',
    phone: '',
    account: '',
    note: '',
  })
  const [editingPartnerId, setEditingPartnerId] = useState('')
  const [salesDraft, setSalesDraft] = useState({ name: '', phone: '', commissionRate: '2.5' })
  const [commissionDraft, setCommissionDraft] = useState({ projectNo: selectedProject, date: today(), amount: '', note: '' })
  const [ticketDraft, setTicketDraft] = useState({
    projectNo: selectedProject,
    type: '收款票据',
    title: '',
    date: today(),
    amount: '',
    fileName: '',
    dataUrl: '',
    note: '',
  })
  const [ticketQuery, setTicketQuery] = useState('')
  const [ocrProject, setOcrProject] = useState(selectedProject)
  const [manualBudgetText, setManualBudgetText] = useState('')
  const [ocrRows, setOcrRows] = useState([])
  const [ocrProgress, setOcrProgress] = useState('')
  const [ocrBusy, setOcrBusy] = useState(false)

  useEffect(() => {
    if (isAuthed) saveDealerData(account.dealerCode, data)
  }, [account.dealerCode, data, isAuthed])

  useEffect(() => {
    saveAccounts(accounts)
  }, [accounts])

  useEffect(() => {
    setIncomeDraft((draft) => ({ ...draft, projectNo: selectedProject }))
    setExpenseDraft((draft) => ({ ...draft, projectNo: selectedProject }))
    setCommissionDraft((draft) => ({ ...draft, projectNo: selectedProject }))
    setTicketDraft((draft) => ({ ...draft, projectNo: selectedProject }))
    setOcrProject(selectedProject)
  }, [selectedProject])

  const selectedCustomer = useMemo(
    () => data.customers.find((customer) => customer.projectNo === selectedProject) || data.customers[0],
    [data.customers, selectedProject],
  )
  const nextProjectNo = useMemo(() => createProjectNo(data.customers), [data.customers])
  useEffect(() => {
    const customer = data.customers.find((item) => item.projectNo === expenseDraft.projectNo)
    const options = budgetOptionsForCustomer(customer)
    if (!options.length) {
      setExpenseDraft((draft) => ({ ...draft, budgetId: '', category: '其他' }))
      return
    }
    if (!options.some((item) => item.value === expenseDraft.budgetId)) {
      setExpenseDraft((draft) => ({ ...draft, budgetId: options[0].value, category: options[0].category }))
    }
  }, [data.customers, expenseDraft.projectNo, expenseDraft.budgetId])

  useEffect(() => {
    if (!paymentSession) return undefined
    setPaymentStatus('已生成待确认收款流水，请收款后人工调整到账状态')
    return undefined
  }, [paymentSession])

  const partnerMap = useMemo(() => new Map(data.partners.map((partner) => [partner.id, partner])), [data.partners])
  const salespersonMap = useMemo(() => new Map(data.salespeople.map((person) => [person.id, person])), [data.salespeople])

  const projectFinancials = useMemo(() => {
    return data.customers.map((customer) => {
      const income = data.incomes
        .filter((item) => item.projectNo === customer.projectNo && item.status === '已到账')
        .reduce((sum, item) => sum + Number(item.amount), 0)
      const expense = data.expenses
        .filter((item) => item.projectNo === customer.projectNo)
        .reduce((sum, item) => sum + Number(item.amount), 0)
      const budget = customer.budget.reduce((sum, item) => sum + Number(item.budgetAmount), 0)
      const signingTotal = getSigningTotal(customer)
      return {
        ...customer,
        signingTotal,
        income,
        expense,
        budget,
        grossProfit: income - expense,
        collectionRate: signingTotal ? income / signingTotal : 0,
      }
    })
  }, [data.customers, data.incomes, data.expenses])

  const budgetAlerts = useMemo(() => {
    const rows = []
    data.customers.forEach((customer) => {
      customer.budget.forEach((budget) => {
        const expenses = data.expenses.filter(
          (expense) =>
            expense.projectNo === customer.projectNo
            && ((expense.budgetId && expense.budgetId === budget.id) || (!expense.budgetId && expense.category === budget.category)),
        )
        const actual = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
        const singleOver = expenses.find((expense) => Number(expense.amount) > Number(budget.budgetAmount))
        if (actual > Number(budget.budgetAmount) || singleOver) {
          rows.push({
            id: `${customer.projectNo}-${budget.id}`,
            projectNo: customer.projectNo,
            customerName: customer.name,
            category: budget.category,
            item: budget.item,
            budget: Number(budget.budgetAmount),
            actual,
            over: Math.max(actual - Number(budget.budgetAmount), singleOver ? Number(singleOver.amount) - Number(budget.budgetAmount) : 0),
            reason: singleOver ? '单笔超过' : '累计超支',
          })
        }
      })
    })
    return rows.sort((a, b) => b.over - a.over)
  }, [data.customers, data.expenses])

  const dashboardStats = useMemo(() => {
    const month = new Date().toISOString().slice(0, 7)
    const income = data.incomes
      .filter((item) => item.date.startsWith(month) && item.status === '已到账')
      .reduce((sum, item) => sum + Number(item.amount), 0)
    const expense = data.expenses
      .filter((item) => item.date.startsWith(month))
      .reduce((sum, item) => sum + Number(item.amount), 0)
    const pending = data.incomes.filter((item) => item.status !== '已到账').reduce((sum, item) => sum + Number(item.amount), 0)
    return { income, expense, pending, alertCount: budgetAlerts.length }
  }, [data.incomes, data.expenses, budgetAlerts.length])

  const trendData = useMemo(() => {
    const months = []
    const now = new Date()
    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1)
      const key = date.toISOString().slice(0, 7)
      months.push({
        key,
        month: `${date.getMonth() + 1}月`,
        income: data.incomes
          .filter((item) => item.date.startsWith(key) && item.status === '已到账')
          .reduce((sum, item) => sum + Number(item.amount), 0),
        expense: data.expenses
          .filter((item) => item.date.startsWith(key))
          .reduce((sum, item) => sum + Number(item.amount), 0),
      })
    }
    return months
  }, [data.incomes, data.expenses])

  const expenseByCategory = useMemo(() => {
    return categoryOptions
      .map((category) => ({
        category,
        value: data.expenses
          .filter((expense) => expense.category === category)
          .reduce((sum, expense) => sum + Number(expense.amount), 0),
      }))
      .filter((item) => item.value > 0)
  }, [data.expenses])

  const commissionRows = useMemo(() => {
    return data.customers.map((customer) => {
      const salesperson = salespersonMap.get(customer.salespersonId)
      const collected = data.incomes
        .filter((income) => income.projectNo === customer.projectNo && income.status === '已到账')
        .reduce((sum, income) => sum + Number(income.amount), 0)
      const rate = salesperson?.commissionRate || 0
      const shouldPay = collected * rate
      const paid = data.commissionPayments
        .filter((payment) => payment.projectNo === customer.projectNo)
        .reduce((sum, payment) => sum + Number(payment.amount), 0)
      return {
        projectNo: customer.projectNo,
        projectName: customer.name,
        salesperson: salesperson?.name || '未指定',
        collected,
        rate,
        shouldPay,
        paid,
        unpaid: Math.max(shouldPay - paid, 0),
      }
    })
  }, [data.customers, data.incomes, data.commissionPayments, salespersonMap])

  const filteredTickets = useMemo(() => {
    const keyword = ticketQuery.trim().toLowerCase()
    return data.tickets.filter((ticket) => {
      const customer = data.customers.find((item) => item.projectNo === ticket.projectNo)
      const haystack = `${ticket.projectNo} ${customer?.name || ''} ${ticket.type} ${ticket.title} ${ticket.fileName} ${ticket.note}`.toLowerCase()
      return !keyword || haystack.includes(keyword)
    })
  }, [data.customers, data.tickets, ticketQuery])

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return projectFinancials
    return projectFinancials.filter((customer) => {
      return `${customer.projectNo} ${customer.name} ${customer.phone} ${customer.address}`.toLowerCase().includes(keyword)
    })
  }, [projectFinancials, search])

  const addToast = (message, type = 'success') => {
    const id = uid('toast')
    setToasts((items) => [...items, { id, message, type }])
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id))
    }, 4200)
  }

  const removeToast = (id) => setToasts((items) => items.filter((item) => item.id !== id))

  const mutateData = (updater) => {
    setData((current) => (typeof updater === 'function' ? updater(current) : updater))
  }

  const resetWorkspaceState = (nextData) => {
    const nextProject = nextData.customers[0]?.projectNo || ''
    setSelectedProject(nextProject)
    setSearch('')
    setTicketQuery('')
    setPaymentSession(null)
    setPaymentStatus('')
    setManualBudgetText('')
    setOcrRows([])
    setOcrProgress('')
    setOcrProject(nextProject)
  }

  const canEdit = account.role !== '店员'
  const canDeleteAccounts = account.role === '经销商'
  const sameDealerAccounts = accounts.filter((item) => item.dealerCode === account.dealerCode)

  const ensureCanEdit = (action = '当前操作') => {
    if (canEdit) return true
    addToast(`店员账号仅可查询，不能${action}`, 'warning')
    return false
  }

  const handleLogin = (nextAccount) => {
    const nextData = loadDealerData(nextAccount.dealerCode)
    setAccount(nextAccount)
    setData(nextData)
    resetWorkspaceState(nextData)
    sessionStorage.setItem(SESSION_KEY, nextAccount.id)
    setIsAuthed(true)
  }

  const handleRegisterAccount = (nextAccount) => {
    const normalizedAccount = normalizeAccount({ ...nextAccount, id: uid('account') }, accounts.length)
    const dealerCodeChanged = normalizedAccount.dealerCode !== account.dealerCode
    const nextData = dealerCodeChanged ? normalizeData(createEmptyData()) : loadDealerData(normalizedAccount.dealerCode)
    setAccounts((items) => [normalizedAccount, ...items])
    setAccount(normalizedAccount)
    setData(nextData)
    resetWorkspaceState(nextData)
    saveDealerData(normalizedAccount.dealerCode, nextData)
    sessionStorage.setItem(SESSION_KEY, normalizedAccount.id)
    setIsAuthed(true)
    if (dealerCodeChanged) addToast('已创建独立经销商后台，当前业务数据为空')
  }

  const handleLoginPasswordReset = ({ username, role }) => {
    const dealerCode = username.trim()
    if (!dealerCode) return { ok: false, message: '请先填写经销商代码' }
    if (role !== '经销商') return { ok: false, message: '只有经销商类型账户可以重置密码' }
    const target = accounts.find((item) =>
      item.role === '经销商'
      && (item.username === dealerCode || item.dealerCode === dealerCode),
    )
    if (!target) return { ok: false, message: '未找到该经销商类型账户' }
    const nextTarget = { ...target, password: encodePassword('123456') }
    setAccounts((items) => items.map((item) => (item.id === target.id ? nextTarget : item)))
    if (account.id === target.id) setAccount(nextTarget)
    return { ok: true, message: '密码已重置为默认 123456，客户和收支数据未变动' }
  }

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setIsAuthed(false)
  }

  const handleQrUpload = async (file, method = incomeDraft.method) => {
    if (!file) return
    if (!ensureCanEdit('上传收款码')) return
    const dataUrl = await readFileAsDataUrl(file)
    mutateData((current) => ({
      ...current,
      paymentQrs: {
        ...(current.paymentQrs || {}),
        [method]: { fileName: file.name, dataUrl, updatedAt: today() },
      },
    }))
    addToast(`${method}已上传`)
  }

  const handleIncomeSubmit = (event) => {
    event.preventDefault()
    if (!ensureCanEdit('新增收款')) return
    if (!incomeDraft.projectNo || !Number(incomeDraft.amount)) {
      addToast('请填写项目和收款金额', 'warning')
      return
    }
    const row = { id: uid('in'), ...incomeDraft, amount: Number(incomeDraft.amount), status: '待确认', onlineNotice: '人工确认' }
    mutateData((current) => ({ ...current, incomes: [row, ...current.incomes] }))
    setIncomeDraft((draft) => ({ ...draft, amount: '', payer: '', note: '', status: '已到账' }))
    setPaymentSession({ rowId: row.id, projectNo: row.projectNo, amount: row.amount, method: row.method, payer: row.payer })
    addToast(`收款码已弹出：${money(row.amount)} 流水已待确认`)
  }

  const confirmIncomeArrival = (incomeId) => {
    if (!ensureCanEdit('确认收款')) return
    mutateData((current) => ({
      ...current,
      incomes: current.incomes.map((income) =>
        income.id === incomeId
          ? { ...income, status: '已到账', onlineNotice: '人工确认到账', confirmedAt: new Date().toLocaleString('zh-CN') }
          : income,
      ),
    }))
    setPaymentStatus('已人工确认到账，流水状态已更新')
    addToast('收款流水已更改为已到账')
  }

  const updateIncomeStatus = (incomeId, status) => {
    if (!ensureCanEdit('调整收款状态')) return
    mutateData((current) => ({
      ...current,
      incomes: current.incomes.map((income) =>
        income.id === incomeId
          ? {
              ...income,
              status,
              onlineNotice: status === '已到账' ? '人工确认到账' : '待人工确认',
              confirmedAt: status === '已到账' ? new Date().toLocaleString('zh-CN') : '',
            }
          : income,
      ),
    }))
    addToast(`收款状态已调整为${status}`)
  }

  const handleExpenseSubmit = (event) => {
    event.preventDefault()
    if (!ensureCanEdit('保存支出')) return
    if (!expenseDraft.projectNo || !Number(expenseDraft.amount) || !expenseDraft.purpose.trim()) {
      addToast('请填写项目、金额和用途', 'warning')
      return
    }
    const customer = data.customers.find((item) => item.projectNo === expenseDraft.projectNo)
    const selectedBudget = customer?.budget.find((item) => item.id === expenseDraft.budgetId) || customer?.budget.find((item) => item.category === expenseDraft.category)
    if (!selectedBudget) {
      addToast('请先在客户档案录入该项目的装修预算项', 'warning')
      return
    }
    const expense = {
      id: uid('ex'),
      ...expenseDraft,
      budgetId: selectedBudget?.id || '',
      category: selectedBudget?.category || expenseDraft.category,
      budgetItem: selectedBudget?.item || expenseDraft.category,
      amount: Number(expenseDraft.amount),
    }
    const budget = selectedBudget
    const currentActual = data.expenses
      .filter((item) => item.projectNo === expense.projectNo && ((budget?.id && item.budgetId === budget.id) || item.category === expense.category))
      .reduce((sum, item) => sum + Number(item.amount), 0)
    mutateData((current) => ({ ...current, expenses: [expense, ...current.expenses] }))
    setExpenseDraft((draft) => ({ ...draft, amount: '', purpose: '', note: '' }))
    if (budget && expense.amount > Number(budget.budgetAmount)) {
      addToast(`${expense.category}单笔支出已超过预算`, 'warning')
    } else if (budget && currentActual + expense.amount > Number(budget.budgetAmount)) {
      addToast(`${expense.category}累计支出已超过预算`, 'warning')
    } else {
      addToast('支出已保存')
    }
  }

  const handleCustomerSubmit = (event) => {
    event.preventDefault()
    if (!ensureCanEdit('新建客户档案')) return
    const projectNo = createProjectNo(data.customers)
    if (!customerDraft.name.trim() || !Number(customerDraft.signingTotal)) {
      addToast('请填写客户名称和签单总价', 'warning')
      return
    }
    const signingTotal = Number(customerDraft.signingTotal)
    const contractTotal = Number(customerDraft.contractTotal || customerDraft.signingTotal)
    const row = {
      id: uid('cus'),
      ...customerDraft,
      projectNo,
      signingTotal,
      contractTotal,
      startDate: today(),
      budget: [],
    }
    mutateData((current) => ({ ...current, customers: [row, ...current.customers] }))
    setSelectedProject(projectNo)
    setCustomerDraft({ name: '', phone: '', address: '', contractTotal: '', signingTotal: '', woodDoorOrderNo: '', customOrderNo: '', managerId: '', salespersonId: '', status: '预算确认' })
    addToast('客户档案已创建')
  }

  const syncCustomerBudget = (projectNo, nextBudget, options) => {
    mutateData((current) => ({
      ...current,
      customers: current.customers.map((customer) =>
        customer.projectNo === projectNo
          ? applyBudgetChange(customer, nextBudget, options)
          : customer,
      ),
    }))
  }

  const updateCustomerPatch = (projectNo, patch) => {
    if (!ensureCanEdit('修改客户档案')) return
    mutateData((current) => ({
      ...current,
      customers: current.customers.map((customer) =>
        customer.projectNo === projectNo ? { ...customer, ...patch } : customer,
      ),
    }))
  }

  const addBudgetItem = (event) => {
    event.preventDefault()
    if (!ensureCanEdit('新增装修预算')) return
    if (!selectedCustomer || !budgetDraft.item.trim() || !Number(budgetDraft.budgetAmount)) {
      addToast('请填写预算名称和金额', 'warning')
      return
    }
    const nextBudget = [
      ...selectedCustomer.budget,
      {
        id: uid('b'),
        category: normalizeBudgetCategory(budgetDraft.item || budgetDraft.category),
        item: budgetDraft.item.trim(),
        budgetAmount: Number(budgetDraft.budgetAmount),
        source: '客户新增',
      },
    ]
    syncCustomerBudget(selectedCustomer.projectNo, nextBudget)
    setBudgetDraft({ category: '水', item: '', budgetAmount: '' })
    addToast('装修预算已新增，签单总价已同步')
  }

  const updateBudgetItem = (projectNo, budgetId, patch) => {
    if (!ensureCanEdit('修改装修预算')) return
    const customer = data.customers.find((item) => item.projectNo === projectNo)
    if (!customer) return
    const nextPatch = {
      ...patch,
      ...(patch.category ? { category: normalizeBudgetCategory(patch.category) } : {}),
    }
    const nextBudget = customer.budget.map((item) =>
      item.id === budgetId
        ? { ...item, ...nextPatch, budgetAmount: Number(patch.budgetAmount ?? item.budgetAmount) }
        : item,
    )
    syncCustomerBudget(projectNo, nextBudget)
  }

  const removeBudgetItem = (projectNo, budgetId) => {
    if (!ensureCanEdit('删除装修预算')) return
    const customer = data.customers.find((item) => item.projectNo === projectNo)
    if (!customer) return
    syncCustomerBudget(projectNo, customer.budget.filter((item) => item.id !== budgetId))
    addToast('装修预算已删除，签单总价已同步')
  }

  const handlePartnerSubmit = (event) => {
    event.preventDefault()
    if (!ensureCanEdit('保存工程人员档案')) return
    if (!partnerDraft.name.trim()) {
      addToast('请填写名称', 'warning')
      return
    }
    if (editingPartnerId) {
      mutateData((current) => ({
        ...current,
        partners: current.partners.map((partner) =>
          partner.id === editingPartnerId ? { ...partner, ...partnerDraft } : partner,
        ),
      }))
      setEditingPartnerId('')
      addToast('工程人员档案已更新')
    } else {
      const row = { id: uid(partnerDraft.type === '供货商' ? 'vd' : 'wk'), ...partnerDraft }
      mutateData((current) => ({ ...current, partners: [row, ...current.partners] }))
      addToast('档案已保存')
    }
    setPartnerDraft({ type: '项目经理', category: '水', name: '', phone: '', account: '', note: '' })
  }

  const startPartnerEdit = (partner) => {
    if (!ensureCanEdit('修改工程人员档案')) return
    setEditingPartnerId(partner.id)
    setPartnerDraft({
      type: partner.type,
      category: partner.category,
      name: partner.name,
      phone: partner.phone || '',
      account: partner.account || '',
      note: partner.note || '',
    })
  }

  const cancelPartnerEdit = () => {
    setEditingPartnerId('')
    setPartnerDraft({ type: '项目经理', category: '水', name: '', phone: '', account: '', note: '' })
  }

  const deletePartner = (partner) => {
    if (!ensureCanEdit('删除工程人员档案')) return
    mutateData((current) => ({
      ...current,
      partners: current.partners.filter((item) => item.id !== partner.id),
      customers: current.customers.map((customer) =>
        customer.managerId === partner.id ? { ...customer, managerId: '' } : customer,
      ),
      expenses: current.expenses.map((expense) =>
        expense.partnerId === partner.id ? { ...expense, partnerId: '' } : expense,
      ),
    }))
    if (editingPartnerId === partner.id) cancelPartnerEdit()
    addToast('工程人员档案已删除')
  }

  const handleSalesSubmit = (event) => {
    event.preventDefault()
    if (!ensureCanEdit('添加业务员')) return
    if (!salesDraft.name.trim()) {
      addToast('请填写业务员姓名', 'warning')
      return
    }
    const row = {
      id: uid('sp'),
      name: salesDraft.name,
      phone: salesDraft.phone,
      commissionRate: Number(salesDraft.commissionRate || 0) / 100,
    }
    mutateData((current) => ({ ...current, salespeople: [row, ...current.salespeople] }))
    setSalesDraft({ name: '', phone: '', commissionRate: '2.5' })
    addToast('业务员已添加')
  }

  const handleCommissionPay = (event) => {
    event.preventDefault()
    if (!ensureCanEdit('记录提成发放')) return
    const customer = data.customers.find((item) => item.projectNo === commissionDraft.projectNo)
    if (!customer || !Number(commissionDraft.amount)) {
      addToast('请选择项目并填写发放金额', 'warning')
      return
    }
    const row = {
      id: uid('cp'),
      projectNo: customer.projectNo,
      salespersonId: customer.salespersonId,
      date: commissionDraft.date,
      amount: Number(commissionDraft.amount),
      note: commissionDraft.note,
    }
    mutateData((current) => ({ ...current, commissionPayments: [row, ...current.commissionPayments] }))
    setCommissionDraft((draft) => ({ ...draft, amount: '', note: '' }))
    addToast('提成发放记录已保存')
  }

  const handleTicketFile = async (file) => {
    if (!file) return
    if (!ensureCanEdit('上传票据')) return
    const dataUrl = await readFileAsDataUrl(file)
    setTicketDraft((draft) => ({ ...draft, fileName: file.name, dataUrl }))
  }

  const handleTicketSubmit = (event) => {
    event.preventDefault()
    if (!ensureCanEdit('归档票据')) return
    if (!ticketDraft.projectNo || !ticketDraft.title.trim()) {
      addToast('请填写项目和票据标题', 'warning')
      return
    }
    const row = { id: uid('tk'), ...ticketDraft, amount: Number(ticketDraft.amount || 0) }
    mutateData((current) => ({ ...current, tickets: [row, ...current.tickets] }))
    setTicketDraft({ projectNo: selectedProject, type: '收款票据', title: '', date: today(), amount: '', fileName: '', dataUrl: '', note: '' })
    addToast('票据已归档')
  }

  const handleOcrFile = async (file) => {
    if (!file) return
    setOcrBusy(true)
    setOcrProgress('图片增强中，准备本地 OCR 插件')
    try {
      setOcrProgress('PaddleOCR 中文识别中')
      const result = await recognizeBudgetImage(file)
      const text = normalizeOcrText(result.text)
      let rows = parseBudgetOcrResult({ ...result, text })
      const lowQuality = isProbablyLowQualityOcr(text, rows)
      if (lowQuality) {
        rows = []
      }
      if (text.trim()) setManualBudgetText(text)
      setOcrRows(rows)
      if (lowQuality) {
        addToast('PaddleOCR 已读取图片，但未解析出预算金额，可在下方手动修正后导入', 'warning')
      } else {
        addToast(`PaddleOCR 识别到 ${rows.length} 条预算项`, 'success')
      }
    } catch (error) {
      setOcrProgress('识别失败')
      addToast(`本地 OCR 插件识别失败：${error.message}，可先手动录入预算`, 'warning')
    } finally {
      setOcrBusy(false)
    }
  }

  const handleBudgetDocumentFile = async (file) => {
    if (!file) return
    setOcrBusy(true)
    setOcrProgress('读取表格文档中')
    try {
      const result = await parseBudgetDocumentFile(file)
      setManualBudgetText(result.text || '')
      setOcrRows(result.rows)
      if (result.rows.length) {
        addToast(`${result.label}识别到 ${result.rows.length} 条预算项`, 'success')
      } else {
        addToast(`${result.label}未识别到预算金额，可在下方手动修正后导入`, 'warning')
      }
    } catch (error) {
      addToast(`文档识别失败：${error.message}`, 'warning')
    } finally {
      setOcrBusy(false)
    }
  }

  const parseManualBudgetText = () => {
    const rows = parseBudgetText(manualBudgetText)
    setOcrRows(rows)
    if (rows.length) {
      addToast(`手动录入解析到 ${rows.length} 条预算项`, 'success')
    } else {
      addToast('手动内容未识别到金额，请按“项目名称 金额”每行一项录入', 'warning')
    }
  }

  const importBudgetRows = () => {
    if (!ensureCanEdit('导入预算')) return
    if (!ocrProject || !ocrRows.length) {
      addToast('请选择项目并保留至少一条预算项', 'warning')
      return
    }
    mutateData((current) => ({
      ...current,
      customers: current.customers.map((customer) => {
        if (customer.projectNo !== ocrProject) return customer
        const merged = [...customer.budget]
        ocrRows.forEach((row) => {
          const nextRow = {
            ...row,
            category: normalizeBudgetCategory(row.category),
            budgetAmount: Number(row.budgetAmount),
            source: '原始预算',
          }
          const index = merged.findIndex((item) => item.category === nextRow.category && item.item === nextRow.item)
          if (index >= 0) merged[index] = { ...merged[index], budgetAmount: nextRow.budgetAmount }
          else merged.push({ ...nextRow, id: uid('b') })
        })
        return applyBudgetChange(customer, merged, { preserveInitialImport: true })
      }),
    }))
    addToast('预算已录入客户档案')
  }

  const handlePasswordChange = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const oldPassword = form.get('oldPassword')
    const newPassword = form.get('newPassword')
    const confirmPassword = form.get('confirmPassword')
    if (encodePassword(oldPassword) !== account.password) {
      addToast('原密码不正确', 'warning')
      return
    }
    if (!newPassword || newPassword.length < 6 || newPassword !== confirmPassword) {
      addToast('新密码至少 6 位且两次输入一致', 'warning')
      return
    }
    const next = { ...account, password: encodePassword(newPassword) }
    setAccount(next)
    setAccounts((items) => items.map((item) => (item.id === next.id ? next : item)))
    setPasswordModal(false)
    addToast('经销商密码已修改')
  }

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify({ account, accounts, data }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `三峰整装财务备份_${today()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const deleteAccount = (accountId) => {
    const target = accounts.find((item) => item.id === accountId)
    if (!target || target.dealerCode !== account.dealerCode) return
    if (!canDeleteAccounts) {
      addToast('只有经销商账号可以删除同代码下的账户', 'warning')
      return
    }
    const remainingAccounts = accounts.filter((item) => item.id !== accountId)
    if (target.role === '经销商') {
      removeDealerData(target.dealerCode)
      if (target.dealerCode === account.dealerCode) {
        const emptyData = normalizeData(createEmptyData())
        setData(emptyData)
        resetWorkspaceState(emptyData)
      }
    }
    setAccounts(remainingAccounts)
    if (target.id === account.id) {
      sessionStorage.removeItem(SESSION_KEY)
      setAccount(remainingAccounts[0] || fallbackAccount())
      setIsAuthed(false)
      return
    }
    addToast(`${target.displayName}账户已删除`)
  }

  const renderHeader = () => {
    const currentNav = navItems.find((item) => item.id === active)
    return (
      <header className="topbar">
        <div>
          <span>{currentNav?.label}</span>
          <h1>客户整装财务收支管理</h1>
        </div>
        <div className="topbar-actions">
          <select value={selectedProject} onChange={(event) => setSelectedProject(event.target.value)}>
            {data.customers.map((customer) => (
              <option key={customer.id} value={customer.projectNo}>
                {projectLabel(customer)}
              </option>
            ))}
          </select>
          <button className="secondary-btn topbar-password-btn" type="button" onClick={() => setPasswordModal(true)}>
            <LockKeyhole size={16} />
            <span>改密</span>
          </button>
          <button className="icon-btn" type="button" onClick={handleLogout} aria-label="退出登录">
            <LogOut size={18} />
          </button>
        </div>
      </header>
    )
  }

  const renderDashboard = () => (
    <div className="screen">
      <section className="stats-grid">
        <StatCard title="本月收入" value={money(dashboardStats.income)} meta="已到账口径" icon={TrendingUp} />
        <StatCard title="本月支出" value={money(dashboardStats.expense)} meta="项目支出合计" icon={CircleDollarSign} tone="blue" />
        <StatCard title="预算超支预警" value={`${dashboardStats.alertCount} 项`} meta="单笔或累计超支" icon={BellRing} tone="amber" />
        <StatCard title="待确认收款" value={money(dashboardStats.pending)} meta="待财务核销" icon={ShieldCheck} tone="red" />
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <header className="panel-header">
            <div>
              <h2>收入支出趋势</h2>
              <span>最近 6 个月</span>
            </div>
          </header>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData} margin={{ left: 8, right: 12, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="income" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#0f8f72" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#0f8f72" stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id="expense" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#d69a18" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#d69a18" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e4e8ee" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => `${Math.round(value / 10000)}万`} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => money(value)} />
              <Legend />
              <Area isAnimationActive={false} name="收入" type="monotone" dataKey="income" stroke="#0f8f72" fill="url(#income)" strokeWidth={2} />
              <Area isAnimationActive={false} name="支出" type="monotone" dataKey="expense" stroke="#d69a18" fill="url(#expense)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </article>

        <article className="panel payment-card">
          <header className="panel-header">
            <div>
              <h2>收款概览</h2>
              <span>按方式管理二维码与待确认收款</span>
            </div>
            <button className="small-upload" type="button" onClick={() => setActive('income')}>管理</button>
          </header>
          <div className="payment-overview">
            <strong>{money(dashboardStats.pending)}</strong>
            <span>待人工确认收款</span>
            <div>
              {paymentMethods.map((method) => (
                <em key={method} className={data.paymentQrs?.[method]?.dataUrl ? 'ready' : ''}>
                  {method.replace('收款码', '')}
                </em>
              ))}
            </div>
          </div>
          <button
            className="primary-btn wide"
            type="button"
            onClick={() => {
              setActive('income')
            }}
          >
            <QrCode size={17} />
            进入收款管理
          </button>
        </article>
      </section>

      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>项目经营看板</h2>
            <span>客户档案、收入、支出、利润联动</span>
          </div>
          <div className="search-box">
            <Search size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="检索项目、客户、电话" />
          </div>
        </header>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>项目编号</th>
                <th>客户名称</th>
                <th>签单总价</th>
                <th>已收款</th>
                <th>实际支出</th>
                <th>毛利</th>
                <th>收款进度</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className={customer.projectNo === selectedProject ? 'selected-row' : ''} onClick={() => setSelectedProject(customer.projectNo)}>
                  <td>{customer.projectNo}</td>
                  <td>{customer.name}</td>
                  <td>{money(customer.signingTotal)}</td>
                  <td>{money(customer.income)}</td>
                  <td>{money(customer.expense)}</td>
                  <td className={customer.grossProfit >= 0 ? 'good-text' : 'bad-text'}>{money(customer.grossProfit)}</td>
                  <td>
                    <div className="progress">
                      <span style={{ width: `${Math.min(customer.collectionRate * 100, 100)}%` }} />
                    </div>
                    <small>{percent(customer.collectionRate)}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>预算超支提醒</h2>
            <span>单笔或累计实际支出超过装修预算时提示</span>
          </div>
        </header>
        {budgetAlerts.length ? (
          <div className="alert-list">
            {budgetAlerts.slice(0, 5).map((alert) => (
              <article key={alert.id} className="alert-item">
                <AlertTriangle size={18} />
                <div>
                  <strong>{alert.projectNo} {alert.customerName}</strong>
                  <span>{alert.category} / {alert.item}：预算 {money(alert.budget)}，实际 {money(alert.actual)}，超出 {money(alert.over)}</span>
                </div>
                <em>{alert.reason}</em>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon={CheckCircle2} title="暂无超支提醒" />
        )}
      </section>
    </div>
  )

  const renderCustomers = () => (
    <div className="screen two-column">
      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>客户档案</h2>
            <span>项目编号自动生成，合同总价留档，签单总价与装修预算联动</span>
          </div>
        </header>
        <form className="form-grid" onSubmit={handleCustomerSubmit}>
          <Field label="自动项目编号">
            <input value={nextProjectNo} readOnly className="readonly-input" />
          </Field>
          <Field label="客户/项目名称">
            <input value={customerDraft.name} onChange={(event) => setCustomerDraft((draft) => ({ ...draft, name: event.target.value }))} />
          </Field>
          <Field label="联系电话">
            <input value={customerDraft.phone} onChange={(event) => setCustomerDraft((draft) => ({ ...draft, phone: event.target.value }))} />
          </Field>
          <Field label="合同总价">
            <input type="number" value={customerDraft.contractTotal} onChange={(event) => setCustomerDraft((draft) => ({ ...draft, contractTotal: event.target.value }))} />
          </Field>
          <Field label="签单总价">
            <input type="number" value={customerDraft.signingTotal} onChange={(event) => setCustomerDraft((draft) => ({ ...draft, signingTotal: event.target.value }))} />
          </Field>
          <Field label="三峰木门订单编号">
            <input value={customerDraft.woodDoorOrderNo} onChange={(event) => setCustomerDraft((draft) => ({ ...draft, woodDoorOrderNo: event.target.value }))} placeholder="M-YYYYMMDD-001" />
          </Field>
          <Field label="三峰定制订单编号">
            <input value={customerDraft.customOrderNo} onChange={(event) => setCustomerDraft((draft) => ({ ...draft, customOrderNo: event.target.value }))} placeholder="D-YYYYMMDD-001" />
          </Field>
          <Field label="项目经理">
            <select value={customerDraft.managerId} onChange={(event) => setCustomerDraft((draft) => ({ ...draft, managerId: event.target.value }))}>
              <option value="">未指定</option>
              {data.partners.filter((partner) => partner.type === '项目经理').map((partner) => (
                <option key={partner.id} value={partner.id}>{partner.name} / {partner.category}</option>
              ))}
            </select>
          </Field>
          <Field label="业务员">
            <select value={customerDraft.salespersonId} onChange={(event) => setCustomerDraft((draft) => ({ ...draft, salespersonId: event.target.value }))}>
              <option value="">未指定</option>
              {data.salespeople.map((person) => (
                <option key={person.id} value={person.id}>{person.name}</option>
              ))}
            </select>
          </Field>
          <Field label="地址">
            <input value={customerDraft.address} onChange={(event) => setCustomerDraft((draft) => ({ ...draft, address: event.target.value }))} />
          </Field>
          <Field label="状态">
            <select value={customerDraft.status} onChange={(event) => setCustomerDraft((draft) => ({ ...draft, status: event.target.value }))}>
              {projectStatusOptions.map((status) => <option key={status}>{status}</option>)}
            </select>
          </Field>
          <button className="primary-btn" type="submit" disabled={!canEdit}>
            <Plus size={17} />
            新建客户档案
          </button>
        </form>
      </section>

      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>当前项目</h2>
            <span>{selectedCustomer?.projectNo}</span>
          </div>
        </header>
        {selectedCustomer && (
          <div className="detail-stack">
            <div className="project-title">
              <strong>{selectedCustomer.name}</strong>
              <select
                className="status-select"
                value={selectedCustomer.status}
                disabled={!canEdit}
                onChange={(event) => updateCustomerPatch(selectedCustomer.projectNo, { status: event.target.value })}
              >
                {projectStatusOptions.map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>
            <dl className="detail-grid">
              <div><dt>合同总价</dt><dd>{money(selectedCustomer.contractTotal)}</dd></div>
              <div><dt>签单总价</dt><dd>{money(getSigningTotal(selectedCustomer))}</dd></div>
              <div><dt>预算合计</dt><dd>{money(getBudgetTotal(selectedCustomer.budget))}</dd></div>
              <div>
                <dt>木门订单</dt>
                <dd>
                  <input
                    className="detail-control"
                    value={selectedCustomer.woodDoorOrderNo || ''}
                    disabled={!canEdit}
                    onChange={(event) => updateCustomerPatch(selectedCustomer.projectNo, { woodDoorOrderNo: event.target.value })}
                    placeholder="未填写"
                  />
                </dd>
              </div>
              <div>
                <dt>定制订单</dt>
                <dd>
                  <input
                    className="detail-control"
                    value={selectedCustomer.customOrderNo || ''}
                    disabled={!canEdit}
                    onChange={(event) => updateCustomerPatch(selectedCustomer.projectNo, { customOrderNo: event.target.value })}
                    placeholder="未填写"
                  />
                </dd>
              </div>
              <div>
                <dt>项目经理</dt>
                <dd>
                  <select
                    className="detail-control"
                    value={selectedCustomer.managerId || ''}
                    disabled={!canEdit}
                    onChange={(event) => updateCustomerPatch(selectedCustomer.projectNo, { managerId: event.target.value })}
                  >
                    <option value="">未指定</option>
                    {data.partners.filter((partner) => partner.type === '项目经理').map((partner) => (
                      <option key={partner.id} value={partner.id}>{partner.name} / {partner.category}</option>
                    ))}
                  </select>
                </dd>
              </div>
              <div>
                <dt>业务员</dt>
                <dd>
                  <select
                    className="detail-control"
                    value={selectedCustomer.salespersonId || ''}
                    disabled={!canEdit}
                    onChange={(event) => updateCustomerPatch(selectedCustomer.projectNo, { salespersonId: event.target.value })}
                  >
                    <option value="">未指定</option>
                    {data.salespeople.map((person) => (
                      <option key={person.id} value={person.id}>{person.name}</option>
                    ))}
                  </select>
                </dd>
              </div>
            </dl>
          </div>
        )}
      </section>

      <section className="panel wide-panel budget-management-panel">
        <header className="panel-header">
          <div>
            <h2>装修预算项</h2>
            <span>预算可更改，增减后自动协同签单总价</span>
          </div>
          {selectedCustomer && <strong>{money(getSigningTotal(selectedCustomer))}</strong>}
        </header>
        {selectedCustomer ? (
          <>
            <datalist id="budget-category-options">
              {categoryOptions.map((category) => <option key={category} value={category} />)}
            </datalist>
            <form className="budget-add-form" onSubmit={addBudgetItem}>
              <input value={budgetDraft.item} onChange={(event) => setBudgetDraft((draft) => ({ ...draft, item: event.target.value }))} placeholder="预算项目名称" />
              <span className="source-pill source-custom">客户新增</span>
              <input type="number" value={budgetDraft.budgetAmount} onChange={(event) => setBudgetDraft((draft) => ({ ...draft, budgetAmount: event.target.value }))} placeholder="预算金额" />
              <button className="primary-btn" type="submit" disabled={!canEdit}>
                <Plus size={17} />
                新增预算
              </button>
            </form>
            {selectedCustomer.budget.length ? (
              <div className="budget-edit-list">
                {selectedCustomer.budget.map((item) => (
                  <div key={item.id} className="budget-edit-row">
                    <input value={item.item} onChange={(event) => updateBudgetItem(selectedCustomer.projectNo, item.id, { item: event.target.value })} />
                    <span className={`source-pill ${normalizeBudgetSource(item.source) === '客户新增' ? 'source-custom' : 'source-original'}`}>
                      {normalizeBudgetSource(item.source)}
                    </span>
                    <input type="number" value={item.budgetAmount} onChange={(event) => updateBudgetItem(selectedCustomer.projectNo, item.id, { budgetAmount: event.target.value })} />
                    <button className="icon-btn" type="button" onClick={() => removeBudgetItem(selectedCustomer.projectNo, item.id)} aria-label="删除预算项" disabled={!canEdit}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={ClipboardList} title="尚未录入装修预算" />
            )}
          </>
        ) : (
          <EmptyState icon={ClipboardList} title="请先选择客户项目" />
        )}
      </section>

      <section className="panel wide-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>项目编号</th>
                <th>名称</th>
                <th>合同总价</th>
                <th>签单总价</th>
                <th>木门订单编号</th>
                <th>定制订单编号</th>
                <th>项目经理</th>
                <th>业务员</th>
                <th>已收款</th>
                <th>支出</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {projectFinancials.map((customer) => (
                <tr key={customer.id} className={customer.projectNo === selectedProject ? 'selected-row' : ''} onClick={() => setSelectedProject(customer.projectNo)}>
                  <td>{customer.projectNo}</td>
                  <td>{customer.name}</td>
                  <td>{money(customer.contractTotal)}</td>
                  <td>{money(customer.signingTotal)}</td>
                  <td>{customer.woodDoorOrderNo || '-'}</td>
                  <td>{customer.customOrderNo || '-'}</td>
                  <td>{partnerMap.get(customer.managerId)?.name || '未指定'}</td>
                  <td>{salespersonMap.get(customer.salespersonId)?.name || '未指定'}</td>
                  <td>{money(customer.income)}</td>
                  <td>{money(customer.expense)}</td>
                  <td><span className="status-pill">{customer.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )

  const renderIncome = () => (
    <div className="screen two-column">
      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>收款管理</h2>
            <span>客户档案接入收入模块</span>
          </div>
        </header>
        <form className="form-grid" onSubmit={handleIncomeSubmit}>
          <Field label="客户项目">
            <select value={incomeDraft.projectNo} onChange={(event) => setIncomeDraft((draft) => ({ ...draft, projectNo: event.target.value }))}>
              {data.customers.map((customer) => (
                <option key={customer.id} value={customer.projectNo}>{customer.projectNo} {customer.name}</option>
              ))}
            </select>
          </Field>
          <Field label="收款日期">
            <input type="date" value={incomeDraft.date} onChange={(event) => setIncomeDraft((draft) => ({ ...draft, date: event.target.value }))} />
          </Field>
          <Field label="金额">
            <input type="number" value={incomeDraft.amount} onChange={(event) => setIncomeDraft((draft) => ({ ...draft, amount: event.target.value }))} />
          </Field>
          <Field label="收款方式">
            <select value={incomeDraft.method} onChange={(event) => setIncomeDraft((draft) => ({ ...draft, method: event.target.value }))}>
              {paymentMethods.map((method) => <option key={method}>{method}</option>)}
            </select>
          </Field>
          <Field label="付款人">
            <input value={incomeDraft.payer} onChange={(event) => setIncomeDraft((draft) => ({ ...draft, payer: event.target.value }))} />
          </Field>
          <Field label="备注">
            <input value={incomeDraft.note} onChange={(event) => setIncomeDraft((draft) => ({ ...draft, note: event.target.value }))} />
          </Field>
          <button className="primary-btn" type="submit" disabled={!canEdit}>
            <QrCode size={17} />
            确认收款并弹出收款码
          </button>
        </form>
      </section>

      <section className="panel payment-card tall">
        <header className="panel-header">
          <div>
            <h2>{incomeDraft.method}上传</h2>
            <span>{data.paymentQrs?.[incomeDraft.method]?.fileName || '未上传'}</span>
          </div>
        </header>
        <label className="upload-zone">
          {data.paymentQrs?.[incomeDraft.method]?.dataUrl ? <img src={data.paymentQrs[incomeDraft.method].dataUrl} alt={`${incomeDraft.method}收款码`} /> : <ImageUp size={44} />}
          <span>上传{incomeDraft.method}收款码</span>
          <input type="file" accept="image/*" disabled={!canEdit} onChange={(event) => handleQrUpload(event.target.files?.[0], incomeDraft.method)} />
        </label>
      </section>

      <section className="panel wide-panel">
        <header className="panel-header">
          <div>
            <h2>收款流水</h2>
            <span>{data.incomes.length} 条记录</span>
          </div>
        </header>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>日期</th>
                <th>项目</th>
                <th>付款人</th>
                <th>金额</th>
                <th>方式</th>
                <th>状态</th>
                <th>确认方式</th>
                <th>备注</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {data.incomes.map((income) => (
                <tr key={income.id}>
                  <td>{income.date}</td>
                  <td>{income.projectNo}</td>
                  <td>{income.payer}</td>
                  <td>{money(income.amount)}</td>
                  <td>{income.method}</td>
                  <td>
                    <select
                      className={income.status === '已到账' ? 'inline-status good' : 'inline-status warn'}
                      value={income.status}
                      disabled={!canEdit}
                      onChange={(event) => updateIncomeStatus(income.id, event.target.value)}
                    >
                      {incomeStatusOptions.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </td>
                  <td>{income.onlineNotice || '-'}</td>
                  <td>{income.note}</td>
                  <td>
                    {income.status !== '已到账' ? (
                      <button className="secondary-btn table-action" type="button" disabled={!canEdit} onClick={() => confirmIncomeArrival(income.id)}>
                        <CheckCircle2 size={15} />
                        确认到账
                      </button>
                    ) : (
                      <span className="muted-text">{income.confirmedAt || '已核销'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )

  const renderExpense = () => {
    const partners = data.partners.filter((partner) => partner.type === expenseDraft.payeeType)
    const expenseCustomer = data.customers.find((customer) => customer.projectNo === expenseDraft.projectNo)
    const expenseBudgetOptions = budgetOptionsForCustomer(expenseCustomer)
    return (
      <div className="screen">
        <section className="panel">
          <header className="panel-header">
            <div>
              <h2>支出管理</h2>
              <span>日期、金额、用途与工程人员档案联动</span>
            </div>
          </header>
          <form className="form-grid compact-form" onSubmit={handleExpenseSubmit}>
            <Field label="客户项目">
              <select value={expenseDraft.projectNo} onChange={(event) => setExpenseDraft((draft) => ({ ...draft, projectNo: event.target.value }))}>
                {data.customers.map((customer) => (
                  <option key={customer.id} value={customer.projectNo}>{customer.projectNo} {customer.name}</option>
                ))}
              </select>
            </Field>
            <Field label="支出日期">
              <input type="date" value={expenseDraft.date} onChange={(event) => setExpenseDraft((draft) => ({ ...draft, date: event.target.value }))} />
            </Field>
            <Field label="金额">
              <input type="number" value={expenseDraft.amount} onChange={(event) => setExpenseDraft((draft) => ({ ...draft, amount: event.target.value }))} />
            </Field>
            <Field label="预算内容">
              <select
                value={expenseDraft.budgetId}
                onChange={(event) => {
                  const option = expenseBudgetOptions.find((item) => item.value === event.target.value)
                  setExpenseDraft((draft) => ({
                    ...draft,
                    budgetId: event.target.value,
                    category: option?.category || '其他',
                    purpose: draft.purpose || option?.item || '',
                  }))
                }}
              >
                {expenseBudgetOptions.length ? (
                  expenseBudgetOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)
                ) : (
                  <option value="">请先在客户档案录入预算</option>
                )}
              </select>
            </Field>
            <Field label="用途">
              <input value={expenseDraft.purpose} onChange={(event) => setExpenseDraft((draft) => ({ ...draft, purpose: event.target.value }))} />
            </Field>
            <Field label="收款对象">
              <select value={expenseDraft.payeeType} onChange={(event) => setExpenseDraft((draft) => ({ ...draft, payeeType: event.target.value, partnerId: '' }))}>
                {partnerTypeOptions.map((type) => <option key={type}>{type}</option>)}
              </select>
            </Field>
            <Field label="档案">
              <select value={expenseDraft.partnerId} onChange={(event) => setExpenseDraft((draft) => ({ ...draft, partnerId: event.target.value }))}>
                <option value="">未选择</option>
                {partners.map((partner) => (
                  <option key={partner.id} value={partner.id}>{partner.name} / {partner.category}</option>
                ))}
              </select>
            </Field>
            <Field label="备注">
              <input value={expenseDraft.note} onChange={(event) => setExpenseDraft((draft) => ({ ...draft, note: event.target.value }))} />
            </Field>
          <button className="primary-btn" type="submit" disabled={!canEdit}>
            <Save size={17} />
            保存支出
          </button>
          </form>
        </section>

        <section className="panel">
          <header className="panel-header">
            <div>
              <h2>支出流水</h2>
              <span>新增支出会自动检查预算</span>
            </div>
          </header>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>日期</th>
                  <th>项目</th>
                  <th>预算内容</th>
                  <th>用途</th>
                  <th>收款对象</th>
                  <th>金额</th>
                  <th>备注</th>
                </tr>
              </thead>
              <tbody>
                {data.expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.date}</td>
                    <td>{expense.projectNo}</td>
                    <td>{expense.budgetItem || '-'}</td>
                    <td>{expense.purpose}</td>
                    <td>{partnerMap.get(expense.partnerId)?.name || expense.payeeType}</td>
                    <td>{money(expense.amount)}</td>
                    <td>{expense.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    )
  }

  const renderPartners = () => (
    <div className="screen two-column partners-screen">
      <section className="panel partners-form-panel">
        <header className="panel-header">
          <div>
            <h2>工程人员</h2>
            <span>项目经理、施工人员、供货商统一管理</span>
          </div>
        </header>
        <form className="form-grid" onSubmit={handlePartnerSubmit}>
          <Field label="类型">
            <select value={partnerDraft.type} onChange={(event) => setPartnerDraft((draft) => ({ ...draft, type: event.target.value }))}>
              {partnerTypeOptions.map((type) => <option key={type}>{type}</option>)}
            </select>
          </Field>
          <Field label="工种">
            <select value={partnerDraft.category} onChange={(event) => setPartnerDraft((draft) => ({ ...draft, category: event.target.value }))}>
              {partnerWorkOptions.map((work) => <option key={work}>{work}</option>)}
            </select>
          </Field>
          <Field label="名称">
            <input value={partnerDraft.name} onChange={(event) => setPartnerDraft((draft) => ({ ...draft, name: event.target.value }))} />
          </Field>
          <Field label="电话">
            <input value={partnerDraft.phone} onChange={(event) => setPartnerDraft((draft) => ({ ...draft, phone: event.target.value }))} />
          </Field>
          <Field label="账户">
            <input value={partnerDraft.account} onChange={(event) => setPartnerDraft((draft) => ({ ...draft, account: event.target.value }))} />
          </Field>
          <Field label="备注">
            <input value={partnerDraft.note} onChange={(event) => setPartnerDraft((draft) => ({ ...draft, note: event.target.value }))} />
          </Field>
          <button className="primary-btn" type="submit" disabled={!canEdit}>
            <Plus size={17} />
            {editingPartnerId ? '更新档案' : '保存档案'}
          </button>
          {editingPartnerId && (
            <button className="secondary-btn" type="button" onClick={cancelPartnerEdit}>
              <X size={17} />
              取消编辑
            </button>
          )}
        </form>
      </section>
      <section className="panel partners-list-panel">
        <header className="panel-header">
          <div>
            <h2>档案列表</h2>
            <span>{data.partners.length} 个工程对象</span>
          </div>
        </header>
        <div className="partner-list">
          {data.partners.map((partner) => (
            <article key={partner.id} className="partner-card">
              <div>
                <span>{partner.type}</span>
                <strong>{partner.name}</strong>
                <em>{partner.category}</em>
              </div>
              <p>{partner.phone}</p>
              <small>{partner.account}</small>
              <div className="partner-card-actions">
                <button className="secondary-btn table-action" type="button" disabled={!canEdit} onClick={() => startPartnerEdit(partner)}>
                  编辑
                </button>
                <button className="danger-btn table-action" type="button" disabled={!canEdit} onClick={() => deletePartner(partner)}>
                  删除
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )

  const renderCommission = () => (
    <div className="screen">
      <section className="stats-grid three">
        <StatCard title="应发提成" value={money(commissionRows.reduce((sum, row) => sum + row.shouldPay, 0))} meta="按已收款计算" icon={BadgeDollarSign} />
        <StatCard title="已发提成" value={money(commissionRows.reduce((sum, row) => sum + row.paid, 0))} meta="发放记录合计" icon={CheckCircle2} tone="blue" />
        <StatCard title="待发提成" value={money(commissionRows.reduce((sum, row) => sum + row.unpaid, 0))} meta="应发减已发" icon={BellRing} tone="amber" />
      </section>
      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>业务提成</h2>
            <span>客户档案绑定业务员，按已到账收款计算</span>
          </div>
        </header>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>项目</th>
                <th>客户</th>
                <th>业务员</th>
                <th>已收款</th>
                <th>提成比例</th>
                <th>应发</th>
                <th>已发</th>
                <th>待发</th>
              </tr>
            </thead>
            <tbody>
              {commissionRows.map((row) => (
                <tr key={row.projectNo}>
                  <td>{row.projectNo}</td>
                  <td>{row.projectName}</td>
                  <td>{row.salesperson}</td>
                  <td>{money(row.collected)}</td>
                  <td>{percent(row.rate)}</td>
                  <td>{money(row.shouldPay)}</td>
                  <td>{money(row.paid)}</td>
                  <td className={row.unpaid > 0 ? 'bad-text' : 'good-text'}>{money(row.unpaid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel two-form-panel commission-action-panel">
        <form className="form-grid compact-form" onSubmit={handleCommissionPay}>
          <Field label="发放项目">
            <select value={commissionDraft.projectNo} onChange={(event) => setCommissionDraft((draft) => ({ ...draft, projectNo: event.target.value }))}>
              {data.customers.map((customer) => <option key={customer.id}>{customer.projectNo}</option>)}
            </select>
          </Field>
          <Field label="日期">
            <input type="date" value={commissionDraft.date} onChange={(event) => setCommissionDraft((draft) => ({ ...draft, date: event.target.value }))} />
          </Field>
          <Field label="金额">
            <input type="number" value={commissionDraft.amount} onChange={(event) => setCommissionDraft((draft) => ({ ...draft, amount: event.target.value }))} />
          </Field>
          <Field label="备注">
            <input value={commissionDraft.note} onChange={(event) => setCommissionDraft((draft) => ({ ...draft, note: event.target.value }))} />
          </Field>
          <button className="primary-btn" type="submit" disabled={!canEdit}>
            <HandCoins size={17} />
            记录发放
          </button>
        </form>
        <form className="form-grid compact-form sales-entry-form" onSubmit={handleSalesSubmit}>
          <Field label="业务员姓名">
            <input value={salesDraft.name} onChange={(event) => setSalesDraft((draft) => ({ ...draft, name: event.target.value }))} />
          </Field>
          <Field label="电话">
            <input value={salesDraft.phone} onChange={(event) => setSalesDraft((draft) => ({ ...draft, phone: event.target.value }))} />
          </Field>
          <Field label="提成比例 %">
            <input type="number" value={salesDraft.commissionRate} onChange={(event) => setSalesDraft((draft) => ({ ...draft, commissionRate: event.target.value }))} />
          </Field>
          <button className="secondary-btn" type="submit" disabled={!canEdit}>
            <Plus size={17} />
            添加业务员
          </button>
        </form>
      </section>
      <section className="panel salesperson-list-panel">
        <header className="panel-header">
          <div>
            <h2>业务员列表</h2>
            <span>{data.salespeople.length} 名业务员</span>
          </div>
        </header>
        <div className="salesperson-list">
          {data.salespeople.map((person) => (
            <article key={person.id} className="salesperson-card">
              <div>
                <strong>{person.name}</strong>
                <span>{percent(person.commissionRate)}</span>
              </div>
              <p>{person.phone || '未填写电话'}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )

  const renderBudget = () => (
    <div className="screen two-column">
      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>装修预算识别导入</h2>
            <span>支持表格图片、Word 和 Excel</span>
          </div>
        </header>
        <div className="ocr-controls">
          <Field label="录入项目">
            <select value={ocrProject} onChange={(event) => setOcrProject(event.target.value)}>
              {data.customers.map((customer) => (
                <option key={customer.id} value={customer.projectNo}>{customer.projectNo} {customer.name}</option>
              ))}
            </select>
          </Field>
          <div className="import-grid">
            <label className="upload-zone ocr-zone">
              <ImageUp size={38} />
              <strong>表格图片识别</strong>
              <span>{ocrBusy ? ocrProgress : '上传预算清单照片，按表格坐标提取项目和金额'}</span>
              <input type="file" accept="image/*" disabled={ocrBusy} onChange={(event) => handleOcrFile(event.target.files?.[0])} />
            </label>
            <label className="upload-zone ocr-zone document-zone">
              <FileText size={38} />
              <strong>Word / Excel 识别</strong>
              <span>{ocrBusy ? ocrProgress : '上传 .docx、.xlsx、.xls、.csv 预算表'}</span>
              <input type="file" accept=".docx,.xlsx,.xls,.csv,.tsv" disabled={ocrBusy} onChange={(event) => handleBudgetDocumentFile(event.target.files?.[0])} />
            </label>
          </div>
          <Field label="手动录入预算">
            <textarea
              className="manual-budget-textarea"
              value={manualBudgetText}
              onChange={(event) => setManualBudgetText(event.target.value)}
              placeholder="图片识别不了时，在这里手动输入：项目名称 金额，每行一项"
            />
          </Field>
          <div className="button-row">
            <button className="secondary-btn" type="button" onClick={parseManualBudgetText}>
              <RefreshCcw size={17} />
              解析手动内容
            </button>
            <button className="primary-btn" type="button" onClick={importBudgetRows} disabled={!canEdit}>
              <Save size={17} />
              导入预算
            </button>
          </div>
        </div>
      </section>
      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>识别结果</h2>
            <span>{ocrRows.length} 条预算项</span>
          </div>
        </header>
        {ocrRows.length ? (
          <div className="budget-editor">
            {ocrRows.map((row, index) => (
              <div key={row.id} className="budget-row">
                <input value={row.item} onChange={(event) => setOcrRows((rows) => rows.map((item, rowIndex) => rowIndex === index ? { ...item, item: event.target.value } : item))} />
                <input type="number" value={row.budgetAmount} onChange={(event) => setOcrRows((rows) => rows.map((item, rowIndex) => rowIndex === index ? { ...item, budgetAmount: Number(event.target.value) } : item))} />
                <button className="icon-btn" type="button" onClick={() => setOcrRows((rows) => rows.filter((_, rowIndex) => rowIndex !== index))} aria-label="删除预算项">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={ClipboardList} title="暂无识别结果" />
        )}
      </section>
      <section className="panel wide-panel">
        <header className="panel-header">
          <div>
            <h2>超支预警明细</h2>
            <span>实际支出超过预算时自动出现</span>
          </div>
        </header>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>项目编号</th>
                <th>客户名称</th>
                <th>预算项</th>
                <th>预算</th>
                <th>实际支出</th>
                <th>超支</th>
                <th>类型</th>
              </tr>
            </thead>
            <tbody>
              {budgetAlerts.map((alert) => (
                <tr key={alert.id}>
                  <td>{alert.projectNo}</td>
                  <td>{alert.customerName}</td>
                  <td>{alert.category} / {alert.item}</td>
                  <td>{money(alert.budget)}</td>
                  <td>{money(alert.actual)}</td>
                  <td className="bad-text">{money(alert.over)}</td>
                  <td>{alert.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!budgetAlerts.length && <EmptyState icon={CheckCircle2} title="暂无预算超支" />}
        </div>
      </section>
    </div>
  )

  const renderTickets = () => (
    <div className="screen two-column">
      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>票据上传归档</h2>
            <span>按项目检索收据、发票、合同和预算图片</span>
          </div>
        </header>
        <form className="form-grid" onSubmit={handleTicketSubmit}>
          <Field label="项目">
            <select value={ticketDraft.projectNo} onChange={(event) => setTicketDraft((draft) => ({ ...draft, projectNo: event.target.value }))}>
              {data.customers.map((customer) => (
                <option key={customer.id} value={customer.projectNo}>{projectLabel(customer)}</option>
              ))}
            </select>
          </Field>
          <Field label="类型">
            <select value={ticketDraft.type} onChange={(event) => setTicketDraft((draft) => ({ ...draft, type: event.target.value }))}>
              {ticketTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </Field>
          <Field label="标题">
            <input value={ticketDraft.title} onChange={(event) => setTicketDraft((draft) => ({ ...draft, title: event.target.value }))} />
          </Field>
          <Field label="日期">
            <input type="date" value={ticketDraft.date} onChange={(event) => setTicketDraft((draft) => ({ ...draft, date: event.target.value }))} />
          </Field>
          <Field label="金额">
            <input type="number" value={ticketDraft.amount} onChange={(event) => setTicketDraft((draft) => ({ ...draft, amount: event.target.value }))} />
          </Field>
          <Field label="备注">
            <input value={ticketDraft.note} onChange={(event) => setTicketDraft((draft) => ({ ...draft, note: event.target.value }))} />
          </Field>
          <label className="upload-zone inline-upload">
            <FileText size={28} />
            <span>{ticketDraft.fileName || '上传票据文件'}</span>
            <input type="file" accept="image/*,.pdf" disabled={!canEdit} onChange={(event) => handleTicketFile(event.target.files?.[0])} />
          </label>
          <button className="primary-btn" type="submit" disabled={!canEdit}>
            <Archive size={17} />
            归档票据
          </button>
        </form>
      </section>
      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>票据检索</h2>
            <span>{filteredTickets.length} 条结果</span>
          </div>
          <div className="search-box">
            <Search size={16} />
            <input value={ticketQuery} onChange={(event) => setTicketQuery(event.target.value)} placeholder="项目编号、标题、文件名" />
          </div>
        </header>
        <div className="ticket-list">
          {filteredTickets.map((ticket) => (
            <article key={ticket.id} className="ticket-card">
              <div>
                <FileText size={20} />
                <strong>{ticket.title}</strong>
                <span>{projectLabel(data.customers.find((customer) => customer.projectNo === ticket.projectNo)) || ticket.projectNo} / {ticket.type}</span>
              </div>
              <p>{ticket.fileName || '无电子件'} · {money(ticket.amount)} · {ticket.date}</p>
              {ticket.dataUrl && (
                <a className="secondary-btn file-link" href={ticket.dataUrl} download={ticket.fileName}>
                  <Download size={16} />
                  下载
                </a>
              )}
            </article>
          ))}
          {!filteredTickets.length && <EmptyState icon={Archive} title="没有匹配票据" />}
        </div>
      </section>
    </div>
  )

  const renderReports = () => (
    <div className="screen">
      <section className="stats-grid three">
        <StatCard title="签单总额" value={money(data.customers.reduce((sum, customer) => sum + getSigningTotal(customer), 0))} meta="客户档案合计" icon={Building2} />
        <StatCard title="累计收入" value={money(data.incomes.filter((income) => income.status === '已到账').reduce((sum, income) => sum + income.amount, 0))} meta="已到账" icon={TrendingUp} tone="blue" />
        <StatCard title="累计支出" value={money(data.expenses.reduce((sum, expense) => sum + expense.amount, 0))} meta="全部项目" icon={CircleDollarSign} tone="amber" />
      </section>
      <section className="dashboard-grid reports">
        <article className="panel chart-panel">
          <header className="panel-header">
            <div>
              <h2>项目利润对比</h2>
              <span>已收款减实际支出</span>
            </div>
          </header>
          <ResponsiveContainer width="100%" height={310}>
            <BarChart data={projectFinancials} margin={{ left: 8, right: 18, top: 10, bottom: 0 }}>
              <CartesianGrid stroke="#e4e8ee" vertical={false} />
              <XAxis dataKey="projectNo" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => `${Math.round(value / 10000)}万`} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => money(value)} />
              <Legend />
              <Bar isAnimationActive={false} name="收入" dataKey="income" fill="#0f8f72" radius={[4, 4, 0, 0]} />
              <Bar isAnimationActive={false} name="支出" dataKey="expense" fill="#d69a18" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
        <article className="panel chart-panel">
          <header className="panel-header">
            <div>
              <h2>支出结构</h2>
              <span>按预算项分类</span>
            </div>
          </header>
          <ResponsiveContainer width="100%" height={310}>
            <PieChart>
              <Pie isAnimationActive={false} data={expenseByCategory} dataKey="value" nameKey="category" innerRadius={62} outerRadius={105} paddingAngle={3}>
                {expenseByCategory.map((entry, index) => <Cell key={entry.category} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => money(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </section>
    </div>
  )

  const renderSettings = () => (
    <div className="screen two-column">
      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>经销商代码设置</h2>
            <span>{account.username} / {account.displayName} / {account.role}</span>
          </div>
        </header>
        <div className="settings-list">
          <button className="secondary-btn" type="button" onClick={() => setPasswordModal(true)}>
            <LockKeyhole size={17} />
            修改经销商密码
          </button>
          <button className="secondary-btn" type="button" onClick={exportBackup}>
            <Download size={17} />
            导出数据备份
          </button>
        </div>
      </section>
      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>同代码账户</h2>
            <span>{account.dealerCode} 下共 {sameDealerAccounts.length} 个账户</span>
          </div>
        </header>
        <div className="account-list">
          {sameDealerAccounts.map((item) => (
            <article key={item.id} className="account-card">
              <div>
                <strong>{item.displayName}</strong>
                <span>{item.username}</span>
              </div>
              <em>{item.role}</em>
              <button
                className="danger-btn"
                type="button"
                disabled={!canDeleteAccounts}
                onClick={() => deleteAccount(item.id)}
              >
                <Trash2 size={16} />
                删除
              </button>
            </article>
          ))}
        </div>
      </section>
      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>本地数据</h2>
          </div>
        </header>
        <dl className="detail-grid">
          <div><dt>客户项目</dt><dd>{data.customers.length}</dd></div>
          <div><dt>收款流水</dt><dd>{data.incomes.length}</dd></div>
          <div><dt>支出流水</dt><dd>{data.expenses.length}</dd></div>
          <div><dt>票据归档</dt><dd>{data.tickets.length}</dd></div>
        </dl>
      </section>
    </div>
  )

  const renderActive = () => {
    if (active === 'customers') return renderCustomers()
    if (active === 'income') return renderIncome()
    if (active === 'expense') return renderExpense()
    if (active === 'partners') return renderPartners()
    if (active === 'commission') return renderCommission()
    if (active === 'budget') return renderBudget()
    if (active === 'tickets') return renderTickets()
    if (active === 'reports') return renderReports()
    if (active === 'settings') return renderSettings()
    return renderDashboard()
  }

  if (!isAuthed) {
    return (
      <LoginScreen
        accounts={accounts}
        account={account}
        onLogin={handleLogin}
        onRegister={handleRegisterAccount}
        onResetPassword={handleLoginPasswordReset}
      />
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <SanfengLogo />
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button key={item.id} className={active === item.id ? 'active' : ''} type="button" onClick={() => setActive(item.id)}>
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="sidebar-footer">
          <span>当前经销商代码</span>
          <strong>{account.username}</strong>
        </div>
      </aside>
      <main className="workspace">
        {renderHeader()}
        {renderActive()}
      </main>
      <ToastStack toasts={toasts} removeToast={removeToast} />
      {paymentSession && (
        <Modal title="收款码确认" onClose={() => setPaymentSession(null)}>
          <div className="payment-session">
            <div className="payment-session-summary">
              <strong>{paymentSession.projectNo}</strong>
              <span>{paymentSession.payer || '客户'} / {paymentSession.method}</span>
              <b>{money(paymentSession.amount)}</b>
            </div>
            <div className="qr-box modal-qr">
              {data.paymentQrs?.[paymentSession.method]?.dataUrl ? <img src={data.paymentQrs[paymentSession.method].dataUrl} alt={`${paymentSession.method}收款码`} /> : <QrCode size={92} />}
            </div>
            <div className={paymentStatus.includes('到账') ? 'payment-status success' : 'payment-status'}>
              <BellRing size={17} />
              <span>{paymentStatus || '正在准备收款网络...'}</span>
            </div>
            <div className="button-row end">
              <button className="secondary-btn" type="button" disabled={!canEdit} onClick={() => confirmIncomeArrival(paymentSession.rowId)}>
                <CheckCircle2 size={17} />
                手动确认到账
              </button>
              <button className="primary-btn" type="button" onClick={() => setPaymentSession(null)}>
                完成
              </button>
            </div>
          </div>
        </Modal>
      )}
      {passwordModal && (
        <Modal title="修改经销商密码" onClose={() => setPasswordModal(false)}>
          <form className="modal-form" onSubmit={handlePasswordChange}>
            <Field label="原密码">
              <input name="oldPassword" type="password" autoComplete="current-password" />
            </Field>
            <Field label="新密码">
              <input name="newPassword" type="password" autoComplete="new-password" />
            </Field>
            <Field label="确认新密码">
              <input name="confirmPassword" type="password" autoComplete="new-password" />
            </Field>
            <div className="button-row end">
              <button className="secondary-btn" type="button" onClick={() => setPasswordModal(false)}>取消</button>
              <button className="primary-btn" type="submit">
                <Save size={17} />
                保存密码
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default App
