import React, { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboard-service';
import toastService from '../../utils/toasterUtils';
import Loader from '../../components/common/Loader';
import {
  BookOpen,
  BrainCircuit,
  Clock,
  FileText,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  //drived states

  const noDataToBeDisplayed =
    dashboardData?.recentActivity?.documents.length > 0 ||
    dashboardData?.recentActivity?.quizzes.length > 0;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const data = await dashboardService.dashboardData();
        console.log('Data__getDashboardData', data);

        setDashboardData(data.data);
      } catch (error) {

        toastService.error(error?.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center ">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 mb-4">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 text-sm">No dashboard data available.</p>
        </div>
      </div>
    );
  }

  const data = [
    {
      label: 'Total Documents',
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
      gradient: 'from-blue-400 to-cyan-500',
      shadowColor: 'shadow-blue-500/25',
    },
    {
      label: 'Total Flashcards',
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      gradient: 'from-purple-400 to-pink-500',
      shadowColor: 'shadow-purple-500/25',
    },
    {
      label: 'Total Quizzes',
      value: dashboardData.overview.totalQuizzes,
      icon: BrainCircuit,
      gradient: 'from-violet-400 to-purple-500',
      shadowColor: 'shadow-violet-500/25',
    },
  ];

  const formattedData = [
    ...(dashboardData?.recentActivity?.documents || []).map((doc) => ({
      id: doc._id,
      description: doc.title,
      timestamp: doc.lastAccessed,
      link: `/documents/${doc._id}`,
      type: 'document',
    })),
    ...(dashboardData?.recentActivity?.quizzes || []).map((quiz) => ({
      id: quiz._id,
      description: quiz.title,
      timestamp: quiz.lastAttempted,
      link: `/quizzes/${quiz._id}`,
      type: 'quiz',
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="min-h-screen mt-4">
      <div className="background-image: radial-gradient(#e5e7eb 1px, transparent 1px) bg-size-[16px_16px] opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-medium text-slate-900 tracking-tight mb-2">
            Dashboard
          </h1>
          <p className="text-slate-500 text-base md:text-lg tracking-wide">
            Track your learning progress and activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className=" grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {data.map((stat, index) => (
            <div
              key={index}
              className="bg-white/80 group relative backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-6 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {stat.label}
                </span>

                <div
                  className={`w-11 h-11 rounded-xl bg-linear-to-br ${stat.gradient} shadow-lg inline-flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
              </div>

              <div className="text-3xl font-semibold text-slate-500 tracking-tight">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className=" p-4 pb-9 bg-white/80 rounded-xl border-slate-200 shadow-xl shadow-slate-300/50">
          <div className="flex gap-4 px-4 h-15 pb-4 items-center">
            <div className=" rounded-xl inline-flex justify-center items-center  bg-slate-300">
              <Clock className="w-12 h-12 p-2" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-medium tracking-tight">
              Recent Activity
            </h3>
          </div>

          {dashboardData.recentActivity && noDataToBeDisplayed ? (
            <div className="space-y-6">
              {formattedData.map((activity, index) => (
                <div key={activity.id || index} className="">
                  <div className="border flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border-slate-200 shadow-sm shadow-slate-300/50 hover:shadow-xl transition-shadow duration-200 gap-4">
                    <div className="">
                      <div className="flex gap-2 items-start sm:items-center">
                        <div
                          className={`mt-1.5 sm:mt-0 inline-flex shrink-0 justify-center w-3 h-3 rounded-full ${activity.type === 'document'
                            ? 'bg-linear-to-r from-blue-400 to-cyan-500'
                            : 'bg-linear-to-r from-violet-400 to-purple-500'
                            }`}
                        />

                        <p className="text-lg sm:text-xl tracking-tight text-slate-900 leading-snug">
                          {activity.type === 'document'
                            ? 'Accessed Document: '
                            : 'Attempted Quiz: '}
                          <span className="">{activity.description}</span>
                        </p>
                      </div>

                      <p className="text-slate-500 text-sm sm:text-base ml-5 sm:ml-0 mt-1 sm:mt-0">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>

                    {activity.link && (
                      <a
                        href={activity.link}
                        className="text-lg sm:text-xl text-violet-400 hover:text-violet-600 font-medium sm:font-normal self-end sm:self-auto"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              {/* <div className=''>
              <Clock className='' />
            </div> */}

              <p className="text-2xl text-slate-500 tracking-tight">
                No recent activity yet.
              </p>
              <p className="text-md tracking-tight">
                Start learning to see your progress here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
