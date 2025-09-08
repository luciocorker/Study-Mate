import { useState, useEffect } from "react";
import { AddExamForm } from "@/components/AddExamForm";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/LoginForm";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import StudyPlanCalendar from "@/components/StudyPlanCalendar";
import { LearningStyleAssessment } from "@/components/LearningStyleAssessment";
import { PDFStudyAssistant } from "@/components/PDFStudyAssistant";
import Settings from "@/components/Settings";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Index = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);

  // Fetch exams for the current user
  const fetchExams = async () => {
    setExamsLoading(true);
    if (!user) return;
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });
    setExams(data || []);
    setExamsLoading(false);
  };

  // Fetch exams when user logs in or view changes to exams
  useEffect(() => {
    if (user && currentView === "exams") fetchExams();
  }, [user, currentView]);

  const handleLogout = async () => {
    await signOut();
    setCurrentView("dashboard");
  };

  const handleLearningStyleComplete = (learningStyle: string) => {
    // Refresh the profile to get the updated learning style
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            // Force a re-render by updating the auth hook's profile state
            window.location.reload();
          }
        });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <LoginForm />;
  }

  // Show learning style assessment if user hasn't completed it
  // For demo purposes, we'll show it if learning_style is null or undefined
  if (!profile.learning_style && profile.learning_style !== null) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
        <LearningStyleAssessment 
          userId={user.id}
          onComplete={handleLearningStyleComplete}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
        ${sidebarCollapsed && !sidebarOpen ? 'md:w-16' : 'md:w-80'} 
        fixed md:relative 
        z-50 md:z-auto 
        transition-transform duration-300 ease-in-out
        h-full
      `}>
        <Sidebar 
          currentView={currentView}
          onViewChange={(view) => {
            setCurrentView(view);
            setSidebarOpen(false); // Close mobile sidebar after selection
          }}
          userData={{
            id: user.id,
            firstName: profile.first_name,
            lastName: profile.last_name,
            school: profile.school,
            learningStyle: profile.learning_style,
            learningPreferences: profile.learning_preferences
          }}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      
      <main className="flex-1 overflow-auto relative w-full md:w-auto">
        {/* Mobile Sidebar Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          className="fixed top-4 left-4 z-30 md:hidden bg-background/90 backdrop-blur-sm border-border/50 hover:bg-accent shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        {/* Desktop Sidebar Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex fixed top-4 left-4 z-30 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-accent"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
        
        {currentView === "dashboard" && (
          <Dashboard 
            userData={{
              firstName: profile.first_name,
              lastName: profile.last_name,
              school: profile.school
            }} 
            onViewChange={setCurrentView} 
          />
        )}
        {currentView === "exams" && (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">My Exams</h1>
            <div className="mb-6">
              <AddExamForm userId={user.id} onExamAdded={fetchExams} />
            </div>
            {examsLoading ? (
              <p className="text-muted-foreground">Loading exams...</p>
            ) : exams.length === 0 ? (
              <p className="text-muted-foreground">No exams found.</p>
            ) : (
              <ul className="space-y-4">
                {exams.map(exam => (
                  <li key={exam.id} className="border rounded p-4 bg-card/50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{exam.subject}</div>
                        <div className="text-sm text-muted-foreground">{exam.type} • {exam.date ? new Date(exam.date).toLocaleDateString() : ""}</div>
                        <div className="text-sm">Priority: {exam.priority}</div>
                        <div className="text-sm">Progress: {exam.study_progress || 0}%</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {currentView === "calendar" && (
          <StudyPlanCalendar />
        )}
        {currentView === "pdf-assistant" && (
          <PDFStudyAssistant 
            userId={user.id}
            learningStyle={profile.learning_style}
          />
        )}
        {currentView === "learning-style" && (
          <div className="p-6 flex justify-center">
            <LearningStyleAssessment 
              userId={user.id}
              onComplete={(learningStyle) => {
                handleLearningStyleComplete(learningStyle);
                setCurrentView("dashboard");
              }}
            />
          </div>
        )}
        {currentView === "settings" && (
          <Settings />
        )}
      </main>
    </div>
  );
};

export default Index;
