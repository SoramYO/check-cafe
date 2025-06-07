// Debug script để kiểm tra và clear analytics data
console.log('=== ANALYTICS DEBUG ===')

// Check localStorage contents
console.log('🔍 Current localStorage contents:')
console.log('access_token:', localStorage.getItem('access_token'))
console.log('user:', localStorage.getItem('user'))
console.log('analytics_session:', localStorage.getItem('analytics_session'))

// Function to clear all analytics data
function clearAllAnalyticsData() {
  localStorage.removeItem('analytics_session')
  localStorage.removeItem('access_token')
  localStorage.removeItem('user')
  console.log('✅ All analytics and auth data cleared')
}

// Function to check authentication status
function checkAuthStatus() {
  const token = localStorage.getItem('access_token')
  const user = localStorage.getItem('user')
  
  console.log('🔍 Auth Check Results:')
  console.log('- Has token:', !!token && token !== 'null')
  console.log('- Has user:', !!user && user !== 'null')
  
  if (user && user !== 'null') {
    try {
      const userData = JSON.parse(user)
      console.log('- User data valid:', !!userData?.id)
      console.log('- User ID:', userData?.id)
    } catch (e) {
      console.log('- User data invalid JSON:', e.message)
    }
  }
}

// Run checks
checkAuthStatus()

// Add to window for manual use
window.clearAllAnalyticsData = clearAllAnalyticsData
window.checkAuthStatus = checkAuthStatus

console.log('=== COMMANDS AVAILABLE ===')
console.log('clearAllAnalyticsData() - Clear all data')
console.log('checkAuthStatus() - Check auth status') 