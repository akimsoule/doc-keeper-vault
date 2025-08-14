import { DocumentHeader } from '@/components/documents/DocumentHeader';
import { DocumentGrid } from '@/components/documents/DocumentGrid';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentUploadNotification } from '@/components/documents/DocumentUploadNotification';
import { useDocuments } from '@/contexts/UseContext';

const Dashboard = () => {
  const { viewMode = 'grid' } = useDocuments() || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <DocumentHeader />
        <div className="mt-4 sm:mt-8">
          {viewMode === 'grid' ? <DocumentGrid /> : <DocumentList />}
        </div>
      </div>
      <DocumentUploadNotification />
    </div>
  );
};

export default Dashboard;