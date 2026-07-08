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
  Trash,
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
  getComments,
  createNote as apiCreateNote,
  createComment as apiCreateComment,
  deleteNote as apiDeleteNote,
  deleteComment as apiDeleteComment,
  likeNote,
  saveNote,
  getTags,
  getSocialFeed,
} from "./api/notes.js";
import {
  getChannels,
  getPosts,
  getPostDetail,
  joinChannel as apiJoinChannel,
  createChannel as apiCreateChannel,
  createPost as apiCreatePost,
  updateAnnouncement as apiUpdateAnnouncement,
  replyToPost as apiReplyToPost,
  likePost as apiLikePost,
  setPostPinned as apiSetPostPinned,
} from "./api/channels.js";
import {
  getConversations,
  getMessages,
  markRead as apiMarkChatRead,
  sendMessage as apiSendMessage,
  createConversation as apiCreateConversation,
} from "./api/chat.js";
import {
  getNotifications as apiGetNotifications,
  markNotificationRead as apiMarkNotificationRead,
  markAllNotificationsRead as apiMarkAllNotificationsRead,
} from "./api/notifications.js";
import {
  getMyProfile,
  updateProfile,
  getRelations,
  getUserProfile,
  follow as apiFollow,
  unfollow as apiUnfollow,
  block as apiBlock,
  unblock as apiUnblock,
  getBlockedUsers,
  report as apiReport,
} from "./api/users.js";
import { getPrivacy, updatePrivacy as apiUpdatePrivacy } from "./api/settings.js";
import { uploadImage } from "./api/files.js";
import {
  getAdminDashboard,
  setAdminUserStatus,
  setAdminChannelStatus,
  deleteAdminNote,
  deleteAdminChannelPost,
} from "./api/admin.js";
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
import { AdminPage } from "./pages/AdminPage.jsx";
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
const CHANNEL_PERMISSION_MAP = { PUBLIC: "公开", PASSWORD: "密码" };
const MESSAGE_PERMISSION_MAP = {
  EVERYONE: "允许所有人",
  FRIENDS_ONLY: "仅好友",
  NONE: "不接收陌生人私信",
};

function toVisibility(value) {
  if (value === "好友可见") return "FRIENDS";
  if (value === "私密") return "PRIVATE";
  return "PUBLIC";
}

function toChannelPermission(value) {
  return value === "密码" ? "PASSWORD" : "PUBLIC";
}

function toMessagePermission(value) {
  if (value === "允许所有人") return "EVERYONE";
  if (value === "不接收陌生人私信") return "NONE";
  return "FRIENDS_ONLY";
}

function toReportTarget(type) {
  if (type === "频道帖子") return "CHANNEL_POST";
  if (type === "聊天消息") return "MESSAGE";
  if (type === "用户") return "USER";
  return "NOTE";
}

