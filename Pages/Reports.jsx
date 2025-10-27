import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
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
import { BarChart3, Download, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const { data: permissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => base44.entities.Permission.list("-created_date"),
    initialData: [],
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => base44.entities.Class.list(),
    initialData: [],
  });

  const filteredPermissions = permissions.filter(p => {
    let matches = true;

    if (startDate && new Date(p.permission_date) < new Date(startDate)) {
      matches = false;
    }

    if (endDate && new Date(p.permission_date) > new Date(endDate)) {
      matches = false;
    }

    if (selectedClass !== "all" && p.class_name !== selectedClass) {
      matches = false;
    }

    if (selectedStatus !== "all" && p.status !== selectedStatus) {
      matches = false;
    }

    return matches;
  });

  const downloadReport = () => {
    const csvContent = [
      ["NIS", "Nama", "Kelas", "Tanggal Izin", "Alasan", "Status", "Ditinjau Oleh"].join(","),
      ...filteredPermissions.map(p => [
        p.student_nis,
        p.student_name,
        p.class_name,
        format(new Date(p.permission_date), "dd/MM/yyyy"),
        p.reason,
        p.status,
        p.reviewed_by_name || "-"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan-izin-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    total: filteredPermissions.length,
    pending: filteredPermissions.filter(p => p.status === 'pending').length,
    approved: filteredPermissions.filter(p => p.status === 'approved').length,
    rejected: filteredPermissions.filter(p => p.status === 'rejected').length
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan Izin</h1>
          <p className="text-gray-500 mt-1">Filter dan unduh laporan pengajuan izin</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Filter Laporan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="start_date">Tanggal Mulai</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Tanggal Akhir</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Kelas</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kelas</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.name}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="approved">Disetujui</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4">
                <p className="text-sm text-indigo-600 font-medium">Total</p>
                <p className="text-3xl font-bold text-indigo-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                <p className="text-sm text-amber-600 font-medium">Menunggu</p>
                <p className="text-3xl font-bold text-amber-900 mt-1">{stats.pending}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
                <p className="text-sm text-emerald-600 font-medium">Disetujui</p>
                <p className="text-3xl font-bold text-emerald-900 mt-1">{stats.approved}</p>
              </div>
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4">
                <p className="text-sm text-rose-600 font-medium">Ditolak</p>
                <p className="text-3xl font-bold text-rose-900 mt-1">{stats.rejected}</p>
              </div>
            </div>

            <Button
              onClick={downloadReport}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
              disabled={filteredPermissions.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Unduh Laporan (CSV)
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Preview Data ({filteredPermissions.length} records)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2">NIS</th>
                    <th className="text-left py-3 px-2">Nama</th>
                    <th className="text-left py-3 px-2">Kelas</th>
                    <th className="text-left py-3 px-2">Tanggal</th>
                    <th className="text-left py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPermissions.slice(0, 10).map((p) => (
                    <tr key={p.id} className="border-b border-gray-100">
                      <td className="py-3 px-2">{p.student_nis}</td>
                      <td className="py-3 px-2">{p.student_name}</td>
                      <td className="py-3 px-2">{p.class_name}</td>
                      <td className="py-3 px-2">
                        {format(new Date(p.permission_date), "dd MMM yyyy", { locale: idLocale })}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          p.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          p.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {p.status === 'approved' ? 'Disetujui' : p.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPermissions.length > 10 && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Menampilkan 10 dari {filteredPermissions.length} data. Unduh laporan untuk melihat semua.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}