def app?
  File.exists? "config.ru"
end

desc "Deploy to server"
task :deploy do
  sh %Q[git ls-files | rsync --delete --delete-excluded --prune-empty-dirs --files-from - -avzhe ssh ./ jarmopertman.com:/home/jarmo/www/#{File.basename(__dir__)}]
  Rake::Task[:restart].invoke if app?
end

if app?
  desc "Restart app"
  task :restart do
    sh %Q[ssh jarmopertman.com "source /usr/local/share/chruby/chruby.sh && cd www/#{File.basename(__dir__)} && chruby ruby-`fgrep "ruby " Gemfile | awk -F'"' '{ print $2 }'` && if [ -f rack.pid ]; then kill -9 \\$(cat rack.pid) || echo 1; rm rack.pid; fi && RACK_ENV=production rackup -s puma -p 6000 -o 127.0.0.1 -D -P rack.pid"]
  end
end

task :default => :deploy
