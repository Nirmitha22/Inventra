import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBillingHistory, useClearHistory } from "@/hooks/useBillingHistory";
import { ArrowLeft, Receipt, Loader2, ShoppingBag, TrendingUp, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

export default function BillingHistoryPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: bills, isLoading } = useBillingHistory();
  const clearHistory = useClearHistory();

  // Confirmation state for clear action
  const [confirmClear, setConfirmClear] = useState(false);

  // Group bills by day and compute daily totals
  const groupedByDay: { date: string; bills: typeof bills; dayTotal: number }[] = [];
  if (bills) {
    const days: Record<string, { bills: typeof bills; dayTotal: number }> = {};
    bills.forEach((bill) => {
      const day = new Date(bill.created_at).toDateString();
      if (!days[day]) days[day] = { bills: [], dayTotal: 0 };
      days[day].bills!.push(bill);
      days[day].dayTotal += bill.total;
    });
    for (const [day, val] of Object.entries(days)) {
      groupedByDay.push({ date: day, bills: val.bills, dayTotal: val.dayTotal });
    }
  }

  const allTimeTotalBills = bills?.length ?? 0;
  const allTimeRevenue = bills?.reduce((s, b) => s + b.total, 0) ?? 0;

  const handleClearHistory = async () => {
    try {
      await clearHistory.mutateAsync();
      setConfirmClear(false);
      toast({ title: "History cleared", description: "All billing records have been deleted." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message ?? "Failed to clear history.", variant: "destructive" });
    }
  };

  return (
    <div className="p-4 space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Receipt size={20} className="text-primary" />
              Billing History
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">All completed transactions</p>
          </div>
        </div>

        {/* Clear history button — only shown when there are bills */}
        {!isLoading && allTimeTotalBills > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setConfirmClear(true)}
            disabled={clearHistory.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Inline confirmation prompt — no modal needed */}
      {confirmClear && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium text-destructive">
              Delete all billing history?
            </p>
            <p className="text-xs text-muted-foreground">
              This cannot be undone. Inventory stock levels will not be affected.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setConfirmClear(false)}
                disabled={clearHistory.isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1 gap-1.5"
                onClick={handleClearHistory}
                disabled={clearHistory.isPending}
              >
                {clearHistory.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {clearHistory.isPending ? "Clearing…" : "Yes, Delete All"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary stats */}
      {!isLoading && allTimeTotalBills > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="rounded-[1.5rem]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <ShoppingBag size={13} /> Total Bills
              </div>
              <p className="text-2xl font-bold text-foreground">{allTimeTotalBills}</p>
            </CardContent>
          </Card>
          <Card className="rounded-[1.5rem]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <TrendingUp size={13} /> All-time Revenue
              </div>
              <p className="text-2xl font-bold text-foreground">₹{allTimeRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : allTimeTotalBills === 0 ? (
        <Card className="border-dashed rounded-[1.5rem]">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <Receipt size={44} className="text-muted-foreground/30" />
            <h3 className="font-semibold text-base">No bills yet</h3>
            <p className="text-sm text-muted-foreground">Completed bills will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {groupedByDay.map(({ date, bills: dayBills, dayTotal }) => (
            <div key={date}>
              {/* Day header */}
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {new Date(date).toDateString() === new Date().toDateString()
                    ? "Today"
                    : formatDate(new Date(date).toISOString())}
                </p>
                <p className="text-xs font-bold text-primary">₹{dayTotal.toFixed(2)}</p>
              </div>

              <div className="space-y-2">
                {dayBills!.map((bill) => (
                  <Card key={bill.id} className="rounded-[1.25rem] border border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="font-semibold text-sm">
                            {bill.item_count} item{bill.item_count !== 1 ? "s" : ""} sold
                          </p>
                          <p className="text-xs text-muted-foreground">{formatTime(bill.created_at)}</p>
                        </div>
                        <p className="font-bold text-base shrink-0">₹{bill.total.toFixed(2)}</p>
                      </div>

                      <div className="space-y-0.5 border-t border-border pt-2">
                        {(bill.items_snapshot as any[]).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-muted-foreground">
                            <span>{item.name} × {item.qty}</span>
                            <span>₹{Number(item.subtotal).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
