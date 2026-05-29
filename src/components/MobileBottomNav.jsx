import React from "react";
import { Button } from "@/components/ui/button";
import { FolderOpen, Settings2, Eye } from "lucide-react";

const TABS = [
  { id: "projects", label: "Proyectos", icon: FolderOpen },
  { id: "config", label: "Configuración", icon: Settings2 },
  { id: "preview", label: "Vista previa", icon: Eye },
];

export default function MobileBottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm z-40 md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {TABS.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeTab === id ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange(id)}
            className="flex-col gap-1 h-full w-full rounded-none"
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}