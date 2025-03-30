import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/Sidebar";
import DocumentEditor from "@/pages/DocumentEditor";
import RoadmapCalendar from "@/pages/RoadmapCalendar";
import ResearchMaterials from "@/pages/ResearchMaterials";

function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
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
        <Toaster />
      </main>
    </div>
  );
}

export default App;
