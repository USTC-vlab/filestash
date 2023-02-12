{ pkgs ? import <nixpkgs> {} }:

with pkgs; mkShell {
    buildInputs = [
        nodejs-16_x-openssl_1_1  # webpack needs old openssl 1.1
        go
        vips  # image processing support
        pkg-config
    ];
}
