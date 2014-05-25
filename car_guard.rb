require "sinatra"
require "haml"
require "multi_json"
require "sass"
require "bootstrap-sass"

set :bind, "0.0.0.0"
set :port, 8010

LOCATIONS_FILE_NAME = "locations.json"

post "/map/:api_key" do
  response = MultiJson.load(request.body.read, symbolize_keys: true).merge(created: (Time.now.to_f * 1000).to_i)

  locations = saved_locations
  locations[params[:api_key].to_sym] << response
  File.open(LOCATIONS_FILE_NAME, "w") { |f| f.puts MultiJson.dump(locations, pretty: true) }

  "ok"
end

get "/map/:api_key" do
  @locations = saved_locations[params[:api_key].to_sym].sort_by {|i| i[:time] }
  haml :index
end

get "/styles.css" do
  scss :styles
end

def saved_locations
  locations = File.exists?(LOCATIONS_FILE_NAME) ? MultiJson.load(File.read(LOCATIONS_FILE_NAME), symbolize_keys: true) : {}
  locations.default_proc = proc do |hash, key|
    hash[key] = []
  end
  locations
end
