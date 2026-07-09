import { ArrowLeft, ChatCircle, Prohibit, UserMinus, UserPlus } from "@phosphor-icons/react";
import { NotesFeed } from "../components/notes/NotesFeed.jsx";

export function VisitedProfilePage({
  user,
  notes,
  onBack,
  onRelationAction,
  onStartConversation,
  onBlockUser,
  noteFeedProps,
}) {
  const userId = user?.id;
  const isFollowing = user?.relation === "FOLLOWING" || user?.relation === "FRIEND";
  const isBlocked = user?.relation === "BLOCKED";

  return (
    <section className="profile-dashboard">
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={18} />
        返回
      </button>

      <section className="profile-hero-card">
        <div className="profile-cover" />
        <div className="profile-line rich">
          <img className="avatar large" src={user.avatar} alt={`${user.author}头像`} />
          <div>
            <h2>{user.author || user.name}</h2>
            <span>{user.meta || "资料待完善"}</span>
            <p>{user.bio || "对方还没有填写个人简介。"}</p>
            {user.email && <em className="profile-email">{user.email}</em>}
          </div>
        </div>
        <div className="profile-stats">
          <div><strong>{user.noteCount ?? notes.length}</strong><span>笔记</span></div>
          <div><strong>{user.followingCount ?? 0}</strong><span>关注</span></div>
          <div><strong>{user.followerCount ?? 0}</strong><span>粉丝</span></div>
          <div><strong>{user.friendCount ?? 0}</strong><span>好友</span></div>
        </div>
      </section>

      {userId && (
        <div className="visit-action-row">
          {isBlocked ? (
            <button onClick={() => onRelationAction(userId, "unblock")}>
              <UserPlus size={18} />
              取消拉黑
            </button>
          ) : (
            <>
              <button onClick={() => onRelationAction(userId, isFollowing ? "unfollow" : "follow")}>
                {isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />}
                {isFollowing ? "取消关注" : "关注"}
              </button>
              <button onClick={() => onStartConversation(user)}>
                <ChatCircle size={18} />
                私聊
              </button>
              <button className="danger-button" onClick={() => onBlockUser(user)}>
                <Prohibit size={18} />
                拉黑
              </button>
            </>
          )}
        </div>
      )}

      <section className="profile-section">
        <h2>公开笔记</h2>
        {notes.length ? (
          <NotesFeed items={notes} {...noteFeedProps} />
        ) : (
          <div className="empty-state compact">对方还没有发布公开笔记。</div>
        )}
      </section>
    </section>
  );
}
