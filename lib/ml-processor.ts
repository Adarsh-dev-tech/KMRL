export interface MLProcessingResult {
  images_folder_link: string
  tables_folder_link: string
  summary_text_link: string
  scanToText_link: string
}

export class MLProcessorService {
  private static readonly ML_API_ENDPOINT = "https://your-ml-api-endpoint.com/process" // Replace with actual endpoint

  static async processFile(filePath: string, originalFilename: string): Promise<MLProcessingResult> {
    try {
      const response = await fetch(this.ML_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any required API keys or authentication headers
        },
        body: JSON.stringify({
          file_path: filePath,
          filename: originalFilename,
          // Add any other required parameters for your ML API
        }),
      })

      if (!response.ok) {
        throw new Error(`ML processing failed: ${response.statusText}`)
      }

      const result = await response.json()

      return {
        images_folder_link: result.images_folder_path,
        tables_folder_link: result.tables_folder_path,
        summary_text_link: result.summary_file_path,
        scanToText_link: result.scan_to_text_path,
      }
    } catch (error) {
      console.error("ML processing error:", error)
      throw new Error("Failed to process file with ML algorithm")
    }
  }

  static async readSummaryContent(summaryPath: string): Promise<string> {
    try {
      // This would typically read from your file system or cloud storage
      // For now, returning a placeholder - implement based on your file storage setup
      const response = await fetch(`/api/files/read-summary?path=${encodeURIComponent(summaryPath)}`)
      if (!response.ok) {
        throw new Error("Failed to read summary file")
      }
      return await response.text()
    } catch (error) {
      console.error("Error reading summary:", error)
      return "Summary content unavailable"
    }
  }

  static getFileType(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return "PDF"
      case "doc":
      case "docx":
        return "Word"
      case "xls":
      case "xlsx":
        return "Excel"
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "Image"
      default:
        return "Document"
    }
  }
}

export const MLProcessor = MLProcessorService
