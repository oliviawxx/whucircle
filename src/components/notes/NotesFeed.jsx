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
            <div className="note-cover-wrap">
              <img
                className="note-cover"
                src={note.images[0]}
                alt="note image"
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.hidden = true;
                }}
              />
            </div>
          )}
          <div className="note-content">
            <div className="note-author">
              <button className="avatar-button" title="View profile" onClick={() => onOpenProfile(note)}>
                <img className="avatar" src={note.avatar} alt="avatar" />
              </button>
              <div>
                <strong>{note.author}</strong>
                <span>{note.meta}</span>
              </div>
              <IconButton title="Report note" onClick={() => onReport({ type: "note", title: note.title, targetId: note.id })}>
                <Flag size={17} />
              </IconButton>
              {currentUserId && note.authorId === currentUserId && (
                <IconButton title="Delete note" onClick={() => onDeleteNote(note.id)}>
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
              <button className={note.liked ? "active" : ""} title="Like" onClick={() => onToggleLike(note.id)}>
                <Heart size={19} weight={note.liked ? "fill" : "regular"} />
                {note.likes}
              </button>
              <button title="Comment" onClick={() => onOpenNote(note)}>
                <ChatCircle size={19} />
                {note.commentCount ?? note.comments.length}
              </button>
              <button className={note.saved ? "active" : ""} title="Save" onClick={() => onToggleSave(note.id)}>
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
