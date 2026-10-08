# 拐子狼 · 文字与影像

此目录保存个人网站的发布文件，使用 Vercel 部署，发布分支为 `main`。

`dist/` 包含已发布作品的 HTML、CSS、JavaScript、压缩后的 WebP 图片和音频。Obsidian 笔记、草稿、摄影原图和本地备份保留在本机。

内容更新在本机完成：编辑 Obsidian → 助手运行本地 `网站工程/scripts/prepare_publish.py` 构建并检查 → 同步本仓库的 `portfolio/` 目录 → 助手触发 Vercel 部署。

当前 Vercel 自身的 GitHub 连接返回授权错误，Git 推送自动触发部署尚未接通。当前使用助手直接上传验证后的文件并部署；用户更新 Obsidian 后告知助手即可。

`publish-manifest.json` 记录每个发布文件的 SHA-256，用于核对上传和部署内容。`vercel.json` 指定静态发布目录，云端无需安装依赖或重新构建。

正式域名：`2ear.tech`。Vercel 端已添加，域名 DNS 尚需接入。
