
import React from 'react';
import { AIModel } from '../services/aiService';
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onSelectModel: (model: AIModel) => void;
  aiModels: AIModel[];
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel, 
  onSelectModel,
  aiModels
}) => {
  return (
    <div className="w-full animate-slide-up">
      <div className="section-title mb-3">Select AI Model</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
        {aiModels.map((model) => (
          <button
            key={model.id}
            className={cn(
              "p-3 rounded-md text-sm font-medium transition-all duration-200 ease-in-out",
              "hover:bg-accent/70 focus:outline-none focus:ring-2 focus:ring-primary/20",
              "flex flex-col items-start justify-center border",
              selectedModel.id === model.id
                ? "border-primary/30 bg-accent shadow-sm"
                : "border-transparent bg-accent/40"
            )}
            onClick={() => onSelectModel(model)}
          >
            <div className="flex items-center w-full justify-center">
              <span className="font-medium">{model.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector;
