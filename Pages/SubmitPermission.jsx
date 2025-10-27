import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, FileText, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

const reasonOptions = [
  { value: "sick", label: "Sakit" },
  { value: "family_emergency", label: "Urusan Keluarga" },
  { value: "school_activity", label: "Kegiatan Sekolah" },
  { value: "other", label: "Lainnya" }
];

export default function SubmitPermission() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    permission_date: format(new Date(), "yyyy-MM-dd"),
    reason: "",
    description: ""
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const studentData = await base44.entities.Student.filter({ user_id: currentUser.id });
      if (studentData.length > 0) {
        setStudent(studentData[0]);
      } else {
        setError("Data siswa tidak ditemukan");
      }
    } catch (error) {
      setError("Gagal memuat data pengguna");
    }
  };

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.Permission.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      setSuccess(true);
      setTimeout(() => {
        navigate(createPageUrl("Dashboard"));
      }, 2000);
    },
    onError: (error) => {
      setError("Gagal mengajukan izin. Silakan coba lagi.");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.permission_date || !formData.reason) {
      setError("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    const permissionData = {
      student_id: student.id,
      student_name: student.name,
      student_nis: student.nis,
      class_name: student.class_name,
      permission_date: formData.permission_date,
      reason: formData.reason,
      description: formData.description,
      status: "pending"
    };

    submitMutation.mutate(permissionData);
  };

  if (!user || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ajukan Izin</h1>
            <p className="text-gray-500 mt-1">Isi formulir untuk mengajukan izin keluar</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Pengajuan izin berhasil! Mengarahkan ke dashboard...
            </AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-5 h-5" />
              Formulir Pengajuan Izin
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nama Siswa</Label>
                  <Input value={student.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>NIS</Label>
                  <Input value={student.nis} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Kelas</Label>
                <Input value={student.class_name} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="permission_date">
                  Tanggal Izin <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="permission_date"
                  type="date"
                  value={formData.permission_date}
                  onChange={(e) => setFormData({ ...formData, permission_date: e.target.value })}
                  min={format(new Date(), "yyyy-MM-dd")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">
                  Alasan Izin <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.reason}
                  onValueChange={(value) => setFormData({ ...formData, reason: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih alasan izin" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasonOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Keterangan Tambahan</Label>
                <Textarea
                  id="description"
                  placeholder="Berikan detail tambahan jika diperlukan..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl("Dashboard"))}
                  disabled={submitMutation.isPending}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Mengajukan...
                    </>
                  ) : (
                    "Ajukan Izin"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}