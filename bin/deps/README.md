# deps

deno's bags are nothing but bullshit. Fortunately, there is still hope.

# init

After switching the working path to the deno project root directory, execute the
following command:

```
deno run -A "https://github.com/powerpuffpenguin/deno-x/raw/main/bin/deps/main.ts"
```

This will create a deps.ts file for managing project dependencies. You need to
edit this file to write project dependencies. Finally execute the following
command to update dependencies:

```
deno run -A deps.ts
```

> Dependencies cannot be automatically upgraded. You need to manually change the
> url path of the dependency in deps.ts, but you can keep the import path of the
> source code fixed.

# working principle

Run deps.ts will create import alias files locally, so import these aliases in
the source code. When a dependency is updated, run deps will point the alias to
the new dependency url, so that the source code of the import alias does not
need to be changed.
