# 个人作品集

**维护状态：2026年11月1日完成最终开源归档，后续不再更新或提供维护。可按 MIT 许可证自行 fork。**

原生 HTML、CSS 和 JavaScript 作品集，包含分类筛选、项目详情及内容管理后台。Cloudflare Pages + Functions + D1 提供线上服务，本地使用 Node.js SQLite。

[访问网站](https://school-internship-portfolio-aszz007.pages.dev/)

## 本地运行

需要 Node.js 24.12 或以上。在本目录执行：

```text
npm run dev
```

首页为 http://127.0.0.1:4180/，后台为 http://127.0.0.1:4180/admin/。首次启动会生成 `.local/管理员登录.txt`；后续启动沿用原密码和数据库。

后台可编辑个人介绍，新增、修改、移除作品，并通过“保存并发布”更新前台。多个编辑窗口通过内容版本检查处理冲突。

## 开发与部署

```text
npm test
npm run build
```

测试覆盖接口、会话、内容校验、版本冲突和持久化。构建输出为 `dist/`，函数入口位于 `functions/api/`。部署步骤见 [DEPLOYMENT.md](DEPLOYMENT.md)，需求与设计见 [PRD.md](PRD.md) 和 [TECH_DESIGN.md](TECH_DESIGN.md)。

运行数据位于 `.local/`。迁移到自己的 Cloudflare 账号时，使用 `wrangler.example.jsonc` 创建配置，并设置管理员密码摘要。

## 许可

原创代码采用 [MIT](LICENSE)。第三方依赖、外部服务及其数据按各自许可使用。
