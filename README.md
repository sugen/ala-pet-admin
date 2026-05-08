# ala-pet-admin

Ala.pet 阿拉宠后台管理系统。第一阶段提供 Admin 专用登录、控制台、后台账号管理、角色权限管理、机构审核、内容审核、内容管理、评论管理、活动管理、报告管理、文件管理、操作日志和系统设置入口。

## 技术栈

1. Next.js 15
2. TypeScript
3. Tailwind CSS
4. shadcn/ui 风格组件
5. TanStack Table
6. React Hook Form
7. Zod
8. Admin JWT 登录与 RBAC 权限

## 本地开发

```bash
cp .env.example .env
npm install
npm run dev
```

默认访问：`http://localhost:3100`。

固定端口本地验证：

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080 NEXT_PUBLIC_API_MODE=real npm run dev
bash scripts/smoke-admin-ui.sh
bash scripts/smoke-all.sh
```

`scripts/smoke-admin-ui.sh` 验证后台主要页面可访问；`scripts/smoke-all.sh` 会先检查 API 健康、后台登录 API、执行类型检查、确认 API 模式配置，再运行页面 smoke 和后台主菜单页面检查。

## 环境变量

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_API_MODE=real
```

`NEXT_PUBLIC_API_MODE=real` 是默认值，后台通过 `NEXT_PUBLIC_API_BASE_URL` 请求 `/api/admin/*`。当前仅支持 `real`。

## 数据与表单

后台页面不直接调用 `fetch`，统一通过 `lib/api.ts` 访问 API。登录成功后调用 `/api/admin/me` 获取当前后台身份、角色、可见菜单和权限码。侧边栏根据后端返回的 `tbl_admin_menus` 动态生成，操作按钮根据权限码显示。

## Docker 部署

本项目按仓库独立部署，不创建总 deploy 项目。部署相关文件全部在当前仓库内，适合部署到独立服务器，也适合同机做后台灰度实例。

### 单实例部署

```bash
cp .env.example .env
./scripts/deploy.sh
```

默认端口如下：

- 宿主机端口：`ADMIN_PORT=3100`
- 容器内端口：`3000`
- 反向代理域名：`admin.ala.pet`

### 多实例部署

后台默认建议单实例。如需灰度发布，可使用不同 `COMPOSE_PROJECT_NAME` 和 `ADMIN_PORT`：

```bash
COMPOSE_PROJECT_NAME=ala-pet-admin-2 ADMIN_PORT=3101 ./scripts/deploy.sh --force
```

### Nginx 配置

示例配置见 `nginx/admin.ala.pet.conf.example`。宿主机 Nginx 将 `admin.ala.pet` 反向代理到 `127.0.0.1:${ADMIN_PORT}`。

### 健康检查

```bash
./scripts/healthcheck.sh
```

健康检查会请求首页：`http://127.0.0.1:${ADMIN_PORT}/`。

### 日志查看

```bash
./scripts/logs.sh
```

脚本默认使用 `docker compose logs --tail=200`。
默认只输出最近 200 行，不会持续跟随；需要跟随日志时显式执行 `./scripts/logs.sh --follow` 或 `./scripts/logs.sh -f`。

### 回滚建议

1. 使用 Git 切回上一个稳定提交。
2. 保留现有 `.env` 不变。
3. 执行 `./scripts/deploy.sh --force` 重新构建。

### 部署说明

`scripts/deploy.sh` 只部署当前仓库，并执行以下流程：

1. `git fetch` 与 `git pull --ff-only`
2. 判断 Git HEAD 是否变化
3. 无变化时不重启，只执行健康检查
4. 有变化或显式传入 `--force` 时执行 `docker compose build && docker compose up -d`
5. 执行 `scripts/healthcheck.sh`

## 权限

Admin token 存储 key 为 `ala_pet_admin_token`，Web 前台用户 token 使用 `ala_pet_web_token`，两者不能混用。默认开发账号为 `admin / admin123456`，该账号绑定 `super_admin` 角色并拥有全部后台菜单和操作权限。
