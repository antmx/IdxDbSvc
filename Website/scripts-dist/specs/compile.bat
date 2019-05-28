echo compiling specs
rem browserify --debug IdxDbSvc_spec.js -o bundle.js
browserify IdxDbSvc_spec.js --debug | exorcist bundle.map.js > bundle.js
echo done
