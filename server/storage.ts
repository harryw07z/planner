import {
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  documents, type Document, type InsertDocument,
  materials, type Material, type InsertMaterial,
  materialAnalyses, type MaterialAnalysis, type InsertMaterialAnalysis,
  features, type Feature, type InsertFeature,
  roadmapEvents, type RoadmapEvent, type InsertRoadmapEvent
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByProjectId(projectId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;

  // Material operations
  getMaterial(id: number): Promise<Material | undefined>;
  getMaterialsByProjectId(projectId: number): Promise<Material[]>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  deleteMaterial(id: number): Promise<boolean>;

  // Material Analysis operations
  getMaterialAnalysis(id: number): Promise<MaterialAnalysis | undefined>;
  getMaterialAnalysesByMaterialId(materialId: number): Promise<MaterialAnalysis[]>;
  createMaterialAnalysis(analysis: InsertMaterialAnalysis): Promise<MaterialAnalysis>;

  // Feature operations
  getFeature(id: number): Promise<Feature | undefined>;
  getFeaturesByProjectId(projectId: number): Promise<Feature[]>;
  createFeature(feature: InsertFeature): Promise<Feature>;
  updateFeature(id: number, feature: Partial<Feature>): Promise<Feature | undefined>;
  deleteFeature(id: number): Promise<boolean>;

  // Roadmap Event operations
  getRoadmapEvent(id: number): Promise<RoadmapEvent | undefined>;
  getRoadmapEventsByProjectId(projectId: number): Promise<RoadmapEvent[]>;
  createRoadmapEvent(event: InsertRoadmapEvent): Promise<RoadmapEvent>;
  updateRoadmapEvent(id: number, event: Partial<RoadmapEvent>): Promise<RoadmapEvent | undefined>;
  deleteRoadmapEvent(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private documents: Map<number, Document>;
  private materials: Map<number, Material>;
  private materialAnalyses: Map<number, MaterialAnalysis>;
  private features: Map<number, Feature>;
  private roadmapEvents: Map<number, RoadmapEvent>;

  private userIdCounter: number;
  private projectIdCounter: number;
  private documentIdCounter: number;
  private materialIdCounter: number;
  private materialAnalysisIdCounter: number;
  private featureIdCounter: number;
  private roadmapEventIdCounter: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.documents = new Map();
    this.materials = new Map();
    this.materialAnalyses = new Map();
    this.features = new Map();
    this.roadmapEvents = new Map();
    
    this.userIdCounter = 1;
    this.projectIdCounter = 1;
    this.documentIdCounter = 1;
    this.materialIdCounter = 1;
    this.materialAnalysisIdCounter = 1;
    this.featureIdCounter = 1;
    this.roadmapEventIdCounter = 1;

    // Create a default user
    this.createUser({ username: "demo", password: "password" });
    
    // Create a default project
    const projectId = this.createProject({ 
      name: "Mobile App Redesign", 
      description: "Redesign of the mobile app with enhanced UX", 
      userId: 1 
    }).id;

    // Create a default document
    this.createDocument({
      title: "Mobile App Redesign PRD",
      content: "",
      projectId
    });

    // Create default features
    this.createFeature({
      name: "Redesigned Onboarding",
      description: "Create a simplified onboarding flow that highlights key features and reduces friction.",
      priority: "high",
      duration: 14, // 2 weeks
      projectId
    });

    this.createFeature({
      name: "User Dashboard",
      description: "Develop a customizable dashboard that adapts to user behavior and provides quick access to frequently used features.",
      priority: "high",
      duration: 21, // 3 weeks
      projectId
    });

    this.createFeature({
      name: "Search Functionality",
      description: "Implement advanced search with filters, recent searches, and predictive suggestions.",
      priority: "medium",
      duration: 14, // 2 weeks
      projectId
    });

    this.createFeature({
      name: "Checkout Process",
      description: "Streamline the checkout process to reduce cart abandonment.",
      priority: "high",
      duration: 7, // 1 week
      projectId
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.userId === userId);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const createdAt = new Date();
    const newProject: Project = { ...project, id, createdAt };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) return undefined;
    
    const updatedProject = { ...existingProject, ...project };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByProjectId(projectId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.projectId === projectId);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const newDocument: Document = { ...document, id, createdAt, updatedAt };
    this.documents.set(id, newDocument);
    return newDocument;
  }

  async updateDocument(id: number, document: Partial<Document>): Promise<Document | undefined> {
    const existingDocument = this.documents.get(id);
    if (!existingDocument) return undefined;
    
    const updatedDocument = { 
      ...existingDocument, 
      ...document, 
      updatedAt: new Date() 
    };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Material operations
  async getMaterial(id: number): Promise<Material | undefined> {
    return this.materials.get(id);
  }

  async getMaterialsByProjectId(projectId: number): Promise<Material[]> {
    return Array.from(this.materials.values()).filter(material => material.projectId === projectId);
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    const id = this.materialIdCounter++;
    const uploadedAt = new Date();
    const newMaterial: Material = { ...material, id, uploadedAt };
    this.materials.set(id, newMaterial);
    return newMaterial;
  }

  async deleteMaterial(id: number): Promise<boolean> {
    return this.materials.delete(id);
  }

  // Material Analysis operations
  async getMaterialAnalysis(id: number): Promise<MaterialAnalysis | undefined> {
    return this.materialAnalyses.get(id);
  }

  async getMaterialAnalysesByMaterialId(materialId: number): Promise<MaterialAnalysis[]> {
    return Array.from(this.materialAnalyses.values()).filter(analysis => analysis.materialId === materialId);
  }

  async createMaterialAnalysis(analysis: InsertMaterialAnalysis): Promise<MaterialAnalysis> {
    const id = this.materialAnalysisIdCounter++;
    const analyzedAt = new Date();
    const newAnalysis: MaterialAnalysis = { ...analysis, id, analyzedAt };
    this.materialAnalyses.set(id, newAnalysis);
    return newAnalysis;
  }

  // Feature operations
  async getFeature(id: number): Promise<Feature | undefined> {
    return this.features.get(id);
  }

  async getFeaturesByProjectId(projectId: number): Promise<Feature[]> {
    return Array.from(this.features.values()).filter(feature => feature.projectId === projectId);
  }

  async createFeature(feature: InsertFeature): Promise<Feature> {
    const id = this.featureIdCounter++;
    const newFeature: Feature = { ...feature, id };
    this.features.set(id, newFeature);
    return newFeature;
  }

  async updateFeature(id: number, feature: Partial<Feature>): Promise<Feature | undefined> {
    const existingFeature = this.features.get(id);
    if (!existingFeature) return undefined;
    
    const updatedFeature = { ...existingFeature, ...feature };
    this.features.set(id, updatedFeature);
    return updatedFeature;
  }

  async deleteFeature(id: number): Promise<boolean> {
    return this.features.delete(id);
  }

  // Roadmap Event operations
  async getRoadmapEvent(id: number): Promise<RoadmapEvent | undefined> {
    return this.roadmapEvents.get(id);
  }

  async getRoadmapEventsByProjectId(projectId: number): Promise<RoadmapEvent[]> {
    return Array.from(this.roadmapEvents.values()).filter(event => event.projectId === projectId);
  }

  async createRoadmapEvent(event: InsertRoadmapEvent): Promise<RoadmapEvent> {
    const id = this.roadmapEventIdCounter++;
    const newEvent: RoadmapEvent = { ...event, id };
    this.roadmapEvents.set(id, newEvent);
    return newEvent;
  }

  async updateRoadmapEvent(id: number, event: Partial<RoadmapEvent>): Promise<RoadmapEvent | undefined> {
    const existingEvent = this.roadmapEvents.get(id);
    if (!existingEvent) return undefined;
    
    const updatedEvent = { ...existingEvent, ...event };
    this.roadmapEvents.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteRoadmapEvent(id: number): Promise<boolean> {
    return this.roadmapEvents.delete(id);
  }
}

export const storage = new MemStorage();
