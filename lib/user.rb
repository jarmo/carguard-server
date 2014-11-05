class User < Sequel::Model
  set_schema do
    String :api_key, null: false, unique: true
    String :email, null: false
    String :phone
    DateTime :last_alert_time
    DateTime :created_at

    primary_key :id
    index :api_key
  end

  one_to_many :locations

  create_table if !table_exists?
end
