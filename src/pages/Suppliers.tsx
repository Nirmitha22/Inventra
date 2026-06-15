import { useState } from "react";
import { Truck, Plus, Trash2, Edit, Loader2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSuppliers, useAddSupplier, useUpdateSupplier, useDeleteSupplier } from "@/hooks/useSuppliers";
import { useToast } from "@/hooks/use-toast";

const Suppliers = () => {
  const { data: suppliers, isLoading } = useSuppliers();
  const addSupplier = useAddSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSup, setEditSup] = useState<any>(null);
  const [form, setForm] = useState({ name: "", contact_name: "", email: "", phone: "", address: "", notes: "" });

  const resetForm = () => setForm({ name: "", contact_name: "", email: "", phone: "", address: "", notes: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      contact_name: form.contact_name || null,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      notes: form.notes || null,
    };
    try {
      if (editSup) {
        await updateSupplier.mutateAsync({ id: editSup.id, ...payload });
        toast({ title: "Supplier updated" });
      } else {
        await addSupplier.mutateAsync(payload);
        toast({ title: "Supplier added" });
      }
      resetForm(); setDialogOpen(false); setEditSup(null);
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const openEdit = (s: any) => {
    setEditSup(s);
    setForm({ name: s.name, contact_name: s.contact_name || "", email: s.email || "", phone: s.phone || "", address: s.address || "", notes: s.notes || "" });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try { await deleteSupplier.mutateAsync(id); toast({ title: "Supplier deleted" }); }
    catch { toast({ title: "Error", variant: "destructive" }); }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Suppliers</h2>
        <Button size="sm" onClick={() => { resetForm(); setEditSup(null); setDialogOpen(true); }}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : !suppliers?.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Truck className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-base font-semibold mb-1">No suppliers</h3>
            <p className="text-sm text-muted-foreground">Track your suppliers and vendor details here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {suppliers.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{s.name}</h4>
                    {s.contact_name && <p className="text-sm text-muted-foreground">{s.contact_name}</p>}
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                      {s.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</span>}
                      {s.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) { setEditSup(null); resetForm(); } setDialogOpen(o); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editSup ? "Edit" : "Add"} Supplier</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Company Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><Label>Contact Name</Label><Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div><Label>Address</Label><Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <Button type="submit" className="w-full" disabled={addSupplier.isPending || updateSupplier.isPending}>
              {(addSupplier.isPending || updateSupplier.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editSup ? "Save" : "Add"} Supplier
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Suppliers;
