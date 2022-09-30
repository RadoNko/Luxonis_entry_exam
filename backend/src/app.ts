import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { Pool } from "pg";
import axios from 'axios';
import path from 'path';
import { setTimeout } from "timers/promises";

// https://www.sreality.cz/api/en/v2/estates?category_main_cb=1&category_type_cb=1&page=1&per_page=500

async function extractData (url : string) {
    const data = (await axios.get(url, {
        responseType: 'text',
        validateStatus: null,
    })).data;

    return data._embedded.estates.map((item : any) => {
        return {
            name : item.name,
            address: item.locality,
            price: item.price,
            image_url: item._links.images[0].href
        }
    })
}

async function savePSQL(data: any) {
    await pool.query('CREATE TABLE IF NOT EXISTS apartments_table(name text,address text,price int,image_url text)')
    await pool.query('TRUNCATE apartments_table').then()
    data.forEach((item : any) => {
        pool.query('INSERT INTO apartments_table ("name", "address", "price", "image_url") values($1, $2, $3, $4)',[item.name,item.address,item.price,item.image_url])
    })
    /*
    pool.query('SELECT * from apartments_table').then(resp => {
        console.log(JSON.stringify(resp));
    })
     */
}

const app = express();
dotenv.config();
// app.use(express.static(path.join(__dirname, "public")));

app.get("/data", (req: Request, res: Response, next: NextFunction) => {


    pool.query('SELECT * from apartments_table').then(resp => {
        res.send(resp.rows);
    })


    /*
        console.log(__filename);
        console.log(__dirname);
        res.sendFile('/Users/Daniel/Desktop/Luxonis/dist/index.html');
         */
});


app.listen(process.env.PORT, () => {
    console.log(`Server is running at ${process.env.PORT}`);
});

//app.use(express.static("public"));

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "8000")
});

const connectToDB = async () => {
    try {
        await pool.connect();
        await testConnection();
    } catch (err) {
        console.log(err);
    }
};

async function testConnection () {
    const res = await pool.query('SELECT $1::text as connected', ['Connection to postgres successful!']);
    console.log(res.rows[0].connected);
}

connectToDB().then(async () => {
    const url = 'https://www.sreality.cz/api/en/v2/estates?category_main_cb=1&category_type_cb=1&page=1&per_page=10'
    const data = await extractData(url);
    savePSQL(data);
});


