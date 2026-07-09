import { useState } from "react";
import { ArrowLeft, CheckCircle, Eye, EyeSlash, ShieldCheck, Student } from "@phosphor-icons/react";

export function AuthPage({
  activeTheme,
  mode,
  email,
  password,
  passwordConfirm,
  code,
  codeSent,
  authError,
  authNotice,
  authLoading,
  onModeChange,
  onEmailChange,
  onPasswordChange,
  onPasswordConfirmChange,
  onCodeChange,
  onSendCode,
  onEnter,
  onKeyDown,
  onForgotPassword,
}) {
  const needsCode = mode !== "登录";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [stepError, setStepError] = useState("");

  const isForgotPassword = mode === "找回密码";
  const resetDone = isForgotPassword && authNotice;

  // 切换登录/注册时重置步骤
  function switchMode(next) {
    if (isForgotPassword) {
      setResetStep(1);
      setStepError("");
    }
    onModeChange(next);
  }

  function goResetStep2() {
    if (code.trim().length < 6) {
      setStepError("请输入完整的 6 位验证码");
      return;
    }
    setStepError("");
    setResetStep(2);
  }

  function backFromResetStep2() {
    setStepError("");
    setResetStep(1);
  }

  const heading =
    mode === "登录"
      ? "登录 WHU Circle"
      : mode === "注册"
        ? "使用校内邮箱注册"
        : resetStep === 1
          ? "验证你的校内邮箱"
          : "设置你的新密码";

  const subheading =
    mode === "登录"
      ? "欢迎回来"
      : mode === "注册"
        ? "创建校园账号"
        : resetStep === 1
          ? "我们将向你的校内邮箱发送验证码"
          : "请输入一个至少 8 位的新密码";

  return (
    <main className={`auth-page theme-${activeTheme}`}>
      <section className="auth-brand-panel">
        <div className="auth-brand">
          <div className="brand-mark">
            <Student weight="duotone" size={34} />
          </div>
          <div>
            <strong>WHU Circle</strong>
            <span>武大校园圈</span>
          </div>
        </div>
        <div className="auth-copy">
          <p>WHU Circle</p>
          <h1>东湖之滨，珞珈山上</h1>
          <span>用笔记记录你的武大日常，找到同频的人。</span>
        </div>
        <div className="auth-trust">
          <ShieldCheck size={22} />
          <span>用武大邮箱注册，确保这里都是自己人。</span>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          {/* ---- 顶部：Tab / 返回按钮 ---- */}
          {!isForgotPassword ? (
            <div className="auth-tabs">
              {["登录", "注册"].map((item) => (
                <button
                  className={mode === item ? "active" : ""}
                  key={item}
                  onClick={() => switchMode(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          ) : resetStep === 1 ? (
            <button className="auth-back" onClick={() => switchMode("登录")}>
              <ArrowLeft size={16} />
              返回登录
            </button>
          ) : (
            <button className="auth-back" onClick={backFromResetStep2}>
              <ArrowLeft size={16} />
              返回上一步
            </button>
          )}

          {/* ---- 步骤指示器（仅找回密码） ---- */}
          {isForgotPassword && (
            <div className="reset-steps">
              <div className={resetStep >= 1 ? "reset-step done" : "reset-step"}>
                {resetStep > 1 ? <CheckCircle size={16} weight="fill" /> : <span>1</span>}
                <em>验证邮箱</em>
              </div>
              <span className="reset-step-line" />
              <div className={resetStep >= 2 ? "reset-step done" : "reset-step"}>
                <span>2</span>
                <em>重设密码</em>
              </div>
            </div>
          )}

          {/* ---- 标题 ---- */}
          <div className="auth-heading">
            <p>{subheading}</p>
            <h2>{heading}</h2>
          </div>

          {/* ---- 全局错误 / 提示 ---- */}
          {authError && <div className="auth-error" key={authError}>{authError}</div>}
          {!resetDone && authNotice && <div className="auth-notice">{authNotice}</div>}
          {stepError && <div className="auth-error" key={`step-${stepError}`}>{stepError}</div>}

          {/* ---- 重置成功 ---- */}
          {resetDone ? (
            <div className="auth-success">
              <div className="auth-success-icon">
                <CheckCircle size={56} weight="fill" />
              </div>
              <h2>密码已重置</h2>
              <p>即将返回登录页面…</p>
            </div>
          ) : (
            <>

          {/* ---- Step 1 / 注册：邮箱 + 验证码 ---- */}
          {(resetStep === 1 || !isForgotPassword) && (
            <>
              <label className="auth-field">
                <span>校内邮箱</span>
                <input
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                  placeholder="student@whu.edu.cn"
                />
              </label>
              {needsCode && (
                <label className="auth-field">
                  <span>邮箱验证码</span>
                  <div className="code-field">
                    <input
                      value={code}
                      onChange={(event) => onCodeChange(event.target.value)}
                      placeholder="6 位验证码"
                    />
                    <button onClick={onSendCode} disabled={authLoading}>
                      {authLoading ? "发送中" : codeSent ? "重新发送" : "发送"}
                    </button>
                  </div>
                </label>
              )}
            </>
          )}

          {/* ---- 密码（登录 / Step2 / 注册） ---- */}
          {(!isForgotPassword || resetStep === 2) && (
            <label className="auth-field">
              <span>{isForgotPassword ? "新密码" : "密码"}</span>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                  placeholder="至少 8 位"
                  onKeyDown={onKeyDown}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "隐藏密码" : "显示密码"}
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
          )}

          {/* ---- 确认密码（注册 / Step2） ---- */}
          {needsCode && (!isForgotPassword || resetStep === 2) && (
            <label className="auth-field">
              <span>再次输入密码</span>
              <div className="password-field">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={passwordConfirm}
                  onChange={(event) => onPasswordConfirmChange(event.target.value)}
                  placeholder="再次输入相同密码"
                  onKeyDown={onKeyDown}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                  aria-label={showConfirm ? "隐藏密码" : "显示密码"}
                >
                  {showConfirm ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
          )}

          {/* ---- 忘记密码链接（仅登录） ---- */}
          {mode === "登录" && (
            <button className="forgot-password-link" onClick={onForgotPassword}>
              忘记密码？
            </button>
          )}

          {/* ---- 提交 / 下一步 ---- */}
          {isForgotPassword && resetStep === 1 ? (
            <button className="auth-submit" onClick={goResetStep2} disabled={authLoading}>
              下一步
            </button>
          ) : (
            <button className="auth-submit" onClick={onEnter} disabled={authLoading}>
              {authLoading
                ? "请稍等"
                : mode === "登录"
                  ? "登录"
                  : mode === "注册"
                    ? "注册并进入"
                    : "重置密码"}
            </button>
          )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
