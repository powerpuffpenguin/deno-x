function join(dir: string, path: string): string {
    if (dir.endsWith('/')) {
        dir = dir.substring(0, dir.length - 1)
    }
    if (path.startsWith('/')) {
        path = path.substring(1)
    }
    return `${dir}/${path}`
}
const invalidStrings = [
    '..',
    "'",
    '"',
    '*',
    ' ',
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
function writeTextFileSync(path: string, data: string) {
    const i = path.lastIndexOf('/')
    if (i > -1) {
        const dir = path.substring(0, i)
        if (dir != '.' && dir != '/') {
            Deno.mkdirSync(dir, {
                recursive: true,
                mode: 0o775,
            })
        }
    }
    Deno.writeTextFileSync(path, data)
}
/**
 * package information
 * 
 * import {} from pathJoin(Package.name,Package.mod[index])
 */
export interface Package {
    /**
     * import name. (save local name)
     */
    name: string;
    /**
     * package url. exampe ("https://deno.land/std@0.167.0")
     */
    url: string;
    /**
     * import ts path. example ("log/mod.ts")
     * @default ['mod.ts']
     */
    mod?: Array<string>;
}
const defaultModes = [
    'mod.ts'
]
export class Deps {
    readonly pkgs: Array<Package>
    constructor(readonly output: string, ...pkgs: Array<Package>) {
        this.pkgs = pkgs
        const set = new Set<string>()
        for (const pkg of pkgs) {
            if (!verifyName(pkg.name)) {
                throw new Error(`package name invalid: '${pkg.name}'`);
            }
            if (set.has(pkg.name)) {
                throw new Error(`package name repeat: '${pkg.name}'`);
            }
            set.add(pkg.name)
            if (pkg.mod !== undefined) {
                if (!Array.isArray(pkg.mod)) {
                    throw new Error(`package mod not a array: ${pkg.name}`);
                }
                for (const mod of pkg.mod) {
                    if (!verifyName(mod)) {
                        throw new Error(`package mod invalid: '${pkg.name}' '${mod}'`);
                    }
                }
            }
        }

    }
    /**
     * Update dependency files
     */
    update() {
        console.log(this.output)
        let path: string
        let mods: Array<string>
        const strs = Array<string>()
        for (const pkg of this.pkgs) {
            path = join(this.output, pkg.name)
            Deno.mkdirSync(path, {
                recursive: true,
                mode: 0o775,
            })
            console.log(`  '${pkg.name}' <=> '${pkg.url}'`)
            mods = pkg.mod ?? defaultModes
            if (mods.length == 0) {
                mods = defaultModes
            }
            for (const mod of mods) {
                console.log(`     * '${mod}'`)
                const s = `export * from "${join(pkg.url, mod)}"`
                writeTextFileSync(join(path, mod), s)
                strs.push(s)
            }
        }
        writeTextFileSync(join(this.output, 'deps.ts'), strs.join("\n"))
    }
}