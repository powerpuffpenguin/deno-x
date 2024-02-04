try {
    Deno.statSync("deps.ts")
    throw new Error('"deps.ts" already exists');
} catch (e) {
    if (!(e instanceof Deno.errors.NotFound)) {
        throw e
    }
}

Deno.writeTextFileSync("deps.ts", `import { Deps } from "https://github.com/powerpuffpenguin/deno-x/raw/main/bin/deps/mod.ts";

const deps = new Deps(
    // import's alias output dir
    ".deps",
    // Pass in the package information to create an alias
    {
        url: 'https://deno.land/std@0.214.0', // package url
        name: 'std', // import alias
        mod: [
            // import files
            "testing/asserts.ts",
        ],
    },
    // more packages ...
)

// update alias files
deps.update()`)