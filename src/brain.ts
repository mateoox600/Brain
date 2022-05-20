import { readFileSync } from 'fs';
import interpret from './interpreter';
import lex from './lexer';
import parse from './parser';

export interface CommandArgs {
    args: Arg[],
    kwargs: KeyArg[]
}

export interface KeyArg {
    key: string,
    value: string,
    quoted: boolean
}

export interface Arg {
    value: string,
    quoted: boolean
}

export interface Command {
    name: string,
    indent: number,
    args: CommandArgs
}

export interface ParsedCommand {
    name: string,
    args: CommandArgs
    block: ParsedCommand[]
}

export interface DefinedCommand {
    name: string,
    block: boolean,
    execute(args: { args: unknown[], kwargs: { [key: string]: unknown } }, launchBlock: () => void, block: ParsedCommand[]): (() => void) | void;
}

export default class Brain {

    private static instance: Brain;
    public static getInstance() {
        if(this.instance) return this.instance;
        else return this.instance = new Brain();
    }

    public commands: Map<string, DefinedCommand> = new Map();
    public stack: unknown[] = [];
    public functions: Map<string, ParsedCommand[]> = new Map();

    constructor() {
        this.commands.set('print', {
            name: 'print',
            block: false,
            execute: ({ args }) => {
                console.log(args.join(' '));
            }
        });
        this.commands.set('printStack', {
            name: 'printStack',
            block: false,
            execute: () => {
                console.log(this.stack);
            }
        });
        this.commands.set('forOf', {
            name: 'forOf',
            block: true,
            execute: ({ args, kwargs }, executeBlock) => {
                const fName = kwargs['func'];
                let f: ParsedCommand[] | undefined;
                if(fName && typeof fName === 'string' && this.functions.has(fName)) f = this.functions.get(fName);
                const arr = args.flat();
                if(!Array.isArray(arr)) throw TypeError('forOf requires array as param');
                arr.forEach((a, idx) => {
                    this.stack.push(idx);
                    this.stack.push(a);
                    if(f) interpret(f);
                    else executeBlock();
                });
            }
        });
        this.commands.set('comment', {
            name: 'comment',
            block: true,
            execute: () => {
                return;
            }
        });
        this.commands.set('push', {
            name: 'push',
            block: false,
            execute: ({ args, kwargs }) => {
                if(kwargs['array'] != undefined) this.stack.push(args);
                else args.forEach((arg) => this.stack.push(arg));
            }
        });
        this.commands.set('pop', {
            name: 'pop',
            block: false,
            execute: ({ args, kwargs }) => {
                if(kwargs['all'] != undefined) this.stack = [];
                else if(args.length > 0 && typeof args[0] === 'number' && (args[0] as number) > 0) {
                    const n = args[0] as number;
                    this.stack.splice(this.stack.length - n, n);
                }else {
                    this.stack.pop();
                }
            }
        });
        this.commands.set('func', {
            name: 'func',
            block: true,
            execute: ({ args }, _, block) => {
                if(typeof args[0] !== 'string') throw TypeError('Function name isn\'t a string');
                const name = args[0] as string;
                if(this.functions.has(name)) throw TypeError('Function already exist');
                this.functions.set(name, block);
            }
        });
        this.commands.set('call', {
            name: 'call',
            block: false,
            execute: ({ args }) => {
                if(typeof args[0] !== 'string') throw TypeError('Function name isn\'t a string');
                const name = args.shift() as string;
                const functionBlock = this.functions.get(name);
                if(!functionBlock) throw TypeError('Function doesn\'t exist');
                if(args.length > 0) args.forEach((arg) => this.stack.push(arg));
                interpret(functionBlock);
            }
        });
    }

    public loadFile(file: string) {
        return readFileSync(file).toString();
    }

    public lex(input: string): Command[] {
        return lex(input);
    }

    parse(input: Command[]): ParsedCommand {
        return parse(input);
    }

    public interpret(commands: ParsedCommand, argv: string[]) {
        this.stack = argv || [];
        interpret(commands.block);
    }

} 