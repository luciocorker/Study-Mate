import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Upload, 
  FileText, 
  MessageSquare, 
  ClipboardList, 
  CheckCircle, 
  XCircle, 
  Send,
  Download,
  BookOpen,
  Brain,
  Target
} from 'lucide-react';

interface PDF {
  id: string;
  filename: string;
  uploadDate: string;
  wordCount: number;
}

interface Question {
  id: number;
  question: string;
  type: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  topic: string;
}

interface Test {
  title: string;
  questions: Question[];
  testId?: string;
}

interface TestResult {
  questionId: number;
  selectedAnswer: string;
  isCorrect: boolean;
}

interface PDFStudyAssistantProps {
  userId: string;
  learningStyle?: string;
}

export const PDFStudyAssistant: React.FC<PDFStudyAssistantProps> = ({ userId, learningStyle }) => {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({});
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [generatingTest, setGeneratingTest] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserPDFs();
  }, [userId]);

  const fetchUserPDFs = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/user-pdfs/${userId}`);
      const data = await response.json();
      setPdfs(data.pdfs || []);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('userId', userId);

    console.log('Uploading file:', file.name, file.type, file.size);

    try {
      const response = await fetch('http://localhost:3001/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);
      const data = await response.json();
      console.log('Upload response data:', data);
      
      if (data.success) {
        toast({
          title: "PDF uploaded successfully!",
          description: `${data.filename} is ready for study assistance.`,
        });
        fetchUserPDFs();
        setSelectedPdf(data.pdfId);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!selectedPdf || !question.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/pdf-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfId: selectedPdf,
          question: question.trim(),
          userId,
          learningStyle
        }),
      });

      const data = await response.json();
      setAnswer(data.answer || 'No answer generated.');
      setQuestion('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTest = async (testType: string, questionCount: number, difficulty: string) => {
    if (!selectedPdf) return;

    setGeneratingTest(true);
    try {
      const response = await fetch('http://localhost:3001/api/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfId: selectedPdf,
          userId,
          testType,
          questionCount,
          difficulty,
          learningStyle
        }),
      });

      const data = await response.json();
      
      if (data.success && data.test) {
        setCurrentTest(data.test);
        setTestAnswers({});
        setTestResults([]);
        setShowResults(false);
        toast({
          title: "Test generated!",
          description: `Created ${data.test.questions?.length || 0} questions from your PDF.`,
        });
      } else {
        throw new Error(data.error || 'Failed to generate test');
      }
    } catch (error) {
      toast({
        title: "Test generation failed",
        description: "Could not create test from PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingTest(false);
    }
  };

  const handleSubmitTest = () => {
    if (!currentTest?.questions) return;

    const results: TestResult[] = currentTest.questions.map(q => ({
      questionId: q.id,
      selectedAnswer: testAnswers[q.id] || '',
      isCorrect: testAnswers[q.id] === q.correctAnswer
    }));

    setTestResults(results);
    setShowResults(true);
  };

  const calculateScore = () => {
    const correct = testResults.filter(r => r.isCorrect).length;
    return Math.round((correct / testResults.length) * 100);
  };

  const getSelectedPdfName = () => {
    const pdf = pdfs.find(p => p.id === selectedPdf);
    return pdf?.filename || 'No PDF selected';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">PDF Study Assistant</h1>
        <p className="text-muted-foreground">Upload PDFs, ask questions, and generate practice tests</p>
      </div>

      {/* PDF Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload PDF Documents
          </CardTitle>
          <CardDescription>
            Upload your study materials to get AI-powered assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="flex-1"
              />
              {uploading && <div className="text-sm text-muted-foreground">Uploading...</div>}
            </div>
            
            {pdfs.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select PDF for study:</label>
                <Select value={selectedPdf} onValueChange={setSelectedPdf}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose a PDF document to start studying" />
                  </SelectTrigger>
                  <SelectContent>
                    {pdfs.map((pdf) => (
                      <SelectItem key={pdf.id} value={pdf.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{pdf.filename}</span>
                          <Badge variant="secondary" className="ml-2">
                            {pdf.wordCount} words
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedPdf && (
                  <p className="text-sm text-muted-foreground">
                    👆 Select a PDF above to start asking questions and generating tests
                  </p>
                )}
              </div>
            )}
            
            {pdfs.length === 0 && !uploading && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No PDFs uploaded yet. Upload a PDF to get started!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedPdf && (
        <div className="space-y-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">PDF Ready for Study!</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                You can now ask questions about {getSelectedPdfName()} or generate practice tests below.
              </p>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="qa" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="qa" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Ask Questions
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Practice Tests
            </TabsTrigger>
          </TabsList>

          {/* Q&A Tab */}
          <TabsContent value="qa" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Ask Questions About: {getSelectedPdfName()}
                </CardTitle>
                <CardDescription>
                  {learningStyle && `Optimized for ${learningStyle} learning style`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask any question about the PDF content..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="flex-1"
                    rows={3}
                  />
                  <Button 
                    onClick={handleAskQuestion}
                    disabled={loading || !question.trim()}
                    className="self-end"
                  >
                    {loading ? "..." : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                
                {answer && (
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Answer:</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-sm">{answer}</div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Tab */}
          <TabsContent value="test" className="space-y-4">
            {!currentTest ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Generate Practice Test
                  </CardTitle>
                  <CardDescription>
                    Create a custom test from: {getSelectedPdfName()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => handleGenerateTest('multiple-choice', 5, 'easy')}
                      disabled={generatingTest}
                      variant="outline"
                      className="p-6 h-auto flex-col"
                    >
                      <BookOpen className="h-8 w-8 mb-2" />
                      <div className="text-center">
                        <div className="font-semibold">Quick Quiz</div>
                        <div className="text-sm text-muted-foreground">5 Easy Questions</div>
                      </div>
                    </Button>
                    
                    <Button
                      onClick={() => handleGenerateTest('multiple-choice', 10, 'medium')}
                      disabled={generatingTest}
                      variant="outline"
                      className="p-6 h-auto flex-col"
                    >
                      <Brain className="h-8 w-8 mb-2" />
                      <div className="text-center">
                        <div className="font-semibold">Standard Test</div>
                        <div className="text-sm text-muted-foreground">10 Medium Questions</div>
                      </div>
                    </Button>
                    
                    <Button
                      onClick={() => handleGenerateTest('multiple-choice', 15, 'hard')}
                      disabled={generatingTest}
                      variant="outline"
                      className="p-6 h-auto flex-col"
                    >
                      <Target className="h-8 w-8 mb-2" />
                      <div className="text-center">
                        <div className="font-semibold">Challenge Test</div>
                        <div className="text-sm text-muted-foreground">15 Hard Questions</div>
                      </div>
                    </Button>
                  </div>
                  
                  {generatingTest && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Generating your test from PDF content...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {!showResults ? (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">{currentTest.title}</h2>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setCurrentTest(null)}>
                          New Test
                        </Button>
                        <Button 
                          onClick={handleSubmitTest}
                          disabled={Object.keys(testAnswers).length !== currentTest.questions?.length}
                        >
                          Submit Test
                        </Button>
                      </div>
                    </div>
                    
                    <Progress 
                      value={(Object.keys(testAnswers).length / (currentTest.questions?.length || 1)) * 100} 
                      className="w-full"
                    />
                    
                    <div className="space-y-6">
                      {currentTest.questions?.map((q, index) => (
                        <Card key={q.id}>
                          <CardHeader>
                            <CardTitle className="text-lg">
                              Question {index + 1}
                              <Badge variant="secondary" className="ml-2">{q.difficulty}</Badge>
                            </CardTitle>
                            <CardDescription>{q.topic}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="mb-4 font-medium">{q.question}</p>
                            <div className="space-y-2">
                              {q.options?.map((option, optIndex) => (
                                <Button
                                  key={optIndex}
                                  variant={testAnswers[q.id] === option ? "default" : "outline"}
                                  className="w-full justify-start"
                                  onClick={() => setTestAnswers(prev => ({ ...prev, [q.id]: option }))}
                                >
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                </Button>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )) || <p>No questions generated</p>}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
                      <CardHeader className="text-center">
                        <CardTitle className="text-3xl">Test Complete!</CardTitle>
                        <CardDescription className="text-xl">
                          Your Score: {calculateScore()}%
                        </CardDescription>
                      </CardHeader>
                    </Card>
                    
                    <div className="flex gap-2 mb-4">
                      <Button onClick={() => setCurrentTest(null)}>
                        Take New Test
                      </Button>
                      <Button variant="outline" onClick={() => setShowResults(false)}>
                        Review Questions
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Detailed Results</h3>
                      {currentTest.questions?.map((q, index) => {
                        const result = testResults.find(r => r.questionId === q.id);
                        const isCorrect = result?.isCorrect;
                        
                        return (
                          <Card key={q.id} className={isCorrect ? "border-green-200" : "border-red-200"}>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                {isCorrect ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                Question {index + 1}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <p className="font-medium">{q.question}</p>
                              <div className="grid grid-cols-1 gap-2">
                                <p><strong>Your Answer:</strong> {result?.selectedAnswer || 'Not answered'}</p>
                                <p><strong>Correct Answer:</strong> {q.correctAnswer}</p>
                              </div>
                              <div className="bg-muted p-3 rounded">
                                <p className="font-medium mb-1">Explanation:</p>
                                <p className="text-sm">{q.explanation}</p>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
        </div>
      )}

      {!selectedPdf && pdfs.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No PDFs uploaded yet</h3>
            <p className="text-muted-foreground">Upload your first PDF to start studying with AI assistance</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
