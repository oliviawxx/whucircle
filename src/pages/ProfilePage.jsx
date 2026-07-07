import { NotesFeed } from "../components/notes/NotesFeed.jsx";

export function ProfilePage({ currentUser, notes, joinedChannelCount, noteFeedProps }) {
  return (
    <section className="section-card profile-page-card">
      <div className="profile-cover" />
      <div className="profile-line">
        <img className="avatar large" src={currentUser.avatar} alt="当前用户头像" />
        <div><h2>{currentUser.name}</h2><p>{currentUser.meta} · 校园生活、课程项目、摄影记录</p></div>
        <button>编辑</button>
      </div>
      <div className="profile-stats">
        <span><strong>{notes.length}</strong>笔记</span>
        <span><strong>42</strong>关注</span>
        <span><strong>16</strong>好友</span>
        <span><strong>{joinedChannelCount}</strong>频道</span>
      </div>
      <NotesFeed items={notes} variant="linear" {...noteFeedProps} />
    </section>
  );
}
