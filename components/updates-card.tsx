"use client"

import Image from "next/image"

interface Source {
  type: string
  link: string
  icon: string
}

interface UpdateCardProps {
  fileID: string
  title: string
  summary: string
  sources: Source[]
  sender: string
  platform: string
}

export default function UpdateCard({ fileID, title, summary, sources, sender, platform }: UpdateCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      {/* Document Title */}
      <h3 className="text-xl font-semibold text-white mb-4 text-balance">{title}</h3>

      {/* Sources Bar */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-700">
        <span className="text-gray-400 text-sm font-medium">Sources</span>
        <div className="flex items-center gap-3 flex-wrap">
          {sources.map((source, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center">
                <Image
                  src={source.icon || "/placeholder.svg"}
                  alt={source.type}
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
              </div>
              <button
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                onClick={() => console.log("[v0] Opening source:", source.link)}
              >
                {source.type}
              </button>
            </div>
          ))}
        </div>
        <div className="ml-auto text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">{sources.length}</div>
      </div>

      {/* Summary Content */}
      <div className="text-gray-300 leading-relaxed mb-6 text-pretty">
        <p>{summary}</p>
      </div>

      {/* Metadata Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <i className="fas fa-envelope w-4"></i>
            {sender}
          </span>
          <span className="flex items-center gap-1">
            <i className="fas fa-mobile-alt w-4"></i>
            {platform}
          </span>
        </div>
        <button
          className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
          onClick={() => console.log("[v0] View details for:", fileID)}
        >
          <i className="fas fa-external-link-alt"></i>
          View Details
        </button>
      </div>
    </div>
  )
}
