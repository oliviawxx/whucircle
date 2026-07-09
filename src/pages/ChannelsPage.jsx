import { useState } from "react";
import { Hash, List, LockKey, Plus, Trophy, Users } from "@phosphor-icons/react";

export function ChannelsPage({
  channels,
  selectedChannel,
  onSelectChannel,
  onJoin,
  onEnterChannel,
  onCreateChannel,
}) {
  const [viewTab, setViewTab] = useState("mine");
  // 已加入 / 未加入
  const joinedChannels = channels.filter((ch) => ch.joined);
  const rankedChannels = [...channels].sort((a, b) => b.members - a.members);

  return (
    <section className="channel-entry-page">
      {/* ---- 双 Tab 切换 ---- */}
      <nav className="channel-entry-tabs">
        <button
          className={viewTab === "mine" ? "active" : ""}
          onClick={() => setViewTab("mine")}
        >
          <List size={17} />
          我的频道
        </button>
        <button
          className={viewTab === "discover" ? "active" : ""}
          onClick={() => setViewTab("discover")}
        >
          <Trophy size={17} />
          发现频道
        </button>
      </nav>

      {/* ---- 我的频道 ---- */}
      {viewTab === "mine" && (
        <section className="my-channels">
          <div className="my-channels-head">
            <div>
              <h2>我的频道</h2>
              <span>你加入的圈子</span>
            </div>
            {onCreateChannel && (
              <button className="ghost-button small" onClick={onCreateChannel}>
                <Plus size={16} />创建
              </button>
            )}
          </div>
          {joinedChannels.length ? (
            <div className="channel-card-grid">
              {joinedChannels.map((channel) => (
                <button
                  className="channel-entry-card"
                  key={channel.id}
                  onClick={() => onEnterChannel?.(channel.id)}
                >
                  <div className="channel-card-icon">
                    {channel.type === "密码" ? <LockKey size={22} /> : <Hash size={22} />}
                  </div>
                  <div className="channel-card-body">
                    <strong>{channel.name}</strong>
                    <span>
                      <Users size={14} />
                      {channel.members} 人
                    </span>
                    {channel.announcement && <p>{channel.announcement}</p>}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Hash size={36} />
              <p>还没有加入任何频道</p>
              <span>去发现频道看看有什么好玩的圈子</span>
              <button className="ghost-button small" onClick={() => setViewTab("discover")}>
                <Trophy size={15} />
                去看看
              </button>
            </div>
          )}
        </section>
      )}

      {/* ---- 发现频道（排行榜） ---- */}
      {viewTab === "discover" && (
        <section className="discover-channels">
          <div className="panel-head">
            <div>
              <h2>发现频道</h2>
              <span>按成员数排序，找到你感兴趣的圈子</span>
            </div>
          </div>
          {rankedChannels.length ? (
            <div className="discover-channel-list">
              {rankedChannels.map((channel, index) => (
                <div className="discover-channel-row" key={channel.id}>
                  <strong className="discover-rank">{index + 1}</strong>
                  <div className="discover-channel-icon">
                    {channel.type === "密码" ? <LockKey size={20} /> : <Hash size={20} />}
                  </div>
                  <div className="discover-channel-info">
                    <span className="discover-channel-name">{channel.name}</span>
                    <em>{channel.type === "密码" ? "私密频道" : "公开频道"} · {channel.members} 人</em>
                  </div>
                  {channel.joined ? (
                    <button className="ghost-button small" onClick={() => onEnterChannel?.(channel.id)}>
                      进入
                    </button>
                  ) : (
                    <button className="ghost-button small" onClick={() => onJoin?.(channel)}>
                      <Plus size={14} />
                      加入
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state compact">暂无可用频道。</div>
          )}
        </section>
      )}
    </section>
  );
}
