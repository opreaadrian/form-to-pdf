#!/usr/bin/env node

const vfs = require('vinyl-fs');

console.log('Linking hooks/pre-commit to .git/hooks in main project');

vfs
  .src('./hooks/pre-commit', { followSymlinks: false})
  .pipe(vfs.symlink('./.git/hooks'));
