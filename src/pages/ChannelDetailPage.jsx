import { useState } from "react";
import { ArrowLeft, Calendar, CaretDown, CaretUp, ChatCircle, Check, Flag, Hash, Heart, LockKey, Megaphone, PaperPlaneTilt, PencilSimple, PushPin, ShieldCheck, Trash, Users, X } from "@phosphor-icons/react";
import { IconButton } from "../components/common/IconButton.jsx";

const DETAIL_TABS = [
  { key: "posts", label: "帖子", icon: PaperPlaneTilt },
  { key: "events", label: "活动", icon: Calendar },
  { key: "members", label: "成员", icon: Users },
];

export function ChannelDetailPage({
  channel,
  currentUserId,
  onBack,
  onJoin,
  onOpenPost,
  onReport,
  onUpdateAnnouncement,
  onOpenManagement,
  onApplyAdmin,
  onDeletePost,
  onOpenDraft,
  onToggleLike,
}) {
  const [activeTab, setActiveTab] = useState("posts");
  const [editingAnnouncement, setEditingAnnouncement] = useState(false);
  const [announcementDraft, setAnnouncementDraft] = useState(channel.announcement || "");
  const [expandedPosts, setExpandedPosts] = useState({});

  const isJoined = channel.joined;
  const isAdmin = channel.isChannelAdmin;
  const posts = channel.posts || [];

  function toggleExpand(postId) {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  }

  function submitAnnouncement() {
    if (!announcementDraft.trim()) return;
    onUpdateAnnouncement?.(channel.id, announcementDraft);
    setEditingAnnouncement(false);
  }

  return (
    <section className="channel-detail-page">
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={18} />
        返回
      </button>

      {/* 频道头部 */}
      <section className="channel-detail-hero">
        <div className="channel-detail-cover" />
        <div className="channel-detail-info">
          <div>
            <div className="channel-detail-type">
              {channel.type === "密码" ? <LockKey size={16} /> : <Hash size={16} />}
              <span>{channel.type === "密码" ? "私密频道" : "公开频道"}</span>
            </div>
            <h2>{channel.name}</h2>
            <span className="channel-detail-meta">
              {channel.members} 人 · 管理员：{channel.admin}
            </span>
          </div>
          <div className="channel-detail-actions">
            {isAdmin && (
              <button className="ghost-button small" onClick={() => onOpenManagement?.(channel.id)}>
                <ShieldCheck size={15} />
                管理面板
              </button>
            )}
            {isJoined && !isAdmin && (
              <button className="ghost-button small" onClick={() => onApplyAdmin?.(channel.id)}>
                <ShieldCheck size={15} />
                申请管理
              </button>
            )}
            {!isJoined && (
              <button onClick={() => onJoin?.(channel)}>
                {channel.type === "密码" ? <LockKey size={16} /> : <Hash size={16} />}
                加入频道
              </button>
            )}
          </div>
        </div>

        {/* 公告 */}
        <div className="channel-detail-announcement">
          <Megaphone size={18} />
          {editingAnnouncement ? (
            <div className="announcement-editor">
              <textarea
                value={announcementDraft}
                onChange={(e) => setAnnouncementDraft(e.target.value)}
                maxLength={500}
                autoFocus
              />
              <div>
                <IconButton title="保存" onClick={submitAnnouncement}><Check size={17} /></IconButton>
                <IconButton title="取消" onClick={() => { setAnnouncementDraft(channel.announcement || ""); setEditingAnnouncement(false); }}>
                  <X size={17} />
                </IconButton>
              </div>
            </div>
          ) : (
            <>
              <span>{channel.announcement || "暂无公告。"}</span>
              {isAdmin && (
                <IconButton title="编辑公告" onClick={() => setEditingAnnouncement(true)}>
                  <PencilSimple size={17} />
                </IconButton>
              )}
            </>
          )}
        </div>
      </section>

      {/* Tab 导航 */}
      <nav className="detail-tabs">
        {DETAIL_TABS.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon size={17} />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab 内容 */}
      <section className="detail-tab-content">
        {activeTab === "posts" && (
          <div className="channel-posts-feed">
            {isJoined && (
              <button className="channel-post-draft-btn" onClick={onOpenDraft}>
                <PaperPlaneTilt size={17} weight="fill" />
                发布新帖
              </button>
            )}
            {posts.length ? (
              posts.map((post) => {
                const expanded = expandedPosts[post.id];
                return (
                  <article className={"post-card" + (expanded ? " expanded" : "")} key={post.id}>
                    {/* 置顶标记 */}
                    {post.pinned && (
                      <div className="post-pin-badge">
                        <PushPin size={14} weight="fill" />
                        置顶
                      </div>
                    )}

                    {/* 标题 + 正文 */}
                    <div className="post-body-area">
                      <button className="post-title-click" onClick={() => onOpenPost({ channel, post })}>
                        <h3>{post.title}</h3>
                      </button>
                      {post.body && (
                        <div className="post-content-wrap">
                          <p className={expanded ? "post-body full" : "post-body"}>
                            {post.body}
                          </p>
                          {!expanded && post.body.length > 120 && (
                            <button className="post-expand-btn" onClick={() => toggleExpand(post.id)}>
                              展开 <CaretDown size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 图片 */}
                    {post.imageUrls && post.imageUrls.length > 0 && (
                      <div className="post-images">
                        {post.imageUrls.map((url, i) => (
                          <img key={i} src={url} alt="" loading="lazy" />
                        ))}
                      </div>
                    )}

                    {/* 底部信息 + 操作 */}
                    <div className="post-footer">
                      <div className="post-meta">
                        {post.author && <span className="post-author">{post.author}</span>}
                        {post.time && <span className="post-time">{post.time}</span>}
                      </div>
                      <div className="post-actions">
                        <button
                          className={post.liked ? "active" : ""}
                          onClick={() => onToggleLike?.(post.id)}
                          title="点赞"
                        >
                          <Heart size={16} weight={post.liked ? "fill" : "regular"} />
                          {post.likes > 0 && post.likes}
                        </button>
                        <button onClick={() => onOpenPost({ channel, post })} title="回复">
                          <ChatCircle size={16} />
                          {post.replies > 0 && post.replies}
                        </button>
                        <IconButton title="举报" onClick={() => onReport({ type: "频道帖子", title: post.title, targetId: post.id })}>
                          <Flag size={16} />
                        </IconButton>
                        {Number(post.authorId) === Number(currentUserId) && (
                          <IconButton title="删除" onClick={() => onDeletePost(post.id)}>
                            <Trash size={16} />
                          </IconButton>
                        )}
                      </div>
                      {expanded && (
                        <button className="post-collapse-btn" onClick={() => toggleExpand(post.id)}>
                          <CaretUp size={15} />
                          收起
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="empty-state compact">还没有帖子。{isJoined && " 成为第一个发帖的人吧。"}</div>
            )}
          </div>
        )}

        {activeTab === "events" && (
          <div className="empty-state">
            <Calendar size={40} />
            <p>活动功能即将上线</p>
            <span>频道管理员将可以在这里发布和安排活动。</span>
          </div>
        )}

        {activeTab === "members" && (
          <div className="empty-state compact">
            <Users size={32} />
            <p>成员列表即将上线</p>
          </div>
        )}
      </section>
    </section>
  );
}
