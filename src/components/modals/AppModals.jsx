import { Flag, Image, Prohibit } from "@phosphor-icons/react";
import { ModalHead } from "../common/ModalHead.jsx";

export function AppModals({
  draft,
  joinChannel,
  channelPostDetail,
  profileUser,
  reportTarget,
  onDraftChange,
  onCreateNote,
  onCloseDraft,
  onCloseJoin,
  onClosePost,
  onCloseProfile,
  onCloseReport,
  onSubmitReport,
  onJoinPasswordChange,
  onSubmitJoin,
  onBlockUser,
  onReport,
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
              <button onClick={() => onDraftChange("imageCount", Math.min(draft.imageCount + 1, 3))}>
                <Image size={18} />
                图片 {draft.imageCount > 0 ? draft.imageCount : ""}
              </button>
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
            <button className="submit-note" onClick={onCreateNote}>发布</button>
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
        <div className="modal-backdrop" onClick={onCloseProfile}>
          <section className="small-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title={profileUser.author} subtitle={profileUser.meta} onClose={onCloseProfile} />
            <div className="profile-preview">
              <img className="avatar large" src={profileUser.avatar} alt={`${profileUser.author}头像`} />
              <p>展示对方主页预览。拉黑后不能私信、评论、查看主页。</p>
            </div>
            <button className="danger-button" onClick={() => onBlockUser(profileUser.author)}>
              <Prohibit size={18} />
              拉黑
            </button>
          </section>
        </div>
      )}

      {reportTarget && (
        <div className="modal-backdrop" onClick={onCloseReport}>
          <section className="small-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title="举报" subtitle={`${reportTarget.type} · ${reportTarget.title}`} onClose={onCloseReport} />
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
