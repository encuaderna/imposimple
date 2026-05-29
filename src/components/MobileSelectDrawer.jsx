import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown } from "lucide-react";

/**
 * Mobile-friendly Select wrapper that uses Drawer/BottomSheet on mobile
 * Falls back to regular Select on desktop
 */
export default function MobileSelectDrawer({ value, onValueChange, trigger, options, label }) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((opt) => opt.value === value)?.label || trigger;

  // On desktop (md+), render normally - let parent handle it
  // On mobile, use Drawer
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild className="md:hidden">
        <Button
          variant="outline"
          className="w-full justify-between text-xs rounded-xl"
        >
          <span>{selectedLabel}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="px-4 pb-4">
        {label && (
          <div className="text-xs font-semibold text-muted-foreground py-2">
            {label}
          </div>
        )}
        <ScrollArea className="max-h-60">
          <div className="space-y-2">
            {options.map((option) => (
              <Button
                key={option.value}
                variant={value === option.value ? "default" : "outline"}
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
                className="w-full justify-start text-xs rounded-xl"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}