function toReportReason(reason) {
  if (reason === "广告") return "ADVERTISEMENT";
  if (reason === "骚扰") return "HARASSMENT";
  if (reason === "不实信息") return "FALSE_INFORMATION";
  return "OTHER";
}

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
  const [authNotice, setAuthNotice] = useState("");

  // ── 数据状态 ──
  const [notes, setNotes] = useState(initialNotes);
  const [socialFeedNotes, setSocialFeedNotes] = useState(
    getSocialNotes(initialNotes),
  );
  const [channels, setChannels] = useState(initialChannels);
  const [chats, setChats] = useState(initialChats);
  const [tagsList, setTagsList] = useState(tags);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [profileData, setProfileData] = useState(null);
  const [relationsData, setRelationsData] = useState([]);
  const [blockedRelations, setBlockedRelations] = useState([]);
  const [adminDashboard, setAdminDashboard] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);

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
  const [draftImages, setDraftImages] = useState([]);
  const [draftUploading, setDraftUploading] = useState(false);
  const [draftError, setDraftError] = useState("");

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
  const [channelPostReply, setChannelPostReply] = useState("");
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

  const socialNotes = useMemo(() => socialFeedNotes, [socialFeedNotes]);

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
        BLOCKED: ["已拉黑", "已限制对方与你互动"],
      };
      return relationsData.map((r) => ({
        id: r.userId,
        name: r.nickname || "用户",
        avatar: r.avatarUrl || DEFAULT_AVATAR,
        status: r.status,
        state: statusMap[r.status]?.[0] || r.status,
        detail: statusMap[r.status]?.[1] || "",
      }));
    }
    return friendRows;
  }, [relationsData]);

  // ── 工具函数 ──
  function goTo(label) {
    if (label === "全站管理" && currentUser.role !== "ADMIN") return;
    setActiveNav(label);
    setUserMenuOpen(false);
  }

  function fromApiUser(user) {
    return {
      name: user.nickname || "新用户",
      meta: `${user.grade || "待完善"} · ${user.college || "待完善"}`,
      avatar: user.avatarUrl || DEFAULT_AVATAR,
      id: user.id,
      role: user.role || "USER",
      status: user.status || "ACTIVE",
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

  function mapComment(apiComment) {
    return {
      id: apiComment.id,
      authorId: apiComment.author?.id,
      user: apiComment.author?.nickname || "用户",
      text: apiComment.content || "",
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
      administratorId: ch.administrator?.id,
      isAdmin: ch.administrator?.id === myId,
      announcement: ch.announcement || "",
      members: ch.memberCount,
      posts: [],
    }));
  }

  function mapChannelPost(apiPost) {
    return {
      id: String(apiPost.id),
      title: apiPost.title,
      pinned: apiPost.pinned || false,
      likes: apiPost.likeCount || 0,
      replies: apiPost.replyCount || 0,
      body: apiPost.content || "",
      author: apiPost.authorName || "用户",
      authorId: apiPost.authorId,
      channelId: apiPost.channelId,
      liked: apiPost.liked || false,
      time: apiPost.createdAt ? timeAgo(apiPost.createdAt) : "",
      tags: [],
      image: false,
    };
  }

  function mapChats(apiChats, myId) {
    return (apiChats || []).map((c) => ({
      id: String(c.id),
      name: c.name,
      type: c.type === "GROUP" ? "群聊" : "好友",
      unread: c.unreadCount || 0,
      lastTime: c.lastMessageAt ? timeAgo(c.lastMessageAt) : "",
      lastMessage: c.lastMessage || "",
      messages: c.lastMessage
        ? [
            {
              from: c.name,
              text: c.lastMessage,
              time: c.lastMessageAt ? timeAgo(c.lastMessageAt) : "",
              mine: false,
              read: c.unreadCount === 0,
            },
          ]
        : [],
    }));
  }

  function mapChatMessage(apiMessage) {
    return {
      id: apiMessage.id,
      from: apiMessage.mine ? "我" : apiMessage.senderName || "用户",
      text: apiMessage.content || "",
      time: apiMessage.sentAt ? timeAgo(apiMessage.sentAt) : "",
      mine: apiMessage.mine,
      read: apiMessage.read,
    };
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
        socialFeedData,
        channelsData,
        chatsData,
        profileDataRes,
        tagsData,
        relationsDataRes,
        notificationsData,
        privacyData,
        blockedData,
      ] = await Promise.all([
        getNotes({ scope: "PUBLIC" }),
        getSocialFeed(),
        getChannels({ joined: null }),
        getConversations(),
        getMyProfile(),
        getTags(),
        getRelations(),
        apiGetNotifications(),
        getPrivacy(),
        getBlockedUsers(),
      ]);
      setNotes((notesData?.items || []).map(mapNote));
      setSocialFeedNotes((socialFeedData?.items || []).map(mapNote));
      if (tagsData?.length) {
        setTagsList(["全部", ...tagsData]);
      }
      const mappedChannels = mapChannels(
        channelsData?.items || [],
        profileDataRes?.id,
      );
      const channelsWithPosts = await Promise.all(
        mappedChannels.map(async (channel) => {
          try {
            const postsData = await getPosts(Number(channel.id), {
              page: 1,
              size: 20,
            });
            return {
              ...channel,
              posts: (postsData?.items || []).map(mapChannelPost),
            };
          } catch {
            return channel;
          }
        }),
      );
      setChannels(channelsWithPosts);
      const mappedChats = mapChats(chatsData || [], profileDataRes?.id);
      const chatsWithMessages = await Promise.all(
        mappedChats.map(async (chat) => {
          try {
            const messagesData = await getMessages(Number(chat.id), {
              page: 1,
              size: 30,
            });
            const messages = (messagesData?.items || []).map(mapChatMessage);
            return {
              ...chat,
              messages: messages.length ? messages : chat.messages,
            };
          } catch {
            return chat;
          }
        }),
      );
      setChats(chatsWithMessages);
      setCurrentUser({
        name: profileDataRes?.nickname || "新用户",
        meta: `${profileDataRes?.grade || ""} · ${profileDataRes?.college || ""}`,
        avatar: profileDataRes?.avatarUrl || DEFAULT_AVATAR,
        id: profileDataRes?.id,
        role: profileDataRes?.role || currentUser.role || "USER",
        status: profileDataRes?.status || currentUser.status || "ACTIVE",
      });
      setProfileData(profileDataRes);
      setRelationsData(relationsDataRes || []);
      const apiBlocked = blockedData?.items || blockedData || [];
      setBlockedRelations(apiBlocked);
      if (apiBlocked.length > 0) {
        setBlockedUsers(apiBlocked.map((user) => user.nickname || "用户"));
      }
      // 同步编辑表单状态
      if (profileDataRes) {
        setProfileName(profileDataRes.nickname || "");
        setProfileMeta(`${profileDataRes.grade || ""} · ${profileDataRes.college || ""}`);
        setProfileBio(profileDataRes.bio || "");
        setProfileAvatar(profileDataRes.avatarUrl || DEFAULT_AVATAR);
      }
      if (privacyData) {
        const nextPrivacy = {
          noteVisibility: VIS_MAP[privacyData.defaultNoteVisibility] || "公开",
          channelPermission:
            CHANNEL_PERMISSION_MAP[privacyData.defaultChannelJoinType] || "公开",
          messagePermission:
            MESSAGE_PERMISSION_MAP[privacyData.directMessagePermission] || "仅好友",
        };
        setPrivacy(nextPrivacy);
        setDraftVisibility(nextPrivacy.noteVisibility);
      }
      // 映射通知数据
      const apiNotifications = notificationsData?.items || notificationsData || [];
      if (apiNotifications.length > 0) {
        setNotifications(
          apiNotifications.map((n) => ({
            id: n.id,
            type: String(n.type || "").includes("COMMENT") || String(n.type || "").includes("REPLY")
              ? "comment"
              : String(n.type || "").includes("SAVE")
                ? "save"
                : "like",
            rawType: n.type,
            user: n.title || "系统",
            action: n.content || "",
            target: n.targetId ? `#${n.targetId}` : "",
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

  useEffect(() => {
    if (loggedIn && activeNav === "全站管理" && currentUser.role === "ADMIN") {
      loadAdminDashboard();
    }
  }, [loggedIn, activeNav, currentUser.role]);

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
    setAuthNotice("");
    setAuthLoading(true);
    apiSendCode(authEmail, authMode === "找回密码" ? "RESET_PASSWORD" : "REGISTER")
      .then((data) => {
        setCodeSent(true);
        if (data?.mockCode) {
          setAuthNotice(`本地测试验证码：${data.mockCode}`);
        } else {
          setAuthNotice("验证码已发送，请查看邮箱。");
        }
      })
      .catch((err) => setAuthError(err.message))
      .finally(() => setAuthLoading(false));
  }

  function handleLogin() {
    setAuthError("");
    setAuthNotice("");
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
    setAuthNotice("");
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
    setAuthNotice("");
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
        setAuthNotice("密码已重置，请使用新密码登录。");
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
    setAdminDashboard(null);
  }

  // ── 笔记操作 ──
  function openNoteDetail(note) {
    setDetailNote(note);
    getComments(note.id)
      .then((comments) => {
        const mappedComments = (comments?.items || comments || []).map(mapComment);
        setDetailNote((current) =>
          current && current.id === note.id
            ? { ...current, comments: mappedComments }
            : current,
        );
      })
      .catch(() => {});
  }

  function toggleLike(id) {
    likeNote(id)
      .then((res) => {
        const update = (items) =>
          items.map((n) =>
            n.id === id ? { ...n, liked: res.active, likes: res.count } : n,
          );
        setNotes(update);
        setSocialFeedNotes(update);
      })
      .catch(() => {});
  }

  function toggleSave(id) {
    saveNote(id)
      .then((res) => {
        const update = (items) =>
          items.map((n) =>
            n.id === id ? { ...n, saved: res.active, saves: res.count } : n,
          );
        setNotes(update);
        setSocialFeedNotes(update);
      })
      .catch(() => {});
  }

  function addComment(noteId, text) {
    if (!text.trim()) return;
    apiCreateComment(noteId, text.trim())
      .then((apiComment) => {
        const newComment = {
          id: apiComment.id,
          authorId: apiComment.author?.id,
          user: apiComment.author?.nickname || currentUser.name,
          text: apiComment.content || text.trim(),
        };
        setNotes((prev) =>
          prev.map((n) =>
            n.id === noteId
              ? { ...n, comments: [...n.comments, newComment], commentCount: (n.commentCount || 0) + 1 }
              : n,
          ),
        );
        setSocialFeedNotes((prev) =>
          prev.map((n) =>
            n.id === noteId
              ? { ...n, comments: [...n.comments, newComment], commentCount: (n.commentCount || 0) + 1 }
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

  function removeNote(noteId) {
    apiDeleteNote(noteId)
      .then(() => {
        setNotes((items) => items.filter((note) => note.id !== noteId));
        setSocialFeedNotes((items) => items.filter((note) => note.id !== noteId));
        setDetailNote((note) => (note?.id === noteId ? null : note));
      })
      .catch(() => {});
  }

  function removeComment(noteId, commentId) {
    apiDeleteComment(noteId, commentId)
      .then(() => {
        setNotes((items) =>
          items.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  comments: note.comments.filter((comment) => comment.id !== commentId),
                  commentCount: Math.max((note.commentCount || 0) - 1, 0),
                }
              : note,
          ),
        );
        setSocialFeedNotes((items) =>
          items.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  comments: note.comments.filter((comment) => comment.id !== commentId),
                  commentCount: Math.max((note.commentCount || 0) - 1, 0),
                }
              : note,
          ),
        );
        setDetailNote((note) =>
          note?.id === noteId
            ? {
                ...note,
                comments: note.comments.filter((comment) => comment.id !== commentId),
                commentCount: Math.max((note.commentCount || 0) - 1, 0),
              }
            : note,
        );
      })
      .catch(() => {});
  }

  function resetDraft() {
    draftImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    setDraftTitle("");
    setDraftText("");
    setImageCount(0);
    setDraftImages([]);
    setDraftError("");
    setDraftUploading(false);
  }

  function closeDraft() {
    resetDraft();
    setDraftOpen(false);
  }

  function addDraftImages(files) {
    const selected = Array.from(files || []);
    if (!selected.length) return;
    setDraftError("");
    const slots = Math.max(9 - draftImages.length, 0);
    const valid = selected
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, slots)
      .map((file) => ({
        id: `${Date.now()}-${file.name}-${Math.random()}`,
        file,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
      }));
    if (selected.length > slots) {
      setDraftError("一篇笔记最多上传 9 张图片");
    } else if (valid.length !== selected.length) {
      setDraftError("只能选择图片文件");
    }
    setDraftImages((items) => [...items, ...valid]);
    setImageCount((count) => count + valid.length);
  }

  function removeDraftImage(imageId) {
    setDraftImages((items) => {
      const target = items.find((image) => image.id === imageId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const next = items.filter((image) => image.id !== imageId);
      setImageCount(next.length);
      return next;
    });
  }

  async function createNote() {
    if (draftUploading) return;
    if (!draftTitle.trim() && !draftText.trim() && draftImages.length === 0) return;
    setDraftUploading(true);
    setDraftError("");
    try {
      const uploadedImages = await Promise.all(
        draftImages.map((image) => uploadImage(image.file)),
      );
      const imageUrls = uploadedImages.map((image) => image.url);
      const apiNote = await apiCreateNote({
        title: draftTitle.trim() || "今天的校园记录",
        content: draftText.trim() || (imageUrls.length ? "分享了一组校园图片。" : "分享了一张校园图片。"),
        visibility: VIS_REV[draftVisibility] || "PUBLIC",
        imageUrls,
        tags: ["校园生活"],
      });
      setNotes((items) => [mapNote(apiNote), ...items]);
      if (apiNote.visibility === "FRIENDS") {
        setSocialFeedNotes((items) => [mapNote(apiNote), ...items]);
      }
      resetDraft();
      setDraftOpen(false);
      setActiveNav(draftVisibility === "公开" ? "主页" : "社交圈");
    } catch (err) {
      setDraftError(err.message || "图片上传失败，请稍后重试");
    } finally {
      setDraftUploading(false);
    }
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
          administratorId: apiChannel.administrator?.id || currentUser.id,
          isAdmin: true,
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
          author: apiPost.authorName || currentUser.name,
          authorId: apiPost.authorId || currentUser.id,
          channelId: apiPost.channelId || Number(selectedChannel.id),
          liked: apiPost.liked || false,
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

  function updateChannelPostInState(postId, patch) {
    setChannels((items) =>
      items.map((channel) => ({
        ...channel,
        posts: channel.posts.map((post) =>
          String(post.id) === String(postId) ? { ...post, ...patch } : post,
        ),
      })),
    );
    setChannelPostDetail((detail) =>
      detail && String(detail.post.id) === String(postId)
        ? { ...detail, post: { ...detail.post, ...patch } }
        : detail,
    );
  }

  function saveChannelAnnouncement(channelId, announcement) {
    const text = announcement.trim();
    if (!text) return;
    apiUpdateAnnouncement(Number(channelId), text)
      .then((apiChannel) => {
        setChannels((items) =>
          items.map((channel) =>
            channel.id === String(channelId)
              ? {
                  ...channel,
                  announcement: apiChannel.announcement || text,
                  admin: apiChannel.administrator?.nickname || channel.admin,
                  administratorId:
                    apiChannel.administrator?.id || channel.administratorId,
                  isAdmin:
                    (apiChannel.administrator?.id || channel.administratorId) ===
                    currentUser.id,
                }
              : channel,
          ),
        );
      })
      .catch(() => {});
  }

  // ── 用户操作 ──
  function refreshRelations() {
    Promise.all([getRelations(), getBlockedUsers()])
      .then(([relations, blocks]) => {
        setRelationsData(relations || []);
        const apiBlocked = blocks?.items || blocks || [];
        setBlockedRelations(apiBlocked);
        setBlockedUsers(apiBlocked.map((user) => user.nickname || "用户"));
      })
      .catch(() => {});
  }

  function changeRelation(userId, action) {
    if (!userId) return;
    const calls = {
      follow: apiFollow,
      unfollow: apiUnfollow,
      block: apiBlock,
      unblock: apiUnblock,
    };
    calls[action]?.(Number(userId))
      .then((result) => {
        const nextStatus =
          action === "block"
            ? "BLOCKED"
            : action === "unblock"
              ? "NONE"
              : result?.status || (action === "follow" ? "FOLLOWING" : "NONE");
        setProfileUser((user) =>
          user &&
          [user.id, user.authorId, user.userId].some((id) => String(id) === String(userId))
            ? { ...user, relation: nextStatus }
            : user,
        );
        refreshRelations();
      })
      .catch(() => {});
  }

  function blockUser(user) {
    const userId = user?.id || user?.authorId || user?.userId;
    if (!userId) {
      const name = user?.author || user?.name || user;
      if (name && !blockedUsers.includes(name))
        setBlockedUsers((items) => [name, ...items]);
      setProfileUser(null);
      return;
    }
    apiBlock(Number(userId))
      .then(() => {
        refreshRelations();
        setProfileUser(null);
      })
      .catch(() => {});
  }

  function openUserProfile(user) {
    const userId = user?.authorId || user?.id || user?.userId;
    if (!userId) {
      setProfileUser(user);
      return;
    }
    getUserProfile(Number(userId))
      .then((profile) => {
        setProfileUser({
          ...user,
          id: profile.id,
          authorId: profile.id,
          author: profile.nickname || user.author || user.name,
          name: profile.nickname || user.name || user.author,
          avatar: profile.avatarUrl || user.avatar || DEFAULT_AVATAR,
          meta: `${profile.grade || ""} · ${profile.college || ""}`,
          bio: profile.bio || "",
          relation: profile.relation,
        });
      })
      .catch(() => setProfileUser(user));
  }

  function startConversationWith(user) {
    const userId = user?.id || user?.authorId || user?.userId;
    if (!userId) return;
    apiCreateConversation({
      type: "PRIVATE",
      participantIds: [Number(userId)],
      name: user.name || user.author || user.nickname,
    })
      .then((conversation) => {
        const mapped = mapChats([conversation], currentUser.id)[0];
        setChats((items) => {
          const exists = items.some((chat) => chat.id === mapped.id);
          return exists
            ? items.map((chat) => (chat.id === mapped.id ? { ...chat, ...mapped } : chat))
            : [mapped, ...items];
        });
        setActiveChatId(mapped.id);
        setActiveNav("聊天");
        setProfileUser(null);
      })
      .catch(() => {});
  }

  function markNotificationRead(notificationId) {
    apiMarkNotificationRead(notificationId)
      .catch(() => {})
      .finally(() =>
        setNotifications((items) =>
          items.map((item) =>
            item.id === notificationId ? { ...item, unread: false } : item,
          ),
        ),
      );
  }

  function loadAdminDashboard() {
    if (currentUser.role !== "ADMIN") return;
    setAdminLoading(true);
    getAdminDashboard()
      .then(setAdminDashboard)
      .catch(() => {})
      .finally(() => setAdminLoading(false));
  }

  function updateAdminUserStatus(userId, status) {
    setAdminLoading(true);
    setAdminUserStatus(userId, status)
      .then(loadAdminDashboard)
      .catch(() => {})
      .finally(() => setAdminLoading(false));
  }

  function updateAdminChannelStatus(channelId, status) {
    setAdminLoading(true);
    setAdminChannelStatus(channelId, status)
      .then(() => {
        loadAdminDashboard();
        loadAllData();
      })
      .catch(() => {})
      .finally(() => setAdminLoading(false));
  }

  function removeAdminNote(noteId) {
    deleteAdminNote(noteId)
      .then(() => {
        setNotes((items) => items.filter((note) => note.id !== noteId));
        setSocialFeedNotes((items) => items.filter((note) => note.id !== noteId));
        loadAdminDashboard();
      })
      .catch(() => {});
  }

  function removeAdminChannelPost(postId) {
    deleteAdminChannelPost(postId)
      .then(() => {
        setChannels((items) =>
          items.map((channel) => ({
            ...channel,
            posts: channel.posts.filter((post) => String(post.id) !== String(postId)),
          })),
        );
        loadAdminDashboard();
      })
      .catch(() => {});
  }

  function updatePrivacyField(key, value) {
    setPrivacy((items) => ({ ...items, [key]: value }));
    if (key === "noteVisibility") setDraftVisibility(value);
    const nextPrivacy = { ...privacy, [key]: value };
    apiUpdatePrivacy({
      noteVisibility: toVisibility(nextPrivacy.noteVisibility),
      channelPermission: toChannelPermission(nextPrivacy.channelPermission),
      messagePermission: toMessagePermission(nextPrivacy.messagePermission),
    }).catch(() => {});
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
    apiMarkChatRead(Number(chatId)).catch(() => {});
  }

  function sendChatMessage() {
    const text = chatInput.trim();
    if (!text || !activeChatId) return;
    apiSendMessage(Number(activeChatId), text)
      .then((apiMessage) => {
        const message = mapChatMessage(apiMessage);
        setChats((items) =>
          items.map((ch) =>
            ch.id === activeChatId
              ? { ...ch, messages: [...ch.messages, message], lastTime: "刚刚" }
              : ch,
          ),
        );
        setChatInput("");
      })
      .catch(() => {
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        const message = { id: Date.now(), from: "我", text, time, mine: true, read: true };
        setChats((items) =>
          items.map((ch) =>
            ch.id === activeChatId
              ? { ...ch, messages: [...ch.messages, message], lastTime: "刚刚" }
              : ch,
          ),
        );
        setChatInput("");
      });
  }

  function markAllChatsAsRead() {
    setChats((items) => items.map((ch) => ({ ...ch, unread: 0 })));
  }

  function openChannelPostDetail(payload) {
    setChannelPostDetail({ ...payload, replies: [] });
    setChannelPostReply("");
    getPostDetail(Number(payload.post.id))
      .then((detail) => {
        setChannelPostDetail({
          channel: payload.channel,
          post: {
            ...payload.post,
            title: detail.post?.title || payload.post.title,
            body: detail.post?.content || payload.post.body,
            likes: detail.post?.likeCount ?? payload.post.likes,
            replies: detail.post?.replyCount ?? payload.post.replies,
            pinned: detail.post?.pinned ?? payload.post.pinned,
            liked: detail.post?.liked ?? payload.post.liked,
            author: detail.post?.authorName || payload.post.author,
            authorId: detail.post?.authorId || payload.post.authorId,
            channelId: detail.post?.channelId || payload.post.channelId,
          },
          replies: detail.replies || [],
        });
      })
      .catch(() => {});
  }

  function submitChannelPostReply() {
    const text = channelPostReply.trim();
    if (!text || !channelPostDetail) return;
    const postId = Number(channelPostDetail.post.id);
    apiReplyToPost(postId, text)
      .then((reply) => {
        setChannelPostDetail((detail) =>
          detail
            ? {
                ...detail,
                replies: [...(detail.replies || []), reply],
                post: {
                  ...detail.post,
                  replies: (detail.post.replies || 0) + 1,
                },
              }
            : detail,
        );
        updateChannelPostInState(postId, {
          replies: (channelPostDetail.post.replies || 0) + 1,
        });
        setChannelPostReply("");
      })
      .catch(() => {});
  }

  function toggleChannelPostLike() {
    if (!channelPostDetail) return;
    const postId = Number(channelPostDetail.post.id);
    apiLikePost(postId)
      .then((result) => {
        updateChannelPostInState(postId, {
          liked: result.active,
          likes: result.count,
        });
      })
      .catch(() => {});
  }

  function toggleChannelPostPinned() {
    if (!channelPostDetail) return;
    const postId = Number(channelPostDetail.post.id);
    const pinned = !channelPostDetail.post.pinned;
    apiSetPostPinned(postId, pinned)
      .then((post) => {
        updateChannelPostInState(postId, {
          pinned: post.pinned,
          likes: post.likeCount ?? channelPostDetail.post.likes,
          replies: post.replyCount ?? channelPostDetail.post.replies,
        });
      })
      .catch(() => {});
  }

  function submitReport(reason) {
    if (!reportTarget) return;
    apiReport({
      targetType: reportTarget.targetType || toReportTarget(reportTarget.type),
      targetId: Number(reportTarget.targetId || reportTarget.id || 1),
      reason: toReportReason(reason),
      description: reportTarget.title || "",
    })
      .catch(() => {})
      .finally(() => setReportTarget(null));
  }

  // ── Draft 对象（供 AppModals 使用） ──
  const draft = {
    open: draftOpen,
    title: draftTitle,
    text: draftText,
    imageCount: draftImages.length,
    images: draftImages,
    uploading: draftUploading,
    error: draftError,
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
    currentUserId: currentUser.id,
    onOpenNote: openNoteDetail,
    onOpenProfile: openUserProfile,
    onReport: setReportTarget,
    onSelectTag: setActiveTag,
    onToggleLike: toggleLike,
    onToggleSave: toggleSave,
    onDeleteNote: removeNote,
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
            onRelationAction={changeRelation}
            onStartConversation={startConversationWith}
          />
        );
      case "频道":
        return (
          <ChannelsPage
            channels={channels}
            selectedChannel={selectedChannel}
            onSelectChannel={setSelectedChannelId}
            onJoin={setJoinChannel}
            onOpenPost={openChannelPostDetail}
            onReport={setReportTarget}
            onCreateChannel={() => setCreateChannelOpen(true)}
            onUpdateAnnouncement={saveChannelAnnouncement}
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
            channels={channels}
            savedNotes={savedNotes}
            likedNotes={notes.filter((n) => n.liked)}
            recentActivities={[
              ...notes
                .filter((n) => n.author === currentUser.name || n.visibility === "私密")
                .slice(0, 2)
                .map((n) => `发布了笔记「${n.title}」`),
              ...savedNotes.slice(0, 2).map((n) => `收藏了「${n.title}」`),
              ...channels
                .filter((ch) => ch.joined)
                .slice(0, 2)
                .map((ch) => `加入了频道「${ch.name}」`),
            ]}
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
      case "全站管理":
        if (currentUser.role !== "ADMIN") return <div className="empty-state">仅全站管理员可访问。</div>;
        return (
          <AdminPage
            dashboard={adminDashboard}
            loading={adminLoading}
            onRefresh={loadAdminDashboard}
            onUserStatus={updateAdminUserStatus}
            onChannelStatus={updateAdminChannelStatus}
            onDeleteNote={removeAdminNote}
            onDeletePost={removeAdminChannelPost}
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
        authNotice={authNotice}
        authLoading={authLoading}
        onModeChange={(mode) => {
          setAuthMode(mode);
          setAuthError("");
          setAuthNotice("");
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
        isAdmin={currentUser.role === "ADMIN"}
      />

      <main className="content">
        <Topbar
          activeNav={activeNav}
          page={page}
          notifications={notifications}
          open={notificationsOpen}
          onToggle={() => setNotificationsOpen((v) => !v)}
          onMarkAllRead={() =>
            apiMarkAllNotificationsRead()
              .catch(() => {})
              .finally(() =>
                setNotifications((items) =>
                  items.map((item) => ({ ...item, unread: false })),
                ),
              )
          }
          onMarkRead={markNotificationRead}
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
                                targetId: msg.id,
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
        onCloseDraft={closeDraft}
        onAddDraftImages={addDraftImages}
        onRemoveDraftImage={removeDraftImage}
        onCloseJoin={() => {
          setJoinChannel(null);
          setJoinPassword("");
        }}
        onClosePost={() => setChannelPostDetail(null)}
        onCloseProfile={() => setProfileUser(null)}
        onCloseReport={() => setReportTarget(null)}
        onSubmitReport={submitReport}
        onJoinPasswordChange={setJoinPassword}
        onSubmitJoin={submitJoinChannel}
        onBlockUser={blockUser}
        onReport={setReportTarget}
        channelPostReply={channelPostReply}
        onChannelPostReplyChange={setChannelPostReply}
        onSubmitChannelPostReply={submitChannelPostReply}
        onToggleChannelPostLike={toggleChannelPostLike}
        onToggleChannelPostPinned={toggleChannelPostPinned}
        onRelationAction={changeRelation}
        onStartConversation={startConversationWith}
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
                  <div className="comment-row" key={c.id || `${c.user}-${c.text}`}>
                    <p>
                      <strong>{c.user}</strong>
                      {c.text}
                    </p>
                    {c.id && (c.authorId === currentUser.id || detailNote.authorId === currentUser.id) && (
                      <button
                        className="icon-mini"
                        title="删除评论"
                        onClick={() => removeComment(detailNote.id, c.id)}
                      >
                        <Trash size={15} />
                      </button>
                    )}
                  </div>
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
              {detailNote.authorId === currentUser.id && (
                <button
                  title="删除笔记"
                  onClick={() => removeNote(detailNote.id)}
                >
                  <Trash size={18} />
                  删除
                </button>
              )}
              <button
                title="举报"
                onClick={() =>
                  setReportTarget({ type: "笔记", title: detailNote.title, targetId: detailNote.id })
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
