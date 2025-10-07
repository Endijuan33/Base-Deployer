const { spawn } = require('child_process');

const port = process.argv[2] || 3000;
const hostname = process.argv[3] || 'localhost';

const next = spawn('next', ['dev', '-p', port, '-H', hostname], {
  stdio: 'inherit',
  shell: true,
});

next.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
