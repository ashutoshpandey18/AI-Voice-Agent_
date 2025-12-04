import { useAnalytics } from '../../hooks/useAdminApi';

/**
 * Dashboard Overview Page
 * Shows key metrics and statistics
 */
export default function DashboardPage() {
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

  const stats = [
    {
      label: 'Total Bookings',
      value: analytics?.totalBookings || 0,
      icon: '📋',
      color: 'bg-blue-500',
    },
    {
      label: 'Top Cuisine',
      value: analytics?.topCuisine || 'N/A',
      icon: '🍽️',
      color: 'bg-green-500',
    },
    {
      label: 'Peak Hour',
      value: analytics?.peakHour || 'N/A',
      icon: '⏰',
      color: 'bg-purple-500',
    },
    {
      label: 'Avg Guests',
      value: analytics?.averageGuestsPerBooking?.toFixed(1) || '0',
      icon: '👥',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Cuisine Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Cuisine Distribution
          </h3>
          <div className="space-y-3">
            {analytics?.cuisineDistribution?.slice(0, 5).map((cuisine: any, index: number) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {cuisine.cuisine}
                  </span>
                  <span className="text-sm text-gray-500">
                    {cuisine.count} ({cuisine.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${cuisine.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seating Preferences */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Seating Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-gray-700">Indoor</span>
              </div>
              <span className="text-lg font-bold text-gray-800">
                {analytics?.seatingPreferences?.indoor || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-700">Outdoor</span>
              </div>
              <span className="text-lg font-bold text-gray-800">
                {analytics?.seatingPreferences?.outdoor || 0}
              </span>
            </div>
          </div>

          {/* Visual representation */}
          <div className="mt-6">
            <div className="flex h-4 rounded-full overflow-hidden">
              <div
                className="bg-blue-500"
                style={{
                  width: `${
                    (analytics?.seatingPreferences?.indoor /
                      (analytics?.seatingPreferences?.indoor +
                        analytics?.seatingPreferences?.outdoor)) *
                      100 || 50
                  }%`,
                }}
              />
              <div className="bg-green-500 flex-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trends Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Quick Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl mb-2">📅</div>
            <div className="text-sm text-gray-500">Last 30 Days</div>
            <div className="text-xl font-bold text-gray-800">
              {analytics?.dailyTrends?.reduce((sum: number, day: any) => sum + day.count, 0) || 0}
            </div>
            <div className="text-xs text-gray-500">Total Bookings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">⭐</div>
            <div className="text-sm text-gray-500">Most Popular</div>
            <div className="text-xl font-bold text-gray-800">
              {analytics?.topCuisine || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Cuisine Choice</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🕐</div>
            <div className="text-sm text-gray-500">Busiest Time</div>
            <div className="text-xl font-bold text-gray-800">
              {analytics?.peakHour || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Peak Hour</div>
          </div>
        </div>
      </div>
    </div>
  );
}
