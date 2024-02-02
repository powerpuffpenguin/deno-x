import { Deps } from "./deps/mod.ts";
const deps = new Deps(
    ".deps",
    {
        url: 'https://deno.land/std@0.214.0',
        name: 'std',
        mod: [
            "testing/asserts.ts",
        ],
    },
)
await deps.update()