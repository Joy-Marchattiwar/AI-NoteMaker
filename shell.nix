{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "django-environment";
  buildInputs = [
    pkgs.python3
    pkgs.python3.pkgs.django
    pkgs.python3.pkgs.pip
    pkgs.python3.pkgs.djangorestframework
  ];
}