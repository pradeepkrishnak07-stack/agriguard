import React, { useState } from 'react';
import {
  Bell, AlertTriangle, CloudRain, Droplets,
  CheckCircle2, Clock, Check, Filter
} from 'lucide-react';
import { Language, SmartAlert } from '../types';
import { translations } from '../i18n';
import { api } from '../services/api';

interface AlertsScreenProps {
  language: Language;
  alerts: SmartAlert[];
  onAlertsUpdated: () => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({ language, alerts, onAlertsUpdated }) => {
  const t = translations[language];
  const isTa = language === 'ta';

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredAlerts = alerts.filter(a => filter === 'all' || !a.read);

  const handleMarkRead = async (id: string) => {
    await api.markAlertRead(id);
    onAlertsUpdated();
  };

  const handleMarkAllRead = async () => {
    for (const a of alerts) {
      if (!a.read) {
        await api.markAlertRead(a.id);
      }
    }
    onAlertsUpdated();
  };

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'disease_risk':
        return AlertTriangle;
      case 'weather_warning':
        return CloudRain;
      case 'irrigation':
        return Droplets;
      default:
        return Bell;
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Title */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              {t.alerts_title}
            </h2>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            {t.alerts_mark_all_read}
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 pt-1 border-t border-slate-100 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.alerts_filter_all} ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === 'unread'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.alerts_filter_unread} ({alerts.filter(a => !a.read).length})
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-xs text-slate-500">
              {t.no_active_alerts}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const Icon = getAlertIcon(alert.category);
            const isHigh = alert.severity === 'high';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border shadow-sm space-y-2 transition-all ${
                  alert.read
                    ? 'bg-white border-slate-200 opacity-75'
                    : isHigh
                    ? 'bg-red-50/80 border-red-200 ring-1 ring-red-400/30'
                    : 'bg-amber-50/80 border-amber-200 ring-1 ring-amber-400/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      isHigh ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">
                          {isTa ? alert.title_ta : alert.title_en}
                        </h4>
                        {!alert.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {alert.crop_name || 'General Farm'} • {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  </div>

                  {!alert.read && (
                    <button
                      onClick={() => handleMarkRead(alert.id)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-700 pl-9">
                  {isTa ? alert.message_ta : alert.message_en}
                </p>

                {alert.action_en && (
                  <div className="ml-9 bg-white/80 p-2.5 rounded-xl border border-current/10 text-xs font-medium text-emerald-900">
                    💡 <strong>{isTa ? "பரிந்துரை:" : "Action:"}</strong> {isTa ? alert.action_ta : alert.action_en}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
