const { spawn } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require('playwright')

const root = path.resolve(__dirname, '..')
const cloudDir = path.join(root, 'cloud-api')
const dataDir = 'D:\\workspace\\sanfeng-cloud-e2e-data'
const apiPort = 8791
const appPort = 5174

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForUrl(url, timeoutMs = 20000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {}
    await wait(500)
  }
  throw new Error(`Timeout waiting for ${url}`)
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return chromium.launch({ headless: true, channel: 'chrome' })
  }
}

function spawnProcess(command, args, options = {}) {
  return spawn(command, args, {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

async function main() {
  fs.rmSync(dataDir, { recursive: true, force: true })

  const api = spawnProcess('node', ['server.js'], {
    cwd: cloudDir,
    env: {
      PORT: String(apiPort),
      SANFENG_CLOUD_DATA_DIR: dataDir,
      SANFENG_JWT_SECRET: 'cloud-e2e-local-secret',
    },
  })
  const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')
  const app = spawnProcess(process.execPath, [viteBin, '--host', '127.0.0.1', '--port', String(appPort)], {
    cwd: root,
  })

  try {
    await waitForUrl(`http://127.0.0.1:${apiPort}/api/health`)
    await waitForUrl(`http://127.0.0.1:${appPort}/`)

    const browser = await launchBrowser()
    const page = await browser.newPage()
    const dealerCode = `JLCLOUD${Date.now().toString().slice(-5)}`
    await page.goto(`http://127.0.0.1:${appPort}/`)
    await page.getByRole('button', { name: '注册账户' }).click()
    await page.getByLabel('经销商代码').fill(dealerCode)
    await page.getByLabel('云端 API 地址').fill(`http://127.0.0.1:${apiPort}`)
    await page.getByLabel('职位').selectOption('经销商')
    await page.getByLabel('经销商名称').fill('云端测试经销商')
    await page.getByRole('textbox', { name: '密码 显示或隐藏密码' }).fill('123456')
    await page.getByRole('textbox', { name: '确认密码' }).fill('123456')
    await page.getByRole('button', { name: '注册并进入系统' }).click()
    await page.getByText('客户整装财务收支管理').waitFor({ timeout: 15000 })
    await page.getByRole('button', { name: '客户档案' }).click()
    await page.getByLabel('客户/项目名称').fill('云端同步测试项目')
    await page.getByLabel('签单总价').fill('1000')
    await page.getByRole('button', { name: /新建客户档案/ }).click()
    await page.waitForTimeout(1600)
    await page.getByRole('button', { name: '系统设置' }).click()
    await page.getByLabel('账户名称').fill('云端财务')
    await page.locator('.inline-account-form').getByLabel('职位').selectOption('财务')
    await page.getByLabel('初始密码').fill('654321')
    await page.getByRole('button', { name: '新增账户' }).click()
    await page.getByText('云端财务').waitFor({ timeout: 8000 })
    await page.getByLabel('退出登录').click()
    await page.getByLabel('经销商代码').fill(dealerCode)
    await page.getByLabel('云端 API 地址').fill(`http://127.0.0.1:${apiPort}`)
    await page.getByLabel('职位').selectOption('财务')
    await page.getByRole('textbox', { name: '密码 显示或隐藏密码' }).fill('654321')
    await page.getByRole('button', { name: '登录系统' }).click()
    await page.getByText('客户整装财务收支管理').waitFor({ timeout: 15000 })
    await browser.close()

    const files = fs.readdirSync(path.join(dataDir, 'dealers'))
    const payload = JSON.parse(fs.readFileSync(path.join(dataDir, 'dealers', files[0]), 'utf8'))
    const accounts = JSON.parse(fs.readFileSync(path.join(dataDir, 'accounts.json'), 'utf8'))
    const hasProject = payload.customers.some((customer) => customer.name === '云端同步测试项目')
    const hasFinance = accounts.some((item) => item.dealerCode === dealerCode && item.role === '财务' && item.displayName === '云端财务')
    if (!hasProject) throw new Error('云端数据文件未写入测试项目')
    if (!hasFinance) throw new Error('云端同代码财务账户未写入')
    console.log(JSON.stringify({ cloudE2E: true, dealerCode, dealerFiles: files.length, hasProject, hasFinance }, null, 2))
  } finally {
    api.kill()
    app.kill()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
