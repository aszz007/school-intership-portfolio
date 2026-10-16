const projects = [
  {
    id:'req2inst', category:'research', title:'Req2Inst', subtitle:'从多模态需求到任务说明', state:'公开源码', art:'inst',
    summary:'将文本、图片与流程图形式的软件需求，转换成结构化的众包任务说明。',
    description:'Req2Inst探索多模态软件需求的理解与表达，通过统一的文本表示和多专家生成，让任务说明更清晰。',
    tags:['Qwen3-8B','Multi-Expert LoRA','多模态需求'],
    points:['接收文本、图片及流程图形式的需求，转换为文本中间表示。','在共享Qwen3-8B骨干上，使用Text、Image、FlowChart与General四个LoRA专家。','输出Definition、Emphasis & Caution、Things to Avoid三部分任务说明。','公开仓库提供源码；运行还需要配置本地模型、权重和其他所需资源。'],
    status:'科研项目介绍依据公开仓库。此页面提供说明与源码入口，未提供在线模型推理服务。',
    sourceUrl:'https://github.com/aszz007/Req2Inst', sourceLabel:'查看源码'
  },
  {
    id:'req2web', category:'research', title:'Req2Web', subtitle:'从需求到可追踪的网页原型', state:'研究原型', art:'web',
    summary:'连接需求处理、页面生成、检查与交付，让网页原型的形成过程可以被查看。',
    description:'Req2Web围绕需求到网页原型的完整流程组织工程产物，并通过Inspector查看它们之间的关系。',
    tags:['需求工程','网页原型','可追踪产物'],
    points:['包含需求处理、检索、结构化页面契约、渲染与一致性检查。','通过Inspector查看过程产物、预览网页并导出交付包。','README提供无需模型的确定性本地演示，与模型生成路线分别说明。','公开源码不包含完整数据集、模型权重或全部历史实验结果。'],
    status:'研究原型，提供公开源码与本地演示说明。无模型演示不能作为实际模型生成效果。',
    sourceUrl:'https://github.com/aszz007/Req2Web', sourceLabel:'查看源码'
  },
  {
    id:'todo', category:'course', title:'课间 · 校园待办清单', subtitle:'把今天安排得清楚一点', state:'进阶版已完成', art:'todo',
    summary:'用日期、优先级和分类整理任务，支持搜索、编辑、备份与撤销。记录保存在当前浏览器。',
    description:'一个轻量的个人任务工具，用于整理课程作业和日常事项。支持可选截止日期与优先级，不需要账号或服务器数据库。',
    tags:['JavaScript','日期与优先级','JSON备份'],
    points:['支持增删改与完成状态，编辑日期、优先级、课程或日常分类。','组合关键词、分类和完成状态筛选，支持日期及优先级排序。','按上海时区显示逾期与今日截止；JSON备份整份校验，替换前确认并支持撤销。','数据保存在当前浏览器；手机与电脑分别拥有自己的本地记录。'],
    status:'可运行源码版已完成，秒哒平台版已发布到v6。源码与平台版分别记录，平台公开访问尚需本人确认。',
    demoUrl:'../todo/', liveUrl:'https://app-f1dgvuck4jk1.miaoda.online', sourceLabel:'本地体验'
  },
  {
    "id": "portfolio",
    "category": "course",
    "art": "portfolio",
    "title": "个人作品集",
    "subtitle": "可编辑内容的科研与课程作品集",
    "state": "已部署",
    "summary": "展示科研与课程项目，支持分类筛选、项目详情和后台内容管理。",
    "description": "原生HTML/CSS/JavaScript实现的个人网站，使用Cloudflare Pages、Functions与D1保存个人介绍和作品内容。",
    "tags": [
      "HTML / CSS / JavaScript",
      "Pages Functions",
      "D1"
    ],
    "points": [
      "展示Req2Inst和Req2Web的项目概述与公开仓库。",
      "按科研项目和课程作品筛选，查看每个项目的详细说明。",
      "后台修改个人信息，新增、编辑和移除作品并保存发布。",
      "服务端验证管理员会话，通过D1向不同浏览器提供相同内容。"
    ],
    "status": "Cloudflare前后台已部署，Chrome登录、修改保存和公开读取同步已验证；手机硬件未新增实测。",
    "sourceUrl": "",
    "liveUrl": "https://school-internship-portfolio-aszz007.pages.dev/",
    "sourceLabel": "查看项目"
  },
  {
    id:'notes', category:'course', title:'纸页 · Markdown学习笔记', subtitle:'让零散知识有处可放', state:'已完成并发布', art:'notes',
    summary:'新建、编辑和搜索笔记，实时预览常用Markdown语法，支持本地保存、导出与删除撤销。',
    description:'课程第二阶段的笔记工具，使用独立的新建内容，便于记录学习和开发过程。',
    tags:['Markdown','本地笔记','文件导出'],
    points:['新建、编辑、删除与10秒撤销。','编辑和实时预览，支持标题与正文搜索。','浏览器保存及单篇.md原文导出。','原始HTML和危险协议链接按文字显示，不执行脚本。'],
    status:'源码与秒哒应用均已实现。笔记仅保存在此浏览器，重要内容请导出留存。',
    demoUrl:'../markdown-notes/',liveUrl:'https://app-f1o6pw59m51d.miaoda.online',sourceLabel:'本地体验'
  },
  {
    id:'weather', category:'course', title:'晴窗 · 城市天气查询', subtitle:'从界面走向真实数据', state:'已完成并发布', art:'weather',
    summary:'调用真实天气接口，展示当前模型估计、三天预报、数据时间和查询失败反馈。',
    description:'课程第二阶段的接口应用，用城市查询练习异步请求、状态反馈和数据核验。',
    tags:['真实接口','异步请求','异常反馈'],
    points:['热门城市与城市候选查询；大连明确对应辽宁省。','显示当前天气估计、三天预报、数据时间及Open-Meteo来源。','处理空输入、未知城市、缺失数据、超时和请求失败。','保留最近6个成功查询城市，新请求结果不会被旧响应覆盖。'],
    status:'已接入Open-Meteo真实接口，当前天气为气象模型估计。源码与平台版分别保存。',
    demoUrl:'../weather/',liveUrl:'https://app-f1o8xoy9m135.miaoda.online',sourceLabel:'本地体验'
  },
{id:'imagegrab',category:'course',title:'图提取 ImageGrab',subtitle:'商品图片的选择与PNG整理',state:'官网已发布',art:'imagegrab',summary:'Chrome扩展收集商品图片，支持去重、尺寸过滤、画廊选择与PNG下载。',description:'以Manifest V3和原生JavaScript实现的课程项目，配套GitHub Pages官网与可下载的插件安装包。',tags:['Chrome扩展','Manifest V3','PNG'],points:['从图片、懒加载属性、srcset和背景图提取候选图片。','画廊支持全选、反选、取消选择，显示图片尺寸及下载状态。','京东真实扩展单图PNG保存已验证；批量及其他平台保留待验证。'],status:'公开源码与官网可用；测试范围按实际验证记录说明。',sourceUrl:'https://github.com/aszz007/school-intership-imagegrab',liveUrl:'https://aszz007.github.io/school-intership-imagegrab/',sourceLabel:'查看源码'}
];
projects.forEach(p => delete p.demoUrl);
export default {profile:{"name": "aszz007", "headline": "从需求开始，\n把想法做成作品。", "introduction": "一名软件工程学生，关注软件需求理解与大模型辅助开发，记录科研探索和课程实践。", "about": "在科研与课设中，我关心需求怎样被理解、模型怎样参与开发，以及生成的结果能否被解释和验证。", "focus": "软件需求 / 大模型 / AI辅助开发", "githubUrl": "https://github.com/aszz007"}, projects};
