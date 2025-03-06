
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { UserProject } from '@/utils/authTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import { ArrowLeft, Trash2, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getLanguageById } from '@/utils/supportedLanguages';

const MyProjects: React.FC = () => {
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isSignedIn, userId } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isSignedIn || !userId) {
      navigate('/');
      return;
    }

    // Load projects from localStorage (in a real app, this would be from a database)
    try {
      const storedProjects = localStorage.getItem(`user_projects_${userId}`);
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects);
        // Convert string dates back to Date objects
        const projectsWithDates = parsedProjects.map((project: any) => ({
          ...project,
          lastEdited: new Date(project.lastEdited)
        }));
        setProjects(projectsWithDates);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      toast({
        title: "Error",
        description: "Could not load your projects.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, userId, navigate, toast]);

  const handleDelete = (projectId: string) => {
    try {
      const filteredProjects = projects.filter(project => project.id !== projectId);
      localStorage.setItem(`user_projects_${userId}`, JSON.stringify(filteredProjects));
      setProjects(filteredProjects);
      toast({
        title: "Project Deleted",
        description: "Your project has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Could not delete the project.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (project: UserProject) => {
    // Store the project code in localStorage temporarily
    localStorage.setItem('editing_project_code', project.code);
    localStorage.setItem('editing_project_language', project.language);
    // Navigate to the editor page
    navigate('/');
  };

  if (!isSignedIn) {
    return <div>Please sign in to view your projects.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto py-6 px-4 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
            <h2 className="text-2xl font-semibold tracking-tight">My Projects</h2>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p>Loading your projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">You don't have any saved projects yet.</p>
            <Button className="mt-4" onClick={() => navigate('/')}>Create a New Project</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {projects.map((project) => {
              // Safely get language details
              let languageColor = "#666";
              let languageName = project.language;
              
              try {
                const language = getLanguageById(project.language);
                languageColor = language.color;
                languageName = language.name;
              } catch (e) {
                // Use defaults if language not found
              }
              
              return (
                <Card key={project.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center mt-2">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: languageColor }}
                        ></div>
                        <span>{languageName}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Last edited {formatDistanceToNow(new Date(project.lastEdited), { addSuffix: true })}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleEdit(project)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyProjects;
