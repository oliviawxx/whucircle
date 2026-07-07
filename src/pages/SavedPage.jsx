import { MagnifyingGlass } from "@phosphor-icons/react";
import { NotesFeed } from "../components/notes/NotesFeed.jsx";

export function SavedPage({ notes, searchTerm, onSearchChange, noteFeedProps }) {
  return (
    <section className="section-card">
      <div className="section-head"><div><p>收藏</p><h2>搜索已收藏笔记</h2></div></div>
      <div className="search saved-search">
        <MagnifyingGlass size={18} />
        <input value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} placeholder="搜索收藏" />
      </div>
      <NotesFeed items={notes} variant="linear" {...noteFeedProps} />
    </section>
  );
}
