# 拐子狼 · 文字与影像

本仓库保存个人网站的发布文件，使用 Vercel 部署，生产分支为 `main`。

`dist/` 包含已发布作品的 HTML、CSS、JavaScript、压缩后的 WebP 图片和音频。Obsidian 笔记、草稿、摄影原图和本地备份保留在本机。

内容更新在本机完成：编辑 Obsidian → 运行 `网站工程/scripts/prepare_publish.py` 构建并检查 → 提交本仓库 → Vercel 自动部署。

`publish-manifest.json` 记录每个发布文件的 SHA-256，用于核对上传和部署内容。`vercel.json` 指定静态发布目录，云端无需安装依赖或重新构建。

计划使用的正式域名：`2ear.tech`。
