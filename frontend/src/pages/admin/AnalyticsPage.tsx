import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAnalytics } from '../../hooks/useAdminApi';

/**
 * Analytics Page
 * Charts and visualizations for booking data
 */
export default function AnalyticsPage() {
  const { data, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Failed to load analytics. Please try again.
      </div>
    );
  }

  const analytics = data?.data;

  // Prepare data for charts
  const peakHoursData = analytics?.peakHours?.filter((h: any) => h.count > 0) || [];

  const cuisineData = analytics?.cuisineDistribution?.map((c: any) => ({
    name: c.cuisine,
    value: c.count,
  })) || [];

  const dailyTrendsData = analytics?.dailyTrends?.map((d: any) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: d.count,
  })) || [];

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  return (
    <div className="space-y-8">
      {/* Peak Hours Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-6">
          Peak Hours Distribution
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={peakHoursData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="label"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar
              dataKey="count"
              fill="#3B82F6"
              radius={[8, 8, 0, 0]}
              name="Bookings"
            />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Most popular booking hours throughout the day
        </p>
      </div>

      {/* Cuisine Distribution & Daily Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cuisine Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Cuisine Preferences
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={cuisineData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {cuisineData.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Distribution of cuisine preferences
          </p>
        </div>

        {/* Daily Trends Line Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Daily Booking Trends (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={dailyTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 4 }}
                activeDot={{ r: 6 }}
                name="Bookings"
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Booking volume over the past month
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-6">
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="text-sm text-gray-500 mb-1">Total Bookings</div>
            <div className="text-3xl font-bold text-gray-800">
              {analytics?.totalBookings || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              All time reservations
            </div>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <div className="text-sm text-gray-500 mb-1">Top Cuisine</div>
            <div className="text-3xl font-bold text-gray-800">
              {analytics?.topCuisine || 'N/A'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Most requested cuisine type
            </div>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <div className="text-sm text-gray-500 mb-1">Peak Hour</div>
            <div className="text-3xl font-bold text-gray-800">
              {analytics?.peakHour || 'N/A'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Busiest reservation time
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
