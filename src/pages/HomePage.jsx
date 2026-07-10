import { CaretDown, Hash, MagnifyingGlass, Note, Sparkle, User, UserCircle } from "@phosphor-icons/react";
import { NotesFeed } from "../components/notes/NotesFeed.jsx";

export function HomePage({
  notes,
  searchTerm,
  onSearchChange,
  searchMode,
  onSearchModeChange,
  userResults,
  userSearchLoading,
  recommendedUsers,
  recommendedUsersLoading,
  onOpenProfile,
  tags,
  activeTag,
  onSelectTag,
  sort,
  onSortChange,
  tagsExpanded,
  onToggleTags,
  noteFeedProps,
}) {
  const hasSearch = searchTerm.trim().length > 0;
  const searchingUsers = searchMode === "users";
  const showFilterToggle = !searchingUsers && hasSearch;

  return (
    <>
      <section className="filter-bar">
        <div className="filter-main-row">
          <div className="search-mode-segmented">
            <button
              className={!searchingUsers ? "active" : ""}
              onClick={() => onSearchModeChange("notes")}
              title="搜索笔记"
            >
              <Note size={18} />
              <span>笔记</span>
            </button>
            <button
              className={searchingUsers ? "active" : ""}
              onClick={() => onSearchModeChange("users")}
              title="搜索用户"
            >
              <User size={18} />
              <span>用户</span>
            </button>
          </div>
          <div className="search wide">
            <MagnifyingGlass size={18} />
            <input
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchingUsers ? "搜索用户昵称、学院、年级或简介" : "搜索笔记、作者、内容、标签"}
            />
          </div>
          {showFilterToggle && (
            <button
              className={tagsExpanded ? "tag-toggle active" : "tag-toggle"}
              aria-expanded={tagsExpanded}
              aria-label={tagsExpanded ? "收起筛选" : "展开筛选"}
              title={tagsExpanded ? "收起筛选" : "展开筛选"}
              onClick={onToggleTags}
            >
              <Hash size={18} />
              <CaretDown size={15} />
            </button>
          )}
        </div>
        {showFilterToggle && tagsExpanded && (
          <div className="search-filter-panel">
            <div className="filter-section">
              <span>排序</span>
              <div className="tag-filter">
                <button className={sort === "latest" ? "active" : ""} onClick={() => onSortChange("latest")}>最新</button>
                <button className={sort === "hot" ? "active" : ""} onClick={() => onSortChange("hot")}>最热</button>
              </div>
            </div>
            <div className="filter-section">
              <span>标签</span>
              <div className="tag-filter">
                {tags.map((tag) => (
                  <button className={activeTag === tag ? "active" : ""} key={tag} onClick={() => onSelectTag(tag)}>{tag}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {searchingUsers ? (
        <section className="user-search-panel">
          {!hasSearch ? (
            recommendedUsersLoading ? (
              <div className="empty-state compact">正在加载推荐用户...</div>
            ) : recommendedUsers.length > 0 ? (
              <>
                <div className="recommended-heading">
                  <Sparkle size={20} weight="fill" />
                  <span>为你推荐</span>
                </div>
                <div className="user-result-grid">
                  {recommendedUsers.map((user) => (
                    <button className="user-result-card" key={user.targetId} onClick={() => onOpenProfile({ id: user.targetId, authorId: user.targetId, name: user.title, author: user.title, avatar: user.coverUrl, meta: user.subtitle })}>
                      <img className="avatar" src={user.coverUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.title)}&background=2563eb&color=fff`} alt={`${user.title}头像`} />
                      <div>
                        <strong>{user.title}</strong>
                        <span>{user.subtitle || "资料待完善"}</span>
                        <em>{user.reason}</em>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state compact"><UserCircle size={28} />输入关键词搜索用户</div>
            )
          ) : userSearchLoading ? (
            <div className="empty-state compact">正在搜索...</div>
          ) : userResults.length ? (
            <div className="user-result-grid">
              {userResults.map((user) => (
                <button className="user-result-card" key={user.id} onClick={() => onOpenProfile(user)}>
                  <img className="avatar" src={user.avatarUrl || user.avatar} alt={`${user.nickname || user.author}头像`} />
                  <div>
                    <strong>{user.nickname || user.author}</strong>
                    <span>{[user.grade, user.college].filter(Boolean).join(" · ") || "资料待完善"}</span>
                    {user.email && <em>{user.email}</em>}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state compact">没有找到可搜索的用户</div>
          )}
        </section>
      ) : hasSearch && notes.length === 0 ? (
        <div className="empty-state">
          <MagnifyingGlass size={36} />
          <p>没有找到相关笔记</p>
          <span>试试其他关键词或切换标签筛选</span>
        </div>
      ) : (
        <NotesFeed items={notes} {...noteFeedProps} />
      )}
    </>
  );
}
