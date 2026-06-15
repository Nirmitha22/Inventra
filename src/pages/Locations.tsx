import { useState } from "react";
import { MapPin, Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocations, useAddLocation, useUpdateLocation, useDeleteLocation } from "@/hooks/useLocations";
import { useToast } from "@/hooks/use-toast";

const Locations = () => {
  const { data: locations, isLoading } = useLocations();
  const addLocation = useAddLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();
  const { toast } = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [editLoc, setEditLoc] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await addLocation.mutateAsync({ name: name.trim(), description: description || null });
      toast({ title: "Location added" });
      setName(""); setDescription(""); setAddOpen(false);
    } catch { toast({ title: "Error", description: "Failed to add.", variant: "destructive" }); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !editLoc) return;
    try {
      await updateLocation.mutateAsync({ id: editLoc.id, name: name.trim(), description: description || null });
      toast({ title: "Location updated" });
      setEditLoc(null);
    } catch { toast({ title: "Error", description: "Failed to update.", variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLocation.mutateAsync(id);
      toast({ title: "Location deleted" });
    } catch { toast({ title: "Error", description: "Failed to delete.", variant: "destructive" }); }
  };

  const openEdit = (loc: any) => { setEditLoc(loc); setName(loc.name); setDescription(loc.description || ""); };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Locations</h2>
        <Button size="sm" onClick={() => { setName(""); setDescription(""); setAddOpen(true); }}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : !locations?.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-base font-semibold mb-1">No locations</h3>
            <p className="text-sm text-muted-foreground">Add locations like rooms, stores, or warehouses.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {locations.map((loc) => (
            <Card key={loc.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h4 className="font-medium">{loc.name}</h4>
                  {loc.description && <p className="text-sm text-muted-foreground">{loc.description}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(loc)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(loc.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Location</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <Button type="submit" className="w-full" disabled={addLocation.isPending}>
              {addLocation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editLoc} onOpenChange={(o) => !o && setEditLoc(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Location</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <Button type="submit" className="w-full" disabled={updateLocation.isPending}>
              {updateLocation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Locations;
