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
  resetPassword as apiResetPassword,
  getMe,
  logout as apiLogout,
} from "./api/auth.js";
import { setToken, getToken } from "./api/client.js";
import {
  getNotes,
  createNote as apiCreateNote,
  createComment as apiCreateComment,
  likeNote,
  saveNote,
  getTags,
} from "./api/notes.js";
import {
  getChannels,
  joinChannel as apiJoinChannel,
  createChannel as apiCreateChannel,
  createPost as apiCreatePost,
} from "./api/channels.js";
import { getConversations, sendMessage as apiSendMessage } from "./api/chat.js";
import { getNotifications as apiGetNotifications } from "./api/notifications.js";
import { getMyProfile, updateProfile, getRelations } from "./api/users.js";
import { AuthPage } from "./components/auth/AuthPage.jsx";
import { ModalHead } from "./components/common/ModalHead.jsx";
import { Sidebar } from "./components/layout/Sidebar.jsx";
import { Topbar } from "./components/layout/Topbar.jsx";
import { AppModals } from "./components/modals/AppModals.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { SocialCirclePage } from "./pages/SocialCirclePage.jsx";
import { ChannelsPage } from "./pages/ChannelsPage.jsx";
import { ChatsPage } from "./pages/ChatsPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { SavedPage } from "./pages/SavedPage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";
import {
  currentUser as DEMO_USER_RAW,
  initialNotes,
  initialChannels,
  initialChats,
  friendRows,
  pageCopy,
  themeOptions,
  initialNotifications,
  tags,
} from "./data/mockData.js";
import { filterNotes, getSocialNotes } from "./utils/noteFilters.js";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80";

const DEMO_USER = { ...DEMO_USER_RAW, id: null };

const VIS_MAP = { PUBLIC: "公开", FRIENDS: "好友可见", PRIVATE: "私密" };
const VIS_REV = { "公开": "PUBLIC", "好友可见": "FRIENDS", "私密": "PRIVATE" };

