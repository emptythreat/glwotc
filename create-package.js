const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

function createPackage() {
  const output = fs.createWriteStream(path.join(__dirname, 'glw-token-exchange.zip'));
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  output.on('close', function() {
    console.log(archive.pointer() + ' total bytes');
    console.log('Package created successfully: glw-token-exchange.zip');
  });

  archive.on('error', function(err) {
    throw err;
  });

  archive.pipe(output);

  // Add directories
  archive.directory('src/', 'src');
  archive.directory('public/', 'public');

  // Add individual files
  const filesToInclude = [
    'package.json',
    'tsconfig.json',
    'tsconfig.node.json',
    'vite.config.ts',
    'index.html',
    'tailwind.config.js',
    'postcss.config.js',
    'README.md'
  ];

  filesToInclude.forEach(file => {
    if (fs.existsSync(file)) {
      archive.file(file, { name: file });
    }
  });

  archive.finalize();
}

createPackage();