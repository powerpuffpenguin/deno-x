
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
    }
    /**
     * Update dependency files
     */
    async update() {

    }
}