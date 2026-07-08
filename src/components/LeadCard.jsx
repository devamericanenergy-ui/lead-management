function getBadge(lead) {
  if (lead.status === 'won') return { label: 'Won', className: 'badge-won' }
  if (lead.status === 'lost') return { label: 'Lost', className: 'badge-lost' }
  if (!lead.follow_up_at) return { label: lead.status.replace('_', ' '), className: 'badge-new' }

  const followUp = new Date(lead.follow_up_at)
  const now = new Date()
  const isToday = followUp.toDateString() === now.toDateString()

  if (followUp < now) return { label: 'Overdue', className: 'badge-overdue' }
  if (isToday) return { label: 'Today', className: 'badge-today' }
  return { label: 'Upcoming', className: 'badge-upcoming' }
}

function formatFollowUp(value) {
  if (!value) return 'No follow-up set'
  const d = new Date(value)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (isToday) return `Today, ${time}`
  return `${d.toLocaleDateString([], { day: '2-digit', month: 'short' })}, ${time}`
}

export default function LeadCard({ lead, onEdit }) {
  const badge = getBadge(lead)
  const overdue = badge.className === 'badge-overdue'

  return (
    <div className="border border-gray-200 rounded-xl p-3 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-sm">{lead.customer_name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {lead.customer_phone} {lead.source ? `· ${lead.source}` : ''}
          </p>
        </div>
        <span className={`badge ${badge.className}`}>{badge.label}</span>
      </div>

      <p className={`text-xs mt-2 ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
        {formatFollowUp(lead.follow_up_at)}
      </p>

      <button
        onClick={() => onEdit(lead)}
        className="w-full mt-3 border border-gray-300 rounded-md py-1.5 text-xs font-medium"
      >
        Edit lead
      </button>
    </div>
  )
}
