import { NotesFeed } from "../components/notes/NotesFeed.jsx";
import { ChatCircle, Prohibit, UserMinus, UserPlus } from "@phosphor-icons/react";
import { IconButton } from "../components/common/IconButton.jsx";

function isReadable(value) {
  return value && !String(value).includes("?") && !String(value).includes("�");
}

export function SocialCirclePage({
  notes,
  friends,
  noteFeedProps,
  onRelationAction,
  onStartConversation,
}) {
  const visibleFriends = (friends || [])
    .filter((friend) => isReadable(friend.name))
    .slice(0, 6);

  return (
    <section className="split-view social-page">
      <section className="section-card">
        <div className="section-head">
          <div>
            <p>关注流</p>
            <h2>关注内容与好友可见内容</h2>
          </div>
          <span>好友可见笔记只在这里出现。</span>
        </div>
        {notes.length ? (
          <NotesFeed items={notes} variant="linear" {...noteFeedProps} />
        ) : (
          <div className="empty-state">关注好友后，这里会出现他们的动态。</div>
        )}
      </section>

      <aside className="compact-panel social-relation-panel">
        <div className="panel-head">
          <h2>关系状态</h2>
          <span>互关后自动进入好友列表</span>
        </div>
        {visibleFriends.length ? (
          visibleFriends.map((friend) => (
            <article className="relation-row" key={friend.name}>
              <div>
                <strong>{friend.name}</strong>
                <span>{friend.detail}</span>
              </div>
              <em>{friend.state}</em>
              {friend.id && (
                <div className="relation-actions">
                  {friend.status === "BLOCKED" ? (
                    <IconButton title="取消拉黑" onClick={() => onRelationAction(friend.id, "unblock")}>
                      <UserPlus size={16} />
                    </IconButton>
                  ) : (
                    <>
                      <IconButton
                        title={friend.status === "FOLLOWING" || friend.status === "FRIEND" ? "取消关注" : "关注"}
                        onClick={() =>
                          onRelationAction(
                            friend.id,
                            friend.status === "FOLLOWING" || friend.status === "FRIEND" ? "unfollow" : "follow",
                          )
                        }
                      >
                        {friend.status === "FOLLOWING" || friend.status === "FRIEND" ? (
                          <UserMinus size={16} />
                        ) : (
                          <UserPlus size={16} />
                        )}
                      </IconButton>
                      <IconButton title="发起私聊" onClick={() => onStartConversation(friend)}>
                        <ChatCircle size={16} />
                      </IconButton>
                      <IconButton title="拉黑" onClick={() => onRelationAction(friend.id, "block")}>
                        <Prohibit size={16} />
                      </IconButton>
                    </>
                  )}
                </div>
              )}
            </article>
          ))
        ) : (
          <div className="empty-state compact">暂无关注关系</div>
        )}
      </aside>
    </section>
  );
}
