import { ChatCircle, Flag, Heart, Image, PaperPlaneTilt, Prohibit, PushPin, UserMinus, UserPlus } from "@phosphor-icons/react";
import { ModalHead } from "../common/ModalHead.jsx";
import { Hash } from "@phosphor-icons/react";

export function AppModals({
  draft,
  joinChannel,
  channelPostDetail,
  profileUser,
  reportTarget,
  onDraftChange,
  onCreateNote,
  onCloseDraft,
  onAddDraftImages,
  onRemoveDraftImage,
  onCloseJoin,
  onClosePost,
  onCloseProfile,
  onCloseReport,
  onSubmitReport,
  onJoinPasswordChange,
  onSubmitJoin,
  onBlockUser,
  onReport,
  channelPostReply,
  onChannelPostReplyChange,
  onSubmitChannelPostReply,
  onToggleChannelPostLike,
  onToggleChannelPostPinned,
  onRelationAction,
  onStartConversation,
  profileBackdropClassName = "modal-backdrop",
  reportBackdropClassName = "modal-backdrop",
}) {
  return (
    <>
      {draft.open && (
        <div className="modal-backdrop" onClick={onCloseDraft}>
          <section className="draft-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title="发布笔记" subtitle="文字、图片或图文内容" onClose={onCloseDraft} />
            <input
              className="title-input"
              value={draft.title}
              onChange={(event) => onDraftChange("title", event.target.value)}
              placeholder="标题"
            />
            <textarea
              value={draft.text}
              onChange={(event) => onDraftChange("text", event.target.value)}
              placeholder="分享你想记录的内容..."
            />
            <div className="draft-tools">
              <label className={draft.imageCount >= 9 ? "disabled" : ""}>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  multiple
                  disabled={draft.imageCount >= 9 || draft.uploading}
                  onChange={(event) => {
                    onAddDraftImages(event.target.files);
                    event.target.value = "";
                  }}
                />
                <Image size={18} />
                图片 {draft.imageCount > 0 ? draft.imageCount : ""}
              </label>
              <div className="segmented compact">
                {["公开", "好友可见", "私密"].map((item) => (
                  <button
                    className={draft.visibility === item ? "active" : ""}
                    key={item}
                    onClick={() => onDraftChange("visibility", item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            {(draft.tagOptions || []).length > 0 && (
              <div className="draft-tags">
                <span>标签</span>
                <div className="tag-filter">
                  {draft.tagOptions.map((tag) => {
                    const active = (draft.tags || []).includes(tag);
                    return (
                      <button
                        className={active ? "active" : ""}
                        key={tag}
                        disabled={draft.uploading}
                        onClick={() => {
                          const current = draft.tags || [];
                          const next = active
                            ? current.filter((t) => t !== tag)
                            : [...current, tag];
                          onDraftChange("tags", next);
                        }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {draft.images.length > 0 && (
              <div className="draft-image-grid">
                {draft.images.map((image) => (
                  <figure key={image.id}>
                    <img src={image.previewUrl} alt={image.name} />
                    <button
                      title="移除图片"
                      disabled={draft.uploading}
                      onClick={() => onRemoveDraftImage(image.id)}
                    >
                      脳
                    </button>
                  </figure>
                ))}
              </div>
            )}
            {draft.error && <p className="form-error">{draft.error}</p>}
            <button className="submit-note" disabled={draft.uploading} onClick={onCreateNote}>
              {draft.uploading ? "上传中..." : "发布"}
            </button>
          </section>
        </div>
      )}

      {joinChannel && (
        <div className="modal-backdrop" onClick={onCloseJoin}>
          <section className="small-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title="加入频道" subtitle={joinChannel.name} onClose={onCloseJoin} />
            {joinChannel.type === "密码" && (
              <input
                className="title-input"
                value={joinChannel.inputPassword}
                onChange={(event) => onJoinPasswordChange(event.target.value)}
                placeholder="输入频道密码，例如 whu2026"
              />
            )}
            <button className="submit-note" onClick={onSubmitJoin}>加入</button>
          </section>
        </div>
      )}

      {channelPostDetail && (
        <div className="modal-backdrop" onClick={onClosePost}>
          <section className="small-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead
              title={channelPostDetail.post.title}
              subtitle={channelPostDetail.channel.name}
              onClose={onClosePost}
            />
            <p className="detail-body">{channelPostDetail.post.body || "频道内部交流帖。"}</p>
            <div className="post-action-row">
              <button
                className={channelPostDetail.post.liked ? "active" : ""}
                onClick={onToggleChannelPostLike}
              >
                <Heart size={17} weight={channelPostDetail.post.liked ? "fill" : "regular"} />
                {channelPostDetail.post.likes || 0}
              </button>
              {channelPostDetail.channel.isChannelAdmin && (
                <button
                  className={channelPostDetail.post.pinned ? "active" : ""}
                  onClick={onToggleChannelPostPinned}
                >
                  <PushPin size={17} weight={channelPostDetail.post.pinned ? "fill" : "regular"} />
                  {channelPostDetail.post.pinned ? "已置顶" : "置顶"}
                </button>
              )}
            </div>
            <div className="comment-panel">
              <h3>回复</h3>
              {(channelPostDetail.replies || []).length ? (
                channelPostDetail.replies.map((reply) => (
                  <p key={reply.id}>
                    <strong>{reply.authorName}</strong>
                    {reply.content}
                  </p>
                ))
              ) : (
                <span className="muted">暂无回复。</span>
              )}
              <div className="comment-input">
                <input
                  value={channelPostReply}
                  onChange={(event) => onChannelPostReplyChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") onSubmitChannelPostReply();
                  }}
                  placeholder="回复这个帖子..."
                />
                <button title="发送回复" onClick={onSubmitChannelPostReply}>
                  <PaperPlaneTilt size={17} weight="fill" />
                </button>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="report-icon-button"
                aria-label="举报"
                title="举报"
                onClick={() =>
                  onReport({
                    type: "频道帖子",
                    title: channelPostDetail.post.title,
                    targetId: channelPostDetail.post.id,
                  })
                }
              >
                <Flag size={18} />
              </button>
            </div>
          </section>
        </div>
      )}

      {profileUser && (
        <div className={profileBackdropClassName} onClick={onCloseProfile}>
          <section className="small-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title={profileUser.author} subtitle={profileUser.meta} onClose={onCloseProfile} />
            <div className="profile-preview">
              <img className="avatar large" src={profileUser.avatar} alt={`${profileUser.author}头像`} />
              <p>{profileUser.bio || "展示对方主页预览。拉黑后不能私信、评论、查看主页。"}</p>
              {profileUser.email && <span className="profile-email">{profileUser.email}</span>}
            </div>
            {profileUser.id || profileUser.authorId ? (
              <div className="profile-action-row">
                {profileUser.relation === "BLOCKED" ? (
                  <button onClick={() => onRelationAction(profileUser.id || profileUser.authorId, "unblock")}>
                    <UserPlus size={18} />
                    取消拉黑
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        onRelationAction(
                          profileUser.id || profileUser.authorId,
                          profileUser.relation === "FOLLOWING" || profileUser.relation === "FRIEND" ? "unfollow" : "follow",
                        )
                      }
                    >
                      {profileUser.relation === "FOLLOWING" || profileUser.relation === "FRIEND" ? (
                        <UserMinus size={18} />
                      ) : (
                        <UserPlus size={18} />
                      )}
                      {profileUser.relation === "FOLLOWING" || profileUser.relation === "FRIEND" ? "取消关注" : "关注"}
                    </button>
                    <button onClick={() => onStartConversation(profileUser)}>
                      <ChatCircle size={18} />
                      私聊
                    </button>
                    <button className="danger-button" onClick={() => onBlockUser(profileUser)}>
                      <Prohibit size={18} />
                      拉黑
                    </button>
                  </>
                )}
              </div>
            ) : (
              <button className="danger-button" onClick={() => onBlockUser(profileUser)}>
                <Prohibit size={18} />
                拉黑
              </button>
            )}
          </section>
        </div>
      )}

      {reportTarget && (
        <div className={reportBackdropClassName} onClick={onCloseReport}>
          <section className="small-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title="举报" subtitle={`${reportTarget.type} 路 ${reportTarget.title}`} onClose={onCloseReport} />
            <div className="report-reasons">
              {["广告", "骚扰", "不实信息", "其他"].map((reason) => (
                <button key={reason} onClick={() => onSubmitReport(reason)}>
                  {reason}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

