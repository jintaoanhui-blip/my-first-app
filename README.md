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

## Supabase Todos 表

在 Supabase SQL Editor 执行：

```sql
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists todos_user_id_created_at_idx
on public.todos (user_id, created_at desc);

alter table public.todos enable row level security;

drop policy if exists "Users can select own todos" on public.todos;
create policy "Users can select own todos"
on public.todos
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own todos" on public.todos;
create policy "Users can insert own todos"
on public.todos
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own todos" on public.todos;
create policy "Users can update own todos"
on public.todos
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own todos" on public.todos;
create policy "Users can delete own todos"
on public.todos
for delete
using (auth.uid() = user_id);
```

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

## 测试待办数据隔离

1. 打开前端页面，未登录时应提示先登录，任务列表为空
2. 用户 A 注册/登录，添加一条任务
3. 刷新页面，用户 A 仍能看到该任务
4. 编辑、完成、删除任务，刷新后状态应保持一致
5. 退出用户 A，任务列表应清空
6. 用户 B 登录后，不应看到用户 A 的任务
7. 用户 B 添加任务后，切回用户 A，用户 A 不应看到用户 B 的任务
8. 登录后使用 AI 拆解，生成的子任务会保存到当前用户的 `todos` 表

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
