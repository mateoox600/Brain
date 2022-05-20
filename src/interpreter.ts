import Brain, { Arg, KeyArg, ParsedCommand } from './brain';

function parseString(string: string, quoted: boolean) {
    const brain = Brain.getInstance();
    if(string.match(/\$(\d+|\*|p|\*p)/gm)) {
        const value = string.substring(1);
        if(value === '*') return brain.stack;
        else if(value === 'p') return brain.stack.pop();
        else if(value === '*p') return brain.stack.splice(0, brain.stack.length);
        return brain.stack[brain.stack.length - 1 - Number(value)] || null;
    }else if(string.match(/^-?(?:\d_?)+.?(?:\d_?)*$/gm) && !quoted) {
        const number = Number(string.replace(/_/gm, ''));
        if(isNaN(number)) return string;
        return number;
    }
    return string;
}

function parseArg(arg: Arg) {
    return parseString(arg.value, arg.quoted);
}

function parseKeyArg(acc: { [key: string]: unknown }, keyArg: KeyArg) {
    const key: string | number = parseString(keyArg.key, false) as string | number;
    const value: unknown = parseArg(keyArg);
    acc[key] = value;
    return acc;
}

export default function interpret(commands: ParsedCommand[]) {
    const brain = Brain.getInstance();
    commands.forEach((command) => {

        const definedCommand = brain.commands.get(command.name);
        if(!definedCommand) return;

        if(!definedCommand.block && command.block.length > 0) throw TypeError('A none block instruction can\'t have a block');
        
        const checker = definedCommand.execute(
            {
                args: command.args.args.map(parseArg),
                kwargs: command.args.kwargs.reduce(parseKeyArg, {})
            },
            () => interpret(command.block),
            command.block
        );
        if(definedCommand.block && checker) checker();
    });
}