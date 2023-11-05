{ pkgs ? import <nixpkgs> {} }:

with pkgs; mkShell {
    buildInputs = [
        nodejs-18_x
        go
        vips  # image processing support
        pkg-config
    ];
}
