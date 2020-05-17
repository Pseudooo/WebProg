-- UP

CREATE TABLE IF NOT EXISTS Questionnaires (
    id TEXT PRIMARY KEY,
    owner TEXT,
    created DATETIME,
    name TEXT
);

-- DOWN

DROP TABLE Questionnaires;
