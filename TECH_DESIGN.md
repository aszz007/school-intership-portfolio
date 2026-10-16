# 个人作品集技术设计

## 系统结构

```text
访问者浏览器 → HTML / CSS / JavaScript → GET /api/content
管理员浏览器 → /admin/ → 登录 / 会话 → PUT /api/content
Cloudflare Pages → Pages Functions → D1数据库
本地预览 → 同一接口处理器 → Node.js SQLite适配器
```

前台沿用原生JavaScript、项目详情弹窗和筛选，不为教程示例重写React。Cloudflare Pages提供公开页面和Functions接口，D1保存内容、会话与登录限流计数。本地使用Node.js 24.12内置SQLite运行相同业务处理器；它不是云端D1实测。

## 文件分工

| 位置 | 职责 |
| --- | --- |
| index.html、styles.css、app.js | 个人介绍、项目分类、详情与接口读取 |
| content.js | 普通静态预览的初始内容；部署构建时生成不含本地相对作品链接的版本 |
| admin/ | 登录和内容编辑，保存、重新加载、离开提醒 |
| functions/api/[[path]].js | Cloudflare入口，将请求交给统一处理器 |
| server/handler.mjs | 登录、读取、修改、会话、频率限制 |
| server/validation.mjs | 字段、长度、分类、唯一标识、HTTPS链接校验 |
| server/auth.mjs | PBKDF2密码摘要、随机会话及SHA-256会话索引 |
| server/seed.mjs | 已有公开介绍与初始项目；不含密钥 |
| server/schema.sql | 数据库建表，部署时在D1执行 |
| server/local-db.mjs | 本地SQLite对D1语句接口的适配 |
| scripts/build.mjs、scripts/dev.mjs | 白名单静态构建、本地服务 |

## 数据设计

- content：单条站点内容，JSON正文与递增revision版本。
- sessions：随机会话的SHA-256摘要、过期时间；不存储原始会话值。
- attempts：临时限流键、尝试次数、重置时间；过期数据在后续登录时清理。

内容修改使用带revision条件的参数化UPDATE。条件未命中返回409；非法输入返回400；未登录返回401。初始资料只在数据库尚无内容时插入，不覆盖已保存内容。

## 接口

| 方法与地址 | 权限 | 结果 |
| --- | --- | --- |
| GET /api/content | 公开 | 当前profile、projects、revision |
| GET /api/session | 当前会话 | 是否已登录 |
| POST /api/login | 正确密码 | 服务端会话Cookie |
| POST /api/logout | 当前会话 | 撤销会话、清除Cookie |
| PUT /api/content | 已登录且同源 | 校验并保存完整内容 |

## 登录与输入处理

管理员密码由本地生成器随机生成，PBKDF2-SHA256使用随机盐与100000次迭代。云端只配置ADMIN_PASSWORD_HASH Secret。会话有效两小时，使用HttpOnly、SameSite=Strict；HTTPS时加Secure。写接口要求同源Origin与JSON，不开放跨域写入。登录尝试设客户端与全局限流。

JSON请求最多96KB，项目最多30项，所有数据经过服务端校验。前台通过textContent插入文本；示意配图使用固定白名单。静态输出只复制明确的前台文件；数据库、服务端源码、密码文件和测试不进入dist。

## 构建、测试与部署

在项目目录执行：

```text
npm run build
npm test
npm run dev
```

本地地址http://127.0.0.1:4180/，后台/admin/。数据库与登录材料位于项目目录.local，加入忽略规则，交付和公开包均排除。

Cloudflare使用构建命令npm run build，输出dist。D1绑定名DB，执行server/schema.sql，配置ADMIN_PASSWORD_HASH后部署。本项目已经通过Wrangler完成实际发布；真实配置保存在忽略的wrangler.jsonc，交付包保留不含实际ID的配置样例。部署细节见DEPLOYMENT.md。

8组接口/数据测试加1组实际HTTP测试通过，覆盖鉴权、会话撤销、过期、限流、原子校验、版本冲突、独立读取及服务重启持久化。云端另有28项HTTP检查通过，覆盖发布资源、真实登录、D1保存、独立公开读取、冲突拒绝和退出撤销。Chrome桌面实际完成个人简介修改、保存和前台刷新同步，截图与接口证据分别保存；手机硬件未新增实测。

参考：[Pages绑定](https://developers.cloudflare.com/pages/functions/bindings/)、[D1语句接口](https://developers.cloudflare.com/d1/worker-api/prepared-statements/)、[Node 24.12 SQLite](https://nodejs.org/download/release/v24.12.0/docs/api/sqlite.html)。
