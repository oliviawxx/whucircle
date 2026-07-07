import { useMemo, useState } from "react";
import { AuthPage } from "./components/auth/AuthPage.jsx";
import { Sidebar } from "./components/layout/Sidebar.jsx";
import { Topbar } from "./components/layout/Topbar.jsx";
import { AppModals } from "./components/modals/AppModals.jsx";
import {
  currentUser,
  friendRows,
  initialChannels,
  initialChats,
  initialNotes,
  initialNotifications,
  pageCopy,
  tags,
  themeOptions,
} from "./data/mockData.js";
import { ChannelsPage } from "./pages/ChannelsPage.jsx";
import { ChatsPage } from "./pages/ChatsPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { SavedPage } from "./pages/SavedPage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";
import { SocialCirclePage } from "./pages/SocialCirclePage.jsx";
import { filterNotes, getSocialNotes } from "./utils/noteFilters.js";

export function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState("登录");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const [activeNav, setActiveNav] = useState("主页");
  const [notes, setNotes] = useState(initialNotes);
  const [channels, setChannels] = useState(initialChannels);
  const [chats] = useState(initialChats);
  const [activeChatId, setActiveChatId] = useState(initialChats[0].id);
  const [selectedChannelId, setSelectedChannelId] = useState(initialChannels[0].id);

  const [draftOpen, setDraftOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftText, setDraftText] = useState("");
  const [draftVisibility, setDraftVisibility] = useState("公开");
  const [imageCount, setImageCount] = useState(0);
  const [detailNote, setDetailNote] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [joinChannel, setJoinChannel] = useState(null);
  const [joinPassword, setJoinPassword] = useState("");
  const [channelPostDetail, setChannelPostDetail] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [savedSearch, setSavedSearch] = useState("");
  const [activeTag, setActiveTag] = useState("全部");
  const [tagsExpanded, setTagsExpanded] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState("blue");
  const [privacy, setPrivacy] = useState({
    noteVisibility: "公开",
    channelPermission: "公开",
    messagePermission: "仅好友",
  });
  const [blockedUsers, setBlockedUsers] = useState(["校外广告号"]);

  const selectedChannel = channels.find((channel) => channel.id === selectedChannelId) ?? channels[0];
  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? chats[0];
  const page = pageCopy[activeNav] ?? pageCopy["主页"];

  const publicNotes = useMemo(
    () => filterNotes(notes.filter((note) => note.visibility === "公开"), searchTerm, activeTag),
    [notes, searchTerm, activeTag],
  );
  const socialNotes = useMemo(() => getSocialNotes(notes), [notes]);
  const savedNotes = useMemo(
    () => filterNotes(notes.filter((note) => note.saved), savedSearch),
    [notes, savedSearch],
  );

  function navigate(label) {
    setActiveNav(label);
    setUserMenuOpen(false);
    setNotificationOpen(false);
  }

  function toggleLike(id) {
    setNotes((items) => items.map((note) => (
      note.id === id ? { ...note, liked: !note.liked, likes: note.liked ? note.likes - 1 : note.likes + 1 } : note
    )));
  }

  function toggleSave(id) {
    setNotes((items) => items.map((note) => (
      note.id === id
        ? { ...note, saved: !note.saved, saves: note.saved ? Math.max(0, note.saves - 1) : note.saves + 1 }
        : note
    )));
  }

  function updateDraft(key, value) {
    if (key === "title") setDraftTitle(value);
    if (key === "text") setDraftText(value);
    if (key === "visibility") setDraftVisibility(value);
    if (key === "imageCount") setImageCount(value);
  }

  function createNote() {
    if (!draftTitle.trim() && !draftText.trim() && imageCount === 0) return;
    setNotes((items) => [
      {
        id: Date.now(),
        author: currentUser.name,
        meta: `${currentUser.meta} · 刚刚`,
        visibility: draftVisibility,
        avatar: currentUser.avatar,
        title: draftTitle.trim() || "今天的校园记录",
        body: draftText.trim() || "上传了一张新的校园图片。",
        images: imageCount > 0
          ? ["https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=640&q=80"]
          : [],
        tags: ["校园生活"],
        likes: 0,
        saves: 0,
        comments: [],
        followed: true,
        mutual: true,
        liked: false,
        saved: false,
      },
      ...items,
    ]);
    setDraftTitle("");
    setDraftText("");
    setImageCount(0);
    setDraftOpen(false);
    setActiveNav(draftVisibility === "公开" ? "主页" : "社交圈");
  }

  function submitJoinChannel() {
    if (!joinChannel) return;
    if (joinChannel.type === "密码" && joinPassword.trim() !== joinChannel.password) return;
    setChannels((items) => items.map((channel) => (
      channel.id === joinChannel.id ? { ...channel, joined: true } : channel
    )));
    setSelectedChannelId(joinChannel.id);
    setJoinChannel(null);
    setJoinPassword("");
  }

  function blockUser(name) {
    if (!blockedUsers.includes(name)) setBlockedUsers((items) => [name, ...items]);
    setProfileUser(null);
  }

  function updatePrivacy(key, value) {
    setPrivacy((items) => ({ ...items, [key]: value }));
    if (key === "noteVisibility") setDraftVisibility(value);
  }

  const noteFeedProps = {
    onOpenNote: setDetailNote,
    onOpenProfile: setProfileUser,
    onReport: setReportTarget,
    onSelectTag: setActiveTag,
    onToggleLike: toggleLike,
    onToggleSave: toggleSave,
  };

  function renderPage() {
    if (activeNav === "主页") {
      return <HomePage notes={publicNotes} searchTerm={searchTerm} onSearchChange={setSearchTerm} tags={tags} activeTag={activeTag} onSelectTag={setActiveTag} tagsExpanded={tagsExpanded} onToggleTags={() => setTagsExpanded((value) => !value)} noteFeedProps={noteFeedProps} />;
    }
    if (activeNav === "社交圈") return <SocialCirclePage notes={socialNotes} friends={friendRows} noteFeedProps={noteFeedProps} />;
    if (activeNav === "频道") return <ChannelsPage channels={channels} selectedChannel={selectedChannel} onSelectChannel={setSelectedChannelId} onJoin={setJoinChannel} onOpenPost={setChannelPostDetail} onReport={setReportTarget} />;
    if (activeNav === "聊天") return <ChatsPage chats={chats} activeChat={activeChat} onSelectChat={setActiveChatId} onReport={setReportTarget} />;
    if (activeNav === "我的主页") {
      const ownNotes = notes.filter((note) => note.author === currentUser.name || note.visibility === "私密");
      return <ProfilePage currentUser={currentUser} notes={ownNotes} joinedChannelCount={channels.filter((channel) => channel.joined).length} noteFeedProps={noteFeedProps} />;
    }
    if (activeNav === "收藏") return <SavedPage notes={savedNotes} searchTerm={savedSearch} onSearchChange={setSavedSearch} noteFeedProps={noteFeedProps} />;
    if (activeNav === "设置") return <SettingsPage privacy={privacy} onPrivacyChange={updatePrivacy} blockedUsers={blockedUsers} themes={themeOptions} activeTheme={activeTheme} onThemeChange={setActiveTheme} />;
    return null;
  }

  if (!loggedIn) {
    return (
      <AuthPage
        activeTheme={activeTheme}
        mode={authMode}
        email={authEmail}
        password={authPassword}
        code={authCode}
        codeSent={codeSent}
        onModeChange={setAuthMode}
        onEmailChange={setAuthEmail}
        onPasswordChange={setAuthPassword}
        onCodeChange={setAuthCode}
        onSendCode={() => setCodeSent(true)}
        onEnter={() => setLoggedIn(true)}
      />
    );
  }

  return (
    <div className={`app-shell theme-${activeTheme}`}>
      <Sidebar
        activeNav={activeNav}
        currentUser={currentUser}
        menuOpen={userMenuOpen}
        onNavigate={navigate}
        onOpenDraft={() => setDraftOpen(true)}
        onToggleMenu={() => setUserMenuOpen((value) => !value)}
        onLogout={() => setLoggedIn(false)}
      />
      <main className="content">
        <Topbar
          activeNav={activeNav}
          page={page}
          notifications={notifications}
          open={notificationOpen}
          onToggle={() => setNotificationOpen((value) => !value)}
          onMarkAllRead={() => setNotifications((items) => items.map((item) => ({ ...item, unread: false })))}
        />
        {renderPage()}
      </main>
      <AppModals
        draft={{ open: draftOpen, title: draftTitle, text: draftText, visibility: draftVisibility, imageCount }}
        detailNote={detailNote}
        joinChannel={joinChannel ? { ...joinChannel, inputPassword: joinPassword } : null}
        channelPostDetail={channelPostDetail}
        profileUser={profileUser}
        reportTarget={reportTarget}
        onDraftChange={updateDraft}
        onCreateNote={createNote}
        onCloseDraft={() => setDraftOpen(false)}
        onCloseDetail={() => setDetailNote(null)}
        onCloseJoin={() => setJoinChannel(null)}
        onClosePost={() => setChannelPostDetail(null)}
        onCloseProfile={() => setProfileUser(null)}
        onCloseReport={() => setReportTarget(null)}
        onJoinPasswordChange={setJoinPassword}
        onSubmitJoin={submitJoinChannel}
        onBlockUser={blockUser}
        onReport={setReportTarget}
      />
    </div>
  );
}
