import { readFileSync } from 'fs';
import interpret from './interpreter';
import lex from './lexer';
import parse from './parser';
import PrintCommands from './commands/Print';
import MathCommands from './commands/Math';
import StackManipulationCommands from './commands/StackManipulation';
import ConditionsCommands from './commands/Conditions';

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
    execute(args: { args: unknown[], kwargs: { [key: string]: unknown } }, launchBlock: () => void, block: ParsedCommand[]): (() => void) | void
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
        this.importCommands(PrintCommands);
        this.importCommands(MathCommands);
        this.importCommands(StackManipulationCommands);
        this.importCommands(ConditionsCommands);
        this.importCommands({
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
        this.importCommands({
            name: 'comment',
            block: true,
            execute: () => {
                return;
            }
        });
        this.importCommands({
            name: 'func',
            block: true,
            execute: ({ args }, _, block) => {
                if(typeof args[0] !== 'string') throw TypeError('Function name isn\'t a string');
                const name = args[0] as string;
                if(this.functions.has(name)) throw TypeError('Function already exist');
                this.functions.set(name, block);
            }
        });
        this.importCommands({
            name: 'jump',
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

    public parse(input: Command[]): ParsedCommand {
        return parse(input);
    }

    public interpret(commands: ParsedCommand, argv: string[]) {
        this.stack = argv || [];
        interpret(commands.block);
    }

    private importCommands(cmds: DefinedCommand | DefinedCommand[]) {
        if(!Array.isArray(cmds)) cmds = [ cmds ];
        cmds.forEach((cmd) => {
            this.commands.set(cmd.name, cmd);
        });
    }

} 