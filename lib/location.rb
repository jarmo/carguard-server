require "sequel"

DB = Sequel.connect('sqlite:memory:')

Sequel::Model.plugin :timestamps
Sequel::Model.plugin :schema
Sequel::Model.plugin :json_serializer

class Location < Sequel::Model
  set_schema do
    String :api_key
    String :data
    String :iv
    String :salt
    DateTime :created_at

    index :api_key
    index [:api_key, :created_at]
  end

  create_table if !table_exists?
end
