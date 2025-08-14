import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SuccessNotificationProps {
  show: boolean;
  title: string;
  description: string;
  onClose: () => void;
  duration?: number;
}

export const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  show,
  title,
  description,
  onClose,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Délai pour l'animation de sortie
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <Card className="p-4 shadow-lg border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
              {title}
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              {description}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
