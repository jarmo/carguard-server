if File.exists? "spec"
  require 'rspec/core/rake_task'
  RSpec::Core::RakeTask.new(:spec)
end

def app?
  File.exists? "config.ru"
end

def app_name
  File.basename(File.dirname(__FILE__))
end

desc "Deploy to server"
task :deploy do
  sh %Q[git ls-files | rsync --delete --delete-excluded --prune-empty-dirs --exclude Rakefile --files-from - -avzhe ssh ./ jarmopertman.com:/home/jarmo/www/#{app_name}]
  Rake::Task[:restart].invoke if app?
end

if app?
  desc "Restart app"
  task :restart do
    sh %Q[ssh jarmopertman.com "source /usr/local/share/chruby/chruby.sh && cd www/#{app_name} && chruby ruby-`fgrep "ruby " Gemfile | awk -F'"' '{ print $2 }'` && if [ -f #{app_name}.pid ]; then kill -9 \\$(cat #{app_name}.pid) || echo "#{app_name} was not running..."; rm #{app_name}.pid; fi && bundle install && sh -c 'RACK_ENV=production nohup bundle exec rackup -s puma -o 127.0.0.1 -P #{app_name}.pid 1>>#{app_name}.log 2>&1 &'"]
  end
end

task :default => :deploy
