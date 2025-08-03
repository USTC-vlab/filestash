{ pkgs ? import <nixpkgs> {} }:

with pkgs; mkShell {
    buildInputs = [
        nodejs_20
        go
        vips  # image processing support
        pkg-config
    ];
}
