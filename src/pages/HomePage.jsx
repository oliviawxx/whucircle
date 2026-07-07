import { CaretDown, Hash, MagnifyingGlass } from "@phosphor-icons/react";
import { NotesFeed } from "../components/notes/NotesFeed.jsx";

export function HomePage({ notes, searchTerm, onSearchChange, tags, activeTag, onSelectTag, tagsExpanded, onToggleTags, noteFeedProps }) {
  return (
    <>
      <section className="filter-bar">
        <div className="filter-main-row">
          <div className="search wide">
            <MagnifyingGlass size={18} />
            <input value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} placeholder="搜索笔记、作者、内容" />
          </div>
          <button
            className={tagsExpanded ? "tag-toggle active" : "tag-toggle"}
            aria-expanded={tagsExpanded}
            aria-label={tagsExpanded ? "收起标签" : "展开标签"}
            title={tagsExpanded ? "收起标签" : "展开标签"}
            onClick={onToggleTags}
          >
            <Hash size={18} />
            <CaretDown size={15} />
          </button>
        </div>
        {tagsExpanded && (
          <div className="tag-filter">
            {tags.map((tag) => (
              <button className={activeTag === tag ? "active" : ""} key={tag} onClick={() => onSelectTag(tag)}>{tag}</button>
            ))}
          </div>
        )}
      </section>
      <NotesFeed items={notes} {...noteFeedProps} />
    </>
  );
}
