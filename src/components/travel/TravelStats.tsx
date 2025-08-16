import {
  BarChart3,
  Bell,
  Clock,
  MapPin,
  Route,
  Target,
  TrendingUp,
} from "lucide-react";
import React from "react";
import { useTravelModeStats } from "../../hooks/useTravelModeStats";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";

interface TravelStatsProps {
  className?: string;
}

export const TravelStats: React.FC<TravelStatsProps> = ({ className }) => {
  const {
    stats,
    currentSession,
    getFormattedSessionDuration,
    getRecentSessions,
    getAverageSessionDuration,
    formatDistance,
    formatTime,
  } = useTravelModeStats();

  const recentSessions = getRecentSessions();
  const averageSessionDuration = getAverageSessionDuration();

  const statCards = [
    {
      title: "Distancia Total",
      value: formatDistance(stats.totalDistance),
      icon: Route,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Lugares Visitados",
      value: stats.visitedPlaces.toString(),
      icon: MapPin,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Tiempo de Viaje",
      value: formatTime(stats.travelTime),
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Notificaciones",
      value: stats.notificationsSent.toString(),
      icon: Bell,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            Estadísticas del Modo Travel
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Current Session */}
      {currentSession && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Target className="w-5 h-5" />
              Sesión Activa
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                En vivo
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">
                  {getFormattedSessionDuration()}
                </p>
                <p className="text-sm text-blue-600">Duración</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">
                  {formatDistance(currentSession.distance)}
                </p>
                <p className="text-sm text-blue-600">Distancia</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">
                  {currentSession.placesVisited.length}
                </p>
                <p className="text-sm text-blue-600">Lugares</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">
                  {currentSession.notifications}
                </p>
                <p className="text-sm text-blue-600">Notificaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Sessions Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen de Sesiones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sesiones Activas</span>
              <Badge variant="outline">{stats.activeSessions}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Última Semana</span>
              <Badge variant="outline">{recentSessions.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Duración Promedio</span>
              <Badge variant="outline">
                {formatTime(averageSessionDuration)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Lugares Cercanos</span>
              <Badge variant="outline">{stats.nearbyPlacesFound}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Progress Indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progreso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Distance Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Distancia Recorrida</span>
                <span>{formatDistance(stats.totalDistance)}</span>
              </div>
              <Progress
                value={Math.min((stats.totalDistance / 10000) * 100, 100)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Meta: 10km total recorridos
              </p>
            </div>

            {/* Places Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Lugares Visitados</span>
                <span>{stats.visitedPlaces}</span>
              </div>
              <Progress
                value={Math.min((stats.visitedPlaces / 50) * 100, 100)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Meta: 50 lugares visitados
              </p>
            </div>

            {/* Time Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tiempo de Viaje</span>
                <span>{formatTime(stats.travelTime)}</span>
              </div>
              <Progress
                value={Math.min((stats.travelTime / 36000) * 100, 100)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Meta: 10 horas de viaje</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions List */}
      {recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              Sesiones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSessions.slice(-5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(session.startTime).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {session.endTime
                        ? formatTime(
                            (session.endTime - session.startTime) / 1000
                          )
                        : "En progreso"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatDistance(session.distance)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {session.placesVisited.length} lugares
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {recentSessions.length === 0 && !currentSession && (
        <Card>
          <CardContent className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">
              No hay estadísticas disponibles
            </h3>
            <p className="text-sm text-gray-600">
              Activa el Modo Travel para comenzar a recopilar estadísticas de
              tus viajes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
