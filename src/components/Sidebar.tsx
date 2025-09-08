import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { 
  Home, 
  Calendar, 
  BookOpen, 
  Settings, 
  MessageCircle, 
  Send,
  User,
  LogOut,
  Maximize2,
  Minimize2,
  FileText
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userData: { 
    id: string; 
    firstName: string; 
    lastName: string; 
    school: string;
    learningStyle?: string;
    learningPreferences?: any;
  };
  onLogout: () => void;
}

export const Sidebar = ({ currentView, onViewChange, userData, onLogout }: SidebarProps) => {
  const [chatMessage, setChatMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Create personalized initial message based on learning style
  const getInitialMessage = () => {
    const baseMessage = `Hi ${userData.firstName}! I'm your study assistant.`;
    
    if (userData.learningStyle) {
      const styleMessages = {
        visual: "I know you're a visual learner, so I'll suggest visual study techniques like mind maps, diagrams, and colorful notes!",
        auditory: "I know you're an auditory learner, so I'll suggest techniques like reading aloud, discussions, and audio materials!",
        kinesthetic: "I know you're a kinesthetic learner, so I'll suggest hands-on activities, movement, and practical applications!",
        reading_writing: "I know you're a reading/writing learner, so I'll suggest detailed notes, lists, and text-based study methods!"
      };
      
      return `${baseMessage} ${styleMessages[userData.learningStyle as keyof typeof styleMessages] || ''} Ask me anything about your studies!`;
    }
    
    return `${baseMessage} Ask me anything about your studies or study techniques!`;
  };
  
  const [chatMessages, setChatMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: getInitialMessage(), isUser: false }
  ]);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const userMessage = chatMessage.trim();
    setChatMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setChatMessage("");
    setIsLoading(true);
    
    // Add typing indicator
    setChatMessages(prev => [...prev, { text: "AI is thinking...", isUser: false }]);
    
    try {
      // Prepare context with learning style information
      const context = {
        prompt: userMessage,
        userId: userData.id,
        learningStyle: userData.learningStyle,
        learningPreferences: userData.learningPreferences,
        userName: userData.firstName
      };

      const response = await fetch("http://localhost:3001/api/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context)
      });
      const data = await response.json();
      
      // Remove typing indicator and add actual response
      setChatMessages(prev => {
        const messages = prev.slice(0, -1); // Remove "AI is thinking..." message
        return [...messages, { text: data.result || "Sorry, I couldn't generate a response.", isUser: false }];
      });
    } catch (err) {
      // Remove typing indicator and add error message
      setChatMessages(prev => {
        const messages = prev.slice(0, -1); // Remove "AI is thinking..." message
        return [...messages, { text: "AI service error. Please try again later.", isUser: false }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "exams", icon: BookOpen, label: "My Exams" },
    { id: "pdf-assistant", icon: FileText, label: "PDF Assistant" },
    { id: "calendar", icon: Calendar, label: "Study Calendar" },
    { id: "learning-style", icon: User, label: "Learning Style" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-primary p-2 rounded-lg">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold">{userData.firstName} {userData.lastName}</p>
            <p className="text-sm text-muted-foreground">{userData.school}</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onViewChange(item.id)}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>

      {/* Chat Section */}
      <div className={`flex-1 flex flex-col p-4 min-h-0 ${isExpanded ? 'fixed top-0 right-0 w-1/2 h-screen bg-background z-50 border-l border-border' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Study Assistant</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 h-8 w-8"
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <Card className="flex-1 flex flex-col p-4 min-h-0">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-3 pb-4">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-[85%] break-words ${
                      message.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Input
              placeholder="Ask about your studies..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              size="sm" 
              onClick={handleSendMessage}
              disabled={!chatMessage.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};