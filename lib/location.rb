class Location < Sequel::Model
  set_schema do
    String :data, null: false
    String :iv, null: false
    String :salt, null: false
    DateTime :created_at

    primary_key :id
    foreign_key :user_id, :users

    index :created_at
  end

  create_table if !table_exists?
end
