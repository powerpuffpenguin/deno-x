import { Command, Parser } from '../../deps/flags/mod.ts';
class Template {
    render() {

    }
}
const root = new Command({
    use: "main.ts",
    short: "Create deno project skeleton",
    prepare(flags) {
        const template = flags.string({
            name: "template",
            short: "t",
            default: "console",
            usage: "skeleton code",
            values: [
                'console'
            ]
        });
        return async () => {
            const resp = await fetch(`${Deno.mainModule}/../template/console.json`)
            const s = new TextDecoder().decode(await resp.arrayBuffer())
            console.log(s)
        };
    },
});

new Parser(root).parse(Deno.args);