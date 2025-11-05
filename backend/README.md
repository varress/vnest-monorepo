# V-NEST Speech therapy API

## How to run

Add values to .env based on the environment.
```
APP_USERS=admin@example.com:VerySecurePassword123!:Admin:ADMIN;user@example.com:AnotherSecurePass456!:User:USER

POSTGRES_USER=username
POSTGRES_PASSWORD=password
POSTGRES_DB=database

SERVER_SERVLET_SESSION_TIMEOUT=30m
```
APP_USERS defines user accounts that can login to the admin UI.

Run:
```
docker compose up --build -d
```

## Admin UI
Admin UI can be accessed locally from http://localhost:8080/login by using the credentials provided in the .env file. 
Users need to ha ADMIN role to access and edit words and combinations.
