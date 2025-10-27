import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus, Pencil, Trash2, CheckCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Students() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);

  const [formData, setFormData] = useState({
    nis: "",
    name: "",
    class_id: "",
    parent_phone: ""
  });

  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
    initialData: [],
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => base44.entities.Class.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Student.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowDialog(false);
      resetForm();
      setSuccessMessage("Siswa berhasil ditambahkan");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Student.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowDialog(false);
      resetForm();
      setSuccessMessage("Data siswa berhasil diperbarui");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Student.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setSuccessMessage("Siswa berhasil dihapus");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const resetForm = () => {
    setFormData({ nis: "", name: "", class_id: "", parent_phone: "" });
    setEditingStudent(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedClass = classes.find(c => c.id === formData.class_id);
    const studentData = {
      ...formData,
      user_id: formData.nis,
      class_name: selectedClass?.name || ""
    };

    if (editingStudent) {
      updateMutation.mutate({ id: editingStudent.id, data: studentData });
    } else {
      createMutation.mutate(studentData);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      nis: student.nis,
      name: student.name,
      class_id: student.class_id,
      parent_phone: student.parent_phone || ""
    });
    setShowDialog(true);
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.nis?.includes(searchQuery) ||
    student.class_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Siswa</h1>
            <p className="text-gray-500 mt-1">Kelola data siswa sekolah</p>
          </div>
          <Button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
            onClick={() => {
              resetForm();
              setShowDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Siswa
          </Button>
        </div>

        {successMessage && (
          <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="w-5 h-5" />
                Daftar Siswa ({filteredStudents.length})
              </CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Tidak ada data siswa</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredStudents.map((student) => (
                  <Card key={student.id} className="border border-gray-100 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                            {student.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{student.name}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>NIS: {student.nis}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {student.class_name}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(student)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-rose-600 hover:bg-rose-50"
                            onClick={() => {
                              if (confirm("Yakin ingin menghapus siswa ini?")) {
                                deleteMutation.mutate(student.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? "Edit Data Siswa" : "Tambah Siswa Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nis">NIS *</Label>
              <Input
                id="nis"
                value={formData.nis}
                onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                required
                disabled={editingStudent}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class_id">Kelas *</Label>
              <Select
                value={formData.class_id}
                onValueChange={(value) => setFormData({ ...formData, class_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent_phone">No. HP Orang Tua</Label>
              <Input
                id="parent_phone"
                value={formData.parent_phone}
                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                placeholder="08123456789"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingStudent ? "Simpan" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}