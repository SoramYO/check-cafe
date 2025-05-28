export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Loading Spinner */}
      <div className="relative mb-8">
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
      
      {/* Loading Text */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-blue-600 tracking-wide">
          Đang tải...
        </h2>
        <p className="text-sm text-blue-500 opacity-75 animate-pulse">
          Vui lòng chờ trong giây lát
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-64 h-2 bg-white/50 rounded-full overflow-hidden mt-6">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}