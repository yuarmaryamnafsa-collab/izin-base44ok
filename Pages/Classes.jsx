import React, { useState, useEffect } from "react";
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
import { School, Plus, Pencil, Trash2, CheckCircle, Users } from "lucide-react";

export default function Classes() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [teachers, setTeachers] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    grade_level: "",
    teacher_id: ""
  });

  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => base44.entities.Class.list(),
    initialData: [],
  });

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
    initialData: [],
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const allUsers = await base44.entities.User.list();
      const teacherUsers = allUsers.filter(u => u.role === 'teacher');
      setTeachers(teacherUsers);
    } catch (error) {
      console.error("Error loading teachers:", error);
    }
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Class.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setShowDialog(false);
      resetForm();
      setSuccessMessage("Kelas berhasil ditambahkan");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Class.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setShowDialog(false);
      resetForm();
      setSuccessMessage("Data kelas berhasil diperbarui");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Class.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setSuccessMessage("Kelas berhasil dihapus");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const resetForm = () => {
    setFormData({ name: "", grade_level: "", teacher_id: "" });
    setEditingClass(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedTeacher = teachers.find(t => t.id === formData.teacher_id);
    const classData = {
      ...formData,
      teacher_name: selectedTeacher?.full_name || ""
    };

    if (editingClass) {
      updateMutation.mutate({ id: editingClass.id, data: classData });
    } else {
      createMutation.mutate(classData);
    }
  };

  const handleEdit = (cls) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      grade_level: cls.grade_level || "",
      teacher_id: cls.teacher_id
    });
    setShowDialog(true);
  };

  const getStudentCount = (classId) => {
    return students.filter(s => s.class_id === classId).length;
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Kelas</h1>
            <p className="text-gray-500 mt-1">Kelola data kelas dan wali kelas</p>
          </div>
          <Button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
            onClick={() => {
              resetForm();
              setShowDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kelas
          </Button>
        </div>

        {successMessage && (
          <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <Skeleton key={i} className="h-40 w-full" />
            ))
          ) : classes.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-500">
              <School className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Belum ada data kelas</p>
            </div>
          ) : (
            classes.map((cls) => (
              <Card key={cls.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{cls.name}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(cls)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => {
                          if (confirm("Yakin ingin menghapus kelas ini?")) {
                            deleteMutation.mutate(cls.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <School className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Wali Kelas:</span>
                    <span className="font-medium">{cls.teacher_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Jumlah Siswa:</span>
                    <span className="font-medium">{getStudentCount(cls.id)} siswa</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingClass ? "Edit Data Kelas" : "Tambah Kelas Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kelas *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: X IPA 1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade_level">Tingkat *</Label>
              <Select
                value={formData.grade_level}
                onValueChange={(value) => setFormData({ ...formData, grade_level: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tingkat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="X">Kelas X</SelectItem>
                  <SelectItem value="XI">Kelas XI</SelectItem>
                  <SelectItem value="XII">Kelas XII</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher_id">Wali Kelas *</Label>
              <Select
                value={formData.teacher_id}
                onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih wali kelas" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {editingClass ? "Simpan" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}