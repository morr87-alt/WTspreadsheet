DROP TABLE IF EXISTS site_data;

CREATE TABLE site_data (
    id INTEGER PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO site_data (id, data)
VALUES (
    1,
    '{}'
);