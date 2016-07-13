#!/usr/bin/env node
var program = require('commander');

process.env.projpath = process.cwd();

process.argv.push(
    '--gulpfile',
    // __dirname是全局变量，表示当前文件所在目录
    path.resolve(__dirname, '../gulpfile.js')
);
process.argv.push(
  '--cwd',
  process.cwd()
)
program
  .option('--gulpfile [value]','')
program
  .option('--cwd [value]','')
program
  .command('babel','')
  .action(function(){
    require('gulp/bin/gulp')
  })
program
  .command('lint')
  .action(function(){
    require('gulp/bin/gulp')
  })
program
  .command('watch')
  .action(function(){
    process.argv.splice(2, 1);
    require('gulp/bin/gulp')
  })
program.parse(process.argv);
