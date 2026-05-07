# Admin 菜单与页面

第一版后台只保留认证机构和内容发布平台所需模块，不保留日报、美容、品牌库、来源、采集任务、AI 任务、原始内容、榜单、指数、线索、SEO 和系统设置旧菜单。

## 后台菜单

| 菜单 | 路径 | 说明 |
| --- | --- | --- |
| 仪表盘 | `/dashboard` | MVP 概览 |
| 用户管理 | `/users` | 后台用户与机构运营账号 |
| 前台菜单 | `/navigation-menus` | Web 菜单管理 |
| 机构申请 | `/organization-applications` | 机构认证申请审核 |
| 认证机构 | `/organizations` | 已认证机构管理 |
| 内容审核 | `/content-reviews` | 待审核内容 |
| 内容管理 | `/contents` | 资讯、快讯、动态、活动 |
| 评论管理 | `/comments` | 评论隐藏与删除 |
| 官方报告 | `/reports` | 平台报告发布与下架 |
| 文件管理 | `/files` | 文件资产 |
| 操作日志 | `/operation-logs` | 后台操作记录 |

## 资源接口

后台页面统一通过 `/api/admin/:resource` 读取列表，通过 `/api/admin/:resource/:id/:action` 执行动作。