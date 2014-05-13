require "sinatra"
require "haml"
require "multi_json"
require "sass"
require "bootstrap-sass"

set :bind, "0.0.0.0"
set :port, 8010

post "/map/:api_key" do
  response = MultiJson.load(request.body.read, symbolize_keys: true)
  response.merge!(
    latitude: response[:latitude].to_f,
    longitude: response[:longitude].to_f,
    distance: response[:distance].to_f,
    speed: response[:speed].to_f
  )

  locations = saved_locations
  locations[params[:api_key].to_sym] << response
  File.open("locations.txt", "w") { |f| f.puts MultiJson.dump(locations, pretty: true) }

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
  locations = File.exists?("locations.txt") ? MultiJson.load(File.read("locations.txt"), symbolize_keys: true) : {}
  locations.default_proc = proc do |hash, key|
    hash[key] = []
  end
  locations
end
