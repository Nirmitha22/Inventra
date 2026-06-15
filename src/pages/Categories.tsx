import { useState } from "react";
import { FolderOpen, Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCategories, useAddCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";

const Categories = () => {
  const { data: categories, isLoading } = useCategories();
  const addCategory = useAddCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { toast } = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [editCat, setEditCat] = useState<any>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#2563EB");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await addCategory.mutateAsync({ name: name.trim(), color });
      toast({ title: "Category added" });
      setName(""); setColor("#2563EB"); setAddOpen(false);
    } catch { toast({ title: "Error", description: "Failed to add category.", variant: "destructive" }); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !editCat) return;
    try {
      await updateCategory.mutateAsync({ id: editCat.id, name: name.trim(), color });
      toast({ title: "Category updated" });
      setEditCat(null);
    } catch { toast({ title: "Error", description: "Failed to update.", variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      toast({ title: "Category deleted" });
    } catch { toast({ title: "Error", description: "Failed to delete.", variant: "destructive" }); }
  };

  const openEdit = (cat: any) => {
    setEditCat(cat);
    setName(cat.name);
    setColor(cat.color || "#2563EB");
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Categories</h2>
        <Button size="sm" onClick={() => { setName(""); setColor("#2563EB"); setAddOpen(true); }}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : !categories?.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-base font-semibold mb-1">No categories</h3>
            <p className="text-sm text-muted-foreground">Create categories to organize your inventory.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: cat.color || "#2563EB" }} />
                  <span className="font-medium">{cat.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(cat.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div><Label>Color</Label><Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-20" /></div>
            <Button type="submit" className="w-full" disabled={addCategory.isPending}>
              {addCategory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editCat} onOpenChange={(o) => !o && setEditCat(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div><Label>Color</Label><Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-20" /></div>
            <Button type="submit" className="w-full" disabled={updateCategory.isPending}>
              {updateCategory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
