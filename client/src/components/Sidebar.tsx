import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  FileText,
  Calendar,
  FileSearch,
  Menu,
  X,
  Home,
  Folder,
  LayoutTemplate,
  ChevronRight,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Sidebar = () => {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    recentProjects: false,
    templates: false
  });

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleSection = (section: 'recentProjects' | 'templates') => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  // Main navigation items
  const mainNavItems = [
    {
      name: "PRD Editor",
      href: "/document",
      icon: <FileText className="h-4.5 w-4.5" />,
      matchPaths: ["/", "/document"]
    },
    {
      name: "Roadmap Calendar",
      href: "/roadmap",
      icon: <Calendar className="h-4.5 w-4.5" />,
      matchPaths: ["/roadmap", "/road-map"]
    },
    {
      name: "Research Materials",
      href: "/research",
      icon: <FileSearch className="h-4.5 w-4.5" />,
      matchPaths: ["/research", "/research-materials"]
    }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-700"
        onClick={toggleMobileMenu}
        aria-label="Toggle Menu"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "bg-white w-64 flex-shrink-0 fixed md:relative inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out border-r border-gray-100 shadow-sm flex flex-col",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 border-b border-gray-100 px-4">
          <h1 className="text-lg font-semibold tracking-tight text-primary">PM Assistant</h1>
          
          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Home className="h-4 w-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Home</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Plus className="h-4 w-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New Project</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {/* Main Navigation */}
          <div className="px-3">
            <h2 className="text-xs font-semibold text-gray-500 mb-2 px-3">WORKSPACE</h2>
            <ul className="space-y-1">
              {mainNavItems.map((item) => {
                const isActive = item.matchPaths.includes(location);
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <span
                        className={cn(
                          "flex items-center px-3 py-2 text-sm rounded-md cursor-pointer font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <span className={cn("mr-3", isActive ? "text-primary" : "text-gray-500")}>
                          {item.icon}
                        </span>
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Recent Projects */}
          <div className="px-3 mt-6">
            <button 
              onClick={() => toggleSection('recentProjects')}
              className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 group"
            >
              <span>RECENT PROJECTS</span>
              <ChevronRight className={cn(
                "h-4 w-4 text-gray-400 transition-transform duration-200",
                expandedSections.recentProjects ? "rotate-90" : ""
              )} />
            </button>
            
            {expandedSections.recentProjects && (
              <ul className="mt-1 space-y-1 pl-2">
                {['Mobile App Redesign', 'Q3 Feature Planning', 'User Research 2025'].map((project) => (
                  <li key={project}>
                    <a
                      href="#"
                      className="flex items-center px-3 py-1.5 text-sm rounded-md text-gray-700 hover:bg-gray-50 group transition-colors"
                    >
                      <Folder className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                      <span className="truncate">{project}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Templates */}
          <div className="px-3 mt-4">
            <button 
              onClick={() => toggleSection('templates')}
              className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 group"
            >
              <span>TEMPLATES</span>
              <ChevronRight className={cn(
                "h-4 w-4 text-gray-400 transition-transform duration-200",
                expandedSections.templates ? "rotate-90" : ""
              )} />
            </button>
            
            {expandedSections.templates && (
              <ul className="mt-1 space-y-1 pl-2">
                {['Basic PRD', 'Feature Specification', 'Market Research'].map((template) => (
                  <li key={template}>
                    <a
                      href="#"
                      className="flex items-center px-3 py-1.5 text-sm rounded-md text-gray-700 hover:bg-gray-50 group transition-colors"
                    >
                      <LayoutTemplate className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                      <span className="truncate">{template}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-md">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium text-sm">PM</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">Product Manager</p>
              <p className="text-xs text-gray-500 truncate">pm@example.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
