import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileText, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const reasonText = {
  sick: "Sakit",
  family_emergency: "Urusan Keluarga",
  school_activity: "Kegiatan Sekolah",
  other: "Lainnya"
};

export default function ApprovePermissions() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [teacherClass, setTeacherClass] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);

  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => base44.entities.Permission.list("-created_date"),
    initialData: [],
  });

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
    initialData: [],
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => base44.entities.Class.list(),
    initialData: [],
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const myClass = classes.find(c => c.teacher_id === currentUser.id);
      setTeacherClass(myClass);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  useEffect(() => {
    if (user && classes.length > 0) {
      const myClass = classes.find(c => c.teacher_id === user.id);
      setTeacherClass(myClass);
    }
  }, [user, classes]);

  const approveMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Permission.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      setSuccessMessage("Izin berhasil disetujui");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Permission.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedPermission(null);
      setSuccessMessage("Izin berhasil ditolak");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const handleApprove = (permission) => {
    approveMutation.mutate({
      id: permission.id,
      data: {
        status: "approved",
        reviewed_by: user.email,
        reviewed_by_name: user.full_name,
        reviewed_date: new Date().toISOString()
      }
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      return;
    }

    rejectMutation.mutate({
      id: selectedPermission.id,
      data: {
        status: "rejected",
        reviewed_by: user.email,
        reviewed_by_name: user.full_name,
        reviewed_date: new Date().toISOString(),
        rejection_reason: rejectionReason
      }
    });
  };

  const classStudents = teacherClass 
    ? students.filter(s => s.class_id === teacherClass.id)
    : [];

  const classPermissions = permissions.filter(p => 
    classStudents.some(s => s.id === p.student_id) && p.status === 'pending'
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Persetujuan Izin</h1>
          <p className="text-gray-500 mt-1">
            Tinjau dan setujui pengajuan izin siswa {teacherClass?.name}
          </p>
        </div>

        {successMessage && (
          <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Pengajuan Menunggu Persetujuan ({classPermissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {permissionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            ) : classPermissions.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Tidak ada pengajuan menunggu</p>
                <p className="text-sm mt-1">Semua pengajuan izin telah ditinjau</p>
              </div>
            ) : (
              <div className="space-y-4">
                {classPermissions.map((permission) => (
                  <Card key={permission.id} className="border border-gray-100 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                            {permission.student_name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{permission.student_name}</p>
                            <p className="text-sm text-gray-500">NIS: {permission.student_nis} • {permission.class_name}</p>
                          </div>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 border">
                          Menunggu
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
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <p className="text-sm text-gray-700 font-medium mb-1">Keterangan:</p>
                          <p className="text-sm text-gray-600">{permission.description}</p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/30"
                          onClick={() => handleApprove(permission)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Setujui
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-rose-200 text-rose-700 hover:bg-rose-50"
                          onClick={() => {
                            setSelectedPermission(permission);
                            setShowRejectDialog(true);
                          }}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Tolak
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-700">
              <XCircle className="w-5 h-5" />
              Tolak Pengajuan Izin
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Anda akan menolak pengajuan izin dari <strong>{selectedPermission?.student_name}</strong>.
              Mohon berikan alasan penolakan.
            </p>
            <Textarea
              placeholder="Alasan penolakan..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
              }}
            >
              Batal
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Memproses..." : "Tolak Izin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}