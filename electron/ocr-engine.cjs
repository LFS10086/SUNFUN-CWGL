const fs = require('fs')
const path = require('path')
const { execFile } = require('child_process')

const WORKSPACE_ROOT = process.env.SANFENG_WORKSPACE_ROOT || 'D:\\workspace'
const RUNTIME_DIR = path.join(WORKSPACE_ROOT, 'sanfeng-ocr-runtime')
const PLUGIN_ROOT = path.join(WORKSPACE_ROOT, 'sanfeng-ocr-plugin', 'engine', 'PaddleOCR-json_v1.4.1')
const CONFIG_FILE = 'models/config_chinese.txt'
const ANSI_COLOR_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g')

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function candidateEngineDirs() {
  return [
    process.env.SANFENG_OCR_ENGINE_DIR,
    PLUGIN_ROOT,
    path.join(process.resourcesPath || '', 'app', 'ocr-plugin', 'PaddleOCR-json_v1.4.1'),
    path.join(__dirname, '..', 'ocr-plugin', 'PaddleOCR-json_v1.4.1'),
  ].filter(Boolean)
}

function getOcrEngineInfo() {
  const engineDir = candidateEngineDirs().find((dir) => fs.existsSync(path.join(dir, 'PaddleOCR-json.exe')))
  if (!engineDir) {
    return {
      available: false,
      engineDir: '',
      exePath: '',
      message: `未找到 PaddleOCR-json 插件，请确认已下载到 ${PLUGIN_ROOT}`,
    }
  }
  return {
    available: true,
    engineDir,
    exePath: path.join(engineDir, 'PaddleOCR-json.exe'),
    configPath: path.join(engineDir, CONFIG_FILE),
    message: 'PaddleOCR-json 插件可用',
  }
}

function dataUrlToBuffer(dataUrl) {
  const match = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/)
  if (!match) throw new Error('上传图片数据格式不正确')
  const mimeType = match[1]
  const buffer = Buffer.from(match[2], 'base64')
  const extension = mimeType.includes('jpeg') || mimeType.includes('jpg') ? '.jpg' : '.png'
  return { buffer, extension }
}

function writeRuntimeImage(dataUrl, fileName = '') {
  ensureDir(RUNTIME_DIR)
  const { buffer, extension } = dataUrlToBuffer(dataUrl)
  const safeName = String(fileName || 'upload')
    .replace(/\.[^.]+$/, '')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'upload'
  const filePath = path.join(RUNTIME_DIR, `ocr-${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}${extension}`)
  fs.writeFileSync(filePath, buffer)
  return filePath
}

function stripAnsi(text) {
  return String(text || '').replace(ANSI_COLOR_PATTERN, '')
}

function parsePaddleStdout(stdout) {
  const jsonLine = stripAnsi(stdout)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .reverse()
    .find((line) => line.startsWith('{') && line.endsWith('}'))
  if (!jsonLine) throw new Error('OCR 插件未返回 JSON 结果')
  const payload = JSON.parse(jsonLine)
  if (payload.code !== 100) throw new Error(`OCR 插件识别失败：${payload.data || payload.code}`)
  return Array.isArray(payload.data) ? payload.data : []
}

function boxCenterY(box = []) {
  const ys = box.flatMap((point) => [Number(point?.[1] || 0)])
  return ys.reduce((sum, value) => sum + value, 0) / Math.max(ys.length, 1)
}

function boxLeft(box = []) {
  return Math.min(...box.map((point) => Number(point?.[0] || 0)))
}

function boxHeight(box = []) {
  const ys = box.map((point) => Number(point?.[1] || 0))
  return Math.max(...ys) - Math.min(...ys)
}

function buildTextLines(items) {
  const useful = items
    .filter((item) => String(item.text || '').trim() && Number(item.score || 0) >= 0.25)
    .sort((a, b) => boxCenterY(a.box) - boxCenterY(b.box))
  const groups = []
  useful.forEach((item) => {
    const centerY = boxCenterY(item.box)
    const height = Math.max(18, boxHeight(item.box))
    const group = groups.find((candidate) => Math.abs(candidate.centerY - centerY) <= Math.max(28, height * 0.7))
    if (group) {
      group.items.push(item)
      group.centerY = group.items.reduce((sum, row) => sum + boxCenterY(row.box), 0) / group.items.length
    } else {
      groups.push({ centerY, items: [item] })
    }
  })
  return groups
    .map((group) => group.items
      .sort((a, b) => boxLeft(a.box) - boxLeft(b.box))
      .map((item) => String(item.text || '').trim())
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim())
    .filter(Boolean)
}

function runPaddleOcr(imagePath, options = {}) {
  const engine = getOcrEngineInfo()
  if (!engine.available) throw new Error(engine.message)
  const args = [
    `-config_path=${CONFIG_FILE}`,
    `-image_path=${imagePath}`,
    '-ensure_ascii=false',
    '-cls=true',
    '-use_angle_cls=true',
    `-limit_side_len=${options.limitSideLen || 2600}`,
  ]
  return new Promise((resolve, reject) => {
    execFile(engine.exePath, args, {
      cwd: engine.engineDir,
      encoding: 'utf8',
      timeout: options.timeoutMs || 180000,
      windowsHide: true,
      maxBuffer: 24 * 1024 * 1024,
    }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`OCR 插件执行失败：${error.message}\n${stripAnsi(stderr).slice(-1000)}`))
        return
      }
      try {
        const items = parsePaddleStdout(stdout)
        const lines = buildTextLines(items)
        resolve({
          engine: 'PaddleOCR-json v1.4.1',
          items,
          lines,
          text: lines.join('\n'),
        })
      } catch (parseError) {
        reject(parseError)
      }
    })
  })
}

function scoreOcrText(result) {
  const text = String(result?.text || '')
  const cjkCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const moneyCount = (text.match(/\b\d{3,8}\b/g) || []).length
  const lineCount = result?.lines?.length || 0
  const latinNoise = (text.match(/[A-Za-z]{3,}/g) || []).length
  return cjkCount + moneyCount * 18 + lineCount * 2 - latinNoise * 8
}

async function recognizeBudgetImage(payload = {}) {
  if (!payload.dataUrl) throw new Error('请先上传图片')
  const enhancedPath = writeRuntimeImage(payload.dataUrl, payload.fileName)
  const enhanced = await runPaddleOcr(enhancedPath, payload.options || {})
  let result = { ...enhanced, imagePath: enhancedPath, pass: 'enhanced' }
  if (payload.originalDataUrl && payload.originalDataUrl !== payload.dataUrl) {
    const originalPath = writeRuntimeImage(payload.originalDataUrl, `original-${payload.fileName || 'upload'}`)
    const original = await runPaddleOcr(originalPath, payload.options || {})
    const enhancedScore = scoreOcrText(enhanced)
    const originalScore = scoreOcrText(original)
    if (originalScore > enhancedScore) {
      result = { ...original, imagePath: originalPath, pass: 'original' }
    } else {
      result = { ...result, alternatePass: { pass: 'original', score: originalScore } }
    }
    result.score = Math.max(enhancedScore, originalScore)
  } else {
    result.score = scoreOcrText(enhanced)
  }
  return {
    ...result,
  }
}

module.exports = {
  getOcrEngineInfo,
  recognizeBudgetImage,
  runPaddleOcr,
}
