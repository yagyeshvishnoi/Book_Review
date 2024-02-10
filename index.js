import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

//database connection
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "book_notes",
  password: "root",
  port: 5432,
});

db.connect();


const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

async function get_items(basis){
    const items = [];
    try {
      `// Assuming db is your database connection object`
      const result = await db.query('SELECT id, name, opinion, datee, rating, isbn FROM notes ORDER by '+basis+' ASC');
      
      if (Array.isArray(result.rows)) {
        result.rows.forEach(item => {
          items.push({ 
            id: item.id, 
            name: item.name,
            opinion: item.opinion,
            datee: item.datee,
            rating: item.rating,
            isbn: item.isbn
          });
        });
      } else {
        console.error('Unexpected result format:', result);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
    
    return items;
  }



  app.get("/", async(req, res) => {
    let items = [];
    const sortBasis = req.query.sort || 'id'; // Default sorting basis
    items = await get_items(sortBasis);
    res.render("index.ejs", {
      listItems: items,
      title:"BOOK REVIEW",
    });
  });

  app.get("/item", async (req, res) => {
    try {
      const itemId = req.query.id;
      const result = await db.query('SELECT * FROM data JOIN notes ON notes.id = data.book_notes_id WHERE notes.id = $1', [itemId]);
      const items = result.rows;
      res.render("index.ejs", {
        listItems: items,
        title: `Details for Item ID ${items[0].name}`,
      });
    } catch (error) {
      console.error('Error fetching item details:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
