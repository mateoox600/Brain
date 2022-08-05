import { DefinedCommand } from '../brain';

export default [
    {
        name: 'eq',
        block: true,
        execute: ({ args }, launchBlock) => {
            let pass = true;
            args.forEach((arg) => {
                args.forEach((arg1) => {
                    if(arg !== arg1) pass = false;
                });
            });
            if(pass) launchBlock();
        }
    },
    {
        name: 'ne',
        block: true,
        execute: ({ args }, launchBlock) => {
            let pass = true;
            args.forEach((arg) => {
                args.forEach((arg1) => {
                    if(arg !== arg1) pass = false;
                });
            });
            if(!pass) launchBlock();
        }
    }
] as DefinedCommand[];