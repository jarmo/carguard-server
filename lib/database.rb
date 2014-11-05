require "sequel"

if ENV["RACK_ENV"] == "production"
  Sequel.connect(ENV["DATABASE_CONNECTION"])
else
  require "logger"
  Sequel.connect("sqlite:memory:", loggers: [Logger.new(STDOUT)])
end

Sequel::Model.plugin :timestamps
Sequel::Model.plugin :schema
Sequel::Model.plugin :json_serializer

