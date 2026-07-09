export function SkeletonBlock({ width, height, style }) {
  return (
    <span
      className="skeleton-block"
      style={{ width: width || "100%", height: height || "1em", ...style }}
      aria-hidden="true"
    />
  );
}

export function NoteCardSkeleton() {
  return (
    <article className="note-card skeleton-card" aria-hidden="true">
      <SkeletonBlock height="clamp(170px, 24vw, 280px)" />
      <div className="note-content">
        <div className="note-author">
          <SkeletonBlock width="42px" height="42px" style={{ borderRadius: "50%" }} />
          <div>
            <SkeletonBlock width="80px" height="14px" />
            <SkeletonBlock width="120px" height="12px" style={{ marginTop: 6 }} />
          </div>
        </div>
        <SkeletonBlock width="85%" height="19px" style={{ marginTop: 16 }} />
        <SkeletonBlock width="70%" height="19px" style={{ marginTop: 6 }} />
        <SkeletonBlock width="100%" height="14px" style={{ marginTop: 12 }} />
        <SkeletonBlock width="100%" height="14px" style={{ marginTop: 6 }} />
        <SkeletonBlock width="40%" height="14px" style={{ marginTop: 6 }} />
        <div className="tag-row" style={{ marginTop: 12 }}>
          <SkeletonBlock width="60px" height="24px" style={{ borderRadius: 14 }} />
          <SkeletonBlock width="72px" height="24px" style={{ borderRadius: 14 }} />
        </div>
        <div className="note-actions">
          <SkeletonBlock width="100%" height="14px" />
        </div>
      </div>
    </article>
  );
}

export function ChannelListSkeleton({ count = 6 }) {
  return (
    <div className="channel-list-skeleton" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="channel-skeleton-row" key={i}>
          <SkeletonBlock width="36px" height="36px" style={{ borderRadius: 8, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <SkeletonBlock width="60%" height="15px" />
            <SkeletonBlock width="40%" height="12px" style={{ marginTop: 6 }} />
          </div>
          <SkeletonBlock width="48px" height="28px" style={{ borderRadius: 6, flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}
