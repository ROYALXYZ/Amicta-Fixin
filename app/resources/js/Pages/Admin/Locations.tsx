import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { Building2, ChevronDown, ChevronRight, MoreHorizontal, Pencil, Plus, Power } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import { Checkbox } from "@/Components/ui/checkbox";

type Unit = { id: number; number: string; is_active: boolean };
type Building = { id: number; name: string; is_active: boolean; units: Unit[] };
type Editor = {
    type: "building" | "unit";
    id?: number;
    buildingId?: number;
    name: string;
} | null;
type ToggleTarget = { url: string; label: string; isActive: boolean } | null;

export default function Locations({ buildings }: { buildings: Building[] }) {
    const [editor, setEditor] = useState<Editor>(null);
    const [open, setOpen] = useState<number[]>(buildings.map((building) => building.id));
    const buildingForm = useForm({ name: "" });
    const unitForm = useForm({ building_id: "", number: "" });
    const editForm = useForm({ name: "" });
    const [toggleTarget, setToggleTarget] = useState<ToggleTarget>(null);
    const [editingUnitId, setEditingUnitId] = useState<number | null>(null);
    const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);
    const [selectionBuildingId, setSelectionBuildingId] = useState<number | null>(null);
    const [openMenuBuildingId, setOpenMenuBuildingId] = useState<number | null>(null);
    const [toggleProcessing, setToggleProcessing] = useState(false);
    const toggle = (url: string, label = "Lokasi", isActive = true) => setToggleTarget({ url, label, isActive });
    const confirmToggle = () => {
        if (!toggleTarget) return;
        const target = toggleTarget;
        setToggleTarget(null);
        setToggleProcessing(true);
        window.axios.patch(target.url, {}, { headers: { Accept: "application/json" } }).then(() => {
                router.reload({ only: ["buildings"] });
                toast.success(`${target.label} berhasil ${target.isActive ? "dinonaktifkan" : "diaktifkan"}.`);
            }).catch(() => {
                toast.error(`${target.label} gagal diperbarui.`);
            }).finally(() => setToggleProcessing(false));
    };
    const edit = (item: Editor) => {
        setEditor(item);
        editForm.setData("name", item?.name ?? "");
    };
    const toggleUnitSelection = (unitId: number, buildingId: number) => {
        setSelectionBuildingId(buildingId);
        setSelectedUnitIds((current) => current.includes(unitId) ? current.filter((id) => id !== unitId) : [...current, unitId]);
    };
    const updateSelectedUnits = (isActive: boolean) => {
        if (!selectedUnitIds.length) return;
        const ids = [...selectedUnitIds];
        router.post(route("admin.units.bulk-toggle"), { unit_ids: ids, is_active: isActive }, {
            preserveScroll: true,
            onSuccess: () => { toast.success(`${ids.length} unit berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}.`); setSelectedUnitIds([]); setSelectionBuildingId(null); },
            onError: () => toast.error("Unit gagal dinonaktifkan."),
        });
    };
    const saveUnitName = (unitId: number, value: string) => {
        editForm.setData("name", value);
        editForm.patch(route("admin.units.update", unitId), {
            onSuccess: () => { setEditingUnitId(null); toast.success("Nama unit diperbarui."); },
            onError: () => toast.error("Nama unit gagal diperbarui."),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold tracking-tight">Gedung & Unit</h2>}>
            <Head title="Gedung & Unit" />
            <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Gedung, Area, dan Unit</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Kelola lokasi yang tersedia untuk laporan penghuni.</p>
                    </div>
                    <Button onClick={() => edit({ type: "building", name: "" })}>
                        <Plus className="mr-2 size-4" />
                        Tambah Gedung
                    </Button>
                </div>
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-base">Tambah Cepat</CardTitle>
                                <CardDescription>Tambah unit langsung di gedung aktif.</CardDescription>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {buildings.length} gedung · {buildings.reduce((sum, building) => sum + building.units.length, 0)} unit
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="flex flex-col gap-2 sm:flex-row"
                            onSubmit={(event) => {
                                event.preventDefault();
                                unitForm.post(route("admin.units.store"), {
                                    onSuccess: () => {
                                        unitForm.reset("number");
                                        toast.success("Unit berhasil ditambahkan.");
                                    },
                                    onError: () => toast.error("Unit gagal ditambahkan."),
                                });
                            }}
                        >
                            <Select value={unitForm.data.building_id} onValueChange={(value) => unitForm.setData("building_id", value)} required>
                                <SelectTrigger className="w-full sm:w-[200px]" aria-label="Gedung">
                                    <SelectValue placeholder={<span className="italic text-muted-foreground">Pilih gedung</span>} />
                                </SelectTrigger>
                                <SelectContent>
                                    {buildings
                                        .filter((building) => building.is_active)
                                        .map((building) => (
                                            <SelectItem key={building.id} value={String(building.id)}>
                                                {building.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <Input placeholder="Nomor / nama unit" value={unitForm.data.number} onChange={(event) => unitForm.setData("number", event.target.value)} required maxLength={50} />
                            <Button disabled={unitForm.processing}>Tambah</Button>
                        </form>
                        {unitForm.errors.number && <p className="mt-2 text-sm text-destructive">{unitForm.errors.number}</p>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Struktur Lokasi</CardTitle>
                        <CardDescription>Nonaktifkan lokasi yang tidak lagi digunakan. Data historis tetap tersimpan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {buildings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed py-16 text-center">
                                <div className="rounded-full bg-primary/10 p-3">
                                    <Building2 className="h-6 w-6 text-primary" />
                                </div>
                                <p className="text-sm font-medium text-slate-900">Belum ada gedung atau area</p>
                                <p className="text-xs text-slate-500">Klik "Tambah Gedung" untuk mulai mencatat properti Anda.</p>
                            </div>
                        ) : (
                            buildings.map((building) => {
                                const expanded = open.includes(building.id);
                                return (
                                    <section key={building.id} className="rounded-lg border">
                                        <div className="flex items-center gap-2 p-3">
                                            <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => setOpen((current) => (expanded ? current.filter((id) => id !== building.id) : [...current, building.id]))} aria-label={expanded ? "Tutup unit" : "Buka unit"}>
                                                {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                                            </Button>
                                            <Building2 className="size-4 text-muted-foreground" />
                                            <span className={`font-semibold ${!building.is_active ? "text-muted-foreground line-through" : ""}`}>{building.name}</span>
                                            <Badge variant="outline" className="ml-auto rounded-full">
                                                {building.units.length} unit
                                            </Badge>
                                            <div className="flex items-center gap-1">
                                                <DropdownMenu open={openMenuBuildingId === building.id} onOpenChange={(isOpen) => setOpenMenuBuildingId(isOpen ? building.id : null)}>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="action-purple" size="icon" className="size-8" aria-label="Menu gedung"><MoreHorizontal className="size-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onSelect={() => { setOpenMenuBuildingId(null); edit({ type: "building", id: building.id, name: building.name }); }}><Pencil className="mr-2 size-4" />Edit gedung</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onSelect={() => { setOpenMenuBuildingId(null); toggle(route("admin.buildings.toggle", building.id), `Gedung ${building.name}`, building.is_active); }}><Power className="mr-2 size-4" />{building.is_active ? "Nonaktifkan" : "Aktifkan"} gedung</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        {expanded && (
                                            <div className="border-t bg-muted/20 px-10 py-2">
                                                {selectionBuildingId === building.id && selectedUnitIds.length > 0 && <div className="mb-2 flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm"><span>{selectedUnitIds.length} unit dipilih</span><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => updateSelectedUnits(true)}>Aktifkan</Button><Button size="sm" variant="destructive" onClick={() => updateSelectedUnits(false)}>Nonaktifkan</Button></div></div>}
                                                {building.units.length ? (
                                                    building.units.map((unit) => (
                                                        <div key={unit.id} className="flex items-center gap-2 border-b py-2 last:border-0">
                                                            {selectionBuildingId === building.id && <Checkbox checked={selectedUnitIds.includes(unit.id)} onCheckedChange={() => toggleUnitSelection(unit.id, building.id)} aria-label={`Pilih unit ${unit.number}`} />}
                                                            {editingUnitId === unit.id ? <Input autoFocus defaultValue={unit.number} className="h-8 max-w-xs" onKeyDown={(event) => { if (event.key === "Enter") saveUnitName(unit.id, event.currentTarget.value); if (event.key === "Escape") setEditingUnitId(null); }} onBlur={(event) => saveUnitName(unit.id, event.currentTarget.value)} /> : <span className={`text-left ${!unit.is_active ? "text-muted-foreground line-through" : ""}`}>{unit.number}</span>}
                                                            {!unit.is_active && (
                                                                <Badge variant="secondary" className="rounded-full">
                                                                    Nonaktif
                                                                </Badge>
                                                            )}
                                                            <span className="ml-auto flex items-center gap-1">
                                                                <Button
                                                                    variant="action-purple"
                                                                    size="icon"
                                                                    className="size-8"
                                                                    onClick={() => setEditingUnitId(unit.id)}
                                                                    aria-label="Edit unit"
                                                                >
                                                                    <Pencil className="size-4" />
                                                                </Button>
                                                                <Button variant="action-purple" size="icon" className="size-8" onClick={() => { setSelectionBuildingId(selectionBuildingId === building.id ? null : building.id); setSelectedUnitIds([]); }} aria-label="Pilih unit untuk dinonaktifkan"><Power className="size-4" /></Button>
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="py-3 text-sm text-muted-foreground">Belum ada unit.</p>
                                                )}
                                            </div>
                                        )}
                                    </section>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            </div>
            <Dialog open={!!editor} onOpenChange={(value) => !value && setEditor(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editor?.id ? `Edit ${editor.type === "building" ? "Gedung" : "Unit"}` : "Tambah Gedung"}</DialogTitle>
                        <DialogDescription>{editor?.type === "unit" ? "Perbarui nomor atau nama unit." : "Gunakan nama yang mudah dikenali penghuni."}</DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            if (!editor) return;
                            if (editor.id) {
                                editForm.patch(route(editor.type === "building" ? "admin.buildings.update" : "admin.units.update", editor.id), {
                                    onSuccess: () => setEditor(null),
                                });
                            } else {
                                buildingForm.post(route("admin.buildings.store"), {
                                    onSuccess: () => setEditor(null),
                                });
                            }
                        }}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="location-name">{editor?.type === "unit" ? "Nomor / Nama Unit" : "Nama Gedung / Area"}</Label>
                            <Input id="location-name" value={editor?.id ? editForm.data.name : buildingForm.data.name} onChange={(event) => (editor?.id ? editForm.setData("name", event.target.value) : buildingForm.setData("name", event.target.value))} required maxLength={editor?.type === "unit" ? 50 : 120} />
                            {(editor?.id ? editForm.errors.name : buildingForm.errors.name) && <p className="text-sm text-destructive">{editor?.id ? editForm.errors.name : buildingForm.errors.name}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditor(null)}>
                                Batal
                            </Button>
                            <Button disabled={editor?.id ? editForm.processing : buildingForm.processing}>Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={!!toggleTarget} onOpenChange={(value) => !value && setToggleTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{toggleTarget?.isActive ? "Nonaktifkan" : "Aktifkan"} {toggleTarget?.label}?</DialogTitle>
                        <DialogDescription>{toggleTarget?.isActive ? "Lokasi tidak dapat dipilih untuk laporan baru. Data tiket lama tetap aman." : "Lokasi akan tersedia kembali untuk laporan baru."}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setToggleTarget(null)}>
                            Batal
                        </Button>
                        <Button type="button" variant={toggleTarget?.isActive ? "destructive" : "default"} disabled={toggleProcessing} onClick={confirmToggle}>
                            {toggleTarget?.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
