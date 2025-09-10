import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates"
import { formatDistanceToNow } from "date-fns"

export function RealtimeUpdates() {
  const { updates, totalFiles, isConnected, lastUpdate } = useRealtimeUpdates(3000) // Poll every 3 seconds

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Live Updates</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-sm text-gray-500">{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          Total Files: <span className="font-semibold text-gray-900">{totalFiles}</span>
        </div>
        {lastUpdate && (
          <div className="text-xs text-gray-500 mt-1">
            Last update: {formatDistanceToNow(new Date(lastUpdate), { addSuffix: true })}
          </div>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {updates.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No recent updates</div>
        ) : (
          updates.map((update) => (
            <div
              key={update.update_id}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  update.action === "created"
                    ? "bg-green-500"
                    : update.action === "updated"
                      ? "bg-blue-500"
                      : "bg-red-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      update.action === "created"
                        ? "bg-green-100 text-green-800"
                        : update.action === "updated"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {update.action.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(update.update_time), { addSuffix: true })}
                  </span>
                </div>
                {update.file_location && (
                  <div className="text-sm text-gray-900 truncate">
                    {update.file_location.split("/").pop() || update.file_location}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  {update.source_platform && <span>Platform: {update.source_platform}</span>}
                  {update.sender && <span>From: {update.sender}</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
