import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.jsx'
import { auth as authApi } from '../api/client.js'
import { AppBar } from '../components/AppBar.jsx'
import { Button, Field } from '../components/ui.jsx'
import { UserIcon, MailIcon, GoogleIcon, GitHubIcon, TwitterIcon } from '../components/icons.jsx'

function badResponse(message) {
  return <p className="form-error" role="alert">{message}</p>
}

function AuthShell({ eyebrow, title, children, footer }) {
  return (
    <>
      <AppBar eyebrow={eyebrow} title={title} back="/" />
      <div className="page auth-page">
        <div className="auth-page__content">
          <div className="card auth-card" data-reveal>
            {children}
          </div>
          {footer ? <p className="auth-foot muted">{footer}</p> : null}
        </div>
      </div>
    </>
  )
}

export function LoginPage() {
  const { login, session } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setErr('Enter a valid email address.'); return }
    setErr('')
    setBusy(true)
    try {
      await login(email.trim(), password)
      navigate(location.state?.from || '/', { replace: true })
    } catch (error) {
      setErr(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Diecet Gardage"
      title="Sign in"
      footer={
        <>
          New here? <Link className="link" to="/signup">Create an account</Link>
        </>
      }
    >
      <div className="auth-card__head">
        <span className="auth-card__icon"><MailIcon size={18} /></span>
        <p>Sign in with your email and password.</p>
      </div>

      {session.error && !err ? badResponse(session.error) : null}

      <form className="form" onSubmit={submit}>
        <Field label="Email" htmlFor="li-email">
          <input id="li-email" className="input" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password" htmlFor="li-pass">
          <input id="li-pass" className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <div className="row end">
          <Link className="link" to="/forgot">Forgot password?</Link>
        </div>
        {err ? badResponse(err) : null}
        <Button type="submit" full disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>
      </form>
    </AuthShell>
  )
}

export function SignupPage() {
  const { signup } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [socialMsg, setSocialMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const social = (name) => setSocialMsg(`${name} sign-up is not connected yet.`)
  const googleStart = async () => {
    setSocialMsg('')
    try {
      const res = await authApi.googleStart()
      window.location.assign(res.url)
    } catch (error) {
      setSocialMsg(error.message)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (form.password.length < 8) { setErr('Password must be at least 8 characters.'); return }
    setBusy(true)
    try {
      const _user = await signup(form.name.trim(), form.email.trim(), form.password)
      navigate(location.state?.from || '/', { replace: true })
    } catch (error) {
      setErr(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Diecet Gardage"
      title="Create account"
      footer={
        <>
          Already registered? <Link className="link" to="/login">Sign in</Link>
        </>
      }
    >
      <div className="auth-card__head">
        <span className="auth-card__icon"><UserIcon size={18} /></span>
        <p>Your vault, finds and auctions become private to this account. Passwords are hashed and never stored in your browser.</p>
      </div>

      <div className="social-auth">
        <button type="button" className="btn btn--ghost social-auth__btn" onClick={googleStart}>
          <GoogleIcon size={18} />
          <span>Continue with Google</span>
        </button>
        <button type="button" className="btn btn--ghost social-auth__btn" onClick={() => social('GitHub')}>
          <GitHubIcon size={18} />
          <span>Continue with GitHub</span>
        </button>
        <button type="button" className="btn btn--ghost social-auth__btn" onClick={() => social('Twitter')}>
          <TwitterIcon size={18} />
          <span>Continue with Twitter</span>
        </button>
        {socialMsg ? <p className="social-auth__note" role="status">{socialMsg}</p> : null}
      </div>

      <div className="social-auth__divider"><span>or</span></div>

      <form className="form" onSubmit={submit}>
        <Field label="Display name" htmlFor="su-name">
          <input id="su-name" className="input" autoComplete="name" required value={form.name} onChange={set('name')} placeholder="Ada Ferrer" />
        </Field>
        <Field label="Email" htmlFor="su-email">
          <input id="su-email" className="input" type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
        </Field>
        <Field label="Password" hint="At least 8 characters." htmlFor="su-pass">
          <input id="su-pass" className="input" type="password" autoComplete="new-password" required value={form.password} onChange={set('password')} />
        </Field>
        {err ? badResponse(err) : null}
        <Button type="submit" full disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</Button>
      </form>
    </AuthShell>
  )
}

export function PasswordResetPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('request') // request | reset
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const requestReset = async (e) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const res = await authApi.forgot(email.trim())
      setMsg(res.message)
      if (res.devToken) setToken(res.devToken)
      setStep('reset')
    } catch (error) {
      setErr(error.message)
    } finally {
      setBusy(false)
    }
  }

  const reset = async (e) => {
    e.preventDefault()
    setErr('')
    if (password.length < 8) { setErr('Password must be at least 8 characters.'); return }
    setBusy(true)
    try {
      const res = await authApi.reset(token.trim(), password)
      setMsg(res.message)
      navigate('/login', { replace: true })
    } catch (error) {
      setErr(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Diecet Gardage"
      title="Reset password"
      footer={<Link className="link" to="/login">Back to sign in</Link>}
    >
      <div className="auth-card__head">
        <span className="auth-card__icon"><MailIcon size={18} /></span>
        <p>A reset token is emailed (in dev it is returned right here by the local API).</p>
      </div>

      {msg ? <p className="toast" role="status">{msg}</p> : null}
      {err ? badResponse(err) : null}

      {step === 'request' ? (
        <form className="form" onSubmit={requestReset}>
          <Field label="Account email" htmlFor="fr-email">
            <input id="fr-email" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Button type="submit" full disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</Button>
        </form>
      ) : (
        <form className="form" onSubmit={reset}>
          <Field label="Reset token (from email / dev log)" htmlFor="fr-token">
            <input id="fr-token" className="input" required value={token} onChange={(e) => setToken(e.target.value)} />
          </Field>
          <Field label="New password" hint="At least 8 characters." htmlFor="fr-pass">
            <input id="fr-pass" className="input" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Button type="submit" full disabled={busy}>{busy ? 'Resetting…' : 'Set new password'}</Button>
        </form>
      )}
    </AuthShell>
  )
}
export default function AuthPage({ pageKey = "login" }) {
  if (pageKey === "signup") return <SignupPage />
  if (pageKey === "forgot") return <PasswordResetPage />
  return <LoginPage />
}
