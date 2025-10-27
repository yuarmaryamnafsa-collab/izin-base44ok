import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Phone, FileText } from "lucide-react";

export default function MyStudents() {
  const [user, setUser] = useState(null);
  const [teacherClass, setTeacherClass] = useState(null);

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

  const { data: permissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => base44.entities.Permission.list(),
    initialData: [],
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
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

  const classStudents = teacherClass 
    ? students.filter(s => s.class_id === teacherClass.id)
    : [];

  const getStudentPermissionCount = (studentId) => {
    return permissions.filter(p => p.student_id === studentId).length;
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Siswa Kelas Saya</h1>
          <p className="text-gray-500 mt-1">
            Daftar siswa kelas {teacherClass?.name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-40 w-full" />
            ))
          ) : classStudents.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Belum ada siswa di kelas ini</p>
            </div>
          ) : (
            classStudents.map((student) => (
              <Card key={student.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-2xl">
                      {student.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{student.name}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        NIS: {student.nis}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {student.parent_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Orang Tua:</span>
                        <span className="font-medium">{student.parent_phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Total Izin:</span>
                      <span className="font-medium">{getStudentPermissionCount(student.id)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}