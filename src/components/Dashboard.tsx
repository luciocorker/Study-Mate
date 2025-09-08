import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { 
  Plus, 
  Calendar, 
  Clock, 
  BookOpen, 
  Target,
  TrendingUp,
  CheckCircle2,
  Lightbulb,
  Eye,
  Headphones,
  Hand,
  PenTool
} from "lucide-react";
import heroImage from "@/assets/hero-study.jpg";

interface DashboardProps {
  userData: { firstName: string; lastName: string; school: string };
  onViewChange: (view: string) => void;
}

export const Dashboard = ({ userData, onViewChange }: DashboardProps) => {
  const [exams, setExams] = useState<Database["public"]["Tables"]["exams"]["Row"][]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const getPersonalizedTips = () => {
    if (!profile?.learning_style) return null;

    const tips = {
      visual: {
        icon: Eye,
        color: "text-blue-600",
        title: "Visual Learning Tips",
        suggestions: [
          "Create colorful mind maps for your exam topics",
          "Use charts and diagrams to visualize complex concepts",
          "Highlight key information with different colors",
          "Watch educational videos related to your subjects"
        ]
      },
      auditory: {
        icon: Headphones,
        color: "text-green-600", 
        title: "Auditory Learning Tips",
        suggestions: [
          "Record yourself reading notes and listen back",
          "Join study groups for discussion",
          "Explain concepts out loud to yourself",
          "Use music or rhymes to memorize information"
        ]
      },
      kinesthetic: {
        icon: Hand,
        color: "text-orange-600",
        title: "Kinesthetic Learning Tips", 
        suggestions: [
          "Take breaks every 25 minutes to move around",
          "Use physical flashcards you can manipulate",
          "Study while walking or standing",
          "Create hands-on experiments for science topics"
        ]
      },
      reading_writing: {
        icon: PenTool,
        color: "text-purple-600",
        title: "Reading/Writing Learning Tips",
        suggestions: [
          "Rewrite your notes in your own words",
          "Create detailed outlines for each subject",
          "Write practice essays and summaries",
          "Make lists and use bullet points for organization"
        ]
      }
    };

    return tips[profile.learning_style as keyof typeof tips];
  };

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        setExams([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: true });
      if (error) {
        setExams([]);
      } else {
        setExams(data || []);
      }
      setLoading(false);
    };
    fetchExams();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-accent text-accent-foreground";
      case "low": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // ...existing code...
  // Use study_progress from Supabase
  const totalProgress = exams.length > 0
    ? Math.round(exams.reduce((acc, exam) => acc + (exam.study_progress || 0), 0) / exams.length)
    : 0;

  return (
    <div className="flex-1 p-4 md:p-6 bg-gradient-background min-h-full">
      {/* Hero Section */}
      <div className="relative mb-6 md:mb-8 rounded-xl overflow-hidden shadow-elevated">
        <img 
          src={heroImage} 
          alt="Study Assistant" 
          className="w-full h-32 md:h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary-glow/60 flex items-center">
          <div className="p-4 md:p-8 text-primary-foreground">
            <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">
              Welcome back, {userData.firstName}!
            </h1>
            <p className="text-sm md:text-lg opacity-90">
              Ready to continue your study journey at {userData.school}?
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Exams</p>
                <p className="text-2xl font-bold">{exams.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold">{totalProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Next Exam</p>
                <p className="text-lg md:text-2xl font-bold">6 days</p>
              </div>
              <Calendar className="h-6 w-6 md:h-8 md:w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Study Hours</p>
                <p className="text-lg md:text-2xl font-bold">24.5h</p>
              </div>
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-primary-glow" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personalized Study Tips */}
      {profile?.learning_style && (() => {
        const tips = getPersonalizedTips();
        if (!tips) return null;
        const Icon = tips.icon;
        
        return (
          <Card className="shadow-soft mb-6 md:mb-8 border-2 border-primary/20">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Personalized Study Tips
              </CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${tips.color}`} />
                  <span className="text-sm">Based on your {profile.learning_style.replace('_', '/')} learning style</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="grid grid-cols-1 gap-3 md:gap-4">
                {tips.suggestions.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{tip}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewChange("learning-style")}
                >
                  Retake Assessment
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewChange("study-assistant")}
                >
                  AI Study Assistant
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
        <Button 
          className="bg-gradient-primary hover:shadow-glow transition-all duration-300 h-12 md:h-10"
          onClick={() => onViewChange("exams")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Exam
        </Button>
        <Button 
          variant="outline" 
          className="hover:bg-gradient-secondary hover:text-secondary-foreground transition-all duration-300 h-12 md:h-10"
          onClick={() => onViewChange("schedule")}
        >
          <Target className="h-4 w-4 mr-2" />
          Generate Study Plan
        </Button>
      </div>

      {/* Upcoming Exams */}
      <Card className="shadow-elevated">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            Upcoming Exams
          </CardTitle>
          <CardDescription className="text-sm">
            Track your exam preparation progress
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-muted-foreground">Loading exams...</div>
            ) : exams.length === 0 ? (
              <div className="text-center text-muted-foreground">No exams found.</div>
            ) : (
              exams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:shadow-soft transition-all duration-300">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{exam.subject}</h3>
                      <Badge className={getPriorityColor(exam.priority)}>
                        {exam.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {exam.type} • {exam.date ? new Date(exam.date).toLocaleDateString() : ""}
                    </p>
                    <div className="flex items-center gap-2">
                      <Progress value={exam.study_progress || 0} className="flex-1" />
                      <span className="text-sm font-medium">{exam.study_progress || 0}%</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {exam.study_progress === 100 ? (
                      <CheckCircle2 className="h-6 w-6 text-secondary" />
                    ) : (
                      <Button size="sm" variant="outline">
                        Study Now
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};