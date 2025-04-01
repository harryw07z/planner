import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import multer from "multer";
import openai from "./openai";
import { insertDocumentSchema, insertFeatureSchema, insertMaterialSchema, insertRoadmapEventSchema } from "@shared/schema";

const memStorage = multer.memoryStorage();
const upload = multer({ storage: memStorage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB limit

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiRouter = express.Router();
  app.use("/api", apiRouter);

  // Projects API
  apiRouter.get("/projects", async (req, res) => {
    const userId = 1; // Default user for demo
    const projects = await storage.getProjectsByUserId(userId);
    res.json(projects);
  });

  apiRouter.get("/projects/:id", async (req, res) => {
    const projectId = parseInt(req.params.id);
    const project = await storage.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.json(project);
  });

  // Documents API
  apiRouter.get("/documents", async (req, res) => {
    if (req.query.projectId) {
      const projectId = parseInt(req.query.projectId as string);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const documents = await storage.getDocumentsByProjectId(projectId);
      res.json(documents);
    } else {
      // If no projectId is provided, return all documents for demo
      // Use project ID 1 as default for the demo
      const documents = await storage.getDocumentsByProjectId(1);
      res.json(documents);
    }
  });

  apiRouter.get("/documents/:id", async (req, res) => {
    const documentId = parseInt(req.params.id);
    const document = await storage.getDocument(documentId);
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    res.json(document);
  });

  apiRouter.post("/documents", async (req, res) => {
    try {
      // Add default projectId if not provided
      const documentData = {
        ...req.body,
        projectId: req.body.projectId || 1 // Default projectId for demo
      };
      const validatedData = insertDocumentSchema.parse(documentData);
      const document = await storage.createDocument(validatedData);
      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ message: "Invalid document data", error });
    }
  });

  apiRouter.put("/documents/:id", async (req, res) => {
    const documentId = parseInt(req.params.id);
    
    try {
      const document = await storage.updateDocument(documentId, req.body);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Set content type explicitly to ensure it's treated as JSON
      res.setHeader('Content-Type', 'application/json');
      // Also set X-API-Response to help identify API responses
      res.setHeader('X-API-Response', 'true');
      res.json(document);
    } catch (error) {
      res.status(400).json({ message: "Invalid document data", error });
    }
  });
  
  apiRouter.patch("/documents/:id", async (req, res) => {
    const documentId = parseInt(req.params.id);
    
    try {
      const document = await storage.updateDocument(documentId, req.body);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Set content type explicitly to ensure it's treated as JSON
      res.setHeader('Content-Type', 'application/json');
      // Also set X-API-Response to help identify API responses
      res.setHeader('X-API-Response', 'true');
      res.json(document);
    } catch (error) {
      res.status(400).json({ message: "Invalid document data", error });
    }
  });

  // Materials API
  apiRouter.get("/materials", async (req, res) => {
    const projectId = parseInt(req.query.projectId as string);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    const materials = await storage.getMaterialsByProjectId(projectId);
    res.json(materials);
  });

  apiRouter.post("/materials/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const projectId = parseInt(req.body.projectId);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const material = await storage.createMaterial({
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        projectId,
        content: req.file.buffer.toString('base64')
      });

      res.status(201).json({
        id: material.id,
        name: material.name,
        type: material.type,
        size: material.size,
        uploadedAt: material.uploadedAt
      });
    } catch (error) {
      res.status(400).json({ message: "Error uploading file", error });
    }
  });

  apiRouter.get("/materials/:id", async (req, res) => {
    const materialId = parseInt(req.params.id);
    const material = await storage.getMaterial(materialId);
    
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }
    
    res.json({
      id: material.id,
      name: material.name,
      type: material.type,
      size: material.size,
      projectId: material.projectId,
      uploadedAt: material.uploadedAt
    });
  });

  apiRouter.get("/materials/:id/content", async (req, res) => {
    const materialId = parseInt(req.params.id);
    const material = await storage.getMaterial(materialId);
    
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }
    
    const contentBuffer = Buffer.from(material.content, 'base64');
    res.set('Content-Type', material.type);
    res.send(contentBuffer);
  });

  apiRouter.delete("/materials/:id", async (req, res) => {
    const materialId = parseInt(req.params.id);
    const success = await storage.deleteMaterial(materialId);
    
    if (!success) {
      return res.status(404).json({ message: "Material not found" });
    }
    
    res.status(204).send();
  });

  // Material Analysis API
  apiRouter.post("/materials/:id/analyze", async (req, res) => {
    const materialId = parseInt(req.params.id);
    const material = await storage.getMaterial(materialId);
    
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    try {
      // Convert base64 to text for analysis
      const contentBuffer = Buffer.from(material.content, 'base64');
      const textContent = contentBuffer.toString('utf-8');
      
      // Analyze the content
      const analysis = await openai.analyzeResearchMaterial(textContent);
      
      // Save analysis results
      const savedAnalysis = await storage.createMaterialAnalysis({
        materialId,
        insights: analysis
      });
      
      res.status(201).json(savedAnalysis);
    } catch (error: any) {
      res.status(500).json({ message: "Error analyzing material", error: error.message });
    }
  });

  apiRouter.get("/materials/:id/analysis", async (req, res) => {
    const materialId = parseInt(req.params.id);
    const analyses = await storage.getMaterialAnalysesByMaterialId(materialId);
    
    if (analyses.length === 0) {
      return res.status(404).json({ message: "No analysis found for this material" });
    }
    
    // Return the most recent analysis
    res.json(analyses[analyses.length - 1]);
  });

  // Generate PRD from analysis
  apiRouter.post("/documents/generate", async (req, res) => {
    try {
      const { projectId, title, insights } = req.body;
      
      if (!projectId || !title || !insights || !Array.isArray(insights)) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Generate PRD content
      const prdContent = await openai.generatePrdDraft(insights, title);
      
      // Create new document
      const document = await storage.createDocument({
        title,
        content: prdContent,
        projectId
      });
      
      res.status(201).json(document);
    } catch (error: any) {
      res.status(500).json({ message: "Error generating PRD", error: error.message });
    }
  });

  // Features API
  apiRouter.get("/features", async (req, res) => {
    const projectId = parseInt(req.query.projectId as string);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    const features = await storage.getFeaturesByProjectId(projectId);
    res.json(features);
  });
  
  // Generate feature ideas using AI
  apiRouter.post("/features/generate", async (req, res) => {
    try {
      const { projectId, description, count = 5 } = req.body;
      
      if (!projectId || !description) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Generate feature ideas
      const featureIdeas = await openai.generateFeatureIdeas(description, count);
      
      // Create feature objects for response
      const features = featureIdeas.map(idea => ({
        ...idea,
        projectId
      }));
      
      res.status(200).json(features);
    } catch (error: any) {
      res.status(500).json({ message: "Error generating feature ideas", error: error.message });
    }
  });

  apiRouter.post("/features", async (req, res) => {
    try {
      const validatedData = insertFeatureSchema.parse(req.body);
      const feature = await storage.createFeature(validatedData);
      res.status(201).json(feature);
    } catch (error) {
      res.status(400).json({ message: "Invalid feature data", error });
    }
  });

  apiRouter.put("/features/:id", async (req, res) => {
    const featureId = parseInt(req.params.id);
    
    try {
      const feature = await storage.updateFeature(featureId, req.body);
      
      if (!feature) {
        return res.status(404).json({ message: "Feature not found" });
      }
      
      res.json(feature);
    } catch (error) {
      res.status(400).json({ message: "Invalid feature data", error });
    }
  });

  apiRouter.delete("/features/:id", async (req, res) => {
    const featureId = parseInt(req.params.id);
    const success = await storage.deleteFeature(featureId);
    
    if (!success) {
      return res.status(404).json({ message: "Feature not found" });
    }
    
    res.status(204).send();
  });

  // Roadmap Events API
  apiRouter.get("/roadmap-events", async (req, res) => {
    const projectId = parseInt(req.query.projectId as string);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    const events = await storage.getRoadmapEventsByProjectId(projectId);
    res.json(events);
  });

  apiRouter.post("/roadmap-events", async (req, res) => {
    try {
      // Convert ISO string dates to Date objects if they're strings
      const data = {
        ...req.body,
        startDate: req.body.startDate instanceof Date ? req.body.startDate : new Date(req.body.startDate),
        endDate: req.body.endDate instanceof Date ? req.body.endDate : new Date(req.body.endDate)
      };
      
      const validatedData = insertRoadmapEventSchema.parse(data);
      const event = await storage.createRoadmapEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid roadmap event data", error });
    }
  });

  apiRouter.put("/roadmap-events/:id", async (req, res) => {
    const eventId = parseInt(req.params.id);
    
    try {
      // Handle date conversions if needed
      const data = { ...req.body };
      
      if (data.startDate && typeof data.startDate === 'string') {
        data.startDate = new Date(data.startDate);
      }
      
      if (data.endDate && typeof data.endDate === 'string') {
        data.endDate = new Date(data.endDate);
      }
      
      const event = await storage.updateRoadmapEvent(eventId, data);
      
      if (!event) {
        return res.status(404).json({ message: "Roadmap event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid roadmap event data", error });
    }
  });

  apiRouter.delete("/roadmap-events/:id", async (req, res) => {
    const eventId = parseInt(req.params.id);
    const success = await storage.deleteRoadmapEvent(eventId);
    
    if (!success) {
      return res.status(404).json({ message: "Roadmap event not found" });
    }
    
    res.status(204).send();
  });

  const httpServer = createServer(app);
  return httpServer;
}
