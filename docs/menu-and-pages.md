# Admin 菜单与页面

第一版后台只保留认证机构和内容发布平台所需模块。后台菜单来自 API `/api/admin/me` 返回的 `tbl_admin_menus` 授权结果，不在前端写死。

## 后台菜单

| 菜单 | 路径 | 说明 |
| --- | --- | --- |
| 控制台 | `/` | 第一阶段概览 |
| 用户管理 | `/users` | 后台用户与机构运营账号 |
| 前台菜单 | `/navigation-menus` | Web 菜单管理 |
| 后台账号管理 | `/admin-accounts` | 后台登录账号与角色分配 |
| 角色权限管理 | `/admin-roles` | 角色、菜单权限和操作权限配置 |
| 机构审核 | `/organization-reviews` | 机构认证申请审核 |
| 认证机构 | `/organizations` | 已认证机构管理 |
| 内容审核 | `/content-reviews` | 待审核内容 |
| 内容管理 | `/contents` | 资讯、快讯、动态、活动 |
| 评论管理 | `/comments` | 评论隐藏与删除 |
| 活动管理 | `/events` | 活动内容更新与下线 |
| 官方报告 | `/reports` | 平台报告发布与下架 |
| 文件管理 | `/files` | 文件资产 |
| 操作日志 | `/operation-logs` | 后台操作记录 |
| 系统设置 | `/settings` | 后台系统设置入口 |

## 资源接口

后台页面统一通过 `/api/admin/:resource` 读取列表，通过 `/api/admin/:resource/:id/:action` 执行动作。所有 Admin 接口必须携带 Admin token；没有菜单权限的页面显示 403，没有操作权限的按钮不显示，接口层无权限返回 403。