{ pkgs ? import <nixpkgs> {} }:

with pkgs; mkShell {
    buildInputs = [
        nodejs-16_x
        go
        vips  # image processing support
        pkg-config
    ];
}
