import { NotesFeed } from "../components/notes/NotesFeed.jsx";

export function ProfilePage({ currentUser, notes, joinedChannelCount, profileData, noteFeedProps, onEdit }) {
  const noteCount = profileData?.noteCount ?? notes.length;
  const followingCount = profileData?.followingCount ?? 0;
  const followerCount = profileData?.followerCount ?? 0;
  const friendCount = profileData?.friendCount ?? 0;

  return (
    <section className="section-card profile-page-card">
      <div className="profile-cover" />
      <div className="profile-line">
        <img className="avatar large" src={currentUser.avatar} alt="当前用户头像" />
        <div><h2>{currentUser.name}</h2><p>{currentUser.meta} · {profileData?.bio || "校园生活、课程项目、摄影记录"}</p></div>
        <button onClick={onEdit}>编辑</button>
      </div>
      <div className="profile-stats">
        <span><strong>{noteCount}</strong>笔记</span>
        <span><strong>{followingCount}</strong>关注</span>
        <span><strong>{friendCount}</strong>好友</span>
        <span><strong>{joinedChannelCount}</strong>频道</span>
      </div>
      <NotesFeed items={notes} variant="linear" {...noteFeedProps} />
    </section>
  );
}
