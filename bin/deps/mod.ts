function join(dir: string, path?: string): string {
    if (path === undefined || path == '') {
        return dir
    }
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
    mod?: Array<string | Mod>;
}
export interface Mod {
    /**
     * import file name
     */
    name: string
    /**
     * import url path
     */
    url?: string
    /**
     * export types
     */
    exports?: string
}
const defaultNPMModes: Array<Mod> = [
    {
        name: 'mod.ts',
    },
]
const defaultModes = [
    'mod.ts'
]
export class Deps {
    readonly pkgs: Array<Package>
    constructor(readonly output: string, ...pkgs: Array<Package>) {
        this.pkgs = pkgs
        const set = new Set<string>()
        for (const pkg of pkgs) {
            if (pkg.url == '' || pkg.url.indexOf('"') >= 0 || pkg.url.indexOf("'") >= 0) {
                throw new Error(`package url invalid: '${pkg.name} ${pkg.url}'`);
            }
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
                    if (typeof mod === "string") {
                        if (!verifyName(mod)) {
                            throw new Error(`package mod invalid: '${pkg.name}' '${mod}'`);
                        }
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
        let mods: Array<string | Mod>
        const strs = Array<string>()
        let s: string
        for (const pkg of this.pkgs) {
            path = join(this.output, pkg.name)
            console.log(`  '${pkg.name}' <=> '${pkg.url}'`)
            if (!pkg.mod || pkg.mod.length == 0) {
                if (pkg.url.startsWith("npm:")) {
                    mods = defaultNPMModes
                } else {
                    mods = defaultModes
                }
            } else {
                mods = pkg.mod
            }
            Deno.mkdirSync(path, {
                recursive: true,
                mode: 0o775,
            })
            for (const mod of mods) {
                if (typeof mod === "string") {
                    console.log(`     * '${mod}'`)
                    s = `export * from "${join(pkg.url, mod)}"`
                    writeTextFileSync(join(path, mod), s)
                    strs.push(s)
                } else {
                    console.log(`     * '${mod.name}'`)
                    s = `export ${mod.exports ?? '*'} from "${join(pkg.url, mod.url)}"`
                    writeTextFileSync(join(path, mod.name), s)
                    strs.push(s)
                }
            }
        }
        writeTextFileSync(join(this.output, 'deps.ts'), strs.join("\n"))
    }
}