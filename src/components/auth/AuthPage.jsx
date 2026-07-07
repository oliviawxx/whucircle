import { ShieldCheck, Student } from "@phosphor-icons/react";

export function AuthPage({
  activeTheme, mode, email, password, passwordConfirm, code, codeSent,
  authError, authLoading, onModeChange, onEmailChange, onPasswordChange,
  onPasswordConfirmChange, onCodeChange, onSendCode, onEnter, onKeyDown,
  onDemoEntry, onForgotPassword,
}) {
  const needsCode = mode !== "登录";
  const passwordError = mode === "登录" && authError === "密码错误";
  const heading = mode === "登录" ? "登录 WHU Circle" : mode === "注册" ? "使用校内邮箱注册" : "通过邮箱找回密码";

  return (
    <main className={`auth-page theme-${activeTheme}`}>
      <section className="auth-brand-panel">
        <div className="auth-brand">
          <div className="brand-mark"><Student weight="duotone" size={34} /></div>
          <div><strong>WHU Circle</strong><span>武大校园圈</span></div>
        </div>
        <div className="auth-copy">
          <p>校园社交平台</p>
          <h1>在一个更清晰的空间里，记录、交流和找到彼此。</h1>
          <span>公开笔记、好友社交圈、频道讨论与聊天。</span>
        </div>
        <div className="auth-trust"><ShieldCheck size={22} /><span>注册使用校内邮箱验证</span></div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          {mode !== "找回密码" ? (
            <div className="auth-tabs">
              {["登录", "注册"].map((item) => (
                <button className={mode === item ? "active" : ""} key={item} onClick={() => onModeChange(item)}>{item}</button>
              ))}
            </div>
          ) : (
            <button className="auth-back" onClick={() => onModeChange("登录")}>返回登录</button>
          )}
          <div className="auth-heading">
            <p>{mode === "登录" ? "欢迎回来" : mode === "注册" ? "创建校园账号" : "验证你的校内邮箱"}</p>
            <h2>{heading}</h2>
          </div>
          {authError && <div className="auth-error">{authError}</div>}
          <label className="auth-field">
            <span>校内邮箱</span>
            <input value={email} onChange={(event) => onEmailChange(event.target.value)} placeholder="student@whu.edu.cn" />
          </label>
          {needsCode && (
            <label className="auth-field">
              <span>邮箱验证码</span>
              <div className="code-field">
                <input value={code} onChange={(event) => onCodeChange(event.target.value)} placeholder="6 位验证码" />
                <button onClick={onSendCode} disabled={authLoading}>{codeSent ? "已发送" : "发送"}</button>
              </div>
            </label>
          )}
          <label className="auth-field">
            <span>{mode === "找回密码" ? "新密码" : "密码"}</span>
            <input type="password" value={password} onChange={(event) => onPasswordChange(event.target.value)} placeholder="至少 8 位" onKeyDown={onKeyDown} />
          </label>
          {needsCode && (
            <label className="auth-field">
              <span>再次输入密码</span>
              <input type="password" value={passwordConfirm} onChange={(event) => onPasswordConfirmChange(event.target.value)} placeholder="再次输入相同密码" onKeyDown={onKeyDown} />
            </label>
          )}
          {passwordError && <button className="forgot-password" onClick={onForgotPassword}>找回密码</button>}
          <button className="auth-submit" onClick={onEnter} disabled={authLoading}>
            {authLoading ? "请稍候…" : mode === "登录" ? "登录" : mode === "注册" ? "注册并进入" : "重置密码"}
          </button>
          {mode !== "找回密码" && <button className="demo-entry" onClick={onDemoEntry} disabled={authLoading}>直接进入展示版</button>}
        </div>
      </section>
    </main>
  );
}
