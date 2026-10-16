# 个人作品集

新版带内容管理后台：在课设根目录双击“启动作品集后台.cmd”，或在本目录执行`npm run dev`。首页http://127.0.0.1:4180/，后台http://127.0.0.1:4180/admin/。管理员登录信息自动生成在本项目.local/管理员登录.txt，自己保管，不截图上传。再次启动保留密码与数据库。

前台读取服务端内容，支持科研/课程筛选、详情、Escape关闭和焦点恢复。后台可修改个人介绍，新增、修改、移除项目并保存发布。初始内容包括两个科研项目及五个课程项目（新增ImageGrab）；云端内容存储为Cloudflare D1，本地为SQLite。

公开网站：https://school-internship-portfolio-aszz007.pages.dev/ 。后台为同域名/admin/。已部署Pages Functions与D1数据库，云端28项HTTP检查通过，Chrome登录、编辑保存与公开刷新同步通过。

`npm test`运行9组接口和HTTP检查；`npm run build`生成白名单静态资源到dist，函数入口在functions/api。PRD.md、TECH_DESIGN.md、AGENTS.md是本项目实际文档，部署见DEPLOYMENT.md。

原静态预览仍可通过课设根目录`python tools/serve.py`访问http://127.0.0.1:4173/portfolio/；它没有管理API，只显示初始内容，不冒充带数据库的后台。

科研介绍仅依据Req2Inst和Req2Web已有公开说明，不编写未经确认的论文录用、性能成绩或个人分工。只使用aszz007昵称，不补写未知姓名、学号或联系方式。

既有秒哒网址：https://app-f1djq0662tj5.miaoda.online，仍为原v5；本轮后台改动在独立源码实现，并已部署Cloudflare。本目录不是平台源码导出。关于考核四的实际状态，以../../docs/assessment-4.md为准。
