.PHONY: all build xpi clean

NAME := contrast-checker

all: xpi

build:
	npm run build

xpi: build
	cd dist && zip -r ../$(NAME).xpi .

clean:
	rm -rf dist $(NAME).xpi
