// Client-side polling utility for continuous monitoring of database updates
// This can be integrated into the React components

class DatabasePoller {
  constructor(pollInterval = 30000) { // 30 seconds default
    this.pollInterval = pollInterval;
    this.isPolling = false;
    this.lastPollTime = new Date().toISOString();
    this.callbacks = [];
  }

  // Add callback for when new files are detected
  onNewFiles(callback) {
    this.callbacks.push(callback);
  }

  // Start polling for new files
  startPolling() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    console.log('🔄 Started polling for database updates...');
    
    this.pollLoop();
  }

  // Stop polling
  stopPolling() {
    this.isPolling = false;
    console.log('⏹️ Stopped polling for database updates');
  }

  async pollLoop() {
    while (this.isPolling) {
      try {
        const response = await fetch(`/api/files/poll?since=${encodeURIComponent(this.lastPollTime)}`);
        const data = await response.json();
        
        if (data.success && data.count > 0) {
          console.log(`📁 Found ${data.count} new files since last poll`);
          
          // Notify all callbacks
          this.callbacks.forEach(callback => {
            try {
              callback(data.data);
            } catch (error) {
              console.error('Error in poll callback:', error);
            }
          });
        }
        
        this.lastPollTime = data.timestamp;
        
      } catch (error) {
        console.error('Polling error:', error);
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, this.pollInterval));
    }
  }

  // Manual poll (for immediate check)
  async pollOnce() {
    try {
      const response = await fetch(`/api/files/poll?since=${encodeURIComponent(this.lastPollTime)}`);
      const data = await response.json();
      
      if (data.success && data.count > 0) {
        this.callbacks.forEach(callback => callback(data.data));
      }
      
      this.lastPollTime = data.timestamp;
      return data;
    } catch (error) {
      console.error('Manual poll error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Usage example:
/*
const poller = new DatabasePoller(30000); // Poll every 30 seconds

poller.onNewFiles((newFiles) => {
  console.log('New files detected:', newFiles);
  // Update UI, show notifications, etc.
  updateUpdatesSection(newFiles);
});

poller.startPolling();
*/

// For global access
if (typeof window !== 'undefined') {
  window.DatabasePoller = DatabasePoller;
}

export default DatabasePoller;