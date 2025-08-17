import React, { useState, useEffect } from 'react';
import { FileText, Heart, TrendingUp, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { documentService, handleApiError } from '../services/api';
import type { Document, DocumentUpload } from '../types';
import FileUpload from '../components/FileUpload';
import ActivityList from '../components/ActivityList';
import toast from 'react-hot-toast';

const DashboardHome: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    favoriteDocuments: 0,
    totalSize: 0,
    recentUploads: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const result = await documentService.getDocuments({ pageSize: 50 });
        updateStats(result.documents);
      } catch (error) {
        toast.error(handleApiError(error));
      }
    };
    load();
  }, []);

  const updateStats = (docs: Document[]) => {
    const totalSize = docs.reduce((sum, doc) => sum + doc.size, 0);
    const favoriteCount = docs.filter(doc => doc.isFavorite).length;
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7);
    const recentCount = docs.filter(doc => new Date(doc.createdAt) > recentDate).length;

    setStats({
      totalDocuments: docs.length,
      favoriteDocuments: favoriteCount,
      totalSize,
      recentUploads: recentCount,
    });
  };

  const handleUpload = async (upload: DocumentUpload): Promise<void> => {
    setIsUploading(true);
    try {
      await documentService.uploadDocument(upload);
      toast.success('Document téléchargé avec succès !');
      
      // Recharger les documents
      const result = await documentService.getDocuments({ pageSize: 50 });
      updateStats(result.documents);
    } catch (error) {
      toast.error(handleApiError(error));
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Bonjour, {state.user?.name} 👋
        </h1>
        <p className="text-base-content/60">
          Gérez vos documents en toute simplicité
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-box shadow-sm cursor-pointer hover:shadow-md transition-shadow"
             onClick={() => navigate('/dashboard/documents')}>
          <div className="stat-figure text-primary">
            <FileText className="w-8 h-8" />
          </div>
          <div className="stat-title">Documents</div>
          <div className="stat-value text-primary">{stats.totalDocuments}</div>
          <div className="stat-desc">Total de vos documents</div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow-sm cursor-pointer hover:shadow-md transition-shadow"
             onClick={() => navigate('/dashboard/favorites')}>
          <div className="stat-figure text-secondary">
            <Heart className="w-8 h-8" />
          </div>
          <div className="stat-title">Favoris</div>
          <div className="stat-value text-secondary">{stats.favoriteDocuments}</div>
          <div className="stat-desc">Documents favoris</div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow-sm">
          <div className="stat-figure text-accent">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="stat-title">Stockage</div>
          <div className="stat-value text-accent text-sm">{formatFileSize(stats.totalSize)}</div>
          <div className="stat-desc">Espace utilisé</div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow-sm">
          <div className="stat-figure text-info">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="stat-title">Récent</div>
          <div className="stat-value text-info">{stats.recentUploads}</div>
          <div className="stat-desc">Ajouts cette semaine</div>
        </div>
      </div>
      
      {/* Upload rapide */}
      <div className="bg-base-100 rounded-box p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Upload rapide</h2>
        <FileUpload 
          onUpload={handleUpload} 
          isUploading={isUploading} 
        />
      </div>

      {/* Aperçu de l'activité récente */}
      <div className="bg-base-100 rounded-box p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Activité récente</h2>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/dashboard/activity')}
          >
            Voir tout
          </button>
        </div>
        <div className="max-h-64 overflow-hidden">
          <ActivityList />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
