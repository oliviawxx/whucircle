import { Flag, Image, PaperPlaneTilt, Prohibit } from "@phosphor-icons/react";
import { ModalHead } from "../common/ModalHead.jsx";

export function AppModals({
  draft,
  detailNote,
  joinChannel,
  channelPostDetail,
  profileUser,
  reportTarget,
  onDraftChange,
  onCreateNote,
  onCloseDraft,
  onCloseDetail,
  onCloseJoin,
  onClosePost,
  onCloseProfile,
  onCloseReport,
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
            <input className="title-input" value={draft.title} onChange={(event) => onDraftChange("title", event.target.value)} placeholder="标题" />
            <textarea value={draft.text} onChange={(event) => onDraftChange("text", event.target.value)} placeholder="分享你想记录的内容..." />
            <div className="draft-tools">
              <button onClick={() => onDraftChange("imageCount", Math.min(draft.imageCount + 1, 3))}>
                <Image size={18} />图片 {draft.imageCount > 0 ? draft.imageCount : ""}
              </button>
              <div className="segmented compact">
                {["公开", "好友可见", "私密"].map((item) => (
                  <button className={draft.visibility === item ? "active" : ""} key={item} onClick={() => onDraftChange("visibility", item)}>{item}</button>
                ))}
              </div>
            </div>
            <button className="submit-note" onClick={onCreateNote}>发布</button>
          </section>
        </div>
      )}

      {detailNote && (
        <div className="modal-backdrop" onClick={onCloseDetail}>
          <section className="detail-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title={detailNote.title} subtitle={`${detailNote.author} · ${detailNote.meta}`} onClose={onCloseDetail} />
            {detailNote.images[0] && <img className="detail-image" src={detailNote.images[0]} alt="笔记图片" />}
            <p className="detail-body">{detailNote.body}</p>
            <div className="comment-panel">
              <h3>评论</h3>
              {detailNote.comments.length === 0 ? (
                <span className="muted">还没有评论。</span>
              ) : detailNote.comments.map((comment) => (
                <p key={`${comment.user}-${comment.text}`}><strong>{comment.user}</strong>{comment.text}</p>
              ))}
              <div className="comment-input"><input placeholder="写评论..." /><button title="发送"><PaperPlaneTilt size={17} weight="fill" /></button></div>
            </div>
            <div className="modal-actions">
              <button className="report-icon-button" aria-label="举报" title="举报" onClick={() => onReport({ type: "笔记", title: detailNote.title })}><Flag size={18} /></button>
            </div>
          </section>
        </div>
      )}

      {joinChannel && (
        <div className="modal-backdrop" onClick={onCloseJoin}>
          <section className="small-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title="加入频道" subtitle={joinChannel.name} onClose={onCloseJoin} />
            {joinChannel.type === "密码" && (
              <input className="title-input" value={joinChannel.inputPassword} onChange={(event) => onJoinPasswordChange(event.target.value)} placeholder="输入频道密码：whu2026" />
            )}
            <button className="submit-note" onClick={onSubmitJoin}>加入</button>
          </section>
        </div>
      )}

      {channelPostDetail && (
        <div className="modal-backdrop" onClick={onClosePost}>
          <section className="small-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title={channelPostDetail.post.title} subtitle={channelPostDetail.channel.name} onClose={onClosePost} />
            <p className="detail-body">频道内部交流帖。加入频道后可继续查看回复、点赞和参与讨论。</p>
            <div className="comment-panel"><h3>回复</h3><p><strong>频道成员</strong>这个信息很有用，建议置顶。</p><p><strong>管理员</strong>已加入本周公告。</p></div>
            <div className="modal-actions">
              <button className="report-icon-button" aria-label="举报" title="举报" onClick={() => onReport({ type: "频道帖子", title: channelPostDetail.post.title })}><Flag size={18} /></button>
            </div>
          </section>
        </div>
      )}

      {profileUser && (
        <div className="modal-backdrop" onClick={onCloseProfile}>
          <section className="small-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title={profileUser.author} subtitle={profileUser.meta} onClose={onCloseProfile} />
            <div className="profile-preview"><img className="avatar large" src={profileUser.avatar} alt={`${profileUser.author}头像`} /><p>展示对方主页预览。拉黑后不能私信、评论、查看主页。</p></div>
            <button className="danger-button" onClick={() => onBlockUser(profileUser.author)}><Prohibit size={18} />拉黑</button>
          </section>
        </div>
      )}

      {reportTarget && (
        <div className="modal-backdrop" onClick={onCloseReport}>
          <section className="small-modal" onClick={(event) => event.stopPropagation()}>
            <ModalHead title="举报" subtitle={`${reportTarget.type} · ${reportTarget.title}`} onClose={onCloseReport} />
            <div className="report-reasons">
              {["广告", "骚扰", "不实信息", "其他"].map((reason) => <button key={reason} onClick={onCloseReport}>{reason}</button>)}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
