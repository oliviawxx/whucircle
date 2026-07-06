import { useMemo, useState } from "react";
import {
  Bell,
  BookmarkSimple,
  CalendarBlank,
  Camera,
  CaretDown,
  ChatCircle,
  ChatsCircle,
  Compass,
  GearSix,
  Hash,
  Heart,
  House,
  Image,
  MagnifyingGlass,
  MapPin,
  PaperPlaneTilt,
  Plus,
  Repeat,
  ShieldCheck,
  Smiley,
  Star,
  Student,
  UserCircle,
  UserPlus,
  UsersThree,
  VideoCamera,
} from "@phosphor-icons/react";

const currentUser = {
  name: "小珈",
  meta: "2022级 · 法学院",
  avatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
};

const initialPosts = [
  {
    id: 1,
    author: "珞珈山下的风",
    meta: "计算机学院 · 2022级 · 10分钟前 · 公开",
    badge: "已认证",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    tag: "# 珞珈日常",
    body: "今天的樱花也太美了吧！从老图到樱顶一路都是粉色的海洋，武大真的永远不缺浪漫。",
    images: [
      "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=420&q=80",
      "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?auto=format&fit=crop&w=420&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=420&q=80",
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=420&q=80",
    ],
    likes: 128,
    comments: 32,
    reposts: 12,
    liked: true,
    commentList: [
      { user: "银河便利店", text: "拍得好！我想参与组局。" },
      { user: "东湖边的猫", text: "我也想加入！可以拍摄～" },
    ],
  },
  {
    id: 2,
    author: "爱吃热干面的鲨鱼",
    meta: "新闻与传播学院 · 2023级 · 1小时前 · 好友可见",
    badge: "好友",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80",
    tag: "# 毕业影像",
    body: "最近在准备拍毕业纪录片，想找几位同学一起合作！有兴趣的同学评论区扣1呀～",
    images: [],
    likes: 45,
    comments: 18,
    reposts: 3,
    liked: false,
    commentList: [
      { user: "银河便利店", text: "扣1！我学编导的，想参与。" },
      { user: "东湖边的猫", text: "我也想加入！可以拍摄～" },
    ],
  },
  {
    id: 3,
    author: "一只小橘子",
    meta: "测绘学院 · 2021级 · 2小时前 · 公开",
    badge: "活跃",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80",
    tag: "# 周末出行",
    body: "前几天去了磨山，云海真的绝了！分享几张随手拍照片，希望武汉多一点这样的天气。",
    images: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=420&q=80",
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=420&q=80",
    ],
    likes: 76,
    comments: 9,
    reposts: 4,
    liked: false,
    commentList: [],
  },
];

const navItems = [
  ["首页", House],
  ["发现", Compass],
  ["好友", UsersThree],
  ["消息", ChatCircle],
  ["活动", CalendarBlank],
];

