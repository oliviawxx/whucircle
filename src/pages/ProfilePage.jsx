import {
  BookmarkSimple,
  ChatCircle,
  Heart,
  NotePencil,
  PencilSimple,
  UsersThree,
} from "@phosphor-icons/react";
import { NotesFeed } from "../components/notes/NotesFeed.jsx";

export function ProfilePage({
  currentUser,
  notes,
  joinedChannelCount,
  channels = [],
  savedNotes = [],
  likedNotes = [],
  recentActivities = [],
  profileData,
  noteFeedProps,
  onEdit,
}) {
  const noteCount = profileData?.noteCount ?? notes.length;
  const followingCount = profileData?.followingCount ?? 0;
  const followerCount = profileData?.followerCount ?? 0;
  const friendCount = profileData?.friendCount ?? 0;
  const bio =
    profileData?.bio ||
    "还没有填写个人简介。可以补充兴趣、学院、常用频道和希望被别人了解的信息。";
  const joinedChannels = channels.filter((channel) => channel.joined).slice(0, 4);
  const ownNotes = notes.length ? notes : [];
  const activities = recentActivities.length
    ? recentActivities.slice(0, 5)
    : ["完善个人资料后，这里会展示你的近期动态。"];

  return (
    <section className="profile-dashboard">
      <section className="profile-hero-card">
        <div className="profile-cover" />
        <div className="profile-line rich">
          <img className="avatar large" src={currentUser.avatar} alt="当前用户头像" />
          <div>
            <h2>{currentUser.name}</h2>
            <p>{currentUser.meta}</p>
            <span>{bio}</span>
          </div>
          <button onClick={onEdit}>
            <PencilSimple size={17} />
            编辑资料
          </button>
        </div>
        <div className="profile-stats">
          <span>
            <strong>{noteCount}</strong>笔记
          </span>
          <span>
            <strong>{followingCount}</strong>关注
          </span>
          <span>
            <strong>{followerCount}</strong>粉丝
          </span>
          <span>
            <strong>{friendCount}</strong>好友
          </span>
          <span>
            <strong>{joinedChannelCount}</strong>频道
          </span>
        </div>
      </section>

      <section className="profile-summary-grid">
        <article className="profile-summary-card">
          <div className="panel-head">
            <h2>个人资料</h2>
            <span>基础信息与展示内容</span>
          </div>
          <div className="profile-detail-list">
            <div>
              <span>昵称</span>
              <strong>{profileData?.nickname || currentUser.name}</strong>
            </div>
            <div>
              <span>学院</span>
              <strong>{profileData?.college || "待完善"}</strong>
            </div>
            <div>
              <span>年级</span>
              <strong>{profileData?.grade || "待完善"}</strong>
            </div>
            <div>
              <span>邮箱</span>
              <strong>{profileData?.email || "登录邮箱"}</strong>
            </div>
          </div>
          <button className="profile-edit-wide" onClick={onEdit}>
            <NotePencil size={17} />
            填写或修改个人主页
          </button>
        </article>

        <article className="profile-summary-card">
          <div className="panel-head">
            <h2>近期动态</h2>
            <span>帖子、收藏、频道变化</span>
          </div>
          <div className="profile-activity-list">
            {activities.map((activity, index) => (
              <p key={`${activity}-${index}`}>{activity}</p>
            ))}
          </div>
        </article>
      </section>

      <section className="profile-metric-grid">
        <article>
          <Heart size={19} />
          <strong>{likedNotes.length}</strong>
          <span>点赞过的笔记</span>
        </article>
        <article>
          <BookmarkSimple size={19} />
          <strong>{savedNotes.length}</strong>
          <span>收藏内容</span>
        </article>
        <article>
          <UsersThree size={19} />
          <strong>{joinedChannelCount}</strong>
          <span>已加入频道</span>
        </article>
        <article>
          <ChatCircle size={19} />
          <strong>{friendCount}</strong>
          <span>好友关系</span>
        </article>
      </section>

      <section className="profile-summary-grid">
        <article className="profile-summary-card">
          <div className="panel-head">
            <h2>我的频道</h2>
            <span>常参与的讨论空间</span>
          </div>
          <div className="profile-chip-list">
            {joinedChannels.length ? (
              joinedChannels.map((channel) => (
                <span key={channel.id}>{channel.name}</span>
              ))
            ) : (
              <p className="muted">还没有加入频道。</p>
            )}
          </div>
        </article>

        <article className="profile-summary-card">
          <div className="panel-head">
            <h2>收藏与点赞</h2>
            <span>最近互动过的内容</span>
          </div>
          <div className="profile-mini-list">
            {[...savedNotes, ...likedNotes].slice(0, 4).map((note) => (
              <p key={`${note.id}-${note.title}`}>
                <strong>{note.title}</strong>
                <span>{note.author}</span>
              </p>
            ))}
            {savedNotes.length + likedNotes.length === 0 && (
              <p className="muted">暂时没有收藏或点赞记录。</p>
            )}
          </div>
        </article>
      </section>

      <section className="section-card profile-note-section">
        <div className="section-head">
          <div>
            <p>个人帖子</p>
            <h2>我的笔记</h2>
          </div>
          <span>{ownNotes.length} 条内容</span>
        </div>
        {ownNotes.length ? (
          <NotesFeed items={ownNotes} variant="linear" {...noteFeedProps} />
        ) : (
          <div className="empty-state">发布第一条笔记后，会出现在这里。</div>
        )}
      </section>
    </section>
  );
}
