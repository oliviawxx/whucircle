import { Check, CheckCircle, Flag, Hash, LockKey, Megaphone, PencilSimple, Plus, PushPin, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { IconButton } from "../components/common/IconButton.jsx";

export function ChannelsPage({
  channels,
  selectedChannel,
  onSelectChannel,
  onJoin,
  onOpenPost,
  onReport,
  onCreateChannel,
  onUpdateAnnouncement,
}) {
  const [editingAnnouncement, setEditingAnnouncement] = useState(false);
  const [announcementDraft, setAnnouncementDraft] = useState("");

  useEffect(() => {
    setEditingAnnouncement(false);
    setAnnouncementDraft(selectedChannel?.announcement || "");
  }, [selectedChannel?.id, selectedChannel?.announcement]);

  if (!selectedChannel) {
    return (
      <section className="channel-layout">
        <aside className="channel-list">
          <div className="panel-head channel-list-head">
            <div><h2>频道</h2><span>公开 / 密码</span></div>
            {onCreateChannel && (
              <button className="ghost-button small" onClick={onCreateChannel}>
                <Plus size={16} />创建
              </button>
            )}
          </div>
          {channels.map((channel) => (
            <button className="channel-item" key={channel.id} onClick={() => onSelectChannel(channel.id)}>
              {channel.type === "密码" ? <LockKey size={18} /> : <Hash size={18} />}
              <span>{channel.name}</span>
              {!channel.joined && <em>{channel.type}</em>}
            </button>
          ))}
        </aside>
        <section className="channel-board">
          <div className="empty-state">请选择一个频道查看详情。</div>
        </section>
      </section>
    );
  }

  const previewPosts = selectedChannel.joined ? selectedChannel.posts : selectedChannel.posts.slice(0, 5);
  const canEditAnnouncement = selectedChannel.joined && selectedChannel.isAdmin;

  function submitAnnouncement() {
    if (!announcementDraft.trim()) return;
    onUpdateAnnouncement?.(selectedChannel.id, announcementDraft);
    setEditingAnnouncement(false);
  }

  return (
    <section className="channel-layout">
      <aside className="channel-list">
        <div className="panel-head channel-list-head">
          <div><h2>频道</h2><span>公开 / 密码</span></div>
          {onCreateChannel && (
            <button className="ghost-button small" onClick={onCreateChannel}>
              <Plus size={16} />创建
            </button>
          )}
        </div>
        {channels.map((channel) => (
          <button className={selectedChannel.id === channel.id ? "channel-item active" : "channel-item"} key={channel.id} onClick={() => onSelectChannel(channel.id)}>
            {channel.type === "密码" ? <LockKey size={18} /> : <Hash size={18} />}
            <span>{channel.name}</span>
            {!channel.joined && <em>{channel.type}</em>}
          </button>
        ))}
      </aside>

      <section className="channel-board">
        <div className="channel-cover">
          <div>
            <p>{selectedChannel.type === "密码" ? "私密频道" : "公开频道"}</p>
            <h2>{selectedChannel.name}</h2>
            <span>{selectedChannel.members} 人 · 管理员：{selectedChannel.admin}</span>
          </div>
          {selectedChannel.joined ? (
            <button className="ghost-button"><CheckCircle size={18} />已加入</button>
          ) : (
            <button onClick={() => onJoin(selectedChannel)}>
              {selectedChannel.type === "密码" ? <LockKey size={18} /> : <Hash size={18} />}加入
            </button>
          )}
        </div>
        <div className="announcement">
          <Megaphone size={18} />
          {editingAnnouncement ? (
            <div className="announcement-editor">
              <textarea
                value={announcementDraft}
                onChange={(event) => setAnnouncementDraft(event.target.value)}
                maxLength={500}
                autoFocus
              />
              <div>
                <IconButton title="保存公告" onClick={submitAnnouncement}>
                  <Check size={17} />
                </IconButton>
                <IconButton
                  title="取消编辑"
                  onClick={() => {
                    setAnnouncementDraft(selectedChannel.announcement || "");
                    setEditingAnnouncement(false);
                  }}
                >
                  <X size={17} />
                </IconButton>
              </div>
            </div>
          ) : (
            <>
              <span>{selectedChannel.announcement}</span>
              {canEditAnnouncement && (
                <IconButton title="编辑公告" onClick={() => setEditingAnnouncement(true)}>
                  <PencilSimple size={17} />
                </IconButton>
              )}
            </>
          )}
        </div>
        <div className="channel-posts">
          {previewPosts.map((post) => (
            <article className="channel-post" key={post.id}>
              <button className="post-title-button" onClick={() => onOpenPost({ channel: selectedChannel, post })}>
                {post.pinned && <PushPin size={16} weight="fill" />}
                <strong>{post.title}</strong>
                <span>{post.replies} 回复 · {post.likes} 赞</span>
              </button>
              <IconButton title="举报频道帖子" onClick={() => onReport({ type: "频道帖子", title: post.title, targetId: post.id })}>
                <Flag size={17} />
              </IconButton>
            </article>
          ))}
        </div>
        {!selectedChannel.joined && (
          <div className="join-reminder"><LockKey size={22} /><span>未加入时仅预览前 5 条帖子。加入后可发帖、回复、点赞。</span></div>
        )}
      </section>

      <aside className="compact-panel ranking-panel">
        <div className="panel-head"><h2>频道榜单</h2><span>按成员数展示</span></div>
        {[...channels].sort((a, b) => b.members - a.members).map((channel, index) => (
          <button className="rank-row" key={channel.id} onClick={() => onSelectChannel(channel.id)}>
            <strong>{index + 1}</strong><span>{channel.name}</span><em>{channel.members} 人</em>
          </button>
        ))}
      </aside>
    </section>
  );
}
