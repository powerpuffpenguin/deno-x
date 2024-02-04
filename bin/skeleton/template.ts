// deno-lint-ignore-file
import { Meta } from "./meta.ts";
import { default as art } from '../../deps/art-template/mod.ts'
export function join(dir: string, name: string): string {
    if (dir == '') {
        dir = '.'
    }
    if (dir.endsWith('/') || name.startsWith('/')) {
        return `${dir}${name}`
    }
    return `${dir}/${name}`
}
export interface TemplateMode {
    mode: "mutual" | "cover" | "skip" | "error"
}
export class Template {
    static async create(url: string, source: string, opts: TemplateMode): Promise<Template> {
        const found = url.lastIndexOf('/')
        url = `${url.substring(0, found)}/${source}`
        const resp = await fetch(`${url}.json`)
        if (resp.status != 200) {
            throw new Error(`get ${url}.json: ${resp.status} ${resp.statusText}`);
        }
        const meta = JSON.parse(new TextDecoder().decode(await resp.arrayBuffer()))
        return new Template(url, meta, opts)
    }
    constructor(readonly url: string, readonly meta: Meta, readonly opts: TemplateMode) { }
    async render(ctx: Record<string, any>): Promise<void> {
        ctx['years'] = new Date().getFullYear()


        const meta = this.meta
        let dest: string
        let exists: boolean
        for (const item of meta.entries) {
            dest = join('.', item.dest ?? item.source)
            if (item.dir) {
                console.log(` mkdir: ${dest}`)
                await Deno.mkdir(dest, {
                    recursive: true,
                    mode: 0o775,
                })
                continue
            }
            exists = false
            try {
                const info = await Deno.stat(dest)
                if (info.isFile) {
                    switch (this.opts.mode) {
                        case "mutual":
                            exists = await this._exists(dest)
                            break;
                        case "cover":
                            break
                        case "skip":
                            exists = true
                            break
                        default:
                            throw new Error(`file already exists: ${dest}`);
                    }
                } else {
                    throw new Error(`can't create file: ${dest}`);
                }
            } catch (e) {
                if (!(e instanceof Deno.errors.NotFound)) {
                    throw e;
                }
            }
            if (exists) {
                console.log(`exists: ${dest}`)
            } else {
                console.log(`render: ${dest}`)
                await this._render(ctx, item.source, dest)
            }
        }
    }
    async _exists(dst: string): Promise<boolean> {
        while (true) {
            console.log(`  File exists: ${dst}
    * 1 skip
    * 2 cover
    * 3 exit`)

            const choose = prompt("  Please enter your choose:");
            switch (choose) {
                case '1':
                    return true
                case '2':
                    return false
                case '3':
                    Deno.exit(0)
                default:
                    break;
            }
        }
    }
    async _render(ctx: Record<string, any>, source: string, dest: string): Promise<void> {
        const url = join(this.url, source)
        const resp = await fetch(url)
        if (resp.status != 200) {
            throw new Error(`get ${url}: ${resp.status} ${resp.statusText}`);
        }
        const text = new TextDecoder().decode(await resp.arrayBuffer())
        const temp = `${dest}.temp`
        let rename = false
        try {
            if (source.endsWith('.art')) {
                await Deno.writeTextFile(temp, art.render(text, ctx), {
                    create: true,
                    mode: 0o664,
                })
            } else {
                await Deno.writeTextFile(temp, text, {
                    create: true,
                    mode: 0o664,
                })
            }
            await Deno.rename(temp, dest)
            rename = true
        } finally {
            if (!rename) {
                await Deno.remove(temp)
            }
        }
    }
}