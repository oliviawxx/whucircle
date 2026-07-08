import { BookmarkSimple, ChatCircle, Flag, Heart, Trash } from "@phosphor-icons/react";
import { IconButton } from "../common/IconButton.jsx";

export function NotesFeed({
  items,
  variant = "masonry",
  currentUserId,
  onOpenNote,
  onOpenProfile,
  onReport,
  onSelectTag,
  onToggleLike,
  onToggleSave,
  onDeleteNote,
}) {
  return (
    <section className={variant === "masonry" ? "masonry-feed" : "linear-feed"}>
      {items.map((note) => (
        <article className="note-card" key={note.id}>
          {note.images.length > 0 && (
            <img className="note-cover" src={note.images[0]} alt={`${note.author}发布的图片`} />
          )}
          <div className="note-content">
            <div className="note-author">
              <button className="avatar-button" title="查看主页" onClick={() => onOpenProfile(note)}>
                <img className="avatar" src={note.avatar} alt={`${note.author}头像`} />
              </button>
              <div>
                <strong>{note.author}</strong>
                <span>{note.meta}</span>
              </div>
              <IconButton title="举报笔记" onClick={() => onReport({ type: "笔记", title: note.title, targetId: note.id })}>
                <Flag size={17} />
              </IconButton>
              {currentUserId && note.authorId === currentUserId && (
                <IconButton title="删除笔记" onClick={() => onDeleteNote(note.id)}>
                  <Trash size={17} />
                </IconButton>
              )}
            </div>
            <button className="note-open" onClick={() => onOpenNote(note)}>
              <h2>{note.title}</h2>
              <p>{note.body}</p>
            </button>
            <div className="tag-row">
              {note.tags.map((tag) => (
                <button key={tag} onClick={() => onSelectTag(tag)}>#{tag}</button>
              ))}
            </div>
            <div className="note-actions">
              <button className={note.liked ? "active" : ""} title="点赞" onClick={() => onToggleLike(note.id)}>
                <Heart size={19} weight={note.liked ? "fill" : "regular"} />
                {note.likes}
              </button>
              <button title="评论" onClick={() => onOpenNote(note)}>
                <ChatCircle size={19} />
                {note.commentCount ?? note.comments.length}
              </button>
              <button className={note.saved ? "active" : ""} title="收藏" onClick={() => onToggleSave(note.id)}>
                <BookmarkSimple size={19} weight={note.saved ? "fill" : "regular"} />
                {note.saves}
              </button>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
