\c messagely

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS users;


CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    join_at timestamp without time zone NOT NULL,
    last_login_at timestamp with time zone
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    from_username text NOT NULL REFERENCES users,
    to_username text NOT NULL REFERENCES users,
    body text NOT NULL,
    sent_at timestamp with time zone NOT NULL,
    read_at timestamp with time zone
);

-- INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
--   VALUES 
--   ('test1','password','Test1','Testy1','+14155550000',current_timestamp, current_timestamp),
--   ('test2','password','Test2','Testy2','+14155552222',current_timestamp, current_timestamp);

-- INSERT INTO messages (from_username, to_username, body, sent_at, read_at)
--   VALUES
--   ('bob','bobo','u1-to-u2',current_timestamp,current_timestamp),
--   ('bobo','bob','u2-to-u1',current_timestamp,current_timestamp);
