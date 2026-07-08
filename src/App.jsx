import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Login from './components/Login.jsx'
import LeadList from './components/LeadList.jsx'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setProfile(null)
      setProfileError(false)
      return
    }
    // profiles row is auto-created by the handle_new_user() trigger on
    // signup — RLS ensures a user can only fetch their own profile.
    const timeout = setTimeout(() => {
      console.warn('Profile load timeout for user:', session.user.id)
      setProfileError(true)
    }, 3000)

    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .then(({ data, error }) => {
        clearTimeout(timeout)
        if (error) {
          console.error('Error fetching profile:', error.message, error.code)
          console.error('User ID:', session.user.id)
          setProfileError(true)
          return
        }
        if (data && data.length > 0) {
          console.log('Profile loaded:', data[0])
          setProfile(data[0])
          setProfileError(false)
        } else {
          console.error('No profile found for user ID:', session.user.id)
          setProfileError(true)
        }
      })
      .catch((err) => {
        clearTimeout(timeout)
        console.error('Caught error:', err)
        setProfileError(true)
      })
  }, [session])

  if (loading) return null
  if (!session) return <Login />
  
  // If profile loaded, show the app
  if (profile) return <LeadList profile={profile} />
  
  // If profile failed to load but we have a session, still try to show the app
  // This prevents infinite "Loading profile..." state
  if (profileError && session) {
    console.log('Profile failed to load, showing app with fallback profile')
    const fallbackProfile = { id: session.user.id, name: session.user.email, role: 'salesperson' }
    return <LeadList profile={fallbackProfile} />
  }

  return <p className="text-center text-sm text-gray-400 mt-10">Loading profile…</p>
}
