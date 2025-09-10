interface StatCardProps {
  icon: string
  title: string
  value: string | number
}

export default function StatCard({ icon, title, value }: StatCardProps) {
  return (
    <div className="stat-card">
      <i className={icon}></i>
      <div className="stat-info">
        <h3>{title}</h3>
        <span className="stat-number">{value}</span>
      </div>
    </div>
  )
}
