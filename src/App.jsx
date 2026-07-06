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
  ["动态广场", House],
  ["关注", UsersThree],
  ["推荐", Star],
  ["校园话题", Hash],
  ["活动广场", CalendarBlank],
  ["消息", ChatCircle],
  ["好友", UserPlus],
  ["群聊", ChatsCircle],
  ["收藏", BookmarkSimple],
  ["我的主页", UserCircle],
  ["设置", GearSix],
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

export function App() {
  const [posts, setPosts] = useState(initialPosts);
  const [activeNav, setActiveNav] = useState("动态广场");
  const [draft, setDraft] = useState("");
  const [visibility, setVisibility] = useState("公开");
  const [messageOpen, setMessageOpen] = useState(false);
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

  return (
    <div className="app-shell">
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
              onClick={() => {
                setActiveNav(label);
                if (label === "消息") setMessageOpen(true);
              }}
            >
              <Icon size={21} />
              <span>{label}</span>
              {label === "消息" && <em>3</em>}
            </button>
          ))}
        </nav>

        <button className="primary-action" onClick={() => document.getElementById("composer")?.focus()}>
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
            <h1>发现校园里的新鲜事</h1>
          </div>
          <div className="search">
            <MagnifyingGlass size={18} />
            <input placeholder="搜索用户、动态、话题" />
          </div>
          <button className="icon-button" aria-label="通知">
            <Bell size={21} />
            <span />
          </button>
          <img className="avatar small" src={currentUser.avatar} alt="当前用户头像" />
        </header>

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

        <section className="feed">
          {posts.map((post) => (
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
          ))}
        </section>
      </main>

      <aside className="right-panel">
        <section className="profile-card">
          <h2>我的主页</h2>
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
        </section>

        <section className="panel-card">
          <div className="panel-title">
            <h2>推荐好友</h2>
            <button>换一批</button>
          </div>
          {friends.map(([name, meta, avatar]) => (
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
            <h2>校园发现</h2>
            <button>查看更多</button>
          </div>
          {topics.map(([title, count, image]) => (
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
            <h2>隐私快捷设置</h2>
            <button>进入设置</button>
          </div>
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
        </section>
      </aside>

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
