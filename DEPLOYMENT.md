# Cloudflare Pages部署说明

公开网站：https://school-internship-portfolio-aszz007.pages.dev/

内容管理：https://school-internship-portfolio-aszz007.pages.dev/admin/

## 已部署内容

Cloudflare Pages提供静态资源，Pages Functions处理登录和内容接口，D1保存个人信息、作品及会话。项目名school-internship-portfolio-aszz007，数据库名school-internship-portfolio-content，绑定名DB。通过Wrangler 4.151.0直接发布，只上传本项目的dist及Functions依赖。

真实配置保存在本机忽略的wrangler.jsonc，Secret ADMIN_PASSWORD_HASH通过标准输入配置。实际管理员密码只保存在本项目.local/管理员登录.txt，不写入源码、交付包或截图。源码包保留wrangler.example.jsonc，迁移到其他账号时应创建自己的数据库并填写真实ID。

## 验证结果

- 前台、后台及脚本样式均实际请求成功，公开资源与构建输出一致。
- 28项真实HTTPS检查通过：登录、会话Cookie、未登录拒绝、同源校验、D1保存、独立公开读取、版本冲突及退出撤销。
- Chrome桌面已登录后台，修改个人简介并保存，刷新公开页后显示新内容。两个科研项目与五个课程项目正常加载。
- 完整页面截图接口曾超时；按实际成功保存的浏览器截图核对内容，不把失败调用计为截图完成。

证据在课设根目录evidence/portfolio-cms/cloudflare-deployment.json与cloud-http-verification.json。界面检查和截图另行保存；接口成功不替代未执行的手机硬件测试。

## 本人使用

打开后台，从本机.local/管理员登录.txt复制密码登录，修改个人信息或作品，点击“保存并发布”。看到保存成功后刷新公开页核对。若提示版本冲突，应重新加载后再修改。操作结束退出登录。

只提交公开网站地址及题目要求的截图，不上传密码文件、Secret、数据库或Cloudflare授权材料。没有购买域名或升级付费套餐，现有pages.dev域名可直接访问。

## 后续更新

修改源码后先运行npm test与npm run build。沿用现有数据库和项目，使用wrangler pages deploy dist --project-name school-internship-portfolio-aszz007 --branch main发布，保留D1原内容。仅修改网站文案时直接用后台保存，无需重新发布代码。

参考：[Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)、[Functions绑定与D1](https://developers.cloudflare.com/pages/functions/bindings/)、[Wrangler配置](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)。
