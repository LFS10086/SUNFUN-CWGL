import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { getOcrEngineInfo, recognizeBudgetImage } = require('./electron/ocr-engine.cjs')

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 30 * 1024 * 1024) {
        reject(new Error('上传图片过大'))
        req.destroy()
      }
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function localOcrPlugin() {
  return {
    name: 'sanfeng-local-ocr',
    configureServer(server) {
      server.middlewares.use('/api/ocr/engine', (_req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify(getOcrEngineInfo()))
      })
      server.middlewares.use('/api/ocr', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }
        try {
          const body = await readRequestBody(req)
          const payload = body ? JSON.parse(body) : {}
          const result = await recognizeBudgetImage(payload)
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ ok: true, ...result }))
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ ok: false, message: error.message }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), localOcrPlugin()],
})
