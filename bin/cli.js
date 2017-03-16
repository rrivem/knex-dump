#!/usr/bin/env node

const ArgumentParser = require('argparse').ArgumentParser;
const STDIN_OR_OUT = Symbol('STDIN_OR_OUT');
const fs = require('fs');

const Dump = require('../lib/dump');
const Output = require('../lib/output');

let configPath = process.cwd() + '/knexfile.js';
let knexDump = new Dump(configPath);

const parser = new ArgumentParser({
  addHelp: true,
  description: 'Utility to load and save knex-based databases.'
});
parser.addArgument('command', {choices: ['save', 'load']});
parser.addArgument('--file', {defaultValue: STDIN_OR_OUT});
const args = parser.parseArgs();

switch(args.command) {

    case 'save':
        knexDump.dump().then(output => {
            // TODO: Do some canonical sorting, when reading.
            if (args.file===STDIN_OR_OUT) {
                console.log(output.toString())
            } else {
                fs.writeFileSync(args.file, output.toString());
            }
            process.exit();
        }).catch(err => {
            console.error(err);
            process.exit(1);
        });
        break;

    case 'load':
        if (args.file===STDIN_OR_OUT) {
            console.error("Reading STDIN not implemented.");
        } else {
            let data = JSON.parse(fs.readFileSync(args.file, 'utf8'));
            knexDump.restore(new Output(data));
        }
        break;
// TODO: Restore functionality.
}
