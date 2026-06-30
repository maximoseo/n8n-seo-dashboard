'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalAudits: number;
  averageHealthScore: number;
}

interface RecentAudit {
  id: string;
  site_id: string;
  site_name: string;
  status: string;
  created_at: string;
  health_score?: number;
}

interface Project {
  id: string;
  name: string;
  status: string;
  health_score?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalAudits: 0,
    averageHealthScore: 0,
  });
  const [recentAudits, setRecentAudits] = useState<RecentAudit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch projects
      const projectsRes = await fetch('/api/projects');
      const projectsData = await projectsRes.json();
      const projectsList = projectsData.projects || [];

      // Fetch audits
      const auditsRes = await fetch('/api/audits?limit=10');
      const auditsData = await auditsRes.json();
      const audits = auditsData.audits || [];

      // Calculate stats
      const activeProjects = projectsList.filter((p: any) => p.status === 'active').length;
      const totalHealthScore = projectsList.reduce((sum: number, p: any) => sum + (p.health_score || 0), 0);
      const avgHealth = projectsList.length > 0 ? Math.round(totalHealthScore / projectsList.length) : 0;

      setStats({
        totalProjects: projectsList.length,
        activeProjects,
        totalAudits: auditsData.total || 0,
        averageHealthScore: avgHealth,
      });

      // Map audits with project names
      const auditsWithNames = audits.map((audit: any) => {
        const project = projectsList.find((p: any) => p.id === audit.site_id);
        return {
          ...audit,
          site_name: project?.name || 'Unknown Project',
          health_score: project?.health_score || 0,
        };
      });

      setRecentAudits(auditsWithNames);
      setProjects(projectsList);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Chart data
  const healthDistribution = [
    { name: 'Excellent (80-100)', value: projects.filter(p => (p.health_score || 0) >= 80).length, color: '#10b981' },
    { name: 'Good (60-79)', value: projects.filter(p => (p.health_score || 0) >= 60 && (p.health_score || 0) < 80).length, color: '#f59e0b' },
    { name: 'Fair (40-59)', value: projects.filter(p => (p.health_score || 0) >= 40 && (p.health_score || 0) < 60).length, color: '#f97316' },
    { name: 'Poor (0-39)', value: projects.filter(p => (p.health_score || 0) < 40).length, color: '#ef4444' },
  ];

  const statusDistribution = [
    { name: 'Active', value: projects.filter(p => p.status === 'active').length, color: '#10b981' },
    { name: 'Paused', value: projects.filter(p => p.status === 'paused').length, color: '#f59e0b' },
    { name: 'Archived', value: projects.filter(p => p.status === 'archived').length, color: '#6b7280' },
  ];

  const auditsTrend = recentAudits.slice(0, 7).reverse().map((audit, index) => ({
    name: `Audit ${index + 1}`,
    score: audit.health_score || 0,
    date: new Date(audit.created_at).toLocaleDateString(),
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Auto-Refresh Toggle */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="mt-2 text-gray-600">
              Monitor your SEO projects and audit performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchDashboardData()}
              className="bg-white shadow px-4 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <span className="text-xl">🔄</span>
              Refresh
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                autoRefresh
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-white shadow text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{autoRefresh ? '⚡' : '⏸️'}</span>
              Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Alerts Section */}
        {projects.some(p => (p.health_score || 0) < 60) && (
          <div className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 shadow rounded-lg p-6">
            <div className="flex items-start gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">Attention Required!</h3>
                <p className="text-red-700 mb-3">
                  {projects.filter(p => (p.health_score || 0) < 60).length} project(s) need immediate attention with low health scores.
                </p>
                <div className="flex flex-wrap gap-2">
                  {projects.filter(p => (p.health_score || 0) < 60).map(project => (
                    <button
                      key={project.id}
                      onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      {project.name} ({project.health_score || 0})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg rounded-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Projects</h3>
              <span className="text-3xl">📊</span>
            </div>
            <div className="text-4xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs opacity-75 mt-2">
              {stats.activeProjects} active
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 shadow-lg rounded-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Active Projects</h3>
              <span className="text-3xl">✅</span>
            </div>
            <div className="text-4xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs opacity-75 mt-2">
              Currently monitored
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg rounded-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Audits</h3>
              <span className="text-3xl">🔍</span>
            </div>
            <div className="text-4xl font-bold">{stats.totalAudits}</div>
            <p className="text-xs opacity-75 mt-2">
              All time
            </p>
          </div>

          <div className={`shadow-lg rounded-lg p-6 transform hover:scale-105 transition-transform ${
            stats.averageHealthScore >= 80
              ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
              : stats.averageHealthScore >= 60
              ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white'
              : 'bg-gradient-to-br from-red-500 to-red-600 text-white'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Avg Health Score</h3>
              <span className="text-3xl">💚</span>
            </div>
            <div className="text-4xl font-bold">
              {stats.averageHealthScore}
            </div>
            <p className="text-xs opacity-75 mt-2">
              Across all projects
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Health Distribution Pie Chart */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Health Score Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={healthDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {healthDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution Bar Chart */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📈</span>
              Project Status Overview
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audits Trend Line Chart */}
        {auditsTrend.length > 0 && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📉</span>
              Recent Audits Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={auditsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🕐</span>
              Recent Audits
            </h2>
            <button
              onClick={() => router.push('/dashboard/projects')}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              View All Projects →
            </button>
          </div>

          {recentAudits.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <div className="text-6xl mb-3">📋</div>
              <p className="text-gray-600 mb-4 text-lg">No audits yet</p>
              <button
                onClick={() => router.push('/dashboard/projects/new')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-md hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg transform hover:scale-105 transition-transform"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b-2 border-gray-200 bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">
                      Project
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">
                      Health Score
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">
                      Date
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase py-3 px-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentAudits.map((audit) => (
                    <tr key={audit.id} className="hover:bg-blue-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {audit.site_name}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(audit.status)}`}>
                          {audit.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded ${getHealthColor(audit.health_score || 0)}`}>
                          {audit.health_score || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(audit.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => router.push(`/dashboard/projects/${audit.site_id}`)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium hover:underline"
                        >
                          View Project →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/dashboard/projects/new')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-5 rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium text-left flex items-center gap-3 shadow-lg transform hover:scale-105 transition-transform"
            >
              <span className="text-3xl">➕</span>
              <div>
                <div className="font-semibold text-lg">New Project</div>
                <div className="text-sm opacity-90">Add website to monitor</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/dashboard/projects')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-5 rounded-lg hover:from-purple-700 hover:to-purple-800 font-medium text-left flex items-center gap-3 shadow-lg transform hover:scale-105 transition-transform"
            >
              <span className="text-3xl">📊</span>
              <div>
                <div className="font-semibold text-lg">View Projects</div>
                <div className="text-sm opacity-90">All SEO projects</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/dashboard/settings')}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-5 rounded-lg hover:from-gray-700 hover:to-gray-800 font-medium text-left flex items-center gap-3 shadow-lg transform hover:scale-105 transition-transform"
            >
              <span className="text-3xl">⚙️</span>
              <div>
                <div className="font-semibold text-lg">Settings</div>
                <div className="text-sm opacity-90">Configure dashboard</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
