const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'BiometricBridge',            // The name that appears in Windows Services
  description: 'Syncs biometric data from MSSQL to AWS Cloud.',
  script: path.join(__dirname, 'bridge.js'), // Path to your script
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
  //, allowServiceLogon: true // Optional: Use this if you need specific network user permissions
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function(){
  console.log('✅ Service installed successfully!');
  svc.start();
  console.log('🚀 Service started automatically.');
});

// Just in case it's already installed, uninstall it first to avoid duplicates
svc.on('alreadyinstalled', function(){
  console.log('⚠️ Service already installed. Attempting to start it...');
  svc.start();
});

// Install the script as a service.
svc.install();
