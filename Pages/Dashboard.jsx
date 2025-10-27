import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import StatCard from "../components/dashboard/StatCard";
import RecentPermissions from "../components/dashboard/RecentPermissions";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);

  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => base44.entities.Permission.list("-created_date"),
    initialData: [],
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
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
      
      if (currentUser.role === 'student') {
        const studentData = await base44.entities.Student.filter({ user_id: currentUser.id });
        if (studentData.length > 0) {
          setStudent(studentData[0]);
        }
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const getStats = () => {
    if (user?.role === 'admin') {
      return {
        totalStudents: students.length,
        totalPermissions: permissions.length,
        approved: permissions.filter(p => p.status === 'approved').length,
        rejected: permissions.filter(p => p.status === 'rejected').length,
        pending: permissions.filter(p => p.status === 'pending').length
      };
    } else if (user?.role === 'teacher') {
      const teacherClass = classes.find(c => c.teacher_id === user.id);
      const classStudents = students.filter(s => s.class_id === teacherClass?.id);
      const classPermissions = permissions.filter(p => 
        classStudents.some(s => s.id === p.student_id)
      );
      
      return {
        totalStudents: classStudents.length,
        totalPermissions: classPermissions.length,
        approved: classPermissions.filter(p => p.status === 'approved').length,
        rejected: classPermissions.filter(p => p.status === 'rejected').length,
        pending: classPermissions.filter(p => p.status === 'pending').length
      };
    } else if (user?.role === 'student') {
      const myPermissions = permissions.filter(p => p.student_id === student?.id);
      return {
        totalPermissions: myPermissions.length,
        approved: myPermissions.filter(p => p.status === 'approved').length,
        rejected: myPermissions.filter(p => p.status === 'rejected').length,
        pending: myPermissions.filter(p => p.status === 'pending').length
      };
    }
    return {};
  };

  const stats = getStats();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Selamat Datang, {user.full_name}
          </h1>
          <p className="text-gray-500 text-lg">
            {user.role === 'admin' && 'Dashboard Administrator'}
            {user.role === 'teacher' && 'Dashboard Wali Kelas'}
            {user.role === 'student' && 'Dashboard Siswa'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {user.role === 'admin' && (
            <>
              <StatCard
                title="Total Siswa"
                value={stats.totalStudents}
                icon={Users}
                color="indigo"
                trend="+12% bulan ini"
              />
              <StatCard
                title="Total Izin"
                value={stats.totalPermissions}
                icon={FileText}
                color="purple"
              />
              <StatCard
                title="Disetujui"
                value={stats.approved}
                icon={CheckCircle}
                color="emerald"
              />
              <StatCard
                title="Ditolak"
                value={stats.rejected}
                icon={XCircle}
                color="rose"
              />
            </>
          )}

          {user.role === 'teacher' && (
            <>
              <StatCard
                title="Siswa Kelas"
                value={stats.totalStudents}
                icon={Users}
                color="indigo"
              />
              <StatCard
                title="Menunggu Approval"
                value={stats.pending}
                icon={Clock}
                color="amber"
              />
              <StatCard
                title="Disetujui"
                value={stats.approved}
                icon={CheckCircle}
                color="emerald"
              />
              <StatCard
                title="Ditolak"
                value={stats.rejected}
                icon={XCircle}
                color="rose"
              />
            </>
          )}

          {user.role === 'student' && (
            <>
              <StatCard
                title="Total Pengajuan"
                value={stats.totalPermissions}
                icon={FileText}
                color="indigo"
              />
              <StatCard
                title="Menunggu"
                value={stats.pending}
                icon={Clock}
                color="amber"
              />
              <StatCard
                title="Disetujui"
                value={stats.approved}
                icon={CheckCircle}
                color="emerald"
              />
              <StatCard
                title="Ditolak"
                value={stats.rejected}
                icon={XCircle}
                color="rose"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {user.role === 'student' && (
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
                  onClick={() => navigate(createPageUrl("SubmitPermission"))}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Ajukan Izin Baru
                </Button>
              )}
              {user.role === 'teacher' && (
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
                  onClick={() => navigate(createPageUrl("ApprovePermissions"))}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Tinjau Pengajuan ({stats.pending})
                </Button>
              )}
              {user.role === 'admin' && (
                <>
                  <Button
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
                    onClick={() => navigate(createPageUrl("Students"))}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Kelola Siswa
                  </Button>
                  <Button
                    variant="outline"
                    className="border-indigo-200 hover:bg-indigo-50"
                    onClick={() => navigate(createPageUrl("Reports"))}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Lihat Laporan
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Permissions */}
        <RecentPermissions
          permissions={permissions}
          isLoading={permissionsLoading}
          userRole={user.role}
          student={student}
          classes={classes}
          students={students}
        />
      </div>
    </div>
  );
}