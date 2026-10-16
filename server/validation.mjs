const text = (v, max, label, optional = false) => {
  if (typeof v !== 'string' || (!optional && !v.trim()) || v.length > max) throw new Error(`${label}格式不正确`);
  return v.trim();
};
const url = (v, label) => {
  if (!v) return '';
  const parsed = new URL(text(v, 500, label));
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error(`${label}只接受HTTPS地址`);
  return parsed.href;
};
const list = (v, count, max, label) => {
  if (!Array.isArray(v) || v.length > count) throw new Error(`${label}数量不正确`);
  return v.map(x => text(x, max, label));
};
export function validateContent(input) {
  if (!input || !input.profile || !Array.isArray(input.projects) || input.projects.length > 30) throw new Error('内容格式不正确');
  const p = input.profile;
  const profile = {
    name: text(p.name, 40, '昵称'), headline: text(p.headline, 80, '首页标题'),
    introduction: text(p.introduction, 400, '个人简介'), about: text(p.about, 600, '关于我'),
    focus: text(p.focus, 120, '关注方向'), githubUrl: url(p.githubUrl, 'GitHub地址')
  };
  const ids = new Set();
  const projects = input.projects.map(p => {
    const id = text(p.id, 50, '项目标识');
    if (!/^[a-z0-9-]+$/.test(id) || ids.has(id)) throw new Error('项目标识必须唯一且只含小写字母、数字和连字符');
    ids.add(id);
    if (!['research', 'course'].includes(p.category)) throw new Error('项目分类不正确');
    if (!['inst', 'web', 'todo', 'portfolio', 'notes', 'weather', 'imagegrab'].includes(p.art)) throw new Error('项目配图不正确');
    return {id, category:p.category, art:p.art, title:text(p.title, 80, '项目名称'),
      subtitle:text(p.subtitle, 120, '项目副标题'), state:text(p.state, 80, '项目状态'),
      summary:text(p.summary, 600, '项目摘要'), description:text(p.description, 2000, '项目说明'),
      tags:list(p.tags, 8, 40, '技术标签'), points:list(p.points, 10, 400, '功能说明'),
      status:text(p.status, 1000, '实际范围'), sourceUrl:url(p.sourceUrl, '源码地址'),
      liveUrl:url(p.liveUrl, '作品地址'), sourceLabel:'查看项目'};
  });
  return {profile, projects};
}
