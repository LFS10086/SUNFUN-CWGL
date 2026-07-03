param(
  [Parameter(Mandatory = $true)]
  [string]$HostName,

  [Parameter(Mandatory = $false)]
  [string]$User = "root",

  [Parameter(Mandatory = $false)]
  [string]$SshKeyPath = "",

  [Parameter(Mandatory = $false)]
  [int]$Port = 22,

  [Parameter(Mandatory = $false)]
  [string]$RemoteDir = "/opt/sanfeng-cloud-api",

  [Parameter(Mandatory = $false)]
  [string]$DataDir = "/data/sanfeng-finance"
)

$ErrorActionPreference = "Stop"

$package = "D:\workspace\sanfeng-cloud-api-tencent.zip"
if (!(Test-Path -LiteralPath $package)) {
  throw "未找到部署包：$package，请先在项目中重新生成部署包。"
}

$remote = "$User@$HostName"
$sshArgs = @("-p", "$Port")
$scpArgs = @("-P", "$Port")
if ($SshKeyPath) {
  $sshArgs = @("-i", $SshKeyPath) + $sshArgs
  $scpArgs = @("-i", $SshKeyPath) + $scpArgs
}

Write-Host "上传云端 API 部署包到 $remote ..."
ssh @sshArgs $remote "mkdir -p /tmp/sanfeng-cloud-api-upload"
scp @scpArgs $package "${remote}:/tmp/sanfeng-cloud-api-upload/sanfeng-cloud-api-tencent.zip"

$remoteScript = @"
set -e
sudo mkdir -p '$RemoteDir' '$DataDir'
sudo rm -rf '$RemoteDir'/*
sudo unzip -o /tmp/sanfeng-cloud-api-upload/sanfeng-cloud-api-tencent.zip -d '$RemoteDir'
cd '$RemoteDir'
sudo npm install --omit=dev
if [ ! -f /etc/sanfeng-cloud-api.env ]; then
  SECRET=`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  sudo sh -c "cat > /etc/sanfeng-cloud-api.env <<EOF
PORT=8787
SANFENG_CLOUD_DATA_DIR=$DataDir
SANFENG_JWT_SECRET=`$SECRET
EOF"
fi
sudo chown -R www-data:www-data '$RemoteDir' '$DataDir' || true
sudo cp '$RemoteDir/deploy/sanfeng-cloud-api.service' /etc/systemd/system/sanfeng-cloud-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now sanfeng-cloud-api
sudo systemctl restart sanfeng-cloud-api
sleep 2
curl -fsS http://127.0.0.1:8787/api/health
"@

Write-Host "远程安装并启动服务 ..."
$remoteScript | ssh @sshArgs $remote "bash -s"

Write-Host ""
Write-Host "部署完成。请在腾讯云防火墙放通 8787 端口。"
Write-Host "客户端云端 API 地址可先填写：http://$HostName`:8787"
