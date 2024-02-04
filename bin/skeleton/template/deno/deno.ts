// deno-lint-ignore-file
import { Command } from '../../../../deps/flags/mod.ts';
import { Template } from "../../template.ts";

export const denoCommand = new Command({
    use: "deno",
    short: "Create deno project skeleton",
    prepare(flags) {
        const template = flags.string({
            name: "template",
            short: "t",
            default: "console",
            usage: "skeleton code",
            values: [
                'console',
            ]
        });
        const mode = flags.string({
            name: "mode",
            values: ["mutual", "cover", "skip", "error"],
            default: "skip",
            usage: "What to do when the created archive already exists",
        })
        const organization = flags.string({
            name: "organization",
            short: "O",
            default: "-",
            usage: "Organization or Company "
        })
        return async () => {
            (await Template.create(import.meta.url,
                template.value,
                {
                    mode: mode.value as any,
                },
            )).render({
                organization: organization.value,
            })
        };
    },
});
