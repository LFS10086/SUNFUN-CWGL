param(
  [Parameter(Mandatory = $true)]
  [string]$HostName,

  [Parameter(Mandatory = $false)]
  [string]$User = "root",

  [Parameter(Mandatory = $false)]
  [string]$SshKeyPath = "",

  [Parameter(Mandatory = $false)]
  [int]$Port = 22
)

$ErrorActionPreference = "Stop"

$remote = "$User@$HostName"
$sshArgs = @("-p", "$Port", "-o", "BatchMode=yes", "-o", "ConnectTimeout=12")
if ($SshKeyPath) {
  if (!(Test-Path -LiteralPath $SshKeyPath)) {
    throw "SSH 私钥不存在：$SshKeyPath"
  }
  $sshArgs = @("-i", $SshKeyPath) + $sshArgs
}

Write-Host "检查 SSH 连接：$remote ..."

$script = @'
set -e
echo "whoami=$(whoami)"
echo "kernel=$(uname -a)"
if command -v node >/dev/null 2>&1; then
  echo "node=$(node -v)"
else
  echo "node=MISSING"
fi
if command -v npm >/dev/null 2>&1; then
  echo "npm=$(npm -v)"
else
  echo "npm=MISSING"
fi
if command -v unzip >/dev/null 2>&1; then
  echo "unzip=OK"
else
  echo "unzip=MISSING"
fi
if command -v sudo >/dev/null 2>&1; then
  echo "sudo=OK"
else
  echo "sudo=MISSING"
fi
'@

$output = $script | ssh @sshArgs $remote "bash -s"
$output

if ($LASTEXITCODE -ne 0) {
  throw "SSH 预检失败，请检查 IP、用户名、密码/密钥、腾讯云防火墙 22 端口。"
}

if ($output -match "node=MISSING" -or $output -match "npm=MISSING") {
  Write-Warning "服务器缺少 Node.js 或 npm。建议购买腾讯云轻量应用服务器时选择 Node.js 应用模板，或先安装 Node.js。"
}
if ($output -match "unzip=MISSING") {
  Write-Warning "服务器缺少 unzip，部署脚本需要它解压上传包。Ubuntu 可执行：sudo apt-get update && sudo apt-get install -y unzip"
}

Write-Host "预检完成。若无 WARNING，可执行 deploy-from-windows.ps1 部署。"
