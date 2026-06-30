'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch projects
      const projectsRes = await fetch('/api/projects');
      const projectsData = await projectsRes.json();
      const projects = projectsData.projects || [];

      // Fetch audits
      const auditsRes = await fetch('/api/audits?limit=5');
      const auditsData = await auditsRes.json();
      const audits = auditsData.audits || [];

      // Calculate stats
      const activeProjects = projects.filter((p: any) => p.status === 'active').length;
      const totalHealthScore = projects.reduce((sum: number, p: any) => sum + (p.health_score || 0), 0);
      const avgHealth = projects.length > 0 ? Math.round(totalHealthScore / projects.length) : 0;

      setStats({
        totalProjects: projects.length,
        activeProjects,
        totalAudits: auditsData.total || 0,
        averageHealthScore: avgHealth,
      });

      // Map audits with project names
      const auditsWithNames = audits.map((audit: any) => {
        const project = projects.find((p: any) => p.id === audit.site_id);
        return {
          ...audit,
          site_name: project?.name || 'Unknown Project',
        };
      });

      setRecentAudits(auditsWithNames);
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="mt-2 text-gray-600">
            Monitor your SEO projects and audit performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Projects */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalProjects}</div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.activeProjects} active
            </p>
          </div>

          {/* Active Projects */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Active Projects</h3>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.activeProjects}</div>
            <p className="text-xs text-gray-500 mt-2">
              Currently monitored
            </p>
          </div>

          {/* Total Audits */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Audits</h3>
              <span className="text-2xl">🔍</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats.totalAudits}</div>
            <p className="text-xs text-gray-500 mt-2">
              All time
            </p>
          </div>

          {/* Average Health Score */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Avg Health Score</h3>
              <span className="text-2xl">💚</span>
            </div>
            <div className={`text-3xl font-bold rounded-lg p-2 text-center ${getHealthColor(stats.averageHealthScore)}`}>
              {stats.averageHealthScore}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Across all projects
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Audits</h2>
            <button
              onClick={() => router.push('/dashboard/projects')}
              className="text-sm text-blue-600 hover:underline"
            >
              View All Projects →
            </button>
          </div>

          {recentAudits.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-gray-600 mb-4">No audits yet</p>
              <button
                onClick={() => router.push('/dashboard/projects/new')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">
                      Project
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">
                      Status
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
                    <tr key={audit.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {audit.site_name}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(audit.status)}`}>
                          {audit.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(audit.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => router.push(`/dashboard/projects/${audit.site_id}`)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          View Project
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
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/dashboard/projects/new')}
              className="bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium text-left flex items-center gap-3"
            >
              <span className="text-2xl">➕</span>
              <div>
                <div className="font-semibold">New Project</div>
                <div className="text-xs opacity-90">Add website to monitor</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/dashboard/projects')}
              className="bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 font-medium text-left flex items-center gap-3"
            >
              <span className="text-2xl">📊</span>
              <div>
                <div className="font-semibold">View Projects</div>
                <div className="text-xs opacity-70">All SEO projects</div>
              </div>
            </button>

            <button
              onClick={() => alert('Settings coming soon!')}
              className="bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 font-medium text-left flex items-center gap-3"
            >
              <span className="text-2xl">⚙️</span>
              <div>
                <div className="font-semibold">Settings</div>
                <div className="text-xs opacity-70">Configure dashboard</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
