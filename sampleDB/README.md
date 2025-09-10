# Funnel Directory

This directory stores all files uploaded through the KMRL website.

## Structure:
- Files are stored with unique timestamps to prevent conflicts
- Original filenames are preserved in the database
- File metadata is stored in MongoDB for tracking and retrieval

## File Processing:
- Files uploaded here will be processed by the ML algorithm
- The ML algorithm will analyze files and update the database with links and summaries
- Processed files will be moved to appropriate categories

## Security:
- Only authenticated users can upload files
- File access is controlled by user permissions
- All uploads are logged with user information
