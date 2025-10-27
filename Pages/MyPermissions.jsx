import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Calendar, User, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const statusColors = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-rose-100 text-rose-800 border-rose-200"
};

const statusText = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak"
};

const reasonText = {
  sick: "Sakit",
  family_emergency: "Urusan Keluarga",
  school_activity: "Kegiatan Sekolah",
  other: "Lainnya"
};

export default function MyPermissions() {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [filter, setFilter] = useState("all");

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => base44.entities.Permission.list("-created_date"),
    initialData: [],
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
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const myPermissions = student 
    ? permissions.filter(p => p.student_id === student.id)
    : [];

  const filteredPermissions = filter === "all" 
    ? myPermissions 
    : myPermissions.filter(p => p.status === filter);

  if (!user || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Izin</h1>
          <p className="text-gray-500 mt-1">Lihat semua pengajuan izin Anda</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Daftar Pengajuan
              </CardTitle>
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="all">Semua</TabsTrigger>
                  <TabsTrigger value="pending">Menunggu</TabsTrigger>
                  <TabsTrigger value="approved">Disetujui</TabsTrigger>
                  <TabsTrigger value="rejected">Ditolak</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : filteredPermissions.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Belum ada pengajuan izin</p>
                <p className="text-sm mt-1">
                  {filter === "all" 
                    ? "Anda belum pernah mengajukan izin" 
                    : `Tidak ada pengajuan dengan status ${statusText[filter]}`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPermissions.map((permission) => (
                  <Card key={permission.id} className="border border-gray-100 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {permission.student_name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{permission.student_name}</p>
                            <p className="text-sm text-gray-500">{permission.class_name}</p>
                          </div>
                        </div>
                        <Badge className={`${statusColors[permission.status]} border`}>
                          {statusText[permission.status]}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Tanggal Izin:</span>
                          <span className="font-medium">
                            {format(new Date(permission.permission_date), "dd MMMM yyyy", { locale: idLocale })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Alasan:</span>
                          <span className="font-medium">{reasonText[permission.reason]}</span>
                        </div>
                      </div>

                      {permission.description && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-700">{permission.description}</p>
                        </div>
                      )}

                      {permission.status === 'approved' && permission.reviewed_by_name && (
                        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg p-3">
                          <User className="w-4 h-4" />
                          <span>Disetujui oleh {permission.reviewed_by_name}</span>
                        </div>
                      )}

                      {permission.status === 'rejected' && (
                        <div className="flex items-start gap-2 text-sm text-rose-700 bg-rose-50 rounded-lg p-3">
                          <AlertCircle className="w-4 h-4 mt-0.5" />
                          <div>
                            <p className="font-medium">Ditolak oleh {permission.reviewed_by_name}</p>
                            {permission.rejection_reason && (
                              <p className="mt-1">{permission.rejection_reason}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}