'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { Project } from '@/lib/validations/project.schema';

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      const data = await response.json();
      setProject(data.project);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      router.push('/dashboard/projects');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const [isRunningAudit, setIsRunningAudit] = useState(false);

  const handleRunAudit = async () => {
    if (!confirm('Run SEO audit for this project?')) return;

    try {
      setIsRunningAudit(true);
      const response = await fetch('/api/audits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          site_id: projectId,
          audit_type: 'full',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start audit');
      }

      const data = await response.json();
      alert(`Audit started! Job ID: ${data.audit.id}`);

      // Refresh project data
      fetchProject();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start audit');
    } finally {
      setIsRunningAudit(false);
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
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || 'Project not found'}
          </div>
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="mt-4 text-blue-600 hover:underline"
          >
            ← Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"
          >
            ← Back to Projects
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                {project.url}
                <span className="text-xs">↗</span>
              </a>
              {project.description && (
                <p className="mt-3 text-gray-600">{project.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={handleRunAudit}
              disabled={isRunningAudit}
              className="bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunningAudit ? '⏳ Starting...' : '🔍 Run SEO Audit'}
            </button>
            <button
              onClick={() => router.push(`/dashboard/projects/${projectId}/edit`)}
              className="bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 font-medium"
            >
              ✏️ Edit Project
            </button>
            <button
              onClick={() => alert('Archive feature coming soon!')}
              className="bg-yellow-50 text-yellow-700 py-3 px-4 rounded-md hover:bg-yellow-100 font-medium"
            >
              📦 Archive
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-50 text-red-700 py-3 px-4 rounded-md hover:bg-red-100 font-medium"
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Health Score */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Health Score</h3>
              <span className="text-2xl">💚</span>
            </div>
            <div className={`text-4xl font-bold ${getHealthColor(project.health_score)} rounded-lg p-3 text-center`}>
              {project.health_score}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {project.health_score >= 80 ? 'Excellent' :
               project.health_score >= 60 ? 'Good' :
               project.health_score >= 40 ? 'Needs Work' : 'Critical'}
            </p>
          </div>

          {/* Last Audit */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Last Audit</h3>
              <span className="text-2xl">🕐</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {project.last_audit_at
                ? new Date(project.last_audit_at).toLocaleDateString()
                : 'Never'
              }
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {project.last_audit_at
                ? `${Math.floor((Date.now() - new Date(project.last_audit_at).getTime()) / (1000 * 60 * 60 * 24))} days ago`
                : 'No audits yet'
              }
            </p>
          </div>

          {/* Total Audits */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Audits</h3>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <p className="text-xs text-gray-500 mt-2">All time</p>
          </div>

          {/* Backlinks */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Backlinks</h3>
              <span className="text-2xl">🔗</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <p className="text-xs text-gray-500 mt-2">Discovered</p>
          </div>
        </div>

        {/* Recent Audits */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Audits</h2>

          {/* Empty State */}
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No audits yet</h3>
            <p className="text-gray-600 mb-6">
              Run your first SEO audit to start monitoring this project
            </p>
            <button
              onClick={handleRunAudit}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Run First Audit
            </button>
          </div>
        </div>

        {/* Project Info */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Project ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{project.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(project.created_at).toLocaleString()}
              </dd>
            </div>
            {project.updated_at && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(project.updated_at).toLocaleString()}
                </dd>
              </div>
            )}
            {project.workspace_id && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Workspace ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{project.workspace_id}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
