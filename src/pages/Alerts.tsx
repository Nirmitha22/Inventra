import { Bell, CheckCheck, Loader2, AlertTriangle, Clock, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAlerts, useMarkAlertRead, useMarkAllAlertsRead } from "@/hooks/useAlerts";

const alertIcons: Record<string, any> = {
  low_stock: AlertTriangle,
  out_of_stock: PackageX,
  expiring: Clock,
  expired: Clock,
};

const alertColors: Record<string, string> = {
  low_stock: "bg-warning/10 text-warning",
  out_of_stock: "bg-destructive/10 text-destructive",
  expiring: "bg-warning/10 text-warning",
  expired: "bg-destructive/10 text-destructive",
};

const Alerts = () => {
  const { data: alerts, isLoading } = useAlerts();
  const markRead = useMarkAlertRead();
  const markAllRead = useMarkAllAlertsRead();

  const unreadCount = alerts?.filter((a) => !a.is_read).length ?? 0;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Alerts {unreadCount > 0 && <Badge className="ml-2">{unreadCount}</Badge>}</h2>
        {unreadCount > 0 && (
          <Button size="sm" variant="outline" onClick={() => markAllRead.mutate()}>
            <CheckCheck className="mr-1 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : !alerts?.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-base font-semibold mb-1">No alerts</h3>
            <p className="text-sm text-muted-foreground">You're all caught up! Alerts will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const Icon = alertIcons[alert.type] || Bell;
            return (
              <Card key={alert.id} className={alert.is_read ? "opacity-60" : ""}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className={`rounded-lg p-2 ${alertColors[alert.type] || "bg-muted"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(alert as any).items?.name && `Item: ${(alert as any).items.name} · `}
                      {new Date(alert.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {!alert.is_read && (
                    <Button variant="ghost" size="sm" className="shrink-0 text-xs" onClick={() => markRead.mutate(alert.id)}>
                      Read
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Alerts;
