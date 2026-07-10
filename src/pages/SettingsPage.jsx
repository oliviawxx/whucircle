import { Bell, Eye, LockKey, MagnifyingGlass, Palette, ShieldCheck, Sparkle } from "@phosphor-icons/react";
import { UserPlus } from "@phosphor-icons/react";

function SettingSegment({ label, description, value, options, onChange }) {
  return (
    <section className="setting-row">
      <div>
        <strong>{label}</strong>
        <span>{description || value}</span>
      </div>
      <div className="segmented">
        {options.map((option) => (
          <button className={value === option ? "active" : ""} key={option} onClick={() => onChange(option)}>
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}

function SettingSwitch({ label, description, checked, onChange }) {
  return (
    <section className="setting-row switch-row">
      <div>
        <div className="switch-label-line">
          <strong>{label}</strong>
          <button className={checked ? "switch-control active" : "switch-control"} onClick={() => onChange(!checked)}>
            <span />
          </button>
        </div>
        <span>{description}</span>
      </div>
    </section>
  );
}

function SettingGroup({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="settings-group">
      <div className="settings-group-head">
        <Icon size={22} />
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="settings-group-body">{children}</div>
    </section>
  );
}

export function SettingsPage({ privacy, onPrivacyChange, blockedUsers, themes, activeTheme, onThemeChange, onRelationAction }) {
  return (
    <section className="settings-page">
      <div className="section-head settings-hero">
        <div>
          <p>设置中心</p>
          <h2>隐私、安全与个性化</h2>
          <span>决定谁能找到你、看到你、联系你。</span>
        </div>
        <ShieldCheck size={30} />
      </div>

      <div className="settings-grid">
        <SettingGroup icon={Eye} title="内容默认权限" subtitle="发布内容时的默认可见范围和频道加入方式。">
          <SettingSegment
            label="笔记默认可见范围"
            description="新建笔记时会自动使用这个范围，发布前仍可单独修改。"
            value={privacy.noteVisibility}
            options={["公开", "好友可见", "私密"]}
            onChange={(value) => onPrivacyChange("noteVisibility", value)}
          />
          <SettingSegment
            label="频道默认加入方式"
            description="创建频道时默认公开或需要密码。"
            value={privacy.channelPermission}
            options={["公开", "密码"]}
            onChange={(value) => onPrivacyChange("channelPermission", value)}
          />
        </SettingGroup>

        <SettingGroup icon={MagnifyingGlass} title="搜索与资料展示" subtitle="控制用户搜索能否找到你，以及主页上展示哪些身份信息。">
          <SettingSwitch
            label="允许别人通过用户搜索找到我"
            description="关闭后，你不会出现在用户搜索和推荐用户结果中。"
            checked={privacy.searchableByUsers}
            onChange={(value) => onPrivacyChange("searchableByUsers", value)}
          />
          <SettingSwitch
            label="在对外主页展示学邮箱"
            description="关闭后，只有你自己能在个人主页看到邮箱。"
            checked={privacy.showEmailOnProfile}
            onChange={(value) => onPrivacyChange("showEmailOnProfile", value)}
          />
        </SettingGroup>

        <SettingGroup icon={Sparkle} title="个性化推荐" subtitle="控制首页是否使用你的学院、年级、互动和标签偏好进行排序。">
          <SettingSwitch
            label="启用个性化推荐"
            description="关闭后，首页更多依据公开内容热度和时间排序。"
            checked={privacy.personalizedRecommendations}
            onChange={(value) => onPrivacyChange("personalizedRecommendations", value)}
          />
        </SettingGroup>

        <SettingGroup icon={LockKey} title="私信与安全" subtitle="减少陌生打扰，并保留关键账号安全提醒。">
          <SettingSegment
            label="私信权限"
            description="限制谁可以主动给你发消息。"
            value={privacy.messagePermission}
            options={["允许所有人", "仅好友", "不接收陌生人私信"]}
            onChange={(value) => onPrivacyChange("messagePermission", value)}
          />
          <SettingSwitch
            label="接收互动通知"
            description="点赞、评论、关注、群聊邀请等通知。"
            checked={privacy.activityNotifications}
            onChange={(value) => onPrivacyChange("activityNotifications", value)}
          />
          <SettingSwitch
            label="登录与安全提醒"
            description="保留异常登录、密码变更等账号安全提醒。"
            checked={privacy.loginAlerts}
            onChange={(value) => onPrivacyChange("loginAlerts", value)}
          />
        </SettingGroup>

        <SettingGroup icon={ShieldCheck} title="黑名单" subtitle="被拉黑后，对方不能私信、评论或查看你的主页。">
         <div className="block-list">
            {blockedUsers.length === 0 ? (
              <span>暂无拉黑用户</span>
            ) : (
              blockedUsers.map((user) => {
                const userId = user.id || user.userId;
                return (
                  <div className="block-row" key={userId ?? user.nickname ?? user.name}>
                    {user.avatarUrl || user.avatar ? (
                      <img className="avatar tiny" src={user.avatarUrl || user.avatar} alt="" />
                    ) : null}
                    <span>{user.nickname || user.name || "用户"}</span>
                    {userId && onRelationAction ? (
                      <button
                        className="icon-mini"
                        title="取消拉黑"
                        onClick={() => onRelationAction(userId, "unblock")}
                      >
                        <UserPlus size={15} />
                      </button>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </SettingGroup>

        <SettingGroup icon={Palette} title="外观主题" subtitle="用于导航、按钮和高亮信息的主题色。">
          <div className="theme-options">
            {themes.map((theme) => (
              <button className={activeTheme === theme.key ? "theme-choice active" : "theme-choice"} key={theme.key} onClick={() => onThemeChange(theme.key)}>
                <span style={{ background: theme.color }} />{theme.name}
              </button>
            ))}
          </div>
        </SettingGroup>
      </div>
    </section>
  );
}
