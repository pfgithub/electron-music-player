SRC = $(wildcard src/*)
DIST = $(SRC:src/%.ts=dist/%.js)
DISTHTML = $(SRC:src/%.html=dist/%.html)
DISTRS = $(SRC:src/%.png=dist/%.png)

dist: $(DIST) $(DISTHTML) $(DISTRS)
dist/%.js: src/%.ts .babelrc
	mkdir -p $(@D)
	yarn run babel $< -o $@
	
dist/%.html: src/%.html
	mkdir -p $(@D)
	cp $< $@
	
dist/%.png: src/%.png
	mkdir -p $(@D)
	cp $< $@