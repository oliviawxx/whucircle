import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookmarkSimple,
  CaretDown,
  ChatCircle,
  ChatsCircle,
  CheckCircle,
  DotsThree,
  Flag,
  GearSix,
  Hash,
  Heart,
  House,
  Image,
  LockKey,
  MagnifyingGlass,
  Megaphone,
  PaperPlaneTilt,
  Plus,
  Prohibit,
  PushPin,
  ShieldCheck,
  Student,
  UserCircle,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import {
  login as apiLogin,
  register as apiRegister,
  sendEmailCode as apiSendCode,
  getMe,
  logout as apiLogout,
} from "./api/auth.js";
import { setToken, getToken } from "./api/client.js";
import {
  getNotes, createNote as apiCreateNote, likeNote,
  saveNote, createComment, getTags, getSocialFeed, getComments,
} from "./api/notes.js";
import {
  getChannels, joinChannel as apiJoinChannel, getPosts,
  createChannel as apiCreateChannel, createPost as apiCreatePost, likePost,
} from "./api/channels.js";
import {
  getConversations, getMessages, sendMessage as apiSendMessage, markRead,
} from "./api/chat.js";
import {
  getMyProfile, updateProfile, getRelations, block as apiBlock,
} from "./api/users.js";
import {
  getPrivacy, updatePrivacy as apiUpdatePrivacy,
} from "./api/settings.js";
import { AuthPage } from "./components/auth/AuthPage.jsx";
import { initialNotifications } from "./data/mockData.js";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80";

const DEMO_USER = {
  name: "小张",
  meta: "2024级 · 新闻与传播学院",
  avatar: DEFAULT_AVATAR,
  id: null,
};

const initialNotes = [
  {
    id: 1,
    author: "李健豪",
    meta: "计算机学院 · 15分钟前",
    visibility: "公开",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    title: "好想打cs",
    body: "老图书馆、樱顶、行政楼、东湖边。都不如在回寝室玩游戏。",
    images: [
      "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=640&q=80",
    ],
    tags: ["校园生活", "摄影"],
    likes: 128,
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
    comments: [],
    followed: true,
    mutual: false,
    liked: false,
    saved: false,
  },
];

const initialChannels = [
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

const initialChats = [
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
    messages: [
      { from: "摄影社运营", text: "周六下午三点集合。", time: "16:20", mine: false, read: true },
    ],
  },
];

const friendRows = [
  { name: "林深时见鹿", state: "好友", detail: "互相关注，可私信、评论好友可见内容" },
  { name: "东湖边的猫", state: "关注中", detail: "你关注了对方，但还不是好友" },
  { name: "一只小橘子", state: "未关注", detail: "关注后内容会进入社交圈" },
];

const navItems = [
  ["主页", House],
  ["社交圈", UsersThree],
  ["频道", Hash],
  ["聊天", ChatCircle],
];

const pageCopy = {
  主页: ["主页", "公开笔记瀑布流，搜索、标签和评论详情用于初步展示。"],
  社交圈: ["社交圈", "关注和好友分开展示，好友可见内容只在这里出现。"],
  频道: ["频道", "公开频道直接加入，私密频道需要密码。"],
  聊天: ["聊天", "好友私聊和群聊分开标识，点击会话切换内容。"],
  我的主页: ["我的主页", "展示个人资料和自己的笔记。"],
  收藏: ["我的收藏", "搜索已收藏的笔记。"],
  设置: ["设置", "管理隐私、安全、频道权限和主题颜色。"],
};

const themeOptions = [
  { key: "blue", name: "珞珈蓝", color: "#2563eb" },
  { key: "green", name: "东湖绿", color: "#16856d" },
  { key: "rose", name: "樱花粉", color: "#d8477f" },
  { key: "ink", name: "深灰", color: "#334155" },
];

