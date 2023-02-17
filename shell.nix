{ pkgs ? import <nixpkgs> {} }:

with pkgs; mkShell {
    buildInputs = [
        nodejs-16_x
        go_1_18
        vips  # image processing support
        pkg-config
    ];
}
