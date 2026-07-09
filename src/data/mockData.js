export const currentUser = {
  name: "小张",
  meta: "2024级 · 新闻与传播学院",
  avatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
};

export const initialNotes = [
  {
    id: 1,
    author: "珞珈山下的风",
    meta: "计算机学院 · 12分钟前",
    visibility: "公开",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    title: "傍晚从樱顶走到湖边，光线刚刚好",
    body: "想把今天的散步路线存一下：老图书馆、樱顶、行政楼、东湖边。适合晚饭后慢慢走。",
    images: [
      "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=640&q=80",
    ],
    tags: ["校园生活", "摄影"],
    likes: 128,
    saves: 34,
    comments: [
      { user: "东湖边的猫", text: "这个路线真的很适合晚上散步。" },
      { user: "林深时见鹿", text: "图片氛围好好。" },
    ],
    followed: true,
    mutual: true,
    liked: true,
    saved: false,
  },
  {
    id: 2,
    author: "东湖边的猫",
    meta: "外国语言文学学院 · 38分钟前",
    visibility: "公开",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80",
    title: "求一个期末复习搭子",
    body: "晚上在工学部图书馆，主要复习英语语言学和二外。希望互相监督，不用一直聊天。",
    images: [],
    tags: ["学习", "互助"],
    likes: 45,
    saves: 18,
    comments: [{ user: "小张", text: "我今晚也在，可以一起自习。" }],
    followed: true,
    mutual: false,
    liked: false,
    saved: true,
  },
  {
    id: 3,
    author: "一只小橘子",
    meta: "测绘学院 · 1小时前",
    visibility: "公开",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80",
    title: "磨山云海真的值得早起",
    body: "六点到山顶的时候雾还没散，拍到了很安静的一组照片。路线不难，新手也可以试试。",
    images: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=640&q=80",
    ],
    tags: ["出行", "摄影"],
    likes: 76,
    saves: 21,
    comments: [],
    followed: false,
    mutual: false,
    liked: false,
    saved: false,
  },
  {
    id: 4,
    author: "热干面观察员",
    meta: "经济与管理学院 · 2小时前",
    visibility: "好友可见",
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=160&q=80",
    title: "今日食堂窗口记录",
    body: "桂园二楼新出的鸡腿饭不错，排队十分钟以内。下次想做一个食堂效率小表。",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=640&q=80",
    ],
    tags: ["食堂", "校园生活"],
    likes: 63,
    saves: 10,
    comments: [{ user: "珞珈少年", text: "这个可以做成频道固定帖。" }],
    followed: true,
    mutual: true,
    liked: false,
    saved: false,
  },
  {
    id: 5,
    author: "南湖程序员",
    meta: "电子信息学院 · 3小时前",
    visibility: "私密",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=160&q=80",
    title: "课程项目分工备忘",
    body: "先定接口和页面，再开工。前端不要等后端全部写完，后端也不要等页面完全确定。",
    images: [],
    tags: ["项目", "学习"],
    likes: 0,
    saves: 0,
    comments: [],
    followed: true,
    mutual: false,
    liked: false,
    saved: false,
  },
];

export const initialChannels = [
  {
    id: "study",
    name: "期末互助频道",
    type: "公开",
    joined: true,
    admin: "课程互助组",
    announcement: "置顶资料请先看公告，重复问题会合并到集中帖。",
    members: 1248,
    posts: [
      { id: "s1", title: "高数 A2 历年题整理到 2024 版", pinned: true, likes: 46, replies: 18 },
      { id: "s2", title: "明晚七点线上讲一下离散数学重点", pinned: false, likes: 31, replies: 12 },
      { id: "s3", title: "求推荐适合背书的空教室", pinned: false, likes: 16, replies: 9 },
    ],
  },
  {
    id: "photo",
    name: "校园摄影社",
    type: "公开",
    joined: true,
    admin: "摄影社运营",
    announcement: "本周主题：校园里的蓝色时刻。",
    members: 532,
    posts: [
      { id: "p1", title: "樱顶日落机位集合", pinned: true, likes: 52, replies: 21 },
      { id: "p2", title: "新手相机参数怎么设", pinned: false, likes: 29, replies: 14 },
      { id: "p3", title: "周末东湖边约拍", pinned: false, likes: 18, replies: 7 },
    ],
  },
  {
    id: "secondhand",
    name: "二手交换站",
    type: "密码",
    password: "whu2026",
    joined: false,
    admin: "二手频道管理员",
    announcement: "交易请保留聊天记录，贵重物品建议线下当面确认。",
    members: 916,
    posts: [
      { id: "e1", title: "出一本传播学教材", pinned: true, likes: 24, replies: 11 },
      { id: "e2", title: "求购自行车锁", pinned: false, likes: 13, replies: 6 },
      { id: "e3", title: "毕业搬家小家电低价出", pinned: false, likes: 19, replies: 8 },
      { id: "e4", title: "出显示器 24 寸", pinned: false, likes: 17, replies: 5 },
      { id: "e5", title: "求一个蓝牙键盘", pinned: false, likes: 9, replies: 3 },
      { id: "e6", title: "台灯低价出", pinned: false, likes: 8, replies: 2 },
    ],
  },
];