export function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(DEMO_USER);
  const [authMode, setAuthMode] = useState("登录");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [tagsList, setTagsList] = useState([]);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [relationsData, setRelationsData] = useState([]);
  const [activeNav, setActiveNav] = useState("主页");
  const [notes, setNotes] = useState(initialNotes);
  const [channels, setChannels] = useState(initialChannels);
  const [chats, setChats] = useState(initialChats);
  const [activeChatId, setActiveChatId] = useState(null);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftText, setDraftText] = useState("");
  const [draftVisibility, setDraftVisibility] = useState("公开");
  const [imageCount, setImageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [savedSearch, setSavedSearch] = useState("");
  const [activeTag, setActiveTag] = useState("全部");
  const [detailNote, setDetailNote] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [joinChannel, setJoinChannel] = useState(null);
  const [joinPassword, setJoinPassword] = useState("");
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelType, setNewChannelType] = useState("公开");
  const [newChannelPassword, setNewChannelPassword] = useState("");
  const [newChannelAnnouncement, setNewChannelAnnouncement] = useState("");
  const [channelPostDraftOpen, setChannelPostDraftOpen] = useState(false);
  const [channelPostDraftTitle, setChannelPostDraftTitle] = useState("");
  const [channelPostDraftBody, setChannelPostDraftBody] = useState("");
  const [channelPostDraftTags, setChannelPostDraftTags] = useState([]);
  const [channelPostDraftPinned, setChannelPostDraftPinned] = useState(false);
  const [channelPostDraftImage, setChannelPostDraftImage] = useState(false);
  const [channelPostDetail, setChannelPostDetail] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [reportTarget, setReportTarget] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState("blue");
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileMeta, setProfileMeta] = useState(currentUser.meta);
  const [profileBio, setProfileBio] = useState("校园生活、课程项目、摄影记录");
  const [profileAvatar, setProfileAvatar] = useState(currentUser.avatar);
  const [selectedRelation, setSelectedRelation] = useState("关注");
  const [privacy, setPrivacy] = useState({
    noteVisibility: "公开",
    channelPermission: "公开",
    messagePermission: "仅好友",
  });
  const [blockedUsers, setBlockedUsers] = useState(["校外广告号"]);

  const selectedChannel = channels.find((channel) => channel.id === selectedChannelId) ?? channels[0];
  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? chats[0] ?? null;
  const chatUnreadCount = chats.reduce((sum, chat) => sum + (chat.unread > 0 ? chat.unread : 0), 0);

  const publicNotes = useMemo(
    () =>
      filterNotes(
        notes,
        searchTerm,
        activeTag,
      ),
    [notes, searchTerm, activeTag],
  );

  const socialNotes = useMemo(
    () =>
      notes.filter((note) => {
        if (note.visibility === "私密") return false;
        if (note.visibility === "好友可见") return note.mutual;
        return note.followed;
      }),
    [notes],
  );

  const savedNotes = useMemo(
    () =>
      filterNotes(
        notes.filter((note) => note.saved),
        savedSearch,
        "全部",
      ),
    [notes, savedSearch],
  );

  function filterNotes(items, keyword, tag) {
    const value = keyword.trim().toLowerCase();
    return items.filter((note) => {
      const matchKeyword =
        !value ||
        note.title.toLowerCase().includes(value) ||
        note.body.toLowerCase().includes(value) ||
        note.author.toLowerCase().includes(value);
      const matchTag = tag === "全部" || note.tags.includes(tag);
      return matchKeyword && matchTag;
    });
  }

  function goTo(label) {
    setActiveNav(label);
    setUserMenuOpen(false);
  }

  function fromApiUser(user) {
    return {
      name: user.nickname || "新用户",
      meta: `${user.grade || "待完善"} · ${user.college || "待完善"}`,
      avatar: user.avatarUrl || DEFAULT_AVATAR,
      id: user.id,
    };
  }

  useEffect(() => {
    const existingToken = getToken();
    if (!existingToken) return;

    setAuthLoading(true);
    getMe()
      .then((user) => {
        setCurrentUser(fromApiUser(user));
        setLoggedIn(true);
      })
      .catch(() => {
        setToken("");
        setLoggedIn(false);
      })
      .finally(() => setAuthLoading(false));
  }, []);

  function handleSendCode() {
    setAuthError("");
    setAuthLoading(true);
    apiSendCode(authEmail)
      .then((data) => {
        setCodeSent(true);
        if (data?.mockCode) setAuthCode(data.mockCode);
      })
      .catch((err) => setAuthError(err.message))
      .finally(() => setAuthLoading(false));
  }

  function handleLogin() {
    setAuthError("");
    setAuthLoading(true);
    apiLogin(authEmail, authPassword)
      .then((data) => {
        setCurrentUser(fromApiUser(data.user));
        setLoggedIn(true);
      })
      .catch((err) => setAuthError(err.message))
      .finally(() => setAuthLoading(false));
  }

  function handleRegister() {
    setAuthError("");
    if (authPassword.length < 8) {
      setAuthError("密码至少 8 位");
      return;
    }
    setAuthLoading(true);
    const nickname = authEmail.split("@")[0];
    apiRegister(authEmail, authCode, authPassword, nickname)
      .then((data) => {
        setCurrentUser(fromApiUser(data.user));
        setLoggedIn(true);
      })
      .catch((err) => setAuthError(err.message))
      .finally(() => setAuthLoading(false));
  }

  function handleDemoEntry() {
    setAuthError("");
    setAuthLoading(true);
    setToken("demo-access-token");
    getMe()
      .then((user) => {
        setCurrentUser(fromApiUser(user));
        setLoggedIn(true);
      })
      .catch((err) => {
        setAuthError(err.message);
        setToken("");
      })
      .finally(() => setAuthLoading(false));
  }

  function handleLogout() {
    apiLogout();
    setCurrentUser(DEMO_USER);
    setLoggedIn(false);
    setActiveNav("主页");
  }

  function handleAuthSubmit() {
    if (authMode === "登录") handleLogin();
    else handleRegister();
  }

  // ── 数据映射 ──
  const VIS_MAP = { PUBLIC: "公开", FRIENDS: "好友可见", PRIVATE: "私密" };
  const VIS_REV = { "公开": "PUBLIC", "好友可见": "FRIENDS", "私密": "PRIVATE" };

  function mapNote(apiNote) {
    return {
      id: apiNote.id,
      authorId: apiNote.author?.id,
      author: apiNote.author?.nickname || "未知",
      meta: `${apiNote.author?.college || ""} · ${timeAgo(apiNote.createdAt)}`,
      avatar: apiNote.author?.avatarUrl || DEFAULT_AVATAR,
      title: apiNote.title,
      body: apiNote.content,
      images: apiNote.imageUrls || [],
      tags: apiNote.tags || [],
      visibility: VIS_MAP[apiNote.visibility] || "公开",
      likes: apiNote.likeCount,
      commentCount: apiNote.commentCount,
      comments: [],
      liked: apiNote.liked,
      saved: apiNote.saved,
    };
  }

  function timeAgo(dateStr) {
    if (!dateStr) return "刚刚";
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return "刚刚";
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    return `${Math.floor(diff / 86400)}天前`;
  }

  // ── 数据加载 ──
  async function loadAllData() {
    try {
      const [notesData, channelsData, chatsData, profileData, tagsData, relationsData] =
        await Promise.all([
          getNotes({ scope: "PUBLIC" }),
          getChannels({ joined: null }),
          getConversations(),
          getMyProfile(),
          getTags(),
          getRelations(),
        ]);
      setNotes((notesData?.items || []).map(mapNote));
      setTagsList(tagsData || []);
      setChannels(mapChannels(channelsData?.items || [], profileData?.id));
      setChats(mapChats(chatsData || [], profileData?.id));
      setCurrentUser({
        name: profileData?.nickname || "新用户",
        meta: `${profileData?.grade || ""} · ${profileData?.college || ""}`,
        avatar: profileData?.avatarUrl || DEFAULT_AVATAR,
        id: profileData?.id,
      });
      setProfileData(profileData);
      setRelationsData(relationsData || []);
    } catch {
      // 静默失败，保留 mock 数据兜底
    }
  }

  function mapChannels(apiChannels, myId) {
    return (apiChannels || []).map((ch) => ({
      id: String(ch.id),
      name: ch.name,
      type: ch.joinType === "PASSWORD" ? "密码" : "公开",
      password: ch.password || undefined,
      joined: ch.joined,
      admin: ch.administrator?.nickname || "管理员",
      announcement: ch.announcement || "",
      members: ch.memberCount,
      posts: [],
    }));
  }

  function mapChats(apiChats, myId) {
    return (apiChats || []).map((c) => ({
      id: String(c.id),
      name: c.name,
      type: c.type === "GROUP" ? "群聊" : "好友",
      unread: c.unreadCount || 0,
      lastTime: c.lastMessageAt ? timeAgo(c.lastMessageAt) : "",
      messages: [],
    }));
  }

  useEffect(() => {
    if (loggedIn) loadAllData();
  }, [loggedIn]);

  useEffect(() => {
    if (!chats.length) {
      setActiveChatId(null);
      return;
    }

    if (!activeChatId || !chats.some((chat) => chat.id === activeChatId)) {
      setActiveChatId(chats[0].id);
    }
  }, [activeChatId, chats]);

  function toggleLike(id) {
    likeNote(id).then((res) => {
      setNotes((items) =>
        items.map((note) => (note.id === id ? { ...note, liked: res.active, likes: res.count } : note)),
      );
    }).catch(() => {});
  }

  function toggleSave(id) {
    saveNote(id).then((res) => {
      setNotes((items) =>
        items.map((note) => (note.id === id ? { ...note, saved: res.active } : note)),
      );
    }).catch(() => {});
  }

  function createNote() {
    if (!draftTitle.trim() && !draftText.trim() && imageCount === 0) return;
    apiCreateNote({
      title: draftTitle.trim() || "今天的校园记录",
      content: draftText.trim() || "分享了一张校园图片。",
      visibility: VIS_REV[draftVisibility] || "PUBLIC",
      tags: ["校园生活"],
    }).then((apiNote) => {
      setNotes((items) => [mapNote(apiNote), ...items]);
      setDraftTitle(""); setDraftText(""); setImageCount(0);
      setDraftOpen(false);
      setActiveNav(draftVisibility === "公开" ? "主页" : "社交圈");
    }).catch(() => {});
  }

  function submitJoinChannel() {
    if (!joinChannel) return;
    apiJoinChannel(Number(joinChannel.id), joinPassword || null).then(() => {
      setChannels((items) => items.map((c) => c.id === joinChannel.id ? { ...c, joined: true } : c));
      setSelectedChannelId(joinChannel.id);
      setJoinChannel(null);
      setJoinPassword("");
    }).catch(() => {});
  }

  function submitCreateChannel() {
    const name = newChannelName.trim();
    if (!name) return;
    if (newChannelType === "密码" && !newChannelPassword.trim()) return;

    const createdChannel = {
      id: `channel-${Date.now()}`,
      name,
      type: newChannelType,
      password: newChannelType === "密码" ? newChannelPassword.trim() : undefined,
      joined: true,
      admin: currentUser.name,
      announcement: newChannelAnnouncement.trim() || "欢迎来到新频道，先发布一句公告，告诉大家这里在讨论什么。",
      members: 1,
      posts: [],
    };

    setChannels((items) => [createdChannel, ...items]);
    setSelectedChannelId(createdChannel.id);
    setCreateChannelOpen(false);
    setNewChannelName("");
    setNewChannelType("公开");
    setNewChannelPassword("");
    setNewChannelAnnouncement("");
  }

  function submitCreateChannelPost() {
    const title = channelPostDraftTitle.trim();
    const body = channelPostDraftBody.trim();
    if (!title && !body) return;

    const newPost = {
      id: `post-${Date.now()}`,
      title: title || "新发布的讨论帖",
      pinned: channelPostDraftPinned,

  const initialChannels = [
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

  const initialChats = [
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
      messages: [
        { from: "摄影社运营", text: "周六下午三点集合。", time: "16:20", mine: false, read: true },
      ],
    },
  ];

  const friendRows = [
    { name: "林深时见鹿", state: "好友", detail: "互相关注，可私信、评论好友可见内容" },
    { name: "东湖边的猫", state: "关注中", detail: "你关注了对方，但还不是好友" },
    { name: "一只小橘子", state: "未关注", detail: "关注后内容会进入社交圈" },
  ];

  const navItems = [
    ["主页", House],
    ["社交圈", UsersThree],
    ["频道", Hash],
    ["聊天", ChatCircle],
  ];

  const pageCopy = {
    主页: ["主页", "公开笔记瀑布流，搜索、标签和评论详情用于初步展示。"],
    社交圈: ["社交圈", "关注和好友分开展示，好友可见内容只在这里出现。"],
    频道: ["频道", "公开频道直接加入，私密频道需要密码。"],
    聊天: ["聊天", "好友私聊和群聊分开标识，点击会话切换内容。"],
    我的主页: ["我的主页", "展示个人资料和自己的笔记。"],
    收藏: ["我的收藏", "搜索已收藏的笔记。"],
    设置: ["设置", "管理隐私、安全、频道权限和主题颜色。"],
  };

  const themeOptions = [
    { key: "blue", name: "珞珈蓝", color: "#2563eb" },
    { key: "green", name: "东湖绿", color: "#16856d" },
    { key: "rose", name: "樱花粉", color: "#d8477f" },
    { key: "ink", name: "深灰", color: "#334155" },
  ];

  export function App() {
    const [loggedIn, setLoggedIn] = useState(false);
const [currentUser, setCurrentUser] = useState(DEMO_USER);
const [authMode, setAuthMode] = useState("登录");
const [authEmail, setAuthEmail] = useState("");
const [authPassword, setAuthPassword] = useState("");
const [authCode, setAuthCode] = useState("");
const [codeSent, setCodeSent] = useState(false);
const [authLoading, setAuthLoading] = useState(false);
const [authError, setAuthError] = useState("");
const [tagsList, setTagsList] = useState([]);
const [notifications, setNotifications] = useState(initialNotifications);
const [notificationsOpen, setNotificationsOpen] = useState(false);
const [profileData, setProfileData] = useState(null);
const [relationsData, setRelationsData] = useState([]);
const [activeNav, setActiveNav] = useState("主页");
const [notes, setNotes] = useState(initialNotes);
const [channels, setChannels] = useState(initialChannels);
const [chats, setChats] = useState(initialChats);
const [activeChatId, setActiveChatId] = useState(null);
const [selectedChannelId, setSelectedChannelId] = useState(null);
const [draftOpen, setDraftOpen] = useState(false);
const [draftTitle, setDraftTitle] = useState("");
const [draftText, setDraftText] = useState("");
const [draftVisibility, setDraftVisibility] = useState("公开");
const [imageCount, setImageCount] = useState(0);
const [searchTerm, setSearchTerm] = useState("");
const [savedSearch, setSavedSearch] = useState("");
const [activeTag, setActiveTag] = useState("全部");
const [detailNote, setDetailNote] = useState(null);

const [commentText, setCommentText] = useState("");

const [profileUser, setProfileUser] = useState(null);
const [joinChannel, setJoinChannel] = useState(null);
const [joinPassword, setJoinPassword] = useState("");
const [createChannelOpen, setCreateChannelOpen] = useState(false);
const [newChannelName, setNewChannelName] = useState("");
const [newChannelType, setNewChannelType] = useState("公开");
const [newChannelPassword, setNewChannelPassword] = useState("");
const [newChannelAnnouncement, setNewChannelAnnouncement] = useState("");
const [channelPostDraftOpen, setChannelPostDraftOpen] = useState(false);
const [channelPostDraftTitle, setChannelPostDraftTitle] = useState("");
const [channelPostDraftBody, setChannelPostDraftBody] = useState("");
const [channelPostDraftTags, setChannelPostDraftTags] = useState([]);
const [channelPostDraftPinned, setChannelPostDraftPinned] = useState(false);
const [channelPostDraftImage, setChannelPostDraftImage] = useState(false);
const [channelPostDetail, setChannelPostDetail] = useState(null);
const [chatInput, setChatInput] = useState("");
const [reportTarget, setReportTarget] = useState(null);
const [userMenuOpen, setUserMenuOpen] = useState(false);
const [activeTheme, setActiveTheme] = useState("blue");
const [profileEditOpen, setProfileEditOpen] = useState(false);
const [profileName, setProfileName] = useState(currentUser.name);
const [profileMeta, setProfileMeta] = useState(currentUser.meta);
const [profileBio, setProfileBio] = useState("校园生活、课程项目、摄影记录");
const [profileAvatar, setProfileAvatar] = useState(currentUser.avatar);
const [selectedRelation, setSelectedRelation] = useState("关注");
const [privacy, setPrivacy] = useState({
  noteVisibility: "公开",
  channelPermission: "公开",
  messagePermission: "仅好友",
});
const [blockedUsers, setBlockedUsers] = useState(["校外广告号"]);

const selectedChannel = channels.find((channel) => channel.id === selectedChannelId) ?? channels[0];
const activeChat = chats.find((chat) => chat.id === activeChatId) ?? chats[0];
const chatUnreadCount = chats.reduce((sum, chat) => sum + (chat.unread > 0 ? chat.unread : 0), 0);

const publicNotes = useMemo(
  () =>
    filterNotes(
      notes,
      searchTerm,
      activeTag,
    ),
  [notes, searchTerm, activeTag],
);

const socialNotes = useMemo(
  () =>
    notes.filter((note) => {
      if (note.visibility === "私密") return false;
      if (note.visibility === "好友可见") return note.mutual;
      return note.followed;
    }),
  [notes],
);

const savedNotes = useMemo(
  () =>
    filterNotes(
      notes.filter((note) => note.saved),
      savedSearch,
      "全部",
    ),
  [notes, savedSearch],
);

function filterNotes(items, keyword, tag) {
  const value = keyword.trim().toLowerCase();
  return items.filter((note) => {
    const matchKeyword =
      !value ||
      note.title.toLowerCase().includes(value) ||
      note.body.toLowerCase().includes(value) ||
      note.author.toLowerCase().includes(value);
    const matchTag = tag === "全部" || note.tags.includes(tag);
    return matchKeyword && matchTag;
  });
}

function goTo(label) {
  setActiveNav(label);
  setUserMenuOpen(false);
}

function fromApiUser(user) {
  return {
    name: user.nickname || "新用户",
    meta: `${user.grade || "待完善"} · ${user.college || "待完善"}`,
    avatar: user.avatarUrl || DEFAULT_AVATAR,
    id: user.id,
  };
}

function handleSendCode() {
  setAuthError("");
  setAuthLoading(true);
  apiSendCode(authEmail)
    .then((data) => {
      setCodeSent(true);
      if (data?.mockCode) setAuthCode(data.mockCode);
    })
    .catch((err) => setAuthError(err.message))
    .finally(() => setAuthLoading(false));
}

function handleLogin() {
  setAuthError("");
  setAuthLoading(true);
  apiLogin(authEmail, authPassword)
    .then((data) => {
      setCurrentUser(fromApiUser(data.user));
      setLoggedIn(true);
    })
    .catch((err) => setAuthError(err.message))
    .finally(() => setAuthLoading(false));
}

function handleRegister() {
  setAuthError("");
  if (authPassword.length < 8) {
    setAuthError("密码至少 8 位");
    return;
  }
  setAuthLoading(true);
  const nickname = authEmail.split("@")[0];
  apiRegister(authEmail, authCode, authPassword, nickname)
    .then((data) => {
      setCurrentUser(fromApiUser(data.user));
      setLoggedIn(true);
    })
    .catch((err) => setAuthError(err.message))
    .finally(() => setAuthLoading(false));
}

function handleDemoEntry() {
  setAuthError("");
  setAuthLoading(true);
  setToken("demo-access-token");
  getMe()
    .then((user) => {
      setCurrentUser(fromApiUser(user));
      setLoggedIn(true);
    })
    .catch((err) => {
      setAuthError(err.message);
      setToken("");
    })
    .finally(() => setAuthLoading(false));
}

function handleLogout() {
  apiLogout();
  setCurrentUser(DEMO_USER);
  setLoggedIn(false);
  setActiveNav("主页");
}

function handleAuthSubmit() {
  if (authMode === "登录") handleLogin();
  else handleRegister();
}

// ── 数据映射 ──
const VIS_MAP = { PUBLIC: "公开", FRIENDS: "好友可见", PRIVATE: "私密" };
const VIS_REV = { "公开": "PUBLIC", "好友可见": "FRIENDS", "私密": "PRIVATE" };

function mapNote(apiNote) {
  return {
    id: apiNote.id,
    authorId: apiNote.author?.id,
    author: apiNote.author?.nickname || "未知",
    meta: `${apiNote.author?.college || ""} · ${timeAgo(apiNote.createdAt)}`,
    avatar: apiNote.author?.avatarUrl || DEFAULT_AVATAR,
    title: apiNote.title,
    body: apiNote.content,
    images: apiNote.imageUrls || [],
    tags: apiNote.tags || [],
    visibility: VIS_MAP[apiNote.visibility] || "公开",
    likes: apiNote.likeCount,
    commentCount: apiNote.commentCount,
    comments: [],
    liked: apiNote.liked,
    saved: apiNote.saved,
  };
}

function timeAgo(dateStr) {
  if (!dateStr) return "刚刚";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return `${Math.floor(diff / 86400)}天前`;
}

// ── 数据加载 ──
async function loadAllData() {
  try {
    const [notesData, channelsData, chatsData, profileData, tagsData, relationsData] =
      await Promise.all([
        getNotes({ scope: "PUBLIC" }),
        getChannels({ joined: null }),
        getConversations(),
        getMyProfile(),
        getTags(),
        getRelations(),
      ]);
    setNotes((notesData?.items || []).map(mapNote));
    setTagsList(tagsData || []);
    setChannels(mapChannels(channelsData?.items || [], profileData?.id));
    setChats(mapChats(chatsData || [], profileData?.id));
    setCurrentUser({
      name: profileData?.nickname || "新用户",
      meta: `${profileData?.grade || ""} · ${profileData?.college || ""}`,
      avatar: profileData?.avatarUrl || DEFAULT_AVATAR,
      id: profileData?.id,
    });
    setProfileData(profileData);
    setRelationsData(relationsData || []);
  } catch {
    // 静默失败，保留 mock 数据兜底
  }
}

function mapChannels(apiChannels, myId) {
  return (apiChannels || []).map((ch) => ({
    id: String(ch.id),
    name: ch.name,
    type: ch.joinType === "PASSWORD" ? "密码" : "公开",
    password: ch.password || undefined,
    joined: ch.joined,
    admin: ch.administrator?.nickname || "管理员",
    announcement: ch.announcement || "",
    members: ch.memberCount,
    posts: [],
  }));
}

function mapChats(apiChats, myId) {
  return (apiChats || []).map((c) => ({
    id: String(c.id),
    name: c.name,
    type: c.type === "GROUP" ? "群聊" : "好友",
    unread: c.unreadCount || 0,
    lastTime: c.lastMessageAt ? timeAgo(c.lastMessageAt) : "",
    messages: [],
  }));
}

useEffect(() => {
  if (loggedIn) loadAllData();
}, [loggedIn]);

function toggleLike(id) {
  likeNote(id).then((res) => {
    setNotes((items) =>
      items.map((note) => (note.id === id ? { ...note, liked: res.active, likes: res.count } : note)),
    );
  }).catch(() => { });
}

function toggleSave(id) {
  saveNote(id).then((res) => {
    setNotes((items) =>
      items.map((note) => (note.id === id ? { ...note, saved: res.active } : note)),
    );
  }).catch(() => { });
}


function addComment(noteId, text) {
  if (!text.trim()) return;
  setNotes(prev => prev.map(note =>
    note.id === noteId
      ? { ...note, comments: [...note.comments, { user: currentUser.name, text: text.trim() }] }
      : note
  ));
  // 同时更新弹窗里的当前帖子，让评论立即显示
  setDetailNote(prev => prev && {
    ...prev,
    comments: [...prev.comments, { user: currentUser.name, text: text.trim() }]
  });
  setCommentText("");
}


function createNote() {
  if (!draftTitle.trim() && !draftText.trim() && imageCount === 0) return;
  apiCreateNote({
    title: draftTitle.trim() || "今天的校园记录",
    content: draftText.trim() || "分享了一张校园图片。",
    visibility: VIS_REV[draftVisibility] || "PUBLIC",
    tags: ["校园生活"],
  }).then((apiNote) => {
    setNotes((items) => [mapNote(apiNote), ...items]);
    setDraftTitle(""); setDraftText(""); setImageCount(0);
    setDraftOpen(false);
    setActiveNav(draftVisibility === "公开" ? "主页" : "社交圈");
  }).catch(() => { });
}

function submitJoinChannel() {
  if (!joinChannel) return;
  apiJoinChannel(Number(joinChannel.id), joinPassword || null).then(() => {
    setChannels((items) => items.map((c) => c.id === joinChannel.id ? { ...c, joined: true } : c));
    setSelectedChannelId(joinChannel.id);
    setJoinChannel(null);
    setJoinPassword("");
  }).catch(() => { });
}

function submitCreateChannel() {
  const name = newChannelName.trim();
  if (!name) return;
  if (newChannelType === "密码" && !newChannelPassword.trim()) return;

  const createdChannel = {
    id: `channel-${Date.now()}`,
    name,
    type: newChannelType,
    password: newChannelType === "密码" ? newChannelPassword.trim() : undefined,
    joined: true,
    admin: currentUser.name,
    announcement: newChannelAnnouncement.trim() || "欢迎来到新频道，先发布一句公告，告诉大家这里在讨论什么。",
    members: 1,
    posts: [],
  };

  setChannels((items) => [createdChannel, ...items]);
  setSelectedChannelId(createdChannel.id);
  setCreateChannelOpen(false);
  setNewChannelName("");
  setNewChannelType("公开");
  setNewChannelPassword("");
  setNewChannelAnnouncement("");
}

function submitCreateChannelPost() {
  const title = channelPostDraftTitle.trim();
  const body = channelPostDraftBody.trim();
  if (!title && !body) return;

  const newPost = {
    id: `post-${Date.now()}`,
    title: title || "新发布的讨论帖",
    pinned: channelPostDraftPinned,
    likes: 0,
    replies: 0,
    body,
    tags: channelPostDraftTags,
    image: channelPostDraftImage,
  };

  setChannels((items) =>
    items.map((channel) =>
      channel.id === selectedChannelId
        ? {
          ...channel,
          posts: [newPost, ...channel.posts],
        }
        : channel,
    ),
  );
  setChannelPostDraftOpen(false);
  setChannelPostDraftTitle("");
  setChannelPostDraftBody("");
  setChannelPostDraftTags([]);
  setChannelPostDraftPinned(false);
  setChannelPostDraftImage(false);
}

function blockUser(name) {
  if (!blockedUsers.includes(name)) setBlockedUsers((items) => [name, ...items]);
  setProfileUser(null);
}

function updatePrivacy(key, value) {
  setPrivacy((items) => ({ ...items, [key]: value }));
  if (key === "noteVisibility") setDraftVisibility(value);
}

function markAllChatsAsRead() {
  setChats((items) => items.map((chat) => ({ ...chat, unread: 0 })));
}

function saveProfile() {
  updateProfile({
    nickname: profileName,
    college: profileMeta.includes("·") ? profileMeta.split("·")[1]?.trim() : profileMeta,
    grade: profileMeta.includes("·") ? profileMeta.split("·")[0]?.trim() : profileMeta,
    bio: profileBio,
    avatarUrl: profileAvatar,
  }).then(() => {
    setCurrentUser((u) => ({ ...u, name: profileName, meta: profileMeta, avatar: profileAvatar }));
    setProfileEditOpen(false);
  }).catch(() => { });
}

function openChat(chatId) {
  setActiveChatId(chatId);
  setChats((items) =>
    items.map((chat) => (chat.id === chatId ? { ...chat, unread: 0 } : chat)),
  );
}

function sendChatMessage() {
  const text = chatInput.trim();
  if (!text) return;

  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const message = { from: "我", text, time, mine: true, read: true };

  setChats((items) =>
    items.map((chat) =>
      chat.id === activeChatId
        ? {
          ...chat,
          messages: [...chat.messages, message],
          lastTime: "刚刚",
        }
        : chat,
    ),
  );
  setChatInput("");
}

function renderIconButton({ title, children, onClick, active }) {
  return (
    <button className={active ? "icon-mini active" : "icon-mini"} title={title} onClick={onClick}>
      {children}
    </button>
  );
}

function renderNotes(items, variant = "masonry") {
  return (
    <section className={variant === "masonry" ? "masonry-feed" : "linear-feed"}>
      {items.map((note) => (
        <article className="note-card" key={note.id}>
          {note.images.length > 0 && (
            <img className="note-cover" src={note.images[0]} alt={`${note.author}发布的图片`} />
          )}
          <div className="note-content">
            <div className="note-author">
              <button className="avatar-button" title="查看主页" onClick={() => setProfileUser(note)}>
                <img className="avatar" src={note.avatar} alt={`${note.author}头像`} />
              </button>
            ))}
        </aside>
      </section>
    );
  }

  function renderChats() {
    if (!chats.length || !activeChat) {
      return (
        <section className="chat-layout">
          <aside className="chat-list">
            <div className="chat-list-head">
              <div>
                <h2>消息</h2>
              </div>
            </div>
            <div className="empty-state">暂无会话，先去发起一条消息吧。</div>
          </aside>
          <section className="chat-window">
            <div className="empty-state">请选择一个会话开始聊天。</div>
          </section>
        </section>
      );
    }

    return (
      <section className="chat-layout">
        <aside className="chat-list">
          <div className="chat-list-head">
            <div>
              <h2>消息</h2>
            </div>
            <button className="ghost-button small" onClick={markAllChatsAsRead}>全部已读</button>
          </div>
          {chats.map((chat) => (
            <button
              className={activeChatId === chat.id ? "chat-preview active" : "chat-preview"}
              key={chat.id}
              onClick={() => openChat(chat.id)}
            >
              <div className="chat-avatar">
                {chat.type === "群聊" ? <ChatsCircle size={22} /> : <UserCircle size={22} />}
              </div>
              <div>
                <strong>{note.author}</strong>
                <span>{note.meta}</span>
              </div>
              {renderIconButton({
                title: "举报笔记",
                onClick: () => setReportTarget({ type: "笔记", title: note.title }),
                children: <Flag size={17} />,
              })}
            </div>
            <button className="note-open" onClick={() => setDetailNote(note)}>
              <h2>{note.title}</h2>
              <p>{note.body}</p>
            </button>
            <div className="tag-row">
              {note.tags.map((tag) => (
                <button key={tag} onClick={() => setActiveTag(tag)}>#{tag}</button>
              ))}
            </div>
            <div className="note-actions">
              <button className={note.liked ? "active" : ""} title="点赞" onClick={() => toggleLike(note.id)}>
                <Heart size={19} weight={note.liked ? "fill" : "regular"} />
                {note.likes}
              </button>
              <button title="评论" onClick={() => setDetailNote(note)}>
                <ChatCircle size={19} />
                {note.comments.length}
              </button>
              <button className={note.saved ? "active" : ""} title="收藏" onClick={() => toggleSave(note.id)}>
                <BookmarkSimple size={19} weight={note.saved ? "fill" : "regular"} />
              </button>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

function renderHome() {
  return (
    <>
      <section className="filter-bar">
        <div className="search wide">
          <MagnifyingGlass size={18} />
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="搜索笔记、作者、内容" />
        </div>
        <div className="tag-filter">
          {["全部", ...tagsList.filter((tag) => tag !== "全部")].map((tag) => (
            <button className={activeTag === tag ? "active" : ""} key={tag} onClick={() => setActiveTag(tag)}>
              {tag}
            </button>
          ))}
        </div>
      </section>
      {renderNotes(publicNotes)}
    </>
  );
}

function renderSocialCircle() {
  return (
    <section className="split-view">
      <section className="section-card">
        <div className="section-head">
          <div>
            <p>关注流</p>
            <h2>关注内容与好友可见内容</h2>
          </div>
          <span>好友可见笔记只在这里出现。</span>
        </div>
        {renderNotes(socialNotes, "linear")}
      </section>
      <aside className="compact-panel">
        <div className="panel-head">
          <h2>关系状态</h2>
          <span>互关后自动进入好友列表</span>
        </div>
        {friendRows.map((friend) => (
          <article className="relation-row" key={friend.name}>
            <div>
              <strong>{friend.name}</strong>
              <span>{friend.detail}</span>
            </div>
            <em>{friend.state}</em>
          </article>
        ))}
      </aside>
    </section>
  );
}

function renderChannels() {
  const previewPosts = selectedChannel.joined ? selectedChannel.posts : selectedChannel.posts.slice(0, 5);
  return (
    <section className="channel-layout">
      <aside className="channel-list">
        <div className="panel-head channel-list-head">
          <div>
            <h2>频道</h2>
            <span>公开 / 密码</span>
          </div>
          <button className="ghost-button small" onClick={() => setCreateChannelOpen(true)}>
            <Plus size={16} />
            创建
          </button>
        </div>
        {channels.map((channel) => (
          <button
            className={selectedChannel.id === channel.id ? "channel-item active" : "channel-item"}
            key={channel.id}
            onClick={() => setSelectedChannelId(channel.id)}
          >
            {channel.type === "密码" ? <LockKey size={18} /> : <Hash size={18} />}
            <span>{channel.name}</span>
            {!channel.joined && <em>{channel.type}</em>}
          </button>
        ))}
      </aside>

      <section className="channel-board">
        <div className="channel-cover">
          <div>
            <p>{selectedChannel.type === "密码" ? "私密频道" : "公开频道"}</p>
            <h2>{selectedChannel.name}</h2>
            <span>{selectedChannel.members} 人 · 管理员：{selectedChannel.admin}</span>
          </div>
          {selectedChannel.joined ? (
            <button className="ghost-button"><CheckCircle size={18} />已加入</button>
          ) : (
            <button onClick={() => setJoinChannel(selectedChannel)}>
              {selectedChannel.type === "密码" ? <LockKey size={18} /> : <Hash size={18} />}
              加入
            </button>
          )}
        </div>
        <div className="announcement">
          <Megaphone size={18} />
          <span>{selectedChannel.announcement}</span>
        </div>
        {selectedChannel.joined && (
          <div className="channel-actions">
            <button className="submit-note" onClick={() => setChannelPostDraftOpen(true)}>
              <PaperPlaneTilt size={18} weight="fill" />
              发帖
            </button>
          </div>
        )}
        <div className="channel-posts">
          {previewPosts.map((post) => (
            <article className="channel-post" key={post.id}>
              <button className="post-title-button" onClick={() => setChannelPostDetail({ channel: selectedChannel, post })}>
                {post.pinned && <PushPin size={16} weight="fill" />}
                <strong>{post.title}</strong>
                {post.body && <span className="post-body-preview">{post.body}</span>}
                <span>{post.replies} 回复 · {post.likes} 赞</span>
                {post.tags?.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map((tag) => <em key={tag}>#{tag}</em>)}
                  </div>
                )}
              </button>
              {renderIconButton({
                title: "举报频道帖子",
                onClick: () => setReportTarget({ type: "频道帖子", title: post.title }),
                children: <Flag size={17} />,
              })}
            </article>
          ))}
        </div>
        {!selectedChannel.joined && (
          <div className="join-reminder">
            <LockKey size={22} />
            <span>未加入时仅预览前 5 条帖子。加入后可发帖、回复、点赞。</span>
          </div>
        )}
      </section>

      <aside className="compact-panel ranking-panel">
        <div className="panel-head">
          <h2>频道榜单</h2>
          <span>按成员数展示</span>
        </div>
        {[...channels]
          .sort((a, b) => b.members - a.members)
          .map((channel, index) => (
            <button className="rank-row" key={channel.id} onClick={() => setSelectedChannelId(channel.id)}>
              <strong>{index + 1}</strong>
              <span>{channel.name}</span>
              <em>{channel.members} 人</em>
            </button>
          ))}
      </aside>
    </section>
  );
}

function renderChats() {
  return (
    <section className="chat-layout">
      <aside className="chat-list">
        <div className="chat-list-head">
          <div>
            <h2>消息</h2>
          </div>
          <button className="ghost-button small" onClick={markAllChatsAsRead}>全部已读</button>
        </div>
        {chats.map((chat) => (
          <button
            className={activeChatId === chat.id ? "chat-preview active" : "chat-preview"}
            key={chat.id}
            onClick={() => openChat(chat.id)}
          >
            <div className="chat-avatar">
              {chat.type === "群聊" ? <ChatsCircle size={22} /> : <UserCircle size={22} />}
            </div>
            <div>
              <strong>{chat.name}</strong>
              <span>{chat.messages.at(-1)?.text}</span>
            </div>
            <time>{chat.lastTime}</time>
            {chat.unread > 0 && <em>{chat.unread}</em>}
          </button>
        ))}
      </aside>

      <section className="chat-window">
        <div className="chat-window-head">
          <div>
            <p>{activeChat.type}</p>
            <h2>{activeChat.name}</h2>
          </div>
          {renderIconButton({
            title: "更多",
            children: <DotsThree size={22} />,
          })}
        </div>
        <div className="bubble-list">
          {activeChat.messages.map((message, index) => (
            <div className={message.mine ? "message-line mine" : "message-line"} key={`${message.text}-${index}`}>
              <p className={message.mine ? "bubble mine" : "bubble other"}>{message.text}</p>
              <div className="message-meta">
                <span>{message.time}</span>
                {message.mine && <span>{message.read ? "已读" : "未读"}</span>}
                {renderIconButton({
                  title: "举报消息",
                  onClick: () => setReportTarget({ type: "聊天消息", title: message.text }),
                  children: <Flag size={15} />,
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              sendChatMessage();
            }
          }} placeholder="输入消息..." />
          <button title="发送" onClick={sendChatMessage}>
            <PaperPlaneTilt size={18} weight="fill" />
          </button>
        </div>
      </section>
    </section>
  );
}

function renderProfile() {
  const ownNotes = notes.filter((note) => note.author === profileName || note.visibility === "私密");
  const relationCards = [
    { label: "关注", value: 42, hint: "正在关注" },
    { label: "粉丝", value: 18, hint: "关注你" },
    { label: "好友", value: 16, hint: "互相关注" },
    { label: "频道", value: channels.filter((channel) => channel.joined).length, hint: "已加入" },
  ];
  const relationDetails = {
    关注: [
      { name: "林深时见鹿", detail: "正在共同复习课程" },
      { name: "东湖边的猫", detail: "校园摄影爱好者" },
      { name: "一只小橘子", detail: "周末约拍" },
    ],
    粉丝: [
      { name: "珞珈少年", detail: "刚刚关注了你" },
      { name: "南湖程序员", detail: "在看你的项目分享" },
    ],
    好友: [
      { name: "林深时见鹿", detail: "互相关注 · 可私信" },
      { name: "东湖边的猫", detail: "关注中 · 可评论" },
    ],
    频道: channels.filter((channel) => channel.joined).map((channel) => ({
      name: channel.name,
      detail: channel.type === "密码" ? "私密频道" : "公开频道",
    })),
  };

  return (
    <section className="section-card profile-page-card">
      <div className="profile-cover" />
      <div className="profile-line">
        <img className="avatar large" src={profileAvatar} alt="当前用户头像" />
        <div>
          <h2>{profileName}</h2>
          <p>{profileMeta}</p>
          <span>{profileBio}</span>
        </div>
        <button onClick={() => setProfileEditOpen(true)}>编辑</button>
      </div>

      <div className="profile-summary-grid">
        <section className="profile-summary-card">
          <div className="section-head compact">
            <div>
              <p>基本信息</p>
              <h2>个人资料</h2>
            </div>
          </div>
          <div className="profile-detail-list">
            <div>
              <strong>学校</strong>
              <span>武汉大学</span>
            </div>
            <div>
              <strong>专业</strong>
              <span>新闻与传播学院</span>
            </div>
            <div>
              <strong>身份</strong>
              <span>学生 · 生活分享者</span>
            </div>
          </div>
        </section>

        <section className="profile-summary-card">
          <div className="section-head compact">
            <div>
              <p>关系</p>
              <h2>社交概览</h2>
            </div>
          </div>
          <div className="profile-stats compact">
            {relationCards.map((item) => (
              <button
                className={selectedRelation === item.label ? "profile-stat-card active" : "profile-stat-card"}
                key={item.label}
                onClick={() => setSelectedRelation(item.label)}
              >
                <strong>{item.value}</strong>
                <em>{item.label}</em>
                <small>{item.hint}</small>
              </button>
            ))}
          </div>
          <div className="relation-detail-list">
            {relationDetails[selectedRelation].map((item) => (
              <div className="relation-detail-item" key={item.name}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.detail}</span>
                </div>
                <button>查看</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="profile-note-section">
        <div className="section-head compact">
          <div>
            <p>我的动态</p>
            <h2>我发布过的笔记</h2>
          </div>
        </div>
        {ownNotes.length === 0 ? (
          <div className="empty-state">你还没有发布过笔记。</div>
        ) : (
          renderNotes(ownNotes, "linear")
        )}
      </section>
    </section>
  );
}

function renderSaved() {
  return (
    <section className="section-card">
      <div className="section-head">
        <div>
          <p>收藏</p>
          <h2>搜索已收藏笔记</h2>
        </div>
      </div>
      <div className="search saved-search">
        <MagnifyingGlass size={18} />
        <input value={savedSearch} onChange={(event) => setSavedSearch(event.target.value)} placeholder="搜索收藏" />
      </div>
      {renderNotes(savedNotes, "linear")}
    </section>
  );
}

function renderSettings() {
  return (
    <section className="section-card settings-page">
      <div className="section-head">
        <div>
          <p>隐私与安全</p>
          <h2>展示版设置中心</h2>
        </div>
        <ShieldCheck size={28} />
      </div>
      {renderSegment("笔记可见范围", "noteVisibility", ["公开", "好友可见", "私密"])}
      {renderSegment("频道权限", "channelPermission", ["公开", "密码"])}
      {renderSegment("私信权限", "messagePermission", ["允许所有人", "仅好友", "不接收陌生人私信"])}
      <section className="setting-block">
        <div>
          <strong>黑名单</strong>
          <span>拉黑后不能私信、评论、查看主页</span>
        </div>
        <div className="block-list">
          {blockedUsers.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
      </section>
      <section className="setting-block">
        <div>
          <strong>主题颜色</strong>
          <span>用于导航、按钮和高亮信息</span>
        </div>
        <div className="theme-options">
          {themeOptions.map((theme) => (
            <button
              className={activeTheme === theme.key ? "theme-choice active" : "theme-choice"}
              key={theme.key}
              onClick={() => setActiveTheme(theme.key)}
            >
              <span style={{ background: theme.color }} />
              {theme.name}
            </button>
          ))}
        </div>
      </section>
    );
  }

  function renderMainContent() {
    if (activeNav === "主页") return renderHome();
    if (activeNav === "社交圈") return renderSocialCircle();
    if (activeNav === "频道") return renderChannels();
    if (activeNav === "聊天") return renderChats();
    if (activeNav === "我的主页") return renderProfile();
    if (activeNav === "收藏") return renderSaved();
    if (activeNav === "设置") return renderSettings();
    return renderHome();
  }

  const page = pageCopy[activeNav] ?? pageCopy["主页"];

  if (!loggedIn) {
    return (
      <AuthPage
        activeTheme={activeTheme}
        mode={authMode}
        email={authEmail}
        password={authPassword}
        code={authCode}
        codeSent={codeSent}
        authError={authError}
        authLoading={authLoading}
        onModeChange={(mode) => { setAuthMode(mode); setAuthError(""); }}
        onEmailChange={setAuthEmail}
        onPasswordChange={setAuthPassword}
        onCodeChange={setAuthCode}
        onSendCode={handleSendCode}
        onEnter={handleAuthSubmit}
        onKeyDown={(event) => { if (event.key === "Enter") handleAuthSubmit(); }}
      />
    );
  }

  return (
    <div className={`app-shell theme-${activeTheme}`}>
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
            <button className={activeNav === label ? "nav-item active" : "nav-item"} key={label} onClick={() => goTo(label)}>
              <Icon size={21} />
              <span>{label}</span>
              {label === "聊天" && chatUnreadCount > 0 && <em>{chatUnreadCount}</em>}
            </button>
          ))}
        </nav>

        <button className="publish-entry" onClick={() => setDraftOpen(true)}>
          <PaperPlaneTilt size={20} weight="fill" />
          发布笔记
        </button>

        <footer className="side-profile">
          <button className="profile-button" onClick={() => setUserMenuOpen((value) => !value)}>
            <img className="avatar" src={currentUser.avatar} alt="当前用户头像" />
            <div>
              <strong>{currentUser.name}</strong>
              <span>个人中心</span>
            </div>
            <CaretDown size={15} />
          </button>
          {userMenuOpen && (
            <div className="user-menu">
              <button onClick={() => goTo("我的主页")}><UserCircle size={18} />我的主页</button>
              <button onClick={() => goTo("收藏")}><BookmarkSimple size={18} />我的收藏</button>
              <button onClick={() => goTo("设置")}><GearSix size={18} />设置</button>
              <button onClick={handleLogout}>退出登录</button>
            </div>
          )}
        </footer>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <h1>{page[0]}</h1>
          </div>
          <div className="notification-wrap">
            <button className="icon-button" aria-label="通知" aria-expanded={notificationsOpen} title="通知"
              onClick={() => setNotificationsOpen((value) => !value)}>
              <Bell size={21} />
              {notifications.some((item) => item.unread) && <span />}
            </button>
            {notificationsOpen && (
              <section className="notification-panel">
                <div className="notification-head">
                  <h2>通知</h2>
                  <button disabled={!notifications.some((item) => item.unread)}
                    onClick={() => setNotifications((items) => items.map((item) => ({ ...item, unread: false })))}>
                    全部已读
                  </button>
                </div>
                <div className="notification-list">
                  {notifications.map((item) => (
                    <article className={item.unread ? "notification-item unread" : "notification-item"} key={item.id}>
                      <div className="notification-icon">
                        {item.type === "like" && <Heart size={18} weight="fill" />}
                        {item.type === "comment" && <ChatCircle size={18} weight="fill" />}
                        {item.type === "save" && <BookmarkSimple size={18} weight="fill" />}
                      </div>
                      <div>
                        <p><strong>{item.user}</strong>{item.action}</p>
                        <span>{item.target} · {item.time}</span>
                      </div>
                      {item.unread && <i />}
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        </header>
        {renderMainContent()}
      </main>

      {draftOpen && (
        <div className="modal-backdrop" onClick={() => setDraftOpen(false)}>
          <section className="draft-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title="发布笔记" subtitle="文字、图片或图文内容" onClose={() => setDraftOpen(false)} />
            <input className="title-input" value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="标题" />
            <textarea value={draftText} onChange={(event) => setDraftText(event.target.value)} placeholder="分享你想记录的内容..." />
            <div className="draft-tools">
              <button onClick={() => setImageCount((value) => Math.min(value + 1, 3))}>
                <Image size={18} />
                图片 {imageCount > 0 ? imageCount : ""}
              </button>
              <div className="segmented compact">
                {["公开", "好友可见", "私密"].map((item) => (
                  <button className={draftVisibility === item ? "active" : ""} key={item} onClick={() => setDraftVisibility(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <button className="submit-note" onClick={createNote}>发布</button>
          </section>
        </div>
      )}

      {detailNote && (
        <div className="modal-backdrop" onClick={() => setDetailNote(null)}>
          <section className="detail-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title={detailNote.title} subtitle={`${detailNote.author} · ${detailNote.meta}`} onClose={() => setDetailNote(null)} />
            {detailNote.images[0] && <img className="detail-image" src={detailNote.images[0]} alt="笔记图片" />}
            <p className="detail-body">{detailNote.body}</p>
            <div className="comment-panel">
              <h3>评论</h3>
              {detailNote.comments.length === 0 ? (
                <span className="muted">还没有评论。</span>
              ) : (
                detailNote.comments.map((comment) => (
                  <p key={`${comment.user}-${comment.text}`}><strong>{comment.user}</strong>{comment.text}</p>
                ))
              )}
              <div className="comment-input">
                <input
                  placeholder="写评论..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addComment(detailNote.id, commentText)}
                />
                <button title="发送" onClick={() => addComment(detailNote.id, commentText)}>
                  <PaperPlaneTilt size={17} weight="fill" />
                </button>
              </div>
            </div>
            <div className="modal-actions">
              <button title="举报" onClick={() => setReportTarget({ type: "笔记", title: detailNote.title })}><Flag size={18} />举报</button>
            </div>
          </section>
        </div>
      )}

      {joinChannel && (
        <div className="modal-backdrop" onClick={() => setJoinChannel(null)}>
          <section className="small-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title="加入频道" subtitle={joinChannel.name} onClose={() => setJoinChannel(null)} />
            {joinChannel.type === "密码" && (
              <input className="title-input" value={joinPassword} onChange={(event) => setJoinPassword(event.target.value)} placeholder="输入频道密码：whu2026" />
            )}
            <button className="submit-note" onClick={submitJoinChannel}>加入</button>
          </section>
        </div>
      )}

      {profileEditOpen && (
        <div className="modal-backdrop" onClick={() => setProfileEditOpen(false)}>
          <section className="small-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title="编辑资料" subtitle="更新你的个人信息" onClose={() => setProfileEditOpen(false)} />
            <label className="auth-field">
              <span>昵称</span>
              <input className="title-input" value={profileName} onChange={(event) => setProfileName(event.target.value)} placeholder="输入昵称" />
            </label>
            <label className="auth-field">
              <span>学院/年级</span>
              <input className="title-input" value={profileMeta} onChange={(event) => setProfileMeta(event.target.value)} placeholder="例如：2024级 · 计算机学院" />
            </label>
            <label className="auth-field">
              <span>个人简介</span>
              <input className="title-input" value={profileBio} onChange={(event) => setProfileBio(event.target.value)} placeholder="一句话介绍自己" />
            </label>
            <label className="auth-field">
              <span>头像链接</span>
              <input className="title-input" value={profileAvatar} onChange={(event) => setProfileAvatar(event.target.value)} placeholder="输入头像图片地址" />
            </label>
            <button className="submit-note" onClick={saveProfile}>保存</button>
          </section>
        </div>
      )}

      {createChannelOpen && (
        <div className="modal-backdrop" onClick={() => setCreateChannelOpen(false)}>
          <section className="small-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title="创建新频道" subtitle="为校园话题建立一个专属空间" onClose={() => setCreateChannelOpen(false)} />
            <label className="auth-field">
              <span>频道名称</span>
              <input className="title-input" value={newChannelName} onChange={(event) => setNewChannelName(event.target.value)} placeholder="例如：武大摄影交流" />
            </label>
            <div className="segmented compact">
              {['公开', '密码'].map((option) => (
                <button className={newChannelType === option ? 'active' : ''} key={option} onClick={() => setNewChannelType(option)}>
                  {option}
                </button>
              ))}
            </div>
            {newChannelType === '密码' && (
              <label className="auth-field">
                <span>频道密码</span>
                <input className="title-input" value={newChannelPassword} onChange={(event) => setNewChannelPassword(event.target.value)} placeholder="设置加入密码" />
              </label>
            )}
            <label className="auth-field">
              <span>频道公告</span>
              <textarea className="title-input" value={newChannelAnnouncement} onChange={(event) => setNewChannelAnnouncement(event.target.value)} placeholder="写一句欢迎语或规则说明" />
            </label>
            <button className="submit-note" onClick={submitCreateChannel}>创建频道</button>
          </section>
        </div>
      )}

      {channelPostDraftOpen && (
        <div className="modal-backdrop" onClick={() => setChannelPostDraftOpen(false)}>
          <section className="small-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title="发布频道帖子" subtitle={selectedChannel?.name} onClose={() => setChannelPostDraftOpen(false)} />
            <label className="auth-field">
              <span>标题</span>
              <input className="title-input" value={channelPostDraftTitle} onChange={(event) => setChannelPostDraftTitle(event.target.value)} placeholder="写一个吸引人的标题" />
            </label>
            <label className="auth-field">
              <span>内容</span>
              <textarea className="title-input" value={channelPostDraftBody} onChange={(event) => setChannelPostDraftBody(event.target.value)} placeholder="分享你想讨论的内容..." />
            </label>
            <div className="draft-tools">
              <button onClick={() => setChannelPostDraftImage((value) => !value)}>
                <Image size={18} />
                {channelPostDraftImage ? "已附图" : "附图"}
              </button>
              <div className="segmented compact">
                {['学习', '活动', '求助', '闲聊'].map((tag) => (
                  <button className={channelPostDraftTags.includes(tag) ? 'active' : ''} key={tag} onClick={() => {
                    setChannelPostDraftTags((items) => items.includes(tag) ? items.filter((item) => item !== tag) : [...items, tag]);
                  }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <label className="segmented compact">
              <button className={channelPostDraftPinned ? 'active' : ''} onClick={() => setChannelPostDraftPinned((value) => !value)}>
                <PushPin size={16} />
                置顶此帖
              </button>
            </label>
            <button className="submit-note" onClick={submitCreateChannelPost}>发布</button>
          </section>
        </div>
      )}

      {channelPostDetail && (
        <div className="modal-backdrop" onClick={() => setChannelPostDetail(null)}>
          <section className="small-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title={channelPostDetail.post.title} subtitle={channelPostDetail.channel.name} onClose={() => setChannelPostDetail(null)} />
            <p className="detail-body">频道内部交流帖。加入频道后可继续查看回复、点赞和参与讨论。</p>
            <div className="comment-panel">
              <h3>回复</h3>
              <p><strong>频道成员</strong>这个信息很有用，建议置顶。</p>
              <p><strong>管理员</strong>已加入本周公告。</p>
            </div>
            <div className="modal-actions">
              <button title="举报" onClick={() => setReportTarget({ type: "频道帖子", title: channelPostDetail.post.title })}><Flag size={18} />举报</button>
            </div>
          </section>
        </div>
      )}

      {profileUser && (
        <div className="modal-backdrop" onClick={() => setProfileUser(null)}>
          <section className="small-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title={profileUser.author} subtitle={profileUser.meta} onClose={() => setProfileUser(null)} />
            <div className="profile-preview">
              <img className="avatar large" src={profileUser.avatar} alt={`${profileUser.author}头像`} />
              <p>展示对方主页预览。拉黑后不能私信、评论、查看主页。</p>
            </div>
            <button className="danger-button" onClick={() => blockUser(profileUser.author)}>
              <Prohibit size={18} />
              拉黑
            </button>
          </section>
        </div>
      )}

      {reportTarget && (
        <div className="modal-backdrop" onClick={() => setReportTarget(null)}>
          <section className="small-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title="举报" subtitle={`${reportTarget.type} · ${reportTarget.title}`} onClose={() => setReportTarget(null)} />
            <div className="report-reasons">
              {["广告", "骚扰", "不实信息", "其他"].map((reason) => (
                <button key={reason} onClick={() => setReportTarget(null)}>{reason}</button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
  return (
    <section className="setting-block">
      <div>
        <strong>{label}</strong>
        <span>{privacy[key]}</span>
      </div>
      <div className="segmented">
        {options.map((option) => (
          <button className={privacy[key] === option ? "active" : ""} key={option} onClick={() => updatePrivacy(key, option)}>
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}

function renderMainContent() {
  if (activeNav === "主页") return renderHome();
  if (activeNav === "社交圈") return renderSocialCircle();
  if (activeNav === "频道") return renderChannels();
  if (activeNav === "聊天") return renderChats();
  if (activeNav === "我的主页") return renderProfile();
  if (activeNav === "收藏") return renderSaved();
  if (activeNav === "设置") return renderSettings();
  return renderHome();
}

const page = pageCopy[activeNav] ?? pageCopy["主页"];

if (!loggedIn) {
  return (
    <main className={`auth-page theme-${activeTheme}`}>
      <section className="auth-brand-panel">
        <div className="auth-brand">
          <div className="brand-mark">
            <Student weight="duotone" size={34} />
          </div>
          <div>
            <strong>WHU Circle</strong>
            <span>武大校园圈</span>
          </div>
        </div>
        <div className="auth-copy">
          <p>校园社交平台</p>
          <h1>在一个更清楚的空间里，记录、交流和找到彼此。</h1>
          <span>公开笔记、好友社交圈、频道讨论与聊天。</span>
        </div>
        <div className="auth-trust">
          <ShieldCheck size={22} />
          <span>注册使用校内邮箱验证</span>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-tabs">
            {["登录", "注册"].map((mode) => (
              <button className={authMode === mode ? "active" : ""} key={mode} onClick={() => { setAuthMode(mode); setAuthError(""); }}>
                {mode}
              </button>
            ))}
          </div>
          <div className="auth-heading">
            <p>{authMode === "登录" ? "欢迎回来" : "创建校园账号"}</p>
            <h2>{authMode === "登录" ? "登录 WHU Circle" : "使用校内邮箱注册"}</h2>
          </div>
          {authError && <div className="auth-error">{authError}</div>}
          <label className="auth-field">
            <span>校内邮箱</span>
            <input value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="student@whu.edu.cn" />
          </label>
          {authMode === "注册" && (
            <label className="auth-field">
              <span>邮箱验证码</span>
              <div className="code-field">
                <input value={authCode} onChange={(event) => setAuthCode(event.target.value)} placeholder="6 位验证码" />
                <button onClick={handleSendCode} disabled={authLoading}>{codeSent ? "已发送" : "发送"}</button>
              </div>
            </label>
          )}
          <label className="auth-field">
            <span>密码</span>
            <input type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="至少 8 位" onKeyDown={(event) => { if (event.key === "Enter") handleAuthSubmit(); }} />
          </label>
          <button className="auth-submit" onClick={handleAuthSubmit} disabled={authLoading}>
            {authLoading ? "请稍候…" : authMode === "登录" ? "登录" : "注册并进入"}
          </button>
          <button className="demo-entry" onClick={handleDemoEntry} disabled={authLoading}>直接进入展示版</button>
        </div>
      </section>
    </main>
  );
}

return (
  <div className={`app-shell theme-${activeTheme}`}>
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
          <button className={activeNav === label ? "nav-item active" : "nav-item"} key={label} onClick={() => goTo(label)}>
            <Icon size={21} />
            <span>{label}</span>
            {label === "聊天" && chatUnreadCount > 0 && <em>{chatUnreadCount}</em>}
          </button>
        ))}
      </nav>

      <button className="publish-entry" onClick={() => setDraftOpen(true)}>
        <PaperPlaneTilt size={20} weight="fill" />
        发布笔记
      </button>

      <footer className="side-profile">
        <button className="profile-button" onClick={() => setUserMenuOpen((value) => !value)}>
          <img className="avatar" src={currentUser.avatar} alt="当前用户头像" />
          <div>
            <strong>{currentUser.name}</strong>
            <span>个人中心</span>
          </div>
          <CaretDown size={15} />
        </button>
        {userMenuOpen && (
          <div className="user-menu">
            <button onClick={() => goTo("我的主页")}><UserCircle size={18} />我的主页</button>
            <button onClick={() => goTo("收藏")}><BookmarkSimple size={18} />我的收藏</button>
            <button onClick={() => goTo("设置")}><GearSix size={18} />设置</button>
            <button onClick={handleLogout}>退出登录</button>
          </div>
        )}
      </footer>
    </aside>

    <main className="content">
      <header className="topbar">
        <div>
          <h1>{page[0]}</h1>
        </div>
        <div className="notification-wrap">
          <button className="icon-button" aria-label="通知" aria-expanded={notificationsOpen} title="通知"
            onClick={() => setNotificationsOpen((value) => !value)}>
            <Bell size={21} />
            {notifications.some((item) => item.unread) && <span />}
          </button>
          {notificationsOpen && (
            <section className="notification-panel">
              <div className="notification-head">
                <h2>通知</h2>
                <button disabled={!notifications.some((item) => item.unread)}
                  onClick={() => setNotifications((items) => items.map((item) => ({ ...item, unread: false })))}>
                  全部已读
                </button>
              </div>
              <div className="notification-list">
                {notifications.map((item) => (
                  <article className={item.unread ? "notification-item unread" : "notification-item"} key={item.id}>
                    <div className="notification-icon">
                      {item.type === "like" && <Heart size={18} weight="fill" />}
                      {item.type === "comment" && <ChatCircle size={18} weight="fill" />}
                      {item.type === "save" && <BookmarkSimple size={18} weight="fill" />}
                    </div>
                    <div>
                      <p><strong>{item.user}</strong>{item.action}</p>
                      <span>{item.target} · {item.time}</span>
                    </div>
                    {item.unread && <i />}
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </header>
      {renderMainContent()}
    </main>

    {draftOpen && (
      <div className="modal-backdrop" onClick={() => setDraftOpen(false)}>
        <section className="draft-modal" onClick={(event) => event.stopPropagation()}>
          <ModalHead title="发布笔记" subtitle="文字、图片或图文内容" onClose={() => setDraftOpen(false)} />
          <input className="title-input" value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="标题" />
          <textarea value={draftText} onChange={(event) => setDraftText(event.target.value)} placeholder="分享你想记录的内容..." />
          <div className="draft-tools">
            <button onClick={() => setImageCount((value) => Math.min(value + 1, 3))}>
              <Image size={18} />
              图片 {imageCount > 0 ? imageCount : ""}
            </button>
            <div className="segmented compact">
              {["公开", "好友可见", "私密"].map((item) => (
                <button className={draftVisibility === item ? "active" : ""} key={item} onClick={() => setDraftVisibility(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <button className="submit-note" onClick={createNote}>发布</button>
        </section>
      </div>
    )}

    {detailNote && (
      <div className="modal-backdrop" onClick={() => setDetailNote(null)}>
        <section className="detail-modal" onClick={(event) => event.stopPropagation()}>
          <ModalHead title={detailNote.title} subtitle={`${detailNote.author} · ${detailNote.meta}`} onClose={() => setDetailNote(null)} />
          {detailNote.images[0] && <img className="detail-image" src={detailNote.images[0]} alt="笔记图片" />}
          <p className="detail-body">{detailNote.body}</p>
          <div className="comment-panel">
            <h3>评论</h3>
            {detailNote.comments.length === 0 ? (
              <span className="muted">还没有评论。</span>
            ) : (
              detailNote.comments.map((comment) => (
                <p key={`${comment.user}-${comment.text}`}><strong>{comment.user}</strong>{comment.text}</p>
              ))
            )}
            <div className="comment-input">
              <input
                placeholder="写评论..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addComment(detailNote.id, commentText)}
              />
              <button title="发送" onClick={() => addComment(detailNote.id, commentText)}>
                <PaperPlaneTilt size={17} weight="fill" />
              </button>
            </div>
          </div>
          <div className="modal-actions">
            <button title="举报" onClick={() => setReportTarget({ type: "笔记", title: detailNote.title })}><Flag size={18} />举报</button>
          </div>
        </section>
      </div>
    )}

    {joinChannel && (
      <div className="modal-backdrop" onClick={() => setJoinChannel(null)}>
        <section className="small-modal" onClick={(event) => event.stopPropagation()}>
          <ModalHead title="加入频道" subtitle={joinChannel.name} onClose={() => setJoinChannel(null)} />
          {joinChannel.type === "密码" && (
            <input className="title-input" value={joinPassword} onChange={(event) => setJoinPassword(event.target.value)} placeholder="输入频道密码：whu2026" />
          )}
          <button className="submit-note" onClick={submitJoinChannel}>加入</button>
        </section>
      </div>
    )}

    {profileEditOpen && (
      <div className="modal-backdrop" onClick={() => setProfileEditOpen(false)}>
        <section className="small-modal" onClick={(event) => event.stopPropagation()}>
          <ModalHead title="编辑资料" subtitle="更新你的个人信息" onClose={() => setProfileEditOpen(false)} />
          <label className="auth-field">
            <span>昵称</span>
            <input className="title-input" value={profileName} onChange={(event) => setProfileName(event.target.value)} placeholder="输入昵称" />
          </label>
          <label className="auth-field">
            <span>学院/年级</span>
            <input className="title-input" value={profileMeta} onChange={(event) => setProfileMeta(event.target.value)} placeholder="例如：2024级 · 计算机学院" />
          </label>
          <label className="auth-field">
            <span>个人简介</span>
            <input className="title-input" value={profileBio} onChange={(event) => setProfileBio(event.target.value)} placeholder="一句话介绍自己" />
          </label>
          <label className="auth-field">
            <span>头像链接</span>
            <input className="title-input" value={profileAvatar} onChange={(event) => setProfileAvatar(event.target.value)} placeholder="输入头像图片地址" />
          </label>
          <button className="submit-note" onClick={saveProfile}>保存</button>
        </section>
      </div>
    )}

    {createChannelOpen && (
      <div className="modal-backdrop" onClick={() => setCreateChannelOpen(false)}>
        <section className="small-modal" onClick={(event) => event.stopPropagation()}>
          <ModalHead title="创建新频道" subtitle="为校园话题建立一个专属空间" onClose={() => setCreateChannelOpen(false)} />
          <label className="auth-field">
            <span>频道名称</span>
            <input className="title-input" value={newChannelName} onChange={(event) => setNewChannelName(event.target.value)} placeholder="例如：武大摄影交流" />
          </label>
          <div className="segmented compact">
            {['公开', '密码'].map((option) => (
              <button className={newChannelType === option ? 'active' : ''} key={option} onClick={() => setNewChannelType(option)}>
                {option}
              </button>
            ))}
          </div>
          {newChannelType === '密码' && (
            <label className="auth-field">
              <span>频道密码</span>
              <input className="title-input" value={newChannelPassword} onChange={(event) => setNewChannelPassword(event.target.value)} placeholder="设置加入密码" />
            </label>
          )}
          <label className="auth-field">
            <span>频道公告</span>
            <textarea className="title-input" value={newChannelAnnouncement} onChange={(event) => setNewChannelAnnouncement(event.target.value)} placeholder="写一句欢迎语或规则说明" />
          </label>
          <button className="submit-note" onClick={submitCreateChannel}>创建频道</button>
        </section>
      </div>
    )}

    {channelPostDraftOpen && (
      <div className="modal-backdrop" onClick={() => setChannelPostDraftOpen(false)}>
        <section className="small-modal" onClick={(event) => event.stopPropagation()}>
          <ModalHead title="发布频道帖子" subtitle={selectedChannel?.name} onClose={() => setChannelPostDraftOpen(false)} />
          <label className="auth-field">
            <span>标题</span>
            <input className="title-input" value={channelPostDraftTitle} onChange={(event) => setChannelPostDraftTitle(event.target.value)} placeholder="写一个吸引人的标题" />
          </label>
          <label className="auth-field">
            <span>内容</span>
            <textarea className="title-input" value={channelPostDraftBody} onChange={(event) => setChannelPostDraftBody(event.target.value)} placeholder="分享你想讨论的内容..." />
          </label>
          <div className="draft-tools">
            <button onClick={() => setChannelPostDraftImage((value) => !value)}>
              <Image size={18} />
              {channelPostDraftImage ? "已附图" : "附图"}
            </button>
            <div className="segmented compact">
              {['学习', '活动', '求助', '闲聊'].map((tag) => (
                <button className={channelPostDraftTags.includes(tag) ? 'active' : ''} key={tag} onClick={() => {
                  setChannelPostDraftTags((items) => items.includes(tag) ? items.filter((item) => item !== tag) : [...items, tag]);
                }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <label className="segmented compact">
            <button className={channelPostDraftPinned ? 'active' : ''} onClick={() => setChannelPostDraftPinned((value) => !value)}>
              <PushPin size={16} />
              置顶此帖
            </button>
          </label>
          <button className="submit-note" onClick={submitCreateChannelPost}>发布</button>
        </section>
      </div>
    )}

    {channelPostDetail && (
      <div className="modal-backdrop" onClick={() => setChannelPostDetail(null)}>
        <section className="small-modal" onClick={(event) => event.stopPropagation()}>
          <ModalHead title={channelPostDetail.post.title} subtitle={channelPostDetail.channel.name} onClose={() => setChannelPostDetail(null)} />
          <p className="detail-body">频道内部交流帖。加入频道后可继续查看回复、点赞和参与讨论。</p>
          <div className="comment-panel">
            <h3>回复</h3>
            <p><strong>频道成员</strong>这个信息很有用，建议置顶。</p>
            <p><strong>管理员</strong>已加入本周公告。</p>
          </div>
          <div className="modal-actions">
            <button title="举报" onClick={() => setReportTarget({ type: "频道帖子", title: channelPostDetail.post.title })}><Flag size={18} />举报</button>
          </div>
        </section>
      </div>
    )}

    {profileUser && (
      <div className="modal-backdrop" onClick={() => setProfileUser(null)}>
        <section className="small-modal" onClick={(event) => event.stopPropagation()}>
          <ModalHead title={profileUser.author} subtitle={profileUser.meta} onClose={() => setProfileUser(null)} />
          <div className="profile-preview">
            <img className="avatar large" src={profileUser.avatar} alt={`${profileUser.author}头像`} />
            <p>展示对方主页预览。拉黑后不能私信、评论、查看主页。</p>
          </div>
          <button className="danger-button" onClick={() => blockUser(profileUser.author)}>
            <Prohibit size={18} />
            拉黑
          </button>
        </section>
      </div>
    )}

    {reportTarget && (
      <div className="modal-backdrop" onClick={() => setReportTarget(null)}>
        <section className="small-modal" onClick={(event) => event.stopPropagation()}>
          <ModalHead title="举报" subtitle={`${reportTarget.type} · ${reportTarget.title}`} onClose={() => setReportTarget(null)} />
          <div className="report-reasons">
            {["广告", "骚扰", "不实信息", "其他"].map((reason) => (
              <button key={reason} onClick={() => setReportTarget(null)}>{reason}</button>
            ))}
          </div>
        </section>
      </div>
    )}
  </div>
);
}

function ModalHead({ title, subtitle, onClose }) {
  return (
    <div className="modal-head">
      <div>
        <p>{subtitle}</p>
        <h2>{title}</h2>
      </div>
      <button title="关闭" onClick={onClose}>
        <X size={20} />
      </button>
    </div>
  );
}
