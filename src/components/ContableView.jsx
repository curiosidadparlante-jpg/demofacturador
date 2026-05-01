import StatsCards from './StatsCards'

export default function ContableView({ ventas, onCardClick }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg md:text-xl font-bold text-text-primary uppercase tracking-tight">
          Resumen Contable
        </h2>
        <p className="text-xs text-text-muted mt-1">
          Métricas fiscales y financieras de tu negocio
        </p>
      </div>

      <StatsCards ventas={ventas} onCardClick={onCardClick} />
    </div>
  )
}
