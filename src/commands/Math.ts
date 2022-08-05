import Brain, { DefinedCommand } from '../brain';

export default [
    {
        name: 'add',
        block: false,
        execute: ({ args }) => {
            const brain = Brain.getInstance();
            const a = Number(brain.stack.pop());
            const b = Number(brain.stack.pop());
            brain.stack.push(a + b);
        }
    },
    {
        name: 'modulo',
        block: false,
        execute: ({ args }) => {
            const brain = Brain.getInstance();
            const a = Number(brain.stack.pop());
            const b = Number(brain.stack.pop());
            brain.stack.push(b % a);
        }
    }
] as DefinedCommand[];