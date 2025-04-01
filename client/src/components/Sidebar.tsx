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
} from "lucide-react";

const Sidebar = () => {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    recentProjects: true,
    templates: true
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
          "bg-white w-72 flex-shrink-0 fixed md:relative inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out border-r border-gray-100 shadow-sm",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between h-16 border-b border-gray-100 px-6">
          <h1 className="text-lg font-medium tracking-tight text-primary">PM Assistant</h1>
          <div className="flex items-center space-x-2">
            <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
              <Home className="h-5 w-5 text-gray-500" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
              <Plus className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <nav className="py-4">
          <div className="px-3 mb-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full py-2 pl-4 pr-8 text-sm bg-gray-50 border-0 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
            </div>
          </div>

          <div className="px-3">
            <h2 className="text-xs font-semibold text-gray-500 mb-2 px-3">WORKSPACE</h2>
            <ul className="space-y-1">
              <li>
                <Link href="/document">
                  <span
                    className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-lg cursor-pointer font-medium transition-colors",
                      location === "/" || location === "/document"
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <FileText className={cn("h-4.5 w-4.5 mr-3", location === "/" || location === "/document" ? "text-primary" : "text-gray-500")} />
                    PRD Editor
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/roadmap">
                  <span
                    className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-lg cursor-pointer font-medium transition-colors",
                      location === "/roadmap"
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <Calendar className={cn("h-4.5 w-4.5 mr-3", location === "/roadmap" ? "text-primary" : "text-gray-500")} />
                    Roadmap Calendar
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/research">
                  <span
                    className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-lg cursor-pointer font-medium transition-colors",
                      location === "/research"
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <FileSearch className={cn("h-4.5 w-4.5 mr-3", location === "/research" ? "text-primary" : "text-gray-500")} />
                    Research Materials
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="px-3 mt-6">
            <button 
              onClick={() => toggleSection('recentProjects')}
              className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-gray-500 group"
            >
              <span>RECENT PROJECTS</span>
              <ChevronRight className={cn(
                "h-4 w-4 text-gray-400 transition-transform duration-200",
                expandedSections.recentProjects ? "rotate-90" : ""
              )} />
            </button>
            
            {expandedSections.recentProjects && (
              <ul className="mt-1 space-y-1">
                <li>
                  <a
                    href="#"
                    className="flex items-center px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50 group transition-colors"
                  >
                    <Folder className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                    <span>Mobile App Redesign</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50 group transition-colors"
                  >
                    <Folder className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                    <span>Q3 Feature Planning</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50 group transition-colors"
                  >
                    <Folder className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                    <span>User Research 2025</span>
                  </a>
                </li>
              </ul>
            )}
          </div>

          <div className="px-3 mt-4">
            <button 
              onClick={() => toggleSection('templates')}
              className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-gray-500 group"
            >
              <span>TEMPLATES</span>
              <ChevronRight className={cn(
                "h-4 w-4 text-gray-400 transition-transform duration-200",
                expandedSections.templates ? "rotate-90" : ""
              )} />
            </button>
            
            {expandedSections.templates && (
              <ul className="mt-1 space-y-1">
                <li>
                  <a
                    href="#"
                    className="flex items-center px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50 group transition-colors"
                  >
                    <LayoutTemplate className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                    <span>Basic PRD</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50 group transition-colors"
                  >
                    <LayoutTemplate className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                    <span>Feature Specification</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50 group transition-colors"
                  >
                    <LayoutTemplate className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                    <span>Market Research</span>
                  </a>
                </li>
              </ul>
            )}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full border-t border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium text-sm">PM</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Product Manager</p>
              <p className="text-xs text-gray-500">pm@example.com</p>
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
