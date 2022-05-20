import { Command, ParsedCommand } from './brain';

export default function parse(input: Command[]): ParsedCommand {
    const mainBlock: ParsedCommand = {
        args: {
            args: [],
            kwargs: []
        },
        name: 'main',
        block: []
    };

    let currentIndent = 0;
    input.forEach((command) => {
        if(currentIndent > command.indent) currentIndent = command.indent;
        else if(currentIndent < command.indent) {
            if(command.indent - currentIndent > 1) throw TypeError('Cannot skip block');
            currentIndent++;
        }
        const currentBlock: ParsedCommand = {
            name: command.name,
            args: command.args,
            block: []
        };
        let block: ParsedCommand = mainBlock;
        for (let i = 0; i < currentIndent; i++) {
            block = block.block[block.block.length - 1];
        }
        if(!block) throw new TypeError('Block when no block ?');
        block.block.push(currentBlock);
    });

    return mainBlock;
}