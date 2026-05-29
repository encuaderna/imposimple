import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Bookmark, Trash2, Download, Save, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function ProfileManager({ config, onLoad, profiles, onSave, onRemove }) {
  const [name, setName] = useState("");
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleSave = () => {
    const profileName = name.trim() || `Perfil ${new Date().toLocaleDateString("es")}`;
    onSave(profileName, config);
    setName("");
    toast.success(`Perfil «${profileName}» guardado`);
  };

  const handleLoad = (profile) => {
    onLoad(profile.config);
    toast.success(`Perfil «${profile.name}» cargado`);
  };

  const handleRemove = (profile) => {
    onRemove(profile.name);
    toast.success(`Perfil «${profile.name}» eliminado`);
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      // Delete account using base44 auth API
      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        toast.success("Cuenta eliminada exitosamente");
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        toast.error("Error eliminando la cuenta");
      }
    } catch (e) {
      console.error("Error:", e);
      toast.error("Error eliminando la cuenta");
    } finally {
      setDeletingAccount(false);
      setShowDeleteAccount(false);
    }
  };

  return (
    <Card className="border-amber-200/60 bg-amber-50/40 dark:border-amber-800/40 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-700 dark:text-amber-400 uppercase tracking-wider">
          <Bookmark className="w-4 h-4" />
          Perfiles guardados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Guardar perfil actual */}
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del perfil…"
            className="text-xs bg-background/60 h-8"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <Button size="sm" variant="outline" onClick={handleSave} className="h-8 px-2.5 shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400">
            <Save className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Lista de perfiles */}
        {profiles.length === 0 ? (
          <p className="text-[11px] text-muted-foreground text-center py-2">
            Aún no hay perfiles guardados.<br />Guarda la configuración actual para reutilizarla.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {profiles.map((profile) => (
              <li key={profile.name} className="flex items-center gap-2 bg-background/60 border border-border/40 rounded-lg px-2.5 py-1.5">
                <span className="text-xs flex-1 truncate font-medium">{profile.name}</span>
                <button
                  onClick={() => handleLoad(profile)}
                  className="text-primary hover:text-primary/70 transition-colors"
                  title="Cargar perfil"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleRemove(profile)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  title="Eliminar perfil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Delete Account Section */}
        <div className="pt-3 border-t border-border/30">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => setShowDeleteAccount(true)}
          >
            <LogOut className="w-3.5 h-3.5" />
            Eliminar cuenta
          </Button>
        </div>
      </CardContent>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogTitle className="text-base">¿Eliminar cuenta?</AlertDialogTitle>
          <AlertDialogDescription className="text-xs leading-relaxed">
            Esta acción es irreversible. Se eliminarán todos tus proyectos, perfiles y datos personales.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end pt-4">
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs gap-2"
            >
              {deletingAccount ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}