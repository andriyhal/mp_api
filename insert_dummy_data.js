import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const insertDummyData = async () => {
  try {
    const connection = await pool.getConnection();
    
    const usersDummyData = `
    INSERT INTO users (UserID, Sex, DateOfBirth) VALUES
    ('user001', 'Male', '1988-05-15'),
    ('user002', 'Female', '1995-09-22'),
    ('user003', 'Male', '1981-11-30'),
    ('user004', 'Female', '1968-03-10'),
    ('user005', 'Male', '1993-07-05'),
    ('user006', 'Female', '1984-12-18'),
    ('user007', 'Male', '1973-02-25'),
    ('user008', 'Female', '1978-08-07'),
    ('user009', 'Male', '1990-04-12'),
    ('user010', 'Female', '1963-10-01'),
    ('user011', 'Male', '1986-06-20'),
    ('user012', 'Female', '1971-01-15'),
    ('user013', 'Male', '1975-09-08'),
    ('user014', 'Female', '1992-11-27'),
    ('user015', 'Male', '1965-04-03'),
    ('user016', 'Female', '1980-07-19'),
    ('user017', 'Male', '1994-02-14'),
    ('user018', 'Female', '1976-12-05'),
    ('user019', 'Male', '1969-08-22'),
    ('user020', 'Female', '1987-03-30');
    `;

    const healthDataDummyData = `
    INSERT INTO health_data (UserID, height, weight, waistCircumference, bloodPressureSystolic, bloodPressureDiastolic, fastingBloodGlucose, hdlCholesterol, triglycerides, vitaminD2, vitaminD3) VALUES
    ('user001', 175.5, 80.5, 36.2, 120, 80, 95, 45, 150, 45, 55),
    ('user002', 162.0, 65.0, 28.5, 118, 75, 88, 55, 120, 50, 60),
    ('user003', 180.0, 95.0, 40.0, 135, 88, 105, 38, 180, 40, 50),
    ('user004', 168.5, 70.5, 32.0, 140, 90, 110, 50, 160, 55, 65),
    ('user005', 178.0, 75.0, 34.5, 122, 78, 92, 48, 130, 48, 58),
    ('user006', 165.5, 64.5, 29.8, 125, 82, 98, 52, 140, 52, 62),
    ('user007', 182.0, 88.5, 38.5, 138, 88, 108, 40, 170, 42, 52),
    ('user008', 170.0, 72.5, 33.0, 130, 85, 100, 54, 145, 58, 68),
    ('user009', 176.5, 79.5, 35.5, 124, 79, 94, 47, 135, 46, 56),
    ('user010', 163.0, 68.0, 31.5, 145, 92, 115, 49, 175, 54, 64),
    ('user011', 179.0, 84.0, 37.0, 128, 82, 97, 44, 155, 44, 54),
    ('user012', 166.5, 66.0, 30.5, 135, 87, 105, 53, 150, 56, 66),
    ('user013', 181.0, 90.5, 39.0, 132, 86, 102, 42, 165, 43, 53),
    ('user014', 160.0, 59.0, 27.5, 116, 74, 90, 58, 110, 60, 70),
    ('user015', 177.5, 86.5, 38.0, 142, 90, 112, 39, 185, 41, 51),
    ('user016', 169.0, 70.5, 32.5, 128, 84, 99, 51, 140, 53, 63),
    ('user017', 174.0, 77.0, 35.0, 120, 78, 93, 46, 125, 47, 57),
    ('user018', 167.5, 67.5, 31.0, 132, 86, 103, 52, 155, 55, 65),
    ('user019', 183.0, 93.0, 39.5, 138, 89, 107, 41, 175, 42, 52),
    ('user020', 164.0, 63.5, 29.0, 122, 80, 96, 56, 130, 59, 69);
    `;

    await connection.query(usersDummyData);
    await connection.query(healthDataDummyData);
    console.log('Dummy data inserted successfully');

    connection.release();
  } catch (error) {
    console.error('Error inserting dummy data:', error);
  } finally {
    await pool.end();
  }
};

insertDummyData();

