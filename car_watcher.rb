require "sinatra"
require "haml"
require "multi_json"
require "sass"
require "bootstrap-sass"

set :bind, "0.0.0.0"
set :port, 8010

use Rack::Auth::Basic, "Oh no, you don't!" do |username, password|
  username == 'car' and password == 'watcher'
end

post "/" do
  response = MultiJson.load(request.body.read, symbolize_keys: true)
  response.merge!(
    latitude: response[:latitude].to_f,
    longitude: response[:longitude].to_f,
    distance: response[:distance].to_f,
    speed: response[:speed].to_f
  )

  locations = saved_locations << response
  File.open("locations.txt", "w") { |f| f.puts MultiJson.dump(locations, pretty: true) }

  "ok"
end

get "/" do
  @locations = saved_locations
  haml :index
end

get "/styles.css" do
  scss :styles
end

def saved_locations
  File.exists?("locations.txt") ? MultiJson.load(File.read("locations.txt"), symbolize_keys: true).sort_by {|i| i[:time] } : []
end
