import mysql from "mysql2/promise"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"
import bcrypt from "bcrypt"

dotenv.config()

async function setupDatabase() {
    try {
        // Create connection without database specified
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        })

        console.log("Connected to MySQL server")

        // Create database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`)
        console.log(`Database ${process.env.DB_NAME} created or already exists`)

        // Use the database
        await connection.query(`USE ${process.env.DB_NAME}`)

        // Read the SQL file
        const sqlFilePath = path.join(process.cwd(), "initialize_database.sql")
        const sqlScript = fs.readFileSync(sqlFilePath, "utf8")

        // Split the SQL script into individual statements
        const statements = sqlScript.split(";").filter((statement) => statement.trim() !== "")

        // Execute each statement
        for (const statement of statements) {
            await connection.query(statement)
        }

        console.log("Database initialization completed successfully")

        // Create admin user with bcrypt hashed password
        const hashedPassword = await bcrypt.hash("admin123", 10)
        try {
            await connection.query(
                `INSERT INTO users (UserID, name, password, Sex, DateOfBirth) 
         VALUES (?, ?, ?, ?, ?)`,
                ["admin", "Administrator", hashedPassword, "Other", "1990-01-01"],
            )
            console.log("Admin user created successfully")
        } catch (error) {
            // If user already exists, just log it
            console.log("Admin user already exists")
        }

        await connection.end()
        console.log("Database connection closed")
    } catch (error) {
        console.error("Error setting up database:", error)
        process.exit(1)
    }
}

setupDatabase()
