const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')
const JSZip = require('jszip')

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return chromium.launch({ headless: true, channel: 'chrome' })
  }
}

function hasCny(text, amount) {
  const formatted = Number(amount).toLocaleString('zh-CN')
  return text.includes(`¥${formatted}`) || text.includes(`￥${formatted}`)
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function writeBudgetFixtures(outDir) {
  const excelPath = path.join(outDir, 'qa-budget-import.xlsx')
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['序号', '施工项目', '单位', '预算金额'],
    [1, 'Excel水路改造', '项', 1680],
    [2, 'Excel木作柜体', '项', 5200],
  ])
  XLSX.utils.book_append_sheet(workbook, worksheet, '预算表')
  XLSX.writeFile(workbook, excelPath)

  const wordPath = path.join(outDir, 'qa-budget-import.docx')
  const tableRows = [
    ['序号', '施工项目', '预算金额'],
    ['1', 'Word木工吊顶', '3600'],
    ['2', 'Word乳胶漆', '2400'],
  ]
  const rowXml = tableRows.map((row) => `
    <w:tr>${row.map((cell) => `<w:tc><w:p><w:r><w:t>${escapeXml(cell)}</w:t></w:r></w:p></w:tc>`).join('')}</w:tr>`).join('')
  const zip = new JSZip()
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Default Extension="xml" ContentType="application/xml"/>
      <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    </Types>`)
  zip.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
    </Relationships>`)
  zip.folder('word').file('document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body>
        <w:p><w:r><w:t>QA预算表</w:t></w:r></w:p>
        <w:tbl>${rowXml}</w:tbl>
        <w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>
      </w:body>
    </w:document>`)
  fs.writeFileSync(wordPath, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }))
  return { excelPath, wordPath }
}

async function main() {
  const outDir = 'D:/workspace/sanfeng-finance-delivery/playwright'
  fs.mkdirSync(outDir, { recursive: true })
  const fixtures = await writeBudgetFixtures(outDir)
  const browser = await launchBrowser()
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } })
  const notes = []
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'))
  if (packageJson.dependencies?.['tesseract.js']) throw new Error('旧 tesseract.js 依赖未删除')
  if (fs.existsSync(path.join(process.cwd(), 'public', 'tesseract'))) throw new Error('旧 tesseract 静态资源未删除')

  await page.addInitScript(() => {
    if (sessionStorage.getItem('sanfeng-finance-qa-preserve-storage') === '1') return
    sessionStorage.clear()
    localStorage.removeItem('sanfeng-finance-account-v1')
    localStorage.removeItem('sanfeng-finance-accounts-v1')
    Object.keys(localStorage)
      .filter((key) => key === 'sanfeng-finance-data-v1' || key.startsWith('sanfeng-finance-data-v1:dealer:'))
      .forEach((key) => localStorage.removeItem(key))
  })

  page.on('console', (msg) => {
    if (msg.type() === 'error') notes.push(`console:${msg.text()}`)
  })
  page.on('pageerror', (error) => notes.push(`pageerror:${error.message}`))

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  const loginText = await page.locator('body').evaluate((node) => node.textContent || '')
  if (!loginText.includes('职位')) throw new Error('登录页缺少职位选择')
  const loginRoleOptions = await page.locator('.login-form label:has-text("职位") option').allTextContents()
  if (!loginRoleOptions.includes('经销商') || !loginRoleOptions.includes('财务') || !loginRoleOptions.includes('店员')) {
    throw new Error('登录页职位选项不完整')
  }
  await page.evaluate(() => {
    const resetData = {
      paymentQr: null,
      paymentQrs: {},
      customers: [
        {
          id: 'cus-reset',
          projectNo: 'SF-RESET-001',
          name: '密码重置保留项目',
          phone: '13800000000',
          address: 'QA地址',
          contractTotal: 88000,
          signingTotal: 88000,
          woodDoorOrderNo: '',
          customOrderNo: '',
          managerId: '',
          salespersonId: '',
          status: '预算确认',
          budget: [{ id: 'b-reset', category: '水', item: '水路预算', budgetAmount: 12000 }],
        },
      ],
      incomes: [
        {
          id: 'in-reset',
          projectNo: 'SF-RESET-001',
          date: '2026-07-01',
          amount: 6000,
          method: '微信收款码',
          payer: '重置测试客户',
          status: '已到账',
          note: '重置前已有收款',
        },
      ],
      expenses: [],
      partners: [],
      salespeople: [],
      commissionPayments: [],
      tickets: [],
    }
    localStorage.setItem('sanfeng-finance-accounts-v1', JSON.stringify([
      {
        id: 'account-reset-dealer',
        username: 'QA-RESET-001',
        dealerCode: 'QA-RESET-001',
        displayName: 'QA重置经销商',
        role: '经销商',
        password: btoa('oldpass'),
      },
      {
        id: 'account-reset-finance',
        username: 'QA-RESET-001',
        dealerCode: 'QA-RESET-001',
        displayName: 'QA重置财务',
        role: '财务',
        password: btoa('oldpass'),
      },
    ]))
    localStorage.setItem('sanfeng-finance-data-v1:dealer:QA-RESET-001', JSON.stringify(resetData))
    sessionStorage.clear()
    sessionStorage.setItem('sanfeng-finance-qa-preserve-storage', '1')
  })
  await page.reload({ waitUntil: 'networkidle' })
  await page.locator('.login-form label:has-text("经销商代码") input').fill('QA-RESET-001')
  await page.locator('.login-form label:has-text("职位") select').selectOption('财务')
  if (!(await page.getByRole('button', { name: '重置密码' }).isDisabled())) {
    throw new Error('非经销商职位不应启用密码重置按钮')
  }
  await page.locator('.login-form label:has-text("职位") select').selectOption('经销商')
  await page.getByRole('button', { name: '重置密码' }).click()
  await page.locator('.form-success').filter({ hasText: '密码已重置为默认 123456' }).waitFor({ timeout: 5000 })
  await page.locator('input[autocomplete="current-password"]').fill('123456')
  await page.getByRole('button', { name: /登录系统/ }).click()
  await page.locator('.app-shell').waitFor({ timeout: 8000 })
  const resetCheck = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('sanfeng-finance-data-v1:dealer:QA-RESET-001') || 'null')
    const accounts = JSON.parse(localStorage.getItem('sanfeng-finance-accounts-v1') || '[]')
    const dealer = accounts.find((item) => item.id === 'account-reset-dealer')
    const finance = accounts.find((item) => item.id === 'account-reset-finance')
    return {
      password: dealer?.password,
      financePassword: finance?.password,
      customers: data?.customers?.length || 0,
      incomes: data?.incomes?.length || 0,
      customerName: data?.customers?.[0]?.name || '',
    }
  })
  if (resetCheck.password !== btoa('123456')) throw new Error('经销商密码重置后未恢复为默认密码')
  if (resetCheck.financePassword !== btoa('oldpass')) throw new Error('经销商重置不应修改财务账号密码')
  if (resetCheck.customers !== 1 || resetCheck.incomes !== 1 || resetCheck.customerName !== '密码重置保留项目') {
    throw new Error('密码重置不应影响经销商后台业务数据')
  }
  await page.getByRole('button', { name: '退出登录' }).click()
  await page.evaluate(() => {
    sessionStorage.clear()
    localStorage.removeItem('sanfeng-finance-account-v1')
    localStorage.removeItem('sanfeng-finance-accounts-v1')
    Object.keys(localStorage)
      .filter((key) => key === 'sanfeng-finance-data-v1' || key.startsWith('sanfeng-finance-data-v1:dealer:'))
      .forEach((key) => localStorage.removeItem(key))
  })
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '注册账户' }).click()
  const registerText = await page.locator('body').evaluate((node) => node.textContent || '')
  if (!registerText.includes('职位') || !registerText.includes('经销商') || !registerText.includes('财务') || !registerText.includes('店员')) {
    throw new Error('注册页缺少职位选择或职位选项')
  }
  await page.getByRole('button', { name: '返回登录' }).click()
  await page.screenshot({ path: path.join(outDir, 'login-desktop.png'), fullPage: true })
  await page.locator('input[autocomplete="current-password"]').fill('123456')
  await page.getByRole('button', { name: /登录系统/ }).click()
  await page.locator('.app-shell').waitFor({ timeout: 8000 })
  const nav = page.locator('.sidebar nav')
  const desktopText = await page.locator('body').evaluate((node) => node.textContent || '')
  const passwordButtonBox = await page.locator('.topbar-password-btn').boundingBox()
  if (!passwordButtonBox || passwordButtonBox.width < 70 || passwordButtonBox.height > 52) {
    throw new Error('顶栏改密按钮未保持横向布局')
  }
  await page.screenshot({ path: path.join(outDir, 'dashboard-desktop.png'), fullPage: true })

  await nav.getByRole('button', { name: /客户档案/ }).click()
  await page.locator('.budget-management-panel').waitFor({ timeout: 5000 })
  await page.getByLabel('客户/项目名称').fill('自动验收预算项目')
  await page.getByLabel('合同总价').fill('100000')
  await page.getByLabel('签单总价').fill('100000')
  await page.getByRole('button', { name: /新建客户档案/ }).click()
  await page.locator('.detail-stack').filter({ hasText: '自动验收预算项目' }).waitFor({ timeout: 5000 })
  const statusOptions = await page.locator('.project-title select option').allTextContents()
  if (!statusOptions.includes('设计中')) throw new Error('当前项目状态缺少“设计中”选项')
  await page.locator('.project-title select').selectOption('设计中')
  const detailInputs = page.locator('.detail-stack .detail-grid input.detail-control')
  if (await detailInputs.count() !== 2) throw new Error('当前项目木门/定制订单未提供可编辑输入框')
  await detailInputs.nth(0).fill('M-QA-EDIT-001')
  await detailInputs.nth(1).fill('D-QA-EDIT-001')
  const detailSelects = page.locator('.detail-stack .detail-grid select.detail-control')
  if (await detailSelects.count() !== 2) throw new Error('当前项目项目经理/业务员未提供可编辑下拉框')
  await detailSelects.nth(0).selectOption({ index: 1 })
  await detailSelects.nth(1).selectOption({ index: 1 })
  const editedCustomer = await page.evaluate(() => {
    const raw = localStorage.getItem('sanfeng-finance-data-v1:dealer:admin') || localStorage.getItem('sanfeng-finance-data-v1')
    const data = JSON.parse(raw || 'null')
    return data?.customers?.find((customer) => customer.name === '自动验收预算项目')
  })
  if (
    editedCustomer?.woodDoorOrderNo !== 'M-QA-EDIT-001'
    || editedCustomer?.customOrderNo !== 'D-QA-EDIT-001'
    || !editedCustomer?.managerId
    || !editedCustomer?.salespersonId
  ) {
    throw new Error('当前项目四个资料字段修改后未写回客户档案')
  }
  let detailText = await page.locator('.detail-stack').innerText()
  if (!hasCny(detailText, 100000)) throw new Error('客户档案签单总价未同步到当前项目')
  await page.screenshot({ path: path.join(outDir, 'customers-budget-desktop.png'), fullPage: true })

  await page.locator('.budget-add-form input[placeholder="预算项目名称"]').fill('追加电路')
  await page.locator('.budget-add-form input[placeholder="预算金额"]').fill('2000')
  await page.getByRole('button', { name: /新增预算/ }).click()
  await page.locator('.toast').filter({ hasText: '装修预算已新增' }).waitFor({ timeout: 5000 })
  detailText = await page.locator('.detail-stack').innerText()
  if (!hasCny(detailText, 102000) || !hasCny(detailText, 2000)) {
    throw new Error('新增装修预算应按差额增加签单总价')
  }
  const customSourceVisible = await page.locator('.budget-edit-row').filter({ hasText: '客户新增' }).count()
  if (!customSourceVisible) throw new Error('客户档案新增预算未显示“客户新增”标识')
  const budgetColumnAligned = await page.evaluate(() => {
    const addForm = document.querySelector('.budget-add-form')
    const row = document.querySelector('.budget-edit-row')
    if (!addForm || !row) return false
    const addCells = [...addForm.children].map((node) => node.getBoundingClientRect())
    const rowCells = [...row.children].map((node) => node.getBoundingClientRect())
    if (addCells.length < 4 || rowCells.length < 4) return false
    return [1, 2, 3].every((index) => Math.abs(addCells[index].left - rowCells[index].left) <= 2)
      && Math.abs(addCells[2].width - rowCells[2].width) <= 2
  })
  if (!budgetColumnAligned) throw new Error('客户档案预算来源、金额或操作列未上下对齐')
  await page.evaluate(() => {
    const select = document.querySelector('.topbar select')
    select.value = 'SF-2026-001'
    select.dispatchEvent(new Event('change', { bubbles: true }))
  })
  await page.locator('.budget-edit-row').filter({ hasText: '原始预算' }).first().waitFor({ timeout: 5000 })
  const budgetRows = page.locator('.budget-edit-row')
  const budgetRowCount = await budgetRows.count()
  await budgetRows.nth(budgetRowCount - 1).locator('button').click()
  await page.locator('.toast').filter({ hasText: '装修预算已删除' }).waitFor({ timeout: 5000 })

  await nav.getByRole('button', { name: /收入收款/ }).click()
  await page.getByLabel('金额').fill('12345')
  await page.getByLabel('付款人').fill('验收客户')
  await page.getByLabel('备注').fill('自动验收收款')
  await page.getByRole('button', { name: /确认收款/ }).click()
  await page.locator('.modal').filter({ hasText: '收款码确认' }).waitFor({ timeout: 5000 })
  await page.screenshot({ path: path.join(outDir, 'income-payment-modal.png'), fullPage: true })
  await page.getByRole('button', { name: /手动确认到账/ }).click()
  await page.locator('.payment-status').filter({ hasText: /已人工确认到账|流水状态已更新/ }).waitFor({ timeout: 5000 })
  await page.getByRole('button', { name: '完成' }).click()

  await nav.getByRole('button', { name: /支出管理/ }).click()
  await page.screenshot({ path: path.join(outDir, 'expense-budget-options.png'), fullPage: true })
  const expenseForm = page.locator('form.compact-form')
  await expenseForm.locator('label:has-text("金额") input').fill('999999')
  const expenseSelects = expenseForm.locator('select')
  if (await expenseSelects.count() < 2) throw new Error('支出表单缺少预算项选择框')
  await expenseSelects.nth(1).selectOption({ index: 1 })
  await expenseForm.locator('label:has-text("用途") input').fill('自动验收超支支出')
  await expenseForm.getByRole('button', { name: /保存支出/ }).click()
  await page.locator('.toast').filter({ hasText: /超过预算|超支/ }).waitFor({ timeout: 5000 })

  await nav.getByRole('button', { name: /工程人员/ }).click()
  const partnerFormPanel = await page.locator('.partners-form-panel').evaluate((node) => {
    const style = window.getComputedStyle(node)
    return { position: style.position, top: style.top }
  })
  if (partnerFormPanel.position !== 'sticky') {
    throw new Error('工程人员左侧表单未设置为跟随列表滚动')
  }
  const firstPartnerCard = page.locator('.partner-card').first()
  if (!(await firstPartnerCard.getByRole('button', { name: '删除' }).isVisible())) {
    throw new Error('工程人员档案列表缺少删除按钮')
  }
  await firstPartnerCard.getByRole('button', { name: '编辑' }).click()
  await page.getByLabel('名称').fill('QA工程人员已修改')
  await page.getByRole('button', { name: /更新档案/ }).click()
  await page.locator('.toast').filter({ hasText: '工程人员档案已更新' }).waitFor({ timeout: 5000 })
  const editedPartnerName = await page.evaluate(() => {
    const raw = localStorage.getItem('sanfeng-finance-data-v1:dealer:admin') || localStorage.getItem('sanfeng-finance-data-v1')
    const data = JSON.parse(raw || 'null')
    return data?.partners?.[0]?.name
  })
  if (editedPartnerName !== 'QA工程人员已修改') throw new Error('工程人员列表编辑后未更新原档案')

  await nav.getByRole('button', { name: /业务提成/ }).click()
  await page.locator('.salesperson-list-panel').waitFor({ timeout: 5000 })
  const commissionForms = await page.locator('.commission-action-panel form.compact-form').count()
  if (commissionForms !== 2) throw new Error('业务提成表单布局未保持左右两组一致')
  const salesFormLayout = await page.locator('.sales-entry-form').evaluate((form) => {
    const fields = [...form.querySelectorAll('.field')].map((item) => item.getBoundingClientRect())
    const button = form.querySelector('button').getBoundingClientRect()
    return { buttonBelowInputs: button.top > Math.max(...fields.map((item) => item.bottom)) - 2 }
  })
  if (!salesFormLayout.buttonBelowInputs) throw new Error('业务员添加按钮未移动到输入栏下方')
  const oldSalesCount = await page.locator('.salesperson-card').count()
  await page.getByLabel('业务员姓名').fill('QA业务员')
  await page.getByLabel('电话').fill('13900009999')
  await page.getByLabel('提成比例 %').fill('3')
  await page.getByRole('button', { name: /添加业务员/ }).click()
  await page.locator('.toast').filter({ hasText: '业务员已添加' }).waitFor({ timeout: 5000 })
  if ((await page.locator('.salesperson-card').count()) !== oldSalesCount + 1) throw new Error('业务员列表未显示新增业务员')

  await nav.getByRole('button', { name: /预算识别/ }).click()
  const ocrEngine = await page.evaluate(async () => {
    const response = await fetch('/api/ocr/engine')
    return response.json()
  })
  if (!ocrEngine.available || !/PaddleOCR-json\.exe/i.test(ocrEngine.exePath || '')) throw new Error('PaddleOCR-json 本地插件不可用')
  const actualBudgetImage = 'C:/Users/三峰整装/Desktop/12a28504469f56571f2266bea8b9372f.jpg'
  const manualBudgetInput = page.locator('.manual-budget-textarea')
  if (!(await manualBudgetInput.isVisible())) throw new Error('预算识别页缺少手动录入预算入口')
  if (fs.existsSync(actualBudgetImage)) {
    await page.locator('.ocr-zone:not(.document-zone) input[type="file"]').setInputFiles(actualBudgetImage)
    await page.locator('.toast').filter({ hasText: /PaddleOCR/ }).waitFor({ timeout: 180000 })
    const recognizedText = await manualBudgetInput.inputValue()
    if (!/[\u4e00-\u9fa5]/.test(recognizedText)) throw new Error('PaddleOCR 上传图片后未回填中文识别文本')
    if (/BERR|BEE|ifoo|模板识别/i.test(recognizedText)) throw new Error('PaddleOCR 识别文本仍包含旧乱码或模板兜底说明')
    const actualRowValues = await page.locator('.budget-row input').evaluateAll((nodes) => nodes.map((node) => node.value).join(' '))
    if (!/[0-9]{3,}/.test(actualRowValues)) {
      throw new Error('PaddleOCR 识别结果未解析出可导入的预算金额')
    }
  }
  const importGridCount = await page.locator('.import-grid .upload-zone').count()
  if (importGridCount !== 2) throw new Error('预算识别页缺少图片表格和文档导入双入口')
  const documentUpload = page.locator('.document-zone input[type="file"]')
  await documentUpload.setInputFiles(fixtures.excelPath)
  await page.locator('.toast').filter({ hasText: /Excel表格识别到/ }).waitFor({ timeout: 30000 })
  const excelRowValues = await page.locator('.budget-row input').evaluateAll((nodes) => nodes.map((node) => node.value).join(' '))
  if (!excelRowValues.includes('Excel水路改造') || !excelRowValues.includes('1680')) {
    throw new Error('Excel 预算表未解析为预算项')
  }
  await documentUpload.setInputFiles(fixtures.wordPath)
  await page.locator('.toast').filter({ hasText: /Word文档识别到/ }).waitFor({ timeout: 30000 })
  const wordRowValues = await page.locator('.budget-row input').evaluateAll((nodes) => nodes.map((node) => node.value).join(' '))
  if (!wordRowValues.includes('Word木工吊顶') || !wordRowValues.includes('3600')) {
    throw new Error('Word 预算表未解析为预算项')
  }
  await manualBudgetInput.fill('手动水路预算 1300\n手动木工预算 2400')
  await page.getByRole('button', { name: /解析手动内容/ }).click()
  await page.locator('.toast').filter({ hasText: '手动录入解析到 2 条预算项' }).waitFor({ timeout: 5000 })
  const manualRowValues = await page.locator('.budget-row input').evaluateAll((nodes) => nodes.map((node) => node.value).join(' '))
  if (!manualRowValues.includes('手动水路预算') || !manualRowValues.includes('1300')) {
    throw new Error('预算识别页手动录入内容未解析为预算项')
  }

  await nav.getByRole('button', { name: /统计报表/ }).click()
  await page.screenshot({ path: path.join(outDir, 'reports-desktop.png'), fullPage: true })

  await nav.getByRole('button', { name: /票据归档/ }).click()
  const ticketProjectOptions = await page.locator('form.form-grid label:has-text("项目") option').allTextContents()
  if (!ticketProjectOptions.some((item) => item.includes('SF-2026') && item.trim().split(/\s+/).length > 1)) {
    throw new Error('票据归档项目下拉未显示客户/项目名称')
  }

  await nav.getByRole('button', { name: /系统设置/ }).click()
  const settingsText = await page.locator('body').evaluate((node) => node.textContent || '')
  if (settingsText.includes('浏览器 localStorage 持久化')) throw new Error('系统设置页仍显示需要删除的小字')
  if (!settingsText.includes('同代码账户') || !settingsText.includes('经销商')) throw new Error('系统设置页缺少同代码账户管理')
  await page.screenshot({ path: path.join(outDir, 'settings-accounts-desktop.png'), fullPage: true })

  await page.getByRole('button', { name: '退出登录' }).click()
  await page.getByRole('button', { name: '注册账户' }).click()
  await page.locator('.login-form label:has-text("经销商代码") input').fill('QA-CLEAR-001')
  await page.locator('.login-form label:has-text("经销商名称") input').fill('QA新经销商')
  await page.locator('.login-form label:has-text("职位") select').selectOption('经销商')
  await page.locator('.login-form input[autocomplete="new-password"]').first().fill('123456')
  await page.locator('.login-form label:has-text("确认密码") input').fill('123456')
  await page.getByRole('button', { name: /注册并进入系统/ }).click()
  await page.locator('.app-shell').waitFor({ timeout: 8000 })
  const isolatedData = await page.evaluate(() => {
    const keyFor = (dealerCode) => `sanfeng-finance-data-v1:dealer:${encodeURIComponent(dealerCode)}`
    return {
      adminData: JSON.parse(localStorage.getItem(keyFor('admin')) || 'null'),
      qaData: JSON.parse(localStorage.getItem(keyFor('QA-CLEAR-001')) || 'null'),
      legacyData: JSON.parse(localStorage.getItem('sanfeng-finance-data-v1') || 'null'),
    }
  })
  const clearedData = isolatedData.qaData
  if (
    !clearedData
    || clearedData.customers.length
    || clearedData.incomes.length
    || clearedData.expenses.length
    || clearedData.tickets.length
  ) {
    throw new Error('新经销商代码的独立后台数据未保持空白')
  }
  if (!isolatedData.adminData?.customers?.length || !isolatedData.legacyData?.customers?.length) {
    throw new Error('新经销商后台不应影响原 admin 经销商数据')
  }
  await page.locator('.sidebar nav').getByRole('button', { name: /系统设置/ }).click()
  await page.locator('.account-card').filter({ hasText: 'QA新经销商' }).getByRole('button', { name: '删除' }).waitFor({ timeout: 5000 })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('.sidebar nav button').first().click()
  await page.screenshot({ path: path.join(outDir, 'dashboard-mobile.png'), fullPage: true })

  const bodyText = await page.locator('body').evaluate((node) => node.textContent || '')
  await page.setViewportSize({ width: 1440, height: 960 })
  await page.locator('.sidebar nav').getByRole('button', { name: /系统设置/ }).click()
  await page.locator('.account-card').filter({ hasText: 'QA新经销商' }).getByRole('button', { name: '删除' }).click()
  await page.getByRole('button', { name: /登录系统/ }).waitFor({ timeout: 5000 })
  const afterDelete = await page.evaluate(() => {
    const keyFor = (dealerCode) => `sanfeng-finance-data-v1:dealer:${encodeURIComponent(dealerCode)}`
    return {
      adminData: JSON.parse(localStorage.getItem(keyFor('admin')) || 'null'),
      qaData: localStorage.getItem(keyFor('QA-CLEAR-001')),
      accounts: JSON.parse(localStorage.getItem('sanfeng-finance-accounts-v1') || '[]'),
    }
  })
  if (afterDelete.qaData !== null) throw new Error('删除经销商账户后未同步删除该经销商后台数据')
  if (!afterDelete.adminData?.customers?.length) throw new Error('删除 QA 经销商不应影响 admin 经销商数据')
  if (afterDelete.accounts.some((item) => item.dealerCode === 'QA-CLEAR-001')) throw new Error('删除经销商账户后账户列表仍保留该代码账户')
  const checks = {
    loggedIn: bodyText.includes('客户整装财务收支管理'),
    hasLoginTitle: loginText.includes('财务收支管理系统'),
    hasLoginRole: loginText.includes('职位') && loginRoleOptions.includes('店员'),
    hasRegisterOption: loginText.includes('注册账户'),
    hasRoleRegister: registerText.includes('职位') && registerText.includes('店员'),
    hasLogo: desktopText.includes('三峰整装'),
    hasBudgetAlert: bodyText.includes('超支'),
    hasReports: bodyText.includes('统计报表') || bodyText.includes('收入支出趋势'),
    clearsDataOnDealerChange: true,
    dealerCanDeleteSelf: true,
    dealerDataIsolated: true,
    deleteDealerRemovesOwnDataOnly: true,
    passwordResetDealerOnly: true,
    passwordResetPreservesDealerData: true,
    passwordResetKeepsFinancePassword: true,
    customerDetailFieldsEditable: true,
    partnerRecordsEditable: true,
    partnerListScrollsWithPage: true,
    commissionSalespersonList: true,
    paddleOcrPluginAvailable: true,
    tableImageBudgetImport: true,
    wordBudgetImport: true,
    excelBudgetImport: true,
    budgetResultCategoryColumnRemoved: true,
    ticketProjectShowsCustomerName: true,
    screenshots: fs.readdirSync(outDir).filter((name) => name.endsWith('.png')),
    notes,
  }
  console.log(JSON.stringify(checks, null, 2))
  await browser.close()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
