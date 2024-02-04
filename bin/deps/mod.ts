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
     */
    mod: Array<string>;
}
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
            for (const mod of pkg.mod) {
                if (!verifyName(mod)) {
                    throw new Error(`package mod invalid: '${pkg.name}' '${pkg.mod}'`);
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
        for (const pkg of this.pkgs) {
            path = join(this.output, pkg.name)
            Deno.mkdirSync(path, {
                recursive: true,
                mode: 0o775,
            })
            console.log(`  '${pkg.name}' <=> '${pkg.url}'`)
            for (const mod of pkg.mod) {
                console.log(`     * '${mod}'`)
                writeTextFileSync(join(path, mod), `export * from "${join(pkg.url, mod)}"`)
            }
        }
    }
}