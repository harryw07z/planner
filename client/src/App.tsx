import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/Sidebar";
import DocumentEditor from "@/pages/DocumentEditorRefactored";
import RoadmapCalendar from "@/pages/RoadmapCalendar";
import ResearchMaterials from "@/pages/ResearchMaterials";
import { Bell, HelpCircle, Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function App() {
  const [location] = useLocation();
  
  // Function to get page title based on current route
  const getPageTitle = () => {
    switch (location) {
      case "/":
      case "/document":
        return "PRD Editor";
      case "/roadmap":
        return "Roadmap Calendar";
      case "/research":
      case "/research-materials":
        return "Research Materials";
      default:
        return "PM Assistant";
    }
  };

  // Get action button based on current route
  const getActionButton = () => {
    switch (location) {
      case "/":
      case "/document":
        return {
          label: "New Document",
          icon: <PlusCircle className="h-4 w-4 mr-1.5" />,
          action: () => console.log("Create new document")
        };
      case "/roadmap":
        return {
          label: "Add Event",
          icon: <PlusCircle className="h-4 w-4 mr-1.5" />,
          action: () => console.log("Add roadmap event")
        };
      case "/research":
      case "/research-materials":
        return {
          label: "Upload Research",
          icon: <PlusCircle className="h-4 w-4 mr-1.5" />,
          action: () => console.log("Upload research")
        };
      default:
        return null;
    }
  };

  const actionButton = getActionButton();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-medium text-gray-800">{getPageTitle()}</h1>
            
            {/* Primary action button */}
            {actionButton && (
              <Button size="sm" className="ml-4 h-9">
                {actionButton.icon}
                {actionButton.label}
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <div className="flex items-center rounded-md border border-input bg-background px-3 h-9">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Quick search..."
                  className="ml-2 w-36 sm:w-48 h-9 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Help & Resources</TooltipContent>
              </Tooltip>
              
              <div className="w-8 h-8 rounded-full bg-primary/10 ml-2 flex items-center justify-center cursor-pointer">
                <span className="text-primary font-medium text-sm">PM</span>
              </div>
            </TooltipProvider>
          </div>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto w-full max-w-7xl">
            <Switch>
              <Route path="/" component={DocumentEditor} />
              <Route path="/document" component={DocumentEditor} />
              <Route path="/roadmap" component={RoadmapCalendar} />
              <Route path="/research" component={ResearchMaterials} />
              {/* Add aliases for URLs that user tried to access */}
              <Route path="/research-materials" component={ResearchMaterials} />
              <Route path="/road-map" component={RoadmapCalendar} />
              <Route path="/settings" component={DocumentEditor} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </div>
        
        <Toaster />
      </main>
    </div>
  );
}

export default App;
