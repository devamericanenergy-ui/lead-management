import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ojprmdiotprzpaqtfjlp.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qcHJtZGlvdHByenBhcXRmamxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzQ5ODIyNywiZXhwIjoyMDk5MDc0MjI3fQ.QnNQc2xTNlBYZnhnR1BScnRIT2t6M0I3OHhxZk85OEJDMXlzaWN1UUFjSkU'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function updateAdminRole() {
  try {
    // First, get the user ID for pranav.american@gmail.com
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return
    }

    const pranav = users.find(u => u.email === 'pranav.american@gmail.com')
    
    if (!pranav) {
      console.error('User pranav.american@gmail.com not found')
      return
    }

    console.log(`Found user: ${pranav.email} with ID: ${pranav.id}`)

    // Update the profile role to admin
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', pranav.id)

    if (error) {
      console.error('Error updating profile:', error)
      return
    }

    console.log('✅ Successfully updated pranav.american@gmail.com to admin role')
  } catch (err) {
    console.error('Error:', err)
  }
}

updateAdminRole()
