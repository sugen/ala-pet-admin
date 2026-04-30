# ala-pet-admin

Ala.pet 阿拉宠后台管理系统。第一阶段提供 JWT 登录入口、工作台、内容管理、品牌库、声量观察、样本库、来源管理、采集任务、AI 任务、公开事件、线索管理、SEO 管理和系统设置页面骨架。

## 技术栈

1. Next.js 15
2. TypeScript
3. Tailwind CSS
4. shadcn/ui 风格组件
5. TanStack Table
6. React Hook Form
7. Zod
8. JWT 登录

## 本地开发

```bash
cp .env.example .env
npm install
npm run dev
```

默认访问：`http://localhost:3001`。

## 环境变量

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_API_MODE=mock
```

`NEXT_PUBLIC_API_MODE=mock` 时后台使用 `lib/api.ts` 中的 mock 数据，适合第一版骨架、本地开发和静态构建。切换为 `real` 后会通过 `NEXT_PUBLIC_API_BASE_URL` 请求 `/api/admin/*`，请求失败时回退到 mock 数据，方便逐步接入真实 API。

## 数据与表单

后台页面不直接调用 `fetch`，统一通过 `lib/api.ts` 访问 API。列表页统一使用 TanStack Table，文章、品牌和系统设置表单使用 React Hook Form + Zod，后续接入真实 API 时保持页面结构不变。

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

脚本内部使用 `docker compose logs -f --tail=200`。

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

## 菜单
*** Add File: /Users/steven/project/alapet/ala-pet-api/docker-compose.yml
services:
	api:
		build:
			context: .
			dockerfile: Dockerfile
		image: ${API_IMAGE:-ala-pet-api:latest}
		restart: unless-stopped
		env_file:
			- ./.env
		environment:
			APP_PORT: ${APP_PORT:-8080}
		ports:
			- "${API_PORT:-8080}:${APP_PORT:-8080}"


后台菜单包括：工作台、内容管理、品牌库、声量观察、样本库、来源管理、采集任务、AI任务、公开事件、线索管理、SEO管理、系统设置。内容管理下保留日报管理和美容频道入口，用于第一版内容工作流拆分。