export const initialChats = [
  {
    id: "group-study",
    name: "期末互助小组",
    type: "群聊",
    unread: 3,
    lastTime: "刚刚",
    messages: [
      { from: "林深时见鹿", text: "今晚先把资料目录定下来。", time: "19:20", mine: false, read: true },
      { from: "我", text: "可以，我负责频道逻辑和原型展示。", time: "19:21", mine: true, read: true },
      { from: "珞珈少年", text: "聊天这里先做静态切换就够了。", time: "19:22", mine: false, read: false },
    ],
  },
  {
    id: "friend-lin",
    name: "林深时见鹿",
    type: "好友",
    unread: 1,
    lastTime: "5分钟前",
    messages: [
      { from: "林深时见鹿", text: "我把频道规则草稿发你了。", time: "18:57", mine: false, read: false },
      { from: "我", text: "收到，我放进设置和频道公告里。", time: "18:59", mine: true, read: true },
    ],
  },
  {
    id: "group-photo",
    name: "摄影社约拍群",
    type: "群聊",
    unread: 0,
    lastTime: "16:20",
    messages: [{ from: "摄影社运营", text: "周六下午三点集合。", time: "16:20", mine: false, read: true }],
  },
];

export const friendRows = [
  { name: "林深时见鹿", state: "好友", detail: "互相关注，可私信、评论好友可见内容" },
  { name: "东湖边的猫", state: "关注中", detail: "你关注了对方，但还不是好友" },
  { name: "一只小橘子", state: "未关注", detail: "关注后内容会进入社交圈" },
];

export const pageCopy = {
  主页: ["主页", "公开笔记瀑布流，搜索、标签和评论详情用于初步展示。"],
  社交圈: ["社交圈", "关注和好友分开展示，好友可见内容只在这里出现。"],
  频道: ["频道", "公开频道直接加入，私密频道需要密码。"],
  聊天: ["聊天", "好友私聊和群聊分开标识，点击会话切换内容。"],
  我的主页: ["我的主页", "展示个人资料和自己的笔记。"],
  收藏: ["我的收藏", "搜索已收藏的笔记。"],
  设置: ["设置", "管理隐私、安全、频道权限和主题颜色。"],
  全站管理: ["全站管理", "账号、频道和内容治理。"],
  用户主页: ["用户主页", "浏览对方公开笔记和资料。"],
};

export const themeOptions = [
  { key: "blue", name: "珞珈蓝", color: "#2563eb" },
  { key: "green", name: "东湖绿", color: "#16856d" },
  { key: "rose", name: "樱花粉", color: "#d8477f" },
  { key: "ink", name: "深灰", color: "#334155" },
];

export const tags = ["全部", "校园生活", "学习", "摄影", "互助", "食堂", "出行", "项目"];

export const initialNotifications = [
  { id: 1, type: "like", user: "林深时见鹿", action: "赞了你的笔记", target: "课程项目分工备忘", time: "刚刚", unread: true },
  { id: 2, type: "comment", user: "东湖边的猫", action: "评论了你的笔记", target: "今天的校园记录", time: "12分钟前", unread: true },
  { id: 3, type: "save", user: "珞珈山下的风", action: "收藏了你的笔记", target: "课程项目分工备忘", time: "1小时前", unread: false },
  { id: 4, type: "comment", user: "频道成员", action: "回复了你的频道帖子", target: "前端接口联调记录", time: "昨天", unread: false },
];
