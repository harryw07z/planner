import {
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  documents, type Document, type InsertDocument,
  materials, type Material, type InsertMaterial,
  materialAnalyses, type MaterialAnalysis, type InsertMaterialAnalysis,
  features, type Feature, type InsertFeature,
  roadmapEvents, type RoadmapEvent, type InsertRoadmapEvent
} from "@shared/schema";
import { db } from "./db";
import { eq, and, count } from "drizzle-orm";

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
    this.createProject({ 
      name: "Mobile App Redesign", 
      description: "Redesign of the mobile app with enhanced UX", 
      userId: 1 
    }).then(project => {
      const projectId = project.id;

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

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  }

  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getDocumentsByProjectId(projectId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.projectId, projectId));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: number, document: Partial<Document>): Promise<Document | undefined> {
    // Always update the updatedAt field
    const updatedFields = {
      ...document,
      updatedAt: new Date()
    };
    
    const [updatedDocument] = await db
      .update(documents)
      .set(updatedFields)
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    await db.delete(documents).where(eq(documents.id, id));
    return true;
  }

  // Material operations
  async getMaterial(id: number): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.id, id));
    return material || undefined;
  }

  async getMaterialsByProjectId(projectId: number): Promise<Material[]> {
    return await db.select().from(materials).where(eq(materials.projectId, projectId));
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    const [newMaterial] = await db.insert(materials).values(material).returning();
    return newMaterial;
  }

  async deleteMaterial(id: number): Promise<boolean> {
    await db.delete(materials).where(eq(materials.id, id));
    return true;
  }

  // Material Analysis operations
  async getMaterialAnalysis(id: number): Promise<MaterialAnalysis | undefined> {
    const [analysis] = await db.select().from(materialAnalyses).where(eq(materialAnalyses.id, id));
    return analysis || undefined;
  }

  async getMaterialAnalysesByMaterialId(materialId: number): Promise<MaterialAnalysis[]> {
    return await db.select().from(materialAnalyses).where(eq(materialAnalyses.materialId, materialId));
  }

  async createMaterialAnalysis(analysis: InsertMaterialAnalysis): Promise<MaterialAnalysis> {
    const [newAnalysis] = await db.insert(materialAnalyses).values(analysis).returning();
    return newAnalysis;
  }

  // Feature operations
  async getFeature(id: number): Promise<Feature | undefined> {
    const [feature] = await db.select().from(features).where(eq(features.id, id));
    return feature || undefined;
  }

  async getFeaturesByProjectId(projectId: number): Promise<Feature[]> {
    return await db.select().from(features).where(eq(features.projectId, projectId));
  }

  async createFeature(feature: InsertFeature): Promise<Feature> {
    const [newFeature] = await db.insert(features).values(feature).returning();
    return newFeature;
  }

  async updateFeature(id: number, feature: Partial<Feature>): Promise<Feature | undefined> {
    const [updatedFeature] = await db
      .update(features)
      .set(feature)
      .where(eq(features.id, id))
      .returning();
    return updatedFeature || undefined;
  }

  async deleteFeature(id: number): Promise<boolean> {
    await db.delete(features).where(eq(features.id, id));
    return true;
  }

  // Roadmap Event operations
  async getRoadmapEvent(id: number): Promise<RoadmapEvent | undefined> {
    const [event] = await db.select().from(roadmapEvents).where(eq(roadmapEvents.id, id));
    return event || undefined;
  }

  async getRoadmapEventsByProjectId(projectId: number): Promise<RoadmapEvent[]> {
    return await db.select().from(roadmapEvents).where(eq(roadmapEvents.projectId, projectId));
  }

  async createRoadmapEvent(event: InsertRoadmapEvent): Promise<RoadmapEvent> {
    const [newEvent] = await db.insert(roadmapEvents).values(event).returning();
    return newEvent;
  }

  async updateRoadmapEvent(id: number, event: Partial<RoadmapEvent>): Promise<RoadmapEvent | undefined> {
    const [updatedEvent] = await db
      .update(roadmapEvents)
      .set(event)
      .where(eq(roadmapEvents.id, id))
      .returning();
    return updatedEvent || undefined;
  }

  async deleteRoadmapEvent(id: number): Promise<boolean> {
    await db.delete(roadmapEvents).where(eq(roadmapEvents.id, id));
    return true;
  }

  // Method to initialize the database with sample data
  async initializeWithSampleData(): Promise<void> {
    // Check if there are already users in the database
    const userCount = await db.select({ count: count() }).from(users);
    if (userCount[0].count > 0) {
      return; // Database already has data, don't initialize
    }

    // Create a default user
    const [user] = await db.insert(users)
      .values({ username: "demo", password: "password" })
      .returning();

    // Create a default project
    const [project] = await db.insert(projects)
      .values({
        name: "Mobile App Redesign",
        description: "Redesign of the mobile app with enhanced UX",
        userId: user.id
      })
      .returning();

    // Create a default document
    await db.insert(documents)
      .values({
        title: "Mobile App Redesign PRD",
        content: "",
        projectId: project.id
      });

    // Create default features
    await db.insert(features)
      .values([
        {
          name: "Redesigned Onboarding",
          description: "Create a simplified onboarding flow that highlights key features and reduces friction.",
          priority: "high",
          duration: 14, // 2 weeks
          projectId: project.id
        },
        {
          name: "User Dashboard",
          description: "Develop a customizable dashboard that adapts to user behavior and provides quick access to frequently used features.",
          priority: "high",
          duration: 21, // 3 weeks
          projectId: project.id
        },
        {
          name: "Search Functionality",
          description: "Implement advanced search with filters, recent searches, and predictive suggestions.",
          priority: "medium",
          duration: 14, // 2 weeks
          projectId: project.id
        },
        {
          name: "Checkout Process",
          description: "Streamline the checkout process to reduce cart abandonment.",
          priority: "high",
          duration: 7, // 1 week
          projectId: project.id
        }
      ]);
  }
}

// Switch to database storage
export const storage = new DatabaseStorage();

// Initialize the database with sample data
storage.initializeWithSampleData().catch(console.error);
