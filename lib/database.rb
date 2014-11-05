require "sequel"

if ENV["DATABASE_URL"]
  Sequel.connect(ENV["DATABASE_URL"])
else
  require "logger"
  Sequel.connect("sqlite:memory:", loggers: [Logger.new(STDOUT)])
end

Sequel::Model.plugin :timestamps
Sequel::Model.plugin :schema
Sequel::Model.plugin :json_serializer

