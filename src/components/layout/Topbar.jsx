import { Bell, BookmarkSimple, ChatCircle, Check, Heart, ShieldCheck, X } from "@phosphor-icons/react";

export function Topbar({ activeNav, page, notifications, open, onNavigate, onChannelAdminAction }) {
  const hasUnread = notifications.some((n) => n.unread);

  return (
    <header className="topbar">
      <div>
        <h1>{page[0]}</h1>
        <span>{page[1]}</span>
      </div>
      <div className="notification-wrap">
        <button className="icon-button" aria-label="通知" title="通知" onClick={() => onNavigate("通知")}>
          <Bell size={21} />
          {hasUnread && <span />}
        </button>
      </div>
    </header>
  );
}
