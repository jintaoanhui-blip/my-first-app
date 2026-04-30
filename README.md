# Todo AI Frontend

待办事项应用的前端仓库，用于部署到 GitHub Pages。

## 项目文件

- `index.html`：页面结构
- `style.css`：页面样式
- `script.js`：待办事项交互和 AI 拆解接口调用

## 后端地址

前端会根据运行环境自动选择后端地址：

```js
const API_BASE_URL = isLocalFrontend
  ? "http://localhost:3000"
  : "https://todo-ai-backend.onrender.com";
```

本地预览时会请求 `http://localhost:3000`。部署到 GitHub Pages 后会请求云端 API 地址；后端正式部署后，请把 `script.js` 里的线上地址改成实际地址。

## 本地预览

启动本地后端后，再启动一个静态服务器预览前端：

```bash
python3 -m http.server 8000
```

然后打开 `http://localhost:8000`。AI 拆解功能会请求本地后端 `http://localhost:3000`。

## 部署

1. 将本仓库推送到 GitHub：`jintaoanhui-blip/my-first-app`
2. 在 GitHub 仓库设置中开启 GitHub Pages
3. 选择 `main` 分支作为发布来源

之后前端改完并执行：

```bash
git add .
git commit -m "Update frontend"
git push origin main
```

GitHub Pages 会自动更新页面。
