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

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {updates.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No recent updates</div>
        ) : (
          updates.map((update) => (
            <div
              key={update.update_id || update.id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    update.action === "created"
                      ? "bg-green-500"
                      : update.action === "updated"
                        ? "bg-blue-500"
                        : "bg-red-500"
                  }`}
                />
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
                  {formatDistanceToNow(new Date(update.created_at || update.update_time || new Date()), { addSuffix: true })}
                </span>
              </div>

              {/* AI Generated Title - Bold */}
              <div className="text-lg font-bold text-gray-900 mb-3">
                {update.ai_title || update.file_location?.split("/").pop() || update.file_location || "Unknown"}
              </div>

              {/* Images Section */}
              {update.images && update.images.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Images:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {update.images.map((image: string, index: number) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Update image ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tables Section */}
              {update.tables && update.tables.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Tables:</h4>
                  <div className="space-y-1">
                    {update.tables.map((table: string, index: number) => (
                      <a
                        key={index}
                        href={table}
                        className="block text-sm text-blue-600 hover:text-blue-800 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Table {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Section */}
              {update.cta && update.cta.trim() && (
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">CTA:</h4>
                  <div className="text-sm text-gray-800 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                    {update.cta}
                  </div>
                </div>
              )}

              {/* Summary Section */}
              {update.ai_summary && update.ai_summary.trim() && (
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Summary:</h4>
                  <div className="text-sm text-gray-700 bg-gray-100 p-3 rounded">
                    {update.ai_summary}
                  </div>
                </div>
              )}

              {/* Location Info */}
              <div className="text-xs text-gray-500 mt-3 pt-2 border-t">
                <div>Location: {update.file_location || "Unknown"}</div>
                {update.source_platform && <div>Platform: {update.source_platform}</div>}
                {update.sender && <div>From: {update.sender}</div>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
