import Brain, { DefinedCommand } from '../brain';

export default [
    {
        name: 'push',
        block: false,
        execute: ({ args, kwargs }) => {
            const brain = Brain.getInstance();
            if(kwargs['array'] != undefined) brain.stack.push(args);
            else if(kwargs['flat'] != undefined) {
                if(args.length < 2 && Array.isArray(args[0])) args[0].flat().forEach((arg) => brain.stack.push(arg));
                else return args.flat().forEach((arg) => brain.stack.push(arg));
            }else if(kwargs['range'] != undefined) {
                if(args.length < 1) return;
                let from = Number(args[0]);
                let to = Number(args[1]);
                if(args.length < 2) {
                    to = from;
                    from = 0;
                }
                brain.stack.push(new Array(to - from).fill(0).map((_, i) => from + i));
            }else args.forEach((arg) => brain.stack.push(arg));
        }
    },
    {
        name: 'pop',
        block: false,
        execute: ({ args, kwargs }) => {
            const brain = Brain.getInstance();
            if(kwargs['all'] != undefined) brain.stack = [];
            else if(args.length > 0 && typeof args[0] === 'number' && (args[0] as number) > 0) {
                const n = args[0] as number;
                brain.stack.splice(brain.stack.length - n, n);
            }else {
                brain.stack.pop();
            }
        }
    },
    {
        name: 'dup',
        block: false,
        execute: ({ args, kwargs }) => {
            const brain = Brain.getInstance();
            const a = brain.stack.pop();
            brain.stack.push(a);
            brain.stack.push(a);
        }
    },
    {
        name: 'rot',
        block: false,
        execute: ({ args, kwargs }) => {
            const brain = Brain.getInstance();
            const a = brain.stack.pop();
            const b = brain.stack.pop();
            brain.stack.push(a);
            brain.stack.push(b);
        }
    }
] as DefinedCommand[];