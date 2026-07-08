import {
  BookmarkSimple,
  CaretDown,
  ChatCircle,
  GearSix,
  Hash,
  House,
  PaperPlaneTilt,
  ShieldCheck,
  Student,
  UserCircle,
  UsersThree,
} from "@phosphor-icons/react";

const navItems = [
  ["主页", House],
  ["社交圈", UsersThree],
  ["频道", Hash],
  ["聊天", ChatCircle],
];

export function Sidebar({
  activeNav,
  currentUser,
  menuOpen,
  chatUnreadCount = 0,
  isAdmin = false,
  onNavigate,
  onOpenDraft,
  onToggleMenu,
  onLogout,
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Student weight="duotone" size={30} /></div>
        <div>
          <strong>WHU Circle</strong>
          <span>武大校园圈</span>
        </div>
      </div>

      <nav className="nav-list">
        {navItems.map(([label, Icon]) => (
          <button className={activeNav === label ? "nav-item active" : "nav-item"} key={label} onClick={() => onNavigate(label)}>
            <Icon size={21} />
            <span>{label}</span>
            {label === "聊天" && chatUnreadCount > 0 && <em>{chatUnreadCount}</em>}
          </button>
        ))}
        {isAdmin && (
          <button className={activeNav === "全站管理" ? "nav-item active" : "nav-item"} onClick={() => onNavigate("全站管理")}>
            <ShieldCheck size={21} />
            <span>全站管理</span>
          </button>
        )}
      </nav>

      <button className="publish-entry" onClick={onOpenDraft}>
        <PaperPlaneTilt size={20} weight="fill" />
        发布笔记
      </button>

      <footer className="side-profile">
        <button className="profile-button" onClick={onToggleMenu}>
          <img className="avatar" src={currentUser.avatar} alt="当前用户头像" />
          <div>
            <strong>{currentUser.name}</strong>
            <span>个人中心</span>
          </div>
          <CaretDown size={15} />
        </button>
        {menuOpen && (
          <div className="user-menu">
            <button onClick={() => onNavigate("我的主页")}><UserCircle size={18} />我的主页</button>
            <button onClick={() => onNavigate("收藏")}><BookmarkSimple size={18} />我的收藏</button>
            <button onClick={() => onNavigate("设置")}><GearSix size={18} />设置</button>
            {isAdmin && <button onClick={() => onNavigate("全站管理")}><ShieldCheck size={18} />全站管理</button>}
            <button onClick={onLogout}>退出登录</button>
          </div>
        )}
      </footer>
    </aside>
  );
}
