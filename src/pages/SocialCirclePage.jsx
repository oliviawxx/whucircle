import { NotesFeed } from "../components/notes/NotesFeed.jsx";

export function SocialCirclePage({ notes, friends, noteFeedProps }) {
  return (
    <section className="split-view">
      <section className="section-card">
        <div className="section-head">
          <div><p>关注流</p><h2>关注内容与好友可见内容</h2></div>
          <span>好友可见笔记只在这里出现。</span>
        </div>
        <NotesFeed items={notes} variant="linear" {...noteFeedProps} />
      </section>
      <aside className="compact-panel">
        <div className="panel-head"><h2>关系状态</h2><span>互关后自动进入好友列表</span></div>
        {friends.map((friend) => (
          <article className="relation-row" key={friend.name}>
            <div><strong>{friend.name}</strong><span>{friend.detail}</span></div>
            <em>{friend.state}</em>
          </article>
        ))}
      </aside>
    </section>
  );
}
