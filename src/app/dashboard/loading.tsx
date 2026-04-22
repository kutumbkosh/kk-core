export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-10 h-10 border-[3px] border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading your vault...</p>
      </div>
    </div>
  );
}
