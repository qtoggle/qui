#!/bin/sh

# Create symlinks to libs
echo "Creating symlinks to libs"
cd js/lib
ln -sf ../../../../jquery/dist/jquery.js .
ln -sf  ../../../../jquery-mousewheel/jquery.mousewheel.js .
ln -sf ../../../../jquery-ui-dist/jquery-ui.js
ln -sf ../../../../js-logger/src/logger.js
ln -sf ../../../../pepjs/dist/pep.js
