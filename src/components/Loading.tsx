import React from 'react';
import { Loader2, Upload, Search, RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  type?: 'default' | 'upload' | 'search' | 'refresh';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  type = 'default',
  message,
  className = '',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'upload':
        return Upload;
      case 'search':
        return Search;
      case 'refresh':
        return RefreshCw;
      default:
        return Loader2;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };

  const Icon = getIcon();

  return (
    <div className={`flex items-center gap-3 ${className}`} role="status" aria-live="polite">
      <Icon className={`${getSizeClasses()} animate-spin text-primary`} aria-hidden="true" />
      {message && (
        <span className="text-sm text-base-content/70">{message}</span>
      )}
      <span className="sr-only">Chargement en cours...</span>
    </div>
  );
};

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'text';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  count = 3,
  className = '',
}) => {
  const renderCardSkeleton = () => (
    <div className="card bg-base-100/80 backdrop-blur-sm border border-base-300 animate-pulse">
      <div className="card-body">
        <div className="flex justify-between items-start mb-4">
          <div className="w-16 h-16 bg-base-300 rounded-lg" />
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-base-300 rounded" />
            <div className="w-8 h-8 bg-base-300 rounded" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-base-300 rounded w-3/4" />
          <div className="flex justify-between">
            <div className="h-3 bg-base-300 rounded w-1/4" />
            <div className="h-3 bg-base-300 rounded w-1/4" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-base-300 rounded-full w-16" />
            <div className="h-6 bg-base-300 rounded-full w-20" />
          </div>
          <div className="flex justify-between pt-2">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-8 h-8 bg-base-300 rounded" />
              ))}
            </div>
            <div className="h-3 bg-base-300 rounded w-1/5" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="card card-compact bg-base-100/80 backdrop-blur-sm border border-base-300 animate-pulse">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-base-300 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-base-300 rounded w-1/2" />
              <div className="flex gap-4">
                <div className="h-3 bg-base-300 rounded w-16" />
                <div className="h-3 bg-base-300 rounded w-20" />
                <div className="h-3 bg-base-300 rounded w-16" />
              </div>
            </div>
            <div className="hidden lg:flex gap-2">
              <div className="h-6 bg-base-300 rounded-full w-16" />
              <div className="h-6 bg-base-300 rounded-full w-20" />
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-8 h-8 bg-base-300 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTextSkeleton = () => (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-base-300 rounded w-3/4" />
      <div className="h-4 bg-base-300 rounded w-1/2" />
      <div className="h-4 bg-base-300 rounded w-5/6" />
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'list':
        return renderListSkeleton();
      case 'text':
        return renderTextSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  return (
    <div className={`space-y-4 ${className}`} role="status" aria-label="Chargement du contenu">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
      <span className="sr-only">Chargement du contenu...</span>
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  type?: 'spinner' | 'skeleton';
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  message = 'Chargement...',
  type = 'spinner',
  className = '',
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="opacity-30 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-base-100/80 backdrop-blur-sm rounded-lg">
        {type === 'spinner' ? (
          <LoadingSpinner message={message} size="lg" />
        ) : (
          <LoadingSkeleton />
        )}
      </div>
    </div>
  );
};
