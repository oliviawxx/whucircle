import { Component, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  BookmarkSimple,
  CaretDown,
  CaretLeft,
  CaretRight,
  Calendar,
  ChatCircle,
  ChatsCircle,
  Crown,
  Check,
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
  SignOut,
  Student,
  Trash,
  UserCircle,
  UserPlus,
  UserMinus,
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
 createPost as apiCreatePost, deletePost as apiDeletePost,
  deleteChannel as apiDeleteChannel,
 updateAnnouncement as apiUpdateAnnouncement,
  getInitialAdminDashboard,
  applyForChannelAdmin,
  inviteChannelAdmin,
  handleChannelAdminRequest,
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
  getGroupDetail as apiGetGroupDetail,
  renameGroup as apiRenameGroup,
  removeGroupMember as apiRemoveGroupMember,
  leaveGroup as apiLeaveGroup,
  transferGroupOwner as apiTransferGroupOwner,
  dissolveGroup as apiDissolveGroup,
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
  searchUsers,
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
import { getRecommendedNotes, getRecommendedUsers } from "./api/recommendations.js";
import {
  getChannelEvents,
  createChannelEvent as apiCreateChannelEvent,
  getChannelEvent as apiGetChannelEvent,
  updateChannelEvent as apiUpdateChannelEvent,
  joinChannelEvent as apiJoinChannelEvent,
  leaveChannelEvent as apiLeaveChannelEvent,
  cancelChannelEvent as apiCancelChannelEvent,
  getCalendarEvents as apiGetCalendarEvents,
} from "./api/events.js";
import { AuthPage } from "./components/auth/AuthPage.jsx";
import { ModalHead } from "./components/common/ModalHead.jsx";
import { NoteCardSkeleton } from "./components/common/Skeleton.jsx";
import { Sidebar } from "./components/layout/Sidebar.jsx";
import { Topbar } from "./components/layout/Topbar.jsx";
import { AppModals } from "./components/modals/AppModals.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { SocialCirclePage } from "./pages/SocialCirclePage.jsx";
import { ChannelsPage } from "./pages/ChannelsPage.jsx";
import { ChannelDetailPage } from "./pages/ChannelDetailPage.jsx";
import { ChatsPage } from "./pages/ChatsPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { VisitedProfilePage } from "./pages/VisitedProfilePage.jsx";
import { SavedPage } from "./pages/SavedPage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";
import { AdminPage } from "./pages/AdminPage.jsx";

class ChatWindowBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("Chat window render failed", error);
  }

  render() {
    if (this.state.failed) {
      return (
        <section className="chat-window chat-window-failed">
          <ChatsCircle size={34} />
          <p>这个会话暂时无法显示。</p>
          <button className="ghost-button small" onClick={this.props.onRetry}>重新加载</button>
        </section>
      );
    }
    return this.props.children;
  }
}
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
import { DEFAULT_AVATAR } from "./utils/avatar.js";

const DEMO_USER = { ...DEMO_USER_RAW, id: null, avatar: DEFAULT_AVATAR };

const VIS_MAP = { PUBLIC: "公开", FRIENDS: "好友可见", PRIVATE: "私密" };
const VIS_REV = { 公开: "PUBLIC", 好友可见: "FRIENDS", 私密: "PRIVATE" };
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

const postImageCache = JSON.parse(localStorage.getItem("whu-channel-images") || "{}");

function uniqueWords(value) {
  return (value || "")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part, index, parts) => parts.indexOf(part) === index);
}

function formatUserMeta(grade, college, fallback = "\u8d44\u6599\u5f85\u5b8c\u5584") {
  const parts = [...uniqueWords(grade), ...uniqueWords(college)]
    .filter((part, index, all) => all.indexOf(part) === index)
    .filter((part) => part !== "\u5f85\u5b8c\u5584");
  return parts.join(" ") || fallback;
}

function splitProfileMeta(meta) {
  const parts = uniqueWords(meta);
  const gradeIndex = parts.findIndex((part) => {
    const normalized = part.replace(/\s+/g, "");
    return normalized.includes("\u7ea7")
      || normalized.startsWith("\u51c6\u5927")
      || normalized.startsWith("\u5927")
      || normalized.startsWith("\u7814")
      || normalized.startsWith("\u535a");
  });
  const grade = gradeIndex >= 0 ? parts[gradeIndex] : "";
  const college = parts.filter((_, index) => index !== gradeIndex).join(" ");
  return { grade, college };
}

function normalizeMediaUrl(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith("/api/v1/files/")) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // Keep relative and object URLs unchanged.
  }
  return url;
}

