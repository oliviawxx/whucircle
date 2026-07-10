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
  onOpenEventDraft,
  onOpenEventDetail,
  onOpenEventChat,
  onEditEvent,
  onToggleEventJoin,
  onCancelEvent,
  eventActionError,
  onToggleLike,
}) {
  const [activeTab, setActiveTab] = useState("posts");
  const [editingAnnouncement, setEditingAnnouncement] = useState(false);
  const [announcementDraft, setAnnouncementDraft] = useState(channel.announcement || "");
  const [expandedPosts, setExpandedPosts] = useState({});

  const isJoined = channel.joined;
  const isAdmin = channel.isChannelAdmin;
  const posts = channel.posts || [];
  const events = channel.events || [];

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
          <div className="channel-events-panel">
            {isAdmin && (
              <button className="channel-post-draft-btn" onClick={onOpenEventDraft}>
                <Calendar size={17} weight="fill" />
                发布活动
              </button>
            )}
            {eventActionError && <p className="event-action-error" role="alert">{eventActionError}</p>}
            {events.length ? (
              <div className="event-list">
                {events.map((event) => {
                  const blocked = event.status === "CANCELLED" || event.ended || event.full;
                  const statusLabel = event.status === "CANCELLED"
                    ? "已取消"
                    : event.ended
                      ? "已结束"
                      : event.full
                        ? "已满"
                        : "报名中";
                  return (
                    <article className={"event-card" + (event.joined ? " joined" : "")} key={event.id}>
                      <div className="event-card-main">
                        <div className="event-card-head">
                          <strong>{event.title}</strong>
                          <span>{statusLabel}</span>
                        </div>
                        <p>{event.description}</p>
                        <div className="event-meta-grid">
                          <span><Calendar size={15} />{event.timeLabel}</span>
                          <span><Hash size={15} />{event.location}</span>
                          <span><Users size={15} />{event.participantCount}{event.capacity ? ` / ${event.capacity}` : ""} 人</span>
                          {event.deadlineLabel && <span><Megaphone size={15} />截止 {event.deadlineLabel}</span>}
                        </div>
                      </div>
                      <div className="event-card-actions">
                        <button className="ghost-button small" onClick={() => onOpenEventDetail?.(event)}>
                          查看详情
                        </button>
                        {event.linkedPostId && (
                          <button
                            className="ghost-button small"
                            onClick={() => {
                              const linked = posts.find((post) => String(post.id) === String(event.linkedPostId));
                              if (linked) onOpenPost({ channel, post: linked });
                            }}
                          >
                            讨论
                          </button>
                        )}
                        {event.conversationId && (
                          <button
                            className="ghost-button small"
                            disabled={!event.canEnterChat}
                            title={event.canEnterChat ? "进入活动群聊" : "加入活动后可进入群聊"}
                            onClick={() => event.canEnterChat && onOpenEventChat?.(event)}
                          >
                            {event.canEnterChat ? "活动群聊" : "报名后入群"}
                          </button>
                        )}
                        {isJoined && event.status !== "CANCELLED" && !event.ended && (
                          <button
                            className={event.joined ? "ghost-button small active" : "ghost-button small"}
                            disabled={!event.joined && blocked}
                            onClick={() => onToggleEventJoin?.(event)}
                          >
                            {event.joined ? "取消加入" : event.full ? "已满" : "加入"}
                          </button>
                        )}
                        {isAdmin && event.status !== "CANCELLED" && (
                          <>
                            <button className="ghost-button small" onClick={() => onEditEvent?.(event)}>
                              编辑
                            </button>
                            <button className="ghost-button small danger" onClick={() => onCancelEvent?.(event)}>
                              取消活动
                            </button>
                          </>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <Calendar size={40} />
                <p>还没有活动</p>
                <span>频道管理员可以在这里发布活动安排。</span>
              </div>
            )}
          </div>
        )}

        {activeTab === "members" && (
          !channel.joined ? (
            <div className="empty-state compact">
              <Users size={32} />
              <p>加入频道后可查看成员</p>
            </div>
          ) : membersLoading ? (
            <div className="empty-state compact">加载成员列表...</div>
          ) : members.length === 0 ? (
            <div className="empty-state compact">
              <Users size={32} />
              <p>暂无成员</p>
            </div>
          ) : (
            <div className="channel-members-list">
              {members.map((member) => (
                <div className="member-row" key={member.id}>
                  <img className="avatar tiny" src={member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nickname)}&background=2563eb&color=fff`} alt={member.nickname} />
                  <div>
                    <strong>{member.nickname}</strong>
                    <span>{member.role === "ADMIN" ? "管理员" : member.college || member.grade ? [member.college, member.grade].filter(Boolean).join(" ") : "成员"}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </section>
    </section>
  );
}
