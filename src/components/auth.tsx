import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Checkbox, FormControlLabel, IconButton, InputAdornment, Link, Stack, TextField, Typography } from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import MarkEmailReadOutlined from "@mui/icons-material/MarkEmailReadOutlined";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";

export type AuthView = "login" | "forgot" | "reset" | "sent" | "complete";
const COPY = {
  login: { title: "Welcome back", subtitle: "Sign in to your solar, electricity, water and gas metering dashboard." },
  forgot: { title: "Reset your password", subtitle: "Enter your registered email address to receive a secure password reset link." },
  reset: { title: "Choose a new password", subtitle: "Make it memorable for you and hard to guess for anyone else." },
  sent: { title: "Check your inbox", subtitle: "Your next step toward getting back to your dashboard." },
  complete: { title: "You're all set", subtitle: "Return to sign in with your new password." },
};

export function AuthForm({ view, gallery = false }: { view: AuthView; gallery?: boolean }) {
  const [current, setCurrent] = useState(view);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loginPreview, setLoginPreview] = useState(false);
  const heading = useRef<HTMLDivElement>(null);
  const previous = useRef(current);
  useEffect(() => {
    if (previous.current !== current) heading.current?.focus();
    previous.current = current;
  }, [current]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (current === "reset" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    // ponytail: UI preview only; wire verified auth endpoints before creating sessions or sending reset links.
    if (current === "login") setLoginPreview(true);
    else {
      setPassword("");
      setConfirm("");
      setVisible(false);
      setCurrent(current === "forgot" ? "sent" : "complete");
    }
  }

  const passwordToggle = (
    <InputAdornment position="end">
      <IconButton aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible}
        onClick={() => setVisible(!visible)} edge="end" sx={{ minWidth: (t) => t.spacing(5.5), minHeight: (t) => t.spacing(5.5) }}>
        {visible ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" />}
      </IconButton>
    </InputAdornment>
  );
  /* Caps Lock is the commonest reason a correct password fails, and the field masks it. */
  const capsWatch = {
    onKeyDown: (e: KeyboardEvent) => setCapsLock(e.getModifierState("CapsLock")),
    onKeyUp: (e: KeyboardEvent) => setCapsLock(e.getModifierState("CapsLock")),
    onBlur: () => setCapsLock(false),
  };
  const caps = capsLock ? "Caps Lock is on." : "";
  const finished = current === "sent" || current === "complete";
  const content = (
    <Stack component="form" onSubmit={submit} sx={{ gap: { xs: 1.5, md: 2.5 }, "& .MuiInputBase-root, & .MuiButton-root": { minHeight: (t) => t.spacing(6) }, "& .MuiCheckbox-root": { minWidth: (t) => t.spacing(5.5), minHeight: (t) => t.spacing(5.5) } }}>
      {finished ? (
        <>
          <Box sx={(t) => ({ color: t.palette.success.dark, bgcolor: t.palette.success.light, width: t.spacing(8), height: t.spacing(8), borderRadius: 2, display: "grid", placeItems: "center" })}>
            {current === "sent" ? <MarkEmailReadOutlined fontSize="large" /> : <CheckCircleOutlineRounded fontSize="large" />}
          </Box>
          {current === "sent" && <Typography sx={{ color: "text.secondary", overflowWrap: "anywhere" }}>
            If an account exists for <Box component="strong" dir="ltr" sx={{ color: "text.primary", unicodeBidi: "isolate" }}>{email || "your email address"}</Box>, you’ll receive a link to reset your password. Check your spam folder too.
          </Typography>}
          <Alert severity="info">{current === "sent" ? "Preview only. No email has been sent." : "Preview only. No password has been changed."}</Alert>
          <Button component={RouterLink} to="/login" variant="contained" fullWidth size="large">Back to Login</Button>
          {current === "sent" && <Button onClick={() => setCurrent("forgot")} color="inherit" size="large" sx={{ color: "text.primary" }}>Use a different email</Button>}
        </>
      ) : (
        <>
          {current !== "reset" && <TextField required fullWidth label={current === "login" ? "Email or username" : "Email address"}
            name={current === "login" ? "username" : "email"} type={current === "login" ? "text" : "email"}
            autoComplete={current === "login" ? "username" : "email"} value={email} onChange={(e) => setEmail(e.target.value)}
            slotProps={{ htmlInput: { dir: "ltr", maxLength: 254, autoCapitalize: "none", spellCheck: false } }} />}
          {current !== "forgot" && <TextField required fullWidth label={current === "login" ? "Password" : "New password"}
            name="password" type={visible ? "text" : "password"} autoComplete={current === "login" ? "current-password" : "new-password"}
            value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} {...capsWatch}
            helperText={current === "reset" ? `${caps} Use at least 12 characters.`.trim() : caps || undefined}
            slotProps={{ input: { endAdornment: passwordToggle }, htmlInput: { dir: "ltr", ...(current === "reset" ? { minLength: 12 } : {}) } }} />}
          {current === "reset" && <TextField required fullWidth label="Confirm password" name="confirmPassword"
            type={visible ? "text" : "password"} autoComplete="new-password" value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError(""); }} {...capsWatch} error={Boolean(error)} helperText={error || caps || undefined}
            slotProps={{ htmlInput: { dir: "ltr", minLength: 12, "aria-invalid": Boolean(error) } }} />}
          {current === "login" && <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
            <FormControlLabel control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />} label="Remember me" sx={{ mr: 0 }} />
            <Link component={RouterLink} to="/forgot-password" underline="hover" sx={{ py: 1.5, color: "text.primary", fontWeight: 600 }}>Forgot Password?</Link>
          </Stack>}
          <Button type="submit" fullWidth variant="contained" size="large" endIcon={current === "login" ? <ArrowForwardRounded /> : undefined}
            sx={(t) => ({ minHeight: t.spacing(6), transition: t.transitions.create(["background-color", "box-shadow"]), "&:hover": { boxShadow: t.shadows[2] }, "@media (prefers-reduced-motion: reduce)": { transition: "none" } })}>
            {current === "login" ? "Sign In" : current === "forgot" ? "Send Reset Link" : "Reset Password"}
          </Button>
          {current === "login" ? loginPreview
            ? <Alert severity="info">Sign-in is not connected yet. No session was created. <Link component={RouterLink} to="/overview" color="inherit">Explore the dashboard</Link></Alert>
            : <Link component={RouterLink} to="/overview" underline="hover" sx={{ textAlign: "center", color: "text.secondary", py: 1.5 }}>Explore the dashboard</Link>
            : <Button component={RouterLink} to="/login" color="inherit" startIcon={<ArrowBackRounded />} size="large" sx={{ color: "text.secondary" }}>Back to Login</Button>}
        </>
      )}
    </Stack>
  );

  return <Box ref={heading} tabIndex={-1} sx={{ minWidth: 0, outline: "none" }}>
    {/* Its own heading rather than WsPage: that would pull the whole workspace chunk (~31 KB gz) onto the login route. */}
    <Stack sx={{ gap: gallery ? 3 : 2.5 }}>
      <Box>
        <Typography variant={gallery ? "h3" : "h2"} component={gallery ? "h2" : "h1"}>{COPY[current].title}</Typography>
        <Typography sx={{ mt: gallery ? 1 : 1.5, color: "text.secondary" }}>{COPY[current].subtitle}</Typography>
      </Box>
      {content}
    </Stack>
  </Box>;
}
