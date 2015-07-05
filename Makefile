watch:
	./node_modules/gulp/bin/gulp watch

install:
	npm install;\
	./node_modules/bower/bin/bower install;\

build: install
	./node_modules/gulp/bin/gulp build
	if [ $$? -gt 0 ]; then\
		exit 1;\
	fi;\

tdd:
	./node_modules/karma/bin/karma start karma.conf.js