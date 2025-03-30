import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  FileText,
  Calendar,
  FileSearch,
  Menu,
  X,
} from "lucide-react";

const Sidebar = () => {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md border border-neutral-200 text-text"
        onClick={toggleMobileMenu}
        aria-label="Toggle Menu"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "bg-neutral-100 w-64 flex-shrink-0 fixed md:relative inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-center h-16 border-b border-neutral-200">
          <h1 className="text-lg font-semibold text-primary">Product Management Assistant</h1>
        </div>

        <nav className="mt-4">
          <div className="px-4 py-2">
            <h2 className="text-sm font-semibold text-text mb-2">WORKSPACE</h2>
            <ul>
              <li className="mb-1">
                <Link href="/document">
                  <a
                    className={cn(
                      "flex items-center px-4 py-2 text-sm rounded-md",
                      location === "/" || location === "/document"
                        ? "bg-primary text-white"
                        : "text-text hover:bg-neutral-200"
                    )}
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    PRD Editor
                  </a>
                </Link>
              </li>
              <li className="mb-1">
                <Link href="/roadmap">
                  <a
                    className={cn(
                      "flex items-center px-4 py-2 text-sm rounded-md",
                      location === "/roadmap"
                        ? "bg-primary text-white"
                        : "text-text hover:bg-neutral-200"
                    )}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Roadmap Calendar
                  </a>
                </Link>
              </li>
              <li className="mb-1">
                <Link href="/research">
                  <a
                    className={cn(
                      "flex items-center px-4 py-2 text-sm rounded-md",
                      location === "/research"
                        ? "bg-primary text-white"
                        : "text-text hover:bg-neutral-200"
                    )}
                  >
                    <FileSearch className="h-5 w-5 mr-2" />
                    Research Materials
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div className="px-4 py-2 mt-4">
            <h2 className="text-sm font-semibold text-text mb-2">RECENT PROJECTS</h2>
            <ul>
              <li className="mb-1">
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm rounded-md text-text hover:bg-neutral-200"
                >
                  Mobile App Redesign
                </a>
              </li>
              <li className="mb-1">
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm rounded-md text-text hover:bg-neutral-200"
                >
                  Q3 Feature Planning
                </a>
              </li>
              <li className="mb-1">
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm rounded-md text-text hover:bg-neutral-200"
                >
                  User Research 2023
                </a>
              </li>
            </ul>
          </div>

          <div className="px-4 py-2 mt-4">
            <h2 className="text-sm font-semibold text-text mb-2">TEMPLATES</h2>
            <ul>
              <li className="mb-1">
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm rounded-md text-text hover:bg-neutral-200"
                >
                  Basic PRD
                </a>
              </li>
              <li className="mb-1">
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm rounded-md text-text hover:bg-neutral-200"
                >
                  Feature Specification
                </a>
              </li>
              <li className="mb-1">
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm rounded-md text-text hover:bg-neutral-200"
                >
                  Market Research
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
