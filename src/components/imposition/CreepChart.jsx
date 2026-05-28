import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";

export default function CreepChart({ signatures }) {
  if (!signatures || signatures.length === 0) return null;

  // Flatten all sheets with their creep values
  const data = [];
  signatures.forEach((sig) => {
    sig.sheets.forEach((sheet) => {
      data.push({
        name: `C${sig.signatureNumber}-H${sheet.sheetIndex + 1}`,
        creep: sheet.creep,
        signature: sig.signatureNumber,
      });
    });
  });

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
          <TrendingUp className="w-4 h-4" />
          Distribución de Creep
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: "hsl(var(--muted-foreground))" }}
                interval={data.length > 20 ? 3 : 0}
                angle={-45}
                textAnchor="end"
                height={40}
              />
              <YAxis
                tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: "hsl(var(--muted-foreground))" }}
                unit="mm"
                width={45}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontFamily: "JetBrains Mono",
                  fontSize: 12,
                }}
                formatter={(value) => [`${value} mm`, "Creep"]}
              />
              <Bar
                dataKey="creep"
                fill="hsl(var(--primary))"
                radius={[3, 3, 0, 0]}
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}