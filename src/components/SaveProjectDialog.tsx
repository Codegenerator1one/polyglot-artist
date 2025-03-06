
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SaveIcon } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { SaveProjectRequest } from '@/utils/authTypes';

interface SaveProjectDialogProps {
  currentLanguage: string;
  currentCode: string;
}

const SaveProjectDialog: React.FC<SaveProjectDialogProps> = ({ currentLanguage, currentCode }) => {
  const [projectName, setProjectName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { isSignedIn, userId } = useAuth();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!isSignedIn || !userId) {
      toast({
        title: "Authentication Error",
        description: "You must be signed in to save projects",
        variant: "destructive",
      });
      return;
    }

    if (!projectName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a project name",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // For now, just save to localStorage as a demonstration
      // In a real app, this would use a database through Supabase or similar
      const projectData: SaveProjectRequest = {
        name: projectName,
        language: currentLanguage,
        code: currentCode
      };

      const existingProjects = JSON.parse(localStorage.getItem(`user_projects_${userId}`) || '[]');
      const newProject = {
        id: Date.now().toString(),
        ...projectData,
        lastEdited: new Date()
      };
      
      existingProjects.push(newProject);
      localStorage.setItem(`user_projects_${userId}`, JSON.stringify(existingProjects));

      toast({
        title: "Project Saved",
        description: `"${projectName}" has been saved successfully.`,
      });

      setIsOpen(false);
      setProjectName('');
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Save Error",
        description: "An error occurred while saving your project.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">
          <SaveIcon className="mr-2 h-4 w-4" />
          Save Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Project</DialogTitle>
          <DialogDescription>
            Give your project a name to save it for future editing.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Awesome Project"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveProjectDialog;
