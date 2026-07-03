# 三峰整装财务系统云端 API

这是给腾讯云部署用的最小后端。桌面端填写该服务地址后，账户和经销商业务数据会保存到云端。

## 腾讯云推荐部署

1. 购买腾讯云轻量应用服务器 Lighthouse，选择 Node.js 或 Ubuntu 镜像。
2. 放通防火墙端口，例如 `8787`。
3. 上传本目录到服务器，例如 `/opt/sanfeng-cloud-api`。
4. 在服务器执行：

```bash
cd /opt/sanfeng-cloud-api
npm install --omit=dev
export PORT=8787
export SANFENG_CLOUD_DATA_DIR=/data/sanfeng-finance
export SANFENG_JWT_SECRET=请改成一串很长的随机密钥
npm start
```

5. 建议用 Nginx 和 HTTPS 反向代理到 `http://127.0.0.1:8787`。
6. 桌面端登录页“云端 API 地址”填写你的 HTTPS 地址，例如：

```text
https://api.example.com
```

## 数据隔离

- 每个经销商代码独立保存一份数据快照。
- 服务端会校验登录 token 中的 `dealerCode`，不能读取或保存其他经销商代码的数据。
- 删除经销商主账号时，会同步删除该经销商代码下的业务数据文件。

## 注意

当前版本优先解决“云端存储”和“多电脑同账号查看同一套数据”。票据文件仍会随数据快照一起保存，数据量很大时建议下一步接腾讯云 COS。
