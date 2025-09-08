import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, Headphones, Hand, BookOpen, CheckCircle } from 'lucide-react';

interface LearningStyleAssessmentProps {
  userId: string;
  onComplete: (learningStyle: string) => void;
}

const questions = [
  {
    id: 1,
    question: "When you need to learn something new, what helps you most?",
    options: [
      { value: "visual", text: "Seeing diagrams, charts, or visual examples", icon: Eye },
      { value: "auditory", text: "Listening to explanations or discussing with others", icon: Headphones },
      { value: "kinesthetic", text: "Hands-on practice and trying it yourself", icon: Hand },
      { value: "reading_writing", text: "Reading detailed notes and writing summaries", icon: BookOpen }
    ]
  },
  {
    id: 2,
    question: "In a classroom, you prefer when the teacher:",
    options: [
      { value: "visual", text: "Uses slides, drawings, and visual aids", icon: Eye },
      { value: "auditory", text: "Explains concepts verbally and encourages discussion", icon: Headphones },
      { value: "kinesthetic", text: "Includes activities and hands-on experiments", icon: Hand },
      { value: "reading_writing", text: "Provides detailed handouts and written materials", icon: BookOpen }
    ]
  },
  {
    id: 3,
    question: "When studying for an exam, you're most likely to:",
    options: [
      { value: "visual", text: "Create mind maps, flashcards, or colorful notes", icon: Eye },
      { value: "auditory", text: "Read aloud, discuss with friends, or listen to recordings", icon: Headphones },
      { value: "kinesthetic", text: "Use practice tests, role-play, or take frequent breaks to move", icon: Hand },
      { value: "reading_writing", text: "Write detailed notes, outlines, and practice essays", icon: BookOpen }
    ]
  },
  {
    id: 4,
    question: "You remember information best when:",
    options: [
      { value: "visual", text: "You can picture it or see it written down", icon: Eye },
      { value: "auditory", text: "You hear it or say it out loud", icon: Headphones },
      { value: "kinesthetic", text: "You practice it or experience it physically", icon: Hand },
      { value: "reading_writing", text: "You write it down and read it multiple times", icon: BookOpen }
    ]
  },
  {
    id: 5,
    question: "When following directions, you prefer:",
    options: [
      { value: "visual", text: "Maps, diagrams, or step-by-step visual guides", icon: Eye },
      { value: "auditory", text: "Spoken instructions or asking someone to explain", icon: Headphones },
      { value: "kinesthetic", text: "Learning by doing and figuring it out as you go", icon: Hand },
      { value: "reading_writing", text: "Written instructions that you can refer to", icon: BookOpen }
    ]
  }
];

const learningStyleInfo = {
  visual: {
    title: "Visual Learner",
    description: "You learn best through seeing and visualizing information.",
    tips: [
      "Use colorful notes, highlighters, and mind maps",
      "Create diagrams and flowcharts for complex topics",
      "Watch educational videos and use visual aids",
      "Organize information with charts and graphs"
    ],
    icon: Eye,
    color: "text-blue-600"
  },
  auditory: {
    title: "Auditory Learner", 
    description: "You learn best through hearing and speaking.",
    tips: [
      "Read aloud and discuss concepts with others",
      "Listen to podcasts and audio recordings",
      "Participate in study groups and verbal discussions",
      "Use rhymes and songs to memorize information"
    ],
    icon: Headphones,
    color: "text-green-600"
  },
  kinesthetic: {
    title: "Kinesthetic Learner",
    description: "You learn best through hands-on activities and movement.",
    tips: [
      "Use hands-on experiments and practical applications",
      "Take frequent breaks and incorporate movement",
      "Use manipulatives and physical models",
      "Practice skills in real-world contexts"
    ],
    icon: Hand,
    color: "text-orange-600"
  },
  reading_writing: {
    title: "Reading/Writing Learner",
    description: "You learn best through reading and writing activities.",
    tips: [
      "Take detailed notes and create outlines",
      "Read extensively and write summaries",
      "Use lists, definitions, and written exercises",
      "Rewrite information in your own words"
    ],
    icon: BookOpen,
    color: "text-purple-600"
  }
};

export const LearningStyleAssessment: React.FC<LearningStyleAssessmentProps> = ({
  userId,
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = async () => {
    setLoading(true);
    
    // Count answers for each learning style
    const counts = {
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      reading_writing: 0
    };

    answers.forEach(answer => {
      counts[answer as keyof typeof counts]++;
    });

    // Find the most common learning style
    const dominantStyle = Object.entries(counts).reduce((a, b) => 
      counts[a[0] as keyof typeof counts] > counts[b[0] as keyof typeof counts] ? a : b
    )[0];

    // Calculate percentages for better insights
    const total = answers.length;
    const percentages = {
      visual: Math.round((counts.visual / total) * 100),
      auditory: Math.round((counts.auditory / total) * 100),
      kinesthetic: Math.round((counts.kinesthetic / total) * 100),
      reading_writing: Math.round((counts.reading_writing / total) * 100)
    };

    const detailedPreferences = {
      dominant_style: dominantStyle,
      style_percentages: percentages,
      raw_counts: counts,
      assessment_date: new Date().toISOString(),
      total_questions: total
    };

    setResult(dominantStyle);

    // Save to database with enhanced preferences
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          learning_style: dominantStyle,
          learning_preferences: detailedPreferences,
          updated_at: new Date().toISOString()
        } as any)
        .eq('user_id', userId);

      if (error) {
        console.warn('Database update failed, using localStorage fallback:', error);
        // Fallback to localStorage for demo purposes
        localStorage.setItem(`learning_style_${userId}`, dominantStyle);
        localStorage.setItem(`learning_preferences_${userId}`, JSON.stringify(detailedPreferences));
      }

      toast({
        title: "Learning style saved!",
        description: `You're a ${dominantStyle.replace('_', '/')} learner (${percentages[dominantStyle as keyof typeof percentages]}% match)`,
      });

      setIsComplete(true);
      onComplete(dominantStyle);
    } catch (error) {
      console.error('Error saving learning style:', error);
      // Fallback to localStorage for demo purposes
      localStorage.setItem(`learning_style_${userId}`, dominantStyle);
      localStorage.setItem(`learning_preferences_${userId}`, JSON.stringify(detailedPreferences));
      
      toast({
        title: "Learning style saved locally!",
        description: "Your preferences have been saved for this session.",
      });
      
      setIsComplete(true);
      onComplete(dominantStyle);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  if (isComplete && result) {
    const styleInfo = learningStyleInfo[result as keyof typeof learningStyleInfo];
    const Icon = styleInfo.icon;

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
          <CardDescription>Here are your results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <Icon className={`h-12 w-12 mx-auto mb-2 ${styleInfo.color}`} />
            <h3 className="text-xl font-semibold">{styleInfo.title}</h3>
            <p className="text-muted-foreground">{styleInfo.description}</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Study Tips for You:</h4>
            <ul className="space-y-1">
              {styleInfo.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button 
            onClick={() => onComplete(result)} 
            className="w-full"
          >
            Continue to StudyMate
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Learning Style Assessment</CardTitle>
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <CardDescription>
          Help us understand how you learn best so we can personalize your study experience
        </CardDescription>
        <Progress value={progressPercentage} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{currentQ.question}</h3>
          <RadioGroup
            value={answers[currentQuestion] || ""}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {currentQ.options.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleAnswer(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion] || loading}
          >
            {loading ? "Saving..." : currentQuestion === questions.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
