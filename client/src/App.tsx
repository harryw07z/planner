import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/Sidebar";
import DocumentEditor from "@/pages/DocumentEditor";
import RoadmapCalendar from "@/pages/RoadmapCalendar";
import ResearchMaterials from "@/pages/ResearchMaterials";
import { Bell, Settings, HelpCircle, Search } from "lucide-react";

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

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-medium text-gray-800">{getPageTitle()}</h1>
          </div>
          
          <div className="flex items-center space-x-1">
            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <HelpCircle className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/10 ml-2 flex items-center justify-center cursor-pointer">
              <span className="text-primary font-medium text-sm">PM</span>
            </div>
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
