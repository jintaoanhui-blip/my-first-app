# Todo AI Frontend

待办事项应用的前端仓库，用于部署到 GitHub Pages。

## 项目文件

- `index.html`：页面结构
- `style.css`：页面样式
- `script.js`：用户注册登录、待办事项交互和 AI 拆解接口调用

## Supabase Auth 配置

前端使用 Supabase Auth 做邮箱和密码注册/登录。创建 Supabase 项目后，在 `script.js` 里填写：

```js
const SUPABASE_URL = "你的 Supabase Project URL";
const SUPABASE_ANON_KEY = "你的 Supabase anon public key";
```

这两个值在 Supabase Dashboard 的 `Project Settings` → `API` 页面查看。

## 后端地址

前端会请求 Render 上的后端服务：

```js
const API_BASE_URL = "https://todo-ai-backend-zx9w.onrender.com";
```

后端不需要在本地启动，AI 拆解功能会请求云端 API。

## 本地预览

启动一个静态服务器预览前端：

```bash
python3 -m http.server 8000
```

然后打开 `http://localhost:8000`。

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
