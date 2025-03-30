import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import FeatureCard from "@/components/roadmap/FeatureCard";
import CalendarGrid from "@/components/roadmap/CalendarGrid";
import { Feature, PriorityLevel } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Make sure the type is included at the top of your file if not already there
type PriorityLevel = "high" | "medium" | "low";

const RoadmapCalendar = () => {
  const [newFeatureOpen, setNewFeatureOpen] = useState(false);
  const [featureName, setFeatureName] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [featurePriority, setFeaturePriority] = useState<PriorityLevel>("medium");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 14); // Default to 14 days from now
    return date;
  });
  const { toast } = useToast();

  // Default project ID for demo
  const projectId = 1;

  // Fetch features
  const {
    data: features = [],
    isLoading: featuresLoading,
  } = useQuery({
    queryKey: ['/api/features', { projectId }],
    queryFn: () => apiRequest('GET', `/api/features?projectId=${projectId}`).then(res => res.json()),
  });

  // Fetch roadmap events
  const {
    data: roadmapEvents = [],
    isLoading: eventsLoading,
  } = useQuery({
    queryKey: ['/api/roadmap-events', { projectId }],
    queryFn: () => apiRequest('GET', `/api/roadmap-events?projectId=${projectId}`).then(res => res.json()),
  });

  // Create feature mutation
  const createFeature = useMutation({
    mutationFn: async (feature: { 
      name: string; 
      description: string; 
      priority: PriorityLevel; 
      projectId: number;
      startDate: string;
      endDate: string;
      duration: number;
    }) => {
      return apiRequest('POST', '/api/features', feature).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "Feature created",
        description: "Your feature has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/features'] });
      setNewFeatureOpen(false);
      resetFeatureForm();
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create roadmap event mutation
  const createRoadmapEvent = useMutation({
    mutationFn: async (event: { featureId: number; startDate: Date; endDate: Date; projectId: number }) => {
      // Format dates to ISO strings for the API
      const formattedEvent = {
        featureId: event.featureId,
        projectId: event.projectId,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
      };
      return apiRequest('POST', '/api/roadmap-events', formattedEvent).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "Event scheduled",
        description: "Your feature has been scheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/roadmap-events'] });
    },
    onError: (error: any) => {
      toast({
        title: "Scheduling failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFeatureSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!featureName.trim()) {
      toast({
        title: "Validation error",
        description: "Feature name is required",
        variant: "destructive",
      });
      return;
    }

    // Calculate duration in days
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    createFeature.mutate({
      name: featureName,
      description: featureDescription,
      priority: featurePriority,
      projectId,
      duration,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }, {
      onSuccess: (newFeature) => {
        // Create a roadmap event for this feature
        createRoadmapEvent.mutate({
          featureId: newFeature.id,
          startDate,
          endDate,
          projectId,
        });
        setNewFeatureOpen(false);
        resetFeatureForm();
      }
    });
  };

  const resetFeatureForm = () => {
    setFeatureName("");
    setFeatureDescription("");
    setFeaturePriority("medium");
    setStartDate(new Date());
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + 14);
    setEndDate(newEndDate);
  };

  const handleAddEvent = (featureId: number, startDate: Date, endDate: Date, projectId: number) => {
    createRoadmapEvent.mutate({
      featureId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      projectId,
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="py-6 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text">Project Roadmap</h2>
            <p className="text-sm text-neutral-500">Plan and visualize your project timeline</p>
          </div>
          <div className="flex">
            <Dialog open={newFeatureOpen} onOpenChange={setNewFeatureOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Feature</DialogTitle>
                  <DialogDescription>
                    Create a new feature to add to your product roadmap.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleFeatureSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Feature Name</Label>
                      <Input
                        id="name"
                        value={featureName}
                        onChange={(e) => setFeatureName(e.target.value)}
                        placeholder="Enter feature name"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate.toISOString().split('T')[0]}
                        onChange={(e) => {
                          const newStartDate = new Date(e.target.value);
                          setStartDate(newStartDate);

                          // Update end date based on duration
                          const newEndDate = new Date(newStartDate);
                          newEndDate.setDate(newStartDate.getDate() + 14);
                          setEndDate(newEndDate);
                        }}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate.toISOString().split('T')[0]}
                        onChange={(e) => setEndDate(new Date(e.target.value))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={featureDescription}
                        onChange={(e) => setFeatureDescription(e.target.value)}
                        placeholder="Enter feature description"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={featurePriority} onValueChange={(value: PriorityLevel) => setFeaturePriority(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createFeature.isPending || createRoadmapEvent.isPending}>
                      {createFeature.isPending ? "Creating..." : "Create Feature"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-4">
          <div className="w-full md:w-1/4">
            <div className="bg-white border border-neutral-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-3">Feature Backlog</h3>
              <p className="text-sm text-neutral-500 mb-4">Drag features to the calendar to schedule</p>

              {/* Feature Cards */}
              {featuresLoading ? (
                <div className="py-4 text-center text-sm text-neutral-500">Loading features...</div>
              ) : features.length === 0 ? (
                <div className="py-4 text-center text-sm text-neutral-500">No features available</div>
              ) : (
                <div className="space-y-3">
                  {features.map((feature: Feature) => (
                    <FeatureCard
                      key={feature.id}
                      feature={feature}
                      isBacklog={true}
                    />
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                className="w-full mt-2 py-2 text-sm text-primary border-primary"
                onClick={() => setNewFeatureOpen(true)}
              >
                + Add New Feature
              </Button>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg p-4">
              <h3 className="font-medium mb-3">Team Members</h3>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center mb-2 mr-3">
                  <Avatar className="h-7 w-7 mr-2">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>SK</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">Sarah K.</span>
                </div>
                <div className="flex items-center mb-2 mr-3">
                  <Avatar className="h-7 w-7 mr-2">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>MR</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">Michael R.</span>
                </div>
                <div className="flex items-center mb-2 mr-3">
                  <Avatar className="h-7 w-7 mr-2">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JT</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">Jessica T.</span>
                </div>
                <Button variant="outline" size="icon" className="h-7 w-7 rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="w-full md:w-3/4">
            {eventsLoading || featuresLoading ? (
              <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
                <p className="text-neutral-500">Loading calendar...</p>
              </div>
            ) : (
              <CalendarGrid 
                features={features} 
                events={roadmapEvents} 
                onAddEvent={handleAddEvent} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapCalendar;