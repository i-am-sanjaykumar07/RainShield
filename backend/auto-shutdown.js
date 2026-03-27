// Auto-shutdown after 2 hours for demo
setTimeout(() => {
  console.log('Demo period ended. Shutting down...');
  process.exit(0);
}, 2 * 60 * 60 * 1000); // 2 hours

console.log('Demo server will auto-shutdown in 2 hours');