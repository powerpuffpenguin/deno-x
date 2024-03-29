import { Deps } from "./bin/deps/mod.ts";

const deps = new Deps(
    // import's alias output dir
    "deps",
    // Pass in the package information to create an alias
    {
        url: 'https://deno.land/std@0.214.0', // package url
        name: 'std', // import alias
        mod: [
            // import files
            "assert/assert_equals.ts",
        ],
    },
    {
        url: 'https://deno.land/x/flags@0.0.3',
        name: 'flags',
    },
    {
        url: 'npm:art-template@^4.13.2',
        name: 'art-template',
        mod: [
            {
                name: 'mod.ts',
                exports:'{ default }',
            },
        ]
    }
    // more packages ...
)

// update alias files
deps.update()