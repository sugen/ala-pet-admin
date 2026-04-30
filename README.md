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
```

## Docker

```bash
docker build -t ala-pet-admin .
docker run --rm -p 3001:3001 --env-file .env ala-pet-admin
```

## YAML 配置与单项目部署

生产配置使用 `config/production.local.yaml`，示例结构见 `config/config.example.yaml`。本项目以单容器方式部署，不在容器内创建 MySQL、Redis 或 Nginx；宿主机 Nginx 将 `admin.ala.pet` 反向代理到 `127.0.0.1:3001`。

```bash
cp config/config.example.yaml config/production.local.yaml
./scripts/deploy.sh
./scripts/healthcheck.sh
```

Docker 构建时会从 YAML 注入 `NEXT_PUBLIC_API_BASE_URL`。
