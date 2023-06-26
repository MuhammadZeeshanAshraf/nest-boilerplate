# Nest Boilerplate 🚀

This repository serves as a boilerplate setup for developing web applications using the Nest.js framework. It provides a solid foundation with a well-organized folder structure, pre-configured dependencies, and common configurations to kick-start your Nest.js projects. Save time and dive into development with confidence! 💪

## Technologies Used 🛠️

The backend of the Nest.js Boilerplate project is built using the following technologies:

- **Nest.js**: A powerful and scalable Node.js framework used for building the backend code. 🦅🔧
- **TypeScript**: A strongly typed superset of JavaScript used for writing the backend code. 🆎👨‍💻
- **PostgreSQL**: An open-source relational database management system used for storing and retrieving data. 🐘🗄️
- **TypeORM**: A TypeScript-based ORM (Object-Relational Mapping) used for database communication and management. 🗃️🔍
- **Docker**: A containerization platform used for deploying the backend services. 🐳🚀
- **Redis**: An in-memory data structure store used as a database, cache, and message broker. 🔄🗃️📦
- **Cron**: A time-based job scheduler used for scheduling recurring jobs or tasks. ⏰📆

## Getting Started 🚀

Follow the instructions below to get started with the Nest Boilerplate.

### Prerequisites 📋

Make sure you have the following prerequisites installed on your machine:

- Node.js (version 14 or higher)
- npm (version 6 or higher)
- Nest CLI (version 7 or higher)
- PostgreSQL (version 10 or higher)
- Docker (v20 or higher)

### Installation ⚙️

1. Clone the repository:

   ```bash
   git clone https://github.com/MuhammadZeeshanAshraf/nest-boilerplate.git
   ```

2. Install the dependencies:

   ```bash
   cd nest-boilerplate
   npm install
   ```

### Environment Variables 🌍

The Dastgyr Growth backend code requires certain environment variables to be set in order to run correctly. These variables are defined in a `.env` file, which should be located in the root of the project directory. 

You can create a `.env` file by copying the `.env.example` file and updating the values as necessary:

```bash
cp .env.example .env
```

environment variables file should contain the following 
```
💻 #Environment
NODE_ENV=
PORT=

💾 #Database
DB_NAME=
DB_USERNAME=
DB_PASSWORD=
DB_HOST=
DB_PORT=
DB_SCHEMA=
DB_CONNECTION_NAME=
```

Update the values in the `.env` file as needed for your environment.

### Running the Server ▶️

Run the application in development mode by running the following command in the project directory:

```bash
npm run start:dev
```

This will start the server in development mode, with hot reloading enabled for any changes you make to the code. Once the server is running, you can access it by navigating to `http://localhost:<port>` in your web browser.

Alternatively, you can start the server in production mode using the following command:

```bash
npm run start:prod
```

This will start the server in production mode, which is optimized for performance.

To add new environment variables, you can simply add them to the `.env` file in the project directory. You can then access these variables in your code using the `process.env` object.

For example, if you add a new variable `MY_VARIABLE` to your `.env` file like so:

```
MY_VARIABLE=my_value
```

You can access this variable in your code like so:

```ts
const myVariable = process.env.MY_VARIABLE;
```

Note that you will need to restart the application for the changes to take effect.

### Swagger UI 📚

With the project set up, you can check if the server is running properly by visiting the Swagger UI at the specified URL and port in your environment file.

```
http://localhost:<port>/api#/
```

That's it! You should now be able to run the Trade Assurance backend project locally on your machine.

## Contribution 🤝

We welcome contributions to the Nest Boilerplate! Please follow the guidelines below when contributing.

### Branching Strategy 🌿

When contributing, create a new branch with a descriptive name that reflects the nature of your changes. For example:

```bash
git checkout -b feature/new-feature
```

Once you have completed your changes, submit a pull request to the `main` branch for review.

### Git Best Practices ✨

- Commit messages should be descriptive and follow best practices. See [here](https://www.freecodecamp.org/news/how-to-use-git-best-practices-for-beginners/#:~:text=To%20get%20the%20most%20out,pull%20requests%20for%20code%20reviews.) for Git commit message guidelines.
- Make sure to update your local branch with the latest changes from the `main` branch before pushing your changes.
- Always perform code reviews and address any comments or feedback promptly.

## Roadmap 🗺️

Here are some upcoming features and improvements planned for the Nest Boilerplate:

- [ ] Swagger Integration
- [ ] TypeORM Integration

Feel free to contribute ideas or suggestions to the project roadmap. We look forward to collaborating with you!

Happy coding! 💻✨