export function App() {
  // ── 认证状态 ──
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(DEMO_USER);
  const [authMode, setAuthMode] = useState("登录");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // ── 数据状态 ──
  const [notes, setNotes] = useState(initialNotes);
  const [channels, setChannels] = useState(initialChannels);
  const [chats, setChats] = useState(initialChats);
  const [tagsList, setTagsList] = useState(tags);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [profileData, setProfileData] = useState(null);
  const [relationsData, setRelationsData] = useState([]);

  // ── UI 状态 ──
  const [activeNav, setActiveNav] = useState("主页");
  const [activeChatId, setActiveChatId] = useState(null);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);

  // ── 搜索/筛选状态 ──
  const [searchTerm, setSearchTerm] = useState("");
  const [savedSearch, setSavedSearch] = useState("");
  const [activeTag, setActiveTag] = useState("全部");

  // ── 草稿状态 ──
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftText, setDraftText] = useState("");
  const [draftVisibility, setDraftVisibility] = useState("公开");
  const [imageCount, setImageCount] = useState(0);

  // ── 弹窗状态 ──
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
  const [reportTarget, setReportTarget] = useState(null);

  // ── 设置/个人资料状态 ──
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

  // ── 聊天输入 ──
  const [chatInput, setChatInput] = useState("");

  // ── 派生值 ──
  const selectedChannel =
    channels.find((ch) => ch.id === selectedChannelId) ?? channels[0];
  const activeChat =
    chats.find((ch) => ch.id === activeChatId) ?? chats[0] ?? null;
  const chatUnreadCount = chats.reduce(
    (sum, ch) => sum + (ch.unread > 0 ? ch.unread : 0),
    0,
  );

  const publicNotes = useMemo(
    () => filterNotes(notes, searchTerm, activeTag),
    [notes, searchTerm, activeTag],
  );

  const socialNotes = useMemo(() => getSocialNotes(notes), [notes]);

  const savedNotes = useMemo(
    () =>
      filterNotes(
        notes.filter((n) => n.saved),
        savedSearch,
      ),
    [notes, savedSearch],
  );

  // 使用 API 关系数据，回退到 mock 数据
  const friendList = useMemo(() => {
    if (relationsData.length > 0) {
      const statusMap = {
        FRIEND: ["好友", "互相关注，可私信、评论好友可见内容"],
        FOLLOWING: ["关注中", "你关注了对方，但还不是好友"],
        FOLLOWER: ["被关注", "对方关注了你，快去关注吧"],
        NONE: ["未关注", "关注后内容会进入社交圈"],
      };
      return relationsData
        .filter((r) => r.status !== "BLOCKED")
        .map((r) => ({
          name: r.nickname || "用户",
          state: statusMap[r.status]?.[0] || r.status,
          detail: statusMap[r.status]?.[1] || "",
        }));
    }
    return friendRows;
  }, [relationsData]);

  // ── 工具函数 ──
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

  function timeAgo(dateStr) {
    if (!dateStr) return "刚刚";
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return "刚刚";
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    return `${Math.floor(diff / 86400)}天前`;
  }

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
      saves: apiNote.saveCount ?? 0,
      commentCount: apiNote.commentCount,
      comments: [],
      liked: apiNote.liked,
      saved: apiNote.saved,
      followed: true,
      mutual: false,
    };
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

  // ── 认证 Effect ──
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

  // ── 数据加载 ──
  async function loadAllData() {
    try {
      const [
        notesData,
        channelsData,
        chatsData,
        profileDataRes,
        tagsData,
        relationsDataRes,
        notificationsData,
      ] = await Promise.all([
        getNotes({ scope: "PUBLIC" }),
        getChannels({ joined: null }),
        getConversations(),
        getMyProfile(),
        getTags(),
        getRelations(),
        apiGetNotifications(),
      ]);
      setNotes((notesData?.items || []).map(mapNote));
      if (tagsData?.length) {
        setTagsList(["全部", ...tagsData]);
      }
      setChannels(
        mapChannels(channelsData?.items || [], profileDataRes?.id),
      );
      setChats(mapChats(chatsData || [], profileDataRes?.id));
      setCurrentUser({
        name: profileDataRes?.nickname || "新用户",
        meta: `${profileDataRes?.grade || ""} · ${profileDataRes?.college || ""}`,
        avatar: profileDataRes?.avatarUrl || DEFAULT_AVATAR,
        id: profileDataRes?.id,
      });
      setProfileData(profileDataRes);
      setRelationsData(relationsDataRes || []);
      // 同步编辑表单状态
      if (profileDataRes) {
        setProfileName(profileDataRes.nickname || "");
        setProfileMeta(`${profileDataRes.grade || ""} · ${profileDataRes.college || ""}`);
        setProfileBio(profileDataRes.bio || "");
        setProfileAvatar(profileDataRes.avatarUrl || DEFAULT_AVATAR);
      }
      // 映射通知数据
      const apiNotifications = notificationsData?.items || notificationsData || [];
      if (apiNotifications.length > 0) {
        setNotifications(
          apiNotifications.map((n) => ({
            id: n.id,
            type: n.type || "like",
            user: n.title || "系统",
            action: n.content || "",
            target: "",
            time: timeAgo(n.createdAt),
            unread: !n.read,
          })),
        );
      }
    } catch {
      // 静默失败，保留 mock 数据兜底
    }
  }

  useEffect(() => {
    if (loggedIn) loadAllData();
  }, [loggedIn]);

  // ── 初始化 activeChatId ──
  useEffect(() => {
    if (!chats.length) {
      setActiveChatId(null);
      return;
    }
    if (!activeChatId || !chats.some((ch) => ch.id === activeChatId)) {
      setActiveChatId(chats[0].id);
    }
  }, [activeChatId, chats]);

  // ── 认证处理函数 ──
  function handleSendCode() {
    setAuthError("");
    setAuthLoading(true);
    apiSendCode(authEmail, authMode === "找回密码" ? "RESET_PASSWORD" : "REGISTER")
      .then((data) => {
        setCodeSent(true);
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
    if (authPassword !== authPasswordConfirm) {
      setAuthError("两次输入的密码不一致");
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

  function handleResetPassword() {
    setAuthError("");
    if (authPassword.length < 8) {
      setAuthError("密码至少 8 位");
      return;
    }
    if (authPassword !== authPasswordConfirm) {
      setAuthError("两次输入的密码不一致");
      return;
    }
    setAuthLoading(true);
    apiResetPassword(authEmail, authCode, authPassword)
      .then(() => {
        setAuthMode("登录");
        setAuthPassword("");
        setAuthPasswordConfirm("");
        setAuthCode("");
        setCodeSent(false);
        setAuthError("密码已重置，请使用新密码登录");
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

  function handleAuthSubmit() {
    if (authMode === "登录") handleLogin();
    else if (authMode === "注册") handleRegister();
    else handleResetPassword();
  }

  function handleLogout() {
    apiLogout();
    setCurrentUser(DEMO_USER);
    setLoggedIn(false);
    setActiveNav("主页");
  }

  // ── 笔记操作 ──
  function toggleLike(id) {
    likeNote(id)
      .then((res) => {
        setNotes((items) =>
          items.map((n) =>
            n.id === id ? { ...n, liked: res.active, likes: res.count } : n,
          ),
        );
      })
      .catch(() => {});
  }

  function toggleSave(id) {
    saveNote(id)
      .then((res) => {
        setNotes((items) =>
          items.map((n) => (n.id === id ? { ...n, saved: res.active } : n)),
        );
      })
      .catch(() => {});
  }

  function addComment(noteId, text) {
    if (!text.trim()) return;
    apiCreateComment(noteId, text.trim())
      .then((apiComment) => {
        const newComment = {
          user: apiComment.author?.nickname || currentUser.name,
          text: apiComment.content || text.trim(),
        };
        setNotes((prev) =>
          prev.map((n) =>
            n.id === noteId
              ? { ...n, comments: [...n.comments, newComment], commentCount: n.commentCount + 1 }
              : n,
          ),
        );
        setDetailNote((prev) =>
          prev
            ? { ...prev, comments: [...prev.comments, newComment] }
            : prev,
        );
      })
      .catch(() => {});
    setCommentText("");
  }

  function createNote() {
    if (!draftTitle.trim() && !draftText.trim() && imageCount === 0) return;
    apiCreateNote({
      title: draftTitle.trim() || "今天的校园记录",
      content: draftText.trim() || "分享了一张校园图片。",
      visibility: VIS_REV[draftVisibility] || "PUBLIC",
      tags: ["校园生活"],
    })
      .then((apiNote) => {
        setNotes((items) => [mapNote(apiNote), ...items]);
        setDraftTitle("");
        setDraftText("");
        setImageCount(0);
        setDraftOpen(false);
        setActiveNav(draftVisibility === "公开" ? "主页" : "社交圈");
      })
      .catch(() => {});
  }

  // ── 频道操作 ──
  function submitJoinChannel() {
    if (!joinChannel) return;
    apiJoinChannel(Number(joinChannel.id), joinPassword || null)
      .then(() => {
        setChannels((items) =>
          items.map((c) =>
            c.id === joinChannel.id ? { ...c, joined: true } : c,
          ),
        );
        setSelectedChannelId(joinChannel.id);
        setJoinChannel(null);
        setJoinPassword("");
      })
      .catch(() => {});
  }

  function submitCreateChannel() {
    const name = newChannelName.trim();
    if (!name) return;
    if (newChannelType === "密码" && !newChannelPassword.trim()) return;
    const joinType = newChannelType === "密码" ? "PASSWORD" : "PUBLIC";
    apiCreateChannel({
      name,
      joinType,
      password: joinType === "PASSWORD" ? newChannelPassword.trim() : undefined,
      announcement: newChannelAnnouncement.trim() || "欢迎来到新频道！",
    })
      .then((apiChannel) => {
        const createdChannel = {
          id: String(apiChannel.id),
          name: apiChannel.name,
          type: apiChannel.joinType === "PASSWORD" ? "密码" : "公开",
          joined: true,
          admin: apiChannel.administrator?.nickname || currentUser.name,
          announcement: apiChannel.announcement || "",
          members: apiChannel.memberCount || 1,
          posts: [],
        };
        setChannels((items) => [createdChannel, ...items]);
        setSelectedChannelId(createdChannel.id);
        setCreateChannelOpen(false);
        setNewChannelName("");
        setNewChannelType("公开");
        setNewChannelPassword("");
        setNewChannelAnnouncement("");
      })
      .catch(() => {});
  }

  function submitCreateChannelPost() {
    const title = channelPostDraftTitle.trim();
    const body = channelPostDraftBody.trim();
    if (!title && !body) return;
    apiCreatePost(Number(selectedChannel.id), {
      title: title || "新发布的讨论帖",
      content: body || "分享一个话题。",
    })
      .then((apiPost) => {
        const newPost = {
          id: String(apiPost.id),
          title: apiPost.title,
          pinned: apiPost.pinned || false,
          likes: apiPost.likeCount || 0,
          replies: apiPost.replyCount || 0,
          body: apiPost.content || body,
          tags: channelPostDraftTags,
          image: channelPostDraftImage,
        };
        setChannels((items) =>
          items.map((ch) =>
            ch.id === selectedChannel.id
              ? { ...ch, posts: [newPost, ...ch.posts] }
              : ch,
          ),
        );
        setChannelPostDraftOpen(false);
        setChannelPostDraftTitle("");
        setChannelPostDraftBody("");
        setChannelPostDraftTags([]);
        setChannelPostDraftPinned(false);
        setChannelPostDraftImage(false);
      })
      .catch(() => {});
  }

  // ── 用户操作 ──
  function blockUser(name) {
    if (!blockedUsers.includes(name))
      setBlockedUsers((items) => [name, ...items]);
    setProfileUser(null);
  }

  function updatePrivacyField(key, value) {
    setPrivacy((items) => ({ ...items, [key]: value }));
    if (key === "noteVisibility") setDraftVisibility(value);
  }

  function saveProfile() {
    // 解析 "2024级 · 新闻与传播学院" 格式
    const parts = profileMeta.split("·").map((s) => s.trim()).filter(Boolean);
    const grade = parts[0] || "";
    const college = parts[1] || "";
    updateProfile({
      nickname: profileName,
      college: college || profileMeta,
      grade: grade || "",
      bio: profileBio,
      avatarUrl: profileAvatar,
    })
      .then(() => {
        setCurrentUser((u) => ({
          ...u,
          name: profileName,
          meta: profileMeta,
          avatar: profileAvatar,
        }));
        setProfileEditOpen(false);
      })
      .catch(() => {});
  }

  // ── 聊天操作 ──
  function openChat(chatId) {
    setActiveChatId(chatId);
    setChats((items) =>
      items.map((ch) => (ch.id === chatId ? { ...ch, unread: 0 } : ch)),
    );
  }

  function sendChatMessage() {
    const text = chatInput.trim();
    if (!text || !activeChatId) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const message = { from: "我", text, time, mine: true, read: true };
    setChats((items) =>
      items.map((ch) =>
        ch.id === activeChatId
          ? { ...ch, messages: [...ch.messages, message], lastTime: "刚刚" }
          : ch,
      ),
    );
    setChatInput("");
    // 异步发送到后端
    apiSendMessage(Number(activeChatId), text).catch(() => {});
  }

  function markAllChatsAsRead() {
    setChats((items) => items.map((ch) => ({ ...ch, unread: 0 })));
  }

  // ── Draft 对象（供 AppModals 使用） ──
  const draft = {
    open: draftOpen,
    title: draftTitle,
    text: draftText,
    imageCount,
    visibility: draftVisibility,
  };

  function handleDraftChange(field, value) {
    switch (field) {
      case "title":
        setDraftTitle(value);
        break;
      case "text":
        setDraftText(value);
        break;
      case "imageCount":
        setImageCount(value);
        break;
      case "visibility":
        setDraftVisibility(value);
        break;
    }
  }

  // ── noteFeedProps（供各页面组件透传） ──
  const noteFeedProps = {
    onOpenNote: setDetailNote,
    onOpenProfile: setProfileUser,
    onReport: setReportTarget,
    onSelectTag: setActiveTag,
    onToggleLike: toggleLike,
    onToggleSave: toggleSave,
  };

  // ── 渲染主内容 ──
  function renderMainContent() {
    switch (activeNav) {
      case "主页":
        return (
          <HomePage
            notes={publicNotes}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            tags={tagsList}
            activeTag={activeTag}
            onSelectTag={setActiveTag}
            tagsExpanded={tagsExpanded}
            onToggleTags={() => setTagsExpanded((v) => !v)}
            noteFeedProps={noteFeedProps}
          />
        );
      case "社交圈":
        return (
          <SocialCirclePage
            notes={socialNotes}
            friends={friendList}
            noteFeedProps={noteFeedProps}
          />
        );
      case "频道":
        return (
          <ChannelsPage
            channels={channels}
            selectedChannel={selectedChannel}
            onSelectChannel={setSelectedChannelId}
            onJoin={setJoinChannel}
            onOpenPost={setChannelPostDetail}
            onReport={setReportTarget}
            onCreateChannel={() => setCreateChannelOpen(true)}
          />
        );
      case "聊天":
        return (
          <ChatsPage
            chats={chats}
            activeChat={activeChat}
            onSelectChat={openChat}
            onReport={setReportTarget}
          />
        );
      case "我的主页":
        return (
          <ProfilePage
            currentUser={currentUser}
            notes={notes.filter(
              (n) => n.author === currentUser.name || n.visibility === "私密",
            )}
            joinedChannelCount={
              channels.filter((ch) => ch.joined).length
            }
            profileData={profileData}
            noteFeedProps={noteFeedProps}
            onEdit={() => setProfileEditOpen(true)}
          />
        );
      case "收藏":
        return (
          <SavedPage
            notes={savedNotes}
            searchTerm={savedSearch}
            onSearchChange={setSavedSearch}
            noteFeedProps={noteFeedProps}
          />
        );
      case "设置":
        return (
          <SettingsPage
            privacy={privacy}
            onPrivacyChange={updatePrivacyField}
            blockedUsers={blockedUsers}
            themes={themeOptions}
            activeTheme={activeTheme}
            onThemeChange={setActiveTheme}
          />
        );
      default:
        return null;
    }
  }

  const page = pageCopy[activeNav] ?? pageCopy["主页"];

  // ── 未登录：渲染认证页面 ──
  if (!loggedIn) {
    return (
      <AuthPage
        activeTheme={activeTheme}
        mode={authMode}
        email={authEmail}
        password={authPassword}
        passwordConfirm={authPasswordConfirm}
        code={authCode}
        codeSent={codeSent}
        authError={authError}
        authLoading={authLoading}
        onModeChange={(mode) => {
          setAuthMode(mode);
          setAuthError("");
          setAuthPasswordConfirm("");
          setAuthCode("");
          setCodeSent(false);
        }}
        onEmailChange={setAuthEmail}
        onPasswordChange={setAuthPassword}
        onPasswordConfirmChange={setAuthPasswordConfirm}
        onCodeChange={setAuthCode}
        onSendCode={handleSendCode}
        onEnter={handleAuthSubmit}
        onDemoEntry={handleDemoEntry}
        onForgotPassword={() => {
          setAuthMode("找回密码");
          setAuthError("");
          setAuthPassword("");
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") handleAuthSubmit();
        }}
      />
    );
  }

  // ── 主界面 ──
  return (
    <div className={`app-shell theme-${activeTheme}`}>
      <Sidebar
        activeNav={activeNav}
        currentUser={currentUser}
        menuOpen={userMenuOpen}
        chatUnreadCount={chatUnreadCount}
        onNavigate={goTo}
        onOpenDraft={() => setDraftOpen(true)}
        onToggleMenu={() => setUserMenuOpen((v) => !v)}
        onLogout={handleLogout}
      />

      <main className="content">
        <Topbar
          activeNav={activeNav}
          page={page}
          notifications={notifications}
          open={notificationsOpen}
          onToggle={() => setNotificationsOpen((v) => !v)}
          onMarkAllRead={() =>
            setNotifications((items) =>
              items.map((item) => ({ ...item, unread: false })),
            )
          }
        />

        {/* 聊天页面需要 chatInput + sendChatMessage，所以单独处理 */}
        {activeNav === "聊天" ? (
          <section className="chat-layout">
            <aside className="chat-list">
              <div className="chat-list-head">
                <div>
                  <h2>消息</h2>
                </div>
                <button
                  className="ghost-button small"
                  onClick={markAllChatsAsRead}
                >
                  全部已读
                </button>
              </div>
              {chats.map((chat) => (
                <button
                  className={
                    activeChatId === chat.id
                      ? "chat-preview active"
                      : "chat-preview"
                  }
                  key={chat.id}
                  onClick={() => openChat(chat.id)}
                >
                  <div className="chat-avatar">
                    {chat.type === "群聊" ? (
                      <ChatsCircle size={22} />
                    ) : (
                      <UserCircle size={22} />
                    )}
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
              {activeChat ? (
                <>
                  <div className="chat-window-head">
                    <div>
                      <p>{activeChat.type}</p>
                      <h2>{activeChat.name}</h2>
                    </div>
                    <button className="icon-mini" title="更多">
                      <DotsThree size={22} />
                    </button>
                  </div>
                  <div className="bubble-list">
                    {activeChat.messages.map((msg, i) => (
                      <div
                        className={
                          msg.mine ? "message-line mine" : "message-line"
                        }
                        key={`${msg.text}-${i}`}
                      >
                        <p
                          className={
                            msg.mine ? "bubble mine" : "bubble other"
                          }
                        >
                          {msg.text}
                        </p>
                        <div className="message-meta">
                          <span>{msg.time}</span>
                          {msg.mine && (
                            <span>{msg.read ? "已读" : "未读"}</span>
                          )}
                          <button
                            className="icon-mini"
                            title="举报消息"
                            onClick={() =>
                              setReportTarget({
                                type: "聊天消息",
                                title: msg.text,
                              })
                            }
                          >
                            <Flag size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="chat-input">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          sendChatMessage();
                        }
                      }}
                      placeholder="输入消息..."
                    />
                    <button title="发送" onClick={sendChatMessage}>
                      <PaperPlaneTilt size={18} weight="fill" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-state">请选择一个会话开始聊天。</div>
              )}
            </section>
          </section>
        ) : (
          renderMainContent()
        )}

        {/* 频道页面额外按钮（发帖、加入频道提醒） */}
        {activeNav === "频道" && selectedChannel && (
          <>
            {selectedChannel.joined && (
              <div className="channel-actions-bar">
                <button
                  className="submit-note"
                  onClick={() => setChannelPostDraftOpen(true)}
                >
                  <PaperPlaneTilt size={18} weight="fill" />
                  发帖
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── 弹窗：使用 AppModals ── */}
      <AppModals
        draft={draft}
        joinChannel={
          joinChannel
            ? { ...joinChannel, inputPassword: joinPassword }
            : null
        }
        channelPostDetail={channelPostDetail}
        profileUser={profileUser}
        reportTarget={reportTarget}
        onDraftChange={handleDraftChange}
        onCreateNote={createNote}
        onCloseDraft={() => setDraftOpen(false)}
        onCloseJoin={() => {
          setJoinChannel(null);
          setJoinPassword("");
        }}
        onClosePost={() => setChannelPostDetail(null)}
        onCloseProfile={() => setProfileUser(null)}
        onCloseReport={() => setReportTarget(null)}
        onJoinPasswordChange={setJoinPassword}
        onSubmitJoin={submitJoinChannel}
        onBlockUser={blockUser}
        onReport={setReportTarget}
      />

      {/* ── 笔记详情弹窗（含评论功能，需独立处理） ── */}
      {detailNote && (
        <div className="modal-backdrop" onClick={() => setDetailNote(null)}>
          <section
            className="detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHead
              title={detailNote.title}
              subtitle={`${detailNote.author} · ${detailNote.meta}`}
              onClose={() => setDetailNote(null)}
            />
            {detailNote.images[0] && (
              <img
                className="detail-image"
                src={detailNote.images[0]}
                alt="笔记图片"
              />
            )}
            <p className="detail-body">{detailNote.body}</p>
            <div className="comment-panel">
              <h3>评论</h3>
              {detailNote.comments.length === 0 ? (
                <span className="muted">还没有评论。</span>
              ) : (
                detailNote.comments.map((c) => (
                  <p key={`${c.user}-${c.text}`}>
                    <strong>{c.user}</strong>
                    {c.text}
                  </p>
                ))
              )}
              <div className="comment-input">
                <input
                  placeholder="写评论..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      addComment(detailNote.id, commentText);
                  }}
                />
                <button
                  title="发送"
                  onClick={() => addComment(detailNote.id, commentText)}
                >
                  <PaperPlaneTilt size={17} weight="fill" />
                </button>
              </div>
            </div>
            <div className="modal-actions">
              <button
                title="举报"
                onClick={() =>
                  setReportTarget({ type: "笔记", title: detailNote.title })
                }
              >
                <Flag size={18} />
                举报
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ── 编辑资料弹窗 ── */}
      {profileEditOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setProfileEditOpen(false)}
        >
          <section
            className="small-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHead
              title="编辑资料"
              subtitle="更新你的个人信息"
              onClose={() => setProfileEditOpen(false)}
            />
            <label className="auth-field">
              <span>昵称</span>
              <input
                className="title-input"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="输入昵称"
              />
            </label>
            <label className="auth-field">
              <span>学院/年级</span>
              <input
                className="title-input"
                value={profileMeta}
                onChange={(e) => setProfileMeta(e.target.value)}
                placeholder="例如：2024级 · 计算机学院"
              />
            </label>
            <label className="auth-field">
              <span>个人简介</span>
              <input
                className="title-input"
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="一句话介绍自己"
              />
            </label>
            <label className="auth-field">
              <span>头像链接</span>
              <input
                className="title-input"
                value={profileAvatar}
                onChange={(e) => setProfileAvatar(e.target.value)}
                placeholder="输入头像图片地址"
              />
            </label>
            <button className="submit-note" onClick={saveProfile}>
              保存
            </button>
          </section>
        </div>
      )}

      {/* ── 创建频道弹窗 ── */}
      {createChannelOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setCreateChannelOpen(false)}
        >
          <section
            className="small-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHead
              title="创建新频道"
              subtitle="为校园话题建立一个专属空间"
              onClose={() => setCreateChannelOpen(false)}
            />
            <label className="auth-field">
              <span>频道名称</span>
              <input
                className="title-input"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="例如：武大摄影交流"
              />
            </label>
            <div className="segmented compact">
              {["公开", "密码"].map((opt) => (
                <button
                  className={newChannelType === opt ? "active" : ""}
                  key={opt}
                  onClick={() => setNewChannelType(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
            {newChannelType === "密码" && (
              <label className="auth-field">
                <span>频道密码</span>
                <input
                  className="title-input"
                  value={newChannelPassword}
                  onChange={(e) => setNewChannelPassword(e.target.value)}
                  placeholder="设置加入密码"
                />
              </label>
            )}
            <label className="auth-field">
              <span>频道公告</span>
              <textarea
                className="title-input"
                value={newChannelAnnouncement}
                onChange={(e) => setNewChannelAnnouncement(e.target.value)}
                placeholder="写一句欢迎语或规则说明"
              />
            </label>
            <button className="submit-note" onClick={submitCreateChannel}>
              创建频道
            </button>
          </section>
        </div>
      )}

      {/* ── 发布频道帖子弹窗 ── */}
      {channelPostDraftOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setChannelPostDraftOpen(false)}
        >
          <section
            className="small-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHead
              title="发布频道帖子"
              subtitle={selectedChannel?.name}
              onClose={() => setChannelPostDraftOpen(false)}
            />
            <label className="auth-field">
              <span>标题</span>
              <input
                className="title-input"
                value={channelPostDraftTitle}
                onChange={(e) => setChannelPostDraftTitle(e.target.value)}
                placeholder="写一个吸引人的标题"
              />
            </label>
            <label className="auth-field">
              <span>内容</span>
              <textarea
                className="title-input"
                value={channelPostDraftBody}
                onChange={(e) => setChannelPostDraftBody(e.target.value)}
                placeholder="分享你想讨论的内容..."
              />
            </label>
            <div className="draft-tools">
              <button
                onClick={() => setChannelPostDraftImage((v) => !v)}
              >
                <Image size={18} />
                {channelPostDraftImage ? "已附图" : "附图"}
              </button>
              <div className="segmented compact">
                {["学习", "活动", "求助", "闲聊"].map((tag) => (
                  <button
                    className={
                      channelPostDraftTags.includes(tag) ? "active" : ""
                    }
                    key={tag}
                    onClick={() =>
                      setChannelPostDraftTags((items) =>
                        items.includes(tag)
                          ? items.filter((t) => t !== tag)
                          : [...items, tag],
                      )
                    }
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <label className="segmented compact">
              <button
                className={channelPostDraftPinned ? "active" : ""}
                onClick={() => setChannelPostDraftPinned((v) => !v)}
              >
                <PushPin size={16} />
                置顶此帖
              </button>
            </label>
            <button
              className="submit-note"
              onClick={submitCreateChannelPost}
            >
              发布
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
