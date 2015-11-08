source "https://rubygems.org"
ruby File.read(File.expand_path('.ruby-version', __dir__)).strip

gem "haml"
gem "sass"
gem "sinatra"
gem "bootstrap-sass"
gem "rake"
gem "sequel"
gem "rufus-scheduler"
gem "mail"
gem "dotenv"

group :development do
  gem "thin"
  gem "byebug"
  gem "sinatra-contrib"
  gem "sqlite3"
end

group :production do
  gem "puma"
  gem "foreman"
  gem "pg"
end
