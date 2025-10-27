import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const colorClasses = {
  indigo: "from-indigo-500 to-indigo-600",
  purple: "from-purple-500 to-purple-600",
  emerald: "from-emerald-500 to-emerald-600",
  rose: "from-rose-500 to-rose-600",
  amber: "from-amber-500 to-amber-600"
};

export default function StatCard({ title, value, icon: Icon, color, trend }) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full transform translate-x-10 -translate-y-10`} />
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 text-sm text-emerald-600">
                <TrendingUp className="w-4 h-4" />
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} bg-opacity-10`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}