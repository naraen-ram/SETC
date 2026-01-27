var Service = require('node-windows').Service;

var svc = new Service({
  name: 'BiometricBridge',
  description: 'Syncs SQL Data to Cloud',
  script: 'C:\\BiometricProject\\bridge.js',
  
  // --- ADD THIS LINE ---
  // Paste the result of "where node" here. Use double backslashes (\\)
  execPath: 'C:\\Program Files\\nodejs\\node.exe', 
  // ---------------------

  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

svc.on('install', function(){
  console.log('✅ Service Installed!');
  svc.start();
});

svc.on('alreadyinstalled', function(){
  console.log('⚠️ Service already exists. Uninstalling first...');
  svc.uninstall();
});

svc.on('uninstall', function(){
  console.log('♻️ Uninstalled old version. Re-installing now...');
  svc.install();
});

svc.install();foce
