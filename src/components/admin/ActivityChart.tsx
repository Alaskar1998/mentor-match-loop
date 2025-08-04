import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ActivityChartProps {
  data: Array<{
    date: string;
    exchanges: number;
  }>;
  title: string;
}

export const ActivityChart = ({ data, title }: ActivityChartProps) => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="exchanges" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}; 