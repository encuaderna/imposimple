import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { TECHNICAL_MARKS } from "@/lib/imposition-engine";
import { Crosshair } from "lucide-react";

export default function MarksConfigTable({ marksConfig, onMarksChange }) {
  const toggle = (key) => {
    onMarksChange({ ...marksConfig, [key]: !marksConfig[key] });
  };

  const enabledCount = Object.values(marksConfig).filter(Boolean).length;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <Crosshair className="w-4 h-4" />
            Marcas Técnicas
          </CardTitle>
          <Badge variant="secondary" className="font-mono text-xs">
            {enabledCount}/{Object.keys(TECHNICAL_MARKS).length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {Object.entries(TECHNICAL_MARKS).map(([key, mark]) => (
            <div
              key={key}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => toggle(key)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium group-hover:text-foreground transition-colors">
                  {mark.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {mark.description}
                </p>
              </div>
              <Switch
                checked={marksConfig[key] || false}
                onCheckedChange={() => toggle(key)}
                className="ml-3"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}