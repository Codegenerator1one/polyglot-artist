
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewHeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenExternal: () => void;
}

const PreviewHeader: React.FC<PreviewHeaderProps> = ({ 
  isRefreshing, 
  onRefresh, 
  onOpenExternal 
}) => {
  return (
    <div className="flex items-center justify-between bg-secondary/50 px-4 py-2 border-b border-border/50">
      <span className="text-sm font-medium">Preview</span>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenExternal}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PreviewHeader;
