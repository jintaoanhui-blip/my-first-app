# Todo AI Frontend

待办事项应用的前端仓库，用于部署到 GitHub Pages。

## 项目文件

- `index.html`：页面结构
- `style.css`：页面样式
- `script.js`：待办事项交互和 AI 拆解接口调用

## 后端地址

前端会请求 Render 上的后端服务：

```js
const API_BASE_URL = "https://todo-ai-backend.onrender.com";
```

如果 Render 服务地址不同，请修改 `script.js` 里的 `API_BASE_URL`。

## 本地预览

直接用浏览器打开 `index.html` 即可预览基础页面。AI 拆解功能需要后端服务可访问。

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