const topics = [
  ["樱花季打卡", "2.3万条动态", "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=160&q=80"],
  ["武大食堂推荐", "1.8万条动态", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=160&q=80"],
  ["摄影Club招新", "632条动态", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=160&q=80"],
  ["考研自习室", "457条动态", "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=160&q=80"],
];

const friends = [
  ["林深时见鹿", "经济与管理学院 · 2023级", "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80"],
  ["珞珈少年", "电子信息学院 · 2022级", "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=160&q=80"],
  ["东湖的晚风", "外国语言文学学院 · 2024级", "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=160&q=80"],
];

const pageCopy = {
  首页: ["今天的校园动态", "关注重要内容，减少信息噪音"],
  发现: ["发现", "话题、推荐和校园热点"],
  好友: ["好友", "好友申请、分组和社交圈"],
  消息: ["消息中心", "查看私信、群聊和互动提醒"],
  活动: ["活动", "讲座、社团招新和校园活动"],
  收藏: ["我的收藏", "保存稍后再看的动态和话题"],
  我的主页: ["我的主页", "预览个人资料、动态和社交数据"],
  设置: ["设置", "管理隐私、安全和通知偏好"],
};

const activityCards = [
  ["摄影Club招新", "本周五 19:00 · 信息学部操场", "招募摄影、剪辑和运营同学，现场有作品交流。"],
  ["东湖夜跑小队", "周三 20:30 · 湖滨宿舍门口", "轻松 5 公里路线，新手友好，可直接报名。"],
  ["保研经验分享会", "周六 14:00 · 文理学部教五", "高年级同学分享材料准备、联系导师和面试经验。"],
];

const groupChats = [
  ["毕业影像小组", "12人", "今晚 8 点线上讨论脚本"],
  ["珞珈山跑步群", "48人", "明早 7 点操场集合？"],
  ["考研自习室互助", "126人", "新增 3 个座位共享信息"],
];

export function App() {
  const [posts, setPosts] = useState(initialPosts);
  const [activeNav, setActiveNav] = useState("首页");
  const [draft, setDraft] = useState("");
  const [visibility, setVisibility] = useState("公开");
  const [messageOpen, setMessageOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [expandedPanels, setExpandedPanels] = useState({
    profile: false,
    friends: true,
    topics: true,
    privacy: false,
  });
  const [followed, setFollowed] = useState(new Set(["珞珈少年"]));
  const [privacy, setPrivacy] = useState({
    phone: true,
    online: false,
  });

  const stats = useMemo(() => {
    const likes = posts.reduce((sum, post) => sum + post.likes, 0);
    return { posts: 89 + posts.length, follows: 156, fans: 238, likes };
  }, [posts]);

  function toggleLike(id) {
    setPosts((items) =>
      items.map((post) =>
        post.id === id
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    );
  }

  function addPost() {
    const value = draft.trim();
    if (!value) return;

    const nextPost = {
      id: Date.now(),
      author: currentUser.name,
      meta: `${currentUser.meta} · 刚刚 · ${visibility}`,
      badge: "我",
      avatar: currentUser.avatar,
      tag: "# 今日分享",
      body: value,
      images: [],
      likes: 0,
      comments: 0,
      reposts: 0,
      liked: false,
      commentList: [],
    };

    setPosts((items) => [nextPost, ...items]);
    setDraft("");
  }

  function toggleFollow(name) {
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const page = pageCopy[activeNav] ?? pageCopy["首页"];
  const followedPosts = posts.filter((post) => post.badge === "好友" || post.author === currentUser.name);
  const recommendedPosts = [...posts].sort((a, b) => b.likes + b.comments - (a.likes + a.comments));
  const savedPosts = posts.filter((post) => post.liked).slice(0, 2);

  function handleNav(label) {
    setActiveNav(label);
    if (label === "消息") setMessageOpen(true);
    setUserMenuOpen(false);
  }

  function togglePanel(key) {
    setExpandedPanels((value) => ({ ...value, [key]: !value[key] }));
  }

  function goPersonalPage(label) {
    setActiveNav(label);
    setUserMenuOpen(false);
  }

  function renderComposer() {
    return (
      <section className="composer">
        <img className="avatar" src={currentUser.avatar} alt="当前用户头像" />
        <div className="composer-main">
          <textarea
            id="composer"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="有什么新鲜事想分享给大家？"
          />
          <div className="composer-actions">
            <div className="media-actions">
              <button><Image size={19} />图片</button>
              <button><VideoCamera size={19} />视频</button>
              <button><Smiley size={19} />表情</button>
              <button><MapPin size={19} />位置</button>
            </div>
            <div className="publish-actions">
              <button className="visibility" onClick={() => setVisibility(visibility === "公开" ? "好友可见" : "公开")}>
                <Compass size={18} />
                {visibility}
                <CaretDown size={14} />
              </button>
              <button className="publish" onClick={addPost}>发布</button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderFeed(feedPosts = posts, options = {}) {
    return (
      <section className="feed">
        {feedPosts.length === 0 ? (
          <section className="section-card empty-state">
            <UsersThree size={34} />
            <h2>{options.emptyTitle ?? "这里还没有内容"}</h2>
            <p>{options.emptyText ?? "先关注几位同学，或者发布第一条动态。"}</p>
          </section>
        ) : (
          feedPosts.map((post) => (
            <article className="post" key={post.id}>
              <div className="post-head">
                <img className="avatar" src={post.avatar} alt={`${post.author}头像`} />
                <div>
                  <div className="name-row">
                    <strong>{post.author}</strong>
                    <span>{post.badge}</span>
                  </div>
                  <p>{post.meta}</p>
                </div>
                <button className="more">···</button>
              </div>

              <div className="post-body">
                <a>{post.tag}</a>
                <p>{post.body}</p>
                {post.images.length > 0 && (
                  <div className={`image-grid count-${post.images.length}`}>
                    {post.images.map((image, index) => (
                      <img src={image} alt={`${post.author}动态图片${index + 1}`} key={image} />
                    ))}
                  </div>
                )}
              </div>

              <div className="post-actions">
                <button className={post.liked ? "liked" : ""} onClick={() => toggleLike(post.id)}>
                  <Heart size={20} weight={post.liked ? "fill" : "regular"} />
                  {post.likes}
                </button>
                <button><ChatCircle size={20} />{post.comments}</button>
                <button><Repeat size={20} />{post.reposts}</button>
                <button><BookmarkSimple size={20} />收藏</button>
              </div>

              <div className="comments">
                {post.commentList.map((comment) => (
                  <p key={`${post.id}-${comment.user}`}>
                    <strong>{comment.user}</strong>
                    {comment.text}
                  </p>
                ))}
                <div className="comment-input">
                  <img className="avatar tiny" src={currentUser.avatar} alt="当前用户头像" />
                  <input placeholder="说点什么..." />
                  <Smiley size={18} />
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    );
  }

  function renderTopicPage() {
    return (
      <section className="module-grid">
        {topics.map(([title, count, image]) => (
          <article className="section-card topic-card" key={title}>
            <img src={image} alt={title} />
            <div>
              <p>校园话题</p>
              <h2># {title}</h2>
              <span>{count} · 今日新增讨论 26 条</span>
            </div>
          </article>
        ))}
      </section>
    );
  }

  function renderActivityPage() {
    return (
      <section className="section-card">
        <div className="section-head">
          <div>
            <p>本周推荐</p>
            <h2>活动广场</h2>
          </div>
          <button>发布活动</button>
        </div>
        <div className="activity-list">
          {activityCards.map(([title, time, desc]) => (
            <article className="activity-row" key={title}>
              <CalendarBlank size={24} />
              <div>
                <h3>{title}</h3>
                <span>{time}</span>
                <p>{desc}</p>
              </div>
              <button>查看</button>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderFriendsPage() {
    return (
      <section className="section-card">
        <div className="section-head">
          <div>
            <p>社交圈</p>
            <h2>好友与分组</h2>
          </div>
          <button>处理申请 4</button>
        </div>
        <div className="friend-board">
          {friends.map(([name, meta, avatar]) => (
            <article className="friend-tile" key={name}>
              <img className="avatar large" src={avatar} alt={`${name}头像`} />
              <strong>{name}</strong>
              <span>{meta}</span>
              <button onClick={() => toggleFollow(name)}>{followed.has(name) ? "已在好友圈" : "加入好友圈"}</button>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderMessagesPage() {
    return (
      <section className="section-card">
        <div className="section-head">
          <div>
            <p>收件箱</p>
            <h2>{activeNav === "群聊" ? "群聊列表" : "私信消息"}</h2>
          </div>
          <button onClick={() => setMessageOpen(true)}>打开抽屉</button>
        </div>
        <div className="message-list">
          {groupChats.map(([name, count, text]) => (
            <article className="message-preview" key={name}>
              <ChatsCircle size={25} />
              <div>
                <strong>{name}</strong>
                <span>{count} · {text}</span>
              </div>
              <time>刚刚</time>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderProfilePage() {
    return (
      <section className="section-card profile-page-card">
        <div className="profile-cover" />
        <div className="profile-detail">
          <img className="avatar large" src={currentUser.avatar} alt="当前用户头像" />
          <div>
            <h2>{currentUser.name}</h2>
            <p>{currentUser.meta} · 关注校园生活、摄影和公共议题</p>
          </div>
          <button>编辑资料</button>
        </div>
        <div className="profile-stats wide">
          <span><strong>{stats.posts}</strong>动态</span>
          <span><strong>{stats.follows}</strong>关注</span>
          <span><strong>{stats.fans}</strong>粉丝</span>
          <span><strong>{stats.likes}</strong>获赞</span>
        </div>
      </section>
    );
  }

  function renderSettingsPage() {
    return (
      <section className="section-card settings-page">
        <div className="section-head">
          <div>
            <p>账户设置</p>
            <h2>隐私与安全控制</h2>
          </div>
          <ShieldCheck size={28} />
        </div>
        {["动态默认可见范围：公开", "允许好友给我发私信", "陌生人不可查看在线状态", "登录需要校内邮箱验证"].map((item) => (
          <label className="setting-line" key={item}>
            <span>{item}</span>
            <input type="checkbox" defaultChecked />
          </label>
        ))}
      </section>
    );
  }

  function renderMainContent() {
    if (activeNav === "首页") return <>{renderComposer()}{renderFeed(posts)}</>;
    if (activeNav === "发现") return <>{renderTopicPage()}{renderFeed(recommendedPosts)}</>;
    if (activeNav === "活动") return renderActivityPage();
    if (activeNav === "消息") return renderMessagesPage();
    if (activeNav === "好友") return renderFriendsPage();
    if (activeNav === "收藏") return renderFeed(savedPosts, { emptyTitle: "还没有收藏内容", emptyText: "点击动态下方的收藏后，会出现在这里。" });
    if (activeNav === "我的主页") return <>{renderProfilePage()}{renderFeed(posts.filter((post) => post.author === currentUser.name), { emptyTitle: "还没有发布动态", emptyText: "从发布框开始分享你的第一条校园动态。" })}</>;
    if (activeNav === "设置") return renderSettingsPage();
    return renderFeed(posts);
  }

  return (
    <div className={`app-shell ${rightPanelOpen ? "" : "panel-collapsed"}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Student weight="duotone" size={30} />
          </div>
          <div>
            <strong>WHU Circle</strong>
            <span>武大校园圈</span>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map(([label, Icon]) => (
            <button
              key={label}
              className={`nav-item ${activeNav === label ? "active" : ""}`}
              onClick={() => handleNav(label)}
            >
              <Icon size={21} />
              <span>{label}</span>
              {label === "消息" && <em>3</em>}
            </button>
          ))}
        </nav>

        <button className="primary-action" onClick={() => {
          setActiveNav("首页");
          window.setTimeout(() => document.getElementById("composer")?.focus(), 0);
        }}>
          <PaperPlaneTilt size={20} weight="fill" />
          发布动态
        </button>

        <footer className="side-footer">
          <span>© 2026 WHU Circle</span>
          <span>关于我们 · 帮助中心</span>
        </footer>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p>{activeNav}</p>
            <h1>{page[0]}</h1>
            <span>{page[1]}</span>
          </div>
          <div className="search">
            <MagnifyingGlass size={18} />
            <input placeholder="搜索用户、动态、话题" />
          </div>
          <button className="icon-button" aria-label="通知">
            <Bell size={21} />
            <span />
          </button>
          <div className="user-menu-wrap">
            <button className="avatar-button" onClick={() => setUserMenuOpen((value) => !value)} aria-label="打开个人菜单">
              <img className="avatar small" src={currentUser.avatar} alt="当前用户头像" />
            </button>
            {userMenuOpen && (
              <div className="user-menu">
                <button onClick={() => goPersonalPage("我的主页")}><UserCircle size={18} />我的主页</button>
                <button onClick={() => goPersonalPage("收藏")}><BookmarkSimple size={18} />我的收藏</button>
                <button onClick={() => goPersonalPage("设置")}><GearSix size={18} />设置</button>
              </div>
            )}
          </div>
        </header>

        {renderMainContent()}
      </main>

      <button className="panel-float-toggle" onClick={() => setRightPanelOpen((value) => !value)}>
        {rightPanelOpen ? "收起信息栏" : "展开信息栏"}
      </button>

      {rightPanelOpen && <aside className="right-panel">
        <div className="right-panel-head">
          <div>
            <p>侧边信息</p>
            <h2>可按需查看</h2>
          </div>
          <button onClick={() => setRightPanelOpen(false)}>收起</button>
        </div>
        <section className="profile-card">
          <button className="collapse-title" onClick={() => togglePanel("profile")}>
            <h2>我的状态</h2>
            <span>{expandedPanels.profile ? "收起" : "展开"}</span>
          </button>
          {expandedPanels.profile && (
            <>
              <div className="profile-row">
                <img className="avatar large" src={currentUser.avatar} alt="当前用户头像" />
                <div>
                  <strong>{currentUser.name}</strong>
                  <span>{currentUser.meta}</span>
                </div>
              </div>
              <div className="profile-stats">
                <span><strong>{stats.posts}</strong>动态</span>
                <span><strong>{stats.follows}</strong>关注</span>
                <span><strong>{stats.fans}</strong>粉丝</span>
              </div>
            </>
          )}
        </section>

        <section className="panel-card">
          <div className="panel-title">
            <button className="collapse-title" onClick={() => togglePanel("friends")}>
              <h2>推荐好友</h2>
              <span>{expandedPanels.friends ? "收起" : "展开"}</span>
            </button>
            <button>换一批</button>
          </div>
          {expandedPanels.friends && friends.map(([name, meta, avatar]) => (
            <div className="friend-row" key={name}>
              <img className="avatar" src={avatar} alt={`${name}头像`} />
              <div>
                <strong>{name}</strong>
                <span>{meta}</span>
              </div>
              <button onClick={() => toggleFollow(name)}>
                <Plus size={16} />
                {followed.has(name) ? "已关注" : "关注"}
              </button>
            </div>
          ))}
        </section>

        <section className="panel-card">
          <div className="panel-title">
            <button className="collapse-title" onClick={() => togglePanel("topics")}>
              <h2>校园发现</h2>
              <span>{expandedPanels.topics ? "收起" : "展开"}</span>
            </button>
            <button onClick={() => setActiveNav("发现")}>更多</button>
          </div>
          {expandedPanels.topics && topics.map(([title, count, image]) => (
            <div className="topic-row" key={title}>
              <div>
                <strong># {title}</strong>
                <span>{count}</span>
              </div>
              <img src={image} alt={title} />
            </div>
          ))}
        </section>

        <section className="panel-card privacy-card">
          <div className="panel-title">
            <button className="collapse-title" onClick={() => togglePanel("privacy")}>
              <h2>隐私快捷设置</h2>
              <span>{expandedPanels.privacy ? "收起" : "展开"}</span>
            </button>
            <button onClick={() => goPersonalPage("设置")}>设置</button>
          </div>
          {expandedPanels.privacy && (
            <>
              <div className="privacy-row">
                <span>谁可以看我的动态</span>
                <strong>公开</strong>
              </div>
              <div className="privacy-row">
                <span>谁可以给我发私信</span>
                <strong>好友</strong>
              </div>
              <label className="toggle-row">
                <span>允许通过手机号找到我</span>
                <input
                  type="checkbox"
                  checked={privacy.phone}
                  onChange={(event) => setPrivacy((value) => ({ ...value, phone: event.target.checked }))}
                />
              </label>
              <label className="toggle-row">
                <span>不展示我的在线状态</span>
                <input
                  type="checkbox"
                  checked={privacy.online}
                  onChange={(event) => setPrivacy((value) => ({ ...value, online: event.target.checked }))}
                />
              </label>
            </>
          )}
        </section>
      </aside>}

      {messageOpen && (
        <div className="drawer-backdrop" onClick={() => setMessageOpen(false)}>
          <aside className="message-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <p>消息</p>
                <h2>私信与群聊</h2>
              </div>
              <button onClick={() => setMessageOpen(false)}>关闭</button>
            </div>
            {["毕业影像小组", "珞珈山跑步群", "东湖边的猫"].map((name, index) => (
              <div className="message-row" key={name}>
                <img
                  className="avatar"
                  src={`https://images.unsplash.com/photo-${index === 0 ? "1524504388940-b1c1722653e1" : index === 1 ? "1500648767791-00dcc994a43e" : "1517841905240-472988babdf9"}?auto=format&fit=crop&w=160&q=80`}
                  alt={`${name}头像`}
                />
                <div>
                  <strong>{name}</strong>
                  <span>{index === 0 ? "今晚 8 点线上讨论脚本" : index === 1 ? "明早 7 点操场集合？" : "我把照片传到云盘啦"}</span>
                </div>
                <time>{index + 1}分钟前</time>
              </div>
            ))}
            <button className="new-message">
              <PaperPlaneTilt size={18} weight="fill" />
              发起聊天
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
