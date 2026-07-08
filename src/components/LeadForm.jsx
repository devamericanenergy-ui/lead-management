import { useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'follow_up_scheduled', label: 'Follow-up scheduled' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' }
]

const SOURCE_OPTIONS = ['referral', 'walk-in', 'website', 'other']

function toLocalDatetimeInput(value) {
  if (!value) return ''
  const d = new Date(value)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function LeadForm({ lead, onSave, onCancel, onDelete, saving }) {
  const isEdit = Boolean(lead?.id)

  const [form, setForm] = useState({
    customer_name: lead?.customer_name || '',
    customer_phone: lead?.customer_phone || '',
    address: lead?.address || '',
    source: lead?.source || 'referral',
    status: lead?.status || 'new',
    notes: lead?.notes || '',
    follow_up_at: toLocalDatetimeInput(lead?.follow_up_at)
  })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      ...form,
      follow_up_at: form.follow_up_at ? new Date(form.follow_up_at).toISOString() : null
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-xl p-5 max-h-[90vh] overflow-y-auto"
      >
        <p className="font-medium text-sm mb-4">{isEdit ? 'Edit lead' : 'Add lead'}</p>

        <label className="text-xs text-gray-500">Customer name</label>
        <input
          required
          value={form.customer_name}
          onChange={(e) => update('customer_name', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 mb-3"
        />

        <label className="text-xs text-gray-500">Phone</label>
        <input
          value={form.customer_phone}
          onChange={(e) => update('customer_phone', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 mb-3"
        />

        <label className="text-xs text-gray-500">Address</label>
        <input
          value={form.address}
          onChange={(e) => update('address', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 mb-3"
        />

        <label className="text-xs text-gray-500">Source</label>
        <select
          value={form.source}
          onChange={(e) => update('source', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 mb-3"
        >
          {SOURCE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <label className="text-xs text-gray-500">Status</label>
        <select
          value={form.status}
          onChange={(e) => update('status', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 mb-3"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <label className="text-xs text-gray-500">Next follow-up</label>
        <input
          type="datetime-local"
          value={form.follow_up_at}
          onChange={(e) => update('follow_up_at', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 mb-3"
        />

        <label className="text-xs text-gray-500">Notes</label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 mb-4"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gray-900 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-gray-300 rounded-md py-2 text-sm"
          >
            Cancel
          </button>
        </div>

        {isEdit && (
          <button
            type="button"
            onClick={() => onDelete(lead.id)}
            className="w-full text-red-600 text-sm mt-3 py-2"
          >
            Delete lead
          </button>
        )}
      </form>
    </div>
  )
}
