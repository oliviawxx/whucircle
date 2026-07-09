import { useState } from "react";
import { NotesFeed } from "../components/notes/NotesFeed.jsx";
import { ChatCircle, Hash, House, Prohibit, UserMinus, UserPlus } from "@phosphor-icons/react";

function isReadable(value) {
  return value && !String(value).includes("?") && !String(value).includes("�");
}

const STATUS_FILTERS = [
  { key: "全部", label: "全部" },
  { key: "FRIEND", label: "互关好友" },
  { key: "FOLLOWING", label: "关注中" },
  { key: "FOLLOWER", label: "粉丝" },
];

export function SocialCirclePage({
  notes,
  friends,
  noteFeedProps,
  onRelationAction,
  onStartConversation,
  onNavigate,
}) {
  const [relationFilter, setRelationFilter] = useState("全部");

  const filteredFriends = (friends || [])
    .filter((friend) => isReadable(friend.name) && friend.status !== "NONE")
    .filter((friend) => relationFilter === "全部" || friend.status === relationFilter);

  return (
    <section className="split-view social-page">
      <section className="section-card">
        <div className="section-head">
          <div>
            <p>关注流</p>
            <h2>你关注的人与好友的动态</h2>
          </div>
          <span>有些分享只想给朋友看。</span>
        </div>
        {notes.length ? (
          <NotesFeed items={notes} variant="linear" {...noteFeedProps} />
        ) : (
          <div className="empty-state">
            <House size={36} />
            <p>关注好友后，这里会出现他们的动态</p>
            <span>去主页看看大家都在聊什么</span>
            <button className="ghost-button small" onClick={() => onNavigate("主页")}>
              浏览主页
            </button>
          </div>
        )}
      </section>

      <aside className="compact-panel social-relation-panel">
        <div className="panel-head">
          <h2>关系状态</h2>
          <span>双向奔赴，才是好友。</span>
        </div>

        {/* 筛选 Tab */}
        <div className="relation-tabs">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              className={relationFilter === f.key ? "active" : ""}
              onClick={() => setRelationFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filteredFriends.length ? (
          filteredFriends.map((friend) => (
            <article className="relation-row" key={friend.id || friend.name}>
              <img
                className="avatar relation-avatar"
                src={friend.avatar}
                alt={`${friend.name}头像`}
              />
              <div>
                <strong>{friend.name}</strong>
                <span>{friend.detail}</span>
              </div>
              <em>{friend.state}</em>
              {friend.id && (
                <div className="relation-actions">
                  {friend.status === "BLOCKED" ? (
                    <button onClick={() => onRelationAction(friend.id, "unblock")}>
                      <UserPlus size={15} />
                      取消拉黑
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          onRelationAction(
                            friend.id,
                            friend.status === "FOLLOWING" || friend.status === "FRIEND" ? "unfollow" : "follow",
                          )
                        }
                      >
                        {friend.status === "FOLLOWING" || friend.status === "FRIEND" ? (
                          <UserMinus size={15} />
                        ) : (
                          <UserPlus size={15} />
                        )}
                        {friend.status === "FOLLOWING" || friend.status === "FRIEND" ? "取消关注" : "关注"}
                      </button>
                      <button onClick={() => onStartConversation(friend)}>
                        <ChatCircle size={15} />
                        私聊
                      </button>
                      <button className="danger-text" onClick={() => onRelationAction(friend.id, "block")}>
                        <Prohibit size={15} />
                        拉黑
                      </button>
                    </>
                  )}
                </div>
              )}
            </article>
          ))
        ) : (
          <div className="empty-state compact">
            <Hash size={28} />
            <p>暂无关注关系</p>
            <span>去发现频道看看</span>
            <button className="ghost-button small" onClick={() => onNavigate("频道")}>
              浏览频道
            </button>
          </div>
        )}
      </aside>
    </section>
  );
}
