import { Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const SettingsPage = () => {
  return (
    <div className="space-y-4 p-4">
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Settings className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-base font-semibold mb-1">Settings</h3>
          <p className="text-sm text-muted-foreground">App preferences and data management options coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
