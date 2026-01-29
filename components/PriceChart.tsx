
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { PricePoint } from '../types';

interface PriceChartProps {
  data: PricePoint[];
}

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  return (
    <div className="h-[300px] w-full bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
      <h3 className="text-zinc-400 text-sm font-medium mb-4 uppercase tracking-wider">Market Overview (GCN/USD)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
          <XAxis 
            dataKey="time" 
            stroke="#71717a" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            stroke="#71717a" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#f59e0b' }}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#f59e0b" 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
