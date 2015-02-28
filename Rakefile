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
  sh %Q[git ls-files | rsync --delete --delete-excluded --prune-empty-dirs --files-from - -avzhe ssh ./ jarmopertman.com:/home/jarmo/www/#{app_name}]
  if app?
    sh %Q[ssh jarmopertman.com "source ~/.bashrc && cd ~/www/#{app_name} && bundle install --quiet --without development && bundle exec rake restart"]
  end
end

if app?
  desc "Restart app"
  task :restart do
    sh %Q[if [ -f #{app_name}.pid ]; then kill -9 \$(cat #{app_name}.pid) 2>/dev/null || echo "#{app_name} was not running..."; rm #{app_name}.pid; fi && sh -c 'RACK_ENV=production nohup bundle exec rackup -s puma -o 127.0.0.1 -P #{app_name}.pid 1>>#{app_name}.log 2>&1 &']
  end
end

task :default => :deploy
