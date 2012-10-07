#!/bin/bash

rm irccloudplus/irccloudplus.zip
zip irccloudplus/irccloudplus irccloudplus/*  -r -x \.git -x \*.zip
