import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus, Car } from "lucide-react";
import { toast } from "sonner";
import {
  listVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  type Vehicle,
  type VehicleDto,
  ApiError,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ENGINE_TYPES = ["Gasolina", "Etanol", "Diesel", "Flex", "Híbrido", "Elétrico"];

export function VehiclesModal({ open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: listVehicles,
    enabled: open,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Vehicle | null>(null);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (v: Vehicle) => { setEditing(v); setFormOpen(true); };

  const delMutation = useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: () => {
      toast.success("Veículo removido");
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erro ao remover"),
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" /> Meus veículos
            </DialogTitle>
            <DialogDescription>
              Gerencie os veículos usados nas simulações.
            </DialogDescription>
          </DialogHeader>

          <div className="mb-3 flex justify-end">
            <Button onClick={openCreate} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Novo veículo
            </Button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto rounded-md border">
            {isLoading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Carregando…</div>
            ) : vehicles.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Nenhum veículo cadastrado.
              </div>
            ) : (
              <ul className="divide-y">
                {vehicles.map((v) => (
                  <li key={v.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <div className="font-medium">{v.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {v.engineType}
                        {v.consumption ? ` · ${v.consumption} km/l` : ""}
                        {v.co2Emission ? ` · ${v.co2Emission} g/km CO₂` : ""}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(v)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setConfirmDelete(v)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VehicleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover veículo?</AlertDialogTitle>
            <AlertDialogDescription>
              "{confirmDelete?.name}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete) delMutation.mutate(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function VehicleFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Vehicle | null;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [engineType, setEngineType] = useState("Gasolina");
  const [consumption, setConsumption] = useState<string>("");
  const [co2, setCo2] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setEngineType(editing.engineType || "Gasolina");
      setConsumption(editing.consumption?.toString() ?? "");
      setCo2(editing.co2Emission?.toString() ?? "");
    } else {
      setName(""); setEngineType("Gasolina"); setConsumption(""); setCo2("");
    }
  }, [open, editing]);

  const reset = () => { setName(""); setEngineType("Gasolina"); setConsumption(""); setCo2(""); };

  const mutation = useMutation({
    mutationFn: (dto: VehicleDto) =>
      editing ? updateVehicle(editing.id, dto) : createVehicle(dto),
    onSuccess: () => {
      toast.success(editing ? "Veículo atualizado" : "Veículo criado");
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      reset();
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Erro ao salvar"),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar veículo" : "Novo veículo"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate({
              name,
              engineType,
              consumption: consumption ? Number(consumption) : undefined,
              co2Emission: co2 ? Number(co2) : undefined,
            });
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="vname">Nome</Label>
            <Input id="vname" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tipo de motor</Label>
            <Select value={engineType} onValueChange={setEngineType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ENGINE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cons">Consumo (km/l)</Label>
              <Input id="cons" type="number" step="0.1" min="0"
                value={consumption} onChange={(e) => setConsumption(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="co2">Emissão CO₂ (g/km)</Label>
              <Input id="co2" type="number" step="0.1" min="0"
                value={co2} onChange={(e) => setCo2(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
