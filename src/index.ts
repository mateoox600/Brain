import Brain from './brain';
import minimist from 'minimist';

const brain = Brain.getInstance();

const argv = minimist(process.argv.splice(2));

const file = brain.loadFile(argv._.shift() as string);
const lexed = brain.lex(file);
const parsed = brain.parse(lexed);
brain.interpret(parsed, argv._);