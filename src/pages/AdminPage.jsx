import { Prohibit, ShieldCheck, Trash, UserPlus } from "@phosphor-icons/react";

export function AdminPage({
  dashboard,
  loading,
  onRefresh,
  onUserStatus,
  onChannelStatus,
  onDeleteNote,
  onDeletePost,
}) {
  const summary = dashboard?.summary || {};
  const users = dashboard?.users || [];
  const channels = dashboard?.channels || [];
  const notes = dashboard?.notes || [];
  const posts = dashboard?.channelPosts || [];

  return (
    <section className="admin-page">
      <div className="admin-head">
        <div>
          <p>全站管理员</p>
          <h2>平台治理控制台</h2>
        </div>
        <button className="ghost-button small" onClick={onRefresh} disabled={loading}>
          <ShieldCheck size={16} />
          {loading ? "刷新中" : "刷新"}
        </button>
      </div>

      <div className="admin-metrics">
        <Metric label="用户" value={summary.userCount} muted={`${summary.bannedUserCount || 0} 个封禁`} />
        <Metric label="频道" value={summary.channelCount} muted={`${summary.bannedChannelCount || 0} 个封禁`} />
        <Metric label="笔记" value={summary.noteCount} muted="可删除违规内容" />
        <Metric label="频道帖" value={summary.channelPostCount} muted="可删除违规帖子" />
      </div>

      <div className="admin-grid">
        <AdminPanel title="账号治理" subtitle="封禁后该账号不能继续调用接口">
          {users.map((user) => (
            <article className="admin-row" key={user.id}>
              <div>
                <strong>{user.nickname}</strong>
                <span>{user.email} · {user.role} · {user.noteCount} 篇笔记</span>
              </div>
              <em className={user.status === "BANNED" ? "danger" : ""}>{user.status === "BANNED" ? "已封禁" : "正常"}</em>
              {user.role === "ADMIN" ? (
                <span className="admin-lock">管理员</span>
              ) : user.status === "BANNED" ? (
                <button onClick={() => onUserStatus(user.id, "ACTIVE")}><UserPlus size={16} />解封</button>
              ) : (
                <button className="danger-button" onClick={() => onUserStatus(user.id, "BANNED")}><Prohibit size={16} />封禁</button>
              )}
            </article>
          ))}
        </AdminPanel>

        <AdminPanel title="频道治理" subtitle="封禁后普通用户不可进入频道">
          {channels.map((channel) => (
            <article className="admin-row" key={channel.id}>
              <div>
                <strong>{channel.name}</strong>
                <span>{channel.joinType} · {channel.memberCount} 人 · 管理员：{channel.administratorName}</span>
              </div>
              <em className={channel.status === "BANNED" ? "danger" : ""}>{channel.status === "BANNED" ? "已封禁" : "正常"}</em>
              {channel.status === "BANNED" ? (
                <button onClick={() => onChannelStatus(channel.id, "ACTIVE")}><UserPlus size={16} />解封</button>
              ) : (
                <button className="danger-button" onClick={() => onChannelStatus(channel.id, "BANNED")}><Prohibit size={16} />封禁</button>
              )}
            </article>
          ))}
        </AdminPanel>

        <AdminPanel title="笔记内容" subtitle="删除明显违规笔记">
          {notes.slice(0, 12).map((note) => (
            <article className="admin-row" key={note.id}>
              <div>
                <strong>{note.title}</strong>
                <span>{note.authorName} · {note.visibility} · {note.likeCount} 赞 · {note.commentCount} 评论</span>
              </div>
              <button className="danger-button" onClick={() => onDeleteNote(note.id)}><Trash size={16} />删除</button>
            </article>
          ))}
        </AdminPanel>

        <AdminPanel title="频道帖子" subtitle="删除频道内违规讨论">
          {posts.slice(0, 12).map((post) => (
            <article className="admin-row" key={post.id}>
              <div>
                <strong>{post.title}</strong>
                <span>{post.channelName} · {post.authorName} · {post.likeCount} 赞 · {post.replyCount} 回复</span>
              </div>
              <button className="danger-button" onClick={() => onDeletePost(post.id)}><Trash size={16} />删除</button>
            </article>
          ))}
        </AdminPanel>
      </div>
    </section>
  );
}

function Metric({ label, value, muted }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
      <em>{muted}</em>
    </article>
  );
}

function AdminPanel({ title, subtitle, children }) {
  return (
    <section className="admin-panel">
      <div className="panel-head">
        <h2>{title}</h2>
        <span>{subtitle}</span>
      </div>
      <div className="admin-list">{children}</div>
    </section>
  );
}
