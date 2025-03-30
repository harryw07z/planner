// Project types
export interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt: string; // ISO date string
}

// Document types
export interface Document {
  id: number;
  title: string;
  content?: string;
  projectId: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Material types
export interface Material {
  id: number;
  name: string;
  type: string;
  size: number;
  projectId: number;
  uploadedAt: string; // ISO date string
}

// Analysis types
export interface Insight {
  text: string;
}

export interface Recommendation {
  title: string;
  description: string;
}

export interface MaterialAnalysis {
  id: number;
  materialId: number;
  insights: {
    insights: string[];
    recommendations: Recommendation[];
  };
  analyzedAt: string; // ISO date string
}

// Feature types
export type PriorityLevel = 'high' | 'medium' | 'low';

export interface Feature {
  id: number;
  name: string;
  description?: string;
  priority: PriorityLevel;
  duration: number; // in days
  projectId: number;
}

// Roadmap event types
export interface RoadmapEvent {
  id: number;
  featureId: number;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  projectId: number;
}

// Calendar types
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: RoadmapEventWithFeature[];
}

export interface RoadmapEventWithFeature extends RoadmapEvent {
  feature: Feature;
}

// File upload types
export interface FileUploadState {
  isDragging: boolean;
  isUploading: boolean;
  progress: number;
  error: string | null;
}
