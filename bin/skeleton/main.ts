import { Command, Parser } from '../../deps/flags/mod.ts';
import { denoCommand } from "./template/deno/deno.ts";
const root = new Command({
    use: "main.ts",
    short: "Create project skeleton",
});
root.add(
    denoCommand,
)
new Parser(root).parse(Deno.args);