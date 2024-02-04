import { Command, Parser } from '../../deps/flags/mod.ts';
import { Meta } from "./meta.ts";
export interface Skeleton {
    rename?: Array<{ from: string, to: string }>
}
const invalidStrings = [
    '..',
    "'",
    '"',
    '*',
]
function verifyName(s: string): boolean {
    s = s.trim()
    if (s == '') {
        return false
    }
    for (const str of invalidStrings) {
        if (s.indexOf(str) > -1) {
            return false
        }
    }
    return true
}
class Scan {
    private rename_ = new Map<string, string>()
    constructor(readonly dir: string) {
    }
    async serve(beauty: boolean) {
        const dir = this.dir
        const filepath = `${dir}.json`
        console.log(filepath)
        const meta: Meta = {
            entries: []
        }
        try {
            const skeleton: Skeleton = JSON.parse(await Deno.readTextFile(`${dir}/skeleton.json`))
            const keys = this.rename_
            for (const { from, to } of skeleton.rename ?? []) {
                if (!verifyName(to) || to.indexOf("/") > -1) {
                    throw new Error(`rename to invalid: ${to}`);
                }
                if (!verifyName(from)) {
                    throw new Error(`rename from invalid: ${from}`);
                }
                keys.set(from.startsWith('/') ? from : `/${from}`, to)
            }
        } catch (e) {
            if (!(e instanceof Deno.errors.NotFound)) {
                throw e
            }
        }
        await this._scan(meta, dir, '  ', '')
        await Deno.writeTextFile(filepath, JSON.stringify(meta, undefined, beauty ? "    " : undefined))
    }
    private async _scan(meta: Meta, dir: string, prefix: string, baseDir: string) {
        let name: string
        let source: string
        let dest: string
        let flags: string
        const rename = this.rename_
        let found: string | undefined
        for await (const entry of Deno.readDir(dir)) {
            name = entry.name
            if (entry.isFile) {
                if (baseDir == '' && name == 'skeleton.json') {
                    continue
                }
                flags = `${prefix}- `
            } else if (entry.isDirectory) {
                flags = prefix
            } else {
                continue
            }
            source = `${baseDir}/${name}`
            dest = source
            if (dest.endsWith('.art')) {
                dest = dest.substring(0, source.length - 4)
            }
            found = rename.get(dest)
            if (found) {
                dest = `${baseDir}/${found}`
            }
            if (source == dest) {
                console.log(`${flags}${name}`)
            } else {
                console.log(`${flags}${name} => ${dest}`)
            }
            meta.entries.push({
                source: source,
                dest: source == dest ? undefined : dest,
                dir: entry.isDirectory ? true : undefined
            })
            if (entry.isDirectory) {
                await this._scan(meta, `${dir}/${entry.name}`, `${prefix}  `, dest)
            }
        }
    }
}
const root = new Command({
    use: "scan.ts",
    short: "scan deno project skeleton",
    prepare(flags) {
        const template = flags.string({
            name: "template",
            short: "t",
            default: "console",
            usage: "scan skeleton code",
        });
        const dir = flags.string({
            name: "dir",
            short: "d",
            usage: "scan root dir",
        })
        const beauty = flags.bool({
            name: "beauty",
            short: "b",
            usage: "output beauty",
        })
        return () => {
            return new Scan(`${dir.value}/${template.value}`).serve(beauty.value)
        };
    },
});

new Parser(root).parse(Deno.args);