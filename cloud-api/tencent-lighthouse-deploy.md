# 腾讯云轻量应用服务器部署命令

以下命令在腾讯云轻量应用服务器 SSH 终端执行。

```bash
sudo mkdir -p /opt/sanfeng-cloud-api /data/sanfeng-finance
sudo chown -R $USER:$USER /opt/sanfeng-cloud-api /data/sanfeng-finance
cd /opt/sanfeng-cloud-api
npm install --omit=dev
export PORT=8787
export SANFENG_CLOUD_DATA_DIR=/data/sanfeng-finance
export SANFENG_JWT_SECRET=请改成一串很长的随机密钥
npm start
```

验证：

```bash
curl http://127.0.0.1:8787/api/health
curl http://127.0.0.1:8787/api/health/storage
```

腾讯云防火墙需要放通 `8787` 端口。正式使用建议使用 Nginx 配置 HTTPS，再让桌面端填写 HTTPS 地址。

自动备份验证：

```bash
sudo systemctl status sanfeng-cloud-api-backup.timer --no-pager
sudo systemctl start sanfeng-cloud-api-backup.service
ls -lh /data/sanfeng-finance-backups
```
