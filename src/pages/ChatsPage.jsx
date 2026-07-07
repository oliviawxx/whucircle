import { ChatsCircle, DotsThree, Flag, PaperPlaneTilt, UserCircle } from "@phosphor-icons/react";
import { IconButton } from "../components/common/IconButton.jsx";

export function ChatsPage({ chats, activeChat, onSelectChat, onReport }) {
  return (
    <section className="chat-layout">
      <aside className="chat-list">
        {chats.map((chat) => (
          <button className={activeChat.id === chat.id ? "chat-preview active" : "chat-preview"} key={chat.id} onClick={() => onSelectChat(chat.id)}>
            <div className="chat-avatar">{chat.type === "群聊" ? <ChatsCircle size={22} /> : <UserCircle size={22} />}</div>
            <div><strong>{chat.name}</strong><span>{chat.messages.at(-1)?.text}</span></div>
            <time>{chat.lastTime}</time>
            {chat.unread > 0 && <em>{chat.unread}</em>}
          </button>
        ))}
      </aside>

      <section className="chat-window">
        <div className="chat-window-head">
          <div><p>{activeChat.type}</p><h2>{activeChat.name}</h2></div>
          <IconButton title="更多"><DotsThree size={22} /></IconButton>
        </div>
        <div className="bubble-list">
          {activeChat.messages.map((message, index) => (
            <div className={message.mine ? "message-line mine" : "message-line"} key={`${message.text}-${index}`}>
              <p className={message.mine ? "bubble mine" : "bubble other"}>{message.text}</p>
              <div className="message-meta">
                <span>{message.time}</span>
                {message.mine && <span>{message.read ? "已读" : "未读"}</span>}
                <IconButton title="举报消息" onClick={() => onReport({ type: "聊天消息", title: message.text })}>
                  <Flag size={15} />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input"><input placeholder="输入消息..." /><button title="发送"><PaperPlaneTilt size={18} weight="fill" /></button></div>
      </section>
    </section>
  );
}
