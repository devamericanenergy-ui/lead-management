import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-6"
      >
        <h1 className="text-lg font-medium mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500 mb-5">Sign in with your salesperson account</p>

        <label className="text-xs text-gray-500">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 mb-3"
          placeholder="name@americanenergy.in"
        />

        <label className="text-xs text-gray-500">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 mb-4"
          placeholder="••••••••"
        />

        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Accounts are created by the admin — contact your manager if you don't have one yet.
        </p>
      </form>
    </div>
  )
}
