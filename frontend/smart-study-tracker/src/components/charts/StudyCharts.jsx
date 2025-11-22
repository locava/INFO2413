import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import './StudyCharts.css';

// Modern color palette
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  gradient: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']
};

// Weekly Study Time Bar Chart
export function WeeklyStudyChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No data available</div>;
  }

  const chartData = data.map(day => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    hours: parseFloat((day.minutes / 60).toFixed(1)),
    focus: day.focus_score
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0.6}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
          formatter={(value, name) => [name === 'hours' ? `${value} hrs` : `${value}%`, name === 'hours' ? 'Study Time' : 'Focus Score']}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Bar dataKey="hours" fill="url(#colorHours)" radius={[8, 8, 0, 0]} name="Study Time" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Focus Score Line Chart
export function FocusScoreChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No data available</div>;
  }

  const chartData = data.map(day => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    score: day.focus_score
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[0, 100]} label={{ value: 'Focus %', angle: -90, position: 'insideLeft' }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
          formatter={(value) => [`${value}%`, 'Focus Score']}
        />
        <Area type="monotone" dataKey="score" stroke={COLORS.success} fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Course Distribution Pie Chart
export function CourseDistributionChart({ courses }) {
  if (!courses || courses.length === 0) {
    return <div className="chart-empty">No course data available</div>;
  }

  const chartData = courses.map(course => ({
    name: course.course_name,
    value: parseFloat(course.hours.toFixed(1))
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS.gradient[index % COLORS.gradient.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} hrs`, 'Study Time']} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Monthly Trend Chart
export function MonthlyTrendChart({ hoursPerWeek, focusScores }) {
  if (!hoursPerWeek || hoursPerWeek.length === 0) {
    return <div className="chart-empty">No monthly data available</div>;
  }

  const chartData = hoursPerWeek.map((hours, index) => ({
    week: `Week ${index + 1}`,
    hours: hours,
    focus: focusScores?.[index] || 0
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="week" stroke="#6b7280" style={{ fontSize: '12px' }} />
        <YAxis yAxisId="left" stroke="#6b7280" style={{ fontSize: '12px' }} label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
        <YAxis yAxisId="right" orientation="right" stroke="#6b7280" style={{ fontSize: '12px' }} domain={[0, 100]} label={{ value: 'Focus %', angle: 90, position: 'insideRight' }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="hours" stroke={COLORS.primary} strokeWidth={3} name="Study Hours" dot={{ r: 5 }} />
        <Line yAxisId="right" type="monotone" dataKey="focus" stroke={COLORS.success} strokeWidth={3} name="Focus Score" dot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

