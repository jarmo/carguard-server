#!/bin/bash

source ~/.bashrc
cd `dirname $0` 
./stop.sh
bundle exec rake start

