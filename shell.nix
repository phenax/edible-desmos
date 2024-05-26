with (import <nixpkgs> {});
mkShell {
  buildInputs = [
    deno
  ];
}
