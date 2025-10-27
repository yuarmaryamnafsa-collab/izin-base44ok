import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Calendar, User, FileText } from "lucide-react";

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

export default function RecentPermissions({ 
  permissions, 
  isLoading, 
  userRole, 
  student,
  classes,
  students 
}) {
  let filteredPermissions = permissions.slice(0, 5);

  if (userRole === 'student' && student) {
    filteredPermissions = permissions
      .filter(p => p.student_id === student.id)
      .slice(0, 5);
  } else if (userRole === 'teacher') {
    const teacherClass = classes.find(c => c.teacher_id === student?.user_id);
    const classStudents = students.filter(s => s.class_id === teacherClass?.id);
    filteredPermissions = permissions
      .filter(p => classStudents.some(s => s.id === p.student_id))
      .slice(0, 5);
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Izin Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : filteredPermissions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Belum ada pengajuan izin</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPermissions.map((permission) => (
              <div
                key={permission.id}
                className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 bg-white"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">
                      {permission.student_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({permission.student_nis})
                    </span>
                  </div>
                  <Badge className={`${statusColors[permission.status]} border`}>
                    {statusText[permission.status]}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(permission.permission_date), "dd MMM yyyy", { locale: idLocale })}
                  </div>
                  <span>•</span>
                  <span>{reasonText[permission.reason]}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}