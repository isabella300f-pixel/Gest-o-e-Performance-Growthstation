'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface ConversionFunnelProps {
  meetingsScheduled: number
  meetingsCompleted: number
  contracts: number
  closing: number
}

export default function ConversionFunnel({
  meetingsScheduled,
  meetingsCompleted,
  contracts,
  closing,
}: ConversionFunnelProps) {
  const data = [
    {
      name: 'Reuniões Agendadas',
      value: meetingsScheduled,
      fill: '#8b5cf6',
    },
    {
      name: 'Reuniões Realizadas',
      value: meetingsCompleted,
      fill: '#10b981',
    },
    {
      name: 'Contratos Gerados',
      value: contracts,
      fill: '#f59e0b',
    },
    {
      name: 'Fechamentos',
      value: closing,
      fill: '#ef4444',
    },
  ].filter((item) => item.value > 0)

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return '0%'
    return ((value / total) * 100).toFixed(1) + '%'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Funil de Conversão
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={150} />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value.toLocaleString('pt-BR')} (${calculatePercentage(value, meetingsScheduled)})`,
              name,
            ]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {data.map((item, index) => {
          const prevValue = index > 0 ? data[index - 1].value : meetingsScheduled
          const conversion = prevValue > 0 ? ((item.value / prevValue) * 100).toFixed(1) : '0'
          return (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">{item.name}</p>
              <p className="text-lg font-semibold text-gray-900">{item.value.toLocaleString('pt-BR')}</p>
              {index > 0 && (
                <p className="text-xs text-gray-500">Conversão: {conversion}%</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

