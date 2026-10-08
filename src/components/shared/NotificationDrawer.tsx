import React, { useState } from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  FileText,
  Pill,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Language } from '../../types';

export interface AppNotification {
  id: string;
  category: 'referral' | 'followup' | 'stock' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  actionLabel?: string;
  actionPayload?: string;
}

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    category: 'followup',
    title: 'Missed Follow-up Alert (48h Overdue)',
    message: 'Patient Ramesh Patil (Velhe) has not logged arrival at Sassoon Hospital for cardiology referral.',
    timestamp: '15 mins ago',
    isRead: false,
    priority: 'HIGH',
    actionLabel: 'Call Patient',
  },
  {
    id: 'notif_2',
    category: 'referral',
    title: 'Referral Accepted by Tertiary OPD',
    message: 'Sassoon Hospital accepted emergency referral for Savita Shinde (Obstetrics High-Risk).',
    timestamp: '45 mins ago',
    isRead: false,
    priority: 'MEDIUM',
    actionLabel: 'View Voucher',
  },
  {
    id: 'notif_3',
    category: 'stock',
    title: 'Medicine Stockout Alert: Anti-Snake Venom',
    message: 'Velhe Sub-Centre inventory has reached 0 ampoules. Emergency transfer requested from Sassoon.',
    timestamp: '2 hours ago',
    isRead: false,
    priority: 'HIGH',
    actionLabel: 'View Stock',
  },
  {
    id: 'notif_4',
    category: 'referral',
    title: 'Patient Treatment Completed',
    message: 'Anand Shinde completed surgical treatment at District Hospital Aundh. Post-op discharge slip uploaded.',
    timestamp: '4 hours ago',
    isRead: true,
    priority: 'LOW',
  },
  {
    id: 'notif_5',
    category: 'stock',
    title: 'Low Stock: Tab. Amlodipine 5mg',
    message: 'Wagholi PHC has fewer than 150 tablets remaining for NCD hypertensive patients.',
    timestamp: 'Yesterday',
    isRead: true,
    priority: 'MEDIUM',
  },
];

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: AppNotification[];
  onAction?: (notif: AppNotification) => void;
  language?: Language;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications = INITIAL_NOTIFICATIONS,
  onAction,
  language = 'en',
}) => {
  const [items, setItems] = useState<AppNotification[]>(notifications);
  const [activeTab, setActiveTab] = useState<'all' | 'referral' | 'followup' | 'stock'>('all');

  const unreadCount = items.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const filtered = items.filter((n) => {
    if (activeTab === 'all') return true;
    return n.category === activeTab;
  });

  if (!isOpen) return null;

  const title =
    language === 'mr' ? 'सूचना केंद्र' : language === 'hi' ? 'अधिसूचना केंद्र' : 'Notification Centre';

  const unreadLabel =
    language === 'mr'
      ? `${unreadCount} न वाचलेल्या प्रणाली व वैद्यकीय सूचना`
      : language === 'hi'
      ? `${unreadCount} अपठित सिस्टम और मेडिकल अलर्ट`
      : `${unreadCount} unread system & clinical alerts`;

  const markAllText =
    language === 'mr' ? 'सर्व वाचले म्हणून नोंदवा' : language === 'hi' ? 'सभी को पढ़ा हुआ मार्क करें' : 'Mark all read';

  const tabLabels = {
    all: language === 'mr' ? 'सर्व' : language === 'hi' ? 'सभी' : 'All',
    referral: language === 'mr' ? 'रेफरल' : language === 'hi' ? 'रेफरल' : 'Referrals',
    followup: language === 'mr' ? 'पाठपुरावा' : language === 'hi' ? 'फॉलो-अप' : 'Follow-ups',
    stock: language === 'mr' ? 'औषध साठा' : language === 'hi' ? 'दवा स्टॉक' : 'Stock',
  };

  const emptyText =
    language === 'mr'
      ? 'या वर्गवारीत कोणतीही सूचना नाही'
      : language === 'hi'
      ? 'इस श्रेणी में कोई अधिसूचना नहीं है'
      : 'No notifications in this category';

  const footerText =
    language === 'mr'
      ? 'एकीकृत ग्रामीण आरोग्य प्रणाली · NHM थेट सूचना केंद्र'
      : language === 'hi'
      ? 'एकीकृत ग्रामीण स्वास्थ्य प्लेटफॉर्म · NHM रियल-टाइम अलर्ट'
      : 'Integrated Rural Healthcare Platform · NHM Real-time Event Queue';

  const getLocalizedNotification = (item: AppNotification) => {
    switch (item.id) {
      case 'notif_1':
        return {
          title: t.overdueAlertTitle || item.title,
          message: t.overdueAlertMsg || item.message,
          timestamp: t.time15Mins || item.timestamp,
          actionLabel: t.callPatient || item.actionLabel,
        };
      case 'notif_2':
        return {
          title: t.acceptedAlertTitle || item.title,
          message: t.acceptedAlertMsg || item.message,
          timestamp: t.time45Mins || item.timestamp,
          actionLabel: t.viewVoucher || item.actionLabel,
        };
      case 'notif_3':
        return {
          title: t.stockoutAlertTitle || item.title,
          message: t.stockoutAlertMsg || item.message,
          timestamp: t.time2Hours || item.timestamp,
          actionLabel: language === 'mr' ? 'साठा पहा' : language === 'hi' ? 'स्टॉक देखें' : 'View Stock',
        };
      case 'notif_4':
        return {
          title: t.completedAlertTitle || item.title,
          message: t.completedAlertMsg || item.message,
          timestamp: t.time4Hours || item.timestamp,
          actionLabel: item.actionLabel,
        };
      case 'notif_5':
        return {
          title: t.lowStockAlertTitle || item.title,
          message: t.lowStockAlertMsg || item.message,
          timestamp: t.timeYesterday || item.timestamp,
          actionLabel: item.actionLabel,
        };
      default:
        return {
          title: item.title,
          message: item.message,
          timestamp: item.timestamp,
          actionLabel: item.actionLabel,
        };
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
      lang={language}
    >
      <div
        className="w-full max-w-md h-full glass-card bg-white/95 border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
              <p className="text-[11px] text-slate-500">{unreadLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold hover:underline cursor-pointer"
              >
                {markAllText}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold">
          {[
            { id: 'all', label: tabLabels.all },
            { id: 'referral', label: tabLabels.referral },
            { id: 'followup', label: tabLabels.followup },
            { id: 'stock', label: tabLabels.stock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-1.5 rounded-lg text-center transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-teal-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const localized = getLocalizedNotification(item);
              return (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`p-3.5 rounded-2xl border transition text-left cursor-pointer ${
                    !item.isRead
                      ? 'bg-white border-teal-300 shadow-xs'
                      : 'bg-slate-50/80 border-slate-200/80 opacity-85'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      {item.category === 'followup' && (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      {item.category === 'referral' && (
                        <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                      )}
                      {item.category === 'stock' && (
                        <Pill className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <span
                        className={`text-xs font-bold ${
                          !item.isRead ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {localized.title}
                      </span>
                    </div>

                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0 mt-1" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pl-5">
                    {localized.message}
                  </p>

                  <div className="flex items-center justify-between pt-2 pl-5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {localized.timestamp}
                    </span>

                    {localized.actionLabel && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAction) onAction(item);
                          onClose();
                        }}
                        className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                      >
                        <span>{localized.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              {emptyText}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/80 text-center text-[11px] text-slate-500">
          {footerText}
        </div>
      </div>
    </div>
  );
};
