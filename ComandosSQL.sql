CREATE DATABASE nu_projects;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE contractors (

    code_uid UUID PRIMARY KEY DEFAULT
    uuid_generate_v4(),
    first_name TEXT NOT NULL CHECK (first_name <> ''),
    last_name TEXT NOT NULL CHECK (last_name <> ''),
    gender VARCHAR(1) NOT NULL CHECK (gender in ( 'M', 'F')),
    birthyear INTEGER NOT NULL CHECK (birthyear <= EXTRACT(YEAR FROM CURRENT_DATE) AND birthyear >= 1900),
    country TEXT NOT NULL CHECK (country <> ''),
    actual_status VARCHAR(8) NOT NULL CHECK (actual_status in ( 'active', 'inactive'))

);

CREATE TABLE clientele (

    code_uid UUID PRIMARY KEY DEFAULT
    uuid_generate_v4(),
    name TEXT NOT NULL CHECK (name <> ''),
    city TEXT NOT NULL CHECK (city <> ''),
    residence_state TEXT NOT NULL CHECK (residence_state <> ''),
    country TEXT NOT NULL CHECK (country <> ''),
    industry_code INTEGER NOT NULL CHECK (industry_code > 0),
    actual_status VARCHAR(8) NOT NULL CHECK (actual_status in ( 'active', 'inactive')),
    UNIQUE(name)

);


CREATE TABLE categories (

    code_uid UUID PRIMARY KEY DEFAULT
    uuid_generate_v4(),
    description TEXT NOT NULL CHECK (description <> ''),
    actual_status VARCHAR(8) NOT NULL CHECK (actual_status in ( 'active', 'inactive')),
    UNIQUE(description)

);

CREATE TABLE projects (

    code_uid UUID DEFAULT
    uuid_generate_v4(),
    client_uid UUID,
    name TEXT NOT NULL CHECK (name <> ''),
    description TEXT NOT NULL CHECK (description <> ''),
    actual_status VARCHAR(8) NOT NULL CHECK (actual_status in ( 'active', 'inactive')),
    UNIQUE(name),

    FOREIGN KEY (client_uid) REFERENCES clientele(code_uid),

    PRIMARY KEY(code_uid, client_uid),
    UNIQUE(code_uid, client_uid)
);

CREATE TABLE activities (

    code_uid UUID PRIMARY KEY DEFAULT
    uuid_generate_v4(),
    project_uid UUID,
    description TEXT NOT NULL CHECK (description <> ''),
    actual_status VARCHAR(8) NOT NULL CHECK (actual_status in ( 'active', 'inactive')),
    UNIQUE(description),

    FOREIGN KEY (project_uid) REFERENCES projects(code_uid)

);

CREATE TABLE activities_categories (

    activity_uid UUID NOT NULL,
    category_uid UUID NOT NULL,
    FOREIGN KEY (activity_uid) REFERENCES activities(code_uid),
    FOREIGN KEY (category_uid) REFERENCES categories(code_uid),
    UNIQUE(activity_uid, category_uid)

);



CREATE TABLE products (

    code_uid UUID NOT NULL PRIMARY KEY DEFAULT
    uuid_generate_v4(),
    description TEXT NOT NULL CHECK (description <> ''),
    project_uid UUID NOT NULL,
    actual_status VARCHAR(8) NOT NULL CHECK (actual_status in ( 'active', 'inactive')),
    UNIQUE(description),

    FOREIGN KEY (project_uid) REFERENCES projects(code_uid)

);


CREATE TABLE chores (

    entry_code SERIAL NOT NULL,
    contractor_uid UUID NOT NULL,
    entry_date DATE NOT NULL,
    duration NUMERIC NOT NULL,
    bill_flag BOOLEAN NOT NULL,
    activity_uid UUID NOT NULL,
    project_uid UUID NOT NULL,
    client_uid UUID NOT NULL,
    product_uid UUID NOT NULL,
    category_uid UUID NOT NULL,
    task_description TEXT NOT NULL CHECK (task_description <> ''),

    FOREIGN KEY (activity_uid) REFERENCES activities(code_uid),
    FOREIGN KEY (contractor_uid) REFERENCES contractors(code_uid),
    FOREIGN KEY (project_uid) REFERENCES projects(code_uid),
    FOREIGN KEY (client_uid) REFERENCES projects(client_uid),
    FOREIGN KEY (product_uid) REFERENCES products(code_uid),
    FOREIGN KEY (category_uid) REFERENCES categories(code_uid),
    UNIQUE(task_description),
    PRIMARY KEY (entry_code)
);


CREATE TABLE users (

    code_uid UUID NOT NULL DEFAULT
    uuid_generate_v4(),
    email TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    secret_password TEXT NOT NULL

);