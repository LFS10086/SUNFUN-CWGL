# 三峰整装经销商客户整装财务收支管理系统本地版

本项目是一个 React + Vite + Electron 财务管理系统。默认可作为单机版运行，数据按经销商代码独立保存在本机；填写云端 API 地址后，可切换为云端模式，把同一经销商代码下的账户和业务数据同步到腾讯云后端。

## 默认登录

- 经销商代码：`admin`
- 职位：`经销商`
- 密码：`123456`

登录页支持按“经销商代码 + 职位 + 密码”确认登录人员；注册同一经销商代码下的多账户时，也可选择职位：经销商、财务、店员。登录页提供“重置密码”按钮，仅当职位选择为“经销商”时可用，会把该经销商账户密码恢复为默认 `123456`，不清空或改动该经销商后台数据。登录后可在顶部横向“改密”按钮或“系统设置”里修改当前账户密码。

## 账户权限

- 经销商：拥有全部功能权限，并可删除同一经销商代码下的其他账户。
- 财务：拥有全部业务功能权限，但不能删除其他账户。
- 店员：仅拥有查询权限，不能新增、修改、上传、导入或删除数据。
- 每个经销商代码拥有独立后台数据，不同经销商代码之间不会共用客户、收款、支出、预算、票据等商业数据。
- 注册新经销商代码时会创建一套空白后台；注册同一经销商代码下的财务/店员账户时，会进入该代码已有后台。
- 经销商账户可删除同一代码下的任意账户，包括自己的账户；删除经销商账户会同步删除该经销商代码下的后台数据，其他经销商代码数据不受影响。

## 已实现模块

- 客户档案：项目编号自动生成且不可手改，支持合同总价、签单总价、三峰木门订单编号、三峰定制订单编号、项目经理、业务员。
- 装修预算项：在客户档案中独立维护，预算识别首次导入不改变签单总价，后续预算增减按差额同步调整签单总价，并联动支出预算内容。
- 收入收款：收款码按微信、支付宝、银行转账、现金分类上传，确认收款时弹出对应收款码，流水状态由人工调整。
- 支出管理：日期、金额、用途、客户装修预算内容、工程人员档案联动。
- 工程人员：类型包含项目经理、施工人员、供货商；工种包含水、电、瓦、木、油、材料、供货商。
- 业务提成：按项目已到账收款和业务员比例计算应发、已发、待发。
- 预算识别：支持表格图片、Word `.docx`、Excel `.xlsx/.xls` 和 CSV/TSV。图片会先做画质增强，再调用本地 PaddleOCR-json 插件识别中文并按表格坐标提取项目/金额；文档和表格文件会直接读取表格内容；识别文本会回填到手动录入区，可修正后导入客户档案。
- 超支提醒：单笔或累计实际支出超过预算时提示，并在预算明细中展示。
- 票据归档：收款票据、支出票据、合同、预算等文件上传并按项目检索。
- 统计报表：收入支出趋势、项目收入支出对比、支出结构图表。
- 系统设置：数据备份导出、同经销商代码账户管理。

## 运行方式

```powershell
npm install
npm run dev
```

默认访问：

```text
http://127.0.0.1:5173/
```

## 腾讯云端存储

桌面端支持两种模式：

- 单机模式：登录页“云端 API 地址”留空，数据只保存在当前电脑。
- 云端模式：登录页填写腾讯云后端地址，登录/注册后自动同步云端数据。

云端 API 源码在 `cloud-api/`，推荐先部署到腾讯云轻量应用服务器 Lighthouse。票据文件当前会随经销商数据快照保存；如果后续票据和图片很多，再把文件上传改为腾讯云 COS。

### 腾讯云部署步骤

1. 购买腾讯云轻量应用服务器，选择 Node.js 或 Ubuntu 镜像。
2. 放通端口，例如 `8787`；正式使用建议绑定域名并配置 HTTPS。
3. 上传 `cloud-api` 目录到服务器，例如 `/opt/sanfeng-cloud-api`。
4. 在服务器执行：

```bash
cd /opt/sanfeng-cloud-api
npm install --omit=dev
export PORT=8787
export SANFENG_CLOUD_DATA_DIR=/data/sanfeng-finance
export SANFENG_JWT_SECRET=请改成一串很长的随机密钥
npm start
```

5. 访问 `http://服务器IP:8787/api/health`，看到 `ok: true` 即为后端正常。
6. 桌面端登录页填写云端 API 地址，例如 `http://服务器IP:8787` 或你的 HTTPS 域名。
7. 注册经销商账户后，该经销商代码会生成独立云端后台；同代码账户只看到同代码数据。

Windows 本机也提供了辅助部署脚本。拿到腾讯云轻量服务器 IP 和 SSH 登录方式后，可在 PowerShell 执行：

先预检服务器环境：

```powershell
powershell -ExecutionPolicy Bypass -File .\cloud-api\deploy\preflight-from-windows.ps1 -HostName 服务器IP -User root
```

预检通过后部署：

```powershell
powershell -ExecutionPolicy Bypass -File .\cloud-api\deploy\deploy-from-windows.ps1 -HostName 服务器IP -User root
```

如果使用 SSH 私钥：

```powershell
powershell -ExecutionPolicy Bypass -File .\cloud-api\deploy\preflight-from-windows.ps1 -HostName 服务器IP -User root -SshKeyPath D:\workspace\your-key.pem
powershell -ExecutionPolicy Bypass -File .\cloud-api\deploy\deploy-from-windows.ps1 -HostName 服务器IP -User root -SshKeyPath D:\workspace\your-key.pem
```

注意：腾讯云账号注册、实名、购买服务器和支付确认必须由账号所有人自己完成。不要把腾讯云 SecretId、SecretKey、服务器密码发到公开仓库。

## 图片识别插件

旧版浏览器 Tesseract 识别已移除。当前使用从 GitHub 发布页下载的 `hiroi-sora/PaddleOCR-json v1.4.1`，插件目录为：

```text
D:\workspace\sanfeng-ocr-plugin\engine\PaddleOCR-json_v1.4.1\
```

开发环境 `npm run dev` 会通过 Vite 本地接口 `/api/ocr` 调用插件；Electron 桌面版通过 `electron/preload.cjs` 与主进程 IPC 调用同一个 OCR 引擎。上传图片会先复制到 `D:\workspace\sanfeng-ocr-runtime\` 的英文路径，避免中文用户名路径导致 OCR 引擎读图失败。

Word/Excel 导入在浏览器端完成：Excel/CSV 使用 `xlsx` 解析，Word `.docx` 使用 `mammoth` 解析。旧版 `.doc` 请先另存为 `.docx` 再导入。

## 验证命令

```powershell
npm run lint
npm run build
npm run qa
npm run qa:cloud
```

`npm run qa` 会用 Playwright 自动登录并检查经销商密码重置、收款提示、支出超支提示、预算导入、报表和移动端页面，截图输出在 `D:\workspace\sanfeng-finance-delivery\playwright\`。

## 交付说明

- 视觉概念图：`design/dashboard-concept.png`
- 主要源码：`src/App.jsx`
- 样式文件：`src/App.css`
- 浏览器验收截图：`D:\workspace\sanfeng-finance-delivery\playwright\`
- Windows 打包输出：`D:\workspace\sanfeng-finance-delivery\exe\`