export function App() {
  // 认证状态
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

  // 数据状态
  const [notes, setNotes] = useState(initialNotes);
  const [socialFeedNotes, setSocialFeedNotes] = useState(
    getSocialNotes(initialNotes),
  );
  const [channels, setChannels] = useState(initialChannels);
  const [chats, setChats] = useState(initialChats);
  const [tagsList, setTagsList] = useState(tags);
  const [notifications, setNotifications] = useState(initialNotifications);
  function removeChannelPost(postId) {
    const channelId = selectedChannel?.id;
    if (!channelId || !postId) return;
    setChannels((items) =>
      items.map((ch) =>
        ch.id === channelId
          ? { ...ch, posts: ch.posts.filter((p) => p.id !== String(postId)) }
          : ch,
      ),
    );
    const cache = JSON.parse(localStorage.getItem("whu-channel-images") || "{}");
    delete cache[postId];
    localStorage.setItem("whu-channel-images", JSON.stringify(cache));
    const deleted = JSON.parse(localStorage.getItem("whu-deleted-posts") || "[]");
    if (!deleted.includes(String(postId))) {
      deleted.push(String(postId));
      localStorage.setItem("whu-deleted-posts", JSON.stringify(deleted));
    }
    apiDeletePost(Number(channelId), Number(postId))
      .catch(() => {});
  }
  const MERGED_TAGS = ["全部", "校园生活", "学习", "摄影", "互助", "美食", "出行", "项目", "音乐", "阅读", "电影", "科技", "运动"];
  const [profileData, setProfileData] = useState(null);
  const [relationsData, setRelationsData] = useState([]);
  const [blockedRelations, setBlockedRelations] = useState([]);
  const [recommendedNoteCards, setRecommendedNoteCards] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [recommendedUsersLoading, setRecommendedUsersLoading] = useState(false);
  const [adminDashboard, setAdminDashboard] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [channelAdminDashboard, setChannelAdminDashboard] = useState(null);
  const [channelAdminOpen, setChannelAdminOpen] = useState(false);
  const [channelAdminLoading, setChannelAdminLoading] = useState(false);
  const [channelAdminAnnouncementDraft, setChannelAdminAnnouncementDraft] =
    useState("");

  // UI 状态
  const [activeNav, setActiveNav] = useState(() => {
    try { return sessionStorage.getItem("whu-last-nav") || "主页"; } catch { return "主页"; }
  });
  const [activeChatId, setActiveChatId] = useState(() => {
    try { return sessionStorage.getItem("whu-last-chat-id") || null; } catch { return null; }
  });
  const [chatListReady, setChatListReady] = useState(false);
  const [chatMessageLoading, setChatMessageLoading] = useState(false);
  const [chatLoadError, setChatLoadError] = useState("");
  const chatBubbleListRef = useRef(null);
  const [chatProfileTarget, setChatProfileTarget] = useState(null);
  const [groupPanelOpen, setGroupPanelOpen] = useState(false);
  const [groupDetail, setGroupDetail] = useState(null);
  const [groupNameDraft, setGroupNameDraft] = useState("");
  const [groupManageError, setGroupManageError] = useState("");
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [detailChannel, setDetailChannel] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationActionIds, setNotificationActionIds] = useState(() => new Set());
  const [channelDeletePending, setChannelDeletePending] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode, setSearchMode] = useState("notes");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [savedSearch, setSavedSearch] = useState("");
  const [activeTag, setActiveTag] = useState("全部");
  const [noteSort, setNoteSort] = useState("latest");

  // 草稿状态
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftText, setDraftText] = useState("");
  const [draftVisibility, setDraftVisibility] = useState("公开");
  const [imageCount, setImageCount] = useState(0);
  const [draftImages, setDraftImages] = useState([]);
 const [draftUploading, setDraftUploading] = useState(false);
 const [draftError, setDraftError] = useState("");
  const [draftTags, setDraftTags] = useState([]);

  // 弹窗状态
  const [detailNote, setDetailNote] = useState(null);
  const [detailImageIndex, setDetailImageIndex] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [profileUser, setProfileUser] = useState(null);
  const [visitedUser, setVisitedUser] = useState(null);
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
  const [channelPostDraftImages, setChannelPostDraftImages] = useState([]);
  const [channelPostDetail, setChannelPostDetail] = useState(null);
  const [channelPostReply, setChannelPostReply] = useState("");
  const [eventDraftOpen, setEventDraftOpen] = useState(false);
  const [eventDraftTitle, setEventDraftTitle] = useState("");
  const [eventDraftDescription, setEventDraftDescription] = useState("");
  const [eventDraftLocation, setEventDraftLocation] = useState("");
  const [eventDraftStart, setEventDraftStart] = useState("");
  const [eventDraftEnd, setEventDraftEnd] = useState("");
  const [eventDraftDeadline, setEventDraftDeadline] = useState("");
  const [eventDraftCapacity, setEventDraftCapacity] = useState("");
  const [eventDraftCreatePost, setEventDraftCreatePost] = useState(true);
  const [eventDraftCreateChat, setEventDraftCreateChat] = useState(true);
  const [eventDraftPinPost, setEventDraftPinPost] = useState(false);
  const [eventDraftError, setEventDraftError] = useState("");
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventDetail, setEventDetail] = useState(null);
  const [eventDetailError, setEventDetailError] = useState("");
  const [eventActionError, setEventActionError] = useState("");
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarCursor, setCalendarCursor] = useState(() => new Date());
  const [calendarSelectedDate, setCalendarSelectedDate] = useState("");
  const [reportTarget, setReportTarget] = useState(null);

  // 设置和个人资料状态
  const [activeTheme, setActiveTheme] = useState("rose");
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileMeta, setProfileMeta] = useState(currentUser.meta);
  const [profileBio, setProfileBio] = useState("校园生活、课程项目、摄影记录");
  const [profileAvatar, setProfileAvatar] = useState(currentUser.avatar);
  const [profileAvatarUploading, setProfileAvatarUploading] = useState(false);
  const [profileAvatarError, setProfileAvatarError] = useState("");
  const [selectedRelation, setSelectedRelation] = useState("关注");
  const [privacy, setPrivacy] = useState({
    noteVisibility: "公开",
    channelPermission: "公开",
    messagePermission: "仅好友",
    searchableByUsers: true,
    showEmailOnProfile: false,
    personalizedRecommendations: true,
    activityNotifications: true,
    loginAlerts: true,
  });
  const [blockedUsers, setBlockedUsers] = useState(["校外广告号"]);

  // 聊天输入
  const [chatInput, setChatInput] = useState("");
  const [chatError, setChatError] = useState("");
  const [groupChatOpen, setGroupChatOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [groupChatMemberIds, setGroupChatMemberIds] = useState([]);
  const [groupChatError, setGroupChatError] = useState("");

  // 派生值
  const selectedChannel =
    channels.find((ch) => ch.id === selectedChannelId) ?? channels[0];
  const activeChat =
    chats.find((ch) => ch.id === activeChatId) ?? chats[0] ?? null;
  const chatUnreadCount = chats.reduce(
    (sum, ch) => sum + (ch.unread > 0 ? ch.unread : 0),
    0,
  );

  const publicNotes = useMemo(
    () => {
      const searched = filterNotes(notes, searchTerm, activeTag, noteSort);
      if (searchTerm.trim() || activeTag !== "全部") return searched;
      const rank = new Map(
        recommendedNoteCards
          .filter((card) => card.type === "NOTE")
          .map((card, index) => [card.targetId, { index, card }]),
      );
      return [...searched].sort((a, b) => {
        const aRank = rank.get(a.id);
        const bRank = rank.get(b.id);
        if (aRank && bRank) return aRank.index - bRank.index;
        if (aRank) return -1;
        if (bRank) return 1;
        return 0;
      }).map((note) => {
        const recommendation = rank.get(note.id)?.card;
        return recommendation
          ? { ...note, recommendationReason: recommendation.reason, recommendationScore: recommendation.score }
          : note;
      });
    },
    [notes, searchTerm, activeTag, noteSort, recommendedNoteCards],
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
        FOLLOWER: ["被关注", "对方关注了你，可以回关成为好友"],
        NONE: ["未关注", "关注后内容会进入社交圈"],
        BLOCKED: ["已拉黑", "已限制对方与你互动"],
      };
      return relationsData.map((r) => ({
        id: r.userId,
        name: r.nickname || "用户",
        avatar: normalizeMediaUrl(r.avatarUrl) || DEFAULT_AVATAR,
        status: r.status,
        state: statusMap[r.status]?.[0] || r.status,
        detail: statusMap[r.status]?.[1] || "",
      }));
    }
    return friendRows;
  }, [relationsData]);

  const groupChatFriends = useMemo(
    () => friendList.filter((friend) => friend.id && friend.status === "FRIEND"),
    [friendList],
  );

  // 工具函数
  function goTo(label) {
    if (label === "全站管理" && currentUser.role !== "ADMIN") return;
    if (label === "聊天") {
      refreshChats();
    }
    if (label === "日历") {
      loadCalendarEvents();
    }
    setActiveNav(label);
    setUserMenuOpen(false);
    setNotificationsOpen(false);
    try { sessionStorage.setItem("whu-last-nav", label); } catch {}
  }

  function fromApiUser(user) {
    return {
      name: user.nickname || "新用户",
      meta: formatUserMeta(user.grade, user.college),
      avatar: normalizeMediaUrl(user.avatarUrl) || DEFAULT_AVATAR,
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
      meta: `${formatUserMeta("", apiNote.author?.college, "")} ${timeAgo(apiNote.createdAt)}`.trim(),
      avatar: normalizeMediaUrl(apiNote.author?.avatarUrl) || DEFAULT_AVATAR,
      title: apiNote.title,
      body: apiNote.content,
      images: (apiNote.imageUrls || []).map(normalizeMediaUrl),
      tags: apiNote.tags || [],
      visibility: VIS_MAP[apiNote.visibility] || "公开",
      likes: apiNote.likeCount,
      saves: apiNote.saveCount ?? 0,
      commentCount: apiNote.commentCount,
      createdAt: apiNote.createdAt,
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
      isInitialAdmin:
        ch.initialAdministrator ?? ch.administrator?.id === myId,
      isChannelAdmin:
        ch.channelAdministrator ??
        ch.initialAdministrator ??
        ch.administrator?.id === myId,
      isAdmin:
        ch.channelAdministrator ??
        ch.initialAdministrator ??
        ch.administrator?.id === myId,
     announcement: ch.announcement || "",
     members: ch.memberCount,
      memberIds: ch.memberIds || [],
      posts: [],
      events: [],
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
      imageUrls: (postImageCache[apiPost.id] || apiPost.imageUrls || []).map(normalizeMediaUrl),
    };
  }

  function formatEventTime(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function calendarDateKey(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  }

  function getCalendarDays(cursor) {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startOffset = (first.getDay() + 6) % 7;
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(cursor.getFullYear(), cursor.getMonth(), 1 - startOffset + index);
      return { date, key: calendarDateKey(date), current: date.getMonth() === cursor.getMonth() };
    });
  }

  function mapChannelEvent(apiEvent) {
    return {
      id: String(apiEvent.id),
      channelId: String(apiEvent.channelId),
      channelName: apiEvent.channelName,
      organizerId: apiEvent.organizerId,
      organizerName: apiEvent.organizerName || "管理员",
      linkedPostId: apiEvent.linkedPostId ? String(apiEvent.linkedPostId) : null,
      conversationId: apiEvent.conversationId ? String(apiEvent.conversationId) : null,
      canEnterChat: apiEvent.canEnterChat || false,
      title: apiEvent.title,
      description: apiEvent.description || "",
      location: apiEvent.location || "",
      startTime: apiEvent.startTime,
      endTime: apiEvent.endTime,
      signupDeadline: apiEvent.signupDeadline,
      timeLabel: `${formatEventTime(apiEvent.startTime)} - ${formatEventTime(apiEvent.endTime)}`,
      deadlineLabel: apiEvent.signupDeadline ? formatEventTime(apiEvent.signupDeadline) : "",
      capacity: apiEvent.capacity,
      participantCount: apiEvent.participantCount || 0,
      status: apiEvent.status,
      joined: apiEvent.joined || false,
      full: apiEvent.full || false,
      ended: apiEvent.ended || false,
      canManage: apiEvent.canManage || false,
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
    if (!apiMessage || typeof apiMessage !== "object") return null;
    return {
      id: apiMessage.id,
      userId: apiMessage.senderId,
      from: apiMessage.mine ? "我" : apiMessage.senderName || "用户",
      avatar: apiMessage.senderAvatarUrl || "",
      college: apiMessage.senderCollege || "",
      text: apiMessage.content || "",
      time: apiMessage.sentAt ? timeAgo(apiMessage.sentAt) : "",
      mine: apiMessage.mine,
      read: apiMessage.read,
    };
  }

  function normalizeChatMessages(messages) {
    return (Array.isArray(messages) ? messages : [])
      .filter((message) => message && typeof message === "object");
  }

  async function loadChatMessages(chatId) {
    if (!chatId) return;
    setChatMessageLoading(true);
    setChatLoadError("");
    try {
      const messagesData = await getMessages(Number(chatId), { page: 1, size: 30 });
      const messages = normalizeChatMessages((messagesData?.items || []).map(mapChatMessage));
      setChats((items) => items.map((chat) => chat.id === String(chatId) || chat.id === chatId
        ? { ...chat, messages }
        : chat));
    } catch (error) {
      setChatLoadError(error.message || "消息加载失败");
    } finally {
      setChatMessageLoading(false);
    }
  }

  async function refreshChats(preferredChatId = activeChatId) {
    setChatListReady(false);
    setChatLoadError("");
    try {
      const chatsData = await getConversations();
      const mappedChats = mapChats(chatsData || [], currentUser.id);
      setChats(mappedChats);
      const targetId = preferredChatId && mappedChats.some((chat) => String(chat.id) === String(preferredChatId))
        ? String(preferredChatId)
        : mappedChats[0]?.id || null;
      setActiveChatId(targetId);
      if (targetId) await loadChatMessages(targetId);
    } catch (error) {
      setChatLoadError(error.message || "会话加载失败");
    } finally {
      setChatListReady(true);
    }
  }

  // 认证 Effect
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

  // 数据加载
  async function loadAllData() {
    try {
      const [
        notesData,
        socialFeedData,
        channelsData,
        profileDataRes,
        tagsData,
        relationsDataRes,
        notificationsData,
        privacyData,
        blockedData,
        recommendedNotesData,
        recommendedUsersData,
        calendarData,
      ] = await Promise.all([
        getNotes({ scope: "PUBLIC" }).catch(() => ({ items: [] })),
        getSocialFeed().catch(() => ({ items: [] })),
        getChannels({ joined: null }).catch(() => ({ items: [] })),
        getMyProfile().catch(() => null),
        getTags().catch(() => []),
        getRelations().catch(() => []),
        apiGetNotifications().catch(() => ({ items: [] })),
        getPrivacy().catch(() => null),
        getBlockedUsers().catch(() => []),
        getRecommendedNotes({ page: 1, size: 30 }).catch(() => ({ items: [] })),
        getRecommendedUsers({ page: 1, size: 20 }).catch(() => ({ items: [] })),
        apiGetCalendarEvents().catch(() => []),
      ]);
      setNotes((notesData?.items || []).map(mapNote));
      setSocialFeedNotes((socialFeedData?.items || []).map(mapNote));
      if (tagsData?.length) {
        setTagsList(["全部", ...tagsData]);
      }
      setTagsList(MERGED_TAGS);
      const mappedChannels = mapChannels(
        channelsData?.items || [],
        profileDataRes?.id,
      );
      setChannels(mappedChannels);
      void Promise.all(
        mappedChannels.map(async (channel) => {
          let posts = channel.posts;
          let events = channel.events;
          try {
            const postsData = await getPosts(Number(channel.id), {
              page: 1,
              size: 20,
            });
            posts = (postsData?.items || []).map(mapChannelPost).filter((p) => {
                const deleted = JSON.parse(localStorage.getItem("whu-deleted-posts") || "[]");
                return !deleted.includes(p.id);
              });
          } catch {}
          if (channel.joined || channel.isAdmin || channel.isChannelAdmin) {
            try {
              const eventsData = await getChannelEvents(Number(channel.id), {
                page: 1,
                size: 20,
              });
              events = (eventsData?.items || []).map(mapChannelEvent);
            } catch {}
          }
          return { ...channel, posts, events };
        }),
      ).then((channelsWithPosts) => setChannels(channelsWithPosts));
      setCalendarEvents((calendarData || []).map(mapChannelEvent));
      if (profileDataRes) setCurrentUser({
        name: profileDataRes.nickname || "新用户",
        meta: formatUserMeta(profileDataRes.grade, profileDataRes.college),
        avatar: normalizeMediaUrl(profileDataRes.avatarUrl) || DEFAULT_AVATAR,
        id: profileDataRes.id,
        role: profileDataRes.role || currentUser.role || "USER",
        status: profileDataRes.status || currentUser.status || "ACTIVE",
      });
      setProfileData(profileDataRes);
      setRelationsData(relationsDataRes || []);
      setRecommendedNoteCards(recommendedNotesData?.items || []);
      setRecommendedUsers(recommendedUsersData?.items || []);
      const apiBlocked = blockedData?.items || blockedData || [];
      setBlockedRelations(apiBlocked);
      if (apiBlocked.length > 0) {
        setBlockedUsers(apiBlocked.map((user) => user.nickname || "用户"));
      }
      // 同步编辑表单状态
      if (profileDataRes) {
        setProfileName(profileDataRes.nickname || "");
        setProfileMeta(formatUserMeta(profileDataRes.grade, profileDataRes.college, ""));
        setProfileBio(profileDataRes.bio || "");
        setProfileAvatar(normalizeMediaUrl(profileDataRes.avatarUrl) || DEFAULT_AVATAR);
      }
      if (privacyData) {
        const nextPrivacy = {
          noteVisibility: VIS_MAP[privacyData.defaultNoteVisibility] || "公开",
          channelPermission:
            CHANNEL_PERMISSION_MAP[privacyData.defaultChannelJoinType] || "公开",
          messagePermission:
            MESSAGE_PERMISSION_MAP[privacyData.directMessagePermission] || "仅好友",
          searchableByUsers: privacyData.searchableByUsers ?? true,
          showEmailOnProfile: privacyData.showEmailOnProfile ?? false,
          personalizedRecommendations: privacyData.personalizedRecommendations ?? true,
          activityNotifications: privacyData.activityNotifications ?? true,
          loginAlerts: privacyData.loginAlerts ?? true,
        };
        setPrivacy(nextPrivacy);
        setDraftVisibility(nextPrivacy.noteVisibility);
      }
      // 鏄犲皠閫氱煡鏁版嵁
      const apiNotifications = notificationsData?.items || notificationsData || [];
      if (apiNotifications.length > 0) {
        setNotifications(
          apiNotifications.map((n) => ({
            id: n.id,
            type: String(n.type || "").includes("CHANNEL_ADMIN")
              ? "channel-admin"
              : String(n.type || "").includes("COMMENT") || String(n.type || "").includes("REPLY")
                ? "comment"
                : String(n.type || "").includes("SAVE")
                  ? "save"
                  : "like",
            rawType: n.type,
            user: n.title || "绯荤粺",
            action: n.content || "",
            target: n.targetId ? `#${n.targetId}` : "",
            targetId: n.targetId,
            time: timeAgo(n.createdAt),
            unread: !n.read,
          })),
        );
      }
    } catch {
      // 静默失败，保留 mock 数据兜底
    } finally {
      setDataReady(true);
    }
  }

  useEffect(() => {
    if (loggedIn) {
      loadAllData();
      refreshChats();
    }
  }, [loggedIn]);

  // 刷新後恢復上次頁面
  useEffect(() => {
    try { sessionStorage.setItem("whu-last-nav", activeNav); } catch {}
  }, [activeNav]);

  useEffect(() => {
    try {
      if (activeChatId) sessionStorage.setItem("whu-last-chat-id", activeChatId);
      else sessionStorage.removeItem("whu-last-chat-id");
    } catch {}
  }, [activeChatId]);

  useEffect(() => {
    if (loggedIn && activeNav === "全站管理" && currentUser.role === "ADMIN") {
      loadAdminDashboard();
    }
  }, [loggedIn, activeNav, currentUser.role]);

  useEffect(() => {
    setChannelAdminAnnouncementDraft(
      channelAdminDashboard?.channel?.announcement || "",
    );
  }, [channelAdminDashboard?.channel?.id, channelAdminDashboard?.channel?.announcement]);

  // 初始化 activeChatId
  useEffect(() => {
    if (!chats.length) {
      setActiveChatId(null);
      return;
    }
    if (!activeChatId || !chats.some((ch) => ch.id === activeChatId)) {
      setActiveChatId(chats[0].id);
    }
  }, [activeChatId, chats]);

  useEffect(() => {
    const list = chatBubbleListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [activeChatId, activeChat?.messages]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setActiveTag("全部");
      setTagsExpanded(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const keyword = searchTerm.trim();
    if (searchMode !== "users" || !keyword) {
      setUserSearchResults([]);
      setUserSearchLoading(false);
      return;
    }
    setUserSearchLoading(true);
    const timer = window.setTimeout(() => {
      searchUsers(keyword)
        .then((items) => setUserSearchResults(items || []))
        .catch(() => setUserSearchResults([]))
        .finally(() => setUserSearchLoading(false));
    }, 260);
    return () => window.clearTimeout(timer);
  }, [searchMode, searchTerm]);

  // 当切换到用户搜索模式且无关键词时，加载推荐用户
  useEffect(() => {
    if (searchMode !== "users" || searchTerm.trim()) {
      return;
    }
    setRecommendedUsersLoading(true);
    getRecommendedUsers({ page: 1, size: 20 })
      .then((data) => setRecommendedUsers(data?.items || []))
      .catch(() => setRecommendedUsers([]))
      .finally(() => setRecommendedUsersLoading(false));
  }, [searchMode]);

  // 通知轮询
  useEffect(() => {
    if (!loggedIn) return;
    const interval = setInterval(() => {
      apiGetNotifications()
        .then((data) => {
          const items = data?.items || data || [];
          if (items.length) {
            setNotifications(items.map((n) => ({
              id: n.id,
              type: String(n.type || "").includes("CHANNEL_ADMIN") ? "channel-admin" : String(n.type || "").includes("COMMENT") || String(n.type || "").includes("REPLY") ? "comment" : String(n.type || "").includes("SAVE") ? "save" : "like",
              rawType: n.type,
              user: n.title || "系统",
              action: n.content || "",
              target: n.targetId ? "#" + n.targetId : "",
              targetId: n.targetId,
              time: timeAgo(n.createdAt),
              unread: !n.read,
            })));
          }
        })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [loggedIn]);

  function refreshNotifications() {
    apiGetNotifications()
      .then((data) => {
        const items = data?.items || data || [];
        setNotifications(items.map((n) => ({
          id: n.id,
          type: String(n.type || "").includes("CHANNEL_ADMIN") ? "channel-admin" : String(n.type || "").includes("COMMENT") || String(n.type || "").includes("REPLY") ? "comment" : String(n.type || "").includes("SAVE") ? "save" : "like",
          rawType: n.type,
          user: n.title || "系统",
          action: n.content || "",
          target: n.targetId ? "#" + n.targetId : "",
          targetId: n.targetId,
          time: timeAgo(n.createdAt),
          unread: !n.read,
        })));
      })
      .catch(() => {});
  }

  // 认证处理函数
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
        setAuthNotice("密码已重置");
        setTimeout(() => {
          setAuthMode("登录");
          setAuthPassword("");
          setAuthPasswordConfirm("");
          setAuthCode("");
          setCodeSent(false);
          setAuthNotice("");
        }, 2000);
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

  // 笔记操作
  function openNoteDetail(note) {
    setDetailNote(note);
    setDetailImageIndex(0);
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
        setDetailNote((note) =>
          note && note.id === id ? { ...note, liked: res.active, likes: res.count } : note,
        );
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
        setDetailNote((note) =>
          note && note.id === id ? { ...note, saved: res.active, saves: res.count } : note,
        );
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
    setDraftTags([]);
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

  function addChannelPostImages(files) {
    const selected = Array.from(files || []);
    if (!selected.length) return;
    const slots = Math.max(9 - channelPostDraftImages.length, 0);
    const valid = selected
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, slots)
      .map((file) => ({
        id: `${Date.now()}-${file.name}-${Math.random()}`,
        file,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
      }));
    setChannelPostDraftImages((items) => [...items, ...valid]);
  }

  function removeChannelPostImage(imageId) {
    setChannelPostDraftImages((items) => {
      const target = items.find((image) => image.id === imageId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return items.filter((image) => image.id !== imageId);
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
        tags: draftTags.length > 0 ? draftTags : ["校园生活"],
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

  // 频道操作
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
          isInitialAdmin: true,
          isChannelAdmin: true,
          isAdmin: true,
          announcement: apiChannel.announcement || "",
          members: apiChannel.memberCount || 1,
          posts: [],
          events: [],
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
    const run = async () => {
      const uploaded = await Promise.all(
        channelPostDraftImages.map((img) => uploadImage(img.file)),
      );
      const imageUrls = uploaded.map((img) => img.url);
      apiCreatePost(Number(selectedChannel.id), {
        title: title || "新发布的讨论帖",
        content: body || "分享一个话题。",
        pinned: selectedChannel.isChannelAdmin && channelPostDraftPinned,
        imageUrls,
      })
      .then((apiPost) => {
        postImageCache[apiPost.id] = imageUrls;
        localStorage.setItem("whu-channel-images", JSON.stringify(postImageCache));
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
          imageUrls,
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
       setChannelPostDraftImages([]);
      })
      .catch(() => {});
    };
    run();
  }

  function toIsoDateTime(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  function toDateTimeLocal(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }

  function resetEventDraft() {
    setEventDraftTitle("");
    setEventDraftDescription("");
    setEventDraftLocation("");
    setEventDraftStart("");
    setEventDraftEnd("");
    setEventDraftDeadline("");
    setEventDraftCapacity("");
    setEventDraftCreatePost(true);
    setEventDraftCreateChat(true);
    setEventDraftPinPost(false);
    setEventDraftError("");
    setEditingEventId(null);
  }

  function submitCreateChannelEvent() {
    if (!selectedChannel) return;
    const title = eventDraftTitle.trim();
    const description = eventDraftDescription.trim();
    const location = eventDraftLocation.trim();
    const startTime = toIsoDateTime(eventDraftStart);
    const endTime = toIsoDateTime(eventDraftEnd);
    const signupDeadline = toIsoDateTime(eventDraftDeadline);
    if (!title || !description || !location || !startTime || !endTime) {
      setEventDraftError("请填写标题、说明、地点和活动时间。");
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      setEventDraftError("结束时间需要晚于开始时间。");
      return;
    }
    const capacity = eventDraftCapacity ? Number(eventDraftCapacity) : null;
    const payload = {
      title,
      description,
      location,
      startTime,
      endTime,
      signupDeadline,
      capacity: capacity && capacity > 0 ? capacity : null,
      createPost: eventDraftCreatePost,
      createChat: eventDraftCreateChat,
      pinPost: selectedChannel.isChannelAdmin && eventDraftPinPost,
      syncLinkedPost: true,
    };
    const request = editingEventId
      ? apiUpdateChannelEvent(Number(editingEventId), payload)
      : apiCreateChannelEvent(Number(selectedChannel.id), payload);
    request
      .then((apiEvent) => {
        const event = mapChannelEvent(apiEvent);
        setChannels((items) =>
          items.map((channel) =>
            channel.id === selectedChannel.id
              ? {
                  ...channel,
                  events: editingEventId
                    ? (channel.events || []).map((item) => String(item.id) === String(event.id) ? event : item)
                    : [event, ...(channel.events || [])],
                }
              : channel,
          ),
        );
        setEventDraftOpen(false);
        resetEventDraft();
        if (apiEvent.linkedPostId) {
          getPosts(Number(selectedChannel.id), { page: 1, size: 20 })
            .then((postsData) => {
              setChannels((items) =>
                items.map((channel) =>
                  channel.id === selectedChannel.id
                    ? { ...channel, posts: (postsData?.items || []).map(mapChannelPost) }
                    : channel,
                ),
              );
            })
            .catch(() => {});
        }
      })
      .catch((error) => setEventDraftError(error.message || (editingEventId ? "活动更新失败" : "活动发布失败")));
  }

  function openEventDetail(event) {
    if (!event?.id) return;
    setEventDetail({ event, participants: [], loading: true });
    setEventDetailError("");
    apiGetChannelEvent(Number(event.id))
      .then((detail) => setEventDetail({
        event: mapChannelEvent(detail.event),
        participants: detail.participants || [],
        loading: false,
      }))
      .catch((error) => {
        setEventDetailError(error.message || "无法加载活动详情");
        setEventDetail((current) => current ? { ...current, loading: false } : null);
      });
  }

  function openEditEvent(event) {
    setEditingEventId(event.id);
    setEventDraftTitle(event.title || "");
    setEventDraftDescription(event.description || "");
    setEventDraftLocation(event.location || "");
    setEventDraftStart(toDateTimeLocal(event.startTime));
    setEventDraftEnd(toDateTimeLocal(event.endTime));
    setEventDraftDeadline(toDateTimeLocal(event.signupDeadline));
    setEventDraftCapacity(event.capacity ? String(event.capacity) : "");
    setEventDraftCreatePost(Boolean(event.linkedPostId));
    setEventDraftCreateChat(Boolean(event.conversationId));
    setEventDraftPinPost(false);
    setEventDraftError("");
    setEventDraftOpen(true);
  }

  function updateChannelEventInState(eventId, patch) {
    setChannels((items) =>
      items.map((channel) => ({
        ...channel,
        events: (channel.events || []).map((event) =>
          String(event.id) === String(eventId) ? { ...event, ...patch } : event,
        ),
      })),
    );
    setCalendarEvents((items) =>
      items.map((event) => (String(event.id) === String(eventId) ? { ...event, ...patch } : event)),
    );
  }

  function toggleJoinChannelEvent(event) {
    if (!event?.id) return;
    const action = event.joined ? apiLeaveChannelEvent : apiJoinChannelEvent;
    setEventActionError("");
    return action(Number(event.id))
      .then((result) => {
        updateChannelEventInState(event.id, {
          joined: result.joined,
          participantCount: result.participantCount,
          full: result.full,
        });
        if (!result.joined) {
          setCalendarEvents((items) => items.filter((item) => String(item.id) !== String(event.id)));
        }
        return result;
      })
      .catch((error) => setEventActionError(error.message || "活动状态更新失败"));
  }

  function cancelChannelEvent(event) {
    if (!event?.id) return;
    if (!window.confirm(`确定取消活动“${event.title}”吗？参与成员将收到通知。`)) return;
    setEventActionError("");
    apiCancelChannelEvent(Number(event.id))
      .then(() => {
        updateChannelEventInState(event.id, { status: "CANCELLED" });
        setEventDetail((detail) => detail && String(detail.event.id) === String(event.id)
          ? { ...detail, event: { ...detail.event, status: "CANCELLED" } }
          : detail);
      })
      .catch((error) => setEventActionError(error.message || "活动取消失败"));
  }

  function loadCalendarEvents(cursor = calendarCursor) {
    const from = new Date(cursor.getFullYear(), cursor.getMonth(), 1).toISOString();
    const to = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1).toISOString();
    apiGetCalendarEvents({ from, to })
      .then((items) => setCalendarEvents((items || []).map(mapChannelEvent)))
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
                    apiChannel.channelAdministrator ??
                    (apiChannel.administrator?.id || channel.administratorId) ===
                    currentUser.id,
                  isChannelAdmin:
                    apiChannel.channelAdministrator ??
                    apiChannel.initialAdministrator ??
                    (apiChannel.administrator?.id || channel.administratorId) ===
                      currentUser.id,
                  isInitialAdmin:
                    apiChannel.initialAdministrator ??
                    (apiChannel.administrator?.id || channel.administratorId) ===
                      currentUser.id,
                }
              : channel,
          ),
        );
      })
      .catch(() => {});
  }

  function openChannelDetail(channelId) {
    setSelectedChannelId(channelId);
    setDetailChannel(String(channelId));
    setActiveNav("频道详情");
  }

  function closeChannelDetail() {
    setDetailChannel(null);
    setActiveNav("频道");
  }

  function openChannelAdmin(channelId) {
    setChannelAdminOpen(true);
    setChannelAdminLoading(true);
    getInitialAdminDashboard(Number(channelId))
      .then((dashboard) => {
        setChannelAdminDashboard(dashboard);
      })
      .catch(() => {
        setChannelAdminOpen(false);
        setChannelAdminDashboard(null);
      })
      .finally(() => setChannelAdminLoading(false));
  }

  function removeChannel() {
    const channelId = channelDeletePending;
    if (!channelId) return;
    setChannels((items) => items.filter((ch) => ch.id !== channelId));
    setChannelAdminOpen(false);
    setChannelDeletePending(null);
    setActiveNav("频道");
    apiDeleteChannel(Number(channelId)).catch(() => {});
  }

  function reloadNotifications() {
    apiGetNotifications()
      .then((data) => {
        const apiNotifications = data?.items || data || [];
        setNotifications(
          apiNotifications.map((n) => ({
            id: n.id,
            type: String(n.type || "").includes("CHANNEL_ADMIN")
              ? "channel-admin"
              : String(n.type || "").includes("COMMENT") || String(n.type || "").includes("REPLY")
                ? "comment"
                : String(n.type || "").includes("SAVE")
                  ? "save"
                  : "like",
            rawType: n.type,
            user: n.title || "绯荤粺",
            action: n.content || "",
            target: n.targetId ? `#${n.targetId}` : "",
            targetId: n.targetId,
            time: timeAgo(n.createdAt),
            unread: !n.read,
          })),
        );
      })
      .catch(() => {});
  }

  function submitChannelAdminApplication(channelId) {
    applyForChannelAdmin(Number(channelId))
      .then(() => reloadNotifications())
      .catch(() => {});
  }

  function saveChannelAdminAnnouncement() {
    const channelId = channelAdminDashboard?.channel?.id;
    const text = channelAdminAnnouncementDraft.trim();
    if (!channelId || !text) return;
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
                  isInitialAdmin:
                    apiChannel.initialAdministrator ??
                    (apiChannel.administrator?.id || channel.administratorId) ===
                      currentUser.id,
                  isChannelAdmin:
                    apiChannel.channelAdministrator ??
                    apiChannel.initialAdministrator ??
                    (apiChannel.administrator?.id || channel.administratorId) ===
                      currentUser.id,
                  isAdmin:
                    apiChannel.channelAdministrator ??
                    apiChannel.initialAdministrator ??
                    (apiChannel.administrator?.id || channel.administratorId) ===
                      currentUser.id,
                }
              : channel,
          ),
        );
        setChannelAdminDashboard((dashboard) =>
          dashboard
            ? {
                ...dashboard,
                channel: {
                  ...dashboard.channel,
                  announcement: apiChannel.announcement || text,
                },
              }
            : dashboard,
        );
      })
      .catch(() => {});
  }

  function toggleChannelAdminPostPinned(post) {
    if (!post?.id) return;
    const pinned = !post.pinned;
    apiSetPostPinned(Number(post.id), pinned)
      .then((apiPost) => {
        const mappedPost = mapChannelPost(apiPost);
        updateChannelPostInState(post.id, {
          pinned: mappedPost.pinned,
          likes: mappedPost.likes,
          replies: mappedPost.replies,
        });
        setChannelAdminDashboard((dashboard) => {
          if (!dashboard) return dashboard;
          const wasPinned = Boolean(post.pinned);
          const isPinned = Boolean(mappedPost.pinned);
          return {
            ...dashboard,
            pinnedPostCount:
              dashboard.pinnedPostCount + (isPinned ? 1 : 0) - (wasPinned ? 1 : 0),
            recentPosts: dashboard.recentPosts.map((item) =>
              String(item.id) === String(post.id)
                ? { ...item, ...apiPost }
                : item,
            ),
          };
        });
      })
      .catch(() => {});
  }

  function submitChannelAdminInvite(userId) {
    const channelId = channelAdminDashboard?.channel?.id;
    if (!channelId || !userId) return;
    inviteChannelAdmin(Number(channelId), Number(userId))
      .then((request) => {
        setChannelAdminDashboard((dashboard) =>
          dashboard
            ? {
                ...dashboard,
                adminRequests: [request, ...dashboard.adminRequests],
              }
            : dashboard,
        );
        reloadNotifications();
      })
      .catch(() => {});
  }

  function reviewChannelAdminRequest(requestId, action) {
    handleChannelAdminRequest(Number(requestId), action)
      .then((request) => {
        setChannelAdminDashboard((dashboard) =>
          dashboard
            ? {
                ...dashboard,
                adminRequests: dashboard.adminRequests.map((item) =>
                  String(item.id) === String(request.id) ? request : item,
                ),
                members: dashboard.members.map((member) =>
                  String(member.id) === String(request.requesterId) &&
                  ["APPROVED", "ACCEPTED"].includes(request.status)
                    ? {
                        ...member,
                        roleLabel: "频道管理员",
                        channelAdministrator: true,
                      }
                    : member,
                ),
              }
            : dashboard,
        );
        reloadNotifications();
      })
      .catch(() => {});
  }

  function handleChannelAdminNotification(requestId, action) {
    if (!requestId) return;
    const actionKey = `${requestId}:${action}`;
    setNotificationActionIds((items) => new Set(items).add(actionKey));
    handleChannelAdminRequest(Number(requestId), action)
      .then(() => {
        setNotifications((items) =>
          items.map((item) =>
            String(item.targetId) === String(requestId)
              ? { ...item, unread: false }
              : item,
          ),
        );
        reloadNotifications();
        loadAllData();
      })
      .catch(() => {})
      .finally(() =>
        setNotificationActionIds((items) => {
          const next = new Set(items);
          next.delete(actionKey);
          return next;
        }),
      );
  }

  // 用户操作
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
          author: profile.nickname || user.author || user.name || user.nickname,
          name: profile.nickname || user.name || user.author || user.nickname,
          avatar: normalizeMediaUrl(profile.avatarUrl || user.avatar || user.avatarUrl) || DEFAULT_AVATAR,
          meta: formatUserMeta(profile.grade, profile.college, ""),
          email: profile.email,
          bio: profile.bio || "",
          relation: profile.relation,
        });
      })
      .catch(() => {
        const found = blockedRelations.find(
          (b) => b.id === Number(userId) || b.userId === Number(userId)
        );
        setProfileUser(found ? { ...user, id: Number(userId), authorId: Number(userId), relation: "BLOCKED" } : user);
      });
  }

  function openDetailAuthorProfile(note) {
    openUserProfile(note);
  }

  function startConversationWith(user) {
    const userId = user?.id || user?.authorId || user?.userId;
    if (!userId) return;
    setChatError("");
    apiCreateConversation({
      type: "PRIVATE",
      participantIds: [Number(userId)],
      name: user.name || user.author || user.nickname,
    })
      .then(async (conversation) => {
        const mapped = mapChats([conversation], currentUser.id)[0];
        let messages = mapped.messages;
        try {
          const messagesData = await getMessages(Number(mapped.id), {
            page: 1,
            size: 30,
          });
          messages = normalizeChatMessages((messagesData?.items || []).map(mapChatMessage));
        } catch {
          messages = mapped.messages;
        }
        setChats((items) => {
          const exists = items.some((chat) => chat.id === mapped.id);
          return exists
            ? items.map((chat) =>
                chat.id === mapped.id ? { ...chat, ...mapped, messages } : chat,
              )
            : [{ ...mapped, messages }, ...items];
        });
        setActiveChatId(mapped.id);
        setActiveNav("聊天");
        setProfileUser(null);
      })
      .catch((error) => setChatError(error.message || "无法发起私聊"));
  }

  function handleEnterProfile(user) {
    const userId = user?.id || user?.authorId || user?.userId;
    if (!userId) return;
    const fallback = {
      id: userId,
      author: user.author || user.name,
      name: user.name || user.author,
      avatar: user.avatar || DEFAULT_AVATAR,
      meta: user.meta || "",
      email: user.email,
      bio: user.bio || "",
      relation: user.relation,
      noteCount: 0,
      followingCount: 0,
      followerCount: 0,
      friendCount: 0,
    };
    setProfileUser(null);
    getUserProfile(Number(userId))
      .then((profile) => {
        setVisitedUser({
          id: profile.id,
          author: profile.nickname || user.author || user.name,
          name: profile.nickname || user.author || user.name,
          avatar: normalizeMediaUrl(profile.avatarUrl || user.avatar) || DEFAULT_AVATAR,
          meta: formatUserMeta(profile.grade, profile.college, ""),
          email: profile.email,
          bio: profile.bio || "",
          relation: profile.relation,
          noteCount: profile.noteCount ?? 0,
          followingCount: profile.followingCount ?? 0,
          followerCount: profile.followerCount ?? 0,
          friendCount: profile.friendCount ?? 0,
        });
        setActiveNav("用户主页");
      })
      .catch(() => {
        setVisitedUser(fallback);
        setActiveNav("用户主页");
      });
  }

  function leaveVisitedProfile() {
    setVisitedUser(null);
    setActiveNav("主页");
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
      searchableByUsers: nextPrivacy.searchableByUsers,
      showEmailOnProfile: nextPrivacy.showEmailOnProfile,
      personalizedRecommendations: nextPrivacy.personalizedRecommendations,
      activityNotifications: nextPrivacy.activityNotifications,
      loginAlerts: nextPrivacy.loginAlerts,
    }).catch(() => {});
  }

  function saveProfile() {
    // 解析 "2024级 新闻与传播学院" 格式
    const { grade, college } = splitProfileMeta(profileMeta);
    updateProfile({
      nickname: profileName,
      college,
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

  function uploadProfileAvatar(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setProfileAvatarError("");
    setProfileAvatarUploading(true);
    uploadImage(file)
      .then((data) => {
        setProfileAvatar(normalizeMediaUrl(data.url));
      })
      .catch((error) => setProfileAvatarError(error.message || "头像上传失败"))
      .finally(() => setProfileAvatarUploading(false));
  }

  // 聊天操作
  function openChat(chatId) {
    setActiveChatId(chatId);
    setChatError("");
    setGroupPanelOpen(false);
    setGroupDetail(null);
    setGroupManageError("");
    setChatProfileTarget(null);
    loadChatMessages(chatId);
    setChats((items) =>
      items.map((ch) => (ch.id === chatId ? { ...ch, unread: 0 } : ch)),
    );
    apiMarkChatRead(Number(chatId)).catch(() => {});
  }

  function openChatMessageProfile(target) {
    if (!target || target.mine || !target.userId) return;
    setChatProfileTarget(null);
    openUserProfile({ id: target.userId, authorId: target.userId, name: target.name, avatar: target.avatar });
  }

  function openGroupManagement(chatId = activeChatId) {
    if (!chatId) return;
    setGroupPanelOpen(true);
    setGroupManageError("");
    apiGetGroupDetail(Number(chatId))
      .then((detail) => {
        setGroupDetail(detail);
        setGroupNameDraft(detail.name || "");
      })
      .catch((error) => setGroupManageError(error.message || "无法加载群聊信息"));
  }

  function saveGroupName() {
    const name = groupNameDraft.trim();
    if (!name || !activeChatId) return;
    setGroupManageError("");
    apiRenameGroup(Number(activeChatId), name)
      .then((detail) => {
        setGroupDetail(detail);
        setChats((items) => items.map((chat) => chat.id === activeChatId ? { ...chat, name: detail.name } : chat));
      })
      .catch((error) => setGroupManageError(error.message || "群名称保存失败"));
  }

  function removeChatGroupMember(member) {
    if (!activeChatId || !window.confirm(`确定将 ${member.nickname} 移出群聊吗？`)) return;
    apiRemoveGroupMember(Number(activeChatId), Number(member.userId))
      .then((detail) => setGroupDetail(detail))
      .catch((error) => setGroupManageError(error.message || "移除成员失败"));
  }

  function transferChatGroupOwner(member) {
    if (!activeChatId || !window.confirm(`确定将群主转让给 ${member.nickname} 吗？`)) return;
    apiTransferGroupOwner(Number(activeChatId), Number(member.userId))
      .then((detail) => setGroupDetail(detail))
      .catch((error) => setGroupManageError(error.message || "转让群主失败"));
  }

  function leaveChatGroup() {
    if (!activeChatId || !window.confirm("确定退出这个群聊吗？")) return;
    apiLeaveGroup(Number(activeChatId))
      .then(() => { setGroupPanelOpen(false); setGroupDetail(null); refreshChats(); })
      .catch((error) => setGroupManageError(error.message || "退出群聊失败"));
  }

  function dissolveChatGroup() {
    if (!activeChatId || !window.confirm("确定解散群聊吗？解散后成员将无法继续进入或发送消息。")) return;
    apiDissolveGroup(Number(activeChatId))
      .then(() => { setGroupPanelOpen(false); setGroupDetail(null); refreshChats(); })
      .catch((error) => setGroupManageError(error.message || "解散群聊失败"));
  }

  function sendChatMessage() {
    const text = chatInput.trim();
    if (!text || !activeChatId) return;
    setChatError("");
    apiSendMessage(Number(activeChatId), text)
      .then((apiMessage) => {
        const message = mapChatMessage(apiMessage);
        setChats((items) =>
          items.map((ch) =>
            ch.id === activeChatId
              ? {
                  ...ch,
                  messages: [...normalizeChatMessages(ch.messages), message].filter(Boolean),
                  lastMessage: message.text,
                  lastTime: "刚刚",
                }
              : ch,
          ),
        );
        setChatInput("");
        refreshChats(activeChatId);
      })
      .catch((error) => setChatError(error.message || "消息发送失败"));
  }

  function markAllChatsAsRead() {
    setChats((items) => items.map((ch) => ({ ...ch, unread: 0 })));
  }

  function toggleGroupChatMember(userId) {
    setGroupChatError("");
    setGroupChatMemberIds((ids) =>
      ids.includes(userId) ? ids.filter((id) => id !== userId) : [...ids, userId],
    );
  }

  function closeGroupChatModal() {
    setGroupChatOpen(false);
    setGroupChatName("");
    setGroupChatMemberIds([]);
    setGroupChatError("");
  }

  function submitGroupChat() {
    if (groupChatMemberIds.length === 0) {
      setGroupChatError("请选择至少一位好友");
      return;
    }
    const selectedNames = groupChatFriends
      .filter((friend) => groupChatMemberIds.includes(friend.id))
      .map((friend) => friend.name);
    const fallbackName = selectedNames.length
      ? `${selectedNames.slice(0, 2).join("、")}${selectedNames.length > 2 ? "等" : ""}的群聊`
      : "";
    apiCreateConversation({
      type: "GROUP",
      participantIds: groupChatMemberIds.map(Number),
      name: groupChatName.trim() || fallbackName,
    })
      .then(async (conversation) => {
        const mapped = mapChats([conversation], currentUser.id)[0];
        setChats((items) => {
          const exists = items.some((chat) => chat.id === mapped.id);
          return exists
            ? items.map((chat) => (chat.id === mapped.id ? { ...chat, ...mapped } : chat))
            : [mapped, ...items];
        });
        setActiveChatId(mapped.id);
        setActiveNav("聊天");
        closeGroupChatModal();
        await refreshChats(mapped.id);
      })
      .catch((error) => setGroupChatError(error.message || "群聊创建失败"));
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
            imageUrls: (detail.post?.imageUrls || postImageCache[detail.post?.id || payload.post.id] || payload.post.imageUrls || []).map(normalizeMediaUrl),
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

  // Draft 对象，供 AppModals 使用
  const draft = {
    open: draftOpen,
    title: draftTitle,
    text: draftText,
    imageCount: draftImages.length,
    images: draftImages,
    uploading: draftUploading,
    error: draftError,
    visibility: draftVisibility,
    tags: draftTags,
    tagOptions: tagsList.filter((t) => t !== "全部"),
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
      case "tags":
        setDraftTags(value);
        break;
    }
  }

  // noteFeedProps，供各页面组件透传
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

  // 渲染主内容
  function renderMainContent() {
    if (!dataReady) {
      return (
        <section className="masonry-feed">
          {Array.from({ length: 6 }).map((_, i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </section>
      );
    }
    switch (activeNav) {
      case "主页":
        return (
          <HomePage
            notes={publicNotes}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchMode={searchMode}
            onSearchModeChange={setSearchMode}
            userResults={userSearchResults}
            userSearchLoading={userSearchLoading}
            recommendedUsers={recommendedUsers}
            recommendedUsersLoading={recommendedUsersLoading}
            onOpenProfile={openUserProfile}
            tags={tagsList}
            activeTag={activeTag}
            onSelectTag={setActiveTag}
            sort={noteSort}
            onSortChange={setNoteSort}
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
            onNavigate={goTo}
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
           onOpenManagement={openChannelAdmin}
           onApplyAdmin={submitChannelAdminApplication}
            currentUserId={currentUser.id}
            onDeletePost={removeChannelPost}
            onEnterChannel={openChannelDetail}
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
      case "日历":
        return (
          <section className="calendar-page">
            <div className="panel-head">
              <div>
                <h2>我的日历</h2>
                <span>你已加入的频道活动</span>
              </div>
              <button className="ghost-button small" onClick={() => loadCalendarEvents()}>
                <Calendar size={16} />
                刷新
              </button>
            </div>
            <section className="month-calendar">
              <div className="month-calendar-head">
                <button className="icon-mini" title="上个月" onClick={() => {
                  const next = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
                  setCalendarCursor(next); setCalendarSelectedDate(""); loadCalendarEvents(next);
                }}><CaretLeft size={19} /></button>
                <strong>{calendarCursor.getFullYear()} 年 {calendarCursor.getMonth() + 1} 月</strong>
                <button className="icon-mini" title="下个月" onClick={() => {
                  const next = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
                  setCalendarCursor(next); setCalendarSelectedDate(""); loadCalendarEvents(next);
                }}><CaretRight size={19} /></button>
              </div>
              <div className="month-weekdays">{["一", "二", "三", "四", "五", "六", "日"].map((day) => <span key={day}>{day}</span>)}</div>
              <div className="month-days">
                {getCalendarDays(calendarCursor).map((day) => {
                  const count = calendarEvents.filter((event) => calendarDateKey(event.startTime) === day.key).length;
                  const today = calendarDateKey(new Date()) === day.key;
                  return <button key={day.key} className={(day.current ? "" : "muted-day ") + (today ? "today " : "") + (calendarSelectedDate === day.key ? "selected " : "")} onClick={() => setCalendarSelectedDate(day.key)}>
                    <span>{day.date.getDate()}</span>{count > 0 && <i>{count}</i>}
                  </button>;
                })}
              </div>
            </section>
            {(calendarSelectedDate ? calendarEvents.filter((event) => calendarDateKey(event.startTime) === calendarSelectedDate) : calendarEvents).length ? (
              <div className="calendar-event-list">
                {(calendarSelectedDate ? calendarEvents.filter((event) => calendarDateKey(event.startTime) === calendarSelectedDate) : calendarEvents).map((event) => (
                  <article className="event-card calendar-event-card" key={event.id}>
                    <div className="event-card-main">
                      <div className="event-card-head">
                        <strong>{event.title}</strong>
                        <span>{event.status === "CANCELLED" ? "已取消" : event.ended ? "已结束" : "已加入"}</span>
                      </div>
                      <p>{event.description}</p>
                      <div className="event-meta-grid">
                        <span><Calendar size={15} />{event.timeLabel}</span>
                        <span><Hash size={15} />{event.channelName}</span>
                        <span><Megaphone size={15} />{event.location}</span>
                      </div>
                    </div>
                    {!event.ended && event.status !== "CANCELLED" && (
                      <button className="ghost-button small" onClick={() => toggleJoinChannelEvent(event)}>
                        取消加入
                      </button>
                    )}
                    <button className="ghost-button small" onClick={() => openEventDetail(event)}>详情</button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Calendar size={40} />
                <p>{calendarSelectedDate ? "这一天没有活动" : "还没有加入的活动"}</p>
                <span>{calendarSelectedDate ? "选择其他日期，或翻到其他月份查看安排。" : "加入频道活动后，它们会出现在这里。"}</span>
              </div>
            )}
          </section>
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
                .map((n) => `发布了笔记《${n.title}》`),
              ...savedNotes.slice(0, 2).map((n) => `收藏了《${n.title}》`),
              ...channels
                .filter((ch) => ch.joined)
                .slice(0, 2)
                .map((ch) => `加入了频道《${ch.name}》`),
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
            blockedUsers={blockedRelations}
            onRelationAction={changeRelation}
            themes={themeOptions}
            activeTheme={activeTheme}
            onThemeChange={setActiveTheme}
          />
        );
      case "通知":
        return (
          <section className="section-card notification-page">
            <div className="section-head notification-page-head">
              <div>
                <p>通知中心</p>
                <h2>消息与提醒</h2>
                <span>点赞、评论、收藏、频道管理相关通知</span>
              </div>
              <div className="notification-page-tools">
                <button className="ghost-button small" disabled={!notifications.some(n => n.unread)} onClick={() => apiMarkAllNotificationsRead().catch(() => {}).finally(() => setNotifications(items => items.map(item => ({ ...item, unread: false }))))}>全部已读</button>
                <button className="ghost-button small" onClick={refreshNotifications}>刷新</button>
              </div>
            </div>
            <div className="notification-list notification-page-list">
                {notifications.length === 0 ? <div className="empty-state compact">暂无通知</div> : notifications.map(item => <article className={"notification-item" + (item.unread ? " unread" : "")} key={item.id} onClick={() => item.unread && markNotificationRead(item.id)}>
                  <div className="notification-icon">{item.type === "like" && <Heart size={18} weight="fill" />}{item.type === "comment" && <ChatCircle size={18} weight="fill" />}{item.type === "save" && <BookmarkSimple size={18} weight="fill" />}{item.type === "channel-admin" && <ShieldCheck size={18} weight="fill" />}</div>
                  <div><p><strong>{item.user}</strong>{item.action}</p><span>{item.target} &middot; {item.time}</span>{item.rawType === "CHANNEL_ADMIN_INVITE" && <div className="notification-actions"><button onClick={(e) => { e.stopPropagation(); handleChannelAdminNotification?.(item.targetId, "ACCEPT"); }} disabled={notificationActionIds.has(`${item.targetId}:ACCEPT`) || notificationActionIds.has(`${item.targetId}:DECLINE`)}><Check size={13} />{notificationActionIds.has(`${item.targetId}:ACCEPT`) ? "处理中" : "接受"}</button><button onClick={(e) => { e.stopPropagation(); handleChannelAdminNotification?.(item.targetId, "DECLINE"); }} disabled={notificationActionIds.has(`${item.targetId}:ACCEPT`) || notificationActionIds.has(`${item.targetId}:DECLINE`)}><X size={13} />{notificationActionIds.has(`${item.targetId}:DECLINE`) ? "处理中" : "拒绝"}</button></div>}</div>
                </article>)}
            </div>
          </section>
        );
      case "频道详情": {
        const dc = channels.find((ch) => String(ch.id) === String(detailChannel));
        if (!dc) { setActiveNav("频道"); return null; }
        return (
          <ChannelDetailPage
            channel={dc}
            currentUserId={currentUser.id}
            onBack={closeChannelDetail}
            onJoin={() => setJoinChannel(dc)}
            onOpenPost={(post) => openChannelPostDetail(post)}
            onReport={setReportTarget}
            onUpdateAnnouncement={saveChannelAnnouncement}
            onOpenManagement={() => openChannelAdmin(dc.id)}
            onApplyAdmin={() => submitChannelAdminApplication(dc.id)}
            onDeletePost={removeChannelPost}
            onOpenDraft={() => setChannelPostDraftOpen(true)}
            onOpenEventDraft={() => { resetEventDraft(); setEventDraftOpen(true); }}
            onOpenEventDetail={openEventDetail}
            onOpenEventChat={(event) => { setActiveNav("聊天"); refreshChats(String(event.conversationId)); }}
            onEditEvent={openEditEvent}
            onToggleEventJoin={toggleJoinChannelEvent}
            onCancelEvent={cancelChannelEvent}
            eventActionError={eventActionError}
            onToggleLike={(postId) => {
              apiLikePost(Number(postId))
                .then((result) => updateChannelPostInState(postId, { liked: result.active, likes: result.count }))
                .catch(() => {});
            }}
          />
        );
      }
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
      case "用户主页":
        if (!visitedUser) { setActiveNav("主页"); return null; }
        return (
          <VisitedProfilePage
            user={visitedUser}
            notes={notes.filter((n) => n.author === visitedUser.author || n.author === visitedUser.name)}
            onBack={leaveVisitedProfile}
            onRelationAction={changeRelation}
            onStartConversation={startConversationWith}
            onBlockUser={blockUser}
            noteFeedProps={noteFeedProps}
          />
        );
      default:
        return null;
    }
  }

  const page = pageCopy[activeNav] ?? pageCopy["主页"];

  // 未登录：渲染认证页面
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

  // 主界面
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
          onNavigate={goTo}
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
          onChannelAdminAction={handleChannelAdminNotification}
        />

        {/* 聊天页面需要 chatInput + sendChatMessage，所以单独处理 */}
        <div className="page-fade" key={activeNav}>
        {activeNav === "聊天" && !chatListReady ? (
          <section className="chat-page chat-page-loading" aria-busy="true">
            <div className="chat-loading-panel">
              <ChatsCircle size={30} />
              <span>正在恢复会话…</span>
            </div>
          </section>
        ) : activeNav === "聊天" ? (
          <section className="chat-page">
            <section className="chat-friend-strip">
              <div className="chat-friend-scroller">
                {groupChatFriends.length ? (
                  groupChatFriends.map((friend) => (
                    <button
                      className="chat-friend-chip"
                      key={friend.id}
                      onClick={() => openUserProfile(friend)}
                    >
                      <img
                        className="avatar"
                        src={friend.avatar || DEFAULT_AVATAR}
                        alt={`${friend.name}头像`}
                      />
                      <span>{friend.name}</span>
                    </button>
                  ))
                ) : (
                  <span className="muted">暂无好友。</span>
                )}
              </div>
            </section>

            <section className={"chat-layout" + (groupPanelOpen && activeChat?.type === "群聊" ? " group-panel-open" : "")}>
              <aside className="chat-side">
                <div className="chat-list-head">
                  <div>
                    <h2>消息</h2>
                  </div>
                  <div className="chat-list-actions">
                    <button
                      className="ghost-button small"
                      onClick={() => setGroupChatOpen(true)}
                    >
                      <UserPlus size={16} />
                      群聊
                    </button>
                    <button
                      className="ghost-button small"
                      onClick={markAllChatsAsRead}
                    >
                      全部已读
                    </button>
                  </div>
                </div>
                <div className="chat-list scrollable-list">
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
                        <span>{normalizeChatMessages(chat.messages).at(-1)?.text || chat.lastMessage || "暂无消息"}</span>
                      </div>
                      <time>{chat.lastTime}</time>
                      {chat.unread > 0 && <em>{chat.unread}</em>}
                    </button>
                  ))}
                </div>
              </aside>

              <ChatWindowBoundary key={activeChatId || "empty"} onRetry={() => loadChatMessages(activeChatId)}>
              <section className="chat-window" onClick={() => setChatProfileTarget(null)}>
                {activeChat ? (
                  <>
                    <div className="chat-window-head">
                      <div>
                        <p>{activeChat.type}</p>
                        <h2>{activeChat.name}</h2>
                      </div>
                      {activeChat.type === "群聊" && (
                        <button
                          className={groupPanelOpen ? "icon-mini active" : "icon-mini"}
                          title="群聊管理"
                          onClick={() => groupPanelOpen ? setGroupPanelOpen(false) : openGroupManagement()}
                        >
                          <UsersThree size={21} />
                        </button>
                      )}
                    </div>
                    <div className="bubble-list" ref={chatBubbleListRef}>
                      {chatMessageLoading && <p className="chat-message-loading">正在加载消息…</p>}
                      {normalizeChatMessages(activeChat.messages).map((msg, i) => {
                        const isMine = Boolean(msg?.mine);
                        return (
                        <div
                          className={
                            isMine ? "message-line mine" : "message-line"
                          }
                          key={`${msg?.id || msg?.text || "message"}-${i}`}
                        >
                          <button
                            className="message-avatar-button"
                            title="查看基本信息"
                            onClick={(event) => {
                              event.stopPropagation();
                              setChatProfileTarget((target) => target?.messageId === msg?.id ? null : {
                                messageId: msg?.id,
                                name: isMine ? currentUser.name : msg?.from,
                                avatar: isMine ? currentUser.avatar : msg?.avatar,
                                college: isMine ? currentUser.meta : msg?.college,
                                userId: isMine ? currentUser.id : msg?.userId,
                                mine: isMine,
                              });
                            }}
                            onDoubleClick={(event) => {
                              event.stopPropagation();
                              openChatMessageProfile({ userId: msg?.userId, name: msg?.from, avatar: msg?.avatar, mine: isMine });
                            }}
                          >
                            <img className="message-avatar" src={isMine ? (currentUser.avatar || DEFAULT_AVATAR) : (normalizeMediaUrl(msg?.avatar) || DEFAULT_AVATAR)} alt="" />
                          </button>
                          <div className="message-content">
                            <p className={isMine ? "bubble mine" : "bubble other"}>{msg?.text || ""}</p>
                            <div className="message-meta">
                              <span>{msg?.time || ""}</span>
                              {isMine && <span>{msg?.read ? "已读" : "未读"}</span>}
                              <button
                                className="icon-mini"
                                title="举报消息"
                                onClick={() => setReportTarget({ type: "聊天消息", title: msg?.text || "", targetId: msg?.id })}
                              ><Flag size={15} /></button>
                            </div>
                          </div>
                          {chatProfileTarget && chatProfileTarget.messageId === msg?.id && (
                            <aside className="message-profile-card" onClick={(event) => event.stopPropagation()}>
                              <button
                                className="message-profile-avatar"
                                disabled={chatProfileTarget.mine}
                                title={chatProfileTarget.mine ? "我的资料" : "进入对方主页"}
                                onClick={() => openChatMessageProfile(chatProfileTarget)}
                              ><img src={normalizeMediaUrl(chatProfileTarget.avatar) || DEFAULT_AVATAR} alt="" /></button>
                              <div>
                                <strong>{chatProfileTarget.name}</strong>
                                <span>{chatProfileTarget.mine ? "我" : (chatProfileTarget.college || "WHU Circle 用户")}</span>
                              </div>
                            </aside>
                          )}
                        </div>
                        );
                      })}
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
                        disabled={chatMessageLoading}
                      />
                      <button title="发送" onClick={sendChatMessage}>
                        <PaperPlaneTilt size={18} weight="fill" />
                      </button>
                    </div>
                    {chatError && <p className="form-error">{chatError}</p>}
                    {chatLoadError && <p className="form-error">{chatLoadError}</p>}
                  </>
                ) : (
                  <div className="empty-state">
                    <ChatsCircle size={34} />
                    <p>{chatLoadError || "还没有可用会话"}</p>
                    <button className="ghost-button small" onClick={() => refreshChats()}>重新加载</button>
                  </div>
                )}
              </section>
              </ChatWindowBoundary>
              {groupPanelOpen && activeChat?.type === "群聊" && (
                <aside className="group-manage-panel">
                  <div className="group-manage-head">
                    <div><p>群聊管理</p><h3>{groupDetail?.name || activeChat.name}</h3></div>
                    <button className="icon-mini" title="收起管理栏" onClick={() => setGroupPanelOpen(false)}><X size={18} /></button>
                  </div>
                  {groupDetail?.mineOwner ? (
                    <div className="group-name-editor">
                      <input value={groupNameDraft} maxLength={50} onChange={(e) => setGroupNameDraft(e.target.value)} />
                      <button className="ghost-button small" onClick={saveGroupName}>保存</button>
                    </div>
                  ) : <p className="group-member-count">{groupDetail?.memberCount || 0} 位成员</p>}
                  <section className="group-members-section">
                    <div className="group-section-head"><strong>群成员</strong><span>{groupDetail?.memberCount || 0}</span></div>
                    <div className="group-member-list">
                      {(groupDetail?.members || []).map((member) => (
                        <div className="group-member-row" key={member.userId}>
                          <img className="avatar tiny" src={normalizeMediaUrl(member.avatarUrl) || DEFAULT_AVATAR} alt="" />
                          <div><strong>{member.nickname}{member.mine ? "（我）" : ""}</strong><span>{member.owner ? "群主" : "成员"}</span></div>
                          {member.owner && <Crown size={15} className="group-owner-icon" />}
                          {groupDetail?.mineOwner && !member.owner && (
                            <div className="group-member-actions">
                              <button title="转让群主" onClick={() => transferChatGroupOwner(member)}><Crown size={14} /></button>
                              <button title="移出群聊" onClick={() => removeChatGroupMember(member)}><UserMinus size={14} /></button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                  {groupManageError && <p className="form-error">{groupManageError}</p>}
                  <div className="group-manage-actions">
                    {groupDetail?.mineOwner ? (
                      <button className="ghost-button small danger" onClick={dissolveChatGroup}><Trash size={15} />解散群聊</button>
                    ) : (
                      <button className="ghost-button small danger" onClick={leaveChatGroup}><SignOut size={15} />退出群聊</button>
                    )}
                  </div>
                </aside>
              )}
            </section>
          </section>
        ) : (
          renderMainContent()
        )}

        {groupChatOpen && (
          <div className="modal-backdrop" onClick={closeGroupChatModal}>
            <section
              className="small-modal group-chat-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <ModalHead
                title="新建群聊"
                subtitle="只可邀请互相关注的好友"
                onClose={closeGroupChatModal}
              />
              <label className="auth-field">
                <span>群聊名称</span>
                <input
                  className="title-input"
                  value={groupChatName}
                  onChange={(event) => setGroupChatName(event.target.value)}
                  placeholder="不填则自动生成"
                />
              </label>
              <div className="group-picker-head">
                <strong>选择好友</strong>
                <span>已选 {groupChatMemberIds.length} 人</span>
              </div>
              <div className="group-friend-list">
                {groupChatFriends.length ? (
                  groupChatFriends.map((friend) => {
                    const selected = groupChatMemberIds.includes(friend.id);
                    return (
                      <button
                        className={selected ? "group-friend-row active" : "group-friend-row"}
                        key={friend.id}
                        onClick={() => toggleGroupChatMember(friend.id)}
                      >
                        <img
                          className="avatar"
                          src={friend.avatar || DEFAULT_AVATAR}
                          alt={`${friend.name}头像`}
                        />
                        <div>
                          <strong>{friend.name}</strong>
                          <span>{friend.detail || "互相关注，可加入群聊"}</span>
                        </div>
                        <span className="group-check">
                          {selected && <CheckCircle size={20} weight="fill" />}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="empty-state">暂无可邀请的好友。</div>
                )}
              </div>
              {groupChatError && <p className="form-error">{groupChatError}</p>}
              <button className="submit-note" onClick={submitGroupChat}>
                <UsersThree size={18} />
                创建群聊
              </button>
            </section>
          </div>
        )}
        </div>
      </main>

      {/* 弹窗：使用 AppModals */}
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
        onEnterProfile={handleEnterProfile}
        profileBackdropClassName={detailNote ? "modal-backdrop modal-backdrop-elevated" : "modal-backdrop"}
        reportBackdropClassName={detailNote ? "modal-backdrop modal-backdrop-elevated" : "modal-backdrop"}
      />

      {/* 笔记详情弹窗 */}
      {detailNote && (
        <div className="modal-backdrop" onClick={() => setDetailNote(null)}>
          <section
            className="detail-modal note-detail-rich"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="detail-close" title="关闭" onClick={() => setDetailNote(null)}>
              <X size={20} />
            </button>
            <div className="detail-media-pane">
              <button className="detail-author-strip" onClick={() => openDetailAuthorProfile(detailNote)}>
                <img className="avatar" src={detailNote.avatar || DEFAULT_AVATAR} alt={`${detailNote.author}头像`} />
                <div>
                  <strong>{detailNote.author}</strong>
                  <span>{detailNote.meta}</span>
                </div>
              </button>
              {detailNote.images[0] ? (
                <div className="detail-image-stage">
                  <img
                    className="detail-image"
                    src={detailNote.images[detailImageIndex % detailNote.images.length]}
                    alt="note image"
                  />
                  {detailNote.images.length > 1 && (
                    <>
                      <button
                        className="detail-image-nav detail-image-nav-left"
                        title="Previous image"
                        onClick={() =>
                          setDetailImageIndex((index) =>
                            (index - 1 + detailNote.images.length) % detailNote.images.length,
                          )
                        }
                      >
                        <CaretLeft size={22} />
                      </button>
                      <button
                        className="detail-image-nav detail-image-nav-right"
                        title="Next image"
                        onClick={() =>
                          setDetailImageIndex((index) => (index + 1) % detailNote.images.length)
                        }
                      >
                        <CaretRight size={22} />
                      </button>
                      <span className="detail-image-count">
                        {(detailImageIndex % detailNote.images.length) + 1} / {detailNote.images.length}
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div className="detail-image-placeholder">
                  <Image size={40} />
                  <span>这条笔记没有配图</span>
                </div>
              )}
            </div>
            <div className="detail-content-pane">
              <div className="detail-text-block">
                <h2>{detailNote.title}</h2>
                <p className="detail-body">{detailNote.body}</p>
                {detailNote.tags?.length > 0 && (
                  <div className="tag-row">
                    {detailNote.tags.map((tag) => (
                      <button key={tag} onClick={() => setActiveTag(tag)}>#{tag}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="detail-action-row">
                <button className={detailNote.liked ? "active" : ""} onClick={() => toggleLike(detailNote.id)}>
                  <Heart size={20} weight={detailNote.liked ? "fill" : "regular"} />
                  {detailNote.likes}
                </button>
                <button onClick={() => toggleSave(detailNote.id)}>
                  <BookmarkSimple size={20} weight={detailNote.saved ? "fill" : "regular"} />
                  {detailNote.saves}
                </button>
                {detailNote.authorId === currentUser.id && (
                  <button onClick={() => removeNote(detailNote.id)}>
                    <Trash size={18} />
                    删除
                  </button>
                )}
                <button
                  onClick={() =>
                    setReportTarget({ type: "笔记", title: detailNote.title, targetId: detailNote.id })
                  }
                >
                  <Flag size={18} />
                  举报
                </button>
              </div>
              <div className="comment-panel">
                <div className="comment-panel-head">
                  <h3>评论</h3>
                  <span>{detailNote.comments.length} 条</span>
                </div>
                <div className="comment-list">
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
                </div>
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
            </div>
          </section>
        </div>
      )}

      {/* 编辑资料弹窗 */}
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
                placeholder="例如：2024级 计算机学院"
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
            <div className="avatar-upload-panel">
              <img
                className="avatar large"
                src={profileAvatar || DEFAULT_AVATAR}
                alt="当前头像"
              />
              <div>
                <strong>头像</strong>
                <span>从本地选择图片上传</span>
                <label className="avatar-upload-button">
                  <Image size={17} />
                  {profileAvatarUploading ? "上传中..." : "选择图片"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    disabled={profileAvatarUploading}
                    onChange={uploadProfileAvatar}
                  />
                </label>
              </div>
            </div>
            {profileAvatarError && <p className="form-error">{profileAvatarError}</p>}
            <button className="submit-note" onClick={saveProfile} disabled={profileAvatarUploading}>
              保存
            </button>
          </section>
        </div>
      )}

      {/* 频道初始管理员面板 */}
      {channelAdminOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setChannelAdminOpen(false)}
        >
          <section
            className="detail-modal channel-admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHead
              title="频道管理"
              subtitle={
                channelAdminDashboard?.channel?.name ||
                selectedChannel?.name ||
                "初始管理员"
              }
              onClose={() => setChannelAdminOpen(false)}
            />
            {channelAdminLoading ? (
              <div className="empty-state">正在加载频道管理信息...</div>
            ) : channelAdminDashboard ? (
              <>
                <div className="channel-admin-identity">
                  <div>
                    <span>{channelAdminDashboard.roleLabel}</span>
                    <strong>{channelAdminDashboard.channel.name}</strong>
                    <em>
                      {channelAdminDashboard.channel.memberCount} 人 初始管理员：
                      {channelAdminDashboard.channel.administrator?.nickname}
                    </em>
                  </div>
                  <ShieldCheck size={28} weight="fill" />
                </div>
                <div className="admin-metrics compact-metrics">
                  <article>
                    <span>成员</span>
                    <strong>{channelAdminDashboard.channel.memberCount}</strong>
                  </article>
                  <article>
                    <span>帖子</span>
                    <strong>{channelAdminDashboard.postCount}</strong>
                  </article>
                  <article>
                    <span>置顶</span>
                    <strong>{channelAdminDashboard.pinnedPostCount}</strong>
                  </article>
                  <article>
                    <span>回复</span>
                    <strong>{channelAdminDashboard.replyCount}</strong>
                  </article>
                </div>
                <div className="channel-admin-section">
                  <div className="panel-head">
                    <h2>公告</h2>
                    <span>频道管理员可修改</span>
                  </div>
                  <textarea
                    className="title-input"
                    value={channelAdminAnnouncementDraft}
                    maxLength={500}
                    onChange={(event) =>
                      setChannelAdminAnnouncementDraft(event.target.value)
                    }
                  />
                  <button
                    className="submit-note"
                    onClick={saveChannelAdminAnnouncement}
                  >
                    <Megaphone size={18} />
                    保存公告
                  </button>
                </div>
                <div className="channel-admin-section">
                  <div className="panel-head">
                    <h2>成员</h2>
                    <span>
                      {channelAdminDashboard.canInviteAdmins
                        ? "可邀请成员成为管理员"
                        : "普通管理员仅可查看"}
                    </span>
                  </div>
                  <div className="admin-list">
                    {channelAdminDashboard.members.map((member) => (
                      <div className="admin-row" key={member.id}>
                        <div>
                          <strong>{member.nickname}</strong>
                          <span>{member.roleLabel}</span>
                        </div>
                        <em>{member.channelAdministrator ? "管理员" : "成员"}</em>
                        {channelAdminDashboard.canInviteAdmins &&
                        !member.channelAdministrator ? (
                          <button onClick={() => submitChannelAdminInvite(member.id)}>
                            <ShieldCheck size={16} />
                            邀请
                          </button>
                        ) : (
                          <span className="admin-lock">-</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {channelAdminDashboard.canReviewAdminRequests && (
                  <div className="channel-admin-section">
                    <div className="panel-head">
                      <h2>申请与邀请</h2>
                      <span>仅初始管理员可审批申请</span>
                    </div>
                    <div className="admin-list">
                      {channelAdminDashboard.adminRequests.length ? (
                        channelAdminDashboard.adminRequests.map((request) => (
                          <div className="admin-row" key={request.id}>
                            <div>
                              <strong>
                                {request.type === "APPLY"
                                  ? `${request.requesterName} 申请管理员`
                                  : `邀请 ${request.requesterName}`}
                              </strong>
                              <span>
                                {request.status === "PENDING"
                                  ? "待处理"
                                  : request.status}
                              </span>
                            </div>
                            <em>{request.type === "APPLY" ? "申请" : "邀请"}</em>
                            {request.type === "APPLY" &&
                            request.status === "PENDING" ? (
                              <div className="admin-inline-actions">
                                <button onClick={() => reviewChannelAdminRequest(request.id, "APPROVE")}>
                                  通过
                                </button>
                                <button
                                  className="danger-button"
                                  onClick={() => reviewChannelAdminRequest(request.id, "REJECT")}
                                >
                                  拒绝
                                </button>
                              </div>
                            ) : (
                              <span className="admin-lock">-</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="muted">暂无申请或邀请。</span>
                      )}
                    </div>
                  </div>
                )}
                <div className="channel-admin-section">
                  <div className="panel-head">
                    <h2>最近帖子</h2>
                    <span>可切换置顶状态</span>
                  </div>
                  <div className="admin-list">
                    {channelAdminDashboard.recentPosts.length ? (
                      channelAdminDashboard.recentPosts.map((post) => (
                        <div className="admin-row" key={post.id}>
                          <div>
                            <strong>{post.title}</strong>
                            <span>
                              {post.authorName} {post.replyCount} 回复 {post.likeCount} 赞
                            </span>
                          </div>
                          <em>{post.pinned ? "已置顶" : "普通"}</em>
                          <button onClick={() => toggleChannelAdminPostPinned(post)}>
                            <PushPin size={16} />
                            {post.pinned ? "取消置顶" : "置顶"}
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="muted">暂无频道帖子。</span>
                    )}
                  </div>
                </div>
                {channelAdminDashboard.canReviewAdminRequests && (
                  <div className="channel-admin-section" style={{ borderTop: "2px solid #ffd7dd", marginTop: 8 }}>
                    <div className="panel-head">
                      <h2 style={{ color: "#9f1d2f" }}>危险操作</h2>
                      <span>删除后不可恢复</span>
                    </div>
                    <button
                      className="danger-button"
                      onClick={() => setChannelDeletePending(channelAdminDashboard.channel.id)}
                    >
                      <Prohibit size={18} />
                      删除频道
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">无法读取频道管理信息。</div>
            )}
          </section>
        </div>
      )}

      {channelDeletePending && (
        <div className="modal-backdrop" onClick={() => setChannelDeletePending(null)}>
          <section className="small-modal" onClick={(e) => e.stopPropagation()}>
            <ModalHead title="删除频道" subtitle="此操作不可撤销" onClose={() => setChannelDeletePending(null)} />
            <p style={{ padding: "14px", color: "#3f4d63", lineHeight: "1.6", margin: 0 }}>
              确定要删除此频道吗？所有帖子、活动和成员记录都将被永久移除。
            </p>
            <div className="modal-actions" style={{ padding: "0 14px 14px" }}>
              <button onClick={() => setChannelDeletePending(null)}>取消</button>
              <button className="danger-button" onClick={removeChannel}>
                <Prohibit size={16} />
                确认删除
              </button>
            </div>
          </section>
        </div>
      )}

      {/* 创建频道弹窗 */}
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
              subtitle="创建后你将成为该频道唯一初始管理员"
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

      {/* 发布频道帖子弹窗 */}
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
              <label className={channelPostDraftImages.length >= 9 ? "disabled" : ""}>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  multiple
                  disabled={channelPostDraftImages.length >= 9}
                  onChange={(e) => {
                    addChannelPostImages(e.target.files);
                    e.target.value = "";
                  }}
                />
                <Image size={18} />
                图片 {channelPostDraftImages.length > 0 ? channelPostDraftImages.length : ""}
              </label>
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
            {channelPostDraftImages.length > 0 && (
              <div className="draft-image-grid">
                {channelPostDraftImages.map((image) => (
                  <figure key={image.id}>
                    <img src={image.previewUrl} alt={image.name} />
                    <button
                      title="移除图片"
                      onClick={() => removeChannelPostImage(image.id)}
                    >
                      ×
                    </button>
                  </figure>
                ))}
              </div>
            )}
            {selectedChannel?.isChannelAdmin && (
              <label className="segmented compact">
                <button
                  className={channelPostDraftPinned ? "active" : ""}
                  onClick={() => setChannelPostDraftPinned((v) => !v)}
                >
                  <PushPin size={16} />
                  置顶此帖
                </button>
              </label>
            )}
            <button
              className="submit-note"
              onClick={submitCreateChannelPost}
            >
              发布
            </button>
          </section>
        </div>
      )}

      {eventDetail && (
        <div className="modal-backdrop" onClick={() => { setEventDetail(null); setEventDetailError(""); }}>
          <section className="small-modal event-detail-modal" onClick={(e) => e.stopPropagation()}>
            <ModalHead
              title="活动详情"
              subtitle={eventDetail.event.channelName || "频道活动"}
              onClose={() => { setEventDetail(null); setEventDetailError(""); }}
            />
            <div className="event-detail-heading">
              <div>
                <span className="event-eyebrow">{eventDetail.event.status === "CANCELLED" ? "已取消" : eventDetail.event.ended ? "已结束" : "报名中"}</span>
                <h3>{eventDetail.event.title}</h3>
              </div>
              {eventDetail.event.canManage && eventDetail.event.status !== "CANCELLED" && (
                <button className="ghost-button small" onClick={() => { setEventDetail(null); openEditEvent(eventDetail.event); }}>
                  编辑活动
                </button>
              )}
            </div>
            <p className="event-detail-description">{eventDetail.event.description}</p>
            <div className="event-detail-meta">
              <span><Calendar size={16} />{eventDetail.event.timeLabel}</span>
              <span><Hash size={16} />{eventDetail.event.location}</span>
              <span><UsersThree size={16} />{eventDetail.event.participantCount}{eventDetail.event.capacity ? ` / ${eventDetail.event.capacity}` : ""} 人已加入</span>
              {eventDetail.event.deadlineLabel && <span><Bell size={16} />报名截止 {eventDetail.event.deadlineLabel}</span>}
            </div>
            {eventDetailError && <p className="form-error">{eventDetailError}</p>}
            <section className="event-participants">
              <div className="event-participants-head">
                <strong>已报名成员</strong>
                <span>{eventDetail.loading ? "加载中" : `${eventDetail.participants.length} 人`}</span>
              </div>
              {!eventDetail.loading && (eventDetail.participants.length ? (
                <div className="event-participant-list">
                  {eventDetail.participants.map((participant) => (
                    <div className="event-participant" key={participant.userId}>
                      <UserCircle size={24} />
                      <span>{participant.nickname}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="muted">还没有成员报名。</p>)}
            </section>
            {!eventDetail.event.ended && eventDetail.event.status !== "CANCELLED" && (
              <button
                className={eventDetail.event.joined ? "submit-note event-detail-join joined" : "submit-note event-detail-join"}
                disabled={!eventDetail.event.joined && eventDetail.event.full}
                onClick={() => {
                  toggleJoinChannelEvent(eventDetail.event)
                    .then((result) => result && setEventDetail((detail) => detail ? {
                      ...detail,
                      event: {
                        ...detail.event,
                        joined: result.joined,
                        participantCount: result.participantCount,
                        full: result.full,
                      },
                    } : detail));
                }}
              >
                {eventDetail.event.joined ? "取消加入" : eventDetail.event.full ? "活动已满" : "加入活动"}
              </button>
            )}
          </section>
        </div>
      )}

      {/* 发布频道活动弹窗 */}
      {eventDraftOpen && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setEventDraftOpen(false);
            setEventDraftError("");
          }}
        >
          <section className="small-modal event-draft-modal" onClick={(e) => e.stopPropagation()}>
            <ModalHead
              title={editingEventId ? "编辑频道活动" : "发布频道活动"}
              subtitle={selectedChannel?.name}
              onClose={() => {
                setEventDraftOpen(false);
                setEventDraftError("");
              }}
            />
            <label className="auth-field">
              <span>活动标题</span>
              <input
                className="title-input"
                value={eventDraftTitle}
                onChange={(e) => setEventDraftTitle(e.target.value)}
                placeholder="例如：离散数学考前答疑"
              />
            </label>
            <label className="auth-field">
              <span>活动说明</span>
              <textarea
                className="title-input"
                value={eventDraftDescription}
                onChange={(e) => setEventDraftDescription(e.target.value)}
                placeholder="写清楚活动内容、准备事项和参与方式"
              />
            </label>
            <label className="auth-field">
              <span>地点</span>
              <input
                className="title-input"
                value={eventDraftLocation}
                onChange={(e) => setEventDraftLocation(e.target.value)}
                placeholder="例如：信息学部 2 教 204"
              />
            </label>
            <div className="event-draft-grid">
              <label className="auth-field">
                <span>开始时间</span>
                <input
                  className="title-input"
                  type="datetime-local"
                  value={eventDraftStart}
                  onChange={(e) => setEventDraftStart(e.target.value)}
                />
              </label>
              <label className="auth-field">
                <span>结束时间</span>
                <input
                  className="title-input"
                  type="datetime-local"
                  value={eventDraftEnd}
                  onChange={(e) => setEventDraftEnd(e.target.value)}
                />
              </label>
            </div>
            <div className="event-draft-grid">
              <label className="auth-field">
                <span>报名截止</span>
                <input
                  className="title-input"
                  type="datetime-local"
                  value={eventDraftDeadline}
                  onChange={(e) => setEventDraftDeadline(e.target.value)}
                />
              </label>
              <label className="auth-field">
                <span>名额</span>
                <input
                  className="title-input"
                  type="number"
                  min="1"
                  value={eventDraftCapacity}
                  onChange={(e) => setEventDraftCapacity(e.target.value)}
                  placeholder="不填则不限"
                />
              </label>
            </div>
            <div className="event-draft-options">
              <button
                className={eventDraftCreatePost ? "active" : ""}
                onClick={() => setEventDraftCreatePost((v) => !v)}
              >
                <PaperPlaneTilt size={16} />
                同步帖子
              </button>
              <button
                className={eventDraftPinPost ? "active" : ""}
                disabled={!eventDraftCreatePost}
                onClick={() => setEventDraftPinPost((v) => !v)}
              >
                <PushPin size={16} />
                置顶帖子
              </button>
              <button
                className={eventDraftCreateChat ? "active" : ""}
                onClick={() => setEventDraftCreateChat((v) => !v)}
              >
                <ChatsCircle size={16} />
                创建活动群聊
              </button>
            </div>
            {eventDraftError && <p className="form-error">{eventDraftError}</p>}
            <button className="submit-note" onClick={submitCreateChannelEvent}>
              {editingEventId ? "保存活动" : "发布活动"}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}


