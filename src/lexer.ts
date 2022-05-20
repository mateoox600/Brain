import { Command, KeyArg } from './brain';

function checkString(string: string, char: string, end: (str: string, quote: boolean) => void) {
    
    if(string.match(/^["']/gm)) {
        // Add char to string then checks if the string is ended by same quote
        string += char;
        if(string.match(new RegExp(String.raw`[^\\]${string.charAt(0)}$`, 'gm'))) return end(string, true);
    }else {
        // if the char is text add it else end the string
        if(char.match(/\S/gm)) string += char;
        else return end(string, false);
    }
    return string;
}

export default function lex(input: string) {
    const outputLines: Command[] = [];
    
    const lines = input.split(/\n/gm);

    lines.forEach((line) => {
        if(line === '') return;

        const command: Command = {
            args: {
                args: [],
                kwargs: []
            },
            indent: 0,
            name: ''
        };
        let lexingCommand = true;
        let current: KeyArg | string | null = null;

        line.split('').forEach((char) => {
            if(lexingCommand) {
                // Lexing the first arg as the command name, and lexing the indentation of the line
                if(char.match(/\S/gm)) return command.name += char;
                else {
                    if(char === '\t' && command.name === '') command.indent++;
                    else lexingCommand = false;
                }
            }else {
                if(current == null) {
                    // starting new arg parsing depending on char ( `"`, `'` and vanilla text for normal arg and `(` for kwarg )
                    if(!char.match(/\S/gm)) return;
                    else if(char.match(/\(/gm)) current = { key: char, value: '', quoted: false };
                    else if(char.match(/["']/gm)) current = char;
                    else current = char;
                }else {
                    if(typeof current === 'string') {
                        // checking char if the current arg is a normal arg
                        const string = checkString(current, char, (str, quote) => {
                            // remove the quote if they are existant
                            if(quote) str = str.substring(1, str.length - 1);
                            command.args.args.push({ value: str, quoted: quote });
                            current = null;
                        });
                        if(string) current = string;
                    }else {
                        if(!current.key.endsWith(')')) {
                            // add chars to the key while it's not ended by the `)`
                            current.key += char;
                        }else {
                            if(current.value.length < 1) {
                                // initialize the kwarg value with the first char if it is a text char
                                if(!char.match(/\S/gm)) return;
                                return current.value = char;
                            }
                            // adding char to kwarg value and handling string end
                            const string = checkString(current.value, char, (str, quote) => {
                                if(quote) str = str.substring(1, str.length - 1);
                                current = (current as KeyArg);
                                current.value = str;
                                // removing parentheses from key
                                current.key = current.key.substring(1, current.key.length - 1);
                                current.quoted = quote;
                                command.args.kwargs.push(current);
                                current = null;
                            });
                            if(string) current.value = string;
                        }
                    }

                }

            }
        });

        if(current) {
            // if it's the end of the program handle the last command
            if(typeof current === 'string') {
                current = (current as string);
                let quoted = false;
                if(current.match(/^["']/gm)) {
                    current = (current as string).substring(1, (current as string).length - 1);
                    quoted = true;
                }
                command.args.args.push({ value: current, quoted: quoted });
            }else if(typeof current === 'object') {
                current = (current as KeyArg);
                current.key = current.key.substring(1, current.key.length - 1);

                if(current.value.match(/^["']/gm)) {
                    current.value = current.value.substring(1, current.value.length - 1);
                    current.quoted = true;
                }

                command.args.kwargs.push({
                    key: current.key,
                    value: current.value,
                    quoted: current.quoted
                });
            }
        }

        outputLines.push(command);

    });

    return outputLines;
}