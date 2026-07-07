import { Bell, BookmarkSimple, ChatCircle, Heart } from "@phosphor-icons/react";

export function Topbar({ activeNav, page, notifications, open, onToggle, onMarkAllRead }) {
  const hasUnread = notifications.some((item) => item.unread);

  return (
    <header className="topbar">
      <div>
        <p>{activeNav}</p>
        <h1>{page[0]}</h1>
        <span>{page[1]}</span>
      </div>
      <div className="notification-wrap">
        <button className="icon-button" aria-label="通知" aria-expanded={open} title="通知" onClick={onToggle}>
          <Bell size={21} />
          {hasUnread && <span />}
        </button>
        {open && (
          <section className="notification-panel">
            <div className="notification-head">
              <h2>通知</h2>
              <button disabled={!hasUnread} onClick={onMarkAllRead}>全部已读</button>
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
  );
}
