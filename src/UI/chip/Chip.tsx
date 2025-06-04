import { FC } from 'react'

interface ChipProps {
  risk: string
}

const Chip: FC<ChipProps> = ({ risk }) => {
  const base = 'px-2 py-1 rounded-full text-xs font-semibold border'
  const styles = {
    L: 'text-green-600 border-green-600',
    M: 'text-yellow-600 border-yellow-600',
    H: 'text-orange-600 border-orange-600',
    C: 'text-red-600 border-red-600',
  }
  const riskStyle = styles[risk as keyof typeof styles] || 'text-gray-600 border-gray-600'

  return <span className={`${base} ${riskStyle}`}>{risk}</span>
}

export default Chip