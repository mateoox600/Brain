import Brain, { DefinedCommand } from '../brain';

export default [
    {
        name: 'print',
        block: false,
        execute: ({ args }) => {
            console.log(args.join(' '));
        }
    },
    {
        name: 'printStack',
        block: false,
        execute: () => {
            const brain = Brain.getInstance();
            console.log(brain.stack);
        }
    },
    {
        name: 'printBare',
        block: false,
        execute: ({ args }) => {
            process.stdout.write(args.join(' ').replace(/\\n/gm, '\n'));
        }
    }
] as DefinedCommand[];