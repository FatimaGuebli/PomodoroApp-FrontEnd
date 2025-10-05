import { useState } from "react"
import supabase from "../utils/supabase"

export default function Auth() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    })
    if (error) setError(error.message)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Welcome 👋</h2>
        <p>Please log in to continue</p>

        <form style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button onClick={handleLogin} disabled={loading} style={styles.button}>
            Login
          </button>
          <button onClick={handleSignup} disabled={loading} style={styles.buttonOutline}>
            Sign Up
          </button>
        </form>

        <hr style={{ margin: "20px 0" }} />

        <button onClick={handleGoogleLogin} style={styles.googleButton}>
          Continue with Google
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "#f4f4f9",
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "300px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    background: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  buttonOutline: {
    padding: "10px",
    background: "transparent",
    color: "#6366f1",
    border: "1px solid #6366f1",
    borderRadius: "6px",
    cursor: "pointer",
  },
  googleButton: {
    padding: "10px",
    background: "#ea4335",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
  },
}
