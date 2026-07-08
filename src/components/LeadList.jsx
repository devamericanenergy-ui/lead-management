import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import LeadCard from './LeadCard.jsx'
import LeadForm from './LeadForm.jsx'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'due', label: 'Follow-up due' },
  { key: 'follow_up_scheduled', label: 'Scheduled' },
  { key: 'won', label: 'Won' },
  { key: 'lost', label: 'Lost' }
]

const SORTS = [
  { key: 'follow_up_asc', label: 'Follow-up (soonest)' },
  { key: 'follow_up_desc', label: 'Follow-up (latest)' },
  { key: 'status', label: 'Status' },
  { key: 'name', label: 'Customer name' },
  { key: 'created_asc', label: 'Newest first' },
  { key: 'created_desc', label: 'Oldest first' }
]

export default function LeadList({ profile }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('follow_up_asc')
  const [editingLead, setEditingLead] = useState(null) // null = closed, {} = new, {...} = edit
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    setLoading(true)
    // Get current session to ensure we have the JWT token
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Current session:', session ? `User: ${session.user.id}` : 'No session')
    
    // RLS on the `leads` table already restricts this to the current
    // salesperson's own rows (or all rows, if the profile role is admin).
    console.log('Fetching leads for user:', profile.id)
    const { data, error } = await supabase
      .from('leads')
      .select('*')

    if (error) {
      console.error('Error fetching leads:', error)
      setLoading(false)
      return
    }

    if (data) {
      console.log('Fetched leads:', data)
      // Sort client-side by follow_up_at so overdue/soonest leads
      // float to the top, with leads that have no follow-up date pushed last.
      const sorted = [...data].sort((a, b) => {
        if (!a.follow_up_at && !b.follow_up_at) return 0
        if (!a.follow_up_at) return 1
        if (!b.follow_up_at) return -1
        return new Date(a.follow_up_at) - new Date(b.follow_up_at)
      })
      console.log('Sorted leads:', sorted)
      setLeads(sorted)
    } else {
      console.log('No data returned from fetch')
    }
    setLoading(false)
  }

  async function handleSave(formValues) {
    setSaving(true)
    try {
      if (editingLead?.id) {
        const { error } = await supabase.from('leads').update(formValues).eq('id', editingLead.id)
        if (error) {
          console.error('Error updating lead:', error)
          setSaving(false)
          return
        }
      } else {
        console.log('Creating lead with created_by:', profile.id)
        const { error } = await supabase.from('leads').insert({ ...formValues, created_by: profile.id })
        if (error) {
          console.error('Error creating lead:', error)
          setSaving(false)
          return
        }
      }
      setSaving(false)
      setEditingLead(null)
      // Small delay to ensure Supabase syncs
      await new Promise(resolve => setTimeout(resolve, 500))
      await fetchLeads()
    } catch (err) {
      console.error('Caught error in handleSave:', err)
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this lead? This cannot be undone.')) return
    await supabase.from('leads').delete().eq('id', id)
    setEditingLead(null)
    fetchLeads()
  }

  const now = new Date()
  const visibleLeads = leads.filter((lead) => {
    if (filter === 'all') return true
    if (filter === 'due') return lead.follow_up_at && new Date(lead.follow_up_at) <= now
    return lead.status === filter
  })

  const sortedVisibleLeads = [...visibleLeads].sort((a, b) => {
    switch (sort) {
      case 'follow_up_asc':
        if (!a.follow_up_at && !b.follow_up_at) return 0
        if (!a.follow_up_at) return 1
        if (!b.follow_up_at) return -1
        return new Date(a.follow_up_at) - new Date(b.follow_up_at)
      case 'follow_up_desc':
        if (!a.follow_up_at && !b.follow_up_at) return 0
        if (!a.follow_up_at) return -1
        if (!b.follow_up_at) return 1
        return new Date(b.follow_up_at) - new Date(a.follow_up_at)
      case 'status':
        return a.status.localeCompare(b.status)
      case 'name':
        return a.customer_name.localeCompare(b.customer_name)
      case 'created_asc':
        return new Date(b.created_at) - new Date(a.created_at)
      case 'created_desc':
        return new Date(a.created_at) - new Date(b.created_at)
      default:
        return 0
    }
  })

  return (
    <div className="max-w-md mx-auto pb-24">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <p className="font-medium text-base">AE Leads</p>
          <p className="text-xs text-gray-500">
            {profile.name} · {profile.role === 'admin' ? 'Admin (all leads)' : 'Salesperson'} (ID: {profile.id.slice(0, 8)})
          </p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-xs text-gray-400"
        >
          Sign out
        </button>
      </div>

      <div className="flex gap-2 px-4 pb-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-xs px-3 py-1.5 rounded-md whitespace-nowrap ${
              filter === f.key
                ? 'bg-gray-900 text-white'
                : 'border border-gray-300 text-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-2">
        <label className="text-xs text-gray-500 block mb-1">Sort by</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full text-xs border border-gray-300 rounded-md px-2 py-1.5 bg-white"
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="px-4 flex flex-col gap-2 mt-2">
        {loading && <p className="text-sm text-gray-400 text-center py-8">Loading leads…</p>}

        {!loading && (
          <>
            <p className="text-xs text-gray-400 text-center">({leads.length} total, {sortedVisibleLeads.length} visible)</p>
            {sortedVisibleLeads.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No leads in this view.</p>
            )}
          </>
        )}

        {!loading &&
          sortedVisibleLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onEdit={setEditingLead} />
          ))}
      </div>

      <button
        onClick={() => setEditingLead({})}
        aria-label="Add lead"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gray-900 text-white text-2xl flex items-center justify-center shadow-lg"
      >
        +
      </button>

      {editingLead !== null && (
        <LeadForm
          lead={editingLead}
          saving={saving}
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={() => setEditingLead(null)}
        />
      )}
    </div>
  )
}
