const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Create a file to stream archive data to.
const output = fs.createWriteStream(__dirname + '/glw-token-exchange.zip');
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');
});

// This event is fired when the data source is drained no matter what was the data source.
output.on('end', function() {
  console.log('Data has been drained');
});

// Good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

// Good practice to catch this error explicitly
archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Append files from a sub-directory, putting its contents at the root of archive
archive.directory('src/', 'src');

// Append files from a sub-directory, putting its contents at the root of archive
archive.directory('public/', 'public');

// Append files individually
archive.file('package.json', { name: 'package.json' });
archive.file('README.md', { name: 'README.md' });
archive.file('tsconfig.json', { name: 'tsconfig.json' });
archive.file('vite.config.ts', { name: 'vite.config.ts' });
archive.file('index.html', { name: 'index.html' });

// Finalize the archive (ie we are done appending files but streams have to finish yet)
archive.finalize();