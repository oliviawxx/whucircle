import { ShieldCheck } from "@phosphor-icons/react";

function SettingSegment({ label, value, options, onChange }) {
  return (
    <section className="setting-block">
      <div><strong>{label}</strong><span>{value}</span></div>
      <div className="segmented">
        {options.map((option) => (
          <button className={value === option ? "active" : ""} key={option} onClick={() => onChange(option)}>{option}</button>
        ))}
      </div>
    </section>
  );
}

export function SettingsPage({ privacy, onPrivacyChange, blockedUsers, themes, activeTheme, onThemeChange }) {
  return (
    <section className="section-card settings-page">
      <div className="section-head"><div><p>隐私与安全</p><h2>展示版设置中心</h2></div><ShieldCheck size={28} /></div>
      <SettingSegment label="笔记可见范围" value={privacy.noteVisibility} options={["公开", "好友可见", "私密"]} onChange={(value) => onPrivacyChange("noteVisibility", value)} />
      <SettingSegment label="频道权限" value={privacy.channelPermission} options={["公开", "密码"]} onChange={(value) => onPrivacyChange("channelPermission", value)} />
      <SettingSegment label="私信权限" value={privacy.messagePermission} options={["允许所有人", "仅好友", "不接收陌生人私信"]} onChange={(value) => onPrivacyChange("messagePermission", value)} />
      <section className="setting-block">
        <div><strong>黑名单</strong><span>拉黑后不能私信、评论、查看主页</span></div>
        <div className="block-list">{blockedUsers.map((name) => <span key={name}>{name}</span>)}</div>
      </section>
      <section className="setting-block">
        <div><strong>主题颜色</strong><span>用于导航、按钮和高亮信息</span></div>
        <div className="theme-options">
          {themes.map((theme) => (
            <button className={activeTheme === theme.key ? "theme-choice active" : "theme-choice"} key={theme.key} onClick={() => onThemeChange(theme.key)}>
              <span style={{ background: theme.color }} />{theme.name}
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}
