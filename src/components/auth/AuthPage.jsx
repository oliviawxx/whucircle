import { ShieldCheck, Student } from "@phosphor-icons/react";

export function AuthPage({
  activeTheme,
  mode,
  email,
  password,
  code,
  codeSent,
  onModeChange,
  onEmailChange,
  onPasswordChange,
  onCodeChange,
  onSendCode,
  onEnter,
}) {
  return (
    <main className={`auth-page theme-${activeTheme}`}>
      <section className="auth-brand-panel">
        <div className="auth-brand">
          <div className="brand-mark"><Student weight="duotone" size={34} /></div>
          <div><strong>WHU Circle</strong><span>武大校园圈</span></div>
        </div>
        <div className="auth-copy">
          <p>校园社交平台</p>
          <h1>在一个更清楚的空间里，记录、交流和找到彼此。</h1>
          <span>公开笔记、好友社交圈、频道讨论与聊天。</span>
        </div>
        <div className="auth-trust"><ShieldCheck size={22} /><span>注册使用校内邮箱验证</span></div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-tabs">
            {["登录", "注册"].map((item) => (
              <button className={mode === item ? "active" : ""} key={item} onClick={() => onModeChange(item)}>{item}</button>
            ))}
          </div>
          <div className="auth-heading">
            <p>{mode === "登录" ? "欢迎回来" : "创建校园账号"}</p>
            <h2>{mode === "登录" ? "登录 WHU Circle" : "使用校内邮箱注册"}</h2>
          </div>
          <label className="auth-field">
            <span>校内邮箱</span>
            <input value={email} onChange={(event) => onEmailChange(event.target.value)} placeholder="student@whu.edu.cn" />
          </label>
          {mode === "注册" && (
            <label className="auth-field">
              <span>邮箱验证码</span>
              <div className="code-field">
                <input value={code} onChange={(event) => onCodeChange(event.target.value)} placeholder="6 位验证码" />
                <button onClick={onSendCode}>{codeSent ? "已发送" : "发送"}</button>
              </div>
            </label>
          )}
          <label className="auth-field">
            <span>密码</span>
            <input type="password" value={password} onChange={(event) => onPasswordChange(event.target.value)} placeholder="至少 8 位" />
          </label>
          <button className="auth-submit" onClick={onEnter}>{mode === "登录" ? "登录" : "注册并进入"}</button>
          <button className="demo-entry" onClick={onEnter}>直接进入展示版</button>
        </div>
      </section>
    </main>
  );
